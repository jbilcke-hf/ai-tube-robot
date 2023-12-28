import { HfInference } from "@huggingface/inference"

import { adminApiKey } from "../../config.mts"
import { UpscaleImageParams } from "../../types/structures.mts"

const hf = new HfInference(adminApiKey)

export async function upscaleImageWithSdx4({
  imageAsBase64,
  prompt = "",
  scaleFactor = 4 // it doesn't matter with this upscaler, it is always x4
}: UpscaleImageParams): Promise<string> {

   // Regular expression to extract the MIME type and the base64 data
   const matches = imageAsBase64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/)

  if (!matches || matches.length !== 3) {
    throw new Error("Invalid base64 string")
  }

  const base64Data = matches[2]
  const buffer = Buffer.from(base64Data, "base64")
  const inputs = new Blob([buffer])

  const res = await hf.imageToImage({
    model: "radames/stable-diffusion-x4-upscaler-img2img",
    inputs,
    parameters: {
      prompt,

      // "In addition to the textual input, it receives a noise_level as an input parameter,
      // which can be used to add noise to the low-resolution input 
      // according to a predefined diffusion schedule."
      // noise_level: ....,

    }
  }, {
    retry_on_error: true,
    use_cache: false,
    use_gpu: true,
    wait_for_model: true,
    dont_load_model: false,
  })

  const arrayBuffer = await res.arrayBuffer()

  const contentType = "image/jpg"

  let assetUrl = `data:${contentType};base64,${Buffer.from(arrayBuffer).toString('base64')}`

  console.log("DEBUG:", assetUrl.slice(0, 120))

  return assetUrl
}
