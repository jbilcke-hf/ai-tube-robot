import { adminApiKey } from "../config.mts"
import { ChannelInfo, VideoInfo, VideoStatus } from "../types.mts"
import { getIndex } from "./getIndex.mts"
import { getVideoRequestsFromChannel } from "./getVideoRequestsFromChannel.mts"

// return 
export async function getChannelVideos({
  channel,
  status,
}: {
  channel: ChannelInfo

  // filter videos by status
  status?: VideoStatus
}): Promise<VideoInfo[]> {

  const videos = await getVideoRequestsFromChannel({
    channel,
    apiKey: adminApiKey,
    renewCache: true
  })

  // TODO: use a database instead
  // normally 
  const queued = await getIndex({ status: "queued" })
  const published = await getIndex({ status: "published" })

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
      updatedAt: v.updatedAt,
      tags: v.tags,
      channel,
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
}