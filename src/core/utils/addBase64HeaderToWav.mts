export function addBase64HeaderToWav(base64Data: string) {
  if (typeof base64Data !== "string" || !base64Data) {
    return ""
  }
  if (base64Data.startsWith('data:')) {
    if (base64Data.startsWith('data:audio/wav;base64,')) {
      return base64Data
    } else {
      throw new Error("fatal: the input string is NOT a WAV!")
    }
  } else {
    return `data:audio/wav;base64,${base64Data}`
  }
}