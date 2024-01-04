import fss from "node:fs";
import fs from "node:fs/promises";
import Path from "node:path";
import {finished, Readable} from "node:stream";

export async function createDirectories (outputFolder: string) {
  await fs.mkdir(Path.resolve(outputFolder), {recursive: true});
};

export async function saveBlobToFile(blob: void | Blob, fileType: string, outputFolder: string, type: string) {
  if (!blob) {
    throw new Error("cannot save the blob (no data)")
  }
  await createDirectories(outputFolder);
  const buffer = await blob.arrayBuffer();
  const array = new Uint8Array(buffer);

  const date = new Date();
  const dateString = `${type}_${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
  const fileName = `./${outputFolder}/${dateString}.${fileType}`;
  try {
    await fs.writeFile(Path.resolve(fileName), array);
  }
  catch (error) {
    return {code: -1, message: error};
  }

  return {code: 1, message: `File written successfully: ${fileName}`};
};

export async function saveZip(zip: any, outputFolder: string, type: string) {
  await createDirectories(outputFolder);
  const date = new Date();
  const dateString = `${type}_${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
  const fileName = `./${outputFolder}/${dateString}`;

  const stream = fss.createWriteStream(Path.resolve(`${fileName}.zip`));
  const result = finished(Readable.fromWeb(zip).pipe(stream), (err) => {
    if(err) {
      console.log("Stream failed.", err);
    }
    else{
      console.log("Stream succeeded.");
    }
  });

  return result;
};

export async function buildFormData({
  name,
  description = "",
  labels = {},
  filePaths
}: {
  name: string,
  description: string,
  labels: Record<string, string>,
  filePaths: string[]
}) {
  const formData = new FormData();

  formData.append("name", name);
  if(description !== undefined && description.trim() !== "") formData.append("description", description);
  if(Object.keys(labels).length > 0) formData.append("labels", JSON.stringify(labels));

  for(const filePath of filePaths) {
    const file = new File([await fs.readFile(Path.resolve(filePath))], Path.basename(filePath), {type: "audio/mpeg"});
    formData.append("files", file);
  }

  return formData;
};

export async function buildProjectFormData(
  defaultModelId: string,
  defaultParagraphVoiceId: string,
  defaultTitleVoiceId: string,
  name: string,
  pronounciationDictionaryLocators: string,
  acxVolumeNormalization = false,
  author = "",
  fromDocument = "",
  fromUrl = "",
  isbnNumber = "",
  qualityPreset = "standard",
  title = ""
  ) {
  const formData = new FormData();
  formData.append("acx_volume_normalization", acxVolumeNormalization.toString());
  formData.append("author", author);
  formData.append("default_model_id", defaultModelId);
  formData.append("default_paragraph_voice_id", defaultParagraphVoiceId);
  formData.append("default_title_voice_id", defaultTitleVoiceId);
  formData.append("from_document", fromDocument);
  formData.append("from_url", fromUrl);
  formData.append("isbn_number", isbnNumber);
  formData.append("name", name);
  formData.append("pronounciation_dictionary_locators", pronounciationDictionaryLocators);
  formData.append("quality_preset", qualityPreset);
  formData.append("title", title);

  return formData;
};
