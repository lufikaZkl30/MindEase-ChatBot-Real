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
Jika pengguna mengirim gambar stiker:
- Amati ekspresi wajah, mata, mulut, gestur, pose, dan simbol yang benar-benar tampak. Gunakan petunjuk visual ini untuk memahami kemungkinan nada atau maksud stiker, misalnya senang, sedih, terharu, bingung, kaget, bercanda, atau ingin menyampaikan dukungan.
- Tanggapi ekspresi atau maksud stiker secara spesifik dan alami; jangan hanya mengatakan bahwa stikernya lucu atau sekadar mengucapkan terima kasih.
- Jika pengguna juga menulis pesan, utamakan isi pesannya dan gunakan stiker sebagai konteks tambahan.
- Anggap ekspresi stiker sebagai petunjuk, bukan kepastian tentang perasaan pengguna. Jangan mendiagnosis atau menyimpulkan keadaan pengguna hanya dari gambar. Gunakan ungkapan tentatif seperti "Stikernya kelihatan lagi sedih—kamu sedang merasa begitu juga?" hanya bila cocok, dan jangan selalu bertanya balik.
- Jika arti gambar atau ekspresinya tidak jelas, katakan dengan jujur bahwa kamu belum yakin dan ajukan pertanyaan yang lembut. Jangan mengarang detail yang tidak terlihat.
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
app.use(express.json({ limit: "600kb" }));

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
  const userMessage = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  const image = req.body?.image;
  const hasImage = image !== undefined && image !== null;

  if (!userMessage && !hasImage) {
    return res.status(400).json({
      error: "Tulis pesan atau pilih stiker dulu ya 🌿",
    });
  }

  if (userMessage.length > 4000) {
    return res.status(400).json({
      error: "Pesan terlalu panjang. Coba ringkas menjadi 4.000 karakter atau kurang ya 🌿",
    });
  }

  let stickerBytes;
  if (hasImage) {
    const validBase64 = typeof image?.data === "string" &&
      image.data.length > 0 &&
      image.data.length <= 500_000 &&
      image.data.length % 4 === 0 &&
      /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(image.data);

    if (image?.mimeType !== "image/webp" || !validBase64) {
      return res.status(400).json({
        error: "Format stiker tidak valid. Pilih gambar lain dengan format PNG, JPG, atau WebP ya 🌿",
      });
    }

    stickerBytes = Buffer.from(image.data, "base64");
    const isWebp = stickerBytes.length >= 12 &&
      stickerBytes.toString("ascii", 0, 4) === "RIFF" &&
      stickerBytes.toString("ascii", 8, 12) === "WEBP";

    if (!isWebp || stickerBytes.length > 350_000) {
      return res.status(400).json({
        error: "Ukuran atau format stiker tidak didukung. Pilih gambar lain ya 🌿",
      });
    }
  }

  // --- Check Gemini API Key ---
  if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not configured.");
    return res.status(503).json({
      error: "Layanan AI belum dikonfigurasi. Periksa GEMINI_API_KEY di file .env.",
    });
  }

  try {
    const promptText = hasImage
      ? [
          userMessage,
          "Pengguna mengirim gambar stiker. Periksa ekspresi wajah dan gestur yang terlihat untuk memahami kemungkinan nada atau maksudnya. Tanggapi petunjuk ekspresi itu dengan hangat, gabungkan dengan teks pengguna bila ada, dan jangan menganggap stiker sebagai kepastian tentang perasaan pengguna. Jika ekspresinya tidak jelas, tanyakan dengan lembut daripada menebak.",
        ].filter(Boolean).join("\n\n")
      : userMessage;

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
          contents: [{
            role: "user",
            parts: [
              { text: promptText },
              ...(stickerBytes
                ? [{
                    inlineData: {
                      mimeType: "image/webp",
                      data: stickerBytes.toString("base64"),
                    },
                  }]
                : []),
            ],
          }],
        }),
        signal: AbortSignal.timeout(45_000),
      }
    );

    const data = await response.json();
    // Handle API errors
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