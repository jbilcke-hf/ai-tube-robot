import { ClapModel } from "../../clap/types.mts";

export function getCharacterPrompt(model: ClapModel) {
  const characterPrompt = [
    `close-up`,
    `photo`,
    `portrait of a person`,
    model.gender !== "object" ? model.gender : "",
    model.age ? `aged ${model.age}yo` : '',
    model.label ? `named ${model.label}` : '',
    `neutral expression`,
    `neutral background`,
    `photo studio`,
  ].map(i => i.trim()).filter(i => i).join(", ")
  
  return characterPrompt
}