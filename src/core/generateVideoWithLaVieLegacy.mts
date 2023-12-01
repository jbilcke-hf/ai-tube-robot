import { generateSeed } from "./generateSeed.mts"


const gradioApi = `${process.env.AI_TUBE_MODEL_LAVIE_GRADIO_URL || ""}`
const accessToken = `${process.env.AI_TUBE_MODEL_LAVIE_SECRET_TOKEN || ""}`

export async function generateVideoWithLaVieLegacy({
  prompt = "",
  // width = 512,
  // height = 320,
  // framesPerSecond = 8,
  // durationInSeconds = 2,
  // steps = 50,
}: {
  prompt?: string
  // width: number
  // height: number
  // framesPerSecond: number
  // durationInSeconds: number
  // steps: number
}): Promise<string> {
  /*
  console.log(`SEND TO ${gradioApi + (gradioApi.endsWith("/") ? "" : "/") + "api/predict"}:`, [
    // accessToken,
    positivePrompt,
    negativePrompt,
    huggingFaceLora,
    size,
    generateSeed(),
    steps,
    nbFrames,
    duration,
  ])
  */
  const res = await fetch(gradioApi + (gradioApi.endsWith("/") ? "" : "/") + "api/infer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      fn_index: 1, // <- important!
      data: [
        accessToken,
        prompt,
        generateSeed(),
        50, // ddim_steps,
        7, // cfg,
        "ddim", // infer_type
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

  return data[0]
}