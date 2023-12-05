import { promises as fsPromises } from "node:fs"
import os from "node:os"
import path from "node:path"

import { v4 as uuidv4 } from "uuid";
import ffmpeg, { FfmpegCommand } from "fluent-ffmpeg";
import { addBase64HeaderToWav } from "./addBase64HeaderToWav.mts";
import { addBase64HeaderToMp4 } from "./addBase64HeaderToMp4.mts";
import { concatenateVideos } from "./concatenateVideos.mts";
import { keepTemporaryFiles } from "../config.mts";

type AssembleVideoOptions = {
  audioTrack: string;
  videoTracks: string[];
};

const decodeBase64ToFile = async (base64Data: string, filePath: string): Promise<string> => {
  const data = base64Data.split(";base64,").pop();
  if (!data) {
    throw new Error("Invalid base64 content");
  }
  await fsPromises.writeFile(filePath, data, { encoding: "base64" });

  return filePath
};

export const concatenateVideosWithAudio = async ({
  audioTrack,
  videoTracks
}: AssembleVideoOptions): Promise<string> => {
  // Prepare temporary directories
  const tempDir = path.join(os.tmpdir(), uuidv4());
  await fsPromises.mkdir(tempDir);

  let audioFilePath: string = ""
  let videoFilePaths: string[] = []
  try {
    // Decode base64 audio track to temporary file
    audioFilePath = path.join(tempDir, "audio.wav");
    await decodeBase64ToFile(addBase64HeaderToWav(audioTrack), audioFilePath);

    // Decode and concatenate base64 video tracks to temporary file
    let i = 0

    for (const track of videoTracks) {
      const videoFilePath = path.join(tempDir, `video${++i}.mp4`);

      await decodeBase64ToFile(addBase64HeaderToMp4(track), videoFilePath);

      videoFilePaths.push(videoFilePath);
    }

    // The final output file path
    const finalOutputFilePath = path.join(tempDir, `${uuidv4()}.mp4`);

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
      videos: videoFilePaths,

    })
    // console.log("concatenated silent shots to: ", tempFilePath)
    
    // console.log("concatenating video + audio..")

    // Add audio to the concatenated video file
    await new Promise<string>((resolve, reject) => {
      ffmpeg()
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

        // tells ffmpeg we want to overwrite the audio
        .addOptions(['-map 0:v', '-map 1:a', '-c:v copy'])

        .addInput(tempFilePath)
        .addInput(audioFilePath)
        .on("error", reject)
        .on("end", () => { resolve(finalOutputFilePath) })
        .saveToFile(finalOutputFilePath)
    });

    return finalOutputFilePath;
  
  } catch (error) {
    throw new Error(`Failed to assemble video: ${(error as Error).message}`);
  } finally {
    if (!keepTemporaryFiles) {
      // Cleanup temporary files - you could choose to do this or leave it to the user
      await Promise.all(videoFilePaths.map(filePath => fsPromises.unlink(filePath)));
      await fsPromises.unlink(audioFilePath);
    }
  }
};