import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

import ffmpeg from "fluent-ffmpeg";
import { v4 as uuidv4 } from "uuid";

export async function createVideoFromFrames({
  inputFramesDirectory,
  inputFramesFormat = "png",
  outputVideoPath,
  framesPerSecond = 24,
  grainAmount = 10, // Optional parameter for film grain
}: {
  inputFramesDirectory: string;
  inputFramesFormat?: string;
  outputVideoPath?: string;
  framesPerSecond?: number;
  grainAmount?: number; // Values can range between 0 and higher for the desired amount
}): Promise<string> {
  // Ensure the input directory exists
  await fs.access(inputFramesDirectory);

  // Construct the input frame pattern
  const inputFramePattern = path.join(inputFramesDirectory, `frame_%04d.${inputFramesFormat}`);

  // Create a temporary working directory
  const tempDir = path.join(os.tmpdir(), uuidv4());
  await fs.mkdir(tempDir);

  const outputVideoFilePath = outputVideoPath ?? path.join(tempDir, `${uuidv4()}.mp4`);

  return new Promise<string>((resolve, reject) => {
    const command = ffmpeg()
      .input(inputFramePattern)
      .inputFPS(framesPerSecond)
      .outputOptions([
        "-pix_fmt", "yuv420p",
        "-c:v", "libx264",
        "-r", `${framesPerSecond}`,
        "-crf", "18",
      ]);

    // Apply grain effect using the geq filter if grainAmount is specified
    if (grainAmount != null) {
      command.complexFilter([
        {
          filter: "geq",
          options: `lum='lum(X,Y)':cr='cr(X,Y)+(random(1)-0.5)*${grainAmount}':cb='cb(X,Y)+(random(1)-0.5)*${grainAmount}'`
        }
      ]);
    }

    command.save(outputVideoFilePath)
      .on("error", (err) => reject(err))
      .on("end", () => resolve(outputVideoFilePath));
  });
}