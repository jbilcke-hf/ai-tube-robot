import { client } from "@gradio/client"

import { VideoGenerationParams } from "../types.mts"
import { addBase64HeaderToMp4 } from "./addBase64HeaderToMp4.mts"
import { generateImageSDXL } from "./generateImageWithSDXL.mts"
import { generateSeed } from "./generateSeed.mts"
import { getSDXLModel } from "./getSDXLModel.mts"
import { adminApiKey } from "../config.mts"

const accessToken = `${process.env.AI_TUBE_MODEL_SVD_SECRET_TOKEN || ""}`

// this generates a base64 video
export const generateVideoWithSVD = async ({
  prompt,
  lora = "",
  style = ""
}: VideoGenerationParams): Promise<string> => {
  
  const app = await client("jbilcke-hf/stable-video-diffusion", {
    hf_token: adminApiKey as any,
  })

  const videoSeed = generateSeed()
  const imageSeed = generateSeed()

  // for jbilcke-hf/sdxl-cinematic-2 it is "cinematic-2"
  let triggerWord = "cinematic-2"
  let huggingFaceLora = "jbilcke-hf/sdxl-cinematic-2"
  
  lora = `${lora || ""}`.trim()
  style = `${style || ""}`.trim()

  if (lora) {
    huggingFaceLora = lora
    if (style) {
      triggerWord = style
    } else {
      try {
        const model = await getSDXLModel(lora)
        triggerWord = model.trigger_word
      } catch (err) {
        console.error(`user tried to use lora model ${lora} without a style/trigger parameter, but we couldn't find it ourselves`)
        triggerWord = ""
      }
    }
  }
  

  try {
    console.log(`calling SDXL..`)

    // TODO: generate a SDXL image using a lora!
    const image = await generateImageSDXL({
      loraModelName: huggingFaceLora,
      positivePrompt: prompt,
      negativePrompt: "",
      trigger: triggerWord,
      seed: imageSeed,
      width: 1024,
      height: 576, // <-- important, to improve alignment with SVD
      nbSteps: 70,
      guidanceScale: 8,
    })

   
    console.log(`calling SVD..`)

    console.log(`sending POST to api.predict /video with params:`, {
      data: [
        image.slice(0, 80), 	// blob in 'Upload your image' Image component		
        videoSeed, // number (numeric value between 0 and 9223372036854775807) in 'Seed' Slider component		
        50, // number (numeric value between 1 and 255) in 'Motion bucket id' Slider component		
        8, // number (numeric value between 5 and 30) in 'Frames per second' Slider component		
        accessToken.slice(0, 3) + "...", // string  in 'Secret Token' Textbox component
      ],
    })

    const res = await app.predict("/run", [
      accessToken, // string  in 'Secret Token' Textbox component
      image, 	// blob in 'Upload your image' Image component		
      videoSeed, // number (numeric value between 0 and 9223372036854775807) in 'Seed' Slider component		
      117, // number (numeric value between 1 and 255) in 'Motion bucket id' Slider component		
      8, // number (numeric value between 5 and 30) in 'Frames per second' Slider component		
    ]) as { data: string[] }
     
    const base64Content = res?.data?.[0] || ""

    if (!base64Content) {
      throw new Error(`invalid response (no content)`)
    }
    
    return addBase64HeaderToMp4(base64Content)
  } catch (err) {
    console.error(`failed to call the SVD API:`)
    console.error(err)
    throw err
  }
}