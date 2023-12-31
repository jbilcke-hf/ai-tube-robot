import { VideoProjection } from "../types/atoms.mts"

export function parseProjectionFromLoRA(input?: any): VideoProjection {
 const name = `${input || ""}`.trim().toLowerCase()

  const isEquirectangular = (
    name.includes("equirectangular") ||
    name.includes("panorama") ||
    name.includes("360")
  )

  return (
    isEquirectangular
    ? "equirectangular"
    : "cartesian"
  )
}