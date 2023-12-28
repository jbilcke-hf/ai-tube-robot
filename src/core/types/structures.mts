import { CacheMode, HotshotImageInferenceSize, PostVisibility, ProjectionMode, RenderedSceneStatus, VideoGenerationModel, VideoOrientation, VideoProjection, VideoStatus } from "./atoms.mts"


export type ImageSegment = {
  id: number
  box: number[]
  color: number[]
  label: string
  score: number 
}

export type RenderedScene = {
  renderId: string
  status: RenderedSceneStatus
  assetUrl: string 
  alt: string
  error: string
  maskUrl: string
  segments: ImageSegment[]
}

export interface ImageAnalysisRequest {
  image: string // in base64
  prompt: string
}

export interface ImageAnalysisResponse {
  result: string
  error?: string
}

export type Post = {
  postId: string
  appId: string
  prompt: string
  model: string
  previewUrl: string
  assetUrl: string
  createdAt: string
  visibility: PostVisibility
  upvotes: number
  downvotes: number
}

export type CreatePostResponse = {
  success?: boolean
  error?: string
  post: Post
}

export type GetAppPostsResponse = {
  success?: boolean
  error?: string
  posts: Post[]
}

export type GetAppPostResponse = {
  success?: boolean
  error?: string
  post: Post
}


export type VideoOptions = {
  positivePrompt: string

  negativePrompt?: string

  size?: HotshotImageInferenceSize
  
  /**
   * Must be a model *name*
   */
  huggingFaceLora?: string

  replicateLora?: string

  triggerWord?: string
  
  nbFrames?: number // FPS (eg. 8)
  duration?: number // in milliseconds

  steps?: number

  key?: string // a semi-unique key to prevent abuse from some users
}

/**
 * A channel is a video generator
 * 
 * Video will be uploaded to a dataset
 */
export type ChannelInfo = {
  /**
   * We actually use the dataset ID for the channel ID.
   * 
   */
  id: string

  /**
   * The name used in the URL for the channel
   * 
   * eg: my-time-travel-journeys
   */
  slug: string

  /**
   * username slug of the Hugging Face dataset
   * 
   * eg: jbilcke-hf
   */
  datasetUser: string

  /**
   * dataset slug of the Hugging Face dataset
   * 
   * eg: ai-tube-my-time-travel-journeys
   */
  datasetName: string

  label: string

  description: string

  thumbnail: string

  model: VideoGenerationModel

  lora: string
  
  style: string

  voice: string

  music: string

  /**
   * The system prompt
   */
  prompt: string

  likes: number

  tags: string[]

  updatedAt: string

  /**
   * Default video orientation
   */
  orientation: VideoOrientation
}


export type MusicGenerationParams = {
  prompt: string
  durationInSec: number
  hd?: boolean
}

export type Settings = {
  huggingfaceApiKey: string
}


export type StoryLine = {
  text: string
  audio: string // in base64
}

export type Story = {
  lines: StoryLine[]
}

export type SDXLModel = {
  image: string
  title: string
  repo: string
  trigger_word: string
  weights: string
  is_compatible: boolean
  likes: number
  downloads?: number

  // additional fields, but we dont't care about them
  text_embedding_weights?: string
  is_nc?: boolean
  "new"?: boolean
  is_pivotal?: boolean
}

export type GeneratedScene = {
  text: string // plain text, trimmed
  audio: string // in base64
  filePath: string // path to a tmp file (ideally)
}

export type UpscaleImageParams = {
  imageAsBase64: string
  prompt?: string
  scaleFactor?: number
}
