# Nour AI Integration

## Setup

1. Add to your `.env`:
```
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant
```

2. Install new dependencies:
```bash
npm install
```

3. (Optional) Add more PDF documents to RAG:
```bash
python3 rag/ingest.py path/to/document.pdf
```

## What's integrated
- Nour AI (Groq LLM) replaces Gemini in the chat
- RAG system: 1,482 chunks from health documents
- Voice input: mic button → Groq Whisper transcription
- Voice output: 🔊 button on each reply → Groq TTS
- Baby profile context from platform DB
- Multilingual: Arabic (فصحى) / French / English
- Medical safety warnings
- Can Bébé product recommendations with links
- Conversation memory

## API endpoints
- POST /api/chat — send message
- GET  /api/chat/history — list conversations
- GET  /api/chat/:id/messages — get messages
- POST /api/chat/transcribe — voice to text
- POST /api/chat/speak — text to voice
