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


## 📄 Lisensi
Proyek ini dirilis di bawah lisensi [ISC License](LICENSE).
