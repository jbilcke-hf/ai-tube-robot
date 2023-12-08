import { VideoGenerationModel } from "../types.mts"

export function parseModelName(text?: string): VideoGenerationModel {
  const rawModelString = `${text || ""}`.trim().toLowerCase()

  let model: VideoGenerationModel = "HotshotXL"

  if (
    rawModelString === "stable video diffusion" || 
    rawModelString === "stablevideodiffusion" || 
    rawModelString === "svd"
  ) {
    model = "SVD"
  }

  if (
    rawModelString === "la vie" || 
    rawModelString === "lavie"
  ) {
    model = "LaVie"
  }

  return model
}