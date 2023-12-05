import fs from "node:fs"

import dotenv from "dotenv"
import { Credentials } from "@huggingface/hub"

dotenv.config()

try {
  if (fs.existsSync(".env.local")) {
    const result = dotenv.config({ path: ".env.local" })
    console.log("using .env.local")
    process.env = {
      ...process.env,
      ...result.parsed,
    }
  }
} catch (err) {
  // do nothing
  console.log("using .env")
}


export const adminApiKey = `${process.env.ADMIN_HUGGING_FACE_API_TOKEN || ""}`
export const adminUsername = `${process.env.ADMIN_HUGGING_FACE_USERNAME || ""}`

export const adminCredentials: Credentials = { accessToken: adminApiKey }

export const aiStoryServerApiUrl = `${process.env.AI_STORY_SERVER_API_GRADIO_URL || ""}`
export const apiStoryServerApiToken = `${process.env.AI_STORY_SERVER_API_SECRET_TOKEN || ""}`

export const hfInferenceApiModel = `${process.env.HUGGING_FACE_INFERENCE_API_MODEL || ""}`
export const hfInferenceApiToken = `${process.env.HUGGING_FACE_INFERENCE_API_TOKEN || ""}`

// ------------------------------------------------------------------------------------

// those are only used for debugging during development
// by default (in production) they should be set to false,
// but you can set them to true on your own machine

// set to true to not mark the video as "generating"
// this will make it easier for you to generate the same video queue again and again during development
export const keepVideoInQueue = false

// set to true to not delete the temporary files
// this will make it easier for your to inspect the content of the individual .wav and .mp4 files
export const keepTemporaryFiles = false

// if set to true, a video that has already been published will be re-generated
export const enableRepublishing = true

export const skipProcessingChannels = true

export const skipProcessingQueue = false

// ------------------------------------------------------------------------------------

