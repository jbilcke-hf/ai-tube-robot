import { Buffer } from "node:buffer";
import { addBase64HeaderToMp4 } from "../../utils/addBase64HeaderToMp4.mts";

// Assume the server action indication is present in the actual code file
// use server

type DownloadMp4Params = {
  urlToMp4: string;
};

export async function downloadMp4ToBase64({
  urlToMp4,
}: DownloadMp4Params): Promise<string> {
  // Fetch the video file
  const response = await fetch(urlToMp4);

  if (!response.ok) {
    throw new Error(`Failed to download the MP4 file: ${response.statusText}`);
  }

  // Buffer the response body
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Convert the buffer to a base64-encoded string
  const base64String = buffer.toString("base64");

  return addBase64HeaderToMp4(base64String)
}