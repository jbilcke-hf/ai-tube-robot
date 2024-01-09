import { ClapModel } from "../clap/types.mts"

export function formatModel(model: ClapModel) {
  if (!model) { return "no model" }
  // console.log("formatModel:", model)
  return `#${
    model.id
  } "${
    model.label || "anonymous"
  }" (${
    model.appearance || "neutral"
  } ${
    model.age || "?? "
  }yo ${
    model.gender || "person"
  }, ${
    model.region || "unknown region"
  })`
}