import { enableRepublishing } from "../config.mts"
import { VideoInfo } from "../types.mts"
import { getChannels } from "./getChannels.mts"
import { getIndex } from "./getIndex.mts"
import { getVideoRequestsFromChannel } from "./getVideoRequestsFromChannel.mts"
import { sleep } from "./sleep.mts"
import { updateIndex } from "./updateIndex.mts"
import { updateQueueWithNewRequests } from "./updateQueueWithNewRequests.mts"

// note: this might be an expensive operation, so we should only do it every hours or more
export async function processChannels(): Promise<number> {
  console.log("processChannels(): loading queue..")
  
  const queuedVideos = await getIndex({ status: "queued", renewCache: true })
  const publishedVideos = await getIndex({ status: "published", renewCache: true })
  const generatingVideos = await getIndex({ status: "generating", renewCache: true })

  await sleep(2000)

  console.log("processChannels(): checking the Hugging Face platform for AI Tube channels")
  
  const channels = await getChannels({})

  console.log(`processChannels(): ${channels.length} public channels identified`)

  let nbNewlyEnqueued = 0

  for (const channel of channels) {

    await sleep(1000)

    console.log(`scanning channel "${channel.datasetName}" by @${channel.datasetUser}`)
    
    const videosRequests = await getVideoRequestsFromChannel({
      channel,
      renewCache: true,
      neverThrow: true
    })
  
    for (const videoRequest of videosRequests) {

      if (!enableRepublishing) {
        if (publishedVideos[videoRequest.id]) {
          // video is already published! skipping..
          continue
        }
      }

      if (generatingVideos[videoRequest.id]) {
        // video is already being generated! skipping..
        continue
      }

      if (!queuedVideos[videoRequest.id]) {
        console.log(`adding video request ${videoRequest.id} to the queue`)

        const newVideo: VideoInfo = {
          id: videoRequest.id,
          status: "queued",
          label: videoRequest.label,
          description: videoRequest.description,
          prompt: videoRequest.prompt,
          thumbnailUrl: channel.thumbnail, // will be generated in async
          assetUrl: "", // will be generated in async
          numberOfViews: 0,
          numberOfLikes: 0,
          updatedAt: new Date().toISOString(),
          tags: videoRequest.tags,
          channel,
        }
        queuedVideos[videoRequest.id] = newVideo

        nbNewlyEnqueued += 1
      }
    }

    // this is the end goal, we want to be able to automatically generate videos
    // note that we don't keep the user token so we won't be able to upload the video to their dataset on their behalf,
    // but this could be done when they connect on the UI
    // console.log("TODO Julian: call Zephyr to generate a new video")

  }

  if (nbNewlyEnqueued) {
    console.log(`processChannels(): at least one video has been enqueued, updating index..`)
    // finally we update the index
    // now obviously this is only safe to do if there is
    // only one sync function and process doing the index commits at a time!
    await updateIndex({ status: "queued", videos: queuedVideos })
    // await updateIndex({ status: "queued", videos: queuedVideos })
  }

  return nbNewlyEnqueued
}