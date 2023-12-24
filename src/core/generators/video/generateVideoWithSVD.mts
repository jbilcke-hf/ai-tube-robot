import { client } from "@gradio/client"

import { VideoGenerationParams } from "../../../types.mts"
import { addBase64HeaderToMp4 } from "../../utils/addBase64HeaderToMp4.mts"
import { generateImageSDXL } from "../image/generateImageWithSDXL.mts"
import { generateSeed } from "../../utils/generateSeed.mts"
import { adminApiKey } from "../../config.mts"
import { getNegativePrompt, getPositivePrompt } from "../../utils/promptUtilities.mts"
import { cropBase64Video } from "../../ffmpeg/cropBase64Video.mts"
import { sleep } from "../../utils/sleep.mts"

const accessToken = `${process.env.AI_TUBE_MODEL_SVD_SECRET_TOKEN || ""}`

// this generates a base64 video
export const generateVideoWithSVD = async ({
  prompt,
  orientation,
  projection,
  width,
  height,
  lora = "",
  style = "",
}: VideoGenerationParams): Promise<string> => {
  
  const app = await client("jbilcke-hf/stable-video-diffusion", {
    hf_token: adminApiKey as any,
  })

  const videoSeed = generateSeed()
  const imageSeed = generateSeed()

  // console.log({ width, height })

  const widthForSVD = 1024
  const heightForSVD = 576

  const positivePrompt = getPositivePrompt([
    style,
    prompt
  ].map(x => x.trim()).filter(x => x).join(", "))

  const negativePrompt = getNegativePrompt("")
  try {
    // console.log(`calling SDXL..`)

    // TODO: generate a SDXL image using a lora!
    let image = ""
    
    try {
      image = await generateImageSDXL({
        lora,
        positivePrompt,
        negativePrompt,
        seed: imageSeed,
        width: widthForSVD,
        height: heightForSVD,
        nbSteps: 70,
        guidanceScale: 8,
      })
    } catch (err) {
      // SDXL using the Inference API sometimes throw an error due to various factors,
      // (unavailable GPU, it reboots, timeout, network latency etc)
      // so we need to force our way in
      await sleep(60000)
      image = await generateImageSDXL({
        lora,
        positivePrompt,
        negativePrompt: negativePrompt + ", defects",
        seed:  generateSeed(),
        width: widthForSVD,
        height: heightForSVD,
        nbSteps: 70,
        guidanceScale: 8,
      })
    }

    /*
    console.log("generated an image with:", {
      lora,
      positivePrompt,
      negativePrompt,
      seed: imageSeed,
      width: widthForSVD,
      height: heightForSVD,
      nbSteps: 70,
      guidanceScale: 8,
    })
    */
   
    // console.log(`calling SVD..`)

  
    /*
    console.log(`sending POST to api.predict /video with params:`, {
      data: [
        "<hidden>", //accessToken.slice(0, 3) + "...", // string  in 'Secret Token' Textbox component
        image.slice(0, 80), 	// blob in 'Upload your image' Image component		
        videoSeed, // number (numeric value between 0 and 9223372036854775807) in 'Seed' Slider component		
        80, // number (numeric value between 1 and 255) in 'Motion bucket id' Slider component		
        8, // number (numeric value between 5 and 30) in 'Frames per second' Slider component		

      ],
    })
    */
  

    const res = await app.predict("/run", [
      accessToken, // string  in 'Secret Token' Textbox component
      image, 	// blob in 'Upload your image' Image component		
      videoSeed, // number (numeric value between 0 and 9223372036854775807) in 'Seed' Slider component	

      // tried 117 but it seems a bit too "shaky"
      // so let's try 90
      80, // number (numeric value between 1 and 255) in 'Motion bucket id' Slider component
    
      8, // number (numeric value between 5 and 30) in 'Frames per second' Slider component		
    ]) as { data: string[] }
     
    const base64Content = res?.data?.[0] || ""

    if (!base64Content) {
      throw new Error(`invalid response (no content)`)
    }
    
    const base64Video = addBase64HeaderToMp4(base64Content)

    // we need to cut into the video
    if (width < widthForSVD || height < heightForSVD) {
      const croppedBase64Content = await cropBase64Video({
        base64Video,
        width,
        height
      })

      const croppedBase64Video = addBase64HeaderToMp4(croppedBase64Content)

      return croppedBase64Video
    }

    return base64Video
  } catch (err) {
    console.error(`failed to call the SVD API:`)
    console.error(err)
    throw err
  }
}