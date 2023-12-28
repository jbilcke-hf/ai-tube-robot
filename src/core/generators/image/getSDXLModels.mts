import { SDXLModel } from "../../types/structures.mts"
import { aiClipFactoryModels, loraTheExplorerModels } from "./hardcodedSDXLModels.mts"

export async function getSDXLModels(): Promise<SDXLModel[]> {

  // we only return compatible models
  const compatibleModels = loraTheExplorerModels.filter(model => model.is_compatible)

  return aiClipFactoryModels.concat(compatibleModels)
}