
import { UpscaleImageParams } from "../../types/structures.mts"
import { tryApiCalls } from "../../utils/tryApiCalls.mts"

import { upscaleImageWithEsgran } from "./upscaleImageWithEsrgan.mts"
import { upscaleImageWithSdx4 } from "./upscaleImageWithSdx4.mts"
import { upscaleImageWithPasd } from "./upscaleImageWithPasd.mts"

type ImageUpscaler =
  | "ESRGAN"
  | "SDX4"
  | "PASD"

export async function upscaleImage(params: UpscaleImageParams, upscalerType: ImageUpscaler = "SDX4"): Promise<string> {
  // for now this is just a matter of taste, they both give different results
  const upscale = upscalerType === "ESRGAN"
  ? upscaleImageWithEsgran
  : upscalerType === "SDX4"
  ? upscaleImageWithSdx4
  : upscaleImageWithPasd

  return tryApiCalls({
    func: async () => upscale(params),
    debug: true,
    failureMessage: "failed to call the image upscaling endpoint"
  })
}
