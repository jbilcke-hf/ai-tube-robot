import { adminApiKey } from "../../config.mts"
import { ChannelInfo, VideoInfo, VideoStatus } from "../../../types.mts"
import { getVideoIndex } from "./getVideoIndex.mts"
import { getVideoRequestsFromChannel } from "./getVideoRequestsFromChannel.mts"
import { orientationToWidthHeight } from "../utils/orientationToWidthHeight.mts"

// return 
export async function getChannelVideos({
  channel,
  status,
  neverThrow,
}: {
  channel?: ChannelInfo

  // filter videos by status
  status?: VideoStatus

  neverThrow?: boolean
}): Promise<VideoInfo[]> {

  if (!channel) { return [] }

  try {
    const videos = await getVideoRequestsFromChannel({
      channel,
      apiKey: adminApiKey,
      renewCache: true
    })

    // TODO: use a database instead
    // normally 
    const queued = await getVideoIndex({ status: "queued" })
    const published = await getVideoIndex({ status: "published" })

    return videos.map(v => {
    let video: VideoInfo = {
        id: v.id,
        status: "submitted",
        label: v.label,
        description: v.description,
        prompt: v.prompt,
        thumbnailUrl: v.thumbnailUrl,
        model: v.model,
        lora: v.lora,
        style: v.style,
        voice: v.voice,
        music: v.music,
        assetUrl: "",
        numberOfViews: 0,
        numberOfLikes: 0,
        numberOfDislikes: 0,
        updatedAt: v.updatedAt,
        tags: v.tags,
        channel,
        duration: v.duration || 0,
        orientation: v.orientation,
        ...orientationToWidthHeight(v.orientation),
      }

      if (queued[v.id]) {
        video = queued[v.id]
      } else if (published[v.id]) {
        video = published[v.id]
      }

      return video
    }).filter(video => {
      if (!status || typeof status === "undefined") {
        return true
      }

      return video.status === status
    })
  } catch (err) {
    if (neverThrow) {
      console.error("failed to get channel videos:", err)
      return []
    }

    throw err
  }
}