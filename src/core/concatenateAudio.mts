import { existsSync, promises as fs } from "node:fs"
import os from "node:os"
import path from "node:path"

import { v4 as uuidv4 } from "uuid";
import ffmpeg, { FfmpegCommand } from "fluent-ffmpeg";
import { addBase64HeaderToWav } from "./addBase64HeaderToWav.mts";
import { keepTemporaryFiles } from "../config.mts";
import { writeBase64ToFile } from "./writeBase64ToFile.mts";
import { getMediaDuration } from "./getMediaDuration.mts";

export type ConcatenateAudioOptions = {
  // those are base64 audio strings!
  audioTracks?: string[]; // base64
  audioFilePaths?: string[]; // path
  crossfadeDurationInSec?: number;
  outputFormat?: string; // "wav" or "mp3"
  output?: string;
}

export type ConcatenateAudioOutput = {
  filepath: string;
  durationInSec: number;
}

export async function concatenateAudio({
  output,
  audioTracks = [],
  audioFilePaths = [],
  crossfadeDurationInSec = 10,
  outputFormat = "wav"
}: ConcatenateAudioOptions): Promise<ConcatenateAudioOutput> {
  if (!Array.isArray(audioTracks)) {
    throw new Error("Audios must be provided in an array");
  }

  const tempDir = path.join(os.tmpdir(), uuidv4());
  await fs.mkdir(tempDir);

  // trivial case: there is only one audio to concatenate!
  if (audioTracks.length === 1 && audioTracks[0]) {
    const audioTrack = audioTracks[0]
    const outputFilePath = path.join(tempDir, `audio_0.wav`);
    await writeBase64ToFile(addBase64HeaderToWav(audioTrack), outputFilePath);

    const durationInSec = await getMediaDuration(outputFilePath);
    return { filepath: outputFilePath, durationInSec };
  }

  if (audioFilePaths.length === 1) {
    throw new Error("concatenating a single audio file path is not implemented yet")
  }
  
  try {

    let i = 0
    for (const track of audioTracks) {
      if (!track) { continue }
      const audioFilePath = path.join(tempDir, `audio${++i}.wav`);
      await writeBase64ToFile(addBase64HeaderToWav(track), audioFilePath);
      audioFilePaths.push(audioFilePath);
    }

    audioFilePaths = audioFilePaths.filter((audio) => existsSync(audio))

    const outputFilePath = output ?? path.join(tempDir, `${uuidv4()}.${outputFormat}`);
    
    const filterComplex = audioFilePaths
      .map((_, i, arr) =>
        i < arr.length - 1
          ? `[${i}][${i + 1}]acrossfade=d=${crossfadeDurationInSec}:c1=tri:c2=tri[${
              i ? `a${i - 1}${i + 1}` : `a${i}${i + 1}`
            }];`
          : ''
      )
      .join('');
    const outputFileLabel =
      audioFilePaths.length > 1
      ? `a${audioFilePaths.length - 2}${audioFilePaths.length - 1}`
      : "[0]";

    let cmd: FfmpegCommand = ffmpeg().outputOptions('-vn');

    audioFilePaths.forEach((audio, i) => {
      cmd = cmd.input(audio)
    });

    const promise = new Promise<ConcatenateAudioOutput>((resolve, reject) => {
      cmd = cmd
        .on('error', reject)
        .on('end', async () => {
          try {
            const durationInSec = await getMediaDuration(outputFilePath);
            resolve({ filepath: outputFilePath, durationInSec });
          } catch (err) {
            reject(err);
          }
        })
        .complexFilter(filterComplex.slice(0, -1), outputFileLabel)
        .save(outputFilePath);
    });

    const result = await promise

    return result
  } catch (error) {
    throw new Error(`Failed to assemble audio: ${(error as Error).message}`);
  } finally {
    if (!keepTemporaryFiles) {
      // Cleanup temporary files - you could choose to do this or leave it to the user
      await Promise.all([...audioFilePaths].map(p => fs.unlink(p)));
    }
  }
}
