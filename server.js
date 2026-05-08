// ======================================
// 🌸 MindEase Server (Gemini AI Chat)
// ======================================

// --- Import dependencies ---
import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// --- Load environment variables ---
dotenv.config();

// --- Cek API Key ---
console.log(
  "API Key Loaded:",
  process.env.GEMINI_API_KEY ? "✅ YES" : "❌ NO"
);

// --- Setup dasar server ---
const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// --- Setup path ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Middleware ---
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// ======================================
// 🌸 Endpoint Chat
// ======================================

app.post("/chat", async (req, res) => {
  try {
    // --- Ambil pesan dari frontend ---
    const userMessage = req.body.message;
    const systemPrompt = req.body.systemPrompt || "";

    console.log("📩 User Message:", userMessage);

    // ======================================
    // 🌸 Request ke Gemini API
    // ======================================

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `${systemPrompt}\n\nUser: ${userMessage}`,
                },
              ],
            },
          ],
        }),
      }
    );

    // --- Ambil response Gemini ---
    const data = await response.json();

    // --- Debug response ---
    console.log("🌸 Gemini Response:");
    console.log(JSON.stringify(data, null, 2));

    // ======================================
    // 🌸 Ambil text AI
    // ======================================

    let aiText = "Maaf, AI belum bisa merespon 🥺";

    if (
      data.candidates &&
      data.candidates.length > 0 &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts.length > 0
    ) {
      aiText = data.candidates[0].content.parts[0].text;
    }

    console.log("🤖 AI Reply:", aiText);

    // --- Kirim ke frontend ---
    res.json({
      reply: aiText,
    });

  } catch (error) {

    // ======================================
    // 🌸 Error Handling
    // ======================================

    console.error("❌ Server Error:");
    console.error(error);

    res.status(500).json({
      reply: "Terjadi kesalahan di server 😢",
    });
  }
});

// ======================================
// 🌸 Jalankan Server
// ======================================

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});