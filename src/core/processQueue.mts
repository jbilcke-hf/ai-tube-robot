import { VideoInfo } from "../types.mts"
import { generateAudioStory } from "./generateAudioStory.mts"
import { getIndex } from "./getIndex.mts"

export async function processQueue(): Promise<number> {
  console.log("checking the queue for videos to generate")
  
  const videos = await getIndex({ status: "queued", renewCache: true })

  const videoEntries = Object.entries(videos) as [string, VideoInfo][]

  console.log(`${videoEntries.length} videos are currently queued`)

  let nbProcessed = 0

  for (const [id, video] of videoEntries) {
    console.log(`generating video ${id}: "${video.label}"`)

  
    let scenes = []
    /*
    // first we ask the API to generate all the audio and story
    // this should take about 30 to 60 seconds
    const scenes = await generateAudioStory({
      prompt: video.prompt,
      voice: "Cloée",
      // maxLines: 5
    })
    */

    console.log(`generating video shot descriptions for ${scenes.length} scenes (story lines)`)
    // then for each story line, we generate the caption

    // finally, we assemble the mp4 (this part will be tricky)

    // nbProcessed += 1
  }

  return nbProcessed
}