import { ClapModelGender, ClapModelRegion, ClapVoice } from "../../clap/types.mts"

// this is based on sound, not look
const CHILD = 10
const YOUNG = 20
const ADULT = 40
const OLD = 60


const voiceDatabase = [
  {
    name: "Jake",
    gender: "male",
    age: OLD,
    region: "american",
    timbre: "neutral",
    appearance: "serious",
    voiceVendor: "ElevenLabs",
    voiceId: "6e9YSmzqi4gOq93r251Z"
  },
  {
    name: "Ashlee",
    gender: "female",
    age: YOUNG,
    region: "american",
    timbre: "neutral",
    appearance: "neutral",
    voiceVendor: "ElevenLabs",
    voiceId: "A6X0qieOFWEhvioWeZLJ"
  },
  {
    name: "Amelia",
    gender: "female",
    age: YOUNG,
    region: "australian",
    timbre: "neutral",
    appearance: "neutral",
    voiceVendor: "ElevenLabs",
    voiceId: "HvPON70ZNstgNIDqr5ek"
  },
  {
    name: "Jazzy",
    gender: "female",
    age: YOUNG,
    region: "american",
    timbre: "deep",
    appearance: "neutral",
    voiceVendor: "ElevenLabs",
    voiceId: "v6NGbewF8ClrHlyMRNNi"
  },
  {
    name: "Calaisia",
    gender: "female",
    age: ADULT,
    region: "american",
    timbre: "deep",
    appearance: "friendly",
    voiceVendor: "ElevenLabs",
    voiceId: "Rw5oY0xaxXpSuO5PeMhg"
  },
  {
    name: "Malthus",
    gender: "male",
    age: YOUNG,
    region: "american",
    timbre: "neutral",
    appearance: "neutral",
    voiceVendor: "ElevenLabs",
    voiceId: "7LL1QR7uZnTs2jtV3Q3I"
  },
  {
    name: "Axel",
    gender: "male",
    age: YOUNG,
    region: "american",
    timbre: "neutral",
    appearance: "neutral",
    voiceVendor: "ElevenLabs",
    voiceId: "PmIBsGFTzYpzvm3UZ1Qt"
  }

// make sure we use a consistent order, to make results reproducible
].sort((a, b) => a.voiceId.localeCompare(b.voiceId)) as ClapVoice[]

const defaultVoice = voiceDatabase[0]

// return a list of potential voices matching the given criteria
// note: it is guaranteed that there will always be at least one result
export function getVoices({
  age = YOUNG,
  gender = "female",
  region = "american"
}: {
  age?: number
  gender?: ClapModelGender
  region?: ClapModelRegion
} = {}): ClapVoice[] {

  // -------------------------------------------------------------------------------
  // first the most important criteria: the voice gender, which impacts the timbre
  // -------------------------------------------------------------------------------
  let voices =
    gender === "male" || gender === "female"
    ? voiceDatabase.filter(voice => voice.gender === gender)
    : voiceDatabase

  // -------------------------------------------------------------------------------
  // then the age, which also impacts the timbre greatly
  // -------------------------------------------------------------------------------
  
  // sort from young to old
  voices = voices.sort((a, b) => a.age - b.age)

  let finalVoices: ClapVoice[] = []
  for (const voice of voices) {
    if (voice.age > age) { break }
    finalVoices.push(voice)
  }


  // -------------------------------------------------------------------------------
  // finally, if requested AND available, we try to add some regionalization
  // -------------------------------------------------------------------------------
  if (region) {
    finalVoices = finalVoices.filter(voice => voice.region === region)
  }

  if (!finalVoices.length) { return [defaultVoice] }

  return finalVoices
}


// return the first voice matching the critera
// note: it is guaranteed that it always return a result
export function getVoice({
  age = YOUNG,
  gender = "female",
  region = "american",
  voiceId,
}: {
  age?: number
  gender?: ClapModelGender
  region?: ClapModelRegion
  voiceId?: string
} = {}): ClapVoice {
  if (voiceId) {
    const found = voiceDatabase.find(v => v.voiceId === voiceId)
    if (found) {
      return found
    }
  }
  
  return getVoices({ age, gender, region })[0]
}