import { robotRole, skipProcessingChannels, skipProcessingQueue, testUserApiKey } from "./config.mts"
import { lock } from "./utils/lock.mts"
import { processChannels } from "./processChannels.mts"
import { processQueue } from "./processQueue.mts"
import { processUpscaling } from "./processUpscaling.mts"
import { getChannels } from "./huggingface/getters/getChannels.mts"
import { ChannelInfo } from "./types/structures.mts"
import { getVideoRequestsFromChannel } from "./huggingface/getters/getVideoRequestsFromChannel.mts"
import { VideoInfo } from "./types/video.mts"
import { VideoRequest } from "./types/requests.mts"
import { processLowLevelVideoFormat } from "./processors/generateVideoFromClap.mts"

export const main1 = async () => {
  // const channels = await getChannels({ apiKey: testUserApiKey })
  // console.log("channels:", channels)

  const channel: ChannelInfo = {
    id: '658de05189f1ff046308d029',
    datasetUser: 'jbilcke',
    datasetName: 'ai-tube-mainstream-movies',
    slug: 'mainstream-movies',
    label: 'Mainstream Movies',
    description: 'A channel generating mainstream movies. This is for research only!',
    model: 'SVD',
    lora: '',
    style: '',
    voice: '',
    music: '',
    thumbnail: 'https://huggingface.co/datasets/jbilcke/ai-tube-mainstream-movies/resolve/main/thumbnail.jpg',
    prompt: '',
    likes: 0,
    tags: [ 'Movie' ],
    updatedAt: '2023-12-30T16:11:54.000Z',
    orientation: 'landscape'
  }

  // const videos = await getVideoRequestsFromChannel({ channel, apiKey: testUserApiKey })
  // console.log("videos:", videos)

  const videoRequest: VideoRequest = {
    id: '88c7ad16-54f4-4034-82e4-6ad883cbdd4b',
    label: 'Toy Story',
    description: '',
    prompt: '',
    model: 'SVD',
    style: '',
    lora: '',
    voice: '',
    music: '',
    thumbnailUrl: '',

    clapUrl: 'https://huggingface.co/datasets/jbilcke/ai-tube-mainstream-movies/resolve/main/Toy Story.clap',
    updatedAt: '2023-12-30T23:57:42.323Z',
    tags: [ 'Movie' ],
    channel: {
      id: '658de05189f1ff046308d029',
      datasetUser: 'jbilcke',
      datasetName: 'ai-tube-mainstream-movies',
      slug: 'mainstream-movies',
      label: 'Mainstream Movies',
      description: 'A channel generating mainstream movies. This is for research only!',
      model: 'SVD',
      lora: '',
      style: '',
      voice: '',
      music: '',
      thumbnail: 'https://huggingface.co/datasets/jbilcke/ai-tube-mainstream-movies/resolve/main/thumbnail.jpg',
      prompt: '',
      likes: 0,
      tags: [],
      updatedAt: '2023-12-30T16:11:54.000Z',
      orientation: 'landscape'
    },
    duration: 0,
    orientation: 'landscape',
  }

  console.log("calling process channels:")
  await processChannels()
}

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

    if (robotRole === "UPSCALE") {
       await processUpscaling()
    } else {
      if (!skipProcessingChannels) {
        try {
          let nbNewlyEnqueuedPublicVideos = await processChannels()
          console.log(`main(): added ${nbNewlyEnqueuedPublicVideos} public videos to the queue`)
        } catch (err) {
          console.log(`main(): failed to process public channels: ${err}`)
        }

        console.log("\n---------------------------------------------------\n")
      }

      if (!skipProcessingQueue) {
        try {
          let nbProcessed = await processQueue()
          console.log(`main(): generated ${nbProcessed} videos`)
        } catch (err) {
          console.log(`main(): failed to process something in the queue: ${err}`)
        }
      }
    }
    // }
    // console.log("\n---------------------------------------------------\n")
    // console.log("main(): releasing lock")
    lock.isLocked = false
  }

  // loop every hour
  setTimeout(() => {
    main()
  }, delayInSeconds * 1000)
}
