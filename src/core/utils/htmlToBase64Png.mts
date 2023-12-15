import { promises as fs } from "node:fs"
import os from "node:os"
import path from "node:path"

import { v4 as uuidv4 } from "uuid"
import puppeteer from "puppeteer"

export async function htmlToBase64Png({
  outputImagePath,
  html,
  width = 800,
  height = 600,
}: {
  outputImagePath?: string
  html?: string
  width?: number
  height: number
}): Promise<{
  filePath: string
  buffer: Buffer
}> {

  // If no output path is provided, create a temporary file for output
  if (!outputImagePath) {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), uuidv4()))

    outputImagePath = path.join(tempDir, `${uuidv4()}.png`)
  }

  const browser = await puppeteer.launch({
    headless: "new"
  })

  const page = await browser.newPage()

  page.setViewport({
    width,
    height,
  })

  try {
    await page.setContent(html)

    const content = await page.$("body")

    const buffer = await content.screenshot({
      path: outputImagePath,
      omitBackground: true,
      captureBeyondViewport: false,

      // we must keep PNG here, if we want transparent backgrounds
      type: "png",

      // we should leave it to binary (the default value) if we save to a file
      // encoding: "binary", // "base64",
    })

    return {
      filePath: outputImagePath,
      buffer
    }
  } catch (err) {
    throw err
  } finally {
    await page.close()
    await browser.close()
  }
};