
import { VideoGenerationParams, VideoInfo } from "../types.mts"

import { parseVideoModelName } from "./parseVideoModelName.mts"
import { sleep } from "./sleep.mts"

import { generateVideoWithLaVie } from "./generateVideoWithLaVie.mts"
import { generateVideoWithHotshotXL } from "./generateVideoWithHotshotXL.mts"
import { generateVideoWithSVD } from "./generateVideoWithSVD.mts"
import { defaultVideoModel } from "../config.mts"
import { getLoraStyle } from "./getLoraStyle.mts"

export async function generateVideo(prompt: string, video: VideoInfo): Promise<string> {

  const { lora, style } = await getLoraStyle(video)
  
  // let's use what we know works well
  let base64Video = ""
  const modelParams: VideoGenerationParams = {
    prompt,
    lora,
    style,
  }

  // let's try to detect the model!
  const channelVideoModel = parseVideoModelName(video.channel.model, defaultVideoModel)

  const videoModel = parseVideoModelName(video.model, channelVideoModel)

  // TODO: add LaVie

  // all those functions normally have the same signature
  // (p: VideoGenerationParams) => Promise<string>
  const generateVideoWithModel =
  videoModel === "SVD"
    ? generateVideoWithSVD
    : videoModel === "LaVie"
    ? generateVideoWithLaVie
    : generateVideoWithHotshotXL

  try {
    base64Video = await generateVideoWithModel(modelParams)
  } catch (err) {
    try {
      await sleep(5000)
    // Gradio spaces often fail (out of memory etc), so let's try again
      base64Video = await generateVideoWithModel({
        ...modelParams,
        prompt: prompt + ".",
      })
    } catch (err3) {
      try {
        await sleep(10000)
        // Gradio spaces often fail (out of memory etc), so let's try one last time
          base64Video = await generateVideoWithModel({
            ...modelParams,
            prompt: prompt + "..",
          })
        } catch (err2) {
          base64Video = ""
        }
    }
  }
  if (!base64Video.length || base64Video.length < 200) {
    return ""
  }
  return base64Video
}