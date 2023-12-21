import { skipProcessingChannels, skipProcessingQueue } from "./config.mts"
import { lock } from "./utils/lock.mts"
import { processChannels } from "./processChannels.mts"
import { processQueue } from "./processQueue.mts"
import { getVideoIndex } from "./huggingface/getters/getVideoIndex.mts"
import { downloadMp4 } from "./huggingface/getters/downloadMp4.mts"
import { convertMp4ToMp3 } from "./ffmpeg/convertMp4ToMp3.mts"
import { uploadMp3 } from "./huggingface/setters/uploadMp3.mts"
import { generateVideo } from "./generators/video/generateVideo.mts"
import { generateVideoWithSVD } from "./generators/video/generateVideoWithSVD.mts"
import { interpolateVideoToURL } from "./generators/video/interpolateVideoToURL.mts"
import { upscaleVideoToURL } from "./generators/video/upscaleVideoToURL.mts"

/*
import { addTextToVideo } from "./ffmpeg/addTextToVideo.mts"

export const main = async () => {
  await addTextToVideo()
}
*/

/*
import { generateMusicAsBase64 } from "./generators/music/generateMusicAsBase64.mts"
import { writeBase64ToFile } from "./utils/writeBase64ToFile.mts"
import { concatenateAudio } from "./ffmpeg/concatenateAudio.mts"

// comment or uncomment this te debug custom function/tests

export const main = async () => {
  console.log("running the server sanity check..")
  const audioTracks = await generateMusicAsBase64({
    video: {
      music: "groovy techno balearic deep house loop",
    } as any,
    durationInSec: 5 * 60
  })

  // console.log("write audio, for debugging")
  // await Promise.all(audioTracks.map(async (track, i) => {
  //   await writeBase64ToFile(track, `test_juju_${i}.wav`)
  // }))

  console.log("concatenating audio")

  // if this step failed, then something is very wrong
  const concatenatedAudio = await concatenateAudio({ audioTracks })
  console.log("concatenatedAudio:", concatenatedAudio.filepath)
}
*/

/*
this code convert mp4 to mp3
export const main = async () => {
  // for each video in the index, we download the mp4, and we convert it to mp3

  const videos = Object.values(await getVideoIndex({ status: "published" }))

  for (const video of videos) {
    console.log("-------------------------------------")
    try {
      // first we try to download the mp4
      const pathToMp4 = await downloadMp4({ urlToMp4: video.assetUrl })
      console.log("downloaded to:", pathToMp4)

      const pathToMp3 = await convertMp4ToMp3({ inputVideoPath: pathToMp4 })
      console.log("converted to:", pathToMp3)

      const uploadedTo = await uploadMp3({ video, filePath: pathToMp3 })
      console.log("uploaded to:", uploadedTo)
    } catch (err) {
      console.error(err)
    }
  }
}
*/

/*

export const main = async () => {
  try {
    console.log("generating a video..")
    const videoBase64 = await generateVideoWithSVD({
      prompt: "photo of a funny cat",
      orientation: "landscape",
      projection: "cartesian",
      width: 1024,
      height: 576,
    })

    console.log("generated a video!")
    // video interpolation might have some trouble at high resolution,
    // so we do it before
    const interpolatedVideoUrl = await interpolateVideoToURL(videoBase64)
    console.log("interpolatedVideoUrl:", interpolatedVideoUrl)
    
    // const upscaledVideoUrl = await upscaleVideoToURL(interpolatedVideoUrl)
    // console.log("upscaledVideoUrl:", upscaledVideoUrl)
  } catch (err) {
    console.log("failed to do so!")
  }
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

    if (!skipProcessingChannels) {
      try {
        let nbNewlyEnqueued = await processChannels()
        console.log(`main(): added ${nbNewlyEnqueued} new items to queue`)
      } catch (err) {
        console.log(`main(): failed to process channels: ${err}`)
      }

      console.log("\n---------------------------------------------------\n")
    }

    if (!skipProcessingQueue) {
      try {
        let nbProcessed = await processQueue()
        console.log(`main(): processed ${nbProcessed} queued items`)
      } catch (err) {
        console.log(`main(): failed to process: ${err}`)
      }
    }
    // console.log("\n---------------------------------------------------\n")
    // console.log("main(): releasing lock")
    lock.isLocked = false
  }

  // loop every hour
  setTimeout(() => {
    main()
  }, delayInSeconds * 1000)
}
