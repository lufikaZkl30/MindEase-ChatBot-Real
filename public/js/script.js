const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const chatForm = document.getElementById("chat-form");
const typingIndicator = document.getElementById("typing-indicator");

let chatHistory = [];

// gaya pembuka
window.onload = () => {
  addMessage(
    "Selamat datang di Ruang Cerita Jiwa 🌿 Tarik napas perlahan... Aku di sini buat dengerin hatimu 🤍",
    "bot"
  );
};

// tampilkan pesan
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

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: msg }] },
        ],
        systemInstruction: {
          parts: [
            {
              text: `
Kamu adalah MindEase (Mindy) — teman curhat digital yang hangat, ringan, dan tenang.
Gunakan bahasa santai seperti ngobrol sama teman, lembut tapi jujur.
Fokusnya bikin pengguna ngerasa nyaman, diterima, dan gak dihakimi.
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

    addMessage(reply, "bot");
  } catch (err) {
    console.error(err);
    addMessage("Maaf, MindEase lagi lelah dikit... coba lagi ya 🌿", "bot");
  } finally {
    typingIndicator.style.display = "none";
  }
});
