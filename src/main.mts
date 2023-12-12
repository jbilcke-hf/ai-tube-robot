import { skipProcessingChannels, skipProcessingQueue } from "./config.mts"
import { concatenateAudio } from "./core/concatenateAudio.mts"
import { generateMusicAsBase64 } from "./core/generateMusicAsBase64.mts"
import { lock } from "./core/lock.mts"
import { processChannels } from "./core/processChannels.mts"
import { processQueue } from "./core/processQueue.mts"
import { writeBase64ToFile } from "./core/writeBase64ToFile.mts"

export const main = async () => {
  const audioTracks = await generateMusicAsBase64({
    video: {
      music: "minimal german techno",
    } as any,
    durationInSec: 2 * 60
  })

  console.log("write audio, for debugging")
  await Promise.all(audioTracks.map(async (track, i) => {
    await writeBase64ToFile(track, `test_juju_${i}.wav`)
  }))

  console.log("concatenating audio")
  const concatenatedAudio = await concatenateAudio({ audioTracks })
  console.log("concatenatedAudio:", concatenatedAudio)

}

export const main2 = async () => {
  let delayInSeconds = 5 * 60 // let's check every 5 minutes

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

    if (!skipProcessingChannels) {
      try {
        let nbNewlyEnqueued = await processChannels()
        console.log(`main(): added ${nbNewlyEnqueued} new items to queue`)
      } catch (err) {
        console.log(`main(): failed to process channels: ${err}`)
      }

      console.log("\n---------------------------------------------------\n")
    }

    if (!skipProcessingQueue) {
      try {
        let nbProcessed = await processQueue()
        console.log(`main(): processed ${nbProcessed} queued items`)
      } catch (err) {
        console.log(`main(): failed to process: ${err}`)
      }
    }
    // console.log("\n---------------------------------------------------\n")
    // console.log("main(): releasing lock")
    lock.isLocked = false
  }

  // loop every hour
  setTimeout(() => {
    main()
  }, delayInSeconds * 1000)
}
