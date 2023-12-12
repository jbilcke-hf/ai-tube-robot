import { VideoInfo } from "../types.mts"
import { getSDXLModel } from "./getSDXLModel.mts"

export async function getLoraStyle(video: VideoInfo): Promise<{
  lora: string
  style: string
}> {
  let lora = `${video.lora || video.channel.lora || ""}`.trim()
  let style = `${video.style ||video.channel.style || ""}`.trim()

  if (lora) {
    try {
      const model = await getSDXLModel(lora)
      style = style
        ? `${style}, ${model.trigger_word}`
        : model.trigger_word
    } catch (err) {
      console.error(`user tried to use lora model ${lora} without a style/trigger parameter, but we couldn't find it ourselves`)
      lora = ""
      style = ""
    }
  }

  return {
    lora,
    style,
  }
}