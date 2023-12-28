
import { ChannelInfo } from "../../types/structures.mts"

import { getChannels } from "./getChannels.mts"

export async function getChannel(options: {
  channelId: string
  apiKey?: string
  owner?: string
  renewCache?: boolean
}): Promise<ChannelInfo> {
  const channels = await getChannels(options)

  if (channels.length === 1) {
    return channels[0]
  }

  throw new Error(`couldn't find channel ${options.channelId}`)
}
