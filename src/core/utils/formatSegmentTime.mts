import { ClapSegment } from "../clap/types.mts"

export function formatSegmentTime({ startTimeInMs, endTimeInMs }: ClapSegment) {
  const start = `${startTimeInMs / 1000}`
  const end = `${endTimeInMs / 1000}`

  return `[${start}:${end}]`
}