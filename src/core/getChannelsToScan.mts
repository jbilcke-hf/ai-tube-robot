import { skipLowPriorityAccounts, testUserApiKey } from "./config.mts"

import { getChannels } from "./huggingface/getters/getChannels.mts"
import { getVideoRequestsFromChannel } from "./huggingface/getters/getVideoRequestsFromChannel.mts"
import { sleep } from "./utils/sleep.mts"
import { getVideoIndex } from "./huggingface/getters/getVideoIndex.mts"
import { updateChannelIndex } from "./huggingface/setters/updateChannelIndex.mts"
import { isHighPriorityChannel } from "./auth/isHighPriorityChannel.mts"
import { isOwnedByBadActor } from "./auth/isOwnedByBadActor.mts"
import { getChannelRating } from "./auth/getChannelRating.mts"
import { getChannelIndex } from "./huggingface/getters/getChannelIndex.mts"
import { ChannelInfo } from "./types/structures.mts"
import { VideoRequest } from "./types/requests.mts"

export type ChannelToScan = {
  channel: ChannelInfo
  isPreRelease: boolean
  videosRequests: VideoRequest[]
}

// note: this might be an expensive operation, so we should only do it every hours or more
export async function getChannelsToScan(): Promise<ChannelToScan[]> {
  console.log("getChannelsToScan(): loading queue..")

  const indexedChannels = await getChannelIndex({ renewCache: true })

  // we are NOT going go add private channels unless the platform receives
  // significant funding, as supporting private channels will be very, very expensive
  // (need to manage quotas, priorities, safety, legal issues etc)
  /*
  let semiPublicChannels: ChannelInfo[] = []

  // TODO: pull this from the database instead
  const usernames = [
    testUserUsername
  ]

  // TODO get this in one go form the database instead
  const tmpUsers = await Promise.all(usernames.map(async username => {
    try {
      const user = await getUser(username)
      return user
    } catch (err) {
      return undefined
    }
  }))

  const users = tmpUsers.filter(user => user?.hfApiToken)

  for (const user of users) {
    try {
      semiPublicChannels = await getChannels({ apiKey: user.hfApiToken })
    } catch (err) {

    }
  }
  */


  const channelsToScan: ChannelToScan[] = []

  // this is just a way for us to test beta/alpha feature in advance
  // the prompts will be private, but the final video will be public on the platform
  const preReleaseChannels = await getChannels({ apiKey: testUserApiKey })

  for (const preReleaseChannel of preReleaseChannels) {
    const videosRequests = await getVideoRequestsFromChannel({
      channel: preReleaseChannel,
      apiKey: testUserApiKey,
      renewCache: true,
      neverThrow: true
    })
    channelsToScan.push({
      channel: preReleaseChannel,
      isPreRelease: true,
      videosRequests: videosRequests,
    })
  }

  console.log("getChannelsToScan(): checking the Hugging Face platform for public channels")
  
  // since our implentation of the user iterator is not finished,
  // we use a global getChannels() as a workaround for now
  let publicChannels = await getChannels({})

  const nbTotalChannels = publicChannels.length

  console.log(`getChannelsToScan(): ${nbTotalChannels} public channels identified`)

  // only keep channels which are NOT owned by bad actors
  publicChannels = publicChannels.filter(channel => !isOwnedByBadActor(channel))
  const nbBannedChannels = nbTotalChannels - publicChannels.length

  console.log(`getChannelsToScan(): ${
    publicChannels.length
  } channels are legit, while ${
    nbBannedChannels
  } are compromised`)


  console.log(`getChannelsToScan(): checking if channel index needs to be updated..`)


  const channelsBefore = JSON.stringify(Object.values(indexedChannels).sort((a, b) => a.id.localeCompare(b.id)))

  const channelsNow = JSON.stringify(publicChannels.sort((a, b) => a.id.localeCompare(b.id)))

  if (channelsBefore !== channelsNow) {
    console.log("getChannelsToScan(): channel index needs to be updated..")
    await updateChannelIndex(publicChannels)
    console.log(`getChannelsToScan(): channel index updated!`)
  } else {
    console.log(`getChannelsToScan(): channel index is already up to date!`)

  }

  if (skipLowPriorityAccounts) {
    console.log("getChannelsToScan(): skipLowPriorityAccounts is toggled ON")
    publicChannels = publicChannels.filter(channel => isHighPriorityChannel(channel))
  } else {
    // put high-priority accounts (developers, admins, VIPs etc) at the top
    publicChannels.sort((a, b) => {
      return isHighPriorityChannel(a) ? -1 : +1
    })
  }

  // remove channels with low popularity rate
  publicChannels = publicChannels.filter(channel => getChannelRating(channel))

  for (const publicChannel of publicChannels) {

    // delay a bit since this calls Hugging Face for *each* channel
    await sleep(200)

    const videosRequests = await getVideoRequestsFromChannel({
      channel: publicChannel,
      // apiKey: we use the admin key, since channels are supposedly public
      renewCache: true,
      neverThrow: true
    })
    channelsToScan.push({
      channel: publicChannel,
      isPreRelease: false,
      videosRequests: videosRequests,
    })
  }

  return channelsToScan
}