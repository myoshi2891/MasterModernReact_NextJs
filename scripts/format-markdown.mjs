import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

/**
 * Format a Markdown file in-place to enforce link separation, heading spacing, blank-line normalization, and a single trailing newline.
 *
 * The formatter:
 * - Splits concatenated links by inserting a newline between `)[` → `)\n[`.
 * - Preserves YAML front matter and fenced code blocks verbatim.
 * - Ensures headings (`#`–`######` followed by a space) are preceded by a blank line (MD022).
 * - Collapses runs of three or more consecutive newlines into exactly two newlines (MD012).
 * - Normalizes the end of the file to exactly one final newline (MD047).
 *
 * @param {string} filePath - Path to the Markdown file to format (will be overwritten).
 */

export default async function formatMarkdown(filePath) {
  const absolutePath = resolve(filePath);
  const rawContent = await readFile(absolutePath, "utf8");

  // 1. Normalize line endings to LF
  const rawContentLF = rawContent.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // 2. Process line by line for code blocks, separators, and headings
  const lines = rawContentLF.split("\n");
  const processedLines = [];
  let frontMatterOpen = false;
  let inFencedCodeBlock = false;
  let activeFenceChar = "";
  let activeFenceLen = 0;
  const removeHorizontalRules = false; // Default: preserve thematic breaks

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const trimmed = line.trim();
    // Strip only the first blockquote token for fence detection (preserves nested > patterns)
    const lineWithoutBlockquote = line.replace(/^\s*>\s?/, "").trim();

    // 1. Preserve YAML front matter verbatim
    if (i === 0 && trimmed === "---") {
      frontMatterOpen = true;
      processedLines.push(line);
      continue;
    }

    if (frontMatterOpen) {
      processedLines.push(line);
      if (trimmed === "---") {
        frontMatterOpen = false;
      }
      continue;
    }

    // 2. Track fenced code blocks (robustly handle nested fences)
    const openingFenceMatch = lineWithoutBlockquote.match(/^(`{3,}|~{3,})/);
    if (!inFencedCodeBlock && openingFenceMatch) {
      const fence = openingFenceMatch[1];
      const fenceChar = fence[0];
      const fenceLen = fence.length;
      inFencedCodeBlock = true;
      activeFenceChar = fenceChar;
      activeFenceLen = fenceLen;
      processedLines.push(line);
      continue;
    }

    if (inFencedCodeBlock) {
      const closingFenceMatch = lineWithoutBlockquote.match(/^(`{3,}|~{3,})\s*$/);
      if (closingFenceMatch) {
        const closingFence = closingFenceMatch[1];
        if (closingFence[0] === activeFenceChar && closingFence.length >= activeFenceLen) {
          inFencedCodeBlock = false;
          activeFenceChar = "";
          activeFenceLen = 0;
        }
      }
      processedLines.push(line);
      continue;
    }

    // 3. Collapse consecutive blank lines (outside protected areas)
    if (
      trimmed === "" &&
      processedLines.length > 0 &&
      processedLines[processedLines.length - 1].trim() === ""
    ) {
      continue;
    }

    // 4. Split concatenated links (outside code blocks/front matter)
    //    Skip replacements that fall inside inline code spans (delimited by backticks)
    line = line.replace(/\)\[/g, (match, offset, str) => {
      // Find all inline-code ranges on this line
      let inCode = false;
      let i = 0;
      while (i < offset) {
        if (str[i] === "`") inCode = !inCode;
        i++;
      }
      return inCode ? match : ")\n[";
    });

    if (trimmed === "---") {
      // Preservation logic for horizontal rules (thematic breaks)
      if (removeHorizontalRules) {
        continue;
      }
      // Fall through to push(line) below
    }

    // 5. Ensure blank line before headings (MD022)
    //    Skip only if we are inside a blockquote context
    if (/^#{1,6}\s+/.test(line)) {
      const isInBlockquote = /^\s*>/.test(line);
      if (
        !isInBlockquote &&
        processedLines.length > 0 &&
        processedLines[processedLines.length - 1].trim() !== ""
      ) {
        processedLines.push("");
      }
    }

    processedLines.push(line);
  }

  // 6. Normalize spacing (already handled during line processing)
  let content = processedLines.join("\n");

  // 5. Ensure single trailing newline (preserve meaningful spaces)
  if (!content.endsWith("\n")) {
    content += "\n";
  } else {
    content = content.replace(/\n+$/, "\n");
  }

  await writeFile(absolutePath, content, "utf8");
  console.log(`Successfully formatted: ${filePath}`);
}

// CLI エントリポイント: `bun scripts/format-markdown.mjs <file>` での直接起動時のみ実行
if (import.meta.main) {
  const targetFile = process.argv[2];
  if (!targetFile) {
    console.error("Usage: bun scripts/format-markdown.mjs <file-path>");
    process.exit(1);
  }
  try {
    await formatMarkdown(targetFile);
  } catch (error) {
    console.error(`Error formatting ${targetFile}:`, error.message);
    process.exit(1);
  }
}
