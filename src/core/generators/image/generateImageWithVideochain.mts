
// note: there is no / at the end in the variable

import { RenderRequest } from "../../types/requests.mts"
import { RenderedScene } from "../../types/structures.mts"
import { addBase64HeaderToPng } from "../../utils/addBase64HeaderToPng.mts"
import { addBase64HeaderToWebp } from "../../utils/addBase64HeaderToWebp.mts"


// so we have to add it ourselves if needed
const apiUrl = `${process.env.AI_TUBE_VIDEOCHAIN_API_URL || ""}`
const secretAccessToken = `${process.env.AI_TUBE_VIDEOCHAIN_API_TOKEN || ""}`

export async function newRender({
  prompt,
  negativePrompt,
  nbFrames,
  nbSteps,
  width,
  height,
  turbo,
  shouldRenewCache,
  seed,
  debug,
}: {
  prompt: string
  negativePrompt: string
  nbFrames: number
  nbSteps: number
  width: number
  height: number
  turbo: boolean
  shouldRenewCache: boolean
  seed?: number
  debug?: boolean
}) {
  if (!prompt) {
    console.error(`cannot call the rendering API without a prompt, aborting..`)
    throw new Error(`cannot call the rendering API without a prompt, aborting..`)
  }

  const cacheKey = `render/${JSON.stringify({ prompt })}`

  // return await Gorgon.get(cacheKey, async () => {

    let defaulResult: RenderedScene = {
      renderId: "",
      status: "error",
      assetUrl: "",
      maskUrl: "",
      error: "failed to fetch the data",
      alt: "",
      segments: []
    }

    try {
      // console.log(`calling POST ${apiUrl}/render with seed ${seed} and prompt: ${prompt}`)

      if (debug) {
        console.log("DEBUG:", {
          url: `${apiUrl}/render`,
          body: {
            prompt,
            negativePrompt,
            // nbFrames: 8 and nbSteps: 15 --> ~10 sec generation
            nbFrames, // when nbFrames is 1, we will only generate static images
            nbSteps, // 20 = fast, 30 = better, 50 = best
            width,
            height,
            seed,
            actionnables: [],
            segmentation: "disabled", // one day we will remove this param, to make it automatic
            upscalingFactor: 1, // let's disable upscaling right now
            turbo, // always use turbo mode (it's for images only anyway)
            // also what could be done iw that we could use the width and height to control this
            cache: shouldRenewCache ? "renew" : "use"
          }
        })
      }
      const res = await fetch(`${apiUrl}/render`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${secretAccessToken}`,
        },
        body: JSON.stringify({
          prompt,
          negativePrompt,
          // nbFrames: 8 and nbSteps: 15 --> ~10 sec generation
          nbFrames, // when nbFrames is 1, we will only generate static images
          nbSteps, // 20 = fast, 30 = better, 50 = best
          width,
          height,
          seed,
          actionnables: [],
          segmentation: "disabled", // one day we will remove this param, to make it automatic
          upscalingFactor: 1, // let's disable upscaling right now
          turbo, // always use turbo mode (it's for images only anyway)
          // also what could be done iw that we could use the width and height to control this
          cache: shouldRenewCache ? "renew" : "use"
        } as Partial<RenderRequest>),
        cache: 'no-store',
      // we can also use this (see https://vercel.com/blog/vercel-cache-api-nextjs-cache)
      // next: { revalidate: 1 }
      })

      // console.log("res:", res)
      // The return value is *not* serialized
      // You can return Date, Map, Set, etc.
      
      // Recommendation: handle errors
      if (res.status !== 200) {
        // This will activate the closest `error.js` Error Boundary
        throw new Error('Failed to fetch data')
      }
      
      const response = (await res.json()) as RenderedScene
      response.assetUrl = addBase64HeaderToWebp(response.assetUrl)
      // console.log("response:", response)
      return response
    } catch (err) {
      // console.error(err)
      // Gorgon.clear(cacheKey)
      return defaulResult
    }
}

export async function getRender(renderId: string) {
  if (!renderId) {
    console.error(`cannot call the rendering API without a renderId, aborting..`)
    throw new Error(`cannot call the rendering API without a renderId, aborting..`)
  }

  let defaulResult: RenderedScene = {
    renderId: "",
    status: "error",
    assetUrl: "",
    maskUrl: "",
    error: "failed to fetch the data",
    alt: "",
    segments: []
  }

  try {
    // console.log(`calling GET ${apiUrl}/render with renderId: ${renderId}`)
    const res = await fetch(`${apiUrl}/render/${renderId}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${secretAccessToken}`,
      },
      cache: 'no-store',
    // we can also use this (see https://vercel.com/blog/vercel-cache-api-nextjs-cache)
    // next: { revalidate: 1 }
    })

    // console.log("res:", res)
    // The return value is *not* serialized
    // You can return Date, Map, Set, etc.
    
    // Recommendation: handle errors
    if (res.status !== 200) {
      // This will activate the closest `error.js` Error Boundary
      throw new Error('Failed to fetch data')
    }
    
    const response = (await res.json()) as RenderedScene
    response.assetUrl = addBase64HeaderToWebp(response.assetUrl)
    // console.log("response:", response)
    return response
  } catch (err) {
    // console.error(err)
    // Gorgon.clear(cacheKey)
    return defaulResult
  }
}