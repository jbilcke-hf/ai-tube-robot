import { client } from "@gradio/client"

import { adminApiKey } from "../../config.mts"
import { addBase64HeaderToPng } from "../../utils/addBase64HeaderToPng.mts"
import { tryApiCalls } from "../../utils/tryApiCalls.mts"
import { UpscaleImageParams } from "../../types/structures.mts"

/**
 * Generatean image (warning: this uses SD 1.5, so resolutions > 512 might not work as expected
 * @param param0 
 * @returns 
 */
export async function upscaleImageWithPasd({
  imageAsBase64,
  prompt = "",
  scaleFactor = 2,
  debug = false,
}: UpscaleImageParams) {

  const actualFunction = async () => {
    try {
      const app = await client(
        "jbilcke-hf/image-upscaling-pasd-server",
        { hf_token: adminApiKey as any }
      );

      const addedPrompt = [
        "clean",
        "high-resolution",
        "8k",
        "best quality",
        "masterpiece",
        "crisp",
        "sharp",
        "intricate details"
      ].join(", ")
      
      const negativePrompt = [
        "pixelated",
        "pixels",
        "noise",
        "blur",
        "motion blur",
        "lowres",
        "oversmooth",
        "longbody",
        "bad anatomy",
        "bad hands",
        "missing fingers",
        "extra digit",
        "fewer digits",
        "cropped",
        "worst quality",
        "low quality",
        "artificial",
        "unrealistic",
        "watermark",
        "trademark",
        "error",
        "mistake"
      ].join(", ")

      const nbDenoiseSteps = 35
      const conditioningScale = 1.4
      const classifierFreeGuidance = 9.5
      const seed = -1

      const res = await app.predict("/inference", [
        imageAsBase64, 	// blob in 'parameter_5' Image component		
				prompt, // string  in 'Prompt' Textbox component		
				addedPrompt, // string  in 'Added Prompt' Textbox component		
				negativePrompt, // string  in 'Negative Prompt' Textbox component		
				nbDenoiseSteps, // number (numeric value between 10 and 50) in 'Denoise Steps' Slider component		
				scaleFactor, // number (numeric value between 1 and 4) in 'Upsample Scale' Slider component		
				conditioningScale, // number (numeric value between 0.5 and 1.5) in 'Conditioning Scale' Slider component		
				classifierFreeGuidance, // number (numeric value between 0.1 and 10.0) in 'Classier-free Guidance' Slider component		
				seed, // number (numeric value between -1 and 2147483647) in 'Seed' Slider component
      ]) as { data: string[] }

      const base64Content = res?.data?.[0] || ""

      if (!base64Content) {
        throw new Error(`invalid response (no content)`)
      }

      return addBase64HeaderToPng(base64Content)
    } catch (err) {
      if (debug) {
        console.error(err)
      }
      throw new Error("failed to generate the image (check IP Adapter endpoint logs)")
    }
  }

  return tryApiCalls({
    func: actualFunction,
    debug,
    failureMessage: "failed to generate the image (check IP Adapter endpoint logs)"
  })
}