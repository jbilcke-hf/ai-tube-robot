import { ParsedDatasetPrompt } from "../types.mts"


export function parseDatasetPrompt(markdown: string = ""): ParsedDatasetPrompt {
  try {
    const { title, description, tags, prompt, model, lora, style, thumbnail, voice, music } = parseMarkdown(markdown)

    return {
      title: typeof title === "string" && title ? title : "",
      description: typeof description === "string" && description ? description : "",
      tags: tags && typeof tags === "string" ? tags.split("-").map(x => x.trim()).filter(x => x) : [], 
      prompt: typeof prompt === "string" && prompt ? prompt : "",
      model: typeof model === "string" && model ? model : "",
      lora: typeof lora === "string" && lora ? lora : "",
      style: typeof style === "string" && style ? style : "",
      thumbnail: typeof thumbnail === "string" && thumbnail ? thumbnail : "",
      voice: typeof voice === "string" && voice ? voice : "",
      music: typeof music === "string" && music ? music : "",
    }
  } catch (err) {
    return {
      title: "",
      description:  "",
      tags: [],
      prompt: "",
      model: "",
      lora: "",
      style: "",
      thumbnail: "",
      voice: "",
      music: "",
    }
  }
}

/**
 * Simple Markdown Parser to extract sections into a JSON object
 * @param markdown A Markdown string containing Description and Prompt sections
 * @returns A JSON object with { "description": "...", "prompt": "..." }
 */
function parseMarkdown(markdown: string): {
  title: string
  description: string
  tags: string
  prompt: string
  model: string
  lora: string
  style: string
  thumbnail: string
  voice: string
  music: string
} {
  markdown = markdown.trim()
  // Improved regular expression to find markdown sections and accommodate multi-line content.
  const sectionRegex = /^#+\s+(?<key>.+?)\n\n?(?<content>[^#]+)/gm;

  const sections: { [key: string]: string } = {};

  let match;
  while ((match = sectionRegex.exec(markdown))) {
    const { key, content } = match.groups as { key: string; content: string };
    sections[key.trim().toLowerCase()] = content.trim();
  }

  return {
    title: sections["title"] || "",
    description: sections["description"] || "",
    tags: sections["tags"] || "",
    prompt: sections["prompt"] || "",
    model: sections["model"] || "",
    lora: sections["lora"] || "",
    style: sections["style"] || "",
    thumbnail: sections["thumbnail"] || "",
    voice: sections["voice"] || "",
    music: sections["music"] || "",
  };
}