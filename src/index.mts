
import express from "express"


import { main } from "./main.mts"

import { UpdateQueueRequest, UpdateQueueResponse } from "./types.mts"
import { updateQueueWithNewRequests } from "./core/updateQueueWithNewRequests.mts"

const app = express()
const port = 7860

process.on('unhandledRejection', (reason: string, p: Promise<any>) => {
  console.error('Unhandled Rejection at:', p, 'reason:', reason);
})

process.on('uncaughtException', (error: Error) => {
  console.error(`Caught exception: ${error}\n` + `Exception origin: ${error.stack}`);
})

// fix this error: "PayloadTooLargeError: request entity too large"
// there are multiple version because.. yeah well, it's Express!
// app.use(bodyParser.json({limit: '50mb'}));
//app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));

// ask the robot to sync a specific channel,
// or all channels of the platform
// (the admin api key is required for the later)
app.post("/update-queue", async (req, res) => {

  const request = req.body as UpdateQueueRequest

  const response: UpdateQueueResponse = {
    error: "unknown error",
    nbUpdated: 0
  }

  try {
    response.nbUpdated = await updateQueueWithNewRequests(request.apiKey, request.channel)
    response.error = ""
  } catch (err) {
    console.log("failed to aupdate the queue")
    console.log(err)
    response.nbUpdated = 0
    response.error = `failed to update the queue: ${err}`
  }

  if (response.error) {
    // console.log("server error")
    res.status(500)
    res.write(JSON.stringify(response))
    res.end()
    return
  } else {
    // console.log("all good")
    res.status(200)
    res.write(JSON.stringify(response))
    res.end()
    return
  }
})

app.listen(port, () => {
  console.log(`Open http://localhost:${port}`)
  main()
})