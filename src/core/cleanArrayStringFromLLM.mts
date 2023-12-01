export function cleanArrayStringFromLLM(input: string): string {
  let str = (
    `${input || ""}`
    // a summary of all the weird hallucinations I saw it make..
    .replaceAll(`"\n`, `",\n`) // fix missing commas at the end of a line

    .replaceAll("}", "]")
    .replaceAll("]]", "]")
    .replaceAll("[[", "[")
    .replaceAll("{", "[")
    .replaceAll(",,", ",")

    .replaceAll(/"\S*,?\S*\]/gi, `"]`)

    // this removes the trailing commas (which are valid in JS but not JSON)
    .replace(/,(?=\s*?[\}\]])/g, '')
  )

  return str
}