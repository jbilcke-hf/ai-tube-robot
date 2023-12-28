
import { generateImageSDXL } from "../image/generateImageWithSDXL.mts";
import { getVideoLoraAndStyle } from "../../huggingface/utils/getVideoLoraAndStyle.mts";
import { sleep } from "../../utils/sleep.mts";
import { VideoInfo } from "../../types/video.mts";

export async function generateVideoThumbnail(video: VideoInfo): Promise<string> {

  const { lora, style } = await getVideoLoraAndStyle(video)

  let width = 1024
  let height = 576

  const imageParams = {
    positivePrompt: [
      `photo of a youtuber`,
      `photorealism`,
      `video thumbnail`, 
      `surprised`,
      `dramatic`,
      `crisp and sharp`,
      `influencer`,
      `fisheye`,
      style,
      video.description,
    ].join(", "),
    negativePrompt: [
      "bad quality",
      "blurry",
      "copyright",
    ].join(", "),
    lora,
    width,
    height,
    // seed: generateSeed()
  }
  try {
    const thumbnail = await generateImageSDXL(imageParams)
    return thumbnail
  } catch (err) {
    try {
      await sleep(4000)
      const thumbnail = await generateImageSDXL({
        ...imageParams,
        // seed: generateSeed()
      })
      return thumbnail
    } catch (err) {
      try {
        await sleep(10000)
        const thumbnail = await generateImageSDXL({
          ...imageParams,
          // seed: generateSeed()
        })
        return thumbnail
      } catch (err) {
        console.error(`failed to generate the thumbnail, even after the third attempt`)
      }
    }
  }
}