import { whoAmI, Credentials } from "@huggingface/hub"
import { adminApiKey } from "../config.mts"
import { getChannels } from "./getChannels.mts"
import { ChannelInfo, UpdateQueueRequest, VideoInfo } from "../types.mts"
import { getVideoRequestsFromChannel } from "./getVideoRequestsFromChannel.mts"
import { getIndex } from "./getIndex.mts"
import { updateIndex } from "./updateIndex.mts"
import { parseVideoModelName } from "./parseVideoModelName.mts"

export async function updateQueueWithNewRequests(apiKey: string, optionalChannel?: ChannelInfo): Promise<number> {
  const isAdmin = apiKey === adminApiKey

  let channels: ChannelInfo[] = []
  let credentials: Credentials = { accessToken: apiKey }

  const { name: username } = await whoAmI({ credentials })

  if (isAdmin) {
    if (!optionalChannel) {
      console.log("sync: going to sync ALL platform channels (might be slow!)")
      channels = await getChannels({})
    } else {
      console.log("sync: going to sync admin user channel")
      channels = [optionalChannel]
    }
  } else {
    if (!optionalChannel) {
      console.log("sync: going to sync regular user channels")
      channels = await getChannels({ apiKey, owner: username })
    } else {
      console.log("sync: going to sync regular user channel")
      channels = [optionalChannel]
    }
  }

  const videos = await getIndex({ status: "queued", renewCache: true })

  console.log(`sync: got ${channels.length} channel(s) to update`)
  for (const channel of channels) {
    console.log(`sync: syncing channel ${channel.slug}`)

    const requests = await getVideoRequestsFromChannel({
      channel,
      apiKey
    })

    const requestsEntries = Object.entries(requests)

    console.log(`sync: going to sync channel "${channel.slug}" (@${channel.datasetUser}), found ${requestsEntries.length} requests`)

    for (const [videoId, videoRequest] of requestsEntries) {
      console.log(`sync: processing request ${videoId}: "${videoRequest.label}"`)
      
      const alreadyQueued = videos[videoId]

      const video: VideoInfo = {
        id: alreadyQueued.id,
        status: "queued",
        label: videoRequest.label,
        description: videoRequest.description,
        prompt: videoRequest.prompt || "",
        model: parseVideoModelName(videoRequest.model, channel.model),
        lora: videoRequest.lora || "",
        style: videoRequest.style || "",
        voice: videoRequest.voice || "",
        music: videoRequest.music || "",
        thumbnailUrl: videoRequest.thumbnailUrl || "",
        assetUrl: "", // will be filled in async, later
        numberOfViews: 0, // we reset
        numberOfLikes: 0, // we reset
        updatedAt: new Date().toISOString(),
        tags: videoRequest.tags,
        channel,
      }

      videos[video.id] = video
    }

    
  }

  // finally we update the index
  // now obviously this is only safe to do if there is
  // only one sync function and process doing the index commits at a time!
  await updateIndex({ status: "queued", videos })

  return 0
}