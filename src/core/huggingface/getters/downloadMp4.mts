import { promises as fs, createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import { finished } from "node:stream/promises";
import os from "node:os";
import path from "node:path";

type DownloadMp4Params = {
  urlToMp4: string;
  outputVideoPath?: string;
};

export async function downloadMp4({
  urlToMp4,
  outputVideoPath,
}: DownloadMp4Params): Promise<string> {
  // If no output path is provided, create a temporary file name
  if (!outputVideoPath) {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "download-"));
    const urlPath = new URL(urlToMp4).pathname;
    const fileName = path.basename(urlPath) || "downloaded.mp4";
    outputVideoPath = path.join(tempDir, fileName);
  }

  // Fetch the video file
  const response = await fetch(urlToMp4);

  if (!response.body) throw new Error("Failed to get a streamable response body.");
  if (!response.ok) throw new Error(`Failed to download the MP4 file: ${response.statusText}`);

  // Create a write stream for the output video file
  const writeStream = createWriteStream(outputVideoPath);
 
  await finished(Readable.fromWeb(response.body as any).pipe(writeStream));

  return outputVideoPath;
}