
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

/*
export const main = async () => {
  // const prompt = "close up of a roman soldier, light shave, anxious, dim light, blurry soldiers in the background"
  const prompt = "influencer in a starbucks cafe, eating avocado toast, blonde girl, 24yo, stylish"
  
  const testPath = "./samples/test_002"

  console.log("generating a video..")
  const rawVideo = await generateVideoWithSVD({
    prompt,
    width: 1024,
    height: 576,
    projection: "cartesian",
    orientation: "landscape"
  })
  console.log("got our raw video!")
  await writeBase64ToFile(rawVideo, testPath + "_raw.mp4")

  const rawVideo =  await readMp4FileToBase64(testPath + "_raw.mp4")

  const originalFps = 8
  const originalDuration = 3
  const originalNumberOfFrames = 3 * 8


  // I've removed the height limitation on FILM's size, we will see how it goes
  // for portrait videos.. it's not 100% sure that it works
  const interpolatedVideoBas64 = await interpolateVideoToBase64(rawVideo, 4, 64)
  console.log("interpolated the video!")

  const interpolatedVideoFilePath = testPath + "_4_60_better.mp4"

  // await writeBase64ToFile(interpolatedVideoBas64, interpolatedVideoFilePath)


  // const downloadedMp4 = await writeBase64ToFile(m)


  const upscaledVideoFilePath = await upscaleVideo({
    inputVideoPath: interpolatedVideoFilePath,
    prompt,
  })
  console.log("upscaled video file path:", upscaledVideoFilePath)
}
*/