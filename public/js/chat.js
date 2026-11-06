// ================================
// 🌸 MindEase (Mindy)
// ================================

// --- Ambil elemen dari HTML ---
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const chatForm = document.getElementById('chat-form');
const typingIndicator = document.getElementById('typing-indicator');
const suggestionButtons = document.querySelectorAll('.suggestion[data-prompt]');

// --- Karakter AI ---
const systemPrompt = `
Kamu adalah MindEase (Mindy) — temen virtual yang asik, hangat, dan suka dengerin cerita orang tanpa nge-judge.
Gayamu santai, kadang lucu dikit, tapi tetap sopan dan bikin nyaman kayak ngobrol di malam minggu sambil minum coklat panas 😌.

Tujuanmu cuma satu: jadi tempat aman buat orang cerita dan ngerasa didengerin.
Kalimatmu ringan, gak kaku, tapi tetap tulus. Kadang pake emoji biar lebih ekspresif 💬✨

Contoh gaya bicara:
- "Wah, itu pasti capek banget ya 😭 tapi kamu keren sih udah bisa ngadepin itu."
- "Hehe aku relate banget, kadang hidup tuh random banget ya 😅"
- "Cerita kamu lucu juga sih, tapi aku ngerti kok maksud perasaannya 🫶"
- "Gak apa-apa kok, kita semua pernah ngerasa gitu. Kamu gak sendirian :)"

Aturan:
1. Ngobrol kayak temen — pake bahasa sehari-hari dan gaul, tapi jangan berlebihan.
2. Hindari bahasa formal kayak robot atau buku motivasi.
3. Jangan sok tahu, cukup temani dan tanggepin dengan empati.
4. Gunakan emoji sewajarnya untuk menambah kehangatan.
5. Tutup beberapa respon dengan kalimat positif atau lucu ringan biar suasananya adem 🌷
`;

let chatHistory = [];

// --- Fungsi: Tambah pesan ke layar ---
function addMessage(text, sender) {
  const wrapper = document.createElement('div');
  wrapper.className = 'message-row';

  const bubble = document.createElement('div');
  bubble.className = `message ${sender === 'user' ? 'user-message' : 'bot-message'}`;

  const formattedText = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\s*\n/g, '<br><br>')
    .replace(/\n/g, '<br>');

  bubble.innerHTML = formattedText;

  if (sender === 'user') {
    wrapper.classList.add('justify-end');
  } else {
    wrapper.classList.add('justify-start');
  }

  wrapper.appendChild(bubble);
  chatBox.appendChild(wrapper);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// --- Fungsi: Indikator mengetik ---
function showTyping(isTyping) {
  typingIndicator.style.display = isTyping ? 'flex' : 'none';
  typingIndicator.setAttribute('aria-hidden', String(!isTyping));
}

suggestionButtons.forEach((button) => {
  button.addEventListener('click', () => {
    userInput.value = button.dataset.prompt;
    chatForm.requestSubmit();
  });
});

// --- Event: Saat user kirim pesan ---
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const message = userInput.value.trim();
  if (!message) return;

  // Tampilkan pesan user
  addMessage(message, 'user');
  userInput.value = '';
  showTyping(true);

  try {
    // Kirim ke server
    const res = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, systemPrompt }),
  });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Mindy belum bisa menjawab sekarang. Coba lagi ya 🌿');
    }

    if (typeof data.reply !== 'string' || !data.reply.trim()) {
      throw new Error('Mindy belum menerima balasan. Coba kirim pesan lagi ya 🌿');
    }

    showTyping(false);

    // Tampilkan balasan bot
    addMessage(data.reply, 'bot');

  } catch (err) {
    console.error("Chat request failed:", err);
    showTyping(false);
    addMessage(err.message || "Maaf, ada gangguan kecil. Coba lagi ya 🌿", 'bot');
  }
});

// --- Pesan pembuka saat halaman dimuat ---
window.addEventListener('load', () => {
  const welcome = "Haiii, selamat datang di cerita dunkkk eak ✨ Tarik napas dulu bentar... gimana hari kamu? Cerita ke aku, yuk 😌";
  addMessage(welcome, 'bot');
});
