import { createVideoFromFrames } from "../../ffmpeg/createVideoFromFrames.mts";
import { splitVideoIntoFrames } from "../../ffmpeg/splitVideoIntoFrames.mts";
import { readPngFileToBase64 } from "../../files/readPngFileToBase64.mts";
import { writeBase64ToFile } from "../../utils/writeBase64ToFile.mts";
import { upscaleImage } from "../image/upscaleImage.mts";

/**
 * Upscale a video and return its file path
 * 
 * For now this upscale using ESGRAN,
 * but we are going to try Stable Diffusion too.
 * 
 * @param param0
 * @returns 
 */
export async function upscaleVideo({
  inputVideoPath,
  prompt = "",
}: {
  inputVideoPath: string,
  prompt: string
}): Promise<string> {

  const {
    outputDirPath, // we will have to delete this later
    outputFramesPaths,
    numberOfFrames,
    framesPerSecond
  } = await splitVideoIntoFrames({ inputVideoPath })

  console.log(`split video into ${numberOfFrames} PNG frames (at ${framesPerSecond} FPS)`)
  console.log(`outputDirPath: ${outputDirPath}`)


  let i = 0
  for (const framePath of outputFramesPaths) {
    ++i

    console.log(` - upscaling frame ${++i}/${outputFramesPaths.length}`)


    const lowResImageBase64 = await readPngFileToBase64(framePath)
    // console.log(`   - got frame ${inputImageBase64.slice(0, 120)}`)
    const highResImageBase64 = await upscaleImage({
      imageAsBase64: lowResImageBase64,
      prompt,
    },
      "ESRGAN"
      // "SDX4" <- it crashes because of "Unknown error"
    )

    // SXD4 returns a JPG (although we are going to fight that,
    // maybe by creating a custom Gradio space) so we need to do this trick:
    // const outputFramePath = framePath.replace(" .png", ".jpg")
    const outputFramePath = framePath

    // console.log(`   - upscaled frame: ${upscaledImageInBase64.slice(0, 120)}`)
    await writeBase64ToFile(highResImageBase64, outputFramePath)
    // break
  
  }

  const inputVideoToUseAsAudio = inputVideoPath

  // those are used for debugging
  // const inputVideoToUseAsAudio = "./samples/reference_audio.mp4"
  // const outputDirPath = "./samples/frames"
  // const framesPerSecond = 60
  
  console.log("creating video from frames..")

  const outputVideoPath = await createVideoFromFrames({
    inputFramesDirectory: outputDirPath,

    framesPerSecond,

    inputVideoToUseAsAudio,

    inputFramesFormat: "png",
     // when using SDX4, the output from Hugging Face is a heavily compressed and "blocky" JPG
     // this is not good, I will have to check with the HF team if we can't return
     // a pro-quality PNG instead, or at least a modern format like WebP,
     // or worst case scenario have some options to control the JPG compression level
     // maybe the HTTP header can be used to ask for a different API output format?

     // note: we can attempt a hack for ffmpeg, which is to wrote the JPG files as if they were PNGs
     // inputFramesFormat: "jpg",
     // inputFramesFormat: "png",

    // outputVideoPath, // will be auto-generated
  })

  // console.log("output: ", outputVideoPath)

  return outputVideoPath
}