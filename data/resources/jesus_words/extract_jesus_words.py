import json
import re
from pathlib import Path
from difflib import SequenceMatcher

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

def find_verse_reference(quote_text, kjv_data, context=""):
    """
    Find the Bible reference for a given quote by searching through KJV JSON
    Returns (book, chapter, start_verse, end_verse) or None
    """
    normalized_quote = normalize_text(quote_text)
    
    # Focus on NT books where Jesus speaks
    nt_books = ['Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Revelation']
    
    best_match = None
    best_ratio = 0.0
    
    for book in nt_books:
        if book not in kjv_data:
            continue
            
        for chapter_num, verses in kjv_data[book].items():
            if not isinstance(verses, dict):
                continue
                
            for verse_num, verse_text in verses.items():
                normalized_verse = normalize_text(verse_text)
                
                # Check if quote is contained in this verse
                if normalized_quote in normalized_verse or normalized_verse in normalized_quote:
                    ratio = SequenceMatcher(None, normalized_quote, normalized_verse).ratio()
                    if ratio > best_ratio:
                        best_ratio = ratio
                        best_match = (book, chapter_num, verse_num, verse_num)
                
                # Check if quote starts in this verse (for multi-verse quotes)
                if len(normalized_quote) > 50:  # Only for longer quotes
                    quote_start = normalized_quote[:50]
                    if quote_start in normalized_verse:
                        # This might be the start - try to find the end
                        start_ref = (book, chapter_num, verse_num)
                        end_verse = find_quote_end(normalized_quote, kjv_data, book, chapter_num, verse_num)
                        if end_verse:
                            ratio = 0.9  # High confidence for multi-verse matches
                            if ratio > best_ratio:
                                best_ratio = ratio
                                best_match = (book, chapter_num, verse_num, end_verse)
    
    return best_match if best_ratio > 0.7 else None

def find_quote_end(normalized_quote, kjv_data, book, chapter, start_verse):
    """Find the ending verse of a multi-verse quote"""
    try:
        accumulated_text = ""
        verse_num = int(start_verse)
        chapter_data = kjv_data[book][chapter]
        
        while str(verse_num) in chapter_data:
            verse_text = normalize_text(chapter_data[str(verse_num)])
            accumulated_text += " " + verse_text
            
            if normalized_quote in accumulated_text:
                return str(verse_num)
            
            verse_num += 1
            if verse_num > int(start_verse) + 50:  # Safety limit
                break
        
        return start_verse  # Fallback
    except:
        return start_verse

def extract_jesus_words(file_path, kjv_data):
    """
    Extract all citations marked with <FR>/<Fr> tags (Jesus' words in red)
    from the KJV ONT file and create a JSON output.
    
    The FR tags wrap individual words, so we extract consecutive
    FR-tagged segments and combine them into complete quotes.
    """
    
    # Read the file - try multiple encodings
    encodings = ['latin-1', 'iso-8859-1', 'cp1252', 'utf-8']
    content = None
    
    for encoding in encodings:
        try:
            with open(file_path, 'r', encoding=encoding) as f:
                content = f.read()
            print(f"Successfully read file with {encoding} encoding")
            break
        except UnicodeDecodeError:
            continue
    
    if content is None:
        raise ValueError("Unable to read file with any supported encoding")
    
    # Strategy: Find continuous sections that contain FR tags
    # Split the content by patterns that indicate end of Jesus' speech
    
    jesus_words = []
    
    # Find all FR tag sections and group consecutive ones
    fr_pattern = r'<FR>(.*?)<Fr>'
    
    # Get all FR matches with their positions
    matches = list(re.finditer(fr_pattern, content, re.DOTALL | re.IGNORECASE))
    
    if not matches:
        print("No FR tags found!")
        return jesus_words
    
    print(f"Found {len(matches)} individual FR-tagged words/phrases")
    
    # Group consecutive FR tags into quotes
    current_quote_words = []
    current_quote_start = None
    last_end = -1
    gap_threshold = 100  # Max characters between FR tags to consider them part of the same quote
    
    for i, match in enumerate(matches):
        word = match.group(1)
        start = match.start()
        end = match.end()
        
        # Check gap between this match and the last one
        if last_end == -1 or (start - last_end) <= gap_threshold:
            # Part of the same quote
            if current_quote_start is None:
                current_quote_start = start
            current_quote_words.append(word)
        else:
            # Gap is too large, save the previous quote
            if current_quote_words:
                combined = ' '.join(current_quote_words)
                clean_text = re.sub(r'<[^>]+>', '', combined)
                clean_text = re.sub(r'\s+', ' ', clean_text).strip()
                
                if len(clean_text) > 2:
                    # Try to find context before this quote
                    context_start = max(0, current_quote_start - 200)
                    context_text = content[context_start:current_quote_start]
                    context_text = re.sub(r'<[^>]+>', '', context_text)
                    context_text = re.sub(r'\s+', ' ', context_text).strip()
                    
                    # Get the last sentence or phrase from context
                    sentences = context_text.split('.')
                    context_snippet = sentences[-1].strip() if sentences else ""
                    
                    # Find the Bible reference
                    reference = find_verse_reference(clean_text, kjv_data, context_snippet)
                    
                    if reference:
                        book, chapter, start_verse, end_verse = reference
                        if start_verse == end_verse:
                            ref_string = f"{book} {chapter}:{start_verse}"
                        else:
                            ref_string = f"{book} {chapter}:{start_verse}-{end_verse}"
                    else:
                        ref_string = "Reference not found"
                        book, chapter, start_verse, end_verse = None, None, None, None
                    
                    jesus_words.append({
                        "id": len(jesus_words) + 1,
                        "reference": ref_string,
                        "book": book,
                        "chapter": chapter,
                        "start_verse": start_verse,
                        "end_verse": end_verse,
                        "text": clean_text,
                        "context": context_snippet[-100:] if len(context_snippet) > 100 else context_snippet,
                        "word_count": len(current_quote_words)
                    })
            
            # Start a new quote
            current_quote_words = [word]
            current_quote_start = start
        
        last_end = end
    
    # Don't forget the last quote
    if current_quote_words:
        combined = ' '.join(current_quote_words)
        clean_text = re.sub(r'<[^>]+>', '', combined)
        clean_text = re.sub(r'\s+', ' ', clean_text).strip()
        
        if len(clean_text) > 2:
            context_start = max(0, current_quote_start - 200)
            context_text = content[context_start:current_quote_start]
            context_text = re.sub(r'<[^>]+>', '', context_text)
            context_text = re.sub(r'\s+', ' ', context_text).strip()
            sentences = context_text.split('.')
            context_snippet = sentences[-1].strip() if sentences else ""
            
            # Find the Bible reference
            reference = find_verse_reference(clean_text, kjv_data, context_snippet)
            
            if reference:
                book, chapter, start_verse, end_verse = reference
                if start_verse == end_verse:
                    ref_string = f"{book} {chapter}:{start_verse}"
                else:
                    ref_string = f"{book} {chapter}:{start_verse}-{end_verse}"
            else:
                ref_string = "Reference not found"
                book, chapter, start_verse, end_verse = None, None, None, None
            
            jesus_words.append({
                "id": len(jesus_words) + 1,
                "reference": ref_string,
                "book": book,
                "chapter": chapter,
                "start_verse": start_verse,
                "end_verse": end_verse,
                "text": clean_text,
                "context": context_snippet[-100:] if len(context_snippet) > 100 else context_snippet,
                "word_count": len(current_quote_words)
            })
    
    return jesus_words

def save_to_json(data, output_file):
    """Save the extracted data to a JSON file"""
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({
            "total_citations": len(data),
            "description": "Citations of Jesus' words marked with <FR>/<Fr> tags in KJV",
            "note": "Words marked in red in the original Bible text",
            "citations": data
        }, f, indent=2, ensure_ascii=False)
    
    print(f"Successfully saved {len(data)} citations to {output_file}")

def main():
    # Input and output file paths
    input_file = "kjv.ont"
    kjv_json_file = "../../bibles/KJV.json"
    output_file = "jesus_words.json"
    
    print(f"Loading KJV JSON for verse references...")
    kjv_data = load_kjv_json(kjv_json_file)
    print(f"Loaded {len(kjv_data)} books from KJV")
    
    print(f"\nReading file: {input_file}")
    jesus_words = extract_jesus_words(input_file, kjv_data)
    
    print(f"Found {len(jesus_words)} complete quotes/citations of Jesus' words")
    
    # Count how many have references
    with_refs = sum(1 for q in jesus_words if q['book'] is not None)
    print(f"Successfully matched {with_refs}/{len(jesus_words)} quotes to Bible references")
    
    # Save to JSON
    save_to_json(jesus_words, output_file)
    
    # Print first few examples
    print("\nFirst 10 citations:")
    for citation in jesus_words[:10]:
        print(f"\nCitation {citation['id']} - {citation['reference']} ({citation['word_count']} words):")
        text_preview = citation['text'][:100]
        if len(citation['text']) > 100:
            text_preview += "..."
        print(f"  Text: {text_preview}")

if __name__ == "__main__":
    main()