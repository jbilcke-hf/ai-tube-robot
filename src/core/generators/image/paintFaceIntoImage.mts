import { client } from "@gradio/client"

import { adminApiKey } from "../../config.mts"
import { addBase64HeaderToPng } from "../../utils/addBase64HeaderToPng.mts";
import { tryApiCalls } from "../../utils/tryApiCalls.mts";

export async function paintFaceIntoImage({
  referenceImage,
  targetImage,
  debug,
}: {
  referenceImage: string
  targetImage: string
  debug?: boolean
  }) {

  const actualFunction = async () => {
    try {
      const app = await client(
        "jbilcke-hf/paint-face-into-image-server",
        { hf_token: adminApiKey as any }
      );

      const res = await app.predict("/predict", [
        referenceImage, 	// blob in 'source_file' Image component
        targetImage, 	// blob in 'target_file' Image component		
        true, // boolean  in 'face_enhancer?' Checkbox component
      ]) as { data: string[] }

      // console.log("res:", res)

      const base64Content = res?.data?.[0] || ""

      if (!base64Content) {
        throw new Error(`invalid response (no content)`)
      }

      // console.log("debug juju:", base64Content.slice(0, 50))

      return addBase64HeaderToPng(base64Content)
    } catch (err) {
      if (debug) {
        console.error(err)
      }
      throw new Error("failed to paint the face into the image (check paint-face-into-image endpoint logs)")
    }
  }

  return tryApiCalls({
    func: actualFunction,
    debug,
    failureMessage: "failed to paint the face into the image (check paint-face-into-image endpoint logs)"
  })
}