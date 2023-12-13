
import { Blob } from "buffer"

import { uploadFile } from "@huggingface/hub"

import { adminCredentials, adminUsername } from "../../config.mts"
import { ChannelInfo } from "../../../types.mts"

export async function updateChannelIndex(
  channels: ChannelInfo[] | Record<string, ChannelInfo>
): Promise<boolean> {
  let channelsIndex: Record<string, ChannelInfo> = {}
  if (Array.isArray(channels)) {
    channels.forEach(c => { channelsIndex[c.id] = c })
  } else {
    // touching the index is touchy, so we perform some sanity checks
    if (
      typeof channels === "undefined" ||
      typeof channels !== "object" ||
      channels === null) {
      throw new Error("channels param is not an object, admin repair needed")
    }

    channelsIndex = channels
  }

  const blob = new Blob([JSON.stringify(channelsIndex, null, 2)])

  await uploadFile({
    credentials: adminCredentials,
    repo: `datasets/${adminUsername}/ai-tube-index`,
    file: {
      path: `channels.json`,
      content: blob as any,
    },
    commitTitle: `[robot] Update channel index (channels.json)`,
  })

  return true
}