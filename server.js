// --- Import dependencies ---
import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// --- Load environment variables ---
dotenv.config();

// --- Cek API Key ---
console.log("API Key Loaded:", process.env.GEMINI_API_KEY ? "✅ YES" : "❌ NO");

// --- Setup dasar server ---
const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// --- Path setup untuk folder public ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// --- Endpoint utama untuk chat ---
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    const systemPrompt = req.body.systemPrompt || ""; // karakter / personality AI dikirim dari client

    // --- Panggil Gemini API 2.5 Flash ---
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: userMessage }] }],
        }),
      }
    );

    // --- Parsing respon ---
    const data = await response.json();
    const aiText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Maaf, aku belum bisa jawab itu 🥺";

    res.json({ reply: aiText });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ reply: "Terjadi kesalahan di server 😢" });
  }
});

// --- Jalankan server ---
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
