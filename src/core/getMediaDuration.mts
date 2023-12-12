import ffmpeg from "fluent-ffmpeg";

export async function getMediaDuration(fileName: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(fileName, (err, metadata) => {
      if (err) reject(err);

      const duration = metadata?.format?.duration;
      if (duration) {
        resolve(duration);
      } else {
        reject(new Error("Could not determine the video duration"));
      }
    });
  });
}