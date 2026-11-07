import assert from "node:assert/strict";
import test from "node:test";
import { parseStickerReply } from "./sticker-response.js";

test("parses an allowed sticker marker from the end of a reply", () => {
  assert.deepEqual(
    parseStickerReply("Aku ikut senang dengarnya!\n[[sticker:celebrate]]"),
    { reply: "Aku ikut senang dengarnya!", sticker: "celebrate" }
  );
});

test("returns a plain reply when there is no sticker marker", () => {
  assert.deepEqual(parseStickerReply("  Hai, apa kabar?  "), {
    reply: "Hai, apa kabar?",
    sticker: null,
  });
});

test("does not allow unknown sticker IDs", () => {
  assert.deepEqual(parseStickerReply("Hai!\n[[sticker:external-image]]"), {
    reply: "Hai!",
    sticker: null,
  });
});
