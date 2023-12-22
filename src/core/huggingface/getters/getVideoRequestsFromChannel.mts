import { listFiles } from "../../../libraries/huggingface/hub/src/index.mts"
import { ChannelInfo, VideoRequest } from "../../../types.mts"

import { downloadFileAsText } from "../datasets/downloadFileAsText.mts"
import { getCredentials } from "../../auth/getCredentials.mts"
import { parseDatasetPrompt } from "../../parsers/parseDatasetPrompt.mts"
import { parsePromptFileName } from "../../parsers/parsePromptFileName.mts"
import { parseVideoModelName } from "../../parsers/parseVideoModelName.mts"
import { computeOrientationProjectionWidthHeight } from "../utils/computeOrientationProjectionWidthHeight.mts"

/**
 * Return all the videos requests created by a user on their channel
 *
 */
export async function getVideoRequestsFromChannel({
  channel,
  apiKey,
  renewCache,
  neverThrow,
}: {
  channel: ChannelInfo
  apiKey?: string
  renewCache?: boolean
  neverThrow?: boolean
}): Promise<VideoRequest[]> {

  try {
    const { credentials } = await getCredentials(apiKey)

    let videos: Record<string, VideoRequest> = {}

    const repo = `datasets/${channel.datasetUser}/${channel.datasetName}`

    // console.log(`scanning ${repo}`)

    for await (const file of listFiles({
      repo,
      // recursive: true,
      // expand: true,
      credentials,
      requestInit: renewCache
        ? { cache: "no-cache" }
        : undefined
    })) {

      const filePath = file.path.toLowerCase().trim()
      // TODO we should add some safety mechanisms here:
      // skip lists of files that are too long
      // skip files that are too big
      // skip files with file.security.safe !== true

      // console.log("file.path:", file.path)
      /// { type, oid, size, path }
      if (filePath === "readme.md") {
        // console.log("found the README")
        // TODO: read this readme to extract channel information

      } else if (filePath.startsWith("prompt_") && filePath.endsWith(".md")) {
        
        const id = parsePromptFileName(filePath)

        // console.log("id:", id)
        if (!id) { continue }

        const rawMarkdown = await downloadFileAsText({
          repo,
          path: file.path, // be sure to use the original file.path (with capitalization if any) and not filePath
          apiKey,
          renewCache,
          neverThrow: true,
        })

        if (!rawMarkdown) {
          // console.log(`markdown file is empty, skipping`)
          continue
        }

        const { title, description, tags, prompt, thumbnail, model, lora, style, music, voice, orientation } = parseDatasetPrompt(rawMarkdown, channel)
        
        if (!title) {
          console.log("dataset prompt file is unparseable: the title is missing")
          continue
        }

        if (!description) {
          //console.log("dataset prompt file is unparseable: the description is missing")
          // continue
        }

        if (!prompt) {
          console.log("dataset prompt file is unparseable: the prompt is missing")
          continue
        }

        // console.log("prompt parsed markdown:", { title, description, tags })

        let thumbnailUrl =
          thumbnail.startsWith("http")
            ? thumbnail
            : (thumbnail.endsWith(".webp") || thumbnail.endsWith(".jpg") || thumbnail.endsWith(".jpeg"))
            ? `https://huggingface.co/${repo}/resolve/main/${thumbnail}`
            : ""

        const video: VideoRequest = {
          id,
          label: title,
          description: description || title,
          prompt,
          thumbnailUrl,
          model,
          lora,
          style,
          voice,
          music,
          updatedAt: file.lastCommit?.date || new Date().toISOString(),
          tags: Array.isArray(tags) && tags.length ? tags : channel.tags,
          channel,
          duration: 0,
          ...computeOrientationProjectionWidthHeight({
            lora,
            orientation,
            // projection, // <- will be extrapolated from the LoRA for now
          }),
        }

        videos[id] = video

      } else if (filePath.endsWith(".mp4")) {
        // console.log("found a video:", file.path)
      }
    }

    return Object.values(videos)
  } catch (err) {
    if (neverThrow) {
      console.error(`getVideoRequestsFromChannel():`, err)
      return []
    } else {
      throw err
    }
  }
}
