import json
import re
import requests
from pathlib import Path

# ---------------------------------------------
# Ollama settings
# ---------------------------------------------
USE_OLLAMA = False  # set False if you want regex only
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
    try:
        keys = sorted(map(int, verses_dict.keys()))
        i = keys.index(int(candidate_start))
        window_keys = keys[max(0, i-2): min(len(keys), i+26)]
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
        r = requests.post(OLLAMA_URL, json=payload, timeout=120)
        r.raise_for_status()
        data = r.json()
        content = data["message"]["content"]
        return json.loads(content)
    except Exception as e:
        print(f"[WARN] Ollama failed at {book} {chapter}:{candidate_start} -> {e}")
        return None

# ---------------------------------------------
# Block extraction
# ---------------------------------------------
def extract_blocks_for_chapter(book: str, chapter_num: str, verses: dict):
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

    # Optionally refine with Ollama
    if USE_OLLAMA:
        refined = []
        for c in citations:
            res = expand_block_with_ollama(book, chapter_num, verses, c["start_verse"])
            if res and "start_verse" in res and "end_verse" in res:
                c["start_verse"] = res["start_verse"]
                c["end_verse"] = res["end_verse"]
                c["via"] = res.get("via", "direct")
                c["confidence"] = res.get("confidence", 1.0)
                c["evidence"] = res.get("evidence_phrases", [])
            refined.append(c)
        return refined
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

    god_words = []
    citation_id = 1
    for book in ot_books:
        if book not in kjv_data:
            continue
        for chapter_num, verses in kjv_data[book].items():
            if not isinstance(verses, dict):
                continue
            blocks = extract_blocks_for_chapter(book, str(chapter_num), verses)
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
    return god_words

# ---------------------------------------------
# Save results
# ---------------------------------------------
def save_to_json(data, output_file):
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({
            "total_citations": len(data),
            "description": "Blocks of God's speech in the Old Testament",
            "note": "Identified by regex and optionally refined with Ollama",
            "citations": data
        }, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(data)} citations to {output_file}")

# ---------------------------------------------
# Main
# ---------------------------------------------
def main():
    kjv_json_file = "../../bibles/KJV.json"
    output_file = "god_words.json"

    print(f"Loading KJV JSON...")
    kjv_data = load_kjv_json(kjv_json_file)
    print(f"Loaded {len(kjv_data)} books")

    print("Extracting...")
    god_words = extract_god_words(kjv_data)

    print(f"Found {len(god_words)} blocks of divine speech")
    save_to_json(god_words, output_file)

    for c in god_words[:5]:
        print(f"{c['reference']} via={c['via']} conf={c['confidence']}")
        print(" evidence:", c.get("evidence"))

if __name__ == "__main__":
    main()
