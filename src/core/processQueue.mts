import { keepVideoInQueue, nbMaxScenes, nbMaxShots, skipThumbnailGeneration, skipUpload } from "./config.mts"
import { GeneratedScene, StoryLine, VideoInfo } from "../types.mts"
import { concatenateAudio } from "./ffmpeg/concatenateAudio.mts"
import { concatenateVideos } from "./ffmpeg/concatenateVideos.mts"
import { concatenateVideosWithAudio } from "./ffmpeg/concatenateVideosWithAudio.mts"
import { generateAudioStory } from "./generators/voice/generateAudioStory.mts"
import { generateMusicAsBase64 } from "./generators/music/generateMusicAsBase64.mts"
import { generatePromptsForShots } from "./generators/text/generatePromptsForShots.mts"
import { generateVideo } from "./generators/video/generateVideo.mts"
import { generateVideoThumbnail } from "./generators/video/generateVideoThumbnail.mts"
import { getVideoIndex } from "./huggingface/getters/getVideoIndex.mts"

import { parseVoiceModelName } from "./parsers/parseVoiceModelName.mts"
import { sleep } from "./utils/sleep.mts"
import { updateVideoIndex } from "./huggingface/setters/updateVideoIndex.mts"
import { uploadMp4 } from "./huggingface/setters/uploadMp4.mts"
import { uploadVideoMeta } from "./huggingface/setters/uploadVideoMeta.mts"
import { uploadVideoThumbnail } from "./huggingface/setters/uploadVideoThumbnail.mts"
import { getMediaInfo } from "./ffmpeg/getMediaInfo.mts"
import { convertMp4ToMp3 } from "./ffmpeg/convertMp4ToMp3.mts"
import { uploadMp3 } from "./huggingface/setters/uploadMp3.mts"


export async function processQueue(): Promise<number> {
  console.log("|- checking the queue for videos to generate")
  console.log(`\\`)
  
  const queuedVideos = await getVideoIndex({ status: "queued", renewCache: true })
  const publishedVideos = await getVideoIndex({ status: "published", renewCache: true })

  const videoEntries = Object.entries(queuedVideos) as [string, VideoInfo][]

  console.log(` |- ${videoEntries.length} videos are currently queued`)
  console.log(` |`)

  let nbProcessed = 0

  for (const [id, video] of videoEntries) {
    console.log(` |- processing video ${id}: "${video.label}"`)
    console.log(` \\`)

    // let scenes = []
    if (!skipThumbnailGeneration) {
      console.log(`  |- generating a catchy thumbnail..`)

      const thumbnailBase64 = await generateVideoThumbnail({ video })

      console.log(`  |- uploading the catchy thumbnail..`)

      video.thumbnailUrl = await uploadVideoThumbnail({ video, thumbnailBase64 })
    }

    console.log(`  |- setting video state to "generating"..`)
  
    video.status = "generating"

    await sleep(500)

    console.log(`  |- pushing new video metadata..`)
    await uploadVideoMeta({ video })

 
    // the use case for doing this is debugging
    if (!keepVideoInQueue) {
      delete queuedVideos[video.id]
      await updateVideoIndex({ status: "queued", videos: queuedVideos })
    }

    // let scenes = []
    console.log(`  |- generating audio commentary..`)

    // first we ask the API to generate all the audio and story
    // this should take about 30 to 60 seconds
    let scenes: StoryLine[] = []

    const channelVoice = parseVoiceModelName(video.channel.voice, "Cloée")

    const videoVoice = parseVoiceModelName(video.voice, channelVoice.voice)

    try {
      scenes = await generateAudioStory({
        prompt: video.prompt,
        voice: videoVoice.voice,
        // maxLines: 5,
        neverThrow: true,
      })
      if (!scenes.length) {
        throw new Error("zero audio story generated")
      }
    } catch (err) {
      // let's try again, because sometimes Gradio spaces are finicky
      try {
        await sleep(2000)
        scenes = await generateAudioStory({
          prompt: video.prompt + ".",
          voice: videoVoice.voice,
          // maxLines: 5,
          neverThrow: true,
        })
        if (!scenes.length) {
          throw new Error("zero audio story generated")
        }
      } catch (err2) {
        console.log(`  '- failed to generate the audio commentary.. skipping (reason: ${err})`)
      }
      continue
    }
    
    console.log(`  | `)
    console.log(`  |- got audio for ${scenes.length} scenes`)
    console.log(`  '-.`)
    // then for each story line, we generate the caption

    let previousScenes: GeneratedScene[] = []

    let nbScenes = 0
    for (const { text, audio: audioAsBase64 } of scenes) {
      if (!text.length || text.length < 3) {
        console.log(`    '-- skipping invalid scene (bad or no text: "${text}")`)
        continue
      }
      if (!videoVoice.muted && (!audioAsBase64.length || audioAsBase64.length < 200)) {
        console.log(`    '-- skipping invalid scene (bad or no audio: "${audioAsBase64.slice(0, 60)}...")`)
        continue
      }
      //console.log("    | ")
      console.log(`    |- generating shots for scene "${text.slice(0, 60)}...)`)

      const prompts = await generatePromptsForShots({
        video,
        previousScenes,
        text,
      })
 
      if (!prompts.length) {
        console.log(`    | '- no prompt generated, even after trying harder.. zephyr fail?`)
        await sleep(1000)
        continue
      }
      console.log("    '-. ")
      console.log(`      |- generated prompt${prompts.length > 1 ? 's' : ''} for ${prompts.length} shot${prompts.length > 1 ? 's' : ''}`)

      console.log(`      |`)

      let nbShots = 0
      
      // this takes a bit of RAM, but not so much (we are only going to buffer a few seconds)
      const microVideoChunksBase64: string[] = []

      for (const prompt of prompts) {
        if (!prompt.length || prompt.length < 3) {
          console.log(`      '-- skipping invalid shot prompt "${prompt}"`)
          continue
        }

        console.log(`      |-- generating shot from prompt "${prompt.slice(0, 60)}..."`)
        // we could also generate an image, but no human is going to curate it,
        // so let's just generate things blindly
        
        const base64Video = await generateVideo(prompt, video)
        
        if (!base64Video) {
          console.log(`      | '- failed to generate a video snippet, skipping..`)
          continue
        }

        microVideoChunksBase64.push(base64Video)
        console.log(`      | |`)

        console.log(`      | '- success!`)
        // console.log(`      | '- generated shot! got a nice video "${base64Video.slice(0, 30)}..."`)

        console.log(`      |`)

        if (++nbShots >= nbMaxShots) {
          console.log(`        '-- max number of shot reached (${nbMaxShots})`)
          break
        }
      }

      if (microVideoChunksBase64.length < 1) {
        console.log("      '- not enough shots for a video, skipping..") 
        continue
      }

      console.log("      |- concatenating audio + videos")
      const concatenatedChunk = await concatenateVideosWithAudio({
        audioTrack: videoVoice.muted ? undefined : audioAsBase64, // must a base64 WAV
        videoTracks: microVideoChunksBase64, // must be an array of base64 MP4 videos
        videoTracksVolume: 0.0,
        audioTrackVolume: 1.0,
      })

      console.log("      '--> generated a video chunk file: ", concatenatedChunk.filepath)

      previousScenes.push({
        text,
        audio: audioAsBase64,
        filePath: concatenatedChunk.filepath,
      })

      if (++nbScenes >= nbMaxScenes) {
        console.log(`      '- max number of scenes reached ${nbMaxScenes}`)
        break
      }
    }
    /*
    console.log("scenes:", previousScenes.map(scene => ({
      text: scene.text,
      audio: "hidden",
      filePath: scene.filePath,
    })))
    */

    const videosToConcatenate = previousScenes.map(s => s.filePath)

    if (!videosToConcatenate.length) {

      if (queuedVideos[video.id]) {
        delete queuedVideos[video.id]
        await updateVideoIndex({ status: "queued", videos: queuedVideos })
        await sleep(1000)
      }

      video.status = "error"
      await uploadVideoMeta({ video })

      console.log("  -> no video to concatenate, skipping..")
      continue
    }
    
    // concatenate all the videos together
    console.log("  |- concatenating videos..")
    const concatenatedVideos = await concatenateVideos({
      videoFilePaths: previousScenes.map(s => s.filePath)
    })

 
    console.log("  |- generating music..")
    // this returns multiple tracks to stay low on memory usage
    const musicTracks = await generateMusicAsBase64({
      video,
      durationInSec: concatenatedVideos.durationInSec,
    })

 
    let finalVideoPath = concatenatedVideos.filepath

    if (musicTracks.length) {
      try {
        console.log("  |- concatenating music..")

        const concatenatedMusic = await concatenateAudio({
          audioTracks: musicTracks,
          crossfadeDurationInSec: 2 // 2 seconds
        })

        console.log(`  |- concatenated ${
          musicTracks.length
        } music tracks (total duration: ${
          concatenatedMusic.durationInSec
        } sec)`)

        console.log(`  |- adding music to the video..`)
        const concatenatedVideoWithAudio = await concatenateVideosWithAudio({
          // note the use of *paths* in the parameters
          audioFilePath: concatenatedMusic.filepath, // must a base64 WAV
          videoFilePaths: [concatenatedVideos.filepath], // must be an array of base64 MP4 videos

          // unless we are muted, the voice will be higher than the music
          videoTracksVolume: videoVoice.muted ? 1.0 : 0.65,
          audioTrackVolume: videoVoice.muted ? 0.0 : 0.35,
        })

        finalVideoPath = concatenatedVideoWithAudio.filepath
      }  catch (err) {
        console.log(`  |- failed to concatenate the audio: `, err)
      }
    }

    if (skipUpload) {
      console.log("  -> development mode, so we skip uploading to AI Tube.")
      console.log("  -> you can inspect the video here: ", finalVideoPath)

    } else {
      console.log("  -> uploading file to AI Tube:", finalVideoPath)

      const uploadedVideoUrl = await uploadMp4({
        video,
        filePath: finalVideoPath
      })
      video.assetUrl = uploadedVideoUrl
      video.status = "published"
  
      publishedVideos[video.id] = video

      try {
        const finalVideoMediaInfo = await getMediaInfo(finalVideoPath)
        video.duration = finalVideoMediaInfo.durationInSec
      } catch (err) {
        // failed to get media info - should be extremely rare, since we just uploaded it successfully
      }

      await uploadVideoMeta({ video })

      // one more thing: we also extract the audio track to mp3 (for AiTube Music)
      try {
        const pathToMp3 = await convertMp4ToMp3({
          inputVideoPath: finalVideoPath
        })
        const uploadedAudioUrl = await uploadMp3({
          video,
          filePath: finalVideoPath
        })
      } catch (err) {
        // failed to generate the mp3
      }

  
      // TODO: we should put this index in the database, as it might grow to 10k and more
      await updateVideoIndex({ status: "published", videos: publishedVideos })  
    }


    // everything looks fine! let's mark the video as finished
    if (!keepVideoInQueue) {
      if (queuedVideos[video.id]) {
        delete queuedVideos[video.id]
        await sleep(1000)
        await updateVideoIndex({ status: "queued", videos: queuedVideos })
      }
    }

    nbProcessed += 1
  }

  return nbProcessed
}

