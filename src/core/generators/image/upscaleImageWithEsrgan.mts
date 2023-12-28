
import { client } from "@gradio/client"

import { getValidNumber } from "../../parsers/getValidNumber.mts"
import { UpscaleImageParams } from "../../types/structures.mts"

const gradioApi = `${process.env.IMAGE_UPSCALING_API_GRADIO_URL || ""}`
const accessToken = `${process.env.AUTH_IMAGE_UPSCALING_API_GRADIO_TOKEN || ""}`

// this doesn't work because of this error.. I think the version of Gradio is too old/young?
// ReferenceError: addEventListener is not defined
//    at file:///Users/jbilcke/Projects/VideoChain-API/node_modules/@gradio/client/dist/index.js:551:15
//    at processTicksAndRejections (node:internal/process/task_queues:95:5)
export async function upscaleImageWithEsgran({
  imageAsBase64,
  prompt = "",
  scaleFactor: proposedScaleFactor
}: UpscaleImageParams) {

  // by default we do a 2X scale
  // VideoQuest will use 4X
  // 4 is really the max/limit, as this can generate PNGs of 50 Mb..
  const scaleFactor = getValidNumber(proposedScaleFactor, 0, 4, 2)

  if (scaleFactor < 2) {
    return imageAsBase64
  }
  
  const api = await client(gradioApi, {
    hf_token: `${process.env.VC_HF_API_TOKEN}` as any
  })
  
  const result = await api.predict("/upscale", [
    accessToken,
    imageAsBase64, 	// blob in 'Source Image' Image component		
    "realesr-general-x4v3", // string (Option from: ['RealESRGAN_x4plus', 'RealESRNet_x4plus', 'RealESRGAN_x4plus_anime_6B', 'RealESRGAN_x2plus', 'realesr-general-x4v3']) in 'Real-ESRGAN inference model to be used' Dropdown component		
    0.5, // number (numeric value between 0 and 1) in 'Denoise Strength (Used only with the realesr-general-x4v3 model)' Slider component		
    false, // boolean  in 'Face Enhancement using GFPGAN (Doesn't work for anime images)' Checkbox component		
    scaleFactor, // number (numeric value between 1 and 10) in 'Image Upscaling Factor' Slider component
]);

  const rawResponse = result as any 

  // console.log("rawResponse:", rawResponse)
  
  const output = rawResponse?.data?.[0] as string

  if (!output || typeof output !== "string" || output.length < 120) {
    throw new Error(`faild to upscale the image (invalid output)`)
  }

  return output
}
