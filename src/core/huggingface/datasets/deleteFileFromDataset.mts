import { deleteFile } from "../../../libraries/huggingface/hub/src/index.mts"

import { getCredentials } from "../../auth/getCredentials.mts"

export async function deleteFileFromDataset({
  repo,
  path,
  apiKey,
  neverThrow = false
}: {
  repo: string

  path: string

  apiKey?: string

  /**
   * If set to true, this function will never throw an exception
   * this is useful in workflow where we don't care about what happened
   * 
   * False by default
   */
  neverThrow?: boolean
}): Promise<boolean> {
  try {
    const { credentials } = await getCredentials(apiKey)

    await deleteFile({
      repo,
      path,
      credentials
    })
    return true
  } catch (err) {
    if (neverThrow) {
      console.error(`deleteVideoFromDataset():`, err)
      return false
    } else {
      throw err
    }
  }
}