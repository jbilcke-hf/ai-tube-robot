import { VideoInfo } from "../types.mts";
import { generateImageSDXL } from "./generateImageWithSDXL.mts";
import { generateSeed } from "./generateSeed.mts";
import { getLoraStyle } from "./getLoraStyle.mts";
import { sleep } from "./sleep.mts";

export async function generateVideoThumbnail({
  video,
  width = 1024,
  height = 576,
}: {
  video: VideoInfo
  width?: number
  height?: number
}): Promise<string> {

  const { lora, style } = await getLoraStyle(video)
  
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
      video.description
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