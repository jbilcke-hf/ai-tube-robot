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
}) {
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
  ]) + "\n["

  const nbMaxNewTokens = 200

  let instructions = ""
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
      instructions += output.token.text
      // process.stdout.write(output.token.text)
      if (
        instructions.includes("</s>") || 
        instructions.includes("<s>") ||
        instructions.includes("/s>") ||
        instructions.includes("[INST]") ||
        instructions.includes("[/INST]") ||
        instructions.includes("<SYS>") ||
        instructions.includes("<<SYS>>") ||
        instructions.includes("</SYS>") ||
        instructions.includes("<</SYS>>") ||
        instructions.includes("<|user|>") ||
        instructions.includes("<|end|>") ||
        instructions.includes("<|system|>") ||
        instructions.includes("<|assistant|>")
      ) {
        break
      }
    }
  } catch (err) {
    // console.error(`error during generation: ${err}`)

    // a common issue with Llama-2 might be that the model receives too many requests
    if (`${err}` === "Error: Model is overloaded") {
      instructions = ``
    }
  }

  // need to do some cleanup of the garbage the LLM might have gave us
  return (
    instructions
    .replaceAll("<|end|>", "")
    .replaceAll("<s>", "")
    .replaceAll("</s>", "")
    .replaceAll("/s>", "")
    .replaceAll("[INST]", "")
    .replaceAll("[/INST]", "") 
    .replaceAll("<SYS>", "")
    .replaceAll("<<SYS>>", "")
    .replaceAll("</SYS>", "")
    .replaceAll("<</SYS>>", "")
    .replaceAll("<|system|>", "")
    .replaceAll("<|user|>", "")
    .replaceAll("<|all|>", "")
    .replaceAll("<|assistant|>", "")
    .replaceAll('""', '"')
  )
}
