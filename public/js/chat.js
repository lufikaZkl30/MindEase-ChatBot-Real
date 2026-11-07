// ================================
// 🌸 MindEase (Mindy)
// ================================

// --- Ambil elemen dari HTML ---
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const chatForm = document.getElementById('chat-form');
const typingIndicator = document.getElementById('typing-indicator');
const suggestionButtons = document.querySelectorAll('.suggestion[data-prompt]');

const stickerAssets = {
  happy: { src: '/stickers/mindy-happy.svg', alt: 'Mindy tersenyum' },
  hug: { src: '/stickers/mindy-hug.svg', alt: 'Mindy mengirim pelukan' },
  comfort: { src: '/stickers/mindy-comfort.svg', alt: 'Mindy menemani dengan hangat' },
  celebrate: { src: '/stickers/mindy-celebrate.svg', alt: 'Mindy ikut merayakan' },
  thinking: { src: '/stickers/mindy-thinking.svg', alt: 'Mindy sedang berpikir' },
};

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

function addSticker(stickerId) {
  const sticker = stickerAssets[stickerId];
  if (!sticker) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'message-row';

  const bubble = document.createElement('div');
  bubble.className = 'message bot-message sticker-message';

  const image = document.createElement('img');
  image.className = 'sticker-image';
  image.src = sticker.src;
  image.alt = sticker.alt;
  image.width = 144;
  image.height = 144;

  bubble.appendChild(image);
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
    body: JSON.stringify({ message }),
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
    addSticker(data.sticker);

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
