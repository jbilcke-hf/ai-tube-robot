export type ProjectionMode = 'cartesian' | 'spherical'

export type MouseEventType = "hover" | "click"

export type MouseEventHandler = (type: MouseEventType, x: number, y: number) => Promise<void>

// vendor-specific types

export type HotshotImageInferenceSize =
| '320x768'
| '384x672'
| '416x608'
| '512x512'
| '608x416'
| '672x384'
| '768x320'
| '1024x1024' // custom ratio - this isn't supported / supposed to work properly
| '1024x512' // custom panoramic ratio - this isn't supported / supposed to work properly
| '1024x576' // movie ratio (16:9) this isn't supported / supposed to work properly
| '576x1024' // tiktok ratio (9:16) this isn't supported / supposed to work properly

export type VideoStatus =
  | "submitted" // the prompt has been submitted, but is not added to the index queue yet
  | "queued" // the prompt has been added to the index queue, but is not processed yet. Once queued it cannot be modified.
  | "generating" // the video is being generated
  // TODO add a state to indicate the audio is being generated
  // this will be useful in case generation fails
  | "published" // success!
  | "error" // video failed to generate

export type VideoOrientation =
  | "portrait"
  | "landscape"
  | "square"

export type VideoProjection =
  | "cartesian" // this is the default
  | "equirectangular"

export type CacheMode = "use" | "renew" | "ignore"

export type RenderingEngine =
  | "VIDEOCHAIN"
  | "OPENAI"
  | "REPLICATE"

export type PostVisibility =
  | "featured" // featured by admins
  | "trending" // top trending / received more than 10 upvotes
  | "normal" // default visibility

export type SegmentEditor =
  | "auto"
  | "ai"
  | "human"
  
export type RenderedSceneStatus =
  | "pending"
  | "completed"
  | "error"


  export type VideoGenerationModel =
  | "HotshotXL"
  | "SVD"
  | "LaVie"

export type InterfaceDisplayMode =
  | "desktop"
  | "tv"

export type InterfaceView =
  | "home"
  | "user_channels"
  | "user_channel" // for a user to admin their channels
  | "user_videos"
  | "user_video"
  | "user_account"
  | "public_channels"
  | "public_channel" // public view of a channel
  | "public_video" // public view of a video

export type TTSVoice =
  | "Cloée" // consent given (friend)
  | "Julian" // consent given (HF employee)

