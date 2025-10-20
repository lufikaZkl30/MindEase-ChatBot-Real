// --- ambil elemen dari HTML ---
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const chatForm = document.getElementById('chat-form');
const typingIndicator = document.getElementById('typing-indicator');

// --- URL ke server kamu ---
let chatHistory = [];

// --- karakter AI ---
const systemPrompt = `
Kamu adalah MindEase, teman jiwa digital yang mendengarkan dengan penuh empati dan kehangatan.
Misi utamamu adalah menciptakan ruang cerita yang aman, di mana pengguna bisa bernapas dan merasa diterima apa adanya.
Gunakan bahasa yang lembut dan menenangkan, jangan menggurui, cukup temani.
`;

// --- tampilkan pesan di layar ---
function addMessage(text, sender) {
  const wrapper = document.createElement('div');
  wrapper.className = 'flex w-full';
  const bubble = document.createElement('div');
  bubble.className = 'max-w-[80%] p-3 rounded-2xl shadow-md break-words';
  bubble.textContent = text;

  if (sender === 'user') {
    wrapper.classList.add('justify-end');
    bubble.classList.add('bg-indigo-500', 'text-white', 'rounded-br-none');
  } else {
    wrapper.classList.add('justify-start');
    bubble.classList.add('bg-white/80', 'text-gray-800', 'border', 'border-gray-200', 'rounded-bl-none');
  }

  wrapper.appendChild(bubble);
  chatBox.appendChild(wrapper);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// --- indikator ngetik ---
function showTyping(isTyping) {
  typingIndicator.style.display = isTyping ? 'block' : 'none';
  if (isTyping) chatBox.scrollTop = chatBox.scrollHeight;
}

// --- kirim pesan ke server ---
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = userInput.value.trim();
  if (!message) return;

  addMessage(message, 'user');
  chatHistory.push({ role: 'user', parts: [{ text: message }] });
  userInput.value = '';
  showTyping(true);

  try {
    const payload = {
      contents: chatHistory,
      systemInstruction: { parts: [{ text: systemPrompt }] },
    };

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    showTyping(false);

    const botReply =
      result.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Maaf, aku belum bisa menjawab saat ini 🌙";

    addMessage(botReply, 'bot');
    chatHistory.push({ role: 'model', parts: [{ text: botReply }] });
  } catch (err) {
    console.error(err);
    addMessage("Maaf, ada gangguan kecil. Coba lagi ya 🌿", 'bot');
    showTyping(false);
  }
});

// --- pesan pembuka saat halaman dimuat ---
window.addEventListener('load', () => {
  const welcome =
    "Selamat datang di Ruang Cerita atau Curhat dunk ehehee 🌙 Tarik napas perlahan... Aku di sini untuk mendengarkan emosi kamu....ihihihi";
  addMessage(welcome, 'bot');
});
