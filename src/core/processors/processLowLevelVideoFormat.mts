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

// the low-level definition format used by "3rd party apps"
export async function processLowLevelVideoFormat({
  video,
  queuedVideos,
  publishedVideos
}:{
  video: VideoInfo
  queuedVideos: Record<string, VideoInfo>
  publishedVideos: Record<string, VideoInfo>
}): Promise<boolean> {
  const { id } = video
  console.log(` |- processing video ${id}: "${video.label}"`)
  console.log(` \\`)

  return false
}
