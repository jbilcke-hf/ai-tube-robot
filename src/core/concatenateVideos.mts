
import { existsSync, promises as fs } from "node:fs"
import os from "node:os";
import path from "node:path"

import { v4 as uuidv4 } from "uuid"
import ffmpeg from "fluent-ffmpeg"

export async function concatenateVideos({ output, videos }: {
  output?: string;
  videos: string[];
}): Promise<string> {
  if(!Array.isArray(videos)) {
    throw new Error("An output file and videos must be provided");
  }

  if(!videos.every(video => existsSync(video))) {
    throw new Error("All videos must exist");
  }

  // create a temporary working dir
  const tempDir = path.join(os.tmpdir(), uuidv4())
  await fs.mkdir(tempDir)

  const filePath = output ? output : path.join(tempDir, `${uuidv4()}.mp4`);

  if (!filePath) {
    throw new Error("failed to generate a valid temporary file path")
  }

  /*
  console.log("going to concatenate videos (without touching to the audio)", {
    videos,
    filePath
  })
  */

  const ffmpegCommand = ffmpeg()
 
  videos.forEach((video) =>
    ffmpegCommand.addInput(video)
  );

  return new Promise<string>((resolve, reject) => {
    ffmpegCommand
      .on('error', reject)
      .on('end', () => {
        resolve(filePath)
      })
      .mergeToFile(filePath, tempDir);
  });
};
