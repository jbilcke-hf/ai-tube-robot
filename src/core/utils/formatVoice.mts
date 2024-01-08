import { ClapVoice } from "../clap/types.mts"

export function formatVoice(voice: ClapVoice) {
  if (!voice) { return "no voice" }
  
  return `#${
    voice.voiceId
  } "${
    voice.name || "anonymous"
  }" (${
    voice.appearance || "neutral"
  } ${
    voice.age || "?? "
  }yo ${
    voice.gender || "person"
  }, ${
    voice.timbre || "neutral"
  } voice, ${
    voice.region || "unknown region"
  })`
}