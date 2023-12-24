
import { Blob } from "buffer"

import { VideoInfo, VideoStatus } from "../../../types.mts"
import { uploadFile } from "@huggingface/hub"
import { adminCredentials, adminUsername } from "../../config.mts"

export async function updateVideosToUpscale({
  videos
}: {
  videos: Record<string, VideoInfo>
}): Promise<boolean> {
  // touching the index is touchy, so we perform some sanity checks
  if (
    typeof videos === "undefined" ||
    typeof videos !== "object" ||
     Array.isArray(videos) ||
     videos === null) {
    throw new Error("videos param is not an object, admin repair needed")
  }

  const blob = new Blob([JSON.stringify(videos, null, 2)])

  await uploadFile({
    credentials: adminCredentials,
    repo: `datasets/${adminUsername}/ai-tube-index`,
    file: {
      path: `to_upscale.json`,
      content: blob as any,
    },
    commitTitle: `[robot] Update videos to upscale (to_upscale.json)`,
  })

  return true
}