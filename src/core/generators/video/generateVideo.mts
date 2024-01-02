import { parseVideoModelName } from "../../parsers/parseVideoModelName.mts"
import { defaultVideoModel } from "../../config.mts"
import { getVideoLoraAndStyle } from "../../huggingface/utils/getVideoLoraAndStyle.mts"
import { parseProjectionFromLoRA } from "../../parsers/parseProjectionFromLoRA.mts"

import { generateVideoWithLaVie } from "./generateVideoWithLaVie.mts"
import { generateVideoWithHotshotXL } from "./generateVideoWithHotshotXL.mts"
import { generateVideoWithSVD } from "./generateVideoWithSVD.mts"
import { parseVideoOrientation } from "../../parsers/parseVideoOrientation.mts"
import { VideoGenerationParams, VideoInfo } from "../../types/video.mts"
import { generateSeed } from "../../utils/generateSeed.mts"

export async function generateVideo({
  prompt,
  image,
  video,
  seed,
}: {
  prompt?: string
  image?: string
  video: VideoInfo
  seed?: number
}): Promise<string> {

  prompt = prompt || ""
  image = image || ""

  if (!prompt && !image) {
    throw new Error("cannot generate a video without a prompt and/or an image")
  }

  if (image.length && image.length < 200) {
    throw new Error("you have provided an image which appears too small to be usable")
  }

  // note: this will inject the video custom style too
  const { lora, style } = await getVideoLoraAndStyle(video)
  
  const orientation = parseVideoOrientation(video)
  const projection = parseProjectionFromLoRA(lora)

  seed = seed || generateSeed()
  
  // note: LaVie will use an even lower resolution setting (512x320)
  let width = 1024
  let height = 576

  // only hotshot supports vertical videos for now
  if (orientation !== "landscape") {
    video.model = "HotshotXL"
  }

  // only HotshotXL is able to handle such a variety of resolutions
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

  // let's use what we know works well

  const modelParams: VideoGenerationParams = {
    prompt,
    image,
    lora,
    style,
    orientation,
    projection,
    width,
    height,
    seed,
    debug: false,
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

  // note: each of those underlying video generators will do their best to try the request multiple times
  const base64Video = await generateVideoWithModel(modelParams)
 
  if (!base64Video.length || base64Video.length < 200) {
    return ""
  }

  return base64Video
}