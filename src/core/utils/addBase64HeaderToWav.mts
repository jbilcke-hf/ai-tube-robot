export function addBase64HeaderToWav(base64Data: string) {
  if (typeof base64Data !== "string" || !base64Data) {
    return ""
  }
  if (base64Data.startsWith('data:audio/wav,')) {
    return base64Data
  } else {
    return `data:audio/wav;base64,${base64Data}`
  }
}