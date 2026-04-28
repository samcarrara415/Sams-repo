import { GoogleGenAI } from "@google/genai";
import fs from "node:fs/promises";
import path from "node:path";

const IMAGEN_MODEL = "imagen-4.0-generate-001";

export class GeminiImageClient {
  private client: GoogleGenAI;
  private outputDir: string;

  constructor(apiKey: string, outputDir: string) {
    this.client = new GoogleGenAI({ apiKey });
    this.outputDir = outputDir;
  }

  async ensureDir(): Promise<void> {
    await fs.mkdir(this.outputDir, { recursive: true });
  }

  async generate(prompt: string, filenameStem: string, aspectRatio: "1:1" | "16:9" | "9:16" | "4:3" | "3:4" = "1:1"): Promise<string> {
    await this.ensureDir();

    const response = await this.client.models.generateImages({
      model: IMAGEN_MODEL,
      prompt,
      config: {
        numberOfImages: 1,
        aspectRatio,
      },
    });

    const generated = response.generatedImages?.[0];
    const b64 = generated?.image?.imageBytes;
    if (!b64) {
      throw new Error(`Gemini returned no image for prompt: ${prompt.slice(0, 60)}`);
    }

    const safe = filenameStem.replace(/[^a-z0-9_-]/gi, "_").toLowerCase();
    const filename = `${safe}.png`;
    const filepath = path.join(this.outputDir, filename);
    await fs.writeFile(filepath, Buffer.from(b64, "base64"));
    return filepath;
  }
}
