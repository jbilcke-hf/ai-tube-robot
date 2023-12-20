import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

import ffmpeg from "fluent-ffmpeg";

type ConvertMp4ToMp3Params = {
  inputVideoPath: string;
  outputAudioPath?: string;
};

export async function convertMp4ToMp3({
  inputVideoPath,
  outputAudioPath,
}: ConvertMp4ToMp3Params): Promise<string> {
  // Verify that the input file exists
  if (!(await fs.stat(inputVideoPath)).isFile()) {
    throw new Error(`Input video file does not exist: ${inputVideoPath}`);
  }

  // If no output path is provided, create a temporary file for the output
  if (!outputAudioPath) {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "ffmpeg-"));
    outputAudioPath = path.join(tempDir, `${path.parse(inputVideoPath).name}.mp3`);
  }

  // Return a promise that resolves with the path to the output audio file
  return new Promise((resolve, reject) => {
    ffmpeg(inputVideoPath)
      .toFormat("mp3")
      .on("error", (err) => {
        reject(new Error(`Error converting video to audio: ${err.message}`));
      })
      .on("end", () => {
        resolve(outputAudioPath);
      })
      .save(outputAudioPath);
  });
}