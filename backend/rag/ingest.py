#!/usr/bin/env python3
"""
Nour RAG Ingestion Script
Usage: python3 rag/ingest.py path/to/file.pdf [path/to/file2.pdf ...]
Chunks PDFs and saves to rag/knowledge_base.json
"""

import json
import os
import sys
import re
import hashlib
from pathlib import Path

try:
    import fitz  # pymupdf
except ImportError:
    print("Installing pymupdf...")
    os.system("pip install pymupdf --break-system-packages -q")
    import fitz

# ── CONFIG ────────────────────────────────────────────────────────────
CHUNK_SIZE   = 400   # words per chunk
CHUNK_OVERLAP = 80   # words overlap between chunks
OUTPUT_FILE  = Path(__file__).parent / "knowledge_base.json"

# ── HELPERS ──────────────────────────────────────────────────────────

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract all text from a PDF file."""
    doc = fitz.open(pdf_path)
    full_text = []
    for page_num, page in enumerate(doc):
        text = page.get_text("text")
        if text.strip():
            full_text.append(f"[Page {page_num + 1}]\n{text}")
    doc.close()
    return "\n\n".join(full_text)

def clean_text(text: str) -> str:
    """Clean extracted text."""
    # Remove excessive whitespace
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r' {2,}', ' ', text)
    # Remove page headers/footers patterns
    text = re.sub(r'\[Page \d+\]', '', text)
    return text.strip()

def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list:
    """Split text into overlapping chunks by word count."""
    words = text.split()
    chunks = []
    start = 0
    
    while start < len(words):
        end = min(start + chunk_size, len(words))
        chunk = ' '.join(words[start:end])
        if len(chunk.strip()) > 50:  # skip tiny chunks
            chunks.append(chunk)
        start += chunk_size - overlap
    
    return chunks

def simple_embed(text: str) -> list:
    """
    Simple TF-IDF-like keyword extraction for matching.
    Returns list of significant words (used for keyword search).
    """
    # Arabic and French/English stopwords
    stopwords = set([
        # French
        'le', 'la', 'les', 'de', 'du', 'des', 'un', 'une', 'et', 'en', 'au', 'aux',
        'ce', 'que', 'qui', 'est', 'par', 'sur', 'pour', 'dans', 'avec', 'ou', 'si',
        'il', 'elle', 'ils', 'elles', 'nous', 'vous', 'je', 'tu', 'se', 'sa', 'son',
        'ses', 'leur', 'leurs', 'à', 'pas', 'ne', 'plus', 'mais', 'car', 'donc',
        # English
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
        'should', 'may', 'might', 'this', 'that', 'these', 'those', 'it', 'its',
        # Arabic common
        'في', 'من', 'إلى', 'على', 'عن', 'مع', 'هذا', 'هذه', 'التي', 'الذي',
        'كان', 'يكون', 'أن', 'إن', 'لا', 'ما', 'كل', 'بعد', 'قبل', 'عند',
    ])
    
    words = re.findall(r'[\w\u0600-\u06FF]+', text.lower())
    keywords = [w for w in words if len(w) > 3 and w not in stopwords]
    # Return unique keywords (preserve order)
    seen = set()
    unique_keywords = []
    for k in keywords:
        if k not in seen:
            seen.add(k)
            unique_keywords.append(k)
    return unique_keywords[:100]  # top 100 keywords per chunk

def ingest_pdf(pdf_path: str, existing_data: dict) -> dict:
    """Process a single PDF and add chunks to knowledge base."""
    pdf_path = Path(pdf_path)
    if not pdf_path.exists():
        print(f"  ❌ File not found: {pdf_path}")
        return existing_data
    
    file_hash = hashlib.md5(pdf_path.read_bytes()).hexdigest()
    filename = pdf_path.name
    
    # Check if already ingested
    for chunk in existing_data.get('chunks', []):
        if chunk.get('file_hash') == file_hash:
            print(f"  ⏭️  Already ingested: {filename} (skipping)")
            return existing_data
    
    print(f"  📄 Processing: {filename}")
    
    # Extract text
    raw_text = extract_text_from_pdf(str(pdf_path))
    clean = clean_text(raw_text)
    
    # Chunk
    chunks = chunk_text(clean)
    print(f"     → {len(chunks)} chunks created")
    
    # Build chunk records
    new_chunks = []
    for i, chunk_text_content in enumerate(chunks):
        keywords = simple_embed(chunk_text_content)
        new_chunks.append({
            "id": f"{file_hash}_{i}",
            "source": filename,
            "file_hash": file_hash,
            "chunk_index": i,
            "text": chunk_text_content,
            "keywords": keywords,
        })
    
    # Add to existing data
    existing_data.setdefault('chunks', [])
    existing_data.setdefault('files', [])
    existing_data['chunks'].extend(new_chunks)
    existing_data['files'].append({
        "filename": filename,
        "file_hash": file_hash,
        "chunk_count": len(new_chunks),
        "path": str(pdf_path.resolve()),
    })
    
    print(f"  ✅ Done: {filename}")
    return existing_data

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 rag/ingest.py file1.pdf [file2.pdf ...]")
        print("\nExample:")
        print("  python3 rag/ingest.py docs/carnet_sante.pdf docs/nutrition.pdf")
        sys.exit(1)
    
    # Load existing knowledge base
    if OUTPUT_FILE.exists():
        with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
        print(f"📚 Loaded existing knowledge base: {len(data.get('chunks', []))} chunks")
    else:
        data = {"chunks": [], "files": []}
        print("📚 Creating new knowledge base...")
    
    # Process each PDF
    pdf_files = sys.argv[1:]
    print(f"\n🔄 Processing {len(pdf_files)} file(s)...\n")
    
    for pdf_file in pdf_files:
        data = ingest_pdf(pdf_file, data)
    
    # Save
    OUTPUT_FILE.parent.mkdir(exist_ok=True)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Knowledge base saved: {OUTPUT_FILE}")
    print(f"   Total chunks: {len(data['chunks'])}")
    print(f"   Total files:  {len(data['files'])}")
    print("\nFiles in knowledge base:")
    for file_info in data['files']:
        print(f"  - {file_info['filename']} ({file_info['chunk_count']} chunks)")

if __name__ == "__main__":
    main()
