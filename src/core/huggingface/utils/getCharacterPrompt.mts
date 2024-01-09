import { ClapModel } from "../../clap/types.mts";

export function getCharacterPrompt(model: ClapModel) {
  const characterPrompt = [
    model.gender !== "object" ? model.gender : "",
    model.age ? `aged ${model.age}yo` : '',
    model.label ? `named ${model.label}` : '',
  ].map(i => i.trim()).filter(i => i).join(", ")
  
  return characterPrompt
}