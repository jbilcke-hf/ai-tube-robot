import { v4 as uuidv4 } from "uuid";

import { VideoInfo } from "../types/video.mts"
import { downloadClapProject } from "../huggingface/getters/downloadClapProject.mts"
import { getUser } from "../database/users.mts"
import { intersectWith } from "./intersectWith.mts"
import { getVideoPrompt } from "./getVideoPrompt.mts"
import { ClapModel } from "../clap/types.mts"
import { generateSeed } from "../utils/generateSeed.mts"
import { extractBase64 } from "../utils/extractBase64.mts"
import { uploadBlob } from "../huggingface/setters/uploadBlob.mts";
import { Credentials } from "@huggingface/hub";
import { uploadClap } from "../huggingface/setters/uploadClap.mts";
import { formatProgress } from "../utils/formatProgress.mts";
import { formatSegmentTime } from "../utils/formatSegmentTime.mts";
import { getRender, newRender } from "../generators/image/generateImageWithVideochain.mts";
import { clapConfigForceRerenderingAllPreviews, clapConfigForceRerenderingAllRenders, clapConfigUseTurboMode } from "../config.mts";
import { sleep } from "../utils/sleep.mts";
import { generateVideo } from "../generators/video/generateVideo.mts";
import { downloadMp4ToBase64 } from "../huggingface/getters/downloadMp4ToBase64.mts";
import { downloadFileAsBlob } from "../huggingface/datasets/downloadFileAsBlob.mts";
import { addBase64HeaderToWebp } from "../utils/addBase64HeaderToWebp.mts";
import { blobToWebp } from "../utils/blobToWebp.mts";

// the low-level definition format used by "3rd party apps"
export async function generateVideoFromClap({
  video,
  queuedVideos,
  publishedVideos,
}:{
  video: VideoInfo
  queuedVideos: Record<string, VideoInfo>
  publishedVideos: Record<string, VideoInfo>
}): Promise<boolean> {
  const { id, channel } = video
  console.log(` |- processing clap ${id}: "${video.label}"`)
  const user = await getUser(channel.datasetUser)

  if (!user) {
    console.log(` '- there is something wrong with the clap, we can't find the user.. aborting`)
    return false
  }


  // we need the user's own API token to recover the clap file,
  // as it might be hosted on a private channel
  const credentials: Credentials = {
    accessToken: user.hfApiToken
  }

  const clapProjectPath = video.clapUrl.split("/").pop()

  // let's get our work started!
  const {
    videoRequest,
    videoInfo,
    clapProject
  } = await downloadClapProject({
    path: clapProjectPath,
    channel,
    credentials,
  })
 
  // console.log("finally! we have our magic clap:", clapProject.meta)

  const allSegments = clapProject.segments

  const width = clapProject.meta.width
  const height = clapProject.meta.height

  const extraPositivePrompt = clapProject.meta.extraPositivePrompt

  const modelsById: Record<string, ClapModel> = {}
  clapProject.models.forEach(m => {
    modelsById[m.id] = m
  })

  const allNonRenderableSegments = allSegments.filter(s => s.category !== "preview" && s.category !== "render")
  const allNonPreviewNonAudioSegments = allNonRenderableSegments.filter(s => s.category !== "sound" && s.category !== "music")

  const previewSegments = allSegments.filter(segment => segment.category === "preview")

  const incompletePreviewSegments = 
    clapConfigForceRerenderingAllPreviews
    ? previewSegments
    : previewSegments.filter(s => s.status !== "completed" || !s.assetUrl)

  // console.log("incompletePreviewSegments (extract):", incompletePreviewSegments.slice(0, 1))
  let nbPreviewsTotal = previewSegments.length
  let nbPreviewsTodo = incompletePreviewSegments.length
  let nbPreviewsDone = nbPreviewsTotal - nbPreviewsTodo

  const renderSegments = allSegments.filter(segment => segment.category === "render")

  const incompleteRenderSegments = 
    clapConfigForceRerenderingAllRenders
    ? renderSegments
    : renderSegments.filter(s => s.status !== "completed" || !s.assetUrl)

  // console.log("incompletePreviewSegments (extract):", incompletePreviewSegments.slice(0, 1))
  let nbRendersTotal = renderSegments.length
  let nbRendersTodo = incompleteRenderSegments.length
  let nbRendersDone = nbRendersTotal - nbRendersTodo


  console.log(` |- we have ${nbPreviewsTodo} previews to generate`)

  // now, well, we need to check if of those preview segments and generate those which are missing

  let nbPreviewsGenerated = 0
  let nbRendersGenerated = 0

  let previewProgress = formatProgress(
    nbPreviewsDone + nbPreviewsGenerated,
    nbPreviewsTotal
  )

  let renderProgress = formatProgress(
    nbRendersDone + nbRendersGenerated,
    nbRendersTotal
  )

  let totalProgress = formatProgress(
    nbPreviewsDone + nbPreviewsGenerated + nbRendersDone + nbRendersGenerated,
    nbPreviewsTotal + nbRendersTotal
  )

  for (const segment of incompletePreviewSegments) {
    // console.log(`got a segment to complete!`, segment.id)
    // so, completing a segment is a bit tricky, we need to search through all the segments
    // the ones that intersect with the preview
    
 
    previewProgress = formatProgress(
      nbPreviewsDone + nbPreviewsGenerated,
      nbPreviewsTotal
    )
  
    totalProgress = formatProgress(
      nbPreviewsDone + nbPreviewsGenerated + nbRendersDone + nbRendersGenerated,
      nbPreviewsTotal + nbRendersTotal
    )
    console.log(` |- storyboards: ${nbPreviewsDone + nbPreviewsGenerated}/${nbPreviewsTotal} (${previewProgress})`)
    console.log(` |- total rendering progress: ${totalProgress}`)
    console.log(` |`)
    console.log(` |-${formatSegmentTime(segment)}`)
    const intersectingSegments = intersectWith(allNonPreviewNonAudioSegments, segment)
    // console.log(`found ${intersectingSegments.length} intersecting segments`)

    // compute the video prompt for the active segments
    // this is not a very expensive function to run, it only concatenates the few tracks we got
    const videoPrompt = getVideoPrompt(intersectingSegments, modelsById, extraPositivePrompt)
    
    // console.log(`prompt: ${videoPrompt}`)
    segment.seed = generateSeed()
    process.stdout.write(` | |- generating preview..`)

    // we got our prompt, nice! now we need to render it

    /*
    this version uses HF Inference API, which doesn't look so great
    due to the absence of a refiner

    const previewAsBase64 = await generateImageSDXL({
      positivePrompt: videoPrompt,
      negativePrompt: "",
      seed: segment.seed,
      width,
      height,
      nbSteps: 70, // <-- this is just to debug
      // guidanceScale?: number;
      // lora?: string;
    })

    if (!previewAsBase64) {
      segment.status = "error"
      segment.assetUrl = ""
      console.log(" | '- error: previewAsBase64 is empty!")
      continue
    }
    */

    const pendingPreviewRequest = await newRender({
      prompt: videoPrompt,

      negativePrompt: "", // TODO use this

      shouldRenewCache: true,

      seed: segment.seed,

      nbFrames: 1,

      width: 1024,
      height: 576,

      turbo: clapConfigUseTurboMode,
      nbSteps: clapConfigUseTurboMode ? 8 : 70,
    })

    let previewAsBase64 = ""
    // wait up to 2 minutes (120 x 1000ms)
    for (let nbAttempts = 0; nbAttempts < 120; nbAttempts++) {
      await sleep(500) // we can be hardcore with Videochain, 500ms between requests is ezpz
      const renderedPreview = await getRender(pendingPreviewRequest.renderId)
      if (renderedPreview.status === "error") {
        break
      } else if (renderedPreview.status === "completed") {
        segment.status = "completed"
        segment.assetUrl = "" // <-- important: we DO NOT want to store the base64 blob in the clap file!
        previewAsBase64 = renderedPreview.assetUrl

        process.stdout.write("\n") // important too
        // console.log(` | |- generation completed`) // ("${previewAsBase64.slice(0, 60)}"...)`)
        break
      } else {
        process.stdout.write(".") // simulate a "loader.."
      }
    }

    if (!previewAsBase64) {
      console.log(" | '- error: previewAsBase64 is empty!")
      segment.status = "error"
      segment.assetUrl = ""
      continue
    }
    // console.log("previewAsBase64:", previewAsBase64.slice(0, 100))
    // continue

    // now, here's where it gets tricky: we *could* store the binaries in the .clap file,
    // but it's just not designed for this kind of heavy-duty usage, so we need to keep them
    // "outside", typically on a CDN (for now a Hugging Face dataset)


    
    const { blob, extension } = extractBase64(previewAsBase64)
    
    const previewId = uuidv4()

    const repo = `datasets/${channel.datasetUser}/${channel.datasetName}`
    console.log(` | |- saving preview..`)
    
    const assetUrl = await uploadBlob({
      blob,
      repo,
      uploadFilePath: `projects/${video.id}/previews/${previewId}.${extension}`,
      credentials,
    })

    if (!assetUrl) {
      segment.status = "error"
      segment.assetUrl = ""
      continue
    }

    segment.assetUrl = assetUrl
    segment.status = "completed"
    
    // console.log("uploaded preview to: ", segment.assetUrl)

    // console.log("we also save the clap project..")
    console.log(` | |- saving project..`)

    await uploadClap({
      clapProject,
      repo,
      uploadFilePath: clapProjectPath,
      credentials,
    })
    console.log(` | '- done`)
    console.log(` |`)

    nbPreviewsGenerated++

    /*
    if (nbPreviewsGenerated >= 7) {
      console.log(` |- debug mode: we force a stop at ${nbPreviewsGenerated}`)
      break
    }
    */
  }

  console.log(` |`)

  const nbPreviewGenerated = nbPreviewsDone + nbPreviewsGenerated
  const nbPreviewExpected = nbPreviewsTotal
  
  if (nbPreviewGenerated < nbPreviewExpected) {
    console.log(` '- we still have ${nbPreviewExpected - nbPreviewGenerated} previews to render, but we will try again later`)
    return
  }

  console.log(` |- total rendering progress: ${totalProgress}`)

  // ----- a "render segment" is a final rendering output video chunk ------


  console.log(` |- we have ${nbRendersTotal} video chunks to generate`)
  // now this is where things are going to get tricky, because we will need to generate
  // plenty of assets, like sound effect, dialogue, music..

  // but let's start with some silent film first

  for (const segment of incompleteRenderSegments) {
    // console.log(`got a segment to complete!`, segment.id)
    // so, completing a segment is a bit tricky, we need to search through all the segments
    // the ones that intersect with the preview

    renderProgress = formatProgress(
      nbRendersDone + nbRendersGenerated,
      nbRendersTotal
    )
  
    totalProgress = formatProgress(
      nbPreviewsDone + nbPreviewsGenerated + nbRendersDone + nbRendersGenerated,
      nbPreviewsTotal + nbRendersTotal
    )
    
    console.log(` |- video chunks: ${nbRendersDone + nbRendersGenerated}/${nbRendersTotal} (${renderProgress})`)
    console.log(` |- total rendering progress: ${totalProgress}`)
    console.log(` |`)
    console.log(` |-${formatSegmentTime(segment)}`)

    /*
    const intersectingSegments = intersectWith(allNonPreviewNonAudioSegments, segment)
    // console.log(`found ${intersectingSegments.length} intersecting segments`)

    // compute the video prompt for the active segments
    // this is not a very expensive function to run, it only concatenates the few tracks we got
    const videoPrompt = getVideoPrompt(intersectingSegments, modelsById, extraPositivePrompt)
    */
    
    // console.log(`prompt: ${videoPrompt}`)
    segment.seed = generateSeed()


    process.stdout.write(` | |- generating video chunk..`)

    // we grab the first preview we see in this range
    const previewSegmentsImages = intersectWith(previewSegments, segment).filter(s => s.assetUrl)
   

    if (!previewSegmentsImages.length) {
      console.log(" | |- no preview image to use, so we will make it ourselves")
      // it is possible that there is no preview, as in the future
      // we might want to generate unsupervised movies
      // if that happens, we can just let the video generate its output from the prompt only
      const intersectingSegments = intersectWith(allNonPreviewNonAudioSegments, segment)
      // console.log(`found ${intersectingSegments.length} intersecting segments`)

      const videoChunk = await generateVideo({
        prompt: getVideoPrompt(intersectingSegments, modelsById, extraPositivePrompt),
        seed: segment.seed,
        video,
      })
      console.log(" | |- generated a new video using a brand new image")
    } else {
      // otherwise we generate using the preview image to save time
      // also note that normally there is only one match, but maybe in the future
      // there will be multiple storyboards per video chunk
      const previewImage = previewSegmentsImages[0]

      const domain = `https://huggingface.co`
      const repo = `datasets/${channel.datasetUser}/${channel.datasetName}`

      // this will contain something like this
      // /projects/2042f517-e8a0-48a8-bf3e-89e5e8c24962/previews/5757e979-b5e6-456c-a509-7ca6903d18c6.webp
      const repoPath = previewImage.assetUrl.split("/blob/main").pop()
      const extension = repoPath.split(".").pop()

      console.log(" | |- downloading the preview image..")

      // we download the clap file (which might be in a private repo)
      const blob = await downloadFileAsBlob({
        repo: `datasets/${channel.datasetUser}/${channel.datasetName}`,
        path: repoPath,
        apiKey: credentials.accessToken,
        expectedMimeType: `image/${extension}`
      })

      console.log(" | |- generating the video (might take a while)")

      const videoChunk = await generateVideo({
        image: await blobToWebp(blob),
        seed: segment.seed,
        video,
      })
      console.log(" | |- generated a video using the preview image")
    }
  }

  const nbTotalGenerated = nbPreviewsDone + nbPreviewsGenerated + nbRendersDone + nbRendersGenerated
  const nbTotalExpected = nbPreviewsTotal + nbRendersTotal

  totalProgress = formatProgress(nbTotalGenerated, nbTotalExpected)

  console.log(` |`)

  console.log(` |- total rendering progress: ${totalProgress}`)

  if (nbTotalGenerated < nbTotalExpected) {
    console.log(` '- we still have ${nbTotalExpected - nbTotalGenerated} videos to render, but we will try again later`)
    return
  }

  return false
}
