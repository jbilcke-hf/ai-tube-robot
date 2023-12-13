import { HfInference } from "@huggingface/inference"


import { getPromptToGenerateAComment } from "../prompts/prompts.mts"
import { createZephyrPrompt } from "./utils/createZephyrPrompt.mts"

export const hfInferenceApiModel = `${process.env.HUGGING_FACE_INFERENCE_API_MODEL || ""}`
export const hfInferenceApiToken = `${process.env.HUGGING_FACE_INFERENCE_API_TOKEN || ""}`

const hf = new HfInference(hfInferenceApiToken)

/**
 * Generate a fake AI Tube comment
 * @param param0 
 * @returns 
 */
export async function generateComment({
  description = "",
  transcript = "",
  neverThrow = false,
}: {

  /**
   * Example: A movie about a bunny soldier doing an emergency landing on an island
   */
  description: string

  /**
   * Example: content of the audio commentary / transcript
   */
  transcript: string

  neverThrow?: boolean
}): Promise<string> {

  const { systemPrompt, userPrompt } = getPromptToGenerateAComment({
    description,
    transcript
  })

  try {
    const inputs = createZephyrPrompt([
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      }
    ])

    const nbMaxNewTokens = 200

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

    const comment = rawBufferString.trim()
    return comment
  } catch (err) {
    if (neverThrow) {
      console.error(`generateComment():`, err)
      return ""
    } else {
      throw err
    }
  }
}