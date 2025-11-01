import json
import re
from pathlib import Path

def load_kjv_json(kjv_path="KJV.json"):
    """Load the KJV JSON file to get proper verse references"""
    with open(kjv_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def normalize_text(text):
    """Normalize text for comparison - remove punctuation, lowercase, remove extra spaces"""
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def extract_god_words(kjv_data):
    """
    Extract all quotes from the Old Testament where God spoke,
    based on the provided patterns.
    """
    patterns = [
        r'\bGod said\b',
        r'\bthe LORD said\b',
        r'\bthe LORD spake unto .*?, saying\b',
        r'\bthe LORD commanded\b',
        r'\bThus saith the LORD\b',
        r'\bSaith the LORD\b',
        r'\bSaith the LORD of hosts\b',
        r'\bThe word of the LORD came unto .*?, saying\b',
        r'\bHear the word of the LORD\b'
    ]
    
    ot_books = [
        'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
        '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra',
        'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon',
        'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
        'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'
    ]
    
    god_words = []
    citation_id = 1
    
    for book in ot_books:
        if book not in kjv_data:
            continue
        
        for chapter_num, verses in kjv_data[book].items():
            if not isinstance(verses, dict):
                continue
            
            for verse_num, verse_text in verses.items():
                for pattern in patterns:
                    if re.search(pattern, verse_text, re.IGNORECASE):
                        # Format the reference string
                        ref_string = f"{book} {chapter_num}:{verse_num}"
                        
                        # Count words in the verse
                        word_count = len(verse_text.split())
                        
                        god_words.append({
                            "id": citation_id,
                            "reference": ref_string,
                            "book": book,
                            "chapter": chapter_num,
                            "start_verse": verse_num,
                            "end_verse": verse_num,
                            "text": verse_text.strip(),
                            "context": "",  # No context available from JSON
                            "word_count": word_count
                        })
                        citation_id += 1
                        break  # Avoid duplicate matches for the same verse
    
    return god_words

def save_to_json(data, output_file):
    """Save the extracted data to a JSON file"""
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({
            "total_citations": len(data),
            "description": "Citations of God's words in the Old Testament based on specific patterns",
            "note": "Verses where God spoke, identified by patterns like 'the LORD said', 'Thus saith the LORD', etc.",
            "citations": data
        }, f, indent=2, ensure_ascii=False)
    
    print(f"Successfully saved {len(data)} citations to {output_file}")

def main():
    # Input and output file paths
    kjv_json_file = "../../bibles/KJV.json"
    output_file = "god_words.json"
    
    print(f"Loading KJV JSON for verse references...")
    kjv_data = load_kjv_json(kjv_json_file)
    print(f"Loaded {len(kjv_data)} books from KJV")
    
    print(f"\nExtracting God's words from the Old Testament...")
    god_words = extract_god_words(kjv_data)
    
    print(f"Found {len(god_words)} quotes/citations of God's words")
    
    # Count how many have references (all should have them)
    with_refs = sum(1 for q in god_words if q['book'] is not None)
    print(f"Successfully matched {with_refs}/{len(god_words)} quotes to Bible references")
    
    # Save to JSON
    save_to_json(god_words, output_file)
    
    # Print first few examples
    print("\nFirst 10 citations:")
    for citation in god_words[:10]:
        print(f"\nCitation {citation['id']} - {citation['reference']} ({citation['word_count']} words):")
        text_preview = citation['text'][:100]
        if len(citation['text']) > 100:
            text_preview += "..."
        print(f"  Text: {text_preview}")

if __name__ == "__main__":
    main()