// ================================
// 🌸 MindEase (Mindy)
// ================================

// --- Ambil elemen dari HTML ---
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const chatForm = document.getElementById('chat-form');
const typingIndicator = document.getElementById('typing-indicator');

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
1. Ngobrol kayak temen — pake bahasa sehari-hari, tapi jangan berlebihan.
2. Hindari bahasa formal kayak robot atau buku motivasi.
3. Jangan sok tahu, cukup temani dan tanggepin dengan empati.
4. Gunakan emoji sewajarnya untuk menambah kehangatan.
5. Tutup beberapa respon dengan kalimat positif atau lucu ringan biar suasananya adem 🌷
`;

let chatHistory = [];

// --- Fungsi: Tambah pesan ke layar ---
function addMessage(text, sender) {
  const wrapper = document.createElement('div');
  wrapper.className = 'flex w-full';

  const bubble = document.createElement('div');
  bubble.className = 'max-w-[80%] p-3 rounded-2xl shadow-md break-words';
  bubble.textContent = text;

  // Styling berdasarkan pengirim
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

// --- Fungsi: Indikator mengetik ---
function showTyping(isTyping) {
  typingIndicator.style.display = isTyping ? 'block' : 'none';
}


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
    showTyping(false);

    // Tampilkan balasan bot
    addMessage(data.reply, 'bot');

  } catch (err) {
    console.error("Error:", err);
    showTyping(false);
    addMessage("Maaf, ada gangguan kecil. Coba lagi ya 🌿", 'bot');
  }
});

// --- Pesan pembuka saat halaman dimuat ---
window.addEventListener('load', () => {
  const welcome = "Haiii, selamat datang di cerita dunkkk eak ✨ Tarik napas dulu bentar... gimana hari kamu? Cerita ke aku, yuk 😌";
  addMessage(welcome, 'bot');
});
