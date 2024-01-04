import { addBase64HeaderToWebp } from "./addBase64HeaderToWebp.mts"

export async function bufferToWebp(buffer: Buffer) {
  return addBase64HeaderToWebp(buffer.toString('base64'))
}