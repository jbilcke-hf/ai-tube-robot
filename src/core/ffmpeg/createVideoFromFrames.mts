import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

import ffmpeg from "fluent-ffmpeg";
import { v4 as uuidv4 } from "uuid";
import { getMediaInfo } from "./getMediaInfo.mts";

export async function createVideoFromFrames({
  inputFramesDirectory,
  inputFramesFormat = "png",
  outputVideoPath,
  framesPerSecond = 24,

  // there isn't a lot of advantage for us to add film grain because:
  // 1. I actually can't tell the different, probably because it's in HD, and so tiny
  // 2. We want a neat "4K video from the 2020" look, not a quality from 30 years ago
  // 3. grain has too much entropy and cannot be compressed, so it multiplies by 5 the size weight
  grainAmount = 0, // Optional parameter for film grain (eg. 10)

  inputVideoToUseAsAudio, // Optional parameter for audio input
}: {
  inputFramesDirectory: string;
  inputFramesFormat?: string;
  outputVideoPath?: string;
  framesPerSecond?: number;
  grainAmount?: number; // Values can range between 0 and higher for the desired amount
  inputVideoToUseAsAudio?: string; // Path to video file to extract audio from
}): Promise<string> {
  // Ensure the input directory exists
  await fs.access(inputFramesDirectory);

  let canUseInputVideoForAudio = false
  // Also, if provided, check that the audio source file exists
  if (inputVideoToUseAsAudio) {
    try {
      await fs.access(inputVideoToUseAsAudio)
      const info = await getMediaInfo(inputVideoToUseAsAudio)
      if (info.hasAudio) {
        canUseInputVideoForAudio = true
      }
    } catch (err) {
      console.log("warning: input video has no audio, so we are not gonna use that")
    }
  }


  // Construct the input frame pattern
  const inputFramePattern = path.join(inputFramesDirectory, `frame_%06d.${inputFramesFormat}`);


  // Create a temporary working directory
  const tempDir = path.join(os.tmpdir(), uuidv4());
  await fs.mkdir(tempDir);

  const outputVideoFilePath = outputVideoPath ?? path.join(tempDir, `${uuidv4()}.mp4`);

  console.log("outputOptions:", [
    // by default ffmpeg doesn't tell us why it fails to convet
    // so we need to force it to spit everything out
    "-loglevel", "debug",

    "-pix_fmt", "yuv420p",
    "-c:v", "libx264",
    "-r", `${framesPerSecond}`,

    // from ffmpeg doc: "Consider 17 or 18 to be visually lossless or nearly so; 
    // it should look the same or nearly the same as the input."
    "-crf", "17",
  ])

  return new Promise<string>((resolve, reject) => {
    const command = ffmpeg()
      .input(inputFramePattern)
      .inputFPS(framesPerSecond)
      .outputOptions([
        // by default ffmpeg doesn't tell us why it fails to convet
        // so we need to force it to spit everything out
        "-loglevel", "debug",

        "-pix_fmt", "yuv420p",
        "-c:v", "libx264",
        "-r", `${framesPerSecond}`,
        "-crf", "18",
      ]);

    
    // If an input video for audio is provided, add it as an input for the ffmpeg command
    if (canUseInputVideoForAudio) {
      console.log("adding audio as input:", inputVideoToUseAsAudio)
      command.addInput(inputVideoToUseAsAudio);
      command.outputOptions([
        "-map", "0:v", // Map video from the frames
        "-map", "1:a", // Map audio from the input video
        "-shortest"    // Ensure output video duration is the shortest of the combined inputs
      ]);
    }

    // Apply grain effect using the geq filter if grainAmount is specified
    if (grainAmount != null && grainAmount > 0) {
      console.log("adding grain:", grainAmount)
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

