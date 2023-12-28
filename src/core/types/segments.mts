import { RenderedScene } from "./structures.mts"

export type RenderableSegment = {
  id: string
  track: number
  startTimeInMs: number
  endTimeInMs: number
  durationInMs: number
  startTimeInSteps: number
  endTimeInSteps: number
  durationInSteps: number
  category: string // SegmentCategoryName
  prompt: string
  generationStartedAt: number
  outputType: string // SegmentOutputType
  output: RenderedScene
  outputGain: number
  seed: number
}