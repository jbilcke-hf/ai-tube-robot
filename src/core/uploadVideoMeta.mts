import { Blob } from "buffer"

import { uploadFile } from "@huggingface/hub"

import { VideoInfo } from "../types.mts"
import { adminCredentials, adminUsername } from "../config.mts"

export async function uploadVideoMeta({
  video,
}: {
  video: VideoInfo
}): Promise<string> {
  if (!video) {
    throw new Error(`the video is required`)
  }

  // Convert base64 string a Buffer
  const blob = new Blob([JSON.stringify(video, null, 2)])

  const uploadFilePath = `videos/${video.id}.json`

  await uploadFile({
	  credentials: adminCredentials,
    repo: `datasets/${adminUsername}/ai-tube-index`,
    file: {
      path: uploadFilePath,
      content: blob as any,
    },
    commitTitle: `[robot] Update video meta ${video.id}`,
  })

  return `https://huggingface.co/datasets/jbilcke-hf/ai-tube-index/resolve/main/videos/${video.id}.json`
}
