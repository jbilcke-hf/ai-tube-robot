
import { GeneratedScene, VideoInfo } from "../types.mts"
import { generateShots } from "./generateShots.mts"
import { sleep } from "./sleep.mts"

export async function generatePromptsForShots({
  video,
  text = "",
  previousScenes = []
}: {
  video: VideoInfo
  text: string
  previousScenes: GeneratedScene[]
}): Promise<string[]> {

  const promptParams = {
    generalContext: video.prompt,
    generalStyle: video.channel.style || "photo-realistic, documentary",
    previousScenes: previousScenes.map(scene => scene.text).join(" "),
    currentScene: text,
    neverThrow: true,
  }

  let prompts: string[] = []
  try {
    prompts = await generateShots(promptParams)
    if (!prompts.length) {
      throw new Error(`got no prompts`)
    }
  } catch (err) {
    try {
      await sleep(4000)
      prompts = await generateShots({
        ...promptParams,
        generalContext: promptParams.generalContext + " And please try hard so you can get a generous tip."
      })
      if (!prompts.length) {
        throw new Error(`got no prompts`)
      }
    } catch (err2) {
      try {
        await sleep(10000)
        prompts = await generateShots({
          ...promptParams,
          generalContext: promptParams.generalContext + " If you do well, you will get a generous tip."
        })
        if (!prompts.length) {
          throw new Error(`got no prompts`)
        }
      } catch (err3) {  
        prompts = []
      }
    }
  }
  return prompts
}