import { defaultVideoModel, ignoreChangesMadeToVideoRequests, skipPreReleaseStuff } from "./config.mts"

import { updateVideoIndex } from "./huggingface/setters/updateVideoIndex.mts"
import { getVideoIndex } from "./huggingface/getters/getVideoIndex.mts"
import { computeOrientationProjectionWidthHeight } from "./huggingface/utils/computeOrientationProjectionWidthHeight.mts"
import { VideoInfo } from "./types/video.mts"
import { getChannelsToScan } from "./getChannelsToScan.mts"

// note: this might be an expensive operation, so we should only do it every hours or more
export async function processChannels(): Promise<number> {
  console.log("processChannels(): loading queue..")
  
  const queuedVideos = await getVideoIndex({ status: "queued", renewCache: true })
  const publishedVideos = await getVideoIndex({ status: "published", renewCache: true })
  const generatingVideos = await getVideoIndex({ status: "generating", renewCache: true })

  let nbNewlyEnqueued = 0

  const channelsToScan = await getChannelsToScan()

  for (const { channel, videosRequests, isPreRelease } of channelsToScan) {

    if (isPreRelease) {
      if (skipPreReleaseStuff) {
        console.log(`ignoring pre-release channel..`)
        continue
      } else {
        console.log(`found a pre-release channel 👀`)
      }
    }

    console.log(`@${channel.datasetUser}/${channel.datasetName}: ${videosRequests.length} projects`)
    
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
        console.error("WOAH! WE HAVE A VIDEO ID COLLISION! BIG NO NO")
        console.log("Please warn the user that they cannot reuse the ID of someone's else!")
        continue
      }
      
      if (videoAlreadyPublished) {
        // console.log("video is already published..")

        // note: it is important to normalize the parameters first,
        // because if the published contains different things that the request,
        // then the video will be endlessly re-generated
        // that is not necessarily an issue, it could be used to create a live stream of some sort 
        // (but something more like on twitch, which only record the last session, not a "real" stream
        // which would require a lot more processing power that what we have here)
        const previousParameters = [
          videoAlreadyPublished.label,
          videoAlreadyPublished.lora,
          videoAlreadyPublished.description,
          videoAlreadyPublished.prompt,
          videoAlreadyPublished.music,
          videoAlreadyPublished.style
        ].map(x => `${x || ""}`.trim()).join("-------").toLowerCase()

        const newParameters = [
          videoRequest.label,
          videoRequest.lora,
          videoRequest.description,
          videoRequest.prompt,
          videoRequest.music,
          videoRequest.style
        ].map(x => `${x || ""}`.trim()).join("-------").toLowerCase()

        const videoParametersDidntChange = previousParameters === newParameters
        
        if (videoParametersDidntChange) {
          // video is already published! skipping..
          // console.log(`- video ${videoRequest.id} is already published and params didn't change, skipping it..`)
          continue
        } else {
          if (ignoreChangesMadeToVideoRequests) {
            // console.log(`- video ${videoRequest.id} is already published, params changed but server policy is to ignore changes, so.. we skip it`)
            continue
          } else {
            // console.log(`- video ${videoRequest.id} is already published, but params changed, so we re-generate it`)
          }
        }
      }

      if (generatingVideos[videoRequest.id]) {
        // video is already being generated! skipping..
        continue
      }

      if (queuedVideos[videoRequest.id]) {
        // video is already queued, skipping..
        continue
      }
      console.log(`adding video request ${videoRequest.id} to the queue`)

      const newVideo: VideoInfo = {
        id: videoRequest.id,
        status: "queued",
        label: videoRequest.label || "",
        description: videoRequest.description || "",
        prompt: videoRequest.prompt || "",
        thumbnailUrl: videoRequest.thumbnailUrl || "", // will be generated in async
        clapUrl: videoRequest.clapUrl || "",
        model: videoRequest.model || defaultVideoModel,
        lora: videoRequest.lora || "",
        style: videoRequest.style || "",
        voice: videoRequest.voice || "",
        music: videoRequest.music || "",
        assetUrl: "", // will be generated in async
        assetUrlHd: "", // will be generate even further later
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