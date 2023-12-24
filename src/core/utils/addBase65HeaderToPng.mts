export function addBase64HeaderToPng(base64Data: string) {
  if (typeof base64Data !== "string" || !base64Data) {
    return ""
  }
  if (base64Data.startsWith('data:image/png;base64,')) {
    return base64Data
  } else {
    return `data:image/png;base64,${base64Data}`
  }
}