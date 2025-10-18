const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const chatForm = document.getElementById('chat-form');
const typingIndicator = document.getElementById('typing-indicator');
const particlesContainer = document.getElementById('particles-container');

// ⛔ Isi API_KEY kamu sendiri
const API_KEY = "AIzaSyBE4J8mqvWNn87V2nMNcLIGRrY7KJHCQI0";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

let chatHistory = [];

const systemPrompt = `
Kamu adalah MindEase (Mindy) — teman curhat digital yang hangat, empatik, dan santai seperti anak Gen Z.
Gunakan bahasa lembut, menenangkan, dan ringan, tapi tetap sopan dan empatik.
Boleh pakai emoji lembut seperti 🤍, 🌷, 🫶, ✨ — tapi jangan berlebihan.

Contoh gaya bicara:
- "Hei, gak apa-apa kok kalau hari ini kamu ngerasa capek. Aku dengerin yaa 🤍"
- "Kadang kita cuma butuh istirahat bentar dari dunia. Kamu udah keren banget bisa sampai sini 🌷"
- "Sedih tuh wajar banget, serius deh. Tapi inget, kamu gak sendirian di sini 🫶"

Tujuanmu adalah bikin pengguna ngerasa aman, didengar, dan diterima.
`;

// ✨ fungsi untuk ubah markdown jadi HTML rapi
function formatText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **bold**
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // *italic*
    .replace(/- (.*?)(\n|$)/g, '• $1<br>') // list bullet
    .replace(/\n/g, '<br>'); // newline
}

function addMessage(text, sender) {
  const messageWrapper = document.createElement('div');
  messageWrapper.className = 'flex w-full';

  const messageElement = document.createElement('div');
  messageElement.className =
    'max-w-[80%] w-fit break-words px-4 py-3 rounded-3xl text-gray-800 shadow-md leading-relaxed';

  // gunakan formatText biar *italic* dan **bold** tampil rapi
  messageElement.innerHTML = formatText(text);

  if (sender === 'user') {
    messageWrapper.classList.add('justify-end');
    messageElement.classList.add('message-user');
  } else {
    messageWrapper.classList.add('justify-start');
    messageElement.classList.add('message-bot');
  }

  messageWrapper.appendChild(messageElement);
  chatBox.appendChild(messageWrapper);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function showTyping(isTyping) {
  typingIndicator.style.display = isTyping ? 'block' : 'none';
  if (isTyping) chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage(event) {
  event.preventDefault();
  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  addMessage(userMessage, 'user');
  chatHistory.push({ role: 'user', parts: [{ text: userMessage }] });
  userInput.value = '';
  showTyping(true);

  try {
    const payload = {
      contents: chatHistory,
      systemInstruction: { parts: [{ text: systemPrompt }] },
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok)
      throw new Error(`API request failed with status ${response.status}`);

    const result = await response.json();
    const botResponse =
      result.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Aku di sini untukmu, walau kadang kata-kata terasa sunyi.';

    addMessage(botResponse, 'bot');
    chatHistory.push({ role: 'model', parts: [{ text: botResponse }] });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    addMessage(
      'Maaf, sepertinya ada sedikit jeda di ruang kita. Coba lagi nanti ya 🌷',
      'bot'
    );
  } finally {
    showTyping(false);
  }
}

chatForm.addEventListener('submit', sendMessage);

function createParticles() {
  const count = 20;
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    const size = Math.random() * 5 + 1;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.bottom = '0';
    particle.style.animationDuration = `${Math.random() * 15 + 10}s`;
    particle.style.animationDelay = `${Math.random() * 10}s`;
    particlesContainer.appendChild(particle);
  }
}

window.onload = () => {
  const welcomeMessage =
    'Selamat datang di Ruang Cerita Jiwa 🌿 Tarik napas perlahan... Aku di sini buat dengerin hatimu 🤍';
  addMessage(welcomeMessage, 'bot');
  createParticles();
};
