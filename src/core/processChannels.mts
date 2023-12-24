import { enableRepublishing, skipLowPriorityAccounts } from "./config.mts"
import { VideoInfo } from "../types.mts"
import { getChannels } from "./huggingface/getters/getChannels.mts"
import { getVideoRequestsFromChannel } from "./huggingface/getters/getVideoRequestsFromChannel.mts"
import { sleep } from "./utils/sleep.mts"
import { updateVideoIndex } from "./huggingface/setters/updateVideoIndex.mts"
import { getVideoIndex } from "./huggingface/getters/getVideoIndex.mts"
import { updateChannelIndex } from "./huggingface/setters/updateChannelIndex.mts"
import { isHighPriorityChannel } from "./auth/isHighPriorityChannel.mts"
import { isOwnedByBadActor } from "./auth/isOwnedByBadActor.mts"
import { getChannelRating } from "./auth/getChannelRating.mts"
import { computeOrientationProjectionWidthHeight } from "./huggingface/utils/computeOrientationProjectionWidthHeight.mts"
import { getChannelIndex } from "./huggingface/getters/getChannelIndex.mts"

// note: this might be an expensive operation, so we should only do it every hours or more
export async function processChannels(): Promise<number> {
  console.log("processChannels(): loading queue..")
  
  const queuedVideos = await getVideoIndex({ status: "queued", renewCache: true })
  const publishedVideos = await getVideoIndex({ status: "published", renewCache: true })
  const generatingVideos = await getVideoIndex({ status: "generating", renewCache: true })
  const indexedChannels = await getChannelIndex({ renewCache: true })

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


  console.log(`processChannels(): checking if channel index needs to be updated..`)


  const channelsBefore = JSON.stringify(Object.values(indexedChannels).sort((a, b) => a.id.localeCompare(b.id)))

  const channelsNow = JSON.stringify(channels.sort((a, b) => a.id.localeCompare(b.id)))

  if (channelsBefore !== channelsNow) {
    console.log("processChannels(): channel index needs to be updated..")
    await updateChannelIndex(channels)
    console.log(`processChannels(): channel index updated!`)
  } else {
    console.log(`processChannels(): channel index is already up to date!`)

  }

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

    if (!getChannelRating(channel)) { continue }
    
    await sleep(500)

    const videosRequests = await getVideoRequestsFromChannel({
      channel,
      renewCache: true,
      neverThrow: true
    })
  
    console.log(`scanned channel "${channel.datasetName}" by @${channel.datasetUser} (found ${videosRequests.length} videos)`)
    
    for (const videoRequest of videosRequests) {

      // this is a protection against attempts to corrupt our database
      const videoAlreadyGenerating = generatingVideos[videoRequest.id]
      const videoAlreadyPublished = publishedVideos[videoRequest.id]
      const videoAlreadyQueued = queuedVideos[videoRequest.id]

      const userTriedToUseSomeoneElseVideoId =
        (videoAlreadyGenerating && videoAlreadyGenerating.channel.id !== videoRequest.channel.id)
        || (videoAlreadyPublished && videoAlreadyPublished.channel.id !== videoRequest.channel.id)
        || (videoAlreadyQueued && videoAlreadyQueued.channel.id !== videoRequest.channel.id)

      if (userTriedToUseSomeoneElseVideoId) {
        console.error("WOAH! WE HAVE A VIDEO ID COLLISION!")
        console.log("Please warn the user that they cannot reuse the ID of someone's else!")
        continue
      }
      
      if (!enableRepublishing) {
        if (videoAlreadyPublished) {
          // video is already published! skipping..
          // console.log(`- video ${videoRequest.id} is already published, skipping it..`)
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
          numberOfDislikes: 0,
          updatedAt: new Date().toISOString(),
          tags: videoRequest.tags,
          channel,
          duration: videoRequest.duration || 0,
          ...computeOrientationProjectionWidthHeight({
            lora: videoRequest.lora,
            orientation: videoRequest.orientation,
            // projection, // <- will be extrapolated from the LoRA for now
          }),
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