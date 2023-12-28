
import { Blob } from "buffer"

import { uploadFile } from "@huggingface/hub"
import { adminCredentials, adminUsername } from "../../config.mts"
import { VideoStatus } from "../../types/atoms.mts"
import { VideoInfo } from "../../types/video.mts"

export async function updateVideoIndex({
  status,
  videos
}: {
  status: VideoStatus
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
      path: `${status}.json`,
      content: blob as any,
    },
    commitTitle: `[robot] Update video index (${status}.json)`,
  })

  return true
}