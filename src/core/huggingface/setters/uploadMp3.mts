import { Blob } from "buffer"
import { promises as fs } from "node:fs"

import { uploadFile } from "@huggingface/hub"

import { adminCredentials, adminUsername } from "../../config.mts"
import { VideoInfo } from "../../types/video.mts"

export async function uploadMp3({
  video,
  filePath,
}: {
  video: VideoInfo
  filePath: string
}): Promise<string> {
  if (!filePath) {
    throw new Error(`the filePath is required`)
  }
  if (!video) {
    throw new Error(`the video is required`)
  }

  // Convert base64 string a Buffer
  const buffer = await fs.readFile(filePath)
  const blob = new Blob([buffer])

  const uploadFilePath = `videos/${video.id}.mp3`

  await uploadFile({
	  credentials: adminCredentials,
    repo: `datasets/${adminUsername}/ai-tube-index`,
    file: {
      path: uploadFilePath,
      content: blob as any,
    },
    commitTitle: "[robot] Add new MP3 audio file",
  })

  return `https://huggingface.co/datasets/jbilcke-hf/ai-tube-index/resolve/main/${uploadFilePath}`
}
