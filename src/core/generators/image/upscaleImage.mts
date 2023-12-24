import { UpscaleImageParams } from "../../../types.mts";
import { sleep } from "../../utils/sleep.mts";

import { upscaleImageWithEsgran } from "./upscaleImageWithEsrgan.mts";
import { upscaleImageWithSdx4 } from "./upscaleImageWithSDx4.mts";

type ImageUpscaler =
  | "ESRGAN"
  | "SDX4"

export async function upscaleImage(params: UpscaleImageParams, upscalerType: ImageUpscaler = "SDX4"): Promise<string> {
  // for now this is just a matter of taste, they both give different results
  const upscale = upscalerType === "ESRGAN"
  ? upscaleImageWithEsgran
  : upscaleImageWithSdx4

  let upscaledImageInBase64 = ""
  try {
  upscaledImageInBase64 = await upscale(params)
  } catch (err) {
    console.log(" - failed attempt 1/3 at upscaling the image, retrying in one minute..", err)
    await sleep(60000)
    try {
      upscaledImageInBase64 = await upscale(params)
     } catch (err) {
      console.log(" - failed attempt 2/3 at upscaling the image, retrying in 2 minutes..", err)
      await sleep(120000)
      try {
        upscaledImageInBase64 = await upscale(params)
       } catch (err) {
        console.log(" - failed attempt 3/3 at upscaling the image, aborting..", err)
        throw new Error(`failed to upscale image (probably a gradio error: ${err})`)
      }
    }
  }

  return upscaledImageInBase64
}
