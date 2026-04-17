const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "how",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "that",
  "the",
  "this",
  "to",
  "was",
  "what",
  "when",
  "where",
  "which",
  "who",
  "why",
  "with",
  "your"
]);

function normalizeText(value) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
}

export function extractSearchTerms(input) {
  const tokens = normalizeText(input)
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));

  return [...new Set(tokens)].slice(0, 20);
}

export function chunkText(input, options = {}) {
  const maxLength = options.maxLength || 1100;
  const overlap = options.overlap || 180;
  const normalized = input.replace(/\r/g, "").trim();

  if (!normalized) return [];

  const paragraphs = normalized
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const chunks = [];
  let current = "";

  for (const paragraph of paragraphs) {
    const candidate = current ? `${current}\n\n${paragraph}` : paragraph;
    if (candidate.length <= maxLength) {
      current = candidate;
      continue;
    }

    if (current) {
      chunks.push(current.trim());
      const tail = current.slice(-overlap).trim();
      current = tail ? `${tail}\n\n${paragraph}` : paragraph;
      if (current.length <= maxLength) continue;
    }

    let remaining = paragraph;
    while (remaining.length > maxLength) {
      chunks.push(remaining.slice(0, maxLength).trim());
      remaining = remaining.slice(maxLength - overlap).trim();
    }
    current = remaining;
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks
    .map((text, index) => ({
      chunkIndex: index,
      text,
      charCount: text.length,
      tokenHints: extractSearchTerms(text).slice(0, 12)
    }))
    .filter((chunk) => chunk.text.length > 80);
}

export function rankChunksAgainstQuery(chunks, query, uploadMap) {
  const searchTerms = extractSearchTerms(query);
  const normalizedQuery = normalizeText(query);

  return chunks
    .map((chunk) => {
      const normalizedChunk = normalizeText(chunk.text);
      const keywordMatches = searchTerms.reduce((score, term) => {
        return score + (normalizedChunk.includes(term) ? 3 : 0);
      }, 0);
      const hintMatches = (chunk.tokenHints || []).reduce((score, hint) => {
        return score + (searchTerms.includes(hint) ? 2 : 0);
      }, 0);
      const phraseBonus = normalizedQuery && normalizedChunk.includes(normalizedQuery) ? 8 : 0;
      const upload = uploadMap.get(String(chunk.uploadId));
      const summaryBonus = upload?.analysis?.keywords?.reduce((score, keyword) => {
        return score + (normalizedQuery.includes(keyword.toLowerCase()) ? 2 : 0);
      }, 0) || 0;

      return {
        ...chunk,
        score: keywordMatches + hintMatches + phraseBonus + summaryBonus
      };
    })
    .sort((left, right) => right.score - left.score || left.chunkIndex - right.chunkIndex);
}
