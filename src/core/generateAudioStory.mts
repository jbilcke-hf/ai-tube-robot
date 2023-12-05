import { StoryLine, TTSVoice } from "../types.mts"
import { addBase64HeaderToWav } from "./addBase64HeaderToWav.mts"
import { promptToGenerateAudioStory } from "./prompts.mts"

export const aiStoryServerApiUrl = `${process.env.AI_STORY_SERVER_API_GRADIO_URL || ""}`
export const apiStoryServerApiToken = `${process.env.AI_STORY_SERVER_API_SECRET_TOKEN || ""}`

export async function generateAudioStory({
  prompt,
  voice,
  // maxLines,
  neverThrow,
}: {
  prompt: string
  voice: TTSVoice
  // maxLines: number
  neverThrow?: boolean
}): Promise<StoryLine[]> {
  try {
    if (!prompt?.length) {
      throw new Error(`prompt is too short!`)
    }

    const cropped = prompt.slice(0, 30)
    // console.log(`user requested "${cropped}${cropped !== prompt ? "..." : ""}"`)

    // positivePrompt = filterOutBadWords(positivePrompt)

    const res = await fetch(aiStoryServerApiUrl + (aiStoryServerApiUrl.endsWith("/") ? "" : "/") + "api/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        fn_index: 0, // <- important!
        data: [
          apiStoryServerApiToken,
          promptToGenerateAudioStory,
          prompt,
          voice,
          // maxLines,
        ],
      }),
      cache: "no-store",
      // we can also use this (see https://vercel.com/blog/vercel-cache-api-nextjs-cache)
      // next: { revalidate: 1 }
    })


    const rawJson = await res.json()
    const data = rawJson.data as StoryLine[][]

    const stories = data?.[0] || []

    if (res.status !== 200) {
      throw new Error('Failed to fetch data')
    }

    return stories.map(line => ({
      text: line.text.replaceAll(" .", ".").replaceAll(" ?", "?").replaceAll(" !", "!").trim(),
      audio: addBase64HeaderToWav(line.audio)
    }))
  } catch (err) {
    if (neverThrow) {
      console.error(`generateAudioStory():`, err)
      return []
    } else {
      throw err
    }
  }
}