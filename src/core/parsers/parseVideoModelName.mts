
import { defaultVideoModel } from "../config.mts"
import { VideoGenerationModel } from "../types/atoms.mts"

export function parseVideoModelName(text: any, defaultToUse: VideoGenerationModel): VideoGenerationModel {
  const rawModelString = `${text || ""}`.trim().toLowerCase()

  let model: VideoGenerationModel = defaultToUse || defaultVideoModel

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

  if (
    rawModelString === "hotshot" || 
    rawModelString === "hotshotxl" ||
    rawModelString === "hotshot xl" ||
    rawModelString === "hotshot-xl"
  ) {
    model = "HotshotXL"
  }

  return model
}