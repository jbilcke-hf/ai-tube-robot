import fs from "node:fs"

import dotenv from "dotenv"
import { Credentials } from "@huggingface/hub"
import { VideoGenerationModel } from "./types.mts"

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

// TODO: switch to SVD
export const defaultVideoModel: VideoGenerationModel = "SVD"

export const aiStoryServerApiUrl = `${process.env.AI_STORY_SERVER_API_GRADIO_URL || ""}`
export const apiStoryServerApiToken = `${process.env.AI_STORY_SERVER_API_SECRET_TOKEN || ""}`

export const hfInferenceApiModel = `${process.env.HUGGING_FACE_INFERENCE_API_MODEL || ""}`
export const hfInferenceApiToken = `${process.env.HUGGING_FACE_INFERENCE_API_TOKEN || ""}`

// ------------------------------------------------------------------------------------

// those are only used for debugging during development
// by default (in production) they should be set to false,
// but you can set them to true on your own machine

// if set to true, a video that has already been published will be re-generated
// be careful if you switch it to true!
// the usecase for doing so is that if you want to upgrade ALL the videos of the
// platform to a specific format or feature
//
// ATTENTION! if you enable it for a mass upgrade, you will want to set:
// skipThumbnailGeneration = true
// to avoid re-generating all the thumbnails (well, unless you WANT to regenerate them)
export const enableRepublishing = false

// set to true to not mark the video as "generating"
// this will make it easier for you to generate the same video queue again and again during development
export const keepVideoInQueue = false

// to disable thumbnails - in production, leave it to false!
// but locally we want to disable this (if working)
export const skipThumbnailGeneration = false

// set to true to not delete the temporary files
// this will make it easier for your to inspect the content of the individual .wav and .mp4 files
export const keepTemporaryFiles = false

export const skipProcessingChannels = false

export const skipProcessingQueue = false

// to avoid waiting for hours to test a new feature (eg. an AI model),
// we use the priority system to quicky iterate on the videos of core developers
export const priorityAccounts = [
  "jbilcke-hf"
]

export const skipLowPriorityAccounts = true

// users whose content is banned, but their Hugging Face account has not been disabled
// as the platform grows in popularity, it may be necessary to filter out bad actors
// trying to hijack the public "latest content" page
export const bannedAccounts = [
  // good news! nobody is there.. yet.
]

// ------------------------------------------------------------------------------------

