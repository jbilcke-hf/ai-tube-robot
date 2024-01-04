import { ElevenLabs } from "./elevenlabs.mts";


export async function generateSpeech({
  text,
  // voice
}: {
  text: string
  // voice: string
}) {
  const api = await ElevenLabs()

  const voiceId = "ITUwstSJYbxOpjLTub5u"
  
  // Converts text to speech, saves the file to the output folder and returns the relative path to the file.
  // Output file is in the following format: TTS_date-time.mp3
  // Returns an object with the following structure: { code: CODE, message: "STATUS_MESSAGE" }
  await api.tts(
    text,
    voiceId
  )
}