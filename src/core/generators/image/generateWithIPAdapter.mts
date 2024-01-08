import { client } from "@gradio/client"

import { adminApiKey } from "../../config.mts"
import { addBase64HeaderToPng } from "../../utils/addBase64HeaderToPng.mts"
import { tryApiCalls } from "../../utils/tryApiCalls.mts"

/**
 * Generatean image (warning: this uses SD 1.5, so resolutions > 512 might not work as expected
 * @param param0 
 * @returns 
 */
export async function generateWithIPAdapter({ referenceImage, prompt, width, height, nbSteps, debug }: {
  referenceImage: string
  prompt: string
  nbSteps: number
  width: number
  height: number
  debug?: boolean
}) {

  const actualFunction = async () => {
    try {
      const app = await client(
        "jbilcke-hf/ip-adapter-server",
        { hf_token: adminApiKey as any }
      );
      
      const negativePrompt = "deformed, bad hands, cropped"

      const res = await app.predict(0, [
        referenceImage, 	// blob in 'Drag 1 or more photos of your face' File component		
        prompt, // string  in 'Prompt' Textbox component		
        negativePrompt, // string  in 'Negative Prompt' Textbox component		
        true, // boolean  in 'Preserve Face Structure' Checkbox component		
        1.3, // number (numeric value between 0 and 3) in 'Face Structure strength' Slider component		
        1, // number (numeric value between 0 and 5) in 'Face Embed strength' Slider component		
        "", // string  in 'Appended Negative Prompts' Textbox component
        nbSteps, // number of steps
        width, // width
        height, // height
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