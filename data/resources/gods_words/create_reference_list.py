import json

# Load the god_words.json file
with open('god_words.json', 'r') as f:
    data = json.load(f)

# Create a structured output with verse ranges
god_refs = {}

for citation in data['citations']:
    if not citation['book'] or not citation['chapter']:
        continue
    
    book = citation['book']
    chapter = str(citation['chapter'])
    start_verse = int(citation['start_verse'])
    end_verse = int(citation['end_verse'])
    
    # Initialize book if not exists
    if book not in god_refs:
        god_refs[book] = {}
    
    # Initialize chapter if not exists  
    if chapter not in god_refs[book]:
        god_refs[book][chapter] = []
    
    # Add verse range
    for verse in range(start_verse, end_verse + 1):
        if verse not in god_refs[book][chapter]:
            god_refs[book][chapter].append(verse)

# Sort verses in each chapter
for book in god_refs:
    for chapter in god_refs[book]:
        god_refs[book][chapter].sort()

# Convert to more readable format with verse ranges
god_refs_formatted = {}
for book in god_refs:
    god_refs_formatted[book] = {}
    for chapter in god_refs[book]:
        verses = god_refs[book][chapter]
        
        # Group consecutive verses into ranges
        ranges = []
        start = verses[0]
        end = verses[0]
        
        for i in range(1, len(verses)):
            if verses[i] == end + 1:
                end = verses[i]
            else:
                if start == end:
                    ranges.append(str(start))
                else:
                    ranges.append(f"{start}-{end}")
                start = verses[i]
                end = verses[i]
        
        # Add the last range
        if start == end:
            ranges.append(str(start))
        else:
            ranges.append(f"{start}-{end}")
        
        god_refs_formatted[book][chapter] = ranges

# Save the formatted output
output = {
    "description": "Bible verses containing God's words in the Old Testament",
    "note": "Verses identified by patterns like 'the LORD said', 'Thus saith the LORD', etc.",
    "total_books": len(god_refs_formatted),
    "references": god_refs_formatted
}

with open('god_words_references.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

print(f"Created god_words_references.json")
print(f"Total books with God's words: {len(god_refs_formatted)}")
print(f"\nBooks included: {', '.join(sorted(god_refs_formatted.keys()))}")

# Print summary statistics
total_verses = sum(len(verses) for book in god_refs for chapter in god_refs[book] for verses in [god_refs[book][chapter]])
print(f"\nTotal individual verses with God's words: {total_verses}")

# Print first few examples
print("\n\nExample references:")
count = 0
for book in sorted(god_refs_formatted.keys()):
    for chapter in sorted(god_refs_formatted[book].keys(), key=int):
        verse_list = ', '.join(god_refs_formatted[book][chapter])
        print(f"{book} {chapter}: {verse_list}")
        count += 1
        if count >= 10:
            break
    if count >= 10:
        break