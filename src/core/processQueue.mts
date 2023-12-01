import { VideoInfo } from "../types.mts"
import { generateAudioStory } from "./generateAudioStory.mts"
import { generateShots } from "./generateShots.mts"
import { generateVideoWithLaVieLegacy } from "./generateVideoWithLaVieLegacy.mts"
import { getIndex } from "./getIndex.mts"

export async function processQueue(): Promise<number> {
  console.log("checking the queue for videos to generate")
  
  const videos = await getIndex({ status: "queued", renewCache: true })

  const videoEntries = Object.entries(videos) as [string, VideoInfo][]

  console.log(`${videoEntries.length} videos are currently queued`)

  let nbProcessed = 0

  for (const [id, video] of videoEntries) {
    console.log(`- processing video ${id}: "${video.label}"`)

  
    // let scenes = []
    console.log(`  - generating audio commentary (should take about 50 seconds)`)

  
    // first we ask the API to generate all the audio and story
    // this should take about 30 to 60 seconds
    const scenes = await generateAudioStory({
      prompt: video.prompt,
      voice: "Cloée",
      // maxLines: 5,
      neverThrow: true,
    })
    

    console.log(`  - generated audio commentary for ${scenes.length} scenes`)
    // then for each story line, we generate the caption

    let previousScenes: string[] = []
    for (const { text } of scenes) {
      const currentScene = text.trim()
      if (!currentScene.length || currentScene.length < 3) {
        continue
      }
      console.log("    | ")
      console.log(`    + generating shots for scene "${currentScene.slice(0, 60)}..."`)

      const promptParams = {
        generalContext: video.prompt,
        generalStyle: "photo-realistic, documentary",
        previousScenes: previousScenes.join(" "),
        currentScene,
        neverThrow: true,
      }

      let prompts: string[] = []
      try {
        prompts = await generateShots(promptParams)
        if (!prompts.length) {
          throw new Error(`got no prompts, let's try again`)
        }
      } catch (err) {
        prompts = await generateShots(promptParams)
      }
      console.log(`      |`)
    
      if (!prompts.length) {
        console.log(`      '-( no prompt generated.. something's wrong )`)

        continue
      }
      console.log(`      |-( generated prompt${prompts.length > 1 ? 's' : ''} for ${prompts.length} shot${prompts.length > 1 ? 's' : ''} )`)

      console.log(`      |`)
      for (const prompt of prompts) {
        console.log(`      +-- generating shot using prompt "${prompt.slice(0, 60)}..."`)
        // we could also generate an image, but no human is going to curate it,
        // so let's just generate things blindly
        const base64Video = await generateVideoWithLaVieLegacy({ prompt: prompt })
        console.log(`        +-- generated shot! got a nice video "${base64Video.slice(0, 30)}..."`)
      }


      previousScenes.push(currentScene)
    }

    // finally, we assemble the mp4 (this part will be tricky)

    // nbProcessed += 1
  }

  return nbProcessed
}