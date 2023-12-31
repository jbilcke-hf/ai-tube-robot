
import { client } from "@gradio/client"

import { addBase64HeaderToMp4 } from "../../utils/addBase64HeaderToMp4.mts"
import { adminApiKey } from "../../config.mts"
import { getPositivePrompt } from "../../utils/promptUtilities.mts"
import { VideoGenerationParams } from "../../types/video.mts"
import { tryApiCalls } from "../../utils/tryApiCalls.mts"

const accessToken = `${process.env.AI_TUBE_MODEL_LAVIE_SECRET_TOKEN || ""}`

export async function generateVideoWithLaVie({
  prompt = "",
  orientation,
  projection,
  width,
  height,
  lora = "",
  style = "",
  // width = 512,
  // height = 320,
  // framesPerSecond = 8,
  // durationInSeconds = 2,
  // steps = 50,
  seed,
  debug,
}: VideoGenerationParams): Promise<string> {

  const actualFunction = async () => {
    const app = await client("jbilcke-hf/ai-tube-model-lavie", { hf_token: adminApiKey as any });
    
    prompt = prompt || ""

    const positivePrompt = getPositivePrompt([
      style,
      prompt
    ].map(x => x.trim()).filter(x => x).join(", "))
    
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

    const res = await app.predict("/run", [
      accessToken,
      positivePrompt,
      // generateSeed(),
      // 50, // ddim_steps,
      // 7, // cfg,
      // "ddim", // infer_type
    ]) as { data: string[] }

    const base64Content = res?.data?.[0] || ""

    if (!base64Content) {
      throw new Error(`invalid response (no content)`)
    }

    return addBase64HeaderToMp4(base64Content)
  }

  return tryApiCalls({
    func: actualFunction,
    debug,
    failureMessage: "failed to call the LaVie endpoint"
  })
}