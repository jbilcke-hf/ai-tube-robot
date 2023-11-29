import { VideoInfo } from "../types.mts"
import { getIndex } from "./getIndex.mts"
import { updateIndex } from "./updateIndex.mts"

export async function updateVideo(oldVideo: VideoInfo, newValues: VideoInfo): Promise<VideoInfo> {
  // touching the index is touchy, so we perform some sanity checks
  if (
    typeof oldVideo === "undefined" &&
    typeof oldVideo !== "object" &&
     Array.isArray(oldVideo) ||
     oldVideo === null ||
     !oldVideo.id ||
     !oldVideo.status) {
    throw new Error("oldVideo param is not an object, admin repair needed")
  }

  if (oldVideo.id !== newValues.id) {
    throw new Error("cannot change the id")
  }

  const video = {
    ...oldVideo,
    ...newValues
  }
  const newVideoIndex = await getIndex({
    status: video.status,
    renewCache: true,
  })

  newVideoIndex[video.id] = video

  await updateIndex({ status: video.status, videos: newVideoIndex })

  // if status changed, we remove the video from the previous index
  if (oldVideo.status !== newValues.status) {
    const oldVideoIndex = await getIndex({
      status: oldVideo.status,
      renewCache: true,
    })
  
    delete oldVideoIndex[video.id]
  
    await updateIndex({ status: oldVideo.status, videos: oldVideoIndex })
  }

  return video
}