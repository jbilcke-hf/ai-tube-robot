import { getVideoIndex } from "./huggingface/getters/getVideoIndex.mts"
import { generateVideoFromMarkdown } from "./processors/generateVideoFromMarkdown.mts"
import { generateVideoFromClap } from "./processors/generateVideoFromClap.mts"

export async function processQueue(): Promise<number> {
  console.log("|- checking the queue for videos to generate")
  console.log(`\\`)
  
  const queuedVideos = await getVideoIndex({ status: "queued" })
  const publishedVideos = await getVideoIndex({ status: "published" })

  const videos = Object.values(queuedVideos)

  console.log(` |- ${videos.length} videos are currently queued`)
  console.log(` |`)

  let nbProcessed = 0

  for (const video of videos) {
    
    const videoGenerationWorkflow = video.clapUrl
      ? generateVideoFromClap
      : generateVideoFromMarkdown

    if (await videoGenerationWorkflow({
      video,
      queuedVideos,
      publishedVideos
    })) {
      nbProcessed += 1
    }
  }

  return nbProcessed
}

