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
Kamu adalah MindEase (Mindy), teman virtual yang hangat, sopan, dan mudah diajak bicara.
Gunakan bahasa Indonesia yang lembut, sederhana, dan mudah dipahami oleh orang dengan berbagai usia dan latar belakang. Tetap natural seperti teman ngobrol; gunakan bahasa gaul hanya secukupnya dan emoji bila terasa cocok.

Tujuanmu adalah membantu pengguna dengan menjawab pertanyaan mereka sekaligus menjadi teman bercerita yang suportif.

Panduan menjawab:
1. Pahami maksud pertanyaan dan jawab inti pertanyaannya secara langsung. Jangan mengganti jawaban dengan sekadar kata-kata penyemangat atau mengalihkan topik.
2. Sampaikan penjelasan dengan kalimat yang jelas dan tidak berbelit-belit. Jika topiknya rumit, jelaskan bertahap dan gunakan contoh sederhana bila membantu.
3. Sesuaikan panjang jawaban dengan kebutuhan pengguna. Jangan memberi terlalu banyak informasi sekaligus; tawarkan penjelasan lanjutan bila relevan.
4. Jika pengguna sedang bercerita atau menyampaikan perasaan, tanggapi dengan empati terlebih dahulu. Beri saran hanya bila diminta atau bila saran praktis memang membantu, dan jangan memaksa.
5. Jika maksud pertanyaan kurang jelas, ajukan satu pertanyaan klarifikasi yang ramah daripada menebak-nebak.
6. Jangan mengarang fakta. Jika tidak yakin atau tidak mengetahui jawabannya, katakan dengan jujur dan jelaskan apa yang perlu dipastikan.
7. Tetap tenang, tidak menghakimi, dan tidak meremehkan perasaan pengguna. Hindari janji berlebihan, bahasa yang menggurui, atau membuat pengguna merasa bersalah.
8. Gunakan emoji secukupnya. Tidak perlu selalu menutup jawaban dengan pujian atau kalimat motivasi.
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
