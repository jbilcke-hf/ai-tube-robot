import { addBase64HeaderToMp4 } from "./addBase64HeaderToMp4.mts"

export async function bufferToMp4(buffer: Buffer) {
  return addBase64HeaderToMp4(buffer.toString('base64'))
}