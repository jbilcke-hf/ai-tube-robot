
import { generateShots } from "./generateShots.mts"
import { sleep } from "../../utils/sleep.mts"
import { VideoInfo } from "../../types/video.mts"
import { GeneratedScene } from "../../types/structures.mts"

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
    generalContext: [
      video.channel.prompt,
      video.prompt,
    ].map(x => x.trim()).filter(x => x).join("\n"),
    generalStyle: video.style || video.channel.style || "",
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
      await sleep(10000)
      prompts = await generateShots({
        ...promptParams,
        generalContext: promptParams.generalContext + " And please try hard so you can get a generous tip."
      })
      if (!prompts.length) {
        throw new Error(`got no prompts`)
      }
    } catch (err2) {
      try {
        await sleep(20000)
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