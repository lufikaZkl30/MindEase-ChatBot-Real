const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const chatForm = document.getElementById("chat-form");
const typingIndicator = document.getElementById("typing-indicator");

let chatHistory = [];

window.onload = () => {
  addMessage(
    "Selamat datang di Ruang Cerita Jiwa 🌿 Tarik napas perlahan... Aku di sini buat dengerin hatimu 🤍",
    "bot"
  );
};

function addMessage(text, sender) {
  const div = document.createElement("div");
  div.className = sender === "user" ? "text-right" : "text-left";
  div.innerHTML = `<div class="inline-block px-4 py-2 rounded-3xl ${
    sender === "user"
      ? "bg-gray-800 text-white ml-auto"
      : "bg-gray-100 text-gray-800"
  } max-w-[80%]">${text}</div>`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = userInput.value.trim();
  if (!msg) return;

  addMessage(msg, "user");
  userInput.value = "";
  typingIndicator.style.display = "block";

  // simpan ke riwayat chat biar nyambung
  chatHistory.push({ role: "user", parts: [{ text: msg }] });

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: chatHistory,
        systemInstruction: {
          parts: [
            {
              text: `
Kamu adalah MindEase (Mindy) — teman curhat digital yang lembut, suportif, dan tidak menghakimi.
Gunakan bahasa santai seperti ngobrol sama teman. 
Bantu pengguna mengenali perasaan mereka dengan lembut.
Kalau pengguna bercerita, tanggapi dengan empati dan pertanyaan ringan.
              `,
            },
          ],
        },
      }),
    });

    const data = await res.json();
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Aku di sini dengerin kamu 🤍";

    // tampilkan dan simpan ke riwayat
    addMessage(reply, "bot");
    chatHistory.push({ role: "model", parts: [{ text: reply }] });

  } catch (err) {
    console.error(err);
    addMessage("Maaf, MindEase lagi lelah dikit... coba lagi ya 🌿", "bot");
  } finally {
    typingIndicator.style.display = "none";
  }
});
