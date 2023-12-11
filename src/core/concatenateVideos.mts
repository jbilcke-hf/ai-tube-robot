import { existsSync, promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

import { v4 as uuidv4 } from "uuid";
import ffmpeg from "fluent-ffmpeg";

import { getVideoDuration } from "./getVideoDuration.mts";

export async function concatenateVideos({
  output,
  videos,
}: {
  output?: string;
  videos: string[];
}): Promise<{ filepath: string; durationInSec: number }> {
  if (!Array.isArray(videos)) {
    throw new Error("Videos must be provided in an array");
  }

  if (!videos.every((video) => existsSync(video))) {
    throw new Error("All videos must exist");
  }

  // Create a temporary working directory
  const tempDir = path.join(os.tmpdir(), uuidv4());
  await fs.mkdir(tempDir);

  const filePath = output ? output : path.join(tempDir, `${uuidv4()}.mp4`);

  if (!filePath) {
    throw new Error("Failed to generate a valid temporary file path");
  }

  const ffmpegCommand = ffmpeg();

  videos.forEach((video) => ffmpegCommand.addInput(video));

  return new Promise<{ filepath: string; durationInSec: number }>(
    (resolve, reject) => {
      ffmpegCommand
        .on('error', reject)
        .on('end', async () => {
          try {
            const durationInSec = await getVideoDuration(filePath);
            resolve({ filepath: filePath, durationInSec });
          } catch (err) {
            reject(err);
          }
        })
        .mergeToFile(filePath, tempDir);
    }
  );
};
