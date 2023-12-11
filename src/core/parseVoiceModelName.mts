
export function parseVoiceModelName(text: any, defaultToUse: string): { voice: string, muted: boolean } {
  const rawModelString = `${text || ""}`.trim().toLowerCase()

  let muted = false

  let voice = "Cloée"

  if (
    rawModelString === "mute" ||
    rawModelString === "muted" ||
    rawModelString === "silent" ||
    rawModelString === "silence" ||
    rawModelString === "none") {
    muted = true
  }

  if (
    rawModelString === "cloee" || 
    rawModelString === "cloe" || 
    rawModelString === "cloée"
  ) {
    voice = "Cloée"
  }

  if (
    rawModelString === "julian"
  ) {
    voice = "Julian"
  }

  return{
    voice: "Cloée",
    muted
  }
}