
import { defaultVideoOrientation } from "../config.mts"
import { VideoOrientation } from "../types/atoms.mts"

export function parseVideoOrientation(text: any, defaultToUse?: VideoOrientation): VideoOrientation {
  const rawOrientationString = `${text || ""}`.trim().toLowerCase()

  let orientation: VideoOrientation = defaultToUse || (defaultVideoOrientation || "landscape")

  if (
    rawOrientationString === "landscape" || 
    rawOrientationString === "horizontal"
  ) {
    orientation = "landscape"
  }

  if (
    rawOrientationString === "portrait" || 
    rawOrientationString === "vertical" ||
    rawOrientationString === "mobile"
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