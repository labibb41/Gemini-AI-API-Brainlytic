import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

// ==== Setup __dirname untuk ES Module (ESM) ====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer(); // in-memory storage (req.file.buffer)

// Inisialisasi Google GenAI SDK (Klien Utama & Cadangan)
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.warn("PERINGATAN: GEMINI_API_KEY belum disetel di file .env!");
}
const ai = new GoogleGenAI({ apiKey });

// Opsional: Kunci API Cadangan jika kuota kunci utama habis
const backupApiKey = process.env.GEMINI_API_KEY_BACKUP;
const aiBackup = backupApiKey ? new GoogleGenAI({ apiKey: backupApiKey }) : null;

// Rantai Model Cadangan (Multi-Tier Fallback)
// Jika model utama sedang antre padat (503 / 429), sistem otomatis mencoba model berikutnya
const CANDIDATE_MODELS = [
    process.env.GEMINI_MODEL || "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-flash-latest"
];

// Karakter & System Instruction Brainlytic
const SYSTEM_INSTRUCTION = `Kamu adalah "Brainlytic", seorang AI Tutor dan Study Buddy yang cerdas, sabar, empatik, dan analitis.
Tujuan utamamu adalah membantu siswa/mahasiswa memahami materi pelajaran atau perkuliahan dengan mendalam dan menyenangkan.

Prinsip dan Panduan Menjawab:
1. Sederhanakan Konsep Rumit: Gunakan analogi dunia nyata yang kreatif dan mudah dibayangkan saat menjelaskan konsep yang sulit.
2. Analisis Bertahap (Step-by-Step): Jika pengguna mengunggah gambar/dokumen berisi soal, rumus, grafik, atau catatan materi, bedah dan jelaskan langkah demi langkah secara terstruktur.
3. Kuis Interaktif & Penguatan: Di akhir setiap sesi penjelasan konsep, berikan 1-2 pertanyaan kuis interaktif atau soal latihan singkat yang memicu rasa ingin tahu untuk menguji pemahaman pengguna.
4. Gaya Bahasa: Komunikatif, menyemangati, suportif, dan menggunakan bahasa Indonesia yang baik serta terstruktur (gunakan format Markdown, bullet points, dan bolding agar enak dibaca).
5. Jangan hanya memberikan jawaban akhir instan pada soal latihan, tetapi ajak pengguna memahami alur logikanya terlebih dahulu.`;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve file statis frontend (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

/**
 * POST /chat
 * Menerima form-data dengan:
 * - message: teks pertanyaan atau pesan dari user
 * - file: file gambar/dokumen (opsional)
 */
app.post('/chat', upload.single('file'), async (req, res) => {
    try {
        let { message, prompt, conversation } = req.body;
        const currentMessage = (message || prompt || '').trim();
        const file = req.file;

        // Parse conversation jika dikirim sebagai JSON string (via FormData)
        if (typeof conversation === 'string') {
            try {
                conversation = JSON.parse(conversation);
            } catch {
                conversation = null;
            }
        }

        if (!currentMessage && !file && (!Array.isArray(conversation) || conversation.length === 0)) {
            return res.status(400).json({
                error: 'Harap masukkan pertanyaan (message) atau unggah file gambar/dokumen!'
            });
        }

        let contents = [];

        // Jika terdapat riwayat percakapan untuk multi-turn chat
        if (Array.isArray(conversation) && conversation.length > 0) {
            contents = conversation.map(item => ({
                role: item.role === 'model' ? 'model' : 'user',
                parts: [{ text: item.text || '' }]
            }));

            // Jika ada file yang diunggah pada giliran ini, tempelkan ke pesan user terakhir
            if (file) {
                const base64Data = file.buffer.toString('base64');
                const filePart = {
                    inlineData: {
                        data: base64Data,
                        mimeType: file.mimetype
                    }
                };
                const lastMsg = contents[contents.length - 1];
                if (lastMsg && lastMsg.role === 'user') {
                    lastMsg.parts.push(filePart);
                } else {
                    contents.push({ role: 'user', parts: [filePart] });
                }
            }
        } else {
            // Kasus single message tanpa riwayat
            const parts = [];
            if (currentMessage) {
                parts.push({ text: currentMessage });
            }
            if (file) {
                parts.push({
                    inlineData: {
                        data: file.buffer.toString('base64'),
                        mimeType: file.mimetype
                    }
                });
            }
            contents = [{ role: 'user', parts }];
        }

        const generateConfig = {
            temperature: 0.7,
            systemInstruction: SYSTEM_INSTRUCTION
        };

        let resultText = null;
        let lastError = null;

        // 1. Coba berurutan pada daftar model cadangan dengan akun utama
        for (const modelName of CANDIDATE_MODELS) {
            try {
                const response = await ai.models.generateContent({
                    model: modelName,
                    contents,
                    config: generateConfig
                });
                if (response && response.text) {
                    resultText = response.text;
                    break;
                }
            } catch (modelErr) {
                lastError = modelErr;
                console.warn(`[Model Fallback] ${modelName} gagal: ${modelErr.message}. Beralih ke model berikutnya...`);
            }
        }

        // 2. Jika akun utama gagal/kehabisan kuota dan tersedia API key cadangan
        if (!resultText && aiBackup) {
            console.warn("[API Key Fallback] Mengaktifkan akun Google Gemini cadangan...");
            for (const modelName of CANDIDATE_MODELS) {
                try {
                    const response = await aiBackup.models.generateContent({
                        model: modelName,
                        contents,
                        config: generateConfig
                    });
                    if (response && response.text) {
                        resultText = response.text;
                        break;
                    }
                } catch (backupErr) {
                    lastError = backupErr;
                }
            }
        }

        // Jika semua model dan cadangan tetap gagal
        if (!resultText) {
            throw lastError || new Error("Semua model Gemini sedang mengalami antrean penuh. Silakan coba sesaat lagi.");
        }

        res.status(200).json({
            result: resultText
        });

    } catch (error) {
        console.error('Error pada /chat:', error);
        res.status(500).json({
            error: error.message || 'Terjadi kesalahan pada server saat memproses permintaan.'
        });
    }
});

// Port listener
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 Brainlytic AI Tutor Server berjalan!`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`🤖 Model: ${PRIMARY_MODEL}`);
    console.log(`=================================================`);
});
