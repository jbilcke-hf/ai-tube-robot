import { adminCredentials, defaultVideoModel, defaultVideoOrientation } from "../config.mts"
import { Credentials, downloadFile, whoAmI } from "../../libraries/huggingface/hub/src/index.mts"
import { parseDatasetReadme } from "./parseDatasetReadme.mts"
import { ChannelInfo } from "../types/structures.mts"
import { VideoGenerationModel, VideoOrientation } from "../types/atoms.mts"

export async function parseChannel(options: {
  id: string
  name: string
  likes: number
  updatedAt: Date
  apiKey?: string
  owner?: string
  // ownerId?: string
  renewCache?: boolean
}): Promise<ChannelInfo> {
  // console.log("getChannels")
  let credentials: Credentials = adminCredentials
  let owner = options.owner || ""
  // let ownerId = options.ownerId || ""

  if (options.apiKey) {
    try {
      credentials = { accessToken: options.apiKey }
      const { id: userId, name: username } = await whoAmI({ credentials })
      if (!username) {
        throw new Error(`couldn't get the username`)
      }
      // everything is in order
      // ownerId = userId
      owner = username
    } catch (err) {
      console.error(err)
      throw err
    }
  }


  const prefix = "ai-tube-"

  const name = options.name

  const chunks = name.split("/")
  const [datasetUser, datasetName] = chunks.length === 2
    ? chunks
    : [name, name]

  // console.log(`found a candidate dataset "${datasetName}" owned by @${datasetUser}`)
  
  // ignore channels which don't start with ai-tube
  if (!datasetName.startsWith(prefix)) {
    throw new Error("this is not an AI Tube channel")
  }

  // ignore the video index
  if (datasetName === "ai-tube-index") {
    throw new Error("cannot get channel of ai-tube-index: time-space continuum broken!")
  }

  const slug = datasetName.replaceAll(prefix, "")
  
  // console.log(`found an AI Tube channel: "${slug}"`)

  // TODO parse the README to get the proper label
  let label = slug.replaceAll("-", " ")

  // we assume legacy videos are using HotshotXL
  let model: VideoGenerationModel = defaultVideoModel
  let lora = ""
  let style = ""
  let thumbnail = ""
  let prompt = ""
  let description = ""
  let voice = ""
  let music = ""
  let tags: string[] = []
  let orientation: VideoOrientation = defaultVideoOrientation

  // console.log(`going to read datasets/${name}`)
  try {
    const response = await downloadFile({
      repo: `datasets/${name}`,
      path: "README.md",
      credentials
    })
    const readme = await response?.text()

    const parsedDatasetReadme = parseDatasetReadme(readme)
    
    // console.log("parsedDatasetReadme: ", parsedDatasetReadme)

    prompt = parsedDatasetReadme.prompt
    label = parsedDatasetReadme.pretty_name
    description = parsedDatasetReadme.description
    thumbnail = parsedDatasetReadme.thumbnail || "thumbnail.jpg"
    model = parsedDatasetReadme.model || defaultVideoModel
    lora = parsedDatasetReadme.lora || ""
    style = parsedDatasetReadme.style || ""
    voice = parsedDatasetReadme.voice || ""
    music = parsedDatasetReadme.music || ""
    orientation = parsedDatasetReadme.orientation || defaultVideoOrientation

    thumbnail =
      thumbnail.startsWith("http")
        ? thumbnail
        : (thumbnail.endsWith(".jpg") || thumbnail.endsWith(".jpeg"))
        ? `https://huggingface.co/datasets/${name}/resolve/main/${thumbnail}`
        : ""

    tags = parsedDatasetReadme.tags
      .map(tag => tag.trim()) // clean them up
      .filter(tag => tag) // remove empty tags
    
  } catch (err) {
    // console.log("failed to read the readme:", err)
  }

  const channel: ChannelInfo = {
    id: options.id,
    // datasetUserId: ownerId,
    datasetUser,
    datasetName,
    slug,
    label,
    description,
    model,
    lora,
    style,
    voice,
    music,
    thumbnail,
    prompt,
    likes: options.likes,
    tags,
    updatedAt: options.updatedAt.toISOString(),
    orientation,
  }

  return channel
}
