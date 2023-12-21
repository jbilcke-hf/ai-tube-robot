import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

import ffmpeg from "fluent-ffmpeg";

export async function cropVideo({
  inputVideoPath,
  width,
  height,
}: {
  inputVideoPath: string;
  width: number;
  height: number;
}): Promise<string> {
  // Verify that the input file exists
  if (!(await fs.stat(inputVideoPath)).isFile()) {
    throw new Error(`Input video file does not exist: ${inputVideoPath}`);
  }

  // Create a temporary file for the output
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "ffmpeg-crop-"));
  const outputVideoPath = path.join(tempDir, `${path.parse(inputVideoPath).name}-cropped.mp4`);

  // Return a promise that resolves with the path to the output cropped video file
  return new Promise((resolve, reject) => {
    ffmpeg(inputVideoPath)
      .ffprobe((err, metadata) => {
        if (err) {
          reject(new Error(`Error reading video metadata: ${err.message}`));
          return;
        }

        const videoStream = metadata.streams.find(s => s.codec_type === "video");
        if (!videoStream) {
          reject(new Error(`Cannot find video stream in file: ${inputVideoPath}`));
          return;
        }

        const { width: inWidth, height: inHeight } = videoStream;
        const x = Math.floor((inWidth - width) / 2);
        const y = Math.floor((inHeight - height) / 2);

        ffmpeg(inputVideoPath)
          .outputOptions([
            `-vf crop=${width}:${height}:${x}:${y}`
          ])
          .on("error", (err) => {
            reject(new Error(`Error cropping video: ${err.message}`));
          })
          .on("end", () => {
            resolve(outputVideoPath);
          })
          .save(outputVideoPath);
      });
  });
}