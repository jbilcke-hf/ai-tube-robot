import { Credentials } from "@huggingface/hub"

import { ClapProject } from "../../clap/types.mts"
import { serializeClap } from "../../clap/serializeClap.mts"

import { uploadBlob } from "./uploadBlob.mts"

export async function uploadClap({
  clapProject,
  uploadFilePath,
  repo,
  credentials,
}: {
  clapProject: ClapProject
  uploadFilePath: string
  repo: string
  credentials: Credentials
}): Promise<boolean> {
 
  const blob = await serializeClap(clapProject)

  const result = await uploadBlob({
    blob,
    uploadFilePath,
    repo,
    credentials,
  })
  
  return result ? true : false
}