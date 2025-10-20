const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");
const typingIndicator = document.getElementById("typing-indicator");

// fungsi buat nambah pesan ke chat box
function addMessage(sender, text) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", sender);
  messageDiv.textContent = text;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// event ketika user kirim pesan
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userText = userInput.value.trim();
  if (!userText) return;

  addMessage("user", userText);
  userInput.value = "";

  typingIndicator.style.display = "block";

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: userText }]
          }
        ]
      }),
    });

    const data = await res.json();
    console.log("Response:", data);

    // ambil teks dari hasil response Gemini
    const botReply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Maaf, aku belum bisa jawab itu 😅";

    addMessage("bot", botReply);
  } catch (error) {
    console.error("Error:", error);
    addMessage("bot", "❌ Terjadi kesalahan saat menghubungi server.");
  } finally {
    typingIndicator.style.display = "none";
  }
});
