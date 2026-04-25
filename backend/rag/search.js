/**
 * Nour RAG Search Module
 * Searches the knowledge base for relevant chunks based on a query.
 * Uses keyword overlap scoring (no GPU, no embeddings API needed).
 */

const fs = require("fs");
const path = require("path");

const KB_PATH = path.join(__dirname, "knowledge_base.json");

// ── LOAD KNOWLEDGE BASE ──────────────────────────────────────────────
let knowledgeBase = null;

function loadKB() {
  if (knowledgeBase) return knowledgeBase;
  if (!fs.existsSync(KB_PATH)) {
    console.warn("⚠️  RAG: knowledge_base.json not found. RAG disabled.");
    return null;
  }
  try {
    const raw = fs.readFileSync(KB_PATH, "utf-8");
    knowledgeBase = JSON.parse(raw);
    console.log(`✅ RAG loaded: ${knowledgeBase.chunks.length} chunks from ${knowledgeBase.files.length} files`);
    return knowledgeBase;
  } catch (e) {
    console.error("❌ RAG: Failed to load knowledge base:", e.message);
    return null;
  }
}

// ── ARABIC & FRENCH STOPWORDS ────────────────────────────────────────
const STOPWORDS = new Set([
  // French
  'le','la','les','de','du','des','un','une','et','en','au','aux',
  'ce','que','qui','est','par','sur','pour','dans','avec','ou','si',
  'il','elle','ils','elles','nous','vous','je','tu','se','sa','son',
  'ses','leur','leurs','pas','ne','plus','mais','car','donc','très',
  'bien','aussi','tout','tous','cette','cet','dont','quand','comme',
  // English
  'the','a','an','and','or','but','in','on','at','to','for','of',
  'with','by','from','is','are','was','were','be','been','have','has',
  'had','do','does','did','will','would','could','should','may','might',
  'this','that','these','those','it','its','my','your','his','her',
  'our','their','what','when','where','how','why','who','which','can',
  // Arabic
  'في','من','إلى','على','عن','مع','هذا','هذه','التي','الذي','الذين',
  'كان','يكون','أن','إن','لا','ما','كل','بعد','قبل','عند','حتى',
  'هل','كيف','لماذا','ماذا','متى','أين','ثم','أو','لكن','لأن','إذا',
  'يجب','يمكن','كانت','كما','فقط','أيضا','جدا','بشكل',
]);

// ── TOKENIZE ─────────────────────────────────────────────────────────
function tokenize(text) {
  if (!text) return [];
  // Match Arabic words and Latin words
  const words = text.toLowerCase().match(/[\u0600-\u06FF\w]+/g) || [];
  return words.filter(w => w.length > 2 && !STOPWORDS.has(w));
}

// ── SCORE CHUNK ──────────────────────────────────────────────────────
function scoreChunk(queryTokens, chunk) {
  const chunkKeywords = new Set(chunk.keywords || []);
  const chunkTokens   = new Set(tokenize(chunk.text));
  
  let score = 0;
  
  for (const token of queryTokens) {
    // Exact keyword match (higher weight)
    if (chunkKeywords.has(token)) score += 3;
    // Text contains token
    else if (chunkTokens.has(token)) score += 1;
    // Partial match (substring)
    else if ([...chunkKeywords].some(k => k.includes(token) || token.includes(k))) score += 0.5;
  }
  
  // Normalize by query length to avoid bias toward longer queries
  return queryTokens.length > 0 ? score / queryTokens.length : 0;
}

// ── MAIN SEARCH ──────────────────────────────────────────────────────
/**
 * Search the knowledge base for chunks relevant to the query.
 * @param {string} query - User's message
 * @param {object} options
 * @param {number} options.topK - Number of chunks to return (default: 3)
 * @param {number} options.minScore - Minimum score threshold (default: 0.15)
 * @returns {Array} - Array of relevant chunks with scores
 */
function search(query, { topK = 3, minScore = 0.15 } = {}) {
  const kb = loadKB();
  if (!kb || !kb.chunks.length) return [];
  
  const queryTokens = tokenize(query);
  if (!queryTokens.length) return [];
  
  // Score all chunks
  const scored = kb.chunks.map(chunk => ({
    ...chunk,
    score: scoreChunk(queryTokens, chunk),
  }));
  
  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);
  
  // Filter by minimum score and return top K
  const results = scored
    .filter(c => c.score >= minScore)
    .slice(0, topK);
  
  return results;
}

/**
 * Format search results into a context string for the prompt.
 * @param {Array} results - Results from search()
 * @returns {string} - Formatted context string
 */
function formatContext(results) {
  if (!results.length) return "";
  
  const sections = results.map((r, i) => 
    `[Document ${i + 1} — Source: ${r.source}]\n${r.text}`
  );
  
  return [
    "== RELEVANT DOCUMENTS FROM KNOWLEDGE BASE ==",
    "Use the following information to answer the user's question accurately.",
    "If the answer is found here, prioritize this over general knowledge.",
    "",
    ...sections,
    "== END OF DOCUMENTS ==",
  ].join("\n");
}

/**
 * Get RAG context for a user query (search + format).
 * Returns empty string if no relevant documents found.
 */
function getContext(query) {
  const results = search(query);
  if (!results.length) return "";
  return formatContext(results);
}

/**
 * Get info about the loaded knowledge base.
 */
function getKBInfo() {
  const kb = loadKB();
  if (!kb) return { loaded: false, chunks: 0, files: [] };
  return {
    loaded: true,
    chunks: kb.chunks.length,
    files: kb.files.map(f => ({ name: f.filename, chunks: f.chunk_count })),
  };
}

module.exports = { search, formatContext, getContext, getKBInfo, loadKB };
