import { ClapModel, ClapSegment } from "../clap/types.mts"


/**
 * Construct a video prompt from a list of active segments
 * 
 * @param segments 
 * @returns 
 */
export function getVideoPrompt(
  segments: ClapSegment[],
  modelsById: Record<string, ClapModel>,
  extraPositivePrompt: string[]
): string {

  // console.log("modelsById:", modelsById)

  // to construct the video we need to collect all the segments describing it
  // we ignore unrelated categories (music, dialogue) or non-prompt items (eg. an audio sample)
  const tmp = segments
    .filter(({ category, outputType }) => {
      if (outputType === "audio") {
        return false
      }

      if (category === "preview" || category === "music" || category === "sound") {
        return false
      }

      return true
    })

  tmp.sort((a, b) => b.prompt.localeCompare(a.prompt))

  let videoPrompt = tmp.map(segment => {
    if (segment.category === "dialogue") {

      // console.log("segment is a dialogue line:", segment)

     //  console.log("modelId:", segment.modelId)
      // some segments have special powers attached to them: the Models!
      const model: ClapModel | undefined = modelsById[segment.modelId || ""] || undefined
      if (!model) {
        // console.log("couldn't find the model!")
        return ""
      }

      const characterTrigger = model?.triggerName || ""
      const characterLabel = model?.label || ""
      const characterDescription = model?.imagePrompt || ""
      const dialogueLine = segment?.prompt || ""
      
      if (characterDescription) {
        return `portrait of a person speaking, blurry background, bokeh, ${characterDescription}`
      }
      // const dialogueLine = segment?.prompt || ""

      return characterDescription
    } else {
      return segment.prompt
    }
  }).filter(x => x)

  videoPrompt = videoPrompt.concat([
    ...extraPositivePrompt,
  ])

  return videoPrompt.join(", ")
}