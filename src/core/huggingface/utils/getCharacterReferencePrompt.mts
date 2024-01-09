import { ClapModel } from "../../clap/types.mts";
import { getCharacterPrompt } from "./getCharacterPrompt.mts";

/**
 * Return a prompt for a "formal" picture, centered, neutral etc
 * @param model 
 * @returns 
 */
export function getCharacterReferencePrompt(model: ClapModel) {
  const characterPrompt = [
    `beautiful`,
    `close-up`,
    `photo portrait`,
    `id photo`,
    getCharacterPrompt(model),
    `neutral expression`,
    `neutral background`,
    `frontal`,
    `photo studio`,
    `crisp`,
    `sharp`,
    `intricate details`,
    `centered`,
    // `aligned`
  ].map(i => i.trim()).filter(i => i).join(", ")
  
  return characterPrompt
}