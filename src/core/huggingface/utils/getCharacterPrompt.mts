import { ClapModel } from "../../clap/types.mts";

export function getCharacterPrompt(model: ClapModel) {
  const characterPrompt = [
    `beautiful`,
    `close-up`,
    `photo portrait`,
    `id photo`,
    model.gender !== "object" ? model.gender : "",
    model.age ? `aged ${model.age}yo` : '',
    model.label ? `named ${model.label}` : '',
    `neutral expression`,
    `neutral background`,
    `frontal`,
    `photo studio`,
    `crisp`,
    `sharp`,
    `intricate details`
  ].map(i => i.trim()).filter(i => i).join(", ")
  
  return characterPrompt
}