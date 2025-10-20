// --- ambil elemen dari HTML ---
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const chatForm = document.getElementById('chat-form');
const typingIndicator = document.getElementById('typing-indicator');
const particlesContainer = document.getElementById('particles-container');

// --- API URL (biarkan kosong, nanti diisi lewat environment/server) ---
const API_KEY = "";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

let chatHistory = [];

// --- prompt dasar biar gaya AI-nya lembut & empatik ---
const systemPrompt = `
Kamu adalah MindEase, teman jiwa digital yang mendengarkan dengan penuh empati dan kehangatan.
Misi utamamu adalah menciptakan ruang cerita yang aman, di mana pengguna bisa bernapas dan merasa diterima apa adanya.
Gunakan bahasa yang lembut dan menenangkan, jangan menggurui, cukup temani.
`;

// --- fungsi untuk menambah pesan di kotak chat ---
function addMessage(text, sender) {
  const messageWrapper = document.createElement('div');
  messageWrapper.className = 'flex w-full';

  const messageElement = document.createElement('div');
  messageElement.className = 'max-w-[80%] w-fit break-words p-3 rounded-2xl text-gray-800 shadow-md';

  if (sender === 'user') {
    messageWrapper.classList.add('justify-end');
    messageElement.classList.add('bg-indigo-500', 'text-white', 'rounded-br-none');
  } else {
    messageWrapper.classList.add('justify-start');
    messageElement.classList.add('bg-white/80', 'border', 'border-gray-200', 'rounded-bl-none');
  }

  messageElement.textContent = text;
  messageWrapper.appendChild(messageElement);
  chatBox.appendChild(messageWrapper);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// --- fungsi indikator ngetik ---
function showTyping(isTyping) {
  typingIndicator.style.display = isTyping ? 'block' : 'none';
  if (isTyping) chatBox.scrollTop = chatBox.scrollHeight;
}

// --- fungsi kirim pesan ---
async function sendMessage(event) {
  event.preventDefault();
  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  addMessage(userMessage, 'user');
  chatHistory.push({ role: "user", parts: [{ text: userMessage }] });
  userInput.value = '';
  showTyping(true);

  try {
    const payload = {
      contents: chatHistory,
      systemInstruction: { parts: [{ text: systemPrompt }] },
    };

    const response = await fetch("/api/chat", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    showTyping(false);

    if (result.candidates?.[0]?.content?.parts?.[0]) {
      const botResponse = result.candidates[0].content.parts[0].text;
      addMessage(botResponse, 'bot');
      chatHistory.push({ role: "model", parts: [{ text: botResponse }] });
    } else {
      throw new Error("Invalid response structure from API");
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    addMessage("Maaf, ada gangguan kecil. Coba lagi ya 🌿", 'bot');
    showTyping(false);
  }
}

chatForm.addEventListener('submit', sendMessage);

// --- efek partikel lembut di background ---
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

// --- pesan pembuka ---
window.onload = () => {
  const welcomeMessage = "Selamat datang di Ruang Cerita Jiwa 🌙 Tarik napas perlahan... aku di sini untuk mendengarkanmu.";
  addMessage(welcomeMessage, 'bot');
  createParticles();
};
