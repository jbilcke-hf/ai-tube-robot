import { VideoInfo } from "../types.mts"
import { deleteFileFromDataset } from "./deleteVideoFromDataset.mts"
import { formatPromptFileName } from "./formatPromptFileName.mts"

export async function deleteVideoRequest({
  video,
  apiKey,
  neverThrow,
}: {
   video: VideoInfo
   apiKey: string
   neverThrow?: boolean
}): Promise<boolean> {
  const repo = `datasets/${video.channel.datasetUser}/${video.channel.datasetName}`
  const { fileName } = formatPromptFileName(video.id)
  return deleteFileFromDataset({
    repo,
    path: fileName,
    apiKey,
    neverThrow,
  })
}