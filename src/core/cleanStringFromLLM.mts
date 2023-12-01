export function cleanStringFromLLM(text: string) {
  return (
    text
    .replaceAll("<|end|>", "")
    .replaceAll("<s>", "")
    .replaceAll("</s>", "")
    .replaceAll("/s>", "")
    .replaceAll("[INST]", "")
    .replaceAll("[/INST]", "") 
    .replaceAll("<SYS>", "")
    .replaceAll("<<SYS>>", "")
    .replaceAll("</SYS>", "")
    .replaceAll("<</SYS>>", "")
    .replaceAll("<|system|>", "")
    .replaceAll("<|user|>", "")
    .replaceAll("<|all|>", "")
    .replaceAll("<|assistant|>", "")
    .replaceAll('""', '"')
  )
}