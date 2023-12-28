

// a lightweight video index entry, where we only
// keep the most basic info such as id, label and tags

import { VideoGenerationModel, VideoOrientation, VideoProjection, VideoStatus } from "./atoms.mts"
import { ChannelInfo } from "./structures.mts"

// this will help reduce the size of the index
export type VideoIndexEntry = {
  /**
   * UUID (v4)
   */
  id: string

  label: string

  tags: string[]
}


export type VideoInfo = {
  /**
   * UUID (v4)
   */
  id: string

  /**
   * Status of the video
   */
  status: VideoStatus

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
   * URL to the binary file
   */
  assetUrl: string

  /**
   * Counter for the number of views
   * 
   * Note: should be managed by the index to prevent cheating
   */
  numberOfViews: number

  /**
   * Counter for the number of likes
   * 
   * Note: should be managed by the index to prevent cheating
   */
  numberOfLikes: number

  /**
   * Counter for the number of dislikes
   * 
   * Note: should be managed by the index to prevent cheating
   */
  numberOfDislikes: number
  
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
   * The channel
   */
  channel: ChannelInfo

  /**
   * Generation logs
   * 
   * We only keep those 
   */
  logs?: string


  /**
   * Video duration
   */
  duration: number
  
  /**
   * Video width (eg. 1024)
   */
  width: number

  /**
   * Video height (eg. 576)
   */
  height: number

  /**
   * General video aspect ratio
   */
  orientation: VideoOrientation

  /**
   * Video projection (cartesian by default)
   */
  projection: VideoProjection
}

export type VideoGenerationParams = {
  prompt: string
  lora?: string
  style?: string
  orientation: VideoOrientation
  projection: VideoProjection
  width: number
  height: number
}