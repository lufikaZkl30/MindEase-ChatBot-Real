document.getElementById("chat-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = document.getElementById("user-input");
  const message = input.value.trim();
  if (!message) return;

  addMessage("user", message);
  input.value = "";

  addTypingIndicator(true);

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();
    addTypingIndicator(false);
    addMessage("bot", data.reply);
  } catch (error) {
    addTypingIndicator(false);
    addMessage("bot", "Ups... server error 😢");
    console.error(error);
  }
});

function addMessage(sender, text) {
  const chatBox = document.getElementById("chat-box");
  const div = document.createElement("div");
  div.className = sender === "user" ? "user-message" : "bot-message";
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function addTypingIndicator(show) {
  document.getElementById("typing-indicator").style.display = show ? "block" : "none";
}
