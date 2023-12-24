import { upscaleVideo } from "./generators/video/upscaleVideo.mts"
import { downloadMp4 } from "./huggingface/getters/downloadMp4.mts"
import { getVideosToUpscale } from "./huggingface/getters/getVideosToUpscale.mts"
import { updateVideosToUpscale } from "./huggingface/setters/updateVideosToUpscale.mts"
import { uploadMp4 } from "./huggingface/setters/uploadMp4.mts"

// this dequeue whatever is in to_upscale.json and upscale it
// note that the whole process is quite slow when using only one upscaling server
// 
export const processUpscaling = async () => {
  // for each video in the index, we download the mp4, we upscale it,
  // then we upload the _hd version
  // note: we should probably generate a low resolution too,
  // to be used when we are on the index page

  const videos = await getVideosToUpscale({
    renewCache: true,
    neverThrow: false
  })

  const videosToUpscale = Object.values(videos)

  let i = 0
  for (const video of videosToUpscale) {
    console.log(`============( upscaling video ${+i}/${videosToUpscale.length} )============`)
    try {
      // first we try to download the mp4
      const pathToMp4 = await downloadMp4({ urlToMp4: video.assetUrl })
      console.log("downloaded to:", pathToMp4)


      // note: for one shot we will get 426 frames
      // so this will get very slow very quickly
      const upscaledVideoFilePath = await upscaleVideo({
        inputVideoPath: pathToMp4,

        // there is no prompt since the video is already "done" / "full"
        // ESRGAN doesn't support it anyway
        prompt: "",
      })

      console.log("converted to:", upscaledVideoFilePath)

      const uploadedTo = await uploadMp4({
        video,
        filePath: upscaledVideoFilePath,
        suffix: "_hd.mp4" // <- of uttermost importance
      })

      console.log("uploaded to:", uploadedTo)

      delete videos[video.id]
    } catch (err) {
      console.error(err)
    }
  }

  await updateVideosToUpscale({ videos })
}
