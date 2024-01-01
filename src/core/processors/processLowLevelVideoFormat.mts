import { keepVideoInQueue, nbMaxScenes, nbMaxShots, skipThumbnailGeneration, skipUpload, skipVideoInterpolation } from "../config.mts"
import { concatenateAudio } from "../ffmpeg/concatenateAudio.mts"
import { concatenateVideos } from "../ffmpeg/concatenateVideos.mts"
import { concatenateVideosWithAudio } from "../ffmpeg/concatenateVideosWithAudio.mts"
import { generateAudioStory } from "../generators/voice/generateAudioStory.mts"
import { generateMusicAsBase64 } from "../generators/music/generateMusicAsBase64.mts"
import { generatePromptsForShots } from "../generators/text/generatePromptsForShots.mts"
import { generateVideo } from "../generators/video/generateVideo.mts"
import { generateVideoThumbnail } from "../generators/video/generateVideoThumbnail.mts"

import { parseVoiceModelName } from "../parsers/parseVoiceModelName.mts"
import { sleep } from "../utils/sleep.mts"
import { updateVideoIndex } from "../huggingface/setters/updateVideoIndex.mts"
import { uploadMp4 } from "../huggingface/setters/uploadMp4.mts"
import { uploadVideoMeta } from "../huggingface/setters/uploadVideoMeta.mts"
import { uploadVideoThumbnail } from "../huggingface/setters/uploadVideoThumbnail.mts"
import { getMediaInfo } from "../ffmpeg/getMediaInfo.mts"
import { convertMp4ToMp3 } from "../ffmpeg/convertMp4ToMp3.mts"
import { uploadMp3 } from "../huggingface/setters/uploadMp3.mts"
import { interpolateVideoToBase64 } from "../generators/video/interpolateVideoToBase64.mts"
import { interpolateVideoToURL } from "../generators/video/interpolateVideoToURL.mts"
import { downloadMp4ToBase64 } from "../huggingface/getters/downloadMp4ToBase64.mts"
import { GeneratedScene, StoryLine } from "../types/structures.mts"
import { VideoInfo } from "../types/video.mts"
import { downloadClapProject } from "../huggingface/getters/downloadClapProject.mts"
import { getUser } from "../database/users.mts"
import { intersectWith } from "./intersectWith.mts"
import { getVideoPrompt } from "./getVideoPrompt.mts"
import { ClapModel } from "../types/clap.mts"

// the low-level definition format used by "3rd party apps"
export async function processLowLevelVideoFormat({
  video,
  queuedVideos,
  publishedVideos,
}:{
  video: VideoInfo
  queuedVideos: Record<string, VideoInfo>
  publishedVideos: Record<string, VideoInfo>
}): Promise<boolean> {
  const { id, channel } = video
  console.log(` |- processing video ${id}: "${video.label}"`)
  console.log(` \\`)

  const user = await getUser(channel.datasetUser)

  if (!user) {
    console.log(`there is something wrong with the video username, we can't find this user.. aborting`)
    return false
  }

  const path = video.clapUrl.split("/").pop()

  // let's get our work started!
  const clap = await downloadClapProject({
    path,
    channel,

    // use use the user's own API token to recover the clap file,
    // as it might be hosted on a private channel
    apiKey: user.hfApiToken
  })
 
  console.log("finally! we have our magic clap:", clap.clapProject.meta)

  const allSegments = clap.clapProject.segments

  const extraPositivePrompt = clap.clapProject.meta.extraPositivePrompt

  const modelsById: Record<string, ClapModel> = {}
  clap.clapProject.models.forEach(m => {
    modelsById[m.id] = m
  })

  const previewSegments = allSegments.filter(segment => segment.category === "preview")
  console.log(`identified ${previewSegments.length} preview segments`)

  const allNonPreviewSegments = allSegments.filter(s => s.category !== "preview" && s.category !== "render")
  const allNonPreviewNonAudioSegments = allNonPreviewSegments.filter(s => s.category !== "sound" && s.category !== "music")

  // const renderingSegments = clap.clapProject.segments.filter(segment => segment.category === "render")
  // console.log(`identified ${renderingSegments.length} rendering segments`)

  const incompletePreviewSegments = previewSegments.filter(s => s.status !== "completed" || !s.assetUrl)

  console.log("incompletePreviewSegments (extract):", incompletePreviewSegments.slice(0, 1))

  // now, well, we need to check if of those preview segments and generate those which are missing
  let i = 0
  for (const segment of incompletePreviewSegments) {
    console.log(`got a segment to complete!`, segment.id)
    // so, completing a segment is a bit tricky, we need to search through all the segments
    // the ones that intersect with the preview
    
    const intersectingSegments = intersectWith(allNonPreviewNonAudioSegments, segment)
    console.log(`found ${intersectingSegments.length} intersecting segments`)

    // compute the video prompt for the active segments
    // this is not a very expensive function to run, it only concatenates the few tracks we got
    const videoPrompt = getVideoPrompt(intersectingSegments, modelsById, extraPositivePrompt)
    
    console.log(`prompt: ${videoPrompt}`)

    if (++i >= 1) {
      console.log("we artificially limit the length, for debugging")
      break
    }
  }

  return false
}
