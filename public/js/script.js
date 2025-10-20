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

// Fungsi untuk menambahkan pesan ke kotak obrolan
function addMessage(sender, text) {
  const chatBox = document.getElementById("chat-box");
  const div = document.createElement("div");
  div.textContent = text;
  div.classList.add("message", sender === "user" ? "user-message" : "bot-message");
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Tambahkan gaya bubble sesuai pengirim
function styleMessageBubble(div, sender) {
  div.classList.add(
    "max-w-[75%]",
    "p-3",
    "rounded-2xl",
    "shadow-sm",
    "break-words",
    "mb-2",
    "animate-fadeIn"
  );

  if (sender === "user") {
    div.classList.add(
      "bg-gradient-to-r",
      "from-indigo-500",
      "to-purple-500",
      "text-white",
      "self-end",
      "rounded-br-none"
    );
  } else {
    div.classList.add(
      "bg-white/70",
      "text-gray-800",
      "self-start",
      "rounded-bl-none",
      "backdrop-blur-md",
      "border",
      "border-gray-200"
    );
  }
}

function addTypingIndicator(show) {
  document.getElementById("typing-indicator").style.display = show ? "block" : "none";
}
