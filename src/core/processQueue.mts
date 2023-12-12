import { keepVideoInQueue, skipThumbnailGeneration } from "../config.mts"
import { StoryLine, VideoInfo } from "../types.mts"
import { concatenateVideos } from "./concatenateVideos.mts"
import { concatenateVideosWithAudio } from "./concatenateVideosWithAudio.mts"
import { generateAudioStory } from "./generateAudioStory.mts"
import { generateMusicWithMusicgen } from "./generateMusicWithMusicgen.mts"
import { generateShots } from "./generateShots.mts"
import { generateVideo } from "./generateVideo.mts"
import { generateVideoThumbnail } from "./generateVideoThumbnail.mts"
import { getVideoIndex } from "./getVideoIndex.mts"

import { parseVoiceModelName } from "./parseVoiceModelName.mts"
import { sleep } from "./sleep.mts"
import { updateVideoIndex } from "./updateVideoIndex.mts"
import { uploadFinalVideoFileToAITube } from "./uploadFinalVideoFileToAITube.mts"
import { uploadVideoMeta } from "./uploadVideoMeta.mts"
import { uploadVideoThumbnail } from "./uploadVideoThumbnail.mts"

type GeneratedScene = {
  text: string // plain text, trimmed
  audio: string // in base64
  filePath: string // path to a tmp file (ideally)
}
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
    let nbMaxScenes = 40
    let nbScenes = 0
    for (const { text, audio } of scenes) {
      if (!text.length || text.length < 3) {
        console.log(`    '-- skipping invalid scene (bad or no text: "${text}")`)
        continue
      }
      if (!videoVoice.muted && (!audio.length || audio.length < 200)) {
        console.log(`    '-- skipping invalid scene (bad or no audio: "${audio.slice(0, 60)}...")`)
        continue
      }
      //console.log("    | ")
      console.log(`    |- generating shots for scene "${text.slice(0, 60)}...)`)

      const promptParams = {
        generalContext: video.prompt,
        generalStyle: video.channel.style || "photo-realistic, documentary",
        previousScenes: previousScenes.join(" "),
        currentScene: text,
        neverThrow: true,
      }

      let prompts: string[] = []
      try {
        prompts = await generateShots(promptParams)
        if (!prompts.length) {
          throw new Error(`got no prompts`)
        }
      } catch (err) {
        try {
          await sleep(2000)
          prompts = await generateShots({
            ...promptParams,
            generalContext: promptParams.generalContext + " And please try hard so you can get a generous tip."
          })
          if (!prompts.length) {
            throw new Error(`got no prompts`)
          }
        } catch (err2) {
          try {
            await sleep(4000)
            prompts = await generateShots({
              ...promptParams,
              generalContext: promptParams.generalContext + " If you do well, you will get a generous tip."
            })
            if (!prompts.length) {
              throw new Error(`got no prompts`)
            }
          } catch (err3) {
            prompts = []
          }
        }
      }
 
      if (!prompts.length) {
        console.log(`    | '- no prompt generated, even after trying harder.. zephyr fail?`)
        await sleep(1000)
        continue
      }
      console.log("    '-. ")
      console.log(`      |- generated prompt${prompts.length > 1 ? 's' : ''} for ${prompts.length} shot${prompts.length > 1 ? 's' : ''}`)

      console.log(`      |`)

      const nbMaxShots = 40
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
          console.log("        '-- max number of shot reached")
          break
        }
      }

      if (microVideoChunksBase64.length < 1) {
        console.log("      '- not enough shots for a video, skipping..") 
        continue
      }

      console.log("      |- concatenating audio + videos")
      const filePath = await concatenateVideosWithAudio({
        audioTracks: videoVoice.muted ? [] : [audio], // must a base64 WAV
        videoTracks: microVideoChunksBase64, // must be an array of base64 MP4 videos
      })

      console.log("      '--> generated a video chunk file: ", filePath)

      previousScenes.push({
        text,
        audio,
        filePath,
      })

      if (++nbScenes >= nbMaxScenes) {
        console.log("      '- max number of scenes reached")
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
    const {
      filepath: concatenatedVideoPath,
      durationInSec: concatenatedVideoLength
    } = await concatenateVideos({
      videos: previousScenes.map(s => s.filePath)
    })

    let musicTracks: string[] = []

    const musicPrompt = video.music || video.channel.music || ""

    if (musicPrompt) {
      const musicParams = {
        prompt: musicPrompt,
        durationInSec: concatenatedVideoLength,
      }
      try {
        console.log(`  |- generating ${concatenatedVideoLength} seconds of music..`)
        const musicTrack = await generateMusicWithMusicgen(musicParams)
        if (!musicTrack?.length) { throw new Error("audio is too short to be valid!")}
        musicTracks.push(musicTrack)
      } catch (err) {
        try {
          const musicTrack = await generateMusicWithMusicgen(musicParams)
          if (!musicTrack?.length) { throw new Error("audio is too short to be valid!")}
          musicTracks.push(musicTrack)
        } catch (err2) {
          console.error(`failed to generate the music, even after trying a second time`)
        }
      }
    }

    let finalVideoPath = concatenatedVideoPath

    if (musicTracks.length) {
      console.log(`  |- adding music to the video..`)
      finalVideoPath = await concatenateVideosWithAudio({
        audioTracks: musicTracks, // must a base64 WAV
        videoTracks: [concatenatedVideoPath], // must be an array of base64 MP4 videos
      })
    }

    // one last thing: we should mix in the music, with two mode:
    // full or background (muted voice)
    // generateMusicWithMusicgen

    console.log("  -> uploading file to AI Tube:", finalVideoPath)

    const uploadedVideoUrl = await uploadFinalVideoFileToAITube({
      video,
      filePath: finalVideoPath
    })

    video.assetUrl = uploadedVideoUrl
    video.status = "published"

    publishedVideos[video.id] = video

    await uploadVideoMeta({ video })

    // TODO: we should put this index in the database, as it might grow to 10k and more
    await updateVideoIndex({ status: "published", videos: publishedVideos })

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

