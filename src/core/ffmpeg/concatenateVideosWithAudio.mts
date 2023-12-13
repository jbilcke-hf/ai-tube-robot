import { existsSync, promises as fs } from "node:fs"
import os from "node:os"
import path from "node:path"

import { v4 as uuidv4 } from "uuid";
import ffmpeg, { FfmpegCommand } from "fluent-ffmpeg";
import { addBase64HeaderToWav } from "../utils/addBase64HeaderToWav.mts";
import { addBase64HeaderToMp4 } from "../utils/addBase64HeaderToMp4.mts";
import { concatenateVideos } from "./concatenateVideos.mts";
import { keepTemporaryFiles } from "../config.mts";
import { writeBase64ToFile } from "../utils/writeBase64ToFile.mts";
import { getMediaInfo } from "./getMediaInfo.mts";

type ConcatenateVideoWithAudioOptions = {
  output?: string;
  audioTrack?: string; // base64
  audioFilePath?: string; // path
  videoTracks?: string[]; // base64
  videoFilePaths?: string[]; // path
  videoTracksVolume?: number; // Represents the volume level of the original video track
  audioTrackVolume?: number; // Represents the volume level of the additional audio track
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
  videoTracksVolume = 0.5, // (1.0 = 100% volume)
  audioTrackVolume = 0.5,
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

    // console.log("concatenating videos (without audio)..")
    const tempFilePath = await concatenateVideos({
      videoFilePaths,
    })

    // Check if the concatenated video has audio or not
    const tempVideoInfo = await getMediaInfo(tempFilePath.filepath);
    const hasOriginalAudio = tempVideoInfo.hasAudio;

    const finalOutputFilePath = output || path.join(tempDir, `${uuidv4()}.mp4`);

    // Begin ffmpeg command configuration
    let cmd = ffmpeg();

    // Add silent concatenated video
    cmd = cmd.addInput(tempFilePath.filepath);
 
    // If additional audio is provided, add audio to ffmpeg command
    if (audioFilePath) {
      cmd = cmd.addInput(audioFilePath);
      // If the input video already has audio, we will mix it with additional audio
      if (hasOriginalAudio) {
        const filterComplex = `
          [0:a]volume=${videoTracksVolume}[a0];
          [1:a]volume=${audioTrackVolume}[a1];
          [a0][a1]amix=inputs=2:duration=shortest[a]
        `.trim();

        cmd = cmd.outputOptions([
          '-filter_complex', filterComplex,
          '-map', '0:v',
          '-map', '[a]',
          '-c:v', 'copy',
          '-c:a', 'aac',
        ]);
      } else {
        // If the input video has no audio, just use the additional audio as is
        cmd = cmd.outputOptions([
          '-map', '0:v',
          '-map', '1:a',
          '-c:v', 'copy',
          '-c:a', 'aac',
        ]);
      }
    } else {
      // If no additional audio is provided, simply copy the video stream
      cmd = cmd.outputOptions([
        '-c:v', 'copy',
        hasOriginalAudio ? '-c:a' : '-an', // If original audio exists, copy it; otherwise, indicate no audio
      ]);
    }

    /*
    console.log("DEBUG:", {
      videoTracksVolume,
      audioTrackVolume,
      videoFilePaths,
      tempFilePath,
      hasOriginalAudio,
      // originalAudioVolume,
      audioFilePath,
      // additionalAudioVolume,
      finalOutputFilePath
     })
     */
  
    // Set up event handlers for ffmpeg processing
    const promise = new Promise<ConcatenateVideoAndMergeAudioOutput>((resolve, reject) => {
      cmd.on('error', (err) => {
        console.error("    Error during ffmpeg processing:", err.message);
        reject(err);
      }).on('end', async () => {
        // When ffmpeg finishes processing, resolve the promise with file info
        try {
          const { durationInSec } = await getMediaInfo(finalOutputFilePath);
          resolve({ filepath: finalOutputFilePath, durationInSec });
        } catch (err) {
          reject(err);
        }
      }).save(finalOutputFilePath); // Provide the path where to save the file
    });

    // Wait for ffmpeg to complete the process
    const result = await promise;
    return result;
  } catch (error) {
    throw new Error(`Failed to assemble video: ${(error as Error).message}`);
  } finally {
    if (!keepTemporaryFiles) {
      // Cleanup temporary files - you could choose to do this or leave it to the user
      await Promise.all([...videoFilePaths, audioFilePath].map(p => fs.unlink(p)));
    }
  }
};