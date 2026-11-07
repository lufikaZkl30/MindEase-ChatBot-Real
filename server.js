// ======================================
// 🌸 MindEase Server (Gemini AI Chat)
// ======================================

// --- Import dependencies ---
import express from "express";
import rateLimit from "express-rate-limit";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { parseStickerReply } from "./sticker-response.js";

// --- Load environment variables ---
dotenv.config();

// --- Setup dasar server ---
const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
const SYSTEM_PROMPT = `
Kamu adalah MindEase (Mindy), teman virtual yang hangat, sopan, dan mudah diajak bicara.
Gunakan bahasa Indonesia yang lembut, sederhana, dan mudah dipahami oleh orang dengan berbagai usia dan latar belakang. Tetap natural seperti teman ngobrol; gunakan bahasa gaul hanya secukupnya dan emoji bila terasa cocok.
Jika cocok dengan suasana percakapan atau pengguna meminta stiker, kamu boleh memilih satu stiker dan menambahkan marker persis di baris terakhir setelah balasan: [[sticker:happy]], [[sticker:hug]], [[sticker:comfort]], [[sticker:celebrate]], atau [[sticker:thinking]]. Gunakan marker saja, jangan menjelaskan marker. Jangan kirim stiker setiap kali; jika tidak cocok, jangan tambahkan marker.

Tujuanmu adalah membantu pengguna dengan menjawab pertanyaan mereka sekaligus menjadi teman bercerita yang suportif.

Panduan menjawab:
1. Pahami maksud pertanyaan dan jawab inti pertanyaannya secara langsung. Jangan mengganti jawaban dengan sekadar kata-kata penyemangat atau mengalihkan topik.
2. Sampaikan penjelasan dengan kalimat yang jelas dan tidak berbelit-belit. Jika topiknya rumit, jelaskan bertahap dan gunakan contoh sederhana bila membantu.
3. Sesuaikan panjang jawaban dengan kebutuhan pengguna. Jangan memberi terlalu banyak informasi sekaligus; tawarkan penjelasan lanjutan bila relevan.
4. Jika pengguna sedang bercerita atau menyampaikan perasaan, tanggapi dengan empati terlebih dahulu. Beri saran hanya bila diminta atau bila saran praktis memang membantu, dan jangan memaksa.
5. Jika maksud pertanyaan kurang jelas, ajukan satu pertanyaan klarifikasi yang ramah daripada menebak-nebak.
6. Jangan mengarang fakta. Jika tidak yakin atau tidak mengetahui jawabannya, katakan dengan jujur dan jelaskan apa yang perlu dipastikan.
7. Tetap tenang, tidak menghakimi, dan tidak meremehkan perasaan pengguna. Hindari janji berlebihan, bahasa yang menggurui, atau membuat pengguna merasa bersalah.
8. Gunakan emoji secukupnya. Tidak perlu selalu menutup jawaban dengan pujian atau kalimat motivasi.
`;

// --- Setup path ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Middleware ---
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({ limit: "10kb" }));

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Batas pesan sementara tercapai. Coba lagi beberapa saat ya 🌿",
  },
});

// ======================================
// 🌸 Endpoint Chat
// ======================================

app.post("/chat", chatLimiter, async (req, res) => {
  const userMessage = req.body?.message;

  if (typeof userMessage !== "string" || !userMessage.trim()) {
    return res.status(400).json({
      error: "Tulis pesan dulu ya, nanti Mindy dengerin 🌿",
    });
  }

  if (userMessage.length > 4000) {
    return res.status(400).json({
      error: "Pesan terlalu panjang. Coba ringkas menjadi 4.000 karakter atau kurang ya 🌿",
    });
  }

  if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not configured.");
    return res.status(503).json({
      error: "Layanan AI belum dikonfigurasi. Periksa GEMINI_API_KEY di file .env.",
    });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }],
          },
          generationConfig: {
            thinkingConfig: {
              thinkingLevel: "low",
            },
          },
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: userMessage.trim(),
                },
              ],
            },
          ],
        }),
        signal: AbortSignal.timeout(45_000),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(`Gemini API returned ${response.status}:`, data.error?.message || "Unknown API error");
      return res.status(502).json({
        error: "Mindy belum bisa terhubung ke layanan AI. Coba lagi sebentar ya 🌿",
      });
    }

    const aiText = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter((text) => typeof text === "string")
      .join("")
      .trim();

    if (!aiText) {
      console.error("Gemini API returned no text candidate:", data.promptFeedback?.blockReason || "No candidate");
      return res.status(502).json({
        error: "Mindy belum bisa menjawab pesan itu. Coba ceritakan dengan cara lain ya 🌿",
      });
    }

    const { reply, sticker } = parseStickerReply(aiText);

    if (!reply) {
      console.error("Gemini API returned a sticker without a text reply.");
      return res.status(502).json({
        error: "Mindy belum bisa menjawab pesan itu. Coba kirim pesan lagi ya 🌿",
      });
    }

    return res.json({ reply, sticker });
  } catch (error) {
    console.error("Gemini request failed:", error.message);
    return res.status(502).json({
      error: "Terjadi gangguan saat menghubungi layanan AI. Coba lagi sebentar ya 🌿",
    });
  }
});

// ======================================
// 🌸 Jalankan Server
// ======================================

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});