import { enableRepublishing, priorityAccounts, skipLowPriorityAccounts } from "../config.mts"
import { VideoInfo } from "../types.mts"
import { getChannels } from "./getChannels.mts"
import { getVideoRequestsFromChannel } from "./getVideoRequestsFromChannel.mts"
import { isHighPriorityChannel } from "./isHighPriorityChannel.mts"
import { parseVideoModelName } from "./parseVideoModelName.mts"
import { sleep } from "./sleep.mts"
import { updateVideoIndex } from "./updateVideoIndex.mts"
import { updateQueueWithNewRequests } from "./updateQueueWithNewRequests.mts"
import { isOwnedByBadActor } from "./isOwnedByBadActor.mts"
import { getVideoIndex } from "./getVideoIndex.mts"
import { updateChannelIndex } from "./updateChannelIndex.mts"

// note: this might be an expensive operation, so we should only do it every hours or more
export async function processChannels(): Promise<number> {
  console.log("processChannels(): loading queue..")
  
  const queuedVideos = await getVideoIndex({ status: "queued", renewCache: true })
  const publishedVideos = await getVideoIndex({ status: "published", renewCache: true })
  const generatingVideos = await getVideoIndex({ status: "generating", renewCache: true })

  await sleep(2000)

  console.log("processChannels(): checking the Hugging Face platform for AI Tube channels")
  
  let channels = await getChannels({})
  const nbTotalChannels = channels.length

  console.log(`processChannels(): ${channels.length} public channels identified`)

  // only keep channels which are NOT owned by bad actors
  channels = channels.filter(channel => !isOwnedByBadActor(channel))
  const nbBannedChannels = nbTotalChannels - channels.length

  console.log(`processChannels(): ${
    channels.length
  } channels are legit, while ${
    nbBannedChannels
  } are compromised`)


  console.log(`processChannels(): updating the channel index..`)

  // we update the channel index
  await updateChannelIndex(channels)

  console.log(`processChannels(): channel index updated!`)

  if (skipLowPriorityAccounts) {
    console.log("processChannels(): skipLowPriorityAccounts is toggled ON")
    channels = channels.filter(channel => isHighPriorityChannel(channel))
  } else {
    // put high-priority accounts (developers, admins, VIPs etc) at the top
    channels.sort((a, b) => {
      return isHighPriorityChannel(a) ? -1 : +1
    })
  }

  let nbNewlyEnqueued = 0

  for (const channel of channels) {
    await sleep(500)

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
          console.log(`- video ${videoRequest.id} is already published, skipping it..`)
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
          thumbnailUrl: videoRequest.thumbnailUrl, // will be generated in async
          model: videoRequest.model,
          lora: videoRequest.lora,
          style: videoRequest.style,
          voice: videoRequest.voice,
          music: videoRequest.music,
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
    await updateVideoIndex({ status: "queued", videos: queuedVideos })
    // await updateVideoIndex({ status: "queued", videos: queuedVideos })
  }

  return nbNewlyEnqueued
}