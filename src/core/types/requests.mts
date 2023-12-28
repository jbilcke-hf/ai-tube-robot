import { CacheMode, ProjectionMode, VideoGenerationModel, VideoOrientation } from "./atoms.mts"
import { ChannelInfo } from "./structures.mts"
import { VideoInfo } from "./video.mts"

export type RenderRequest = {
  prompt: string

  // whether to use video segmentation
  // disabled (default)
  // firstframe: we only analyze the first frame
  // allframes: we analyze all the frames
  segmentation: 'disabled' | 'firstframe' | 'allframes'

  // segmentation will only be executed if we have a non-empty list of actionnables
  // actionnables are names of things like "chest", "key", "tree", "chair" etc
  actionnables: string[]

  // note: this is the number of frames for Zeroscope,
  // which is currently configured to only output 3 seconds, so:
  // nbFrames=8 -> 1 sec
  // nbFrames=16 -> 2 sec
  // nbFrames=24 -> 3 sec
  nbFrames: number // min: 1, max: 24

  nbSteps: number // min: 1, max: 50

  seed: number

  width: number // fixed at 1024 for now
  height: number // fixed at 512 for now

  // upscaling factor
  // 0: no upscaling
  // 1: no upscaling
  // 2: 2x larger
  // 3: 3x larger
  // 4x: 4x larger, up to 4096x4096 (warning: a PNG of this size can be 50 Mb!)
  upscalingFactor: number

  projection: ProjectionMode

  /**
   * Use turbo mode
   * 
   * At the time of writing this will use SSD-1B + LCM
   * https://huggingface.co/spaces/jbilcke-hf/fast-image-server
   */
  turbo: boolean

  cache: CacheMode

  wait: boolean // wait until the job is completed

  analyze: boolean // analyze the image to generate a caption (optional)
}


export interface ImageAnalysisResponse {
  result: string
  error?: string
}

export type VideoRequestResponse = {
  error?: string
  video?: VideoInfo
}

export type UpdateQueueRequest = {
  channel?: ChannelInfo
  apiKey: string
}

export type UpdateQueueResponse = {
  error?: string
  nbUpdated: number
}


/**
 * A video request, made by a user or robot on a channel
 */
export type VideoRequest = {
  /**
   * UUID (v4)
   */
  id: string

  // skip generation (mostly used for debugging)
  // skip?: boolean

  /**
   * Human readable title for the video
   */
  label: string

  /**
   * Human readable description for the video
   */
  description: string

  /**
   * Video prompt
   */
  prompt: string

  /**
   * URL to the video thumbnail
   */
  thumbnailUrl: string

  /**
   * When was the video updated
   */
  updatedAt: string

  /**
   * Arbotrary string tags to label the content
   */
  tags: string[]

  /**
   * Model name
   */
  model: VideoGenerationModel

  /**
   * LoRA name
   */
  lora: string

  /**
   * style name
   */
  style: string

  /**
   * Music prompt
   */
  music: string

  /**
   * Voice prompt
   */
  voice: string

  /**
   * ID of the channel
   */
  channel: ChannelInfo

  /**
   * Video orientation
   */
  orientation: VideoOrientation

  /**
   * Video duration
   */
  duration: number
}


