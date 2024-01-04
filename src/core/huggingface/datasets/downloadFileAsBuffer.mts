
import { downloadFile } from "../../../libraries/huggingface/hub/src/index.mts"

import { getCredentials } from "../../auth/getCredentials.mts"

export async function downloadFileAsBuffer({
  repo,
  path,
  apiKey,
  expectedMimeType = "text/plain",
  renewCache = true,
  neverThrow = true
}: {
  repo: string

  path: string

  apiKey?: string

  expectedMimeType?: string

  /**
   * Force renewing the cache
   * 
   * False by default
   */
  renewCache?: boolean

  /**
   * If set to true, this function will never throw an exception
   * this is useful in workflow where we don't care about what happened
   * 
   * False by default
   */
  neverThrow?: boolean
}): Promise<Buffer> {
  try {
    const { credentials } = await getCredentials(apiKey)

    // make sure we have a clean path
    path = path.split("/resolve/main/").pop()

    const response = await downloadFile({
      repo,
      path,
      credentials,
      requestInit: renewCache
        ? { cache: "no-cache" }
        : undefined
    })
    
    if (!response) {
      throw new Error("missing response")
    }

    const arrayBuffer = await response.arrayBuffer()

    return Buffer.from(arrayBuffer)
  } catch (err) {
    if (neverThrow) {
      console.error(`downloadFileAsBuffer():`, err)

      return Buffer.from([])
    } else {
      throw err
    }
  }
}