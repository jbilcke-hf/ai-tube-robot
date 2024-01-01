import { Credentials, uploadFile } from "@huggingface/hub"

export async function uploadBlob({
  blob,
  uploadFilePath,
  repo,
  credentials,
}: {
  blob: Blob
  uploadFilePath: string
  repo: string
  credentials: Credentials
}): Promise<string> {
  if (!blob) {
    throw new Error(`the blob is required`)
  }
  if (!uploadFilePath) {
    throw new Error(`the uploadFilePath is required`)
  }

  const fileName = uploadFilePath.split("/").pop()

  await uploadFile({
	  credentials,
    repo,
    file: {
      path: uploadFilePath,
      content: blob as any,
    },
    commitTitle: `[robot] Upload file (${fileName})`,
  })

  return `https://huggingface.co/${repo}/resolve/main/${uploadFilePath}`
}
