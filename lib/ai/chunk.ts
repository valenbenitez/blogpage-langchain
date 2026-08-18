/**
 * Split markdown/plain text into overlapping chunks for RAG indexing.
 * Size is character-based (MVP). Tune before wiring embeddings.
 */

export type TextChunk = {
  index: number;
  content: string;
};

export type ChunkOptions = {
  /** Target max characters per chunk (default 1200). */
  maxChars?: number;
  /** Overlap between consecutive chunks (default 200). */
  overlapChars?: number;
};

const DEFAULT_MAX_CHARS = 1200;
const DEFAULT_OVERLAP_CHARS = 200;

const SEPARATORS = ["\n## ", "\n### ", "\n\n", "\n", ". ", " "];

function normalizeContent(content: string): string {
  return content.replace(/\r\n/g, "\n").trim();
}

function splitOnce(text: string, separator: string): string[] {
  if (separator === "") {
    return text.split("");
  }

  if (!text.includes(separator)) {
    return [text];
  }

  const parts = text.split(separator);
  const result: string[] = [];

  for (let i = 0; i < parts.length; i += 1) {
    const part = parts[i];
    if (!part) {
      continue;
    }

    if (i === 0) {
      result.push(part);
    } else {
      result.push(`${separator}${part}`);
    }
  }

  return result.length > 0 ? result : [text];
}

function mergePieces(
  pieces: string[],
  maxChars: number,
): string[] {
  const merged: string[] = [];
  let current = "";

  for (const piece of pieces) {
    const candidate = current ? `${current}${piece}` : piece;

    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }

    if (current) {
      merged.push(current);
    }

    if (piece.length <= maxChars) {
      current = piece;
    } else {
      // Piece alone is too big; hard-split by maxChars
      let start = 0;
      while (start < piece.length) {
        merged.push(piece.slice(start, start + maxChars));
        start += maxChars;
      }
      current = "";
    }
  }

  if (current) {
    merged.push(current);
  }

  return merged;
}

function splitRecursively(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) {
    return [text];
  }

  for (const separator of SEPARATORS) {
    if (separator !== "" && !text.includes(separator)) {
      continue;
    }

    const pieces = splitOnce(text, separator);
    if (pieces.length === 1) {
      continue;
    }

    const rebuilt: string[] = [];
    for (const piece of pieces) {
      rebuilt.push(...splitRecursively(piece.trimStart(), maxChars));
    }

    return mergePieces(
      rebuilt.filter((part) => part.trim().length > 0),
      maxChars,
    );
  }

  // Fallback: hard cut
  const hard: string[] = [];
  let start = 0;
  while (start < text.length) {
    hard.push(text.slice(start, start + maxChars));
    start += maxChars;
  }
  return hard;
}

function applyOverlap(chunks: string[], overlapChars: number): string[] {
  if (chunks.length <= 1 || overlapChars <= 0) {
    return chunks;
  }

  const withOverlap: string[] = [chunks[0]];

  for (let i = 1; i < chunks.length; i += 1) {
    const previous = chunks[i - 1];
    const overlap = previous.slice(Math.max(0, previous.length - overlapChars));
    withOverlap.push(`${overlap}${chunks[i]}`);
  }

  return withOverlap;
}

/**
 * Chunk markdown (or plain text) into ordered fragments.
 */
export function chunkText(
  content: string,
  options: ChunkOptions = {},
): TextChunk[] {
  const maxChars = options.maxChars ?? DEFAULT_MAX_CHARS;
  const overlapChars = options.overlapChars ?? DEFAULT_OVERLAP_CHARS;

  if (maxChars <= 0) {
    throw new Error("maxChars must be greater than 0");
  }

  if (overlapChars < 0 || overlapChars >= maxChars) {
    throw new Error("overlapChars must be >= 0 and < maxChars");
  }

  const normalized = normalizeContent(content);
  if (!normalized) {
    return [];
  }

  const raw = splitRecursively(normalized, maxChars);
  const overlapped = applyOverlap(raw, overlapChars);

  return overlapped
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .map((part, index) => ({
      index,
      content: part,
    }));
}
