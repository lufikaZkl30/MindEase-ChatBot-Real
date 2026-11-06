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

// --- Setup dasar server ---
const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";

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
  const userMessage = req.body?.message;

  if (typeof userMessage !== "string" || !userMessage.trim()) {
    return res.status(400).json({
      error: "Tulis pesan dulu ya, nanti Mindy dengerin 🌿",
    });
  }

  if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not configured.");
    return res.status(503).json({
      error: "Layanan AI belum dikonfigurasi. Periksa GEMINI_API_KEY di file .env.",
    });
  }

  try {
    const systemPrompt = req.body.systemPrompt || "";

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
            parts: [{ text: systemPrompt }],
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

    return res.json({ reply: aiText });
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