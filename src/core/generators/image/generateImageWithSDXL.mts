
import { getValidNumber } from "../../parsers/getValidNumber.mts"
import { adminApiKey } from "../../config.mts"
import { generateSeed } from "../../utils/generateSeed.mts";
import { sleep } from "../../utils/sleep.mts";
import { tryApiCalls } from "../../utils/tryApiCalls.mts";


// note: the result will be in base64 uri (jpg to be precise)
// but please don't assume this will stay like that forever,
// try to make your calling code generic (for URLs, URI, JPG, PNG, WEBP..)
export async function generateImageSDXL(options: {
  positivePrompt: string;
  negativePrompt?: string;
  seed?: number;
  width?: number;
  height?: number;
  nbSteps?: number;
  guidanceScale?: number;

  lora?: string;

  debug?: boolean;
}): Promise<string> {

  const positivePrompt = [
    "beautiful photo",
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

    // apparently we were using the same seed since the beginning.. bummer!
    seed: options?.seed || generateSeed(),

    width: getValidNumber(options.width, 256, 1024, 1024),
    height: getValidNumber(options.height, 256, 1024, 1024),
  }

  const actualFunction = async () => {
    if (options.debug) {
      console.log(`calling ${url} with params:`, {
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
    }
  
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",

        // The Hugging Face API ignores this, but maybe one day it does
        // so for now let's use the same hardcoded value as the API (jpeg)
        Accept: "image/jpeg",

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
      if (options.debug) console.error(content)
      // This will activate the closest `error.js` Error Boundary
      throw new Error('Failed to fetch data')
    }
  
    const arrayBuffer = await res.arrayBuffer()
  
    const contentType = res.headers.get('content-type')
  
    const result = `data:${contentType};base64,${Buffer.from(arrayBuffer).toString('base64')}`
    if (result.length < 100) { throw new Error("content too small to be valid, aborting") }
    return result
  }
  
  return tryApiCalls({
    func: actualFunction,
    debug: options.debug,
    failureMessage: "failed to call SDXL endpoint"
  })
}
