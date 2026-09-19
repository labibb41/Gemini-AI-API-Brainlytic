# 🧠 Brainlytic - AI Tutor & Study Buddy

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-blue.svg)](https://expressjs.com/)
[![Google Gemini API](https://img.shields.io/badge/Gemini_API-%40google%2Fgenai-orange.svg)](https://aistudio.google.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

> **Brainlytic** adalah aplikasi web chatbot AI multimodal bertenaga Google Gemini API yang dirancang sebagai **AI Tutor dan Study Buddy pribadi** yang cerdas, sabar, dan analitis untuk membantu siswa dan mahasiswa belajar lebih efektif.

---

## 📌 Latar Belakang & Masalah yang Diselesaikan

Banyak siswa dan mahasiswa mengalami kesulitan saat belajar mandiri karena:
1. **Materi teks yang terlalu kaku dan abstrak** sehingga sulit dipahami secara intuitif.
2. **Keterbatasan teman diskusi atau tutor di rumah** saat buntu mengerjakan soal atau PR.
3. **Rasa cemas atau malu bertanya** berulang-ulang di kelas konvensional.
4. **Alat AI lain hanya memberi jawaban akhir instan** tanpa menjelaskan alur logika dan cara berpikirnya.

**Brainlytic hadir sebagai solusi:** Memberikan bimbingan belajar bertahap (*step-by-step*), menyederhanakan materi sulit dengan analogi dunia nyata, membedah foto soal/catatan PDF, dan menguji pemahaman dengan kuis interaktif 24/7.

---

## 🎯 Target Pengguna

* **Siswa SMP, SMA, & SMK**: Membutuhkan teman belajar mandiri untuk membedah PR, materi eksakta (Fisika, Kimia, Matematika, Biologi), dan persiapan ujian/UTBK.
* **Mahasiswa**: Membedah konsep teori kuliah yang kompleks, membaca ringkasan dokumen materi kuliah (PDF), dan diskusi ilmiah.
* **Pelajar Mandiri (*Self-Learners*)**: Siapa pun yang sedang mempelajari topik baru tanpa rasa takut atau malu bertanya hal mendasar.
* **Guru & Orang Tua**: Mendapatkan inspirasi analogi kreatif dan contoh latihan soal untuk diajarkan ke anak/murid.

---

## ✨ Fitur Unggulan

* 💡 **Penyederhana Materi dengan Analogi**: Menjelaskan konsep rumit menggunakan perumpamaan kehidupan nyata yang renyah dan membekas di ingatan.
* 📸 **Bedah Soal dari Foto & PDF (*Multimodal*)**: Cukup unggah foto soal atau lembar catatan, Brainlytic mengupas alur rumus dan logikanya langkah demi langkah secara in-memory (RAM) tanpa membebani penyimpanan lokal.
* 🧠 **Multi-Turn Context Memory**: Mengingat seluruh alur percakapan dari awal, memungkinkan diskusi mendalam (*follow-up*) yang alami tanpa perlu mengulang topik.
* ⚡ **Tombol Aksi Cepat (*Smart Action Chips*)**:
  * 🔍 **Pelajari Lebih Dalam**: Memperdalam materi dan meminta contoh studi kasus nyata.
  * 📝 **Buatkan Latihan Soal**: Menghasilkan 3 kuis interaktif pilihan ganda lengkap dengan pembahasan.
  * 📄 **Rangkum & Cetak PDF**: Mengonversi hasil rangkuman obrolan menjadi lembar catatan belajar rapi berformat PDF siap cetak/simpan luring (*offline*).
  * 📎 **Unggah File Terkait**: Memilih berkas soal/catatan tambahan dengan 1 klik.
* 🎨 **Halaman Pembuka Interaktif (*Opening Screen*)**: Dilengkapi sapaan personal sesuai nama siswa dan kartu saran topik populer.
* 🛡️ **Tampilan Markdown Rapi**: Judul, tebal-miring, list poin, dan rumus diformat secara elegan menggunakan `marked.js`.

---

## 🛠️ Tech Stack

* **Backend**: Node.js (ES Module), Express.js
* **AI Engine**: Google Gemini API via official SDK (`@google/genai`)
* **File Upload**: `multer` (In-Memory Buffer)
* **Keamanan & Konfigurasi**: `cors`, `dotenv`
* **Frontend**: Vanilla HTML5, CSS3 Modern (Glassmorphism & Flex/Grid), JavaScript ES6+
* **Markdown Parser**: `marked.js`

---

## 📁 Struktur Direktori

```text
brainlytic/
├── .env.example          # Template konfigurasi environment
├── .gitignore            # Mengabaikan node_modules dan file rahasia .env
├── package.json          # Manajemen dependensi dan skrip proyek
├── index.js              # Server backend Express & integrasi Gemini API
├── README.md             # Dokumentasi lengkap proyek
└── public/
    ├── index.html        # Antarmuka web (Opening Screen & Chat Area)
    ├── style.css         # Styling modern bertema Study Buddy
    └── script.js         # Logika chat, FormData, memori percakapan & cetak PDF
```

---

## 🚀 Panduan Instalasi & Menjalankan

### 1. Clone Repositori
```bash
git clone https://github.com/labibb41/Gemini-AI-API-Brainlytic.git
cd Gemini-AI-API-Brainlytic
```

### 2. Pasang Dependensi
```bash
npm install
```

### 3. Buat File `.env`
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Buka file `.env` dan masukkan API Key Google Gemini Anda:
```env
PORT=3000
GEMINI_API_KEY=masukkan_api_key_gemini_anda_di_sini
GEMINI_MODEL=gemini-3.5-flash
```
> 🔑 **Cara Mendapatkan API Key**: Kunjungi [Google AI Studio](https://aistudio.google.com/), buat akun/login, lalu klik **"Get API key"**.

### 4. Jalankan Aplikasi
* **Mode Standar**:
  ```bash
  node index.js
  ```
* **Mode Pengembangan (Auto-Reload)**:
  ```bash
  npm run dev
  ```

### 5. Buka di Browser
Akses aplikasi melalui alamat:  
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🔌 Dokumentasi Endpoint API

### `POST /chat`
Menerima pertanyaan teks dan/atau lampiran berkas gambar/dokumen.

* **Content-Type**: `multipart/form-data`
* **Request Body**:
  * `message` *(string, opsional jika melampirkan berkas)*: Teks pertanyaan atau prompt.
  * `conversation` *(string JSON, opsional)*: Array riwayat percakapan untuk *multi-turn chat*.
  * `file` *(binary/file, opsional)*: File foto soal (`image/*`) atau dokumen (`application/pdf`, `text/plain`).
* **Response Contoh (Status 200 OK)**:
  ```json
  {
    "result": "Halo! Mari kita bedah soal ini langkah demi langkah...\n\n### 1. Konsep Dasar\n..."
  }
  ```

---

## 📄 Lisensi
Proyek ini dirilis di bawah lisensi [ISC License](LICENSE).
