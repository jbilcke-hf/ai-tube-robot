import { getIndex } from "./getIndex.mts"

export async function processQueue() {
  console.log("checking the queue for videos to generate")
  
  const videos = getIndex({ status: "queued", renewCache: true })

  const videoEntries = Object.entries(videos)

  for (const [id, video] of videoEntries) {
    console.log(`generating video ${id}: "${video.label}"`)

    // TODO for now let's do something really basic,
    // which is to call VideoChain
  }
}