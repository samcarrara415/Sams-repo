// Drives gemini.google.com via Playwright using a persistent profile, so the
// user logs in once (headed) and subsequent runs reuse the session.
//
// We avoid CSS-class selectors (Google reshuffles them often) and prefer ARIA
// roles + text. Everything is wrapped in a small set of bail-out heuristics:
// if the prompt input or image element doesn't appear within a generous
// timeout, throw with a clear error so the user can update one selector.

import { chromium, type BrowserContext, type Page } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const GEMINI_URL = "https://gemini.google.com/app";
const GENERATION_TIMEOUT_MS = 90_000;
const NAV_TIMEOUT_MS = 30_000;

export class GeminiBrowser {
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private outputDir: string;
  private profileDir: string;
  private headless: boolean;

  constructor(opts: { outputDir: string; profileDir: string; headless?: boolean }) {
    this.outputDir = opts.outputDir;
    this.profileDir = opts.profileDir;
    this.headless = opts.headless ?? false;
  }

  async start(): Promise<void> {
    if (this.context) return;
    await fs.mkdir(this.profileDir, { recursive: true });
    await fs.mkdir(this.outputDir, { recursive: true });

    const launchOpts = {
      headless: this.headless,
      viewport: { width: 1280, height: 900 },
      acceptDownloads: true,
      // Hide automation indicators so Google doesn't show
      // "This browser may not be secure" on the sign-in page.
      args: ["--disable-blink-features=AutomationControlled"],
      ignoreDefaultArgs: ["--enable-automation"],
    };

    // Use the user's installed Chrome stable rather than Playwright's bundled
    // Chromium — Google blocks login on the latter. Fall back to bundled
    // Chromium if Chrome isn't installed (with a warning).
    try {
      this.context = await chromium.launchPersistentContext(this.profileDir, {
        ...launchOpts,
        channel: "chrome",
      });
    } catch (err) {
      console.error(
        "[gemini] Couldn't launch Chrome stable (channel:chrome). Falling back " +
          "to Playwright's bundled Chromium — Google may flag the login as insecure.\n" +
          "         Install Google Chrome and re-run to fix this.\n"
      );
      this.context = await chromium.launchPersistentContext(this.profileDir, launchOpts);
    }

    this.page = this.context.pages()[0] ?? (await this.context.newPage());
    await this.gotoFreshChat();
    await this.ensureLoggedIn();
  }

  async close(): Promise<void> {
    await this.context?.close();
    this.context = null;
    this.page = null;
  }

  /** Navigate to the Gemini app — guaranteed fresh chat each time. */
  private async gotoFreshChat(): Promise<void> {
    if (!this.page) throw new Error("Browser not started.");
    await this.page.goto(GEMINI_URL, { waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT_MS });
    await this.page.waitForLoadState("domcontentloaded");
  }

  /**
   * Block until the prompt input is visible. If Gemini hasn't rendered it
   * within 10 seconds we assume the user isn't logged in and wait up to 10
   * minutes for them to sign in.
   */
  private async ensureLoggedIn(): Promise<void> {
    if (!this.page) throw new Error("Browser not started.");
    const editor = this.promptEditor();
    try {
      await editor.waitFor({ state: "visible", timeout: 10_000 });
      return;
    } catch {
      // not visible yet — probably needs sign-in
    }
    console.error(
      "\n[gemini] No prompt input visible — looks like you're not signed in.\n" +
        "         Sign in to Google in the Chrome window I just opened.\n" +
        "         I'll wait up to 10 minutes…\n"
    );
    await editor.waitFor({ state: "visible", timeout: 10 * 60_000 });
    console.error("[gemini] Logged in. Continuing.\n");
  }

  private promptEditor() {
    if (!this.page) throw new Error("Browser not started.");
    // Prefer ARIA textbox; fall back to contenteditable.
    return this.page.locator('[role="textbox"], [contenteditable="true"]').first();
  }

  async generate(opts: { id: string; prompt: string }): Promise<string> {
    if (!this.page) throw new Error("Browser not started.");

    // Always start a fresh chat — Gemini won't reliably generate a new image
    // in a chat that already has prior turns.
    await this.gotoFreshChat();
    await this.ensureLoggedIn();

    const fullPrompt = `Generate an image: ${opts.prompt}\n\nReturn only the image. Do not add captions or commentary.`;

    const editor = this.promptEditor();
    await editor.waitFor({ state: "visible", timeout: NAV_TIMEOUT_MS });
    await editor.click();
    await editor.fill("");
    await editor.type(fullPrompt, { delay: 5 });

    // Submit. Try the Send button first, fall back to Enter.
    const send = this.page.getByRole("button", { name: /send|submit/i }).first();
    if (await send.count()) {
      await send.click().catch(async () => {
        await editor.press("Enter");
      });
    } else {
      await editor.press("Enter");
    }

    // Wait for the response image to appear. Gemini typically renders it as
    // an <img> inside the latest response container. We poll for any new
    // <img> with a sensible content URL (data:, blob:, or googleusercontent).
    const img = this.page.locator(
      'img[src^="data:image"], img[src^="blob:"], img[src*="googleusercontent.com"]'
    );
    await img.first().waitFor({ state: "visible", timeout: GENERATION_TIMEOUT_MS });

    // Take the most-recently-added matching image (last in DOM order is usually
    // the response image, not a sidebar avatar).
    const count = await img.count();
    const target = img.nth(count - 1);
    const src = await target.getAttribute("src");
    if (!src) throw new Error("Found image element but no src attribute.");

    const buffer = await this.fetchImageBytes(src);
    const safe = opts.id.replace(/[^a-z0-9_-]/gi, "_").toLowerCase();
    const filepath = path.join(this.outputDir, `${safe}.png`);
    await fs.writeFile(filepath, buffer);
    return filepath;
  }

  private async fetchImageBytes(src: string): Promise<Buffer> {
    if (!this.page) throw new Error("no page");
    if (src.startsWith("data:")) {
      const [, b64] = src.split(",");
      if (!b64) throw new Error("malformed data: URL");
      return Buffer.from(b64, "base64");
    }
    // For blob: and remote URLs, fetch from inside the page so we keep the
    // session cookies and CORS context.
    const dataUrl: string = await this.page.evaluate(async (url: string) => {
      const res = await fetch(url, { credentials: "include" });
      const blob = await res.blob();
      return await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = () => reject(r.error);
        r.readAsDataURL(blob);
      });
    }, src);
    const [, b64] = dataUrl.split(",");
    if (!b64) throw new Error("failed to fetch image as data URL");
    return Buffer.from(b64, "base64");
  }
}
