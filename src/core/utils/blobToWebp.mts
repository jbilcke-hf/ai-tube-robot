import { addBase64HeaderToWebp } from "./addBase64HeaderToWebp.mts"

export async function blobToWebp(blob: Blob) {
  return addBase64HeaderToWebp(Buffer.from(await blob.text()).toString('base64'))
}