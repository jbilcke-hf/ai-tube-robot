import { promises as fs } from "node:fs"
import os from "node:os"
import path from "node:path"

import { v4 as uuidv4 } from "uuid";
import ffmpeg, { FfmpegCommand } from "fluent-ffmpeg";
import { addBase64HeaderToWav } from "./addBase64HeaderToWav.mts";
import { addBase64HeaderToMp4 } from "./addBase64HeaderToMp4.mts";
import { concatenateVideos } from "./concatenateVideos.mts";
import { keepTemporaryFiles } from "../config.mts";

type AssembleVideoOptions = {
  audioTracks: string[];
  videoTracks: string[];
};

const decodeBase64ToFile = async (base64Data: string, filePath: string): Promise<string> => {
  const data = base64Data.split(";base64,").pop();
  if (!data) {
    throw new Error("Invalid base64 content");
  }
  await fs.writeFile(filePath, data, { encoding: "base64" });

  return filePath
};

export const concatenateVideosWithAudio = async ({
  audioTracks,
  videoTracks
}: AssembleVideoOptions): Promise<string> => {
  // Prepare temporary directories
  const tempDir = path.join(os.tmpdir(), uuidv4());
  await fs.mkdir(tempDir);

  let audioFilePaths: string[] = []
  let videoFilePaths: string[] = []
  try {

    let i = 0
    for (const track of audioTracks) {
      if (!track) { continue }
      const audioFilePath = path.join(tempDir, `audio${++i}.wav`);
      await decodeBase64ToFile(addBase64HeaderToWav(track), audioFilePath);
      audioFilePaths.push(audioFilePath);
    }


    // Decode and concatenate base64 video tracks to temporary file
    i = 0
    for (const track of videoTracks) {
      if (!track) { continue }
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
      let cmd = ffmpeg()
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

      if (audioTracks.length) {
        cmd = cmd
        // tells ffmpeg we want to overwrite the audio
        .addOptions(['-map 0:v', '-map 1:a', '-c:v copy'])
      }

      // adding an audio track is optional
      for (const track of audioTracks) {
        cmd = cmd.addInput(track)
      }

      cmd = cmd
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
      await Promise.all([...videoFilePaths, ...audioFilePaths].map(p => fs.unlink(p)));
    }
  }
};