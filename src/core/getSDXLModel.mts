import { SDXLModel } from "../types.mts"
import { getSDXLModels } from "./getSDXLModels.mts"

export async function getSDXLModel(repoName: string): Promise<SDXLModel> {
  const models = await getSDXLModels()

  const result = models.find(model =>
    model.repo.toLowerCase().trim() === repoName.toLowerCase().trim()
  )

  if (!result) {
    throw new Error("model not found")
  }

  return result
}