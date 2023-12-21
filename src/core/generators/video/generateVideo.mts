
import { VideoGenerationParams, VideoInfo } from "../../../types.mts"

import { parseVideoModelName } from "../../parsers/parseVideoModelName.mts"
import { sleep } from "../../utils/sleep.mts"
import { defaultVideoModel } from "../../config.mts"
import { getVideoLoraAndStyle } from "../../huggingface/utils/getVideoLoraAndStyle.mts"
import { parseProjectionFromLoRA } from "../../parsers/parseProjectionFromLoRA.mts"

import { generateVideoWithLaVie } from "./generateVideoWithLaVie.mts"
import { generateVideoWithHotshotXL } from "./generateVideoWithHotshotXL.mts"
import { generateVideoWithSVD } from "./generateVideoWithSVD.mts"
import { parseVideoOrientation } from "../../parsers/parseVideoOrientation.mts"

export async function generateVideo(prompt: string, video: VideoInfo): Promise<string> {

  // note: this will inject the video custom style too
  const { lora, style } = await getVideoLoraAndStyle(video)
  
  const orientation = parseVideoOrientation(video)
  const projection = parseProjectionFromLoRA(lora)

  // note: LaVie will use an even lower resolution setting (512x320)
  let width = 1024
  let height = 576

  // only HotshotXL is able to handle such a variety of resolutions
  if (video.model === "HotshotXL") {
    if (orientation === "portrait") {
      height = 1024
      width = 576
    } else if (orientation === "square") {
      height = 512
      width = 512
    } else {
      width = 1024
      height = 576
    }
  }

  // let's use what we know works well

  const modelParams: VideoGenerationParams = {
    prompt,
    lora,
    style,
    orientation,
    projection,
    width,
    height
  }

  // now for equirectangular videos we need to have the correct image ratio of 2:1
  if (projection === "equirectangular") {
    width = 1024
    height = 512
  }

  // let's try to detect the model!
  const channelVideoModel = parseVideoModelName(video.channel.model, defaultVideoModel)

  const videoModel = parseVideoModelName(video.model, channelVideoModel)

  // all those functions normally have the same signature
  // (p: VideoGenerationParams) => Promise<string>
  const generateVideoWithModel =
  videoModel === "HotshotXL"
    ? generateVideoWithHotshotXL
    : videoModel === "LaVie"
    ? generateVideoWithLaVie
    : generateVideoWithSVD

  let base64Video = ""

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