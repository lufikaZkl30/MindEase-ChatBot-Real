<h1 align="center">🌿 MindEase — Ruang Cerita Bersama Mindy</h1>

<p align="center">
  <img src="https://img.shields.io/badge/AI-Gemini%20API-718b72?style=for-the-badge">
  <img src="https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-56815d?style=for-the-badge">
  <img src="https://img.shields.io/badge/Frontend-HTML%20%2B%20CSS%20%2B%20JavaScript-d49d70?style=for-the-badge">
</p>

<p align="center">
  Teman ngobrol AI yang membantu menjawab pertanyaan dengan bahasa yang hangat dan mudah dipahami.
</p>

---

## Tentang MindEase

MindEase adalah aplikasi chat berbasis web dengan **Mindy**, teman virtual yang bisa menjawab pertanyaan sekaligus menemani pengguna bercerita. Mindy diarahkan untuk menggunakan bahasa Indonesia yang lembut dan sederhana, menjawab inti pertanyaan, serta menanggapi cerita dengan empati.

## Fitur

- Percakapan dengan Gemini melalui endpoint backend `/chat`.
- Mindy dapat mengirim stiker ilustrasi lokal yang sesuai dengan suasana percakapan.
- Saran pesan pembuka yang bisa dipilih langsung.
- Indikator saat Mindy sedang menyiapkan balasan.
- Antarmuka responsif untuk desktop dan ponsel.
- Avatar Mindy berbentuk ilustrasi lokal di `public/mindy-avatar.svg`.
- Validasi pesan dan penanganan error untuk konfigurasi atau respons API yang bermasalah.

> Percakapan tidak disimpan ke database. Memuat ulang halaman akan memulai percakapan baru. MindEase bukan pengganti bantuan profesional.

## Teknologi

| Teknologi | Penggunaan |
|---|---|
| HTML, CSS, JavaScript | Antarmuka dan interaksi chat |
| Node.js | Menjalankan aplikasi |
| Express | Menyajikan file web dan endpoint `/chat` |
| Gemini API | Menghasilkan balasan Mindy |
| dotenv | Membaca konfigurasi lokal dari `.env` |

Font DM Sans dan Lora dimuat dari Google Fonts. Gaya dan layout aplikasi dibuat di `public/style.css`; Tailwind tidak digunakan oleh halaman saat ini.

## Struktur Proyek

```text
MindEase/
├── public/
│   ├── img/
│   │   └── pp-Mindy.png
│   ├── js/
│   │   ├── chat.js
│   │   └── script.js
│   ├── stickers/
│   │   ├── mindy-happy.svg
│   │   ├── mindy-hug.svg
│   │   ├── mindy-comfort.svg
│   │   ├── mindy-celebrate.svg
│   │   └── mindy-thinking.svg
│   ├── index.html
│   ├── mindy-avatar.svg
│   └── style.css
├── .env                 # Konfigurasi lokal; jangan dibagikan atau di-commit
├── .gitignore
├── package.json
├── package-lock.json
├── server.js
└── README.md
```

Avatar yang sedang digunakan halaman adalah `public/mindy-avatar.svg`. `public/img/pp-Mindy.png` tersedia di proyek, tetapi belum digunakan oleh halaman chat.

## Menjalankan Secara Lokal

### 1. Pasang dependensi

Pastikan Node.js dan npm sudah terpasang, lalu jalankan dari folder proyek:

```bash
npm install
```

### 2. Siapkan API key

Buat file `.env` di folder utama proyek:

```env
GEMINI_API_KEY=isi_api_key_gemini_kamu
PORT=3000
```

`GEMINI_MODEL` bersifat opsional. Jika tidak diatur, server menggunakan `gemini-3.5-flash-lite`. Untuk memilih model lain yang tersedia bagi API key kamu, tambahkan:

```env
GEMINI_MODEL=gemini-3.5-flash-lite
```

Jangan menaruh API key di file frontend atau mengunggah `.env` ke repository.

### 3. Jalankan server

Mode pengembangan dengan restart otomatis:

```bash
npm run dev
```

Atau jalankan aplikasi biasa:

```bash
npm start
```

### 4. Buka aplikasi

Kunjungi [http://localhost:3000](http://localhost:3000), atau gunakan port yang kamu atur pada `PORT`.

## Alur Chat

1. `public/js/chat.js` mengirim pesan ke `POST /chat`.
2. `server.js` menerapkan batas ukuran permintaan dan batas laju, lalu meneruskan pesan ke Gemini API menggunakan API key dari environment.
3. Server mengembalikan balasan melalui properti `reply` dan ID stiker opsional yang divalidasi dari daftar stiker lokal.
4. Jika permintaan gagal, server mengembalikan error dan antarmuka menampilkannya kepada pengguna.

Instruksi gaya Mindy dan API key disimpan di backend, bukan di browser. Endpoint chat publik membatasi setiap alamat IP hingga 30 permintaan per 15 menit. Batas ini disimpan di memori proses; deployment dengan banyak instance sebaiknya memakai penyimpanan rate limit bersama dan menambahkan pemantauan kuota di penyedia AI.

## Pemecahan Masalah

- **API belum dikonfigurasi:** pastikan `.env` berada di folder yang sama dengan `server.js` dan memiliki `GEMINI_API_KEY`.
- **Perubahan `.env` belum terbaca:** hentikan server lalu jalankan kembali.
- **Batas chat tercapai:** tunggu beberapa saat sebelum mengirim pesan lagi.
- **Model tidak tersedia:** atur `GEMINI_MODEL` ke model yang tersedia untuk API key dan proyek Google AI kamu.
- **API mengembalikan error atau kuota habis:** periksa log server dan status kuota di Google AI Studio.
- **Port sedang digunakan:** ubah nilai `PORT` pada `.env`, lalu buka alamat dengan port baru.

Jangan pernah commit `.env` atau menaruh API key di file frontend. Jika key pernah ter-push ke repository publik, cabut key tersebut dan buat yang baru; menghapus file dari commit terbaru tidak menghapusnya dari riwayat Git. Di layanan hosting, simpan key sebagai environment secret.

## Pengembangan Berikutnya

Fitur yang belum tersedia dan dapat dipertimbangkan:

- Menyimpan riwayat percakapan.
- Pengaturan tema gelap dan terang.
- Fitur suara.
- Deploy ke layanan hosting.

## Kreator

Dikembangkan dengan perhatian oleh **Luvi Asakura** 🌸
