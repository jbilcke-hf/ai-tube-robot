import { client } from "@gradio/client"

import { addBase64HeaderToMp4 } from "../../utils/addBase64HeaderToMp4.mts"
import { generateSeed } from "../../utils/generateSeed.mts"
import { adminApiKey } from "../../config.mts"
import { cropBase64Video } from "../../ffmpeg/cropBase64Video.mts"
import { tryApiCalls } from "../../utils/tryApiCalls.mts"

const accessToken = `${process.env.AI_TUBE_MODEL_SVD_SECRET_TOKEN || ""}`

// this generates a base64 video
export const generateVideoWithSVDFromImage = async ({
  image,
  width,
  height,
  seed,
  debug,
}: {
  image: string
  width: number
  height: number
  seed?: number
  debug?: boolean
}): Promise<string> => {
  
  const actualFunction = async () => {
    const app = await client("jbilcke-hf/stable-video-diffusion", {
      hf_token: adminApiKey as any,
    })

    seed = seed || generateSeed()

    try {
      if (debug) {
        console.log(`sending POST to api.predict /video with params:`, {
          data: [
            "<hidden>", //accessToken.slice(0, 3) + "...", // string  in 'Secret Token' Textbox component
            image.slice(0, 80), 	// blob in 'Upload your image' Image component		
            seed, // number (numeric value between 0 and 9223372036854775807) in 'Seed' Slider component		
            80, // number (numeric value between 1 and 255) in 'Motion bucket id' Slider component		
            8, // number (numeric value between 5 and 30) in 'Frames per second' Slider component		

          ],
        })
      }
      
      const res = await app.predict("/run", [
        accessToken, // string  in 'Secret Token' Textbox component
        image, 	// blob in 'Upload your image' Image component		
        seed, // number (numeric value between 0 and 9223372036854775807) in 'Seed' Slider component	

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

      const widthForSVD = 1024
      const heightForSVD = 576
    
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
      if (debug) {
        console.error(`failed to call the SVD API:`)
        console.error(err)
      }
      throw err
    }
  }

  return tryApiCalls({
    func: actualFunction,
    debug,
    failureMessage: "failed to call the SVD endpoint"
  })
}