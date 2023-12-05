export function addBase64HeaderToMp4(base64Data: string) {
  if (base64Data.startsWith('data:video/mp4;base64,')) {
    return base64Data
  } else {
    return `data:video/mp4;base64,${base64Data}`
  }
}