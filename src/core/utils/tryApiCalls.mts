import { sleep } from "./sleep.mts"

const sec = 1000
const min = 60 *sec

export async function tryApiCalls<T>({
  func,
  debug = false,
  failureMessage = "failed to call the endpoint",
  delays = [
    5 *sec,
    15 *sec,
    40 *sec, // total 1 min wait time

    //at this stage, if it is so slow it means we are probably waking up a model
    // which is a slow operation (takes ~5 min)

    2 *min, //     ~ 3 min ~
    1 *min, //     ~ 4 min ~
    1 *min, //     ~ 5 min ~
  ]
}: {
  func: () => Promise<T>
  debug?: boolean
  failureMessage?: string
  delays?: number[]
}) {
  for (let i = 0; i < delays.length; i++) {
    if (i > 0) {
      await sleep(delays[i])
    }
    try {
      const result = await func()
      return result
    } catch (err) {
      if (debug) { console.error(err) }
    }
  }

  throw new Error(`${failureMessage} after ${delays.length} attempts`)
}
