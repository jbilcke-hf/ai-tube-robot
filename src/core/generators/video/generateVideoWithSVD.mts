import { client } from "@gradio/client"

import { generateImageSDXL } from "../image/generateImageWithSDXL.mts"
import { generateSeed } from "../../utils/generateSeed.mts"
import { adminApiKey } from "../../config.mts"
import { getNegativePrompt, getPositivePrompt } from "../../utils/promptUtilities.mts"
import { VideoGenerationParams } from "../../types/video.mts"
import { generateVideoWithSVDFromImage } from "./generateVideoWithSVDFromImage.mts"
import { convertImageToPng } from "../../utils/convertImageToPng.mts"

// this generates a base64 video
export const generateVideoWithSVD = async ({
  prompt,
  image,
  orientation,
  projection,
  width,
  height,
  lora = "",
  style = "",
  seed,
}: VideoGenerationParams): Promise<string> => {
  
  const app = await client("jbilcke-hf/stable-video-diffusion", {
    hf_token: adminApiKey as any,
  })

  prompt = prompt || ""
  seed = seed || generateSeed()

  // console.log({ width, height })

  const positivePrompt = getPositivePrompt([
    style,
    prompt
  ].map(x => x.trim()).filter(x => x).join(", "))

  const negativePrompt = getNegativePrompt("")

  // create an image if it doesn't already exist
  if (!image) {
    // note: this will perform multiple attempts
    image = await generateImageSDXL({
      lora,
      positivePrompt,
      negativePrompt,
      seed,

      // the only resolution that works well for SVD right now
      width: 1024,
      height: 576,

      // yes we are generous here
      nbSteps: 70,

      guidanceScale: 8,
    })
  }

  // unfortunately, SVD doesn't support WebP as input
  // so we convert it first to PNG
  if (image.startsWith('data:image/webp;base64,')) {
    // console.log("converting image to png")
    image = await convertImageToPng(image)
    // console.log("converted image to png")
  }
 
  return generateVideoWithSVDFromImage({
    image,
    width,
    height,
    seed,
    // debug,
  })
}