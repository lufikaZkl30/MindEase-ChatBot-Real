// ================================
// 🌸 MindEase (Mindy)
// ================================

// --- Ambil elemen dari HTML ---
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const chatForm = document.getElementById('chat-form');
const typingIndicator = document.getElementById('typing-indicator');
const suggestionButtons = document.querySelectorAll('.suggestion[data-prompt]');
const stickerToggle = document.getElementById('sticker-toggle');
const stickerPicker = document.getElementById('sticker-picker');
const stickerGrid = document.getElementById('sticker-grid');
const stickerUpload = document.getElementById('sticker-upload');
const addStickerButton = document.getElementById('add-sticker-button');
const stickerStatus = document.getElementById('sticker-status');

const stickerAssets = {
  happy: { src: '/stickers/mindy-happy.svg', alt: 'Mindy tersenyum' },
  hug: { src: '/stickers/mindy-hug.svg', alt: 'Mindy mengirim pelukan' },
  comfort: { src: '/stickers/mindy-comfort.svg', alt: 'Mindy menemani dengan hangat' },
  celebrate: { src: '/stickers/mindy-celebrate.svg', alt: 'Mindy ikut merayakan' },
  thinking: { src: '/stickers/mindy-thinking.svg', alt: 'Mindy sedang berpikir' },
};

const CUSTOM_STICKERS_KEY = 'mindease.custom-stickers.v1';
const MAX_CUSTOM_STICKERS = 8;
const MAX_STICKER_FILE_BYTES = 8 * 1024 * 1024;
const MAX_STICKER_DATA_URL_LENGTH = 500_000;
let customStickers = loadCustomStickers();
let isSending = false;

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

function addUserSticker(sticker) {
  const wrapper = document.createElement('div');
  wrapper.className = 'message-row justify-end';

  const bubble = document.createElement('div');
  bubble.className = 'message user-message sticker-message';

  const image = document.createElement('img');
  image.className = 'sticker-image';
  image.src = sticker.dataUrl;
  image.alt = sticker.name;
  image.width = 144;
  image.height = 144;

  bubble.appendChild(image);
  wrapper.appendChild(bubble);
  chatBox.appendChild(wrapper);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function loadCustomStickers() {
  try {
    const stored = JSON.parse(localStorage.getItem(CUSTOM_STICKERS_KEY) || '[]');
    if (!Array.isArray(stored)) return [];

    return stored
      .filter((sticker) =>
        sticker &&
        typeof sticker.id === 'string' &&
        typeof sticker.name === 'string' &&
        typeof sticker.dataUrl === 'string' &&
        sticker.dataUrl.startsWith('data:image/webp;base64,') &&
        sticker.dataUrl.length <= MAX_STICKER_DATA_URL_LENGTH
      )
      .slice(0, MAX_CUSTOM_STICKERS);
  } catch (error) {
    console.error('Could not load custom stickers:', error);
    return [];
  }
}

function setStickerStatus(message) {
  stickerStatus.textContent = message;
}

function resizeMessageInput() {
  userInput.style.height = 'auto';
  const styles = getComputedStyle(userInput);
  const maxHeight = Number.parseFloat(styles.maxHeight);
  const height = Number.isFinite(maxHeight)
    ? Math.min(userInput.scrollHeight, maxHeight)
    : userInput.scrollHeight;
  userInput.style.height = `${height}px`;
}

function closeStickerPicker() {
  stickerPicker.hidden = true;
  stickerToggle.setAttribute('aria-expanded', 'false');
}

function createStickerOption(sticker, isCustom = false) {
  const option = document.createElement('div');
  option.className = 'sticker-option-wrap';

  const button = document.createElement('button');
  button.className = 'sticker-option';
  button.type = 'button';
  button.setAttribute('aria-label', `Kirim stiker ${sticker.name}`);

  const image = document.createElement('img');
  image.src = sticker.src || sticker.dataUrl;
  image.alt = '';
  image.loading = 'lazy';

  const label = document.createElement('span');
  label.textContent = sticker.name;
  button.append(image, label);
  button.addEventListener('click', () => sendSticker(sticker));
  option.appendChild(button);

  if (isCustom) {
    const removeButton = document.createElement('button');
    removeButton.className = 'remove-sticker-button';
    removeButton.type = 'button';
    removeButton.setAttribute('aria-label', `Hapus stiker ${sticker.name}`);
    removeButton.textContent = '×';
    removeButton.addEventListener('click', () => removeCustomSticker(sticker.id));
    option.appendChild(removeButton);
  }

  stickerGrid.appendChild(option);
}

function renderStickerPicker() {
  stickerGrid.replaceChildren();

  Object.entries(stickerAssets).forEach(([id, sticker]) => {
    createStickerOption({ id, name: sticker.alt, src: sticker.src });
  });

  customStickers.forEach((sticker) => createStickerOption(sticker, true));

  addStickerButton.disabled = isSending || customStickers.length >= MAX_CUSTOM_STICKERS;
  addStickerButton.title = addStickerButton.disabled && !isSending
    ? `Maksimal ${MAX_CUSTOM_STICKERS} stiker custom`
    : '';
}

function persistCustomStickers(stickers) {
  localStorage.setItem(CUSTOM_STICKERS_KEY, JSON.stringify(stickers));
  customStickers = stickers;
  renderStickerPicker();
}

function removeCustomSticker(stickerId) {
  try {
    persistCustomStickers(customStickers.filter((sticker) => sticker.id !== stickerId));
    setStickerStatus('Stiker custom dihapus dari browser ini.');
  } catch (error) {
    console.error('Could not remove custom sticker:', error);
    setStickerStatus('Stiker gagal dihapus. Penyimpanan browser mungkin penuh.');
  }
}

function readBlobAsDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result));
    reader.addEventListener('error', () => reject(new Error('Gambar tidak dapat dibaca.')));
    reader.readAsDataURL(blob);
  });
}

async function compressStickerImage(blob) {
  let objectUrl;
  let image;

  try {
    try {
      image = await createImageBitmap(blob);
    } catch (error) {
      if (blob.type !== 'image/svg+xml') throw error;

      objectUrl = URL.createObjectURL(blob);
      image = new Image();
      image.src = objectUrl;
      await image.decode();
    }

    if (image.width > 6000 || image.height > 6000 || image.width * image.height > 25_000_000) {
      throw new Error('Ukuran gambar terlalu besar. Pilih gambar yang lebih kecil ya.');
    }

    const scale = Math.min(1, 512 / image.width, 512 / image.height);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Gambar tidak dapat diproses di browser ini.');

    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const compressed = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.78));
    if (!compressed) throw new Error('Gambar tidak dapat dikompres.');
    if (compressed.type !== 'image/webp') {
      throw new Error('Browser ini belum mendukung format stiker yang diperlukan.');
    }
    if (compressed.size > 350_000) {
      throw new Error('Ukuran stiker masih terlalu besar setelah dikompres. Coba gambar lain ya.');
    }

    return readBlobAsDataUrl(compressed);
  } finally {
    image?.close?.();
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}

function getImagePayload(dataUrl) {
  const match = /^data:image\/webp;base64,([A-Za-z0-9+/]+={0,2})$/.exec(dataUrl);
  if (!match || dataUrl.length > MAX_STICKER_DATA_URL_LENGTH) {
    throw new Error('Format stiker tidak didukung. Pilih gambar PNG, JPG, atau WebP.');
  }

  return { mimeType: 'image/webp', data: match[1] };
}

async function sendSticker(sticker) {
  if (isSending) return;

  try {
    setStickerStatus('');
    let dataUrl = sticker.dataUrl;
    if (!dataUrl) {
      const response = await fetch(sticker.src);
      if (!response.ok) throw new Error('Stiker bawaan tidak dapat dimuat.');
      dataUrl = await compressStickerImage(await response.blob());
    }

    closeStickerPicker();
    await sendChat(userInput.value.trim(), {
      dataUrl,
      name: sticker.name,
    });
  } catch (error) {
    console.error('Could not send sticker:', error);
    setStickerStatus(error.message || 'Stiker gagal dikirim. Coba lagi ya.');
  }
}

async function handleStickerUpload(event) {
  const [file] = event.target.files || [];
  event.target.value = '';
  if (!file) return;

  if (customStickers.length >= MAX_CUSTOM_STICKERS) {
    setStickerStatus(`Maksimal ${MAX_CUSTOM_STICKERS} stiker custom. Hapus salah satu untuk menambahkan yang baru.`);
    return;
  }

  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
    setStickerStatus('Pilih gambar PNG, JPG, atau WebP ya.');
    return;
  }

  if (file.size > MAX_STICKER_FILE_BYTES) {
    setStickerStatus('Ukuran file maksimal 8 MB.');
    return;
  }

  try {
    setStickerStatus('Menyiapkan stiker...');
    const dataUrl = await compressStickerImage(file);
    if (dataUrl.length > MAX_STICKER_DATA_URL_LENGTH) {
      throw new Error('Stiker terlalu besar untuk disimpan di browser.');
    }

    const name = file.name.replace(/\.[^.]+$/, '').trim().slice(0, 30) || 'Stiker custom';
    const sticker = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      dataUrl,
    };

    persistCustomStickers([...customStickers, sticker]);
    setStickerStatus('Stiker ditambahkan. Pilih stikernya untuk mengirim ke Mindy.');
  } catch (error) {
    console.error('Could not save custom sticker:', error);
    setStickerStatus(error.message || 'Stiker gagal disimpan. Coba gambar lain ya.');
  }
}

// --- Fungsi: Indikator mengetik ---
function showTyping(isTyping) {
  typingIndicator.style.display = isTyping ? 'flex' : 'none';
  typingIndicator.setAttribute('aria-hidden', String(!isTyping));
}

suggestionButtons.forEach((button) => {
  button.addEventListener('click', () => {
    userInput.value = button.dataset.prompt;
    resizeMessageInput();
    chatForm.requestSubmit();
  });
});

userInput.addEventListener('input', resizeMessageInput);
userInput.addEventListener('keydown', (event) => {
  if (!event.isComposing && event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    chatForm.requestSubmit();
  }
});

resizeMessageInput();
renderStickerPicker();

stickerToggle.addEventListener('click', () => {
  stickerPicker.hidden = !stickerPicker.hidden;
  stickerToggle.setAttribute('aria-expanded', String(!stickerPicker.hidden));
  if (!stickerPicker.hidden) setStickerStatus('');
});

addStickerButton.addEventListener('click', () => stickerUpload.click());
stickerUpload.addEventListener('change', handleStickerUpload);

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !stickerPicker.hidden) {
    closeStickerPicker();
    stickerToggle.focus();
  }
});

document.addEventListener('click', (event) => {
  if (!stickerPicker.hidden && !stickerPicker.contains(event.target) &&
      !stickerToggle.contains(event.target) && !addStickerButton.contains(event.target)) {
    closeStickerPicker();
  }
});

async function sendChat(message, sticker = null) {
  if (isSending || (!message && !sticker)) return;

  if (message) addMessage(message, 'user');
  if (sticker) addUserSticker(sticker);
  userInput.value = '';
  resizeMessageInput();
  isSending = true;
  chatForm.setAttribute('aria-busy', 'true');
  renderStickerPicker();
  showTyping(true);

  try {
    const payload = { message };
    if (sticker) {
      payload.image = getImagePayload(sticker.dataUrl);
    }

    const res = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Mindy belum bisa menjawab sekarang. Coba lagi ya 🌿');
    }

    if (typeof data.reply !== 'string' || !data.reply.trim()) {
      throw new Error('Mindy belum menerima balasan. Coba kirim pesan lagi ya 🌿');
    }

    addMessage(data.reply, 'bot');
    addSticker(data.sticker);
  } catch (error) {
    console.error('Chat request failed:', error);
    addMessage(error.message || 'Maaf, ada gangguan kecil. Coba lagi ya 🌿', 'bot');
  } finally {
    isSending = false;
    chatForm.removeAttribute('aria-busy');
    showTyping(false);
    renderStickerPicker();
  }
}

// --- Event: Saat user kirim pesan ---
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  await sendChat(userInput.value.trim());
});

// --- Pesan pembuka saat halaman dimuat ---
window.addEventListener('load', () => {
  const welcome = "Haiii, selamat datang di cerita Mindy Yawww ✨ Tarik napas dulu bentar... gimana hari kamu? Cerita ke aku, yuk 😌";
  addMessage(welcome, 'bot');
});
