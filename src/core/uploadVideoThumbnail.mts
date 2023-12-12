import { Blob } from "buffer"
import { promises as fs } from "node:fs"

import { uploadFile } from "@huggingface/hub"

import { VideoInfo } from "../types.mts"
import { adminCredentials, adminUsername } from "../config.mts"
import { convertImageToWebp } from "./convertImageToWebp.mts"

// upload a video thumbnail (in base64 format - typically a PNG)
// to the AI Tube index, as a .webp file
export async function uploadVideoThumbnail({
  video,
  thumbnailBase64,
}: {
  video: VideoInfo
  thumbnailBase64: string
}): Promise<string> {
  if (!video) {
    throw new Error(`the video is required`)
  }
  if (!thumbnailBase64) {
    throw new Error(`the imageBase64 is required`)
  }

  
  const webpImageBase64 = await convertImageToWebp(thumbnailBase64)

  const rawDataBase64 = webpImageBase64.split(";base64,").pop()

  const buffer = Buffer.from(rawDataBase64, "base64")

  const blob = new Blob([buffer])

  const uploadFilePath = `videos/${video.id}.webp`

  await uploadFile({
	  credentials: adminCredentials,
    repo: `datasets/${adminUsername}/ai-tube-index`,
    file: {
      path: uploadFilePath,
      content: blob as any,
    },
    commitTitle: "[robot] Upload new video thumbnail",
  })

  return `https://huggingface.co/datasets/jbilcke-hf/ai-tube-index/resolve/main/videos/${video.id}.webp`
}
