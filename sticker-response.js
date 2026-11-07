const STICKER_IDS = new Set(["happy", "hug", "comfort", "celebrate", "thinking"]);

export function parseStickerReply(text) {
  const match = text.match(/\s*\[\[sticker:([a-z-]+)\]\]\s*$/);
  if (!match) {
    return { reply: text.trim(), sticker: null };
  }

  return {
    reply: text.slice(0, match.index).trim(),
    sticker: STICKER_IDS.has(match[1]) ? match[1] : null,
  };
}
