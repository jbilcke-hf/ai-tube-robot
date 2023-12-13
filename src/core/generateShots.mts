import { HfInference } from "@huggingface/inference"

import { createZephyrPrompt } from "./createZephyrPrompt.mts"
import { promptToGenerateShots } from "./prompts.mts"


export const hfInferenceApiModel = `${process.env.HUGGING_FACE_INFERENCE_API_MODEL || ""}`
export const hfInferenceApiToken = `${process.env.HUGGING_FACE_INFERENCE_API_TOKEN || ""}`

const hf = new HfInference(hfInferenceApiToken)

export async function generateShots({
  generalContext = "",
  generalStyle = "",
  previousScenes = "",
  currentScene = "",
  neverThrow = false,
}: {

  /**
   * Example: A movie about a bunny soldier doing an emergency landing on an island
   */
  generalContext: string

  /**
   * Example: 3D rendered, cute, beautiful
   */
  generalStyle: string

  /**
   * Example: Our poor little bunny wakes up on the beach, wondering what happened. He removes the sand off himself, and stands up.
   */
  previousScenes: string

  /**
   * Example: "I'm so hungry.. I need to find food." says the bunny, as he adventures himself into the jungle.
   */
  currentScene: string

  neverThrow?: boolean
}): Promise<string[]> {
  try {
    const inputs = createZephyrPrompt([
      {
        role: "system",
        content: promptToGenerateShots,
      },
      {
        role: "user",
        content: JSON.stringify({
          generalContext,
          generalStyle,
          previousScenes,
          currentScene,
        },null, 2),
      }
    ]) //+ "\n["

    const nbMaxNewTokens = 600

    let rawBufferString = ""
    try {
      for await (const output of hf.textGenerationStream({
        model: hfInferenceApiModel,
        inputs,
        parameters: {
          do_sample: true,
          max_new_tokens: nbMaxNewTokens,
          return_full_text: false,
        }
      })) {
        rawBufferString += output.token.text
        // process.stdout.write(output.token.text)
        if (
          rawBufferString.includes("</s>") || 
          rawBufferString.includes("<s>") ||
          rawBufferString.includes("/s>") ||
          rawBufferString.includes("[INST]") ||
          rawBufferString.includes("[/INST]") ||
          rawBufferString.includes("<SYS>") ||
          rawBufferString.includes("<<SYS>>") ||
          rawBufferString.includes("</SYS>") ||
          rawBufferString.includes("<</SYS>>") ||
          rawBufferString.includes("<|user|>") ||
          rawBufferString.includes("<|end|>") ||
          rawBufferString.includes("<|system|>") ||
          rawBufferString.includes("<|assistant|>")
        ) {
          break
        }
      }
    } catch (err) {
      // console.error(`error during generation: ${err}`)

      if (`${err}` === "Error: Model is overloaded") {
        rawBufferString = ``
      }
    }

    const lines = rawBufferString.split("\n")
      .filter(line => line.trim())
      .filter(line => line.match(/[!?.]+$/))

    return lines
  } catch (err) {
    if (neverThrow) {
      console.error(`generateShots():`, err)
      return []
    } else {
      throw err
    }
  }
}