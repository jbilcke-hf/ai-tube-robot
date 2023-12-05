import { Blob } from "buffer"
import { promises as fs } from "node:fs"

import { uploadFile } from "@huggingface/hub"

import { VideoInfo } from "../types.mts"
import { adminCredentials, adminUsername } from "../config.mts"

export async function uploadFinalVideoFileToAITube({
  video,
  filePath,
}: {
  video: VideoInfo
  filePath: string
}): Promise<VideoInfo> {
  if (!filePath) {
    throw new Error(`the filePath is required`)
  }
  if (!video) {
    throw new Error(`the video is required`)
  }

  // Convert base64 string a Buffer
  const buffer = await fs.readFile(filePath)
  const blob = new Blob([buffer])

  const uploadFilePath = `videos/${video.id}.mp4`

  await uploadFile({
	  credentials: adminCredentials,
    repo: `datasets/${adminUsername}/ai-tube-index`,
    file: {
      path: uploadFilePath,
      content: blob as any,
    },
    commitTitle: "Add new video prompt",
  })

  return {
    ...video,
    assetUrl: `https://huggingface.co/datasets/jbilcke-hf/ai-tube-index/raw/main/videos/${video.id}.mp4`
  }
}
