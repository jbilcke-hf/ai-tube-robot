
import { client } from "@gradio/client"

import { adminApiKey } from "../config.mts"
import { MusicGenerationParams } from "../types.mts"
import { addBase64HeaderToWav } from "./addBase64HeaderToWav.mts"

const accessToken = `${process.env.AI_TUBE_MODEL_MUSICGEN_SECRET_TOKEN || ""}`

// this generates a base64 audio
export const generateMusicWithMusicgen = async ({
  prompt,
  durationInSec,
}: MusicGenerationParams): Promise<string> => {

  try {

    // console.log(`calling Musicgen API with params:`, { prompt })

    const app = await client("jbilcke-hf/ai-tube-model-musicgen", { hf_token: adminApiKey as any });

    const res = await app.predict("/run", [
      accessToken, // string  in 'Secret Token' Textbox component		
      "facebook/musicgen-stereo-large", // string  in 'Model' Radio component		
      "", // string  in 'Model Path (custom models)' Textbox component	
      
      // can be one of Default or MultiBand_Diffusion
      // since speed isn't an issue for AI Tube,
      // we can afford to use the MultiBand Decoder
      "MultiBand_Diffusion", // "Default",

      prompt, // string  in 'Input Text' Textbox component
      null, 	// blob in 'File' Audio component		
      durationInSec, // number (numeric value between 1 and 300) in 'Duration' Slider component		
      250, // number  in 'Top-k' Number component		
      0, // number  in 'Top-p' Number component		
      1, // number  in 'Temperature' Number component		
      3, // number  in 'Classifier Free Guidance' Number component
    ]) as { data: string[] }

    const base64Content = res?.data?.[0] || ""

    if (!base64Content) {
      throw new Error(`invalid response (no content)`)
    }

    return addBase64HeaderToWav(base64Content)
  } catch (err) {
    console.error(`failed to call the Musicgen API:`)
    console.error(err)
    throw err
  }
}