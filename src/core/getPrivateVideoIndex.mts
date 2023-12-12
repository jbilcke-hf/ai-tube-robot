

import { Credentials, downloadFile, uploadFile, whoAmI } from "@huggingface/hub"

import { VideoInfo, VideoStatus } from "../types.mts"
import { adminCredentials, adminUsername } from "../config.mts"

// this function get an index using the huggingface API
// it is not very useful for us as plaintext file downloads 
// can also be done with a simple fetch and HTTP GET,
// but this could be useful if we want to download index from private datasets
export async function getPrivateVideoIndex({
  status,
  renewCache,
}: {
  status: VideoStatus

  /**
   * Renew the cache
   * 
   * This is was the batch job daemon will use, as in normal time
   * we will want to use the cache since the file might be large
   * 
   * it is also possible that we decide to *never* renew the cache from a user's perspective,
   * and only renew it manually when a video changes status
   * 
   * that way user requests will always be snappy!
   */
  renewCache?: boolean
}): Promise<Record<string, VideoInfo>> {

  // grab the current video index
  const response = await downloadFile({
    credentials: adminCredentials,
    repo: `datasets/${adminUsername}/ai-tube-index`,
    path: `${status}.json`,
    
  })
  
  // attention, this list might grow, especially the "published" one
  // published videos should be put in a big dataset folder of files
  // named "<id>.json" and "<id>.mp4" like in VideoChain
  const jsonResponse = await response?.json()
  if (
    typeof jsonResponse === "undefined" &&
    typeof jsonResponse !== "object" &&
     Array.isArray(jsonResponse) ||
    jsonResponse === null) {
    throw new Error("index is not an object, admin repair needed")
  }
  const videos = jsonResponse as Record<string, VideoInfo>

  return videos
}
