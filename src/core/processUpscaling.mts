import { upscaleVideo } from "./generators/video/upscaleVideo.mts"
import { downloadMp4 } from "./huggingface/getters/downloadMp4.mts"
import { getVideosToUpscale } from "./huggingface/getters/getVideosToUpscale.mts"
import { updateVideo } from "./huggingface/setters/updateVideo.mts"
import { updateVideosToUpscale } from "./huggingface/setters/updateVideosToUpscale.mts"
import { uploadMp4 } from "./huggingface/setters/uploadMp4.mts"
import { uploadVideoMeta } from "./huggingface/setters/uploadVideoMeta.mts"

// this dequeue whatever is in to_upscale.json and upscale it
// note that the whole process is quite slow when using only one upscaling server
// 
export const processUpscaling = async () => {
  // for each video in the index, we download the mp4, we upscale it,
  // then we upload the _hd version
  // note: we should probably generate a low resolution too,
  // to be used when we are on the index page

  const toUpscale = await getVideosToUpscale()

  const videosToUpscale = Object.values(toUpscale)

  let i = 0
  for (const video of videosToUpscale) {
    console.log(`============( upscaling video ${++i}/${videosToUpscale.length} )============`)
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
        suffix: "_hd" // <- of uttermost importance
      })

      console.log("uploaded to:", uploadedTo)
      video.assetUrlHd = uploadedTo

      // then we update the video meta
      await uploadVideoMeta({ video })

      // note: this won't update the video index,
      // which will still be missing the extra information
      // but that's OK because we are going to change this index anyway:
      // make it lighter (remove info about channels)

      delete toUpscale[video.id]
      // TODO: get and update here
    } catch (err) {
      console.log("failed to upscale the video:")
      console.error(err)
    }
  }

  // TODO: 
  await updateVideosToUpscale({ videos: toUpscale })
}
