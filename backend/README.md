# Can Bébé Platform — with Nour AI Assistant

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Create `.env` file
Copy `.env.example` to `.env` and fill in your values:
```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
GROQ_API_KEY=gsk_your_groq_api_key
GROQ_MODEL=llama-3.1-8b-instant
```

Get your free Groq API key at: https://console.groq.com

### 3. Create admin user
```bash
node seed.js
```
Admin credentials: `admin@canbebe.com` / `Admin123!`

### 4. Start server
```bash
npm start
```

### 5. Open browser
- App: http://localhost:5000
- Admin: http://localhost:5000/admin.html

## Adding PDFs to Nour's knowledge base
```bash
python3 rag/ingest.py path/to/document.pdf
npm start
```

## Nour AI Features
- 🌸 Multilingual: Arabic (الفصحى), French, English
- 🎤 Voice input: Groq Whisper transcription
- 🔊 Voice output: Groq Orpheus TTS (Arabic) + PlayAI (French)
- 📚 RAG: Searches medical PDFs for accurate answers
- 🧠 Memory: Remembers baby profile and conversation facts
- ⚠️ Medical safety: Always redirects health concerns to pediatrician
