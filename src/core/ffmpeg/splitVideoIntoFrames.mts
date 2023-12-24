import { exec } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

import { v4 as uuidv4 } from "uuid";
import ffmpeg from "fluent-ffmpeg";

const execPromise = promisify(exec);

type SplitVideoIntoFramesOutput = {
  outputDirPath: string;
  outputFramesPaths: string[];
  numberOfFrames: number;
  framesPerSecond: number;
};

export async function splitVideoIntoFrames({
  inputVideoPath,
  format = "png",
}: {
  inputVideoPath: string;
  format?: string;
}): Promise<SplitVideoIntoFramesOutput> {
  if (format !== "png") {
    throw new Error("Currently only PNG format is supported.");
  }

  // Determine the FPS of the video
  const { stdout } = await execPromise(`ffprobe -v 0 -of csv=p=0 -select_streams v:0 -show_entries stream=r_frame_rate ${inputVideoPath}`);
  const [num, den] = stdout.trim().split('/').map(Number);
  const framesPerSecond = num / den; // Convert the ratio to a floating point number representing FPS

  // Create a temporary working directory
  const outputDirPath = path.join(os.tmpdir(), uuidv4());
  await fs.mkdir(outputDirPath);

  const frameBaseName = `frame_%04d.${format}`;
  const outputFramesPattern = path.join(outputDirPath, frameBaseName);

  return new Promise<SplitVideoIntoFramesOutput>((resolve, reject) => {
    ffmpeg(inputVideoPath)
      .outputOptions(["-vf", `fps=${framesPerSecond}`]) // Set the filter to extract at the detected frame rate
      .on("error", (err) => {
        reject(err);
      })
      .on("end", async () => {
        try {
          // Read directory to count files and generate their paths.
          const files = await fs.readdir(outputDirPath);
          const outputFramesPaths = files
            .filter(file => file.startsWith("frame_") && file.endsWith(`.${format}`))
            .map(file => path.join(outputDirPath, file));
          const numberOfFrames = outputFramesPaths.length;

          resolve({ outputDirPath, outputFramesPaths, numberOfFrames, framesPerSecond });
        } catch (err) {
          reject(err);
        }
      })
      .output(outputFramesPattern)
      .run();
  });
}