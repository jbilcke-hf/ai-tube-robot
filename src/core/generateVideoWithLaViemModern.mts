
import { client } from "@gradio/client"

import { generateSeed } from "./generateSeed.mts"

const gradioApi = `${process.env.AI_TUBE_MODEL_LAVIE_GRADIO_URL || ""}`
const accessToken = `${process.env.AI_TUBE_MODEL_LAVIE_SECRET_TOKEN || ""}`

const app = await client("jbilcke-hf/ai-tube-model-lavie", { hf_token: accessToken as any });

export async function generateVideoWithLaVieModern({
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
  const res = await app.predict("/infer", [
    accessToken,
    prompt,
    generateSeed(),
    50, // ddim_steps,
    7, // cfg,
    "ddim", // infer_type
  ])

  console.log("res:", res)

  return ""
}