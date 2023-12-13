
import { getValidNumber } from "../../parsers/getValidNumber.mts"
import { adminApiKey } from "../../config.mts"

export async function generateImageSDXL(options: {
  positivePrompt: string;
  negativePrompt?: string;
  seed?: number;
  width?: number;
  height?: number;
  nbSteps?: number;
  guidanceScale?: number;

  lora?: string;
}): Promise<string> {

  const positivePrompt = [
    "beautiful",
    // "intricate details",
    options?.positivePrompt || "",
    "award winning",
    "high resolution"
  ].filter(x => x).join(", ")

  // console.log("positivePrompt:", positivePrompt)

  const huggingfaceInferenceApiModel = options?.lora || "stabilityai/stable-diffusion-xl-base-1.0" // "jbilcke-hf/sdxl-cinematic-2"

  const url = `https://api-inference.huggingface.co/models/${huggingfaceInferenceApiModel}`
  
  const parameters = {
    num_inference_steps: getValidNumber(options.nbSteps, 1, 100, 50),
    negative_prompt: options?.negativePrompt || "",
    guidance_scale: getValidNumber(options.guidanceScale, 0, 20, 8),
    // seed: options?.seed || generateSeed(),
    width: getValidNumber(options.width, 256, 1024, 1024),
    height: getValidNumber(options.height, 256, 1024, 1024),
  }
  // console.log(`calling ${url} with params:`, parameters)

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "image/png",
      Authorization: `Bearer ${adminApiKey}`,
    },
    body: JSON.stringify({
      inputs: positivePrompt,
      parameters,

      // this doesn't do what you think it does
      use_cache: false, // withCache,
    }),
    cache: "no-store",
    // we can also use this (see https://vercel.com/blog/vercel-cache-api-nextjs-cache)
    // next: { revalidate: 1 }
  })


  // Recommendation: handle errors
  if (res.status !== 200) {
    const content = await res.text()
    console.error(content)
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data')
  }

  const arrayBuffer = await res.arrayBuffer()

  const contentType = res.headers.get('content-type')

  let assetUrl = `data:${contentType};base64,${Buffer.from(arrayBuffer).toString('base64')}`

  return assetUrl
}
