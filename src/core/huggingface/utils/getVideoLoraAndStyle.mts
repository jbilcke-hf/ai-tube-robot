
import { getSDXLModel } from "../../generators/image/getSDXLModel.mts"
import { VideoInfo } from "../../types/video.mts"

export async function getVideoLoraAndStyle(video: VideoInfo): Promise<{
  lora: string
  style: string
}> {
  let lora = `${video.lora || video.channel.lora || ""}`.trim()
  let style = `${video.style || video.channel.style || ""}`.trim()

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