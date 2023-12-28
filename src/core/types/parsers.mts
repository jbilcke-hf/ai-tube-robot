import { VideoGenerationModel, VideoOrientation } from "./atoms.mts"

export type ParsedDatasetReadme = {
  license: string
  pretty_name: string
  model: VideoGenerationModel
  lora: string
  style: string
  thumbnail: string
  voice: string
  music: string
  tags: string[]
  hf_tags: string[]
  description: string
  prompt: string
  orientation: VideoOrientation
}

export type ParsedMetadataAndContent = {
  metadata: {
    license: string,
    pretty_name: string,
    tags: string[]
  }
  content: string
}

export type ParsedDatasetPrompt = {
  title: string
  description: string
  prompt: string
  tags: string[]
  model: VideoGenerationModel
  lora: string
  style: string
  thumbnail: string
  voice: string
  music: string
  orientation: VideoOrientation
}