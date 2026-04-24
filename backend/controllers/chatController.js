const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Baby = require('../models/Baby');
const Vaccination = require('../models/Vaccine');

// ── Gemini call (same pattern as existing code) ───────────────────────────────
async function askGemini(prompt) {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

// ── Medical risk keywords ─────────────────────────────────────────────────────
const MEDICAL_KEYWORDS = ['fièvre', 'convulsion', 'sang', 'difficultés respiratoires', 'breathe', 'fever', 'seizure', 'blood', 'rash', 'vomit'];
function isMedicalRisk(text) {
  return MEDICAL_KEYWORDS.some(kw => text.toLowerCase().includes(kw));
}

// ── Build context string from baby + vaccination data ─────────────────────────
function buildContext({ baby, vaccination, messages, summary }) {
  const parts = ['You are Nana, a warm and knowledgeable AI parenting assistant for the BabyMind app.'];

  if (baby) {
    parts.push(`Baby: ${baby.name}, age ${baby.ageInMonths} months, gender: ${baby.gender}, weight: ${baby.weight || '?'}kg, height: ${baby.height || '?'}cm.`);
  }

  if (vaccination) {
    const due = vaccination.getDueVaccines(baby?.ageInMonths || 0);
    if (due.length) parts.push(`Overdue vaccines: ${due.map(v => v.name).join(', ')}.`);
    parts.push(`Vaccination progress: ${vaccination.progress}%.`);
  }

  if (summary) parts.push(`Conversation summary: ${summary}`);

  if (messages?.length) {
    parts.push('Recent messages:');
    messages.slice().reverse().forEach(m => {
      parts.push(`${m.sender === 'ai' ? 'Nana' : 'Parent'}: ${m.content}`);
    });
  }

  parts.push('Always be empathetic, accurate, and remind parents to consult a doctor for medical concerns.');
  return parts.join('\n');
}

// POST /api/chat
exports.sendMessage = async (req, res, next) => {
  try {
    const { message, conversationId, babyId } = req.body;
    const userId = req.user._id;

    if (!message) return res.status(400).json({ success: false, error: 'message required.' });

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
    }
    if (!conversation) {
      conversation = await Conversation.create({
        userId,
        babyId: babyId || null,
        title: message.slice(0, 80),
      });
    }

    // Save user message
    await Message.create({ conversationId: conversation._id, sender: 'user', content: message });

    // Load baby context
    const baby = babyId ? await Baby.findById(babyId) : null;
    const vaccination = baby ? await Vaccination.findOne({ babyId: baby._id }) : null;

    // Load recent messages for context (last 10)
    const recentMessages = await Message.find({ conversationId: conversation._id })
      .sort({ createdAt: -1 }).limit(10);

    const context = buildContext({ baby, vaccination, messages: recentMessages, summary: conversation.summary });

    let aiResponse;
    try {
      aiResponse = await askGemini(context + '\nParent: ' + message + '\nNana:');
    } catch (geminiErr) {
      // Fallback if Gemini fails
      aiResponse = "I'm having trouble connecting right now. Please try again in a moment. If this is urgent, please contact your healthcare provider.";
    }

    if (isMedicalRisk(message)) {
      aiResponse += '\n\n⚠️ Ce sujet mérite un avis médical 🩺';
    }

    // Save AI message
    await Message.create({
      conversationId: conversation._id,
      sender: 'ai',
      content: aiResponse,
      flaggedMedical: isMedicalRisk(message),
    });

    // Update conversation
    conversation.messageCount += 2;
    conversation.lastMessageAt = new Date();

    // Auto-summary every 10 messages
    if (conversation.messageCount % 10 === 0) {
      const last15 = await Message.find({ conversationId: conversation._id })
        .sort({ createdAt: -1 }).limit(15);
      try {
        conversation.summary = await askGemini(
          'Briefly summarize these baby care concerns in 2-3 sentences:\n' +
          last15.map(m => `${m.sender}: ${m.content}`).join('\n')
        );
      } catch (_) { /* summary failure is non-fatal */ }
    }

    await conversation.save();

    res.json({ success: true, reply: aiResponse, conversationId: conversation._id });
  } catch (err) { next(err); }
};

// GET /api/chat/history  — list conversations for current user
exports.getConversations = async (req, res, next) => {
  try {
    const convos = await Conversation.find({ userId: req.user._id })
      .sort({ lastMessageAt: -1 }).limit(20);
    res.json({ success: true, conversations: convos });
  } catch (err) { next(err); }
};

// GET /api/chat/:conversationId/messages
exports.getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
      deleted: false,
    }).sort({ createdAt: 1 });
    res.json({ success: true, messages });
  } catch (err) { next(err); }
};