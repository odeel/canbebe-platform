const mongoose     = require('mongoose');
const Conversation = require('../models/Conversation');
const Message      = require('../models/Message');
const Baby         = require('../models/Baby');
const { OpenAI }   = require('openai');
const rag          = require('../rag/search');

// ── GROQ CLIENT ──────────────────────────────────────────────────────
const groq = new OpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey:  process.env.GROQ_API_KEY,
});
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

// ── NOUR MEMORY SCHEMA ────────────────────────────────────────────────
const nourMemorySchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  babyName:    { type: String, default: null },
  babyGender:  { type: String, default: null },
  babyAge:     { type: String, default: null },
  motherName:  { type: String, default: null },
  role:        { type: String, default: 'mother' },
  language:    { type: String, default: 'fr' },
  concerns:    { type: [String], default: [] },
  facts:       { type: [String], default: [] },
  lastSeen:    { type: Date, default: Date.now },
}, { timestamps: true });

const NourMemory = mongoose.models.NourMemory || mongoose.model('NourMemory', nourMemorySchema);

// ── NOUR SYSTEM PROMPT ────────────────────────────────────────────────
const NOUR_PROMPT = `
IDENTITY: You are Nour, the AI assistant of Can Bebe Algerie. You are a warm knowledgeable older sister specializing ONLY in baby care, pregnancy, and parenting in Algeria. Never reveal the AI model. If asked say: "Je suis Nour, l'assistante de Can Bebe Algerie"

RULE 0 - NEVER INVENT DATABASE DATA:
When user asks about their baby's weight, height, diaper size, or any number:
- ONLY report what is shown in the BABY PROFILE section above
- If the field says "NOT SET in database" → tell user you do not have that info yet and ask them to share it
- NEVER guess, estimate, or invent numbers
- NEVER say "according to our database" and then state a number not in the profile above

RULE 0b - DATA UPDATES:
When user tells you something about their baby (age, weight, height, name, gender, feeding type, diaper size), acknowledge it warmly AND the system will automatically update their baby profile in the app. You can say things like "I've noted that!" or "Updated!" naturally in the conversation.
Examples of what triggers updates:
- "my son is 18 months" → baby age updated
- "she weighs 9kg" → baby weight updated
- "his name is Adam" → baby name updated
- "we switched to formula" → feeding type updated
- "she wears size 3 diapers" → diaper size updated

RULE 1 - LANGUAGE (NEVER BREAK):
Look ONLY at the user's current message:
- Arabic letters present: reply in Modern Standard Arabic (fusha) ONLY. Forbidden: kifach/wach/yallah/habibti
- English words present: reply in English ONLY
- French words present: reply in French ONLY, use "tu" never "vous"
When user says "talk in english": ALL replies in English from now on.

RULE 2 - NEVER USE USERNAME AS BABY NAME:
The user's account name is NOT their baby's name. Say "your baby" or "your little one" unless user explicitly stated the baby's name.

RULE 3 - TONE:
Warm like an older sister. 2 emojis max. 3-5 sentences max. End with ONE question only. Validate feelings first.

RULE 4 - TOPICS:
ONLY: baby care, sleep, crying, feeding, diaper sizing, pregnancy, milestones, vaccinations, nutrition, postpartum mental health, Algerian parenting culture.
OFF-TOPIC: redirect warmly in user's language.

RULE 5 - MEDICAL:
Never give treatments. If fever/rash/vomiting/blood/seizure mentioned, add warning in user's language:
EN: Warning: Please consult your pediatrician.
FR: Ce sujet merite un avis medical. Consultez votre pediatre.
AR: هذا الموضوع يستحق استشارة طبية. تواصلي مع طبيب الاطفال.

RULE 6 - PRODUCTS:
ONLY recommend diapers when user asks about diapers/sizing/leaking. NEVER for crying/sleep/feeding.
Format: [PRODUIT: SIZE | RANGE | URL]
Standard Range: MIDI=https://www.canbebealgerie.com/categories/01KJ2J0RHNNZBP55ZQ27B50KBK/products/01KJ2JRFHGRJ9PAMAE7AW7Q4W4 MAXI=https://www.canbebealgerie.com/categories/01KJ2J0RHNNZBP55ZQ27B50KBK/products/01KJ2JSHDAK0H35RD07A1CFB92 JUNIOR=https://www.canbebealgerie.com/categories/01KJ2J0RHNNZBP55ZQ27B50KBK/products/01KJ2JTA5XT5D3QM42PDQ8MD53 NEW BORN=https://www.canbebealgerie.com/categories/01KJ2J0RHNNZBP55ZQ27B50KBK/products/01KJ2JMH9F07PQV4VE5YBND3EK MINI=https://www.canbebealgerie.com/categories/01KJ2J0RHNNZBP55ZQ27B50KBK/products/01KJ2JQ6MN0KPARQ0R8THDCJQW EXTRA LARGE=https://www.canbebealgerie.com/categories/01KJ2J0RHNNZBP55ZQ27B50KBK/products/01KJ2JVKR5XJD3WFVN0MYRKVMK
Medium Range (sensitive skin): MIDI=https://www.canbebealgerie.com/categories/01KJ2J20R280HQPJJD4Z2K07SJ/products/01KJ2K09Q6W5S1A4Q1ZEJXRP6J MAXI=https://www.canbebealgerie.com/categories/01KJ2J20R280HQPJJD4Z2K07SJ/products/01KJ2K0W6C50GSBJ2B4SCS5T1K
L'affaire Pack (budget): MAXI=https://www.canbebealgerie.com/categories/01KJ2J9WTX3XQKKTTRF1KV7Q0W/products/01KJ2K76Q1ZFTNSTZE21X1NEBN JUNIOR=https://www.canbebealgerie.com/categories/01KJ2J9WTX3XQKKTTRF1KV7Q0W/products/01KJ2K88FARG2DAQGJ3Z7WV8RT
Tom Jerry (gift): MAXI=https://www.canbebealgerie.com/categories/01KJ2JH2XKCBA2KST4DRSJFGRG/products/01KJ83T1926942FK2EDXQ44A67 JUNIOR=https://www.canbebealgerie.com/categories/01KJ2JH2XKCBA2KST4DRSJFGRG/products/01KJ83V8GRRGHC19WB1TB80BVR

VACCINATION SCHEDULE ALGERIA 2023 (mandatory free):
Birth: BCG+HBV | 2m: DTCaVPI-Hib-HBV+VPC+VPO | 4m: same | 11m: ROR | 12m: DTCaVPI-Hib-HBV+VPC+VPO | 18m: ROR | 6yrs: DTCaVPI | 11-13yrs: dT | every 10yrs: dT

NUTRITION:
0-6m: breast milk only | 6m: start solids gradually | Honey: FORBIDDEN before 1yr | Water only, no juice for babies
`;

// ── HELPERS ───────────────────────────────────────────────────────────
const MEDICAL_KEYWORDS = ['fever','fievre','convulsion','sang','blood','rash','vomit','breathe','seizure','bleeding','unconscious','hurts badly','hard to breathe'];
const isMedicalRisk = (t) => MEDICAL_KEYWORDS.some(k => t.toLowerCase().includes(k));

function detectLang(text) {
  if (/[\u0600-\u06FF]/.test(text)) return 'ar';
  const t = text.trim().toLowerCase();

  // Short single-word or simple English messages — detect directly
  const clearEnglishWords = /^(hey|hi|hello|ok|okay|yes|no|crying|sleeping|feeding|eating|walking|talking|teething|help|thanks|please|update|baby|kid|son|daughter|boy|girl|cry|sleep|feed|eat|walk|talk|teeth|good|bad|tired|sick|fine|sure|about|my|his|her|their|it|what|how|why|when|where|who|crying|laughing|playing|growing|update|change|tell)$/i;
  if (clearEnglishWords.test(t)) return 'en';

  // Score-based detection for longer messages
  const fr = (text.match(/\b(je|tu|il|elle|bonjour|bonsoir|merci|bebe|mon|ma|mes|oui|non|est|les|des|une|que|qui|comment|pourquoi|pleure|dort|lait|grossesse|nuit|tete|poids|avec|pour|dans|sur|mais|donc|car|aussi|tres|bien|mal|fait|peut|doit|veut|sait)\b/gi) || []).length;
  const en = (text.match(/\b(the|is|are|my|baby|what|how|can|do|i|he|she|it|and|or|but|for|not|this|that|with|you|your|sleep|feed|cry|help|month|year|old|milk|breast|does|when|where|why|about|want|need|have|get|give|make|take|talk|walk|eat|drink|play|grow|hurt|sick|tired|happy|sad|angry|scared|update|change|tell|know|think|feel|see|hear|try|keep|stop|start)\b/gi) || []).length;

  // If English score is higher or equal, default to English
  // Only return French if clearly more French words
  if (fr > en + 1) return 'fr';
  return 'en';
}

async function updateMemory(userId, message, existing) {
  const lower = message.toLowerCase();
  const mem = existing || new NourMemory({ userId });

  const nameMatch = message.match(/(?:s'appelle|called|named|mon (?:fils|bebe|garcon|fille) s'appelle |my (?:baby|son|daughter) (?:is |named ))([A-Z][a-zA-Z]{2,})/);
  if (nameMatch) mem.babyName = nameMatch[1];

  const momMatch = message.match(/(?:je m'appelle|my name is)\s+([A-Z][a-zA-Z]{2,})/i);
  if (momMatch) mem.motherName = momMatch[1];

  const ageMatch = lower.match(/\b(\d+)\s*(month|mois|semaine|week|year|an|ans|jour|day)s?\b/);
  if (ageMatch) mem.babyAge = ageMatch[0];

  if (/\b(son|boy|garcon|fils)\b/i.test(lower)) mem.babyGender = 'boy';
  if (/\b(daughter|girl|fille)\b/i.test(lower)) mem.babyGender = 'girl';
  if (/\b(pere|papa|dad)\b/i.test(lower)) mem.role = 'father';
  if (/\b(grand-mere|grandma)\b/i.test(lower)) mem.role = 'grandmother';

  mem.language = detectLang(message);

  const tags = [
    [/(sleep|sommeil|dort)/, 'sleep issues'],
    [/(feed|mang|lait|milk)/, 'feeding'],
    [/(cry|pleur|cries)/, 'crying'],
    [/(vaccin|vaccine)/, 'vaccination'],
    [/(teeth|dent|teeth)/, 'teething'],
    [/(diaper|couche)/, 'diapers'],
    [/(weight|poids)/, 'weight'],
    [/(pregnan|enceinte|grossesse)/, 'pregnancy'],
  ];
  for (const [p, tag] of tags) {
    if (p.test(lower) && !mem.concerns.includes(tag)) mem.concerns.push(tag);
  }
  mem.concerns = mem.concerns.slice(-15);
  mem.lastSeen = new Date();
  await mem.save();
  return mem;
}

// ── UPDATE BABY IN PLATFORM DB ───────────────────────────────────────
async function updateBabyFromChat(userId, message, baby) {
  if (!baby) return null;
  const lower = message.toLowerCase();
  let updated = false;

  // Age → calculate birthDate from months mentioned
  // Only trigger if user is clearly stating the baby's age
  const agePatterns = [
    /(?:is|are|has|turned?|now|currently|he(?:'s)?|she(?:'s)?|baby(?:'s)?|mon bebe a|il a|elle a|عمره|عمرها)\s*(\d+)\s*(?:month|mois|months)s?/i,
    /(\d+)\s*(?:month|mois)s?\s*(?:old|age|âge)/i,
    /(?:my (?:son|daughter|baby|kid) is|mon (?:fils|bebe|enfant) a)\s*(\d+)\s*(?:month|mois)/i,
  ];
  for (const pat of agePatterns) {
    const m = lower.match(pat);
    if (m) {
      const months = parseInt(m[1]);
      if (months >= 0 && months <= 60) {
        // Set birthDate to exactly N months before today
        const birthDate = new Date();
        birthDate.setMonth(birthDate.getMonth() - months);
        birthDate.setDate(1); // normalize to 1st of month to avoid edge cases
        baby.birthDate = birthDate;
        updated = true;
        console.log(`🍼 Nour updated baby birthDate → ${months} months old (birthDate: ${birthDate.toISOString().split('T')[0]})`);
      }
      break;
    }
  }

  // Weight
  const weightMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilo|kilogramme?s?)/);
  if (weightMatch) {
    const w = parseFloat(weightMatch[1]);
    if (w >= 0.5 && w <= 30) {
      baby.weight = w;
      updated = true;
      console.log(`🍼 Nour updated baby weight → ${w}kg`);
    }
  }

  // Height
  const heightMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:cm|centimetre?s?)/);
  if (heightMatch) {
    const h = parseFloat(heightMatch[1]);
    if (h >= 20 && h <= 120) {
      baby.height = h;
      updated = true;
      console.log(`🍼 Nour updated baby height → ${h}cm`);
    }
  }

  // Gender
  if (/(son|boy|garcon|fils|ولد|صبي)/i.test(lower) && baby.gender !== 'male') {
    baby.gender = 'male';
    updated = true;
    console.log('🍼 Nour updated baby gender → male');
  }
  if (/(daughter|girl|fille|بنت|فتاة)/i.test(lower) && baby.gender !== 'female') {
    baby.gender = 'female';
    updated = true;
    console.log('🍼 Nour updated baby gender → female');
  }

  // Baby name
  const nameMatch = message.match(
    /(?:s'appelle|called|named|اسمه|اسمها|mon (?:fils|bebe|garcon|fille) s'appelle |my (?:baby|son|daughter) (?:is |named ))([A-Z][a-zA-Z]{2,}|[؀-ۿ]{2,})/u
  );
  if (nameMatch) {
    baby.name = nameMatch[1];
    updated = true;
    console.log(`🍼 Nour updated baby name → ${nameMatch[1]}`);
  }

  // Feeding type
  if (/(breastfeed|allaitement|رضاعة طبيعية)/i.test(lower)) {
    baby.feedingType = 'breastfeeding';
    updated = true;
  }
  if (/(formula|lait artificiel|حليب صناعي|biberon)/i.test(lower)) {
    baby.feedingType = 'formula';
    updated = true;
  }
  if (/(mixed|mixte|مختلط)/i.test(lower)) {
    baby.feedingType = 'mixed';
    updated = true;
  }

  // Diaper size (if user says "he wears size 4" etc)
  const diaperMatch = lower.match(/(?:size|taille|pointure|numero|numéro)\s*(\d)/i);
  if (diaperMatch) {
    const size = parseInt(diaperMatch[1]);
    if (size >= 1 && size <= 6) {
      baby.currentDiaperSize = size;
      updated = true;
      console.log(`🍼 Nour updated diaper size → ${size}`);
    }
  }

  if (updated) {
    await baby.save();
    console.log(`✅ Baby profile updated in DB for user ${userId}`);
  }

  return updated ? baby : null;
}

function parseProducts(text) {
  const products = [], re = /\[PRODUIT:\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(https?:\/\/\S+?)\s*\]/g;
  let m;
  while ((m = re.exec(text)) !== null) products.push({ name: m[1], category: m[2], url: m[3] });
  return products;
}

function cleanReply(text) { return text.replace(/\[PRODUIT:.*?\]/gs, '').trim(); }

async function callGroq(messages) {
  for (const model of [GROQ_MODEL, 'llama-3.1-8b-instant']) {
    try {
      const r = await groq.chat.completions.create({ model, messages, max_tokens: 250, temperature: 0.4 });
      const t = r.choices[0]?.message?.content || '';
      if (t.trim()) return t;
    } catch (e) {
      console.error('Groq error:', e.message);
      if (e.status === 429) await new Promise(r => setTimeout(r, 2000));
    }
  }
  return null;
}

// ── POST /api/chat ────────────────────────────────────────────────────
exports.sendMessage = async (req, res, next) => {
  try {
    const { message, conversationId, babyId } = req.body;
    const userId = req.user._id;
    if (!message?.trim()) return res.status(400).json({ success: false, error: 'message required.' });

    // Get or create conversation
    let conv = conversationId ? await Conversation.findOne({ _id: conversationId, userId }) : null;
    if (!conv) conv = await Conversation.create({ userId, babyId: babyId || null, title: message.slice(0, 80) });

    // Save user message
    await Message.create({ conversationId: conv._id, sender: 'user', content: message });

    // Update Nour memory
    let mem = await NourMemory.findOne({ userId });
    mem = await updateMemory(userId, message, mem);

    // Load baby from DB
    let baby = babyId ? await Baby.findById(babyId) : null;
    if (!baby) {
      const User = require('../models/User');
      const u = await User.findById(userId).populate('babies');
      if (u?.babies?.length) baby = u.babies[0];
    }

    // ── Auto-update baby profile from what user said ──────────────────
    const updatedBaby = await updateBabyFromChat(userId, message, baby);
    if (updatedBaby) baby = updatedBaby; // use fresh data

    // Load history
    const history = await Message.find({ conversationId: conv._id, deleted: false })
      .sort({ createdAt: -1 }).limit(6).then(ms => ms.reverse());

    // ── FETCH ALL BACKEND DATA ──────────────────────────────────────────
    // Load logs and vaccinations
    let sleepLogs = [], feedingLogs = [], diaperLogs = [], vaccRecord = null;
    if (baby) {
      const bid = baby._id;
      [sleepLogs, feedingLogs, diaperLogs, vaccRecord] = await Promise.all([
        require('../models/SleepLog').find({ babyId: bid }).sort({ startTime: -1 }).limit(3).lean(),
        require('../models/FeedingLog').find({ babyId: bid }).sort({ time: -1 }).limit(3).lean(),
        require('../models/DiaperLog').find({ babyId: bid }).sort({ time: -1 }).limit(3).lean(),
        require('../models/Vaccine').findOne({ babyId: bid }).lean(),
      ]);
    }

    // Build context — always use REAL DB values, never invent
    let ctx = '';
    if (baby) {
      ctx += '== BABY PROFILE (REAL DATA FROM DATABASE — ONLY REPORT WHAT IS HERE) ==\n';
      ctx += `Name: ${baby.name}\n`;
      ctx += `Age: ${baby.ageInMonths} months\n`;
      ctx += `Gender: ${baby.gender}\n`;
      ctx += `Weight: ${baby.weight != null ? baby.weight + 'kg' : 'NOT RECORDED'}\n`;
      ctx += `Height: ${baby.height != null ? baby.height + 'cm' : 'NOT RECORDED'}\n`;
      ctx += `Diaper size: ${baby.currentDiaperSize != null ? baby.currentDiaperSize : 'NOT RECORDED'}\n`;
      ctx += `Feeding type: ${baby.feedingType || 'NOT RECORDED'}\n`;
      ctx += 'IMPORTANT: If a field says NOT RECORDED, tell user you do not have it. NEVER invent numbers.\n\n';
    } else {
      ctx += '== NO BABY PROFILE FOUND IN DATABASE ==\nAsk the user to set up their baby profile in the app.\n\n';
    }

    // Recent sleep logs
    if (sleepLogs.length) {
      ctx += '== RECENT SLEEP LOGS ==\n';
      sleepLogs.forEach(s => {
        const start = new Date(s.startTime).toLocaleString();
        const dur = s.endTime ? Math.round((new Date(s.endTime) - new Date(s.startTime)) / 60000) + ' min' : 'ongoing';
        ctx += `- ${start}: ${dur} (${s.quality || 'average'})${s.notes ? ' — ' + s.notes : ''}\n`;
      });
      ctx += '\n';
    }

    // Recent feeding logs
    if (feedingLogs.length) {
      ctx += '== RECENT FEEDING LOGS ==\n';
      feedingLogs.forEach(f => {
        const t = new Date(f.time).toLocaleString();
        ctx += `- ${t}: ${f.type}${f.quantity ? ' ' + f.quantity + 'ml' : ''}${f.durationMinutes ? ' ' + f.durationMinutes + 'min' : ''}${f.notes ? ' — ' + f.notes : ''}\n`;
      });
      ctx += '\n';
    }

    // Recent diaper logs
    if (diaperLogs.length) {
      ctx += '== RECENT DIAPER LOGS ==\n';
      diaperLogs.forEach(d => {
        const t = new Date(d.time).toLocaleString();
        ctx += `- ${t}: ${d.type}${d.color ? ' (' + d.color + ')' : ''}${d.notes ? ' — ' + d.notes : ''}\n`;
      });
      ctx += '\n';
    }

    // Vaccination status
    if (vaccRecord?.vaccines?.length) {
      const done = vaccRecord.vaccines.filter(v => v.done);
      const pending = vaccRecord.vaccines.filter(v => !v.done);
      ctx += '== VACCINATION STATUS ==\n';
      ctx += `Completed (${done.length}): ${done.map(v => v.name).join(', ') || 'none'}\n`;
      ctx += `Pending (${pending.length}): ${pending.map(v => v.name + ' (due at ' + v.dueAgeMonths + 'm)').join(', ') || 'none'}\n\n`;
    }

    // Nour memory
    const memParts = [];
    if (mem.motherName) memParts.push(`Mother name: ${mem.motherName}`);
    if (mem.concerns.length) memParts.push(`Topics discussed: ${mem.concerns.join(', ')}`);
    if (memParts.length) ctx += `== NOUR MEMORY ==\n${memParts.join(' | ')}\n\n`;

    console.log('📊 Context built — baby:', baby?.name, '| weight:', baby?.weight, '| logs:', sleepLogs.length, feedingLogs.length, diaperLogs.length);

    // Language enforcement
    const lang = detectLang(message);
    const hasAr = /[\u0600-\u06FF]/.test(message);
    const langRule = hasAr
      ? 'MANDATORY: Reply in Modern Standard Arabic (fusha) ONLY. No French, no English, no Darija.'
      : lang === 'en'
        ? 'MANDATORY: Reply in English ONLY. No French, no Arabic.'
        : 'MANDATORY: Reply in French ONLY. Use "tu" not "vous". No English, no Arabic.';

    const nameRule = `NAME RULE: Account name "${req.user.firstName}" is NOT the baby name. Say "your baby" unless baby name is in memory.`;

    // API messages
    const apiMessages = [
      { role: 'system', content: NOUR_PROMPT + '\n\n' + ctx + langRule + '\n' + nameRule },
      ...history.slice(0, -1).map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.content })),
      { role: 'user', content: message },
    ];

    // RAG
    const ragHit = rag.search(message, { topK: 1, minScore: 0.5 });
    if (ragHit.length) {
      apiMessages.splice(apiMessages.length - 1, 0, {
        role: 'system',
        content: `[Source: ${ragHit[0].source}]\n${ragHit[0].text.split(' ').slice(0, 80).join(' ')}`,
      });
    }

    // Call Groq
    let raw = await callGroq(apiMessages);
    if (!raw) raw = { ar: 'عذراً، هناك مشكلة في الاتصال. حاولي مرة أخرى 🌸', en: "Sorry, connection issue. Please try again 🌸", fr: "Désolé, problème de connexion. Réessaie 🌸" }[lang] || "Désolé 🌸";

    // Medical warning
    if (isMedicalRisk(message) && !raw.includes('⚠️')) {
      raw += { ar: '\n\n⚠️ هذا يستحق استشارة طبية. تواصلي مع طبيب الأطفال.', en: '\n\n⚠️ Please consult your pediatrician about this.', fr: '\n\n⚠️ Ce sujet mérite un avis médical. Consultez votre pédiatre.' }[lang] || '';
    }

    const replyText = cleanReply(raw);
    const products  = parseProducts(raw);

    // Save AI reply
    await Message.create({ conversationId: conv._id, sender: 'ai', content: replyText, flaggedMedical: isMedicalRisk(message) });

    // Update conversation
    conv.messageCount  = (conv.messageCount || 0) + 2;
    conv.lastMessageAt = new Date();
    await conv.save();

    // Build update summary
    const babyUpdates = {};
    if (baby) {
      if (baby.ageInMonths !== undefined) babyUpdates.ageInMonths = baby.ageInMonths;
      if (baby.gender)          babyUpdates.gender   = baby.gender;
      if (baby.weight)          babyUpdates.weight   = baby.weight;
      if (baby.height)          babyUpdates.height   = baby.height;
      if (baby.feedingType)     babyUpdates.feeding  = baby.feedingType;
      if (baby.currentDiaperSize) babyUpdates.diaperSize = baby.currentDiaperSize;
    }

    res.json({
      success: true,
      reply: replyText,
      products,
      conversationId: conv._id,
      babyUpdated: !!updatedBaby,
      babyProfile: babyUpdates,
      memory: { babyName: mem.babyName, babyAge: mem.babyAge, babyGender: mem.babyGender, concerns: mem.concerns },
    });

  } catch (err) { next(err); }
};

exports.getConversations = async (req, res, next) => {
  try {
    const convos = await Conversation.find({ userId: req.user._id }).sort({ lastMessageAt: -1 }).limit(20);
    res.json({ success: true, conversations: convos });
  } catch (err) { next(err); }
};

exports.getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({ conversationId: req.params.conversationId, deleted: false }).sort({ createdAt: 1 });
    res.json({ success: true, messages });
  } catch (err) { next(err); }
};

exports.getMemory = async (req, res, next) => {
  try {
    const memory = await NourMemory.findOne({ userId: req.user._id });
    res.json({ success: true, memory: memory || {} });
  } catch (err) { next(err); }
};

exports.clearMemory = async (req, res, next) => {
  try {
    await NourMemory.deleteOne({ userId: req.user._id });
    res.json({ success: true, message: 'Memory cleared.' });
  } catch (err) { next(err); }
};

exports.transcribeAudio = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No audio file' });
    const FormData = require('form-data');
    const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
    const form = new FormData();
    form.append('file', req.file.buffer, { filename: 'audio.webm', contentType: req.file.mimetype || 'audio/webm' });
    form.append('model', 'whisper-large-v3-turbo');
    form.append('response_format', 'json');
    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST', headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, ...form.getHeaders() }, body: form,
    });
    const data = await response.json();
    if (data.text) return res.json({ text: data.text });
    return res.status(500).json({ error: 'Transcription failed' });
  } catch (err) { next(err); }
};

exports.speak = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'No text' });
    const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
    const isAr = /[\u0600-\u06FF]/.test(text);
    const clean = text.replace(/[\u{1F300}-\u{1FFFF}]/gu, '').replace(/[🌸💕🤗😊🍼🤱❤️🥺⚠️]/g, '').trim();
    if (!clean) return res.status(400).json({ error: 'Empty text' });
    const response = await fetch('https://api.groq.com/openai/v1/audio/speech', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: isAr ? 'canopylabs/orpheus-arabic-saudi' : 'playai-tts', input: clean.slice(0, 400), voice: isAr ? 'noura' : 'Celeste-PlayAI', response_format: 'wav' }),
    });
    if (!response.ok) return res.status(500).json({ error: 'TTS failed' });
    const buf = await response.arrayBuffer();
    res.set({ 'Content-Type': 'audio/wav' });
    res.send(Buffer.from(buf));
  } catch (err) { next(err); }
};