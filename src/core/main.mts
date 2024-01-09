import { robotRole, skipProcessingChannels, skipProcessingQueue } from "./config.mts"
import { lock } from "./utils/lock.mts"
import { processChannels } from "./processChannels.mts"
import { processQueue } from "./processQueue.mts"
import { processUpscaling } from "./processUpscaling.mts"
import { generateImageSDXL } from "./generators/image/generateImageWithSDXL.mts"
import { generateImageFromExistingFace } from "./generators/image/generateImageFromExistingFace.mts"
import { readPngFileToBase64 } from "./files/readPngFileToBase64.mts"
import { writeBase64ToFile } from "./files/writeBase64ToFile.mts"
import { upscaleImageWithPasd } from "./generators/image/upscaleImageWithPasd.mts"

/*
export const main2 = async () => {
  const prompt = [
    `beautiful`,
    `close-up`,
    `photo portrait`,
    `id photo`,
    "female",
    "aged 30yo",
    "named alice",
    `neutral expression`,
    `neutral background`,
    `frontal`,
    `photo studio`,
    `crisp`,
    `sharp`,
    `intricate details`
  ].join(", ")
  
  console.log("generating: " + prompt)
  const referenceImage = await generateImageSDXL({
    positivePrompt: prompt,
    nbSteps: 70
  })

  await writeBase64ToFile(referenceImage, "./samples/tests/inputs/referenceImage.png")

  const scenePrompt = "photorealistic, movie still, medium shot, woman investor, on the phone, looking concerned, trading desk, dark light, intence, cinematic, dim lighting, perfect hands"
  
  console.log("calling generateImageFromExistingFace()")
  const outputImage = await generateImageFromExistingFace({
    referenceImage,
    prompt: scenePrompt,

    // note: this function uses SD 1.5 for now, so it's not guaranteed that low
    // resolution work well. Also, hands will be broken.
    nbSteps: 50,

    // this may seem pretty limiting, but that is because it uses SD 1.5 under the hood
    // trying to use a resolution superior to 512 causes duplication in the image
    // eg. two portraits
    width: 512, // 1024,
    height: 288, // 576

    // so although the height is low-res, we can upscale it back to 1024x576!
    scalingFactor: 2,
  })

  await writeBase64ToFile(outputImage, "./samples/tests/outputs/outputImage.png")
}
*/

export const main = async () => {
  
  let delayInSeconds = 15 * 60 // let's check every 5 minutes

  // note: this is not an interval, because we are always waiting for current job
  // execution before starting something new

  // for faster debugging, you can disable some steps here
 
  // console.log("main(): checking lock..")
  if (lock.isLocked) {
    delayInSeconds = 30
  } else {
    console.log("\n---------------------------------------------------\n")

    //  console.log("main(): locking, going to process tasks..")
    lock.isLocked = true

    if (robotRole === "UPSCALE") {
       await processUpscaling()
    } else {
      if (!skipProcessingChannels) {
        try {
          let nbNewlyEnqueuedPublicVideos = await processChannels()
          console.log(`main(): added ${nbNewlyEnqueuedPublicVideos} public videos to the queue`)
        } catch (err) {
          console.log(`main(): failed to process public channels: ${err}`)
        }

        console.log("\n---------------------------------------------------\n")
      }

      if (!skipProcessingQueue) {
        try {
          let nbProcessed = await processQueue()
          console.log(`main(): generated ${nbProcessed} videos`)
        } catch (err) {
          console.log(`main(): failed to process something in the queue: ${err}`)
        }
      }
    }
    // }
    // console.log("\n---------------------------------------------------\n")
    // console.log("main(): releasing lock")
    lock.isLocked = false
  }

  // loop every hour
  setTimeout(() => {
    main()
  }, delayInSeconds * 1000)
}
