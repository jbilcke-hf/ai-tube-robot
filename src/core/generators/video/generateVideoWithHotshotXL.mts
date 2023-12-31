
import { addBase64HeaderToMp4 } from "../../utils/addBase64HeaderToMp4.mts"
import { generateSeed } from "../../utils/generateSeed.mts"

import { getNegativePrompt, getPositivePrompt } from "../../utils/promptUtilities.mts"
import { VideoGenerationParams } from "../../types/video.mts"
import { tryApiCalls } from "../../utils/tryApiCalls.mts"

const gradioApi = `${process.env.AI_TUBE_MODEL_HOTSHOT_XL_GRADIO_URL || ""}`
const accessToken = `${process.env.AI_TUBE_MODEL_HOTSHOT_XL_SECRET_TOKEN || ""}`

// this generates a base64 video
export const generateVideoWithHotshotXL = async ({
  prompt,
  orientation,
  projection,
  width,
  height,
  lora = "",
  style = "",
  seed,
  debug,
}: VideoGenerationParams): Promise<string> => {
  

  const actualFunction = async () => {
    const negPrompt = ""
    prompt = prompt || ""
    seed = seed | generateSeed()
    const nbFrames = 8 // for now the only values that make sense are 1 (for a jpg) or 8 (for a video)
    const videoDuration = 1000 // for now Hotshot doesn't really supports anything else
    const nbSteps = 70 // when rendering a final video, we want a value like 50 or 70 here
  
    const size = projection === "equirectangular" ? "1024x512" : "672x384" // "768x320"

    // pimp the prompt

    // we put it at the start, to make sure it is always part of the prompt
    const positivePrompt = getPositivePrompt([
      style,
      prompt
    ].map(x => x.trim()).filter(x => x).join(", "))

    const negativePrompt = getNegativePrompt(negPrompt)

    try {
      if (debug) {
        console.log(`calling HotshotXL API with params:`, {
          positivePrompt,
          negativePrompt,
          lora,
          size,
          seed,
          nbSteps,
          nbFrames,
          videoDuration,
        })
      }

      const res = await fetch(gradioApi + (gradioApi.endsWith("/") ? "" : "/") + "api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fn_index: 1, // <- important!
          data: [
            accessToken,
            positivePrompt,
            negativePrompt,
            lora,
            size,
            seed,
            nbSteps,
            nbFrames,
            videoDuration,
          ],
        }),
        cache: "no-store",
        // we can also use this (see https://vercel.com/blog/vercel-cache-api-nextjs-cache)
        // next: { revalidate: 1 }
      })


      const { data } = await res.json()
    
      // console.log("data:", data)
      // Recommendation: handle errors
      if (res.status !== 200 || !Array.isArray(data)) {
        // This will activate the closest `error.js` Error Boundary
        throw new Error(`Failed to fetch data (status: ${res.status})`)
      }
      // console.log("data:", data.slice(0, 50))
    
      const base64Content = (data?.[0] || "") as string

      if (!base64Content) {
        throw new Error(`invalid response (no content)`)
      }

      return addBase64HeaderToMp4(base64Content)
    } catch (err) {
      if (debug) {
        console.error(`failed to call the HotshotXL API:`)
        console.error(err)
      }
      throw err
    }
  }

  return tryApiCalls({
    func: actualFunction,
    debug,
    failureMessage: "failed to call the HotshotXL endpoint"
  })
}