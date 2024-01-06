import fs from "node:fs"

import dotenv from "dotenv"
import { Credentials } from "@huggingface/hub"

import { VideoGenerationModel, VideoOrientation } from "./types/atoms.mts"

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


export type RobotRole = "GENERATE" | "UPSCALE"
export const robotRole = (
  `${process.env.AI_TUBE_ROBOT_ROLE || "GENERATE"}` === "UPSCALE"
  ? "UPSCALE"
  : "GENERATE"
) as RobotRole

export const adminApiKey = `${process.env.ADMIN_HUGGING_FACE_API_TOKEN || ""}`
export const adminUsername = `${process.env.ADMIN_HUGGING_FACE_USERNAME || ""}`

export const testUserApiKey = `${process.env.TEST_USER_HUGGING_FACE_API_TOKEN || ""}`
export const testUserUsername = `${process.env.TEST_USER_HUGGING_FACE_USERNAME || ""}`

export const adminCredentials: Credentials = { accessToken: adminApiKey }

export const defaultVideoModel: VideoGenerationModel = "SVD"
export const defaultVideoOrientation: VideoOrientation = "landscape"
export const defaultVoice = "Julian"

export const aiStoryServerApiUrl = `${process.env.AI_STORY_SERVER_API_GRADIO_URL || ""}`
export const apiStoryServerApiToken = `${process.env.AI_STORY_SERVER_API_SECRET_TOKEN || ""}`

export const hfInferenceApiModel = `${process.env.HUGGING_FACE_INFERENCE_API_MODEL || ""}`
export const hfInferenceApiToken = `${process.env.HUGGING_FACE_INFERENCE_API_TOKEN || ""}`

// ------------------------------------------------------------------------------------

// those are only used for debugging during development
// by default (in production) they should be set to false,
// but you can set them to true on your own machine


// this is probably the only thing you need to set to true while developping
// this will reduce the length fo the video to about 3 secs
export const quickTestAndDryRun = true

// this one is useful too: set to tru to re-generate the index queue
export const regenerateTheIndexQueueAndThatsAll = false


// by default, when someone changes their video request title, prompt etc..
// then the video will be re-generated
// this can be disabled by setting the following setting to "true"
export const ignoreChangesMadeToVideoRequests = true

// this is used for debugging clap files
// if set to true, this will ignore previews (image files) that are already completed, and generate them again
export const clapConfigForceRerenderingAllModels = false

// this is used for debugging clap files
// if set to true, this will ignore previews (image files) that are already completed, and generate them again
export const clapConfigForceRerenderingAllPreviews = false

// this is used for debugging clap files
// if set to true, this will ignore renders (video files) that are already completed, and generate them again
export const clapConfigForceRerenderingAllRenders = false

// this is used for debugging clap files
// if set to true, this will ignore dialogues (audio files) that are already completed, and generate them again
export const clapConfigForceRerenderingAllDialogues = true

// this is used for debugging clap files
// if set to true, this will use the "turbo" mode which is fast
// but speed isn't an issue when on server-side, so..
export const clapConfigUseTurboMode = true

// set to true to not mark the video as "generating"
// this will make it easier for you to generate the same video queue again and again during development
export const keepVideoInQueue = quickTestAndDryRun ? true : false

// to disable thumbnails - in production, leave it to false!
// but locally we want to disable this (if working)
export const skipThumbnailGeneration = false

// set to something like 2 or 1 during debugging!
// otherwise please pick a large value, such as 40
export const nbMaxScenes = quickTestAndDryRun ? 1 : 45

// same here, pick a large value in production, and a small value to do a quick local test
export const nbMaxShots = quickTestAndDryRun ? 1 : 45

// set to true to not delete the temporary files
// this will make it easier for your to inspect the content of the individual .wav and .mp4 files
// WARNING: we have a bug actually, where deleting tmp files crashed everything!
//  |- concatenating audio + videos
// main(): failed to process: Error: ENOENT: no such file or directory, unlink ''
// so let's keep them for now.. 💀
export const keepTemporaryFiles = true

// sometimes we want fine control over the queue,
// so we deploy the bot with the skipProcessingChannels=true
// that way we are 100% of what will be processed
export const skipProcessingChannels = !regenerateTheIndexQueueAndThatsAll

// this is the main job! be sure of if you want to skip it or not!
export const skipProcessingQueue = regenerateTheIndexQueueAndThatsAll

// if you set it to true, AI Tube Robot will ignore anything related to pre-release projects
export const skipPreReleaseStuff = false

export const skipVideoInterpolation = false

export const allowUuidCollisions = false

// if you set it to true, the video won't be uploaded,
// instead you will see the file path in the console
export const skipUpload = quickTestAndDryRun ? true : false

// to avoid waiting for hours to test a new feature (eg. an AI model),
// we use the priority system to quicky iterate on the videos of core developers
export const priorityAccounts = [
  "jbilcke-hf"
]

// let's keep it to try until we have ironed things out!
export const skipLowPriorityAccounts = false

// custom list of video IDs to forcefully re-generate
export const toRegenerate = [
  // "01e3fdf7-ec1d-4720-b838-cae798cf0abc",
  // "00b4bcda-7b4a-40f8-9833-e490425a7b91"
]

// users whose content is banned, but their Hugging Face account has not been disabled
// being in this list means the account won't even be indexed and listed
//
// as the platform grows in popularity, it may be necessary to filter out bad actors
// trying to hijack the public "latest content" page with SEO spamming, cross-posting,
// mass-creation of videos, hack attempts, have a disrupting or childish behavior, don't follow rules etc
export const bannedAccounts = [
  // good news! nobody is there.. yet.

  // if you put someone here, please add a link or explanation as to why you believe
  // they should be put in this list (eg. "re-posted offensive material even after being told not to" etc)
]

// ------------------------------------------------------------------------------------

