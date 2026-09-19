// Elemen Opening Screen & Navigasi
const openingScreen = document.getElementById('opening-screen');
const chatContainer = document.getElementById('chat-container');
const startLearningBtn = document.getElementById('start-learning-btn');
const studentNameInput = document.getElementById('student-name-input');
const backHomeBtn = document.getElementById('back-home-btn');
const personalizedGreeting = document.getElementById('personalized-greeting');
const chatWelcomeBanner = document.getElementById('chat-welcome-banner');

// Elemen Chat Form & Input
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const fileInput = document.getElementById('file-input');
const attachBtn = document.getElementById('attach-btn');
const sendBtn = document.getElementById('send-btn');
const filePreviewBar = document.getElementById('file-preview-bar');
const previewFilename = document.getElementById('preview-filename');
const removeFileBtn = document.getElementById('remove-file-btn');

let userName = '';

// Handle Mulai Belajar dari Opening Screen
function startChatSession() {
  const enteredName = studentNameInput ? studentNameInput.value.trim() : '';
  if (enteredName) {
    userName = enteredName;
    if (personalizedGreeting) {
      personalizedGreeting.textContent = `Halo, ${userName}! Siap Belajar?`;
    }
  }

  // Transisi halus: sembunyikan opening, tampilkan chatbot
  openingScreen.classList.add('hidden');
  chatContainer.classList.remove('hidden');

  // Fokus ke input pesan
  userInput.focus();
}

if (startLearningBtn) {
  startLearningBtn.addEventListener('click', startChatSession);
}

if (studentNameInput) {
  studentNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      startChatSession();
    }
  });
}

// Handle tombol kembali ke opening / beranda
if (backHomeBtn) {
  backHomeBtn.addEventListener('click', () => {
    chatContainer.classList.add('hidden');
    openingScreen.classList.remove('hidden');
  });
}

// Riwayat percakapan untuk multi-turn context memory
const conversation = [];

let selectedFile = null;

// Handle klik tombol attachment
attachBtn.addEventListener('click', () => {
  fileInput.click();
});

// Handle pemilihan file
fileInput.addEventListener('change', (e) => {
  if (e.target.files && e.target.files[0]) {
    selectedFile = e.target.files[0];
    previewFilename.textContent = selectedFile.name;
    filePreviewBar.classList.remove('hidden');
    userInput.placeholder = `Lampiran: ${selectedFile.name} (masukkan pertanyaan tambahan...)`;
    userInput.focus();
  }
});

// Handle hapus lampiran file
removeFileBtn.addEventListener('click', () => {
  clearSelectedFile();
});

function clearSelectedFile() {
  selectedFile = null;
  fileInput.value = '';
  filePreviewBar.classList.add('hidden');
  previewFilename.textContent = '';
  userInput.placeholder = "Tanyakan materi, minta kuis, atau lampirkan soal...";
}

// Fitur kartu saran
window.useSuggestion = function(text) {
  userInput.value = text;
  userInput.focus();
};

// Handle submit form
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const messageText = userInput.value.trim();
  if (!messageText && !selectedFile) return;

  // Sembunyikan welcome banner pada pesan pertama
  if (chatWelcomeBanner) {
    chatWelcomeBanner.style.display = 'none';
  }

  // 1. Tampilkan pesan user ke chat box
  appendUserMessage(messageText, selectedFile ? selectedFile.name : null);

  // Catat ke riwayat percakapan agar Gemini ingat topik sebelumnya
  if (messageText) {
    conversation.push({ role: 'user', text: messageText });
  }

  // Simpan referensi file yang akan dikirim, lalu reset input
  const fileToSend = selectedFile;
  userInput.value = '';
  clearSelectedFile();
  setLoading(true);

  // 2. Tampilkan pesan sementara bot "Brainlytic sedang berpikir..."
  const botMessageElement = appendBotLoading();

  try {
    // 3. Buat FormData untuk multipart upload (termasuk riwayat percakapan)
    const formData = new FormData();
    formData.append('conversation', JSON.stringify(conversation));
    if (messageText) {
      formData.append('message', messageText);
    }
    if (fileToSend) {
      formData.append('file', fileToSend);
    }

    // 4. Kirim POST request ke /chat
    const response = await fetch('/chat', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Server status ${response.status}`);
    }

    const data = await response.json();

    // 5. Perbarui respon dengan teks dari Brainlytic
    if (data && data.result) {
      botMessageElement.innerHTML = formatMarkdown(data.result);
      // Simpan jawaban bot ke riwayat percakapan
      conversation.push({ role: 'model', text: data.result });
      // Tambahkan tombol aksi cerdas di bawah pesan bot
      attachActionOptions(botMessageElement.parentElement, data.result);
    } else {
      botMessageElement.textContent = "Maaf, Brainlytic tidak dapat memproses jawaban saat ini.";
      if (conversation.length > 0 && conversation[conversation.length - 1].role === 'user') {
        conversation.pop();
      }
    }

  } catch (error) {
    console.error("Error pada chat:", error);
    botMessageElement.textContent = `⚠️ Terjadi kendala: ${error.message || 'Gagal terhubung ke server.'}`;
    // Hapus giliran user terakhir jika pengiriman gagal
    if (conversation.length > 0 && conversation[conversation.length - 1].role === 'user') {
      conversation.pop();
    }
  } finally {
    setLoading(false);
    userInput.focus();
    scrollToBottom();
  }
});

// Helper: Menambahkan pesan User
function appendUserMessage(text, attachedFileName) {
  const row = document.createElement('div');
  row.className = 'message-row user';

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = '👤';

  const content = document.createElement('div');
  content.className = 'message-content';

  const bubble = document.createElement('div');
  bubble.className = 'bubble';

  if (attachedFileName) {
    const fileBadge = document.createElement('div');
    fileBadge.className = 'attachment-badge';
    fileBadge.innerHTML = `📎 <strong>${escapeHtml(attachedFileName)}</strong>`;
    bubble.appendChild(fileBadge);
  }

  if (text) {
    const textNode = document.createElement('div');
    textNode.textContent = text;
    bubble.appendChild(textNode);
  }

  content.appendChild(bubble);
  row.appendChild(avatar);
  row.appendChild(content);

  chatBox.appendChild(row);
  scrollToBottom();
}

// Helper: Menambahkan bubble bot yang sedang loading
function appendBotLoading() {
  const row = document.createElement('div');
  row.className = 'message-row bot';

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = '🧠';

  const content = document.createElement('div');
  content.className = 'message-content';

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.innerHTML = `
    <div class="typing-dots">
      <span></span>
      <span></span>
      <span></span>
    </div>
  `;

  content.appendChild(bubble);
  row.appendChild(avatar);
  row.appendChild(content);

  chatBox.appendChild(row);
  scrollToBottom();

  return bubble;
}

// Helper: Scroll ke dasar chat
function scrollToBottom() {
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Helper: Set loading state
function setLoading(isLoading) {
  userInput.disabled = isLoading;
  sendBtn.disabled = isLoading;
  attachBtn.disabled = isLoading;
}

// Helper: Sanitasi HTML sederhana
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Konfigurasi marked.js jika tersedia
if (window.marked && typeof window.marked.setOptions === 'function') {
  window.marked.setOptions({
    breaks: true, // Enter otomatis menjadi baris baru
    gfm: true
  });
}

// Helper: Format Markdown agar rapi (heading, bold, italic, list, hr, code)
function formatMarkdown(text) {
  // Jika library marked.js berhasil dimuat
  if (window.marked && typeof window.marked.parse === 'function') {
    return window.marked.parse(text);
  }

  // Fallback bawaan jika offline tanpa CDN
  let res = escapeHtml(text);
  // Headings (#, ##, ###)
  res = res.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  res = res.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  res = res.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  // Horizontal rule (---)
  res = res.replace(/^---$/gim, '<hr>');
  // Bold & Italic
  res = res.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  res = res.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  res = res.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // Inline code
  res = res.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Lists
  res = res.replace(/^\s*[-*]\s+(.*)$/gim, '<li>$1</li>');
  res = res.replace(/^\s*\d+\.\s+(.*)$/gim, '<li>$1</li>');
  // Line breaks
  res = res.replace(/\n/g, '<br>');
  return res;
}

// Helper: Menambahkan tombol opsi aksi cepat di bawah penjelasan bot
function attachActionOptions(container, responseRawText) {
  const actionsWrapper = document.createElement('div');
  actionsWrapper.className = 'bot-action-options';

  // 1. Tombol Pelajari Lebih Dalam
  const detailBtn = document.createElement('button');
  detailBtn.type = 'button';
  detailBtn.className = 'action-chip';
  detailBtn.innerHTML = '<span>🔍</span> Pelajari Lebih Dalam';
  detailBtn.addEventListener('click', () => {
    sendQuickMessage('Tolong jelaskan materi di atas lebih mendalam dan rinci beserta contoh kasus nyata sehari-hari!');
  });

  // 2. Tombol Buatkan Latihan Soal
  const quizBtn = document.createElement('button');
  quizBtn.type = 'button';
  quizBtn.className = 'action-chip';
  quizBtn.innerHTML = '<span>📝</span> Buatkan Latihan Soal';
  quizBtn.addEventListener('click', () => {
    sendQuickMessage('Buatkan 3 latihan soal interaktif pilihan ganda dan pembahasannya berdasarkan materi ini!');
  });

  // 3. Tombol Rangkum & Cetak PDF
  const pdfBtn = document.createElement('button');
  pdfBtn.type = 'button';
  pdfBtn.className = 'action-chip';
  pdfBtn.innerHTML = '<span>📄</span> Rangkum & Cetak PDF';
  pdfBtn.addEventListener('click', () => {
    printAsPdf(formatMarkdown(responseRawText));
  });

  // 4. Tombol Unggah File Terkait
  const uploadBtn = document.createElement('button');
  uploadBtn.type = 'button';
  uploadBtn.className = 'action-chip';
  uploadBtn.innerHTML = '<span>📎</span> Unggah File Terkait';
  uploadBtn.addEventListener('click', () => {
    fileInput.click();
  });

  actionsWrapper.appendChild(detailBtn);
  actionsWrapper.appendChild(quizBtn);
  actionsWrapper.appendChild(pdfBtn);
  actionsWrapper.appendChild(uploadBtn);

  container.appendChild(actionsWrapper);
  scrollToBottom();
}

// Helper: Kirim pesan cepat otomatis
function sendQuickMessage(text) {
  userInput.value = text;
  chatForm.dispatchEvent(new Event('submit', { cancelable: true }));
}

// Helper: Cetak Ringkasan Materi ke PDF / Dialog Print Browser
function printAsPdf(formattedHtml) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Harap izinkan pop-up pada browser Anda untuk mencetak PDF.');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8" />
      <title>Brainlytic - Catatan & Ringkasan Belajar</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Plus Jakarta Sans', Arial, sans-serif;
          padding: 40px;
          color: #0f172a;
          line-height: 1.6;
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          border-bottom: 2px solid #4f46e5;
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .header h1 {
          margin: 0;
          color: #4f46e5;
          font-size: 24px;
        }
        .header p {
          margin: 6px 0 0 0;
          color: #64748b;
          font-size: 13px;
        }
        h1, h2, h3, h4 { color: #1e1b4b; margin-top: 20px; margin-bottom: 8px; }
        hr { border: none; border-top: 1px solid #cbd5e1; margin: 16px 0; }
        ul, ol { padding-left: 24px; margin: 10px 0; }
        li { margin-bottom: 6px; }
        code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
        .footer {
          margin-top: 40px;
          border-top: 1px solid #e2e8f0;
          padding-top: 12px;
          font-size: 12px;
          color: #94a3b8;
          text-align: center;
        }
        @media print {
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🧠 Brainlytic - Catatan & Ringkasan Belajar</h1>
        <p>AI Study Buddy & Tutor • Dicetak pada: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
      </div>
      <div class="content">
        ${formattedHtml}
      </div>
      <div class="footer">
        Dihasilkan oleh Brainlytic AI Study Buddy
      </div>
      <script>
        window.onload = function() {
          window.print();
        };
      <\/script>
    </body>
    </html>
  `);
  printWindow.document.close();
}
