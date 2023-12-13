import ffmpeg from "fluent-ffmpeg";

export type MediaMetadata = {
  durationInSec: number;
  hasAudio: boolean;
};

export async function getMediaInfo(fileName: string): Promise<MediaMetadata> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(fileName, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }

      const durationInSec = metadata?.format?.duration || 0;
      const hasAudio = metadata?.streams.some((stream) => stream.codec_type === 'audio');

      resolve({
        durationInSec,
        hasAudio,
      });
    });
  });
}