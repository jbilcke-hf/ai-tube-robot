import { writeBase64ToFile } from "../../files/writeBase64ToFile.mts"
import { generateWithIPAdapter } from "./generateWithIPAdapter.mts"
import { paintFaceIntoImage } from "./paintFaceIntoImage.mts"
import { upscaleImageWithPasd } from "./upscaleImageWithPasd.mts"

export async function generateImageFromExistingFace({ referenceImage, prompt, nbSteps, width, height, scalingFactor, debug }: {
  referenceImage: string
  prompt: string
  nbSteps: number
  width: number
  height: number
  scalingFactor: number
  debug?: boolean
}) {

  // step 1: generate an image with the correct bone structure and hair
  console.log("Step 1: generating the base bone and hair structure by calling generateWithIPAdapter")
  let targetImage = await generateWithIPAdapter({
    referenceImage,
    prompt,
    nbSteps,

    width,
    height,

    debug,
  })

  console.log("targetImage:" + targetImage.slice(0, 50))

  await writeBase64ToFile(targetImage, "./samples/tests/outputs/step1_target_image.png")

  // step 2: fix facial features
  // magic sauce
  console.log("Step 2: fixing facial features by calling paintFaceIntoImage (roop)")
  
  // this uses Roop, which is a low-resolution model (trained on 128px I think?)
  // so we can stay in the 512px resolution of IP-Adapter's SD1.5
  let paintedImage = await paintFaceIntoImage({
    referenceImage,
    targetImage,
    debug,
  })

  await writeBase64ToFile(paintedImage, "./samples/tests/outputs/step2_painted_image.png")

  // step 3

  console.log("Step 3: upscaling the image with PASD (can take about 90 sec)")
  const upscaledImage = await upscaleImageWithPasd({
    imageAsBase64: paintedImage,
    prompt,
    scaleFactor: 2,
  })
  await writeBase64ToFile(upscaledImage, "./samples/tests/outputs/step3_upscaled_image.png")
  console.log("upscaledImage: " + upscaledImage.slice(0, 50))
  return upscaledImage
}