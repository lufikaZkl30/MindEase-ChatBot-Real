import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Verify that the API key is loaded
console.log("API Key Loaded:", process.env.GEMINI_API_KEY ? "✅ YES" : "❌ NO");

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userMessage }] }],
        }),
      }
    );

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

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
