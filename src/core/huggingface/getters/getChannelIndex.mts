
import { adminUsername } from "../../config.mts"
import { ChannelInfo } from "../../types/structures.mts"

export async function getChannelIndex({
  renewCache = true,
  neverThrow = true,
}: {
  renewCache?: boolean
  neverThrow?: boolean
}): Promise<Record<string, ChannelInfo>> {
  try {
    const response = await fetch(
      `https://huggingface.co/datasets/${adminUsername}/ai-tube-index/raw/main/channels.json`
    , {
      cache: renewCache ? "no-store" : "default"
    })

    const jsonResponse = await response?.json()

    if (
      typeof jsonResponse === "undefined" &&
      typeof jsonResponse !== "object" &&
      Array.isArray(jsonResponse) ||
      jsonResponse === null) {
      throw new Error("index is not an object, admin repair needed")
    }

    const channels = jsonResponse as Record<string, ChannelInfo>

    return channels
  } catch (err) {
    if (neverThrow) {
      console.error(`failed to get channels index:`, err)
      return {}
    }
    throw err
  }
}
