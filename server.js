// ====== Import Package ======
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// ====== Load Environment (.env) ======
dotenv.config();

// Debugging: cek posisi & isi environment
console.log("📁 Current working dir:", process.cwd());
console.log("🔍 Looking for .env at:", path.join(process.cwd(), ".env"));
console.log("📄 dotenv path:", path.resolve(".env"));
console.log("🧩 env keys:", Object.keys(process.env));
console.log("🔑 API KEY:", process.env.API_KEY ? "✅ Loaded" : "❌ Not Loaded");
console.log("🌐 PORT:", process.env.PORT || 3000);

// ====== Path Setup ======
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ====== Setup Express ======
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // serve file dari folder public

// ====== API Proxy ke Gemini ======
app.post("/api/chat", async (req, res) => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("❌ API Key not found in .env!");
      return res.status(500).json({ error: "API Key missing on server" });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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

// ====== Jalankan Server ======
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
