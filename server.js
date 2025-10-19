// ====== Import package ======
import "dotenv/config";
import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

// ====== Setup path ======
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ====== Tes apakah .env kebaca ======
console.log("🔑 API KEY:", process.env.API_KEY ? "Loaded ✅" : "❌ Not Loaded");
console.log("🌐 PORT:", process.env.PORT);

// ====== Setup server ======
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // serve folder public

// ====== Endpoint API Proxy ======
app.post("/api/chat", async (req, res) => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("❌ Error from Gemini API:", err);
    res.status(500).json({ error: "Server error calling Gemini API" });
  }
});

// ====== Jalankan server ======
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
