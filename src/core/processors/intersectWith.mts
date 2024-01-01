import { ClapSegment } from "../clap/types.mts"

/**
 * Return all segments temporally intersecting with a specific segment
 * @param segments 
 * @param segment 
 * @returns 
 */
export function intersectWith(segments: ClapSegment[], segment: ClapSegment): ClapSegment[] {
  return segments.filter(s =>
    segment.startTimeInMs <= s.startTimeInMs && s.endTimeInMs <= segment.endTimeInMs
  )
}