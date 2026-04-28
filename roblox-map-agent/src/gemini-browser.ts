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

    this.context = await chromium.launchPersistentContext(this.profileDir, {
      headless: this.headless,
      viewport: { width: 1280, height: 900 },
      acceptDownloads: true,
    });

    this.page = this.context.pages()[0] ?? (await this.context.newPage());
    await this.page.goto(GEMINI_URL, { waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT_MS });

    // If we landed on a sign-in page, surface a clear instruction. The user
    // logs in interactively in the headed browser; we wait until they're back
    // on the app.
    if (await this.looksLikeSignIn()) {
      console.error(
        "\n[gemini] You're not logged in. Sign in to Google in the browser window I just opened.\n" +
          "         I'll wait until you land on gemini.google.com/app …\n"
      );
      await this.page.waitForURL(/gemini\.google\.com\/app/, { timeout: 5 * 60_000 });
      console.error("[gemini] Logged in. Continuing.\n");
    }
  }

  async close(): Promise<void> {
    await this.context?.close();
    this.context = null;
    this.page = null;
  }

  private async looksLikeSignIn(): Promise<boolean> {
    const url = this.page!.url();
    return /accounts\.google\.com/.test(url) || /signin/.test(url);
  }

  /** Open a fresh chat so each generation is isolated. */
  private async newChat(): Promise<void> {
    if (!this.page) throw new Error("Browser not started.");
    // Try the visible "New chat" affordance via aria-label/text. Fall back to
    // navigating to the root URL.
    const newChat = this.page.getByRole("button", { name: /new chat/i }).first();
    if (await newChat.count()) {
      await newChat.click().catch(() => {});
    } else {
      await this.page.goto(GEMINI_URL, { waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT_MS });
    }
    await this.page.waitForLoadState("domcontentloaded");
  }

  /** Try to enable image-generation mode if Gemini exposes a toggle. Best-effort. */
  private async ensureImageMode(): Promise<void> {
    if (!this.page) return;
    // Try a few likely affordances. Each is a no-op if not found.
    const candidates = [
      this.page.getByRole("button", { name: /image/i }),
      this.page.getByRole("menuitem", { name: /image/i }),
      this.page.getByLabel(/image/i),
    ];
    for (const c of candidates) {
      if ((await c.count()) > 0) {
        await c.first().click({ trial: true }).catch(() => {});
        // We don't actually click — many of these are unrelated. Real toggling
        // happens via the prompt phrasing ("Generate an image of …"), which
        // works without a UI click on current Gemini.
      }
    }
  }

  async generate(opts: { id: string; prompt: string }): Promise<string> {
    if (!this.page) throw new Error("Browser not started.");

    await this.newChat();
    await this.ensureImageMode();

    const fullPrompt = `Generate an image: ${opts.prompt}\n\nReturn only the image. Do not add captions or commentary.`;

    // Find the prompt textbox. Gemini exposes it as a textbox / contenteditable.
    const editor =
      (await this.page.getByRole("textbox").first().count())
        ? this.page.getByRole("textbox").first()
        : this.page.locator('[contenteditable="true"]').first();
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
