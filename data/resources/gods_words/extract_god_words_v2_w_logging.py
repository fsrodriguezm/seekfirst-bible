import json
import re
import requests
import time
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('god_words_extraction.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# ---------------------------------------------
# Ollama settings
# ---------------------------------------------
USE_OLLAMA = True  # set False if you want regex only
OLLAMA_URL = "http://localhost:11434/api/chat"
OLLAMA_MODEL = "llama3.1:8b"

# ---------------------------------------------
# Regex patterns
# ---------------------------------------------
OPENERS = [
    # Specific big ones
    r'\bGod (?:spake|spoke) all these words[,;:]\s*saying\b',              # Ex 20:1
    r'\bThese words the LORD spake unto\b',                                 # Deut 5:22

    # Generic God/YHWH speaking (with or without "saying")
    r'\bGod (?:spake|spoke|said)\b',
    r'\b(?:And|Then)?\s*the LORD (?:spake|said)\b',

    # "the LORD ... unto <person> [:,;] (with OR without 'saying')"
    r'\bthe LORD (?:spake|said) unto [^,;:]+[,;:]\s*saying\b',
    r'\bthe LORD (?:spake|said) unto [^,;:]+[,;:](?!\s*saying\b)',          # Ex 6:1 etc.

    # Haggai / prophets: "came the word of the LORD by/unto ... , saying"
    r'\bThen came the word of the LORD (?:by|unto) [^,;:]+[,;:]\s*saying\b',# Hag 1:1,1:3; 2:1,2:10,2:20
    r'\bThe word of the LORD (?:came|came again) (?:by|unto) [^,;:]+[,;:]\s*saying\b',

    # Haggai: “Thus speaketh …, saying”
    r'\bThus speaketh the LORD(?: of hosts)?[,;:]\s*saying\b',              # Hag 1:2

    # “Thus saith …” (classic prophetic opener)
    r'\bThus saith the LORD(?: of hosts)?\b',

    # Haggai: messenger formula — mediated but still YHWH speech
    r'\bThen spake Haggai the LORD\'s messenger in the LORD\'s message [^,;:]*[,;:]\s*saying\b',  # Hag 1:13

    # “The word of the LORD came …, saying” (generic)
    r'\bThe word of the LORD came (?:unto|to|by) [^,;:]+[,;:]\s*saying\b',

    # Command formula
    r'\bthe LORD commanded\b',

    # Hearing formula (often precedes direct quotation)
    r'\bHear (?:ye )?the word of the LORD\b',
]
OPENERS = [re.compile(p, re.IGNORECASE) for p in OPENERS]

TERMINATORS = [
    r'^(?:And|Then|So|Now)\s+(?:Moses|Aaron|Joshua|Samuel|David|Solomon|Jeremiah|Isaiah|Ezekiel|the king|the prophet|the people|all the people|the children of Israel|he|they)\b',
    r'^And it came to pass\b'
]
TERMINATORS = [re.compile(p, re.IGNORECASE) for p in TERMINATORS]

# ---------------------------------------------
# Helpers
# ---------------------------------------------
def load_kjv_json(kjv_path="KJV.json"):
    with open(kjv_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def is_any(text: str, patterns) -> bool:
    t = text.strip()
    return any(p.search(t) for p in patterns)

# ---------------------------------------------
# Ollama integration
# ---------------------------------------------
SYSTEM = (
  "You tag KJV Old Testament passages where YHWH speaks. "
  "Return STRICT JSON only with keys: start_verse, end_verse, via, evidence_phrases, confidence."
)

PROMPT_TMPL = """BOOK: {book}
CHAPTER: {chapter}
CANDIDATE_START_VERSE: {start}
VERSES (ordered):
{verses}

Rules:
- Use explicit KJV cues: 'God spake/said', 'the LORD spake/said ... saying',
  'Thus saith the LORD', 'saith the LORD (of hosts)', 'the LORD called ... saying',
  'The word of the LORD came unto ... saying'.
- If speech continues into following verses, include them until narration resumes
  (e.g., 'And Moses said', 'And the people answered', etc.).
- If mediated through a prophet, via='prophet'; if angelic, via='angel'; else 'direct'.
- Only quote phrases actually present in the supplied verses.
- If uncertain, prefer a shorter block and lower confidence.
Return JSON: {{"start_verse":INT, "end_verse":INT, "via":"direct|prophet|angel|narration", "evidence_phrases":[STR], "confidence":FLOAT}}
"""

def expand_block_with_ollama(book, chapter, verses_dict, candidate_start):
    start_time = time.time()
    logger.info(f"Starting Ollama request for {book} {chapter}:{candidate_start}")
    
    try:
        # Prepare data
        prep_start = time.time()
        keys = sorted(map(int, verses_dict.keys()))
        i = keys.index(int(candidate_start))
        window_keys = keys[max(0, i-2): min(len(keys), i+26)]
        prep_time = time.time() - prep_start
        logger.debug(f"Data preparation took {prep_time:.3f}s for {book} {chapter}:{candidate_start}")

        ordered = "\n".join(f"{k} {verses_dict[str(k)]}" for k in window_keys)

        prompt = PROMPT_TMPL.format(book=book, chapter=chapter, start=candidate_start, verses=ordered)
        payload = {
          "model": OLLAMA_MODEL,
          "messages": [
            {"role":"system","content": SYSTEM},
            {"role":"user","content": prompt}
          ],
          "format": "json",
          "options": {"temperature": 0}
        }
        
        # Make request
        request_start = time.time()
        logger.info(f"Sending request to Ollama for {book} {chapter}:{candidate_start} (prompt length: {len(prompt)} chars)")
        r = requests.post(OLLAMA_URL, json=payload, timeout=120)
        request_time = time.time() - request_start
        logger.info(f"Ollama request completed in {request_time:.3f}s for {book} {chapter}:{candidate_start}")
        
        r.raise_for_status()
        
        # Parse response
        parse_start = time.time()
        data = r.json()
        content = data["message"]["content"]
        result = json.loads(content)
        parse_time = time.time() - parse_start
        
        total_time = time.time() - start_time
        logger.info(f"Total Ollama processing time: {total_time:.3f}s for {book} {chapter}:{candidate_start} (request: {request_time:.3f}s, parse: {parse_time:.3f}s)")
        logger.debug(f"Ollama response for {book} {chapter}:{candidate_start}: {result}")
        
        return result
    except Exception as e:
        total_time = time.time() - start_time
        logger.error(f"Ollama failed at {book} {chapter}:{candidate_start} after {total_time:.3f}s -> {e}")
        print(f"[WARN] Ollama failed at {book} {chapter}:{candidate_start} -> {e}")
        return None

# ---------------------------------------------
# Block extraction
# ---------------------------------------------
def extract_blocks_for_chapter(book: str, chapter_num: str, verses: dict):
    start_time = time.time()
    logger.debug(f"Processing chapter {book} {chapter_num}")
    
    vkeys = sorted(map(int, verses.keys()))
    citations = []
    in_block = False
    start_v = None

    def close_block(last_v):
        nonlocal in_block, start_v
        if in_block and start_v is not None:
            citations.append({
                "book": book,
                "chapter": chapter_num,
                "start_verse": int(start_v),
                "end_verse": int(last_v),
                "text": verses[str(start_v)]
            })
        in_block = False
        start_v = None

    for v in vkeys:
        text = verses[str(v)]
        if not in_block:
            if is_any(text, OPENERS):
                in_block = True
                start_v = v
        else:
            if is_any(text, TERMINATORS):
                close_block(v-1)
                if is_any(text, OPENERS):
                    in_block = True
                    start_v = v
    if in_block:
        close_block(vkeys[-1])

    regex_time = time.time() - start_time
    logger.debug(f"Regex processing for {book} {chapter_num} took {regex_time:.3f}s, found {len(citations)} initial blocks")

    # Optionally refine with Ollama
    if USE_OLLAMA:
        ollama_start = time.time()
        logger.info(f"Starting Ollama refinement for {book} {chapter_num} with {len(citations)} blocks")
        
        refined = []
        for i, c in enumerate(citations):
            logger.info(f"Processing block {i+1}/{len(citations)} in {book} {chapter_num}:{c['start_verse']}")
            res = expand_block_with_ollama(book, chapter_num, verses, c["start_verse"])
            if res and "start_verse" in res and "end_verse" in res:
                c["start_verse"] = res["start_verse"]
                c["end_verse"] = res["end_verse"]
                c["via"] = res.get("via", "direct")
                c["confidence"] = res.get("confidence", 1.0)
                c["evidence"] = res.get("evidence_phrases", [])
            refined.append(c)
        
        ollama_time = time.time() - ollama_start
        total_time = time.time() - start_time
        logger.info(f"Ollama refinement for {book} {chapter_num} completed in {ollama_time:.3f}s (total: {total_time:.3f}s)")
        return refined
    
    total_time = time.time() - start_time
    logger.debug(f"Chapter {book} {chapter_num} completed in {total_time:.3f}s (regex only)")
    return citations

# ---------------------------------------------
# Extract across OT
# ---------------------------------------------
def extract_god_words(kjv_data):
    ot_books = [
        'Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth',
        '1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra',
        'Nehemiah','Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon',
        'Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos',
        'Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi'
    ]

    logger.info(f"Starting extraction from {len(ot_books)} OT books")
    start_time = time.time()
    
    god_words = []
    citation_id = 1
    total_chapters = 0
    total_blocks = 0
    
    for book_idx, book in enumerate(ot_books):
        book_start = time.time()
        if book not in kjv_data:
            logger.warning(f"Book {book} not found in KJV data")
            continue
            
        book_chapters = len(kjv_data[book])
        total_chapters += book_chapters
        book_blocks = 0
        
        logger.info(f"Processing book {book_idx+1}/{len(ot_books)}: {book} ({book_chapters} chapters)")
        
        for chapter_num, verses in kjv_data[book].items():
            if not isinstance(verses, dict):
                continue
            blocks = extract_blocks_for_chapter(book, str(chapter_num), verses)
            book_blocks += len(blocks)
            
            for b in blocks:
                god_words.append({
                    "id": citation_id,
                    "reference": f"{b['book']} {b['chapter']}:{b['start_verse']}-{b['end_verse']}",
                    "book": b["book"],
                    "chapter": b["chapter"],
                    "start_verse": b["start_verse"],
                    "end_verse": b["end_verse"],
                    "text": b["text"].strip(),
                    "via": b.get("via", "direct"),
                    "confidence": b.get("confidence", 1.0),
                    "evidence": b.get("evidence", [])
                })
                citation_id += 1
        
        book_time = time.time() - book_start
        total_blocks += book_blocks
        elapsed_total = time.time() - start_time
        
        logger.info(f"Completed {book}: {book_blocks} blocks in {book_time:.1f}s (total so far: {total_blocks} blocks, {elapsed_total:.1f}s)")
        
        # Estimate remaining time
        if book_idx > 0:
            avg_time_per_book = elapsed_total / (book_idx + 1)
            remaining_books = len(ot_books) - book_idx - 1
            estimated_remaining = avg_time_per_book * remaining_books
            logger.info(f"Estimated time remaining: {estimated_remaining:.1f}s ({estimated_remaining/60:.1f} minutes)")
    
    total_time = time.time() - start_time
    logger.info(f"Extraction completed: {total_blocks} blocks from {total_chapters} chapters in {total_time:.1f}s ({total_time/60:.1f} minutes)")
    
    if USE_OLLAMA:
        avg_per_block = total_time / total_blocks if total_blocks > 0 else 0
        logger.info(f"Average time per block with Ollama: {avg_per_block:.3f}s")
    
    return god_words

# ---------------------------------------------
# Save results
# ---------------------------------------------
def save_to_json(data, output_file):
    start_time = time.time()
    logger.info(f"Saving {len(data)} citations to {output_file}")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({
            "total_citations": len(data),
            "description": "Blocks of God's speech in the Old Testament",
            "note": "Identified by regex and optionally refined with Ollama",
            "citations": data
        }, f, indent=2, ensure_ascii=False)
    
    save_time = time.time() - start_time
    logger.info(f"Saved {len(data)} citations to {output_file} in {save_time:.3f}s")
    print(f"Saved {len(data)} citations to {output_file}")

# ---------------------------------------------
# Main
# ---------------------------------------------
def main():
    kjv_json_file = "../../bibles/KJV.json"
    output_file = "god_words.json"

    logger.info("=" * 60)
    logger.info("STARTING GOD WORDS EXTRACTION")
    logger.info(f"Ollama enabled: {USE_OLLAMA}")
    logger.info(f"Ollama model: {OLLAMA_MODEL}")
    logger.info(f"Ollama URL: {OLLAMA_URL}")
    logger.info("=" * 60)

    print(f"Loading KJV JSON...")
    load_start = time.time()
    kjv_data = load_kjv_json(kjv_json_file)
    load_time = time.time() - load_start
    logger.info(f"Loaded {len(kjv_data)} books in {load_time:.3f}s")
    print(f"Loaded {len(kjv_data)} books")

    print("Extracting...")
    extraction_start = time.time()
    god_words = extract_god_words(kjv_data)
    extraction_time = time.time() - extraction_start

    logger.info(f"Extraction phase completed in {extraction_time:.1f}s ({extraction_time/60:.1f} minutes)")
    print(f"Found {len(god_words)} blocks of divine speech")
    
    save_to_json(god_words, output_file)

    logger.info("Sample results:")
    for c in god_words[:5]:
        logger.info(f"  {c['reference']} via={c['via']} conf={c['confidence']}")
        logger.info(f"    evidence: {c.get('evidence')}")
        print(f"{c['reference']} via={c['via']} conf={c['confidence']}")
        print(" evidence:", c.get("evidence"))
    
    logger.info("=" * 60)
    logger.info("EXTRACTION COMPLETED SUCCESSFULLY")
    logger.info("=" * 60)

if __name__ == "__main__":
    main()
