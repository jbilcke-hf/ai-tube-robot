import { lock } from "./core/lock.mts"
import { processChannels } from "./core/processChannels.mts"
import { processQueue } from "./core/processQueue.mts"

export const main = async () => {
  let delayInSeconds = 60 * 60

  console.log("main(): checking lock..")
  if (lock.isLocked) {
    delayInSeconds = 30
  } else {
    console.log("main(): locking, going to process tasks..")
    lock.isLocked = true

    try {
      let nbNewlyEnqueued = await processChannels()
      console.log(`main(): added ${nbNewlyEnqueued} new items to queue`)
    } catch (err) {
      console.log(`main(): failed to process: ${err}`)
    }

    try {
      let nbProcessed = await processQueue()
      console.log(`main(): processed ${nbProcessed} queued items`)
    } catch (err) {
      console.log(`main(): failed to process: ${err}`)
    }

    console.log("main(): releasing lock")
    lock.isLocked = false
  }

  // loop every hour
  setTimeout(() => {
    main()
  }, delayInSeconds * 1000)
}