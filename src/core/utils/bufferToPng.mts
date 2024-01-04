import { addBase64HeaderToPng } from "./addBase64HeaderToPng.mts"

export async function bufferToPng(buffer: Buffer) {
  return addBase64HeaderToPng(buffer.toString('base64'))
}