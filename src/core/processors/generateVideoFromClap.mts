import { v4 as uuidv4 } from "uuid";

import { VideoInfo } from "../types/video.mts"
import { downloadClapProject } from "../huggingface/getters/downloadClapProject.mts"
import { getUser } from "../database/users.mts"
import { intersectWith } from "./intersectWith.mts"
import { getVideoPrompt } from "./getVideoPrompt.mts"
import { ClapModel } from "../clap/types.mts"
import { generateImageSDXL } from "../generators/image/generateImageWithSDXL.mts"
import { generateSeed } from "../utils/generateSeed.mts"
import { extractBase64 } from "../utils/extractBase64.mts"
import { uploadBlob } from "../huggingface/setters/uploadBlob.mts";
import { Credentials } from "@huggingface/hub";
import { uploadClap } from "../huggingface/setters/uploadClap.mts";
import { formatProgress } from "../utils/formatProgress.mts";
import { formatSegmentTime } from "../utils/formatSegmentTime.mts";
import { getRender, newRender } from "../generators/image/generateImageWithVideochain.mts";
import { clapConfigForceRerenderingAllPreview, clapConfigUseTurboMode } from "../config.mts";
import { sleep } from "../utils/sleep.mts";

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

  const previewSegments = allSegments.filter(segment => segment.category === "preview")
  // console.log(`identified ${previewSegments.length} preview segments`)

  const allNonPreviewSegments = allSegments.filter(s => s.category !== "preview" && s.category !== "render")
  const allNonPreviewNonAudioSegments = allNonPreviewSegments.filter(s => s.category !== "sound" && s.category !== "music")

  // const renderingSegments = clap.clapProject.segments.filter(segment => segment.category === "render")
  // console.log(`identified ${renderingSegments.length} rendering segments`)


  const incompletePreviewSegments = 
    clapConfigForceRerenderingAllPreview
    ? previewSegments
    : previewSegments.filter(s => s.status !== "completed" || !s.assetUrl)

  // console.log("incompletePreviewSegments (extract):", incompletePreviewSegments.slice(0, 1))
  const nbPreviewsTotal = previewSegments.length
  const nbPreviewsTodo = incompletePreviewSegments.length
  const nbPreviewsDone = nbPreviewsTotal - nbPreviewsTodo


  console.log(` |- we have ${nbPreviewsTodo} previews to generate`)

  // now, well, we need to check if of those preview segments and generate those which are missing

  let nbPreviewsGenerated = 0
  for (const segment of incompletePreviewSegments) {
    // console.log(`got a segment to complete!`, segment.id)
    // so, completing a segment is a bit tricky, we need to search through all the segments
    // the ones that intersect with the preview
    

    const previewProgress = formatProgress(nbPreviewsDone + nbPreviewsGenerated, nbPreviewsTotal)

    console.log(` |- progress: ${previewProgress} (done ${nbPreviewsDone + nbPreviewsGenerated }/${nbPreviewsTotal})`)
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
        console.log(` | |- generation completed`) // ("${previewAsBase64.slice(0, 60)}"...)`)
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
    console.log(` | '- success!`)
    console.log(` |`)

    nbPreviewsGenerated++

    /*
    if (nbPreviewsGenerated >= 7) {
      console.log(` |- debug mode: we force a stop at ${nbPreviewsGenerated}`)
      break
    }
    */
  }

  // ok, so all of this was just a pre-requisite, in case it was not generated beforehand
  // we now need to generate the actual videos!

  const previewProgress = formatProgress(nbPreviewsDone + nbPreviewsGenerated, nbPreviewsTotal)

  console.log(` |- progress: ${previewProgress} (done ${nbPreviewsDone + nbPreviewsGenerated}/${nbPreviewsTotal})`)
  console.log(` '- finished`)

  return false
}
