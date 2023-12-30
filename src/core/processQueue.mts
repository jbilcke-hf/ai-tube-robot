import { getVideoIndex } from "./huggingface/getters/getVideoIndex.mts"
import { processHighLevelVideoFormat } from "./processors/processHighLevelVideoFormat.mts"

export async function processQueue(): Promise<number> {
  console.log("|- checking the queue for videos to generate")
  console.log(`\\`)
  
  const queuedVideos = await getVideoIndex({ status: "queued", renewCache: true })
  const publishedVideos = await getVideoIndex({ status: "published", renewCache: true })

  const videos = Object.values(queuedVideos)

  console.log(` |- ${videos.length} videos are currently queued`)
  console.log(` |`)

  let nbProcessed = 0

  for (const video of videos) {
    
    if (await processHighLevelVideoFormat({
      video,
      queuedVideos,
      publishedVideos
    })) {
      nbProcessed += 1
    }
  }

  return nbProcessed
}

