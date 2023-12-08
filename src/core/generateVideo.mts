
import { VideoGenerationParams, VideoInfo } from "../types.mts"

import { parseModelName } from "./parseModelName.mts"
import { sleep } from "./sleep.mts"

import { generateVideoWithLaVie } from "./generateVideoWithLaVie.mts"
import { generateVideoWithHotshotXL } from "./generateVideoWithHotshotXL.mts"
import { generateVideoWithSVD } from "./generateVideoWithSVD.mts"

export async function generateVideo(prompt: string, video: VideoInfo): Promise<string> {

  // let's use what we know works well
  let base64Video = ""
  const modelParams: VideoGenerationParams = {
    prompt: prompt,
    lora: video.channel.lora,
    style: video.channel.style
  }

  // let's try to detect the model!
  const model = parseModelName(video.channel.model)

  // TODO: add LaVie

  // all those functions normally have the same signature
  // (p: VideoGenerationParams) => Promise<string>
  const generateVideoWithModel =
    model === "SVD"
    ? generateVideoWithSVD
    : model === "LaVie"
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