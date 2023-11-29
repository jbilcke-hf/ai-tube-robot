// we need to ability to search any dataset, so we use our own fork
import { Credentials, downloadFile, listDatasets, whoAmI } from "../libraries/huggingface/hub/src/index.mts"

import { ChannelInfo } from "../types.mts"
import { adminCredentials } from "../config.mts"
import { parseDatasetReadme } from "./parseDatasetReadme.mts"

export async function getChannels(options: {
  apiKey?: string
  owner?: string
}): Promise<ChannelInfo[]> {

  let credentials: Credentials = adminCredentials
  let owner = options?.owner

  if (options?.apiKey) {
    try {
      credentials = { accessToken: options.apiKey }
      const { name: username } = await whoAmI({ credentials })
      if (!username) {
        throw new Error(`couldn't get the username`)
      }
      // everything is in order,
      owner = username
    } catch (err) {
      console.error(err)
      return []
    }
  }

  let channels: ChannelInfo[] = []
  
  const prefix = "ai-tube-"

  let search = owner
    ? { owner } // search channels of a specific user
    : prefix // global search (note: might be costly?)

  for await (const { id, name, likes, updatedAt } of listDatasets({
    search,
    credentials
  })) {

    // TODO: need to handle better cases where the username is missing

    const chunks = name.split("/")
    const [datasetUser, datasetName] = chunks.length === 2
      ? chunks
      : [name, name]

    // console.log(`found a candidate dataset "${datasetName}" owned by @${datasetUser}`)

    if (!datasetName.startsWith(prefix)) {
      continue
    }

    // ignore the video index
    if (datasetName === "ai-tube-index") {
      continue
    }

    const slug = datasetName.replaceAll(prefix, "")
    
    // console.log(`found an AI Tube channel: "${slug}"`)

    // TODO parse the README to get the proper label
    let label = slug.replaceAll("-", " ")

    const thumbnail = ""
    let prompt = ""
    let description = ""
    let tags: string[] = []

    // console.log(`going to read datasets/${name}`)
    try {
      const response = await downloadFile({
        repo: `datasets/${name}`,
        path: "README.md",
        credentials
      })
      const readme = await response?.text()

      const ParsedDatasetReadme = parseDatasetReadme(readme)
      
      // console.log("ParsedDatasetReadme: ", ParsedDatasetReadme)

  
      prompt = ParsedDatasetReadme.prompt
      label = ParsedDatasetReadme.pretty_name
      description = ParsedDatasetReadme.description

      const prefix = "ai-tube:"

      tags = ParsedDatasetReadme.tags
        .filter(tag => tag.startsWith(prefix)) // remove any tag not belonging to us
        .map(tag => tag.replaceAll(prefix, "").trim()) // remove the prefix
        .filter(tag => tag) // remove empty tags
      
      
    } catch (err) {
      console.log("failed to read the readme:", err)
    }

    const channel: ChannelInfo = {
      id,
      datasetUser,
      datasetName,
      slug,
      label,
      description,
      thumbnail,
      prompt,
      likes,
      tags,
      updatedAt: updatedAt.toISOString()
    }

    channels.push(channel)
  }

  return channels
}
