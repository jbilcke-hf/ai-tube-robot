import { promises as fs } from "node:fs"
import os from "node:os"
import path from "node:path"

import { v4 as uuidv4 } from "uuid"

import OriginalElevenLabs from "../../../libraries/elevenlabs/elevenlabs.mts"

const state = {
  isReady: false,
  outputDir: "./sandbox",
  instance: undefined as OriginalElevenLabs,
}

export async function ElevenLabs() {
  if (state.isReady) {
    state.outputDir = await fs.mkdtemp(path.join(os.tmpdir(), uuidv4()))

    state.instance = new OriginalElevenLabs({
      apiKey: `${process.env.AI_TUBE_ELEVEN_LABS_API_TOKEN || ""}`,
      outputFolder: state.outputDir,
    });
    state.isReady = true
  }

  return state.instance
}
