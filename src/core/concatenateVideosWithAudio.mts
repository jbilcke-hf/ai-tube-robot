import { existsSync, promises as fs } from "node:fs"
import os from "node:os"
import path from "node:path"

import { v4 as uuidv4 } from "uuid";
import ffmpeg, { FfmpegCommand } from "fluent-ffmpeg";
import { addBase64HeaderToWav } from "./addBase64HeaderToWav.mts";
import { addBase64HeaderToMp4 } from "./addBase64HeaderToMp4.mts";
import { concatenateVideos } from "./concatenateVideos.mts";
import { keepTemporaryFiles } from "../config.mts";
import { writeBase64ToFile } from "./writeBase64ToFile.mts";
import { getMediaDuration } from "./getMediaDuration.mts";

type ConcatenateVideoWithAudioOptions = {
  output?: string;
  audioTrack?: string; // base64
  audioFilePath?: string; // path
  videoTracks?: string[]; // base64
  videoFilePaths?: string[];// path
};

export type ConcatenateVideoAndMergeAudioOutput = {
  filepath: string;
  durationInSec: number;
}

export const concatenateVideosWithAudio = async ({
  output,
  audioTrack = "",
  audioFilePath = "",
  videoTracks = [],
  videoFilePaths = [],
}: ConcatenateVideoWithAudioOptions): Promise<ConcatenateVideoAndMergeAudioOutput> => {

  try {
    // Prepare temporary directories
    const tempDir = path.join(os.tmpdir(), uuidv4());
    await fs.mkdir(tempDir);

    if (audioTrack) {
      audioFilePath = path.join(tempDir, `audio.wav`);
      await writeBase64ToFile(addBase64HeaderToWav(audioTrack), audioFilePath);
    }

    // Decode and concatenate base64 video tracks to temporary file
    let i = 0
    for (const track of videoTracks) {
      if (!track) { continue }
      const videoFilePath = path.join(tempDir, `video${++i}.mp4`);

      await writeBase64ToFile(addBase64HeaderToMp4(track), videoFilePath);

      videoFilePaths.push(videoFilePath);
    }

    videoFilePaths = videoFilePaths.filter((video) => existsSync(video))

    // The final output file path
    const finalOutputFilePath = output ? output : path.join(tempDir, `${uuidv4()}.mp4`);

    /*
    console.log("DEBUG:", {
      tempDir,
      audioFilePath,
      audioTrack: audioTrack.slice(0, 40),
      videoTracks: videoTracks.map(vid => vid.slice(0, 40)),
      videoFilePaths,
      finalOutputFilePath
    })
    */

    // console.log("concatenating videos (without audio)..")
    const tempFilePath = await concatenateVideos({
      videoFilePaths,
    })
    // console.log("concatenated silent shots to: ", tempFilePath)
    
    // console.log("concatenating video + audio..")

    // Add audio to the concatenated video file
    const promise = new Promise<ConcatenateVideoAndMergeAudioOutput>((resolve, reject) => {
      let cmd: FfmpegCommand = ffmpeg()
        // Set the audio to the original volume (could be adjusted using a parameter)
        // .audioFilters([
        //   { filter: "volume", options: 1.0 }, // we can have multiple filters, but we only need one
        // ])
        // .outputOptions("-c:v copy") // Use video copy codec
        // .outputOptions("-c:a aac") // Use audio codec
        // // Map the video and audio streams
        // .outputOptions(["-map", "0:v:0", "-map", "1:a:0"])
        // // The `-shortest` flag might cut the video, so it's commented out here
        // .outputOptions("-shortest")

        .addInput(tempFilePath.filepath)

      if (audioTrack) {
        cmd = cmd
        .addInput(audioTrack)
        // tells ffmpeg we want to overwrite the audio
        .addOptions(['-map 0:v', '-map 1:a', '-c:v copy'])
      }

      cmd = cmd
        .on("error", reject)
        .on('end', async () => {
          try {
            const durationInSec = await getMediaDuration(finalOutputFilePath);
            resolve({ filepath: finalOutputFilePath, durationInSec });
          } catch (err) {
            reject(err);
          }
        })
        .saveToFile(finalOutputFilePath)
    });

    const result = await promise
    
    return result
  } catch (error) {
    throw new Error(`Failed to assemble video: ${(error as Error).message}`);
  } finally {
    if (!keepTemporaryFiles) {
      // Cleanup temporary files - you could choose to do this or leave it to the user
      await Promise.all([...videoFilePaths, audioFilePath].map(p => fs.unlink(p)));
    }
  }
};