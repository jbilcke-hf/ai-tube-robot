
import { adminUsername } from "../../config.mts"
import { VideoInfo } from "../../types/video.mts"

// this is mostly a helper
export async function getVideosToUpscale({
  renewCache = true,
  neverThrow = true,
}: {
  renewCache?: boolean
  neverThrow?: boolean
} = {}): Promise<Record<string, VideoInfo>> {
  try {
    const response = await fetch(
      `https://huggingface.co/datasets/${adminUsername}/ai-tube-index/raw/main/to_upscale.json`
    , {
      cache: renewCache ? "no-store" : "default"
    })

    const jsonResponse = await response?.json()

    if (
      typeof jsonResponse === "undefined" &&
      typeof jsonResponse !== "object" &&
      Array.isArray(jsonResponse) ||
      jsonResponse === null) {
      throw new Error("index is not an object, admin repair needed")
    }

    const videos = jsonResponse as Record<string, VideoInfo>

    return videos
  } catch (err) {
    if (neverThrow) {
      console.error(`failed to get upscaled videos:`, err)
      return {}
    }
    throw err
  }
}
