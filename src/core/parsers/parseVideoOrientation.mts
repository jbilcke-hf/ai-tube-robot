import { VideoOrientation } from "../../types.mts"
import { defaultVideoOrientation } from "../config.mts"

export function parseVideoOrientation(text: any, defaultToUse?: VideoOrientation): VideoOrientation {
  const rawOrientationString = `${text || ""}`.trim().toLowerCase()

  let orientation: VideoOrientation = defaultToUse || defaultVideoOrientation

  if (
    rawOrientationString === "landscape" || 
    rawOrientationString === "horizontal"
  ) {
    orientation = "landscape"
  }

  if (
    rawOrientationString === "portrait" || 
    rawOrientationString === "vertical"
  ) {
    orientation = "portrait"
  }

  if (
    rawOrientationString === "square"
  ) {
    orientation = "square"
  }


  return orientation
}