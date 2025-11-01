import json

# Load the jesus_words.json file
with open('jesus_words.json', 'r') as f:
    data = json.load(f)

# Create a structured output with verse ranges
jesus_refs = {}

for citation in data['citations']:
    if not citation['book'] or not citation['chapter']:
        continue
    
    book = citation['book']
    chapter = str(citation['chapter'])
    start_verse = int(citation['start_verse'])
    end_verse = int(citation['end_verse'])
    
    # Initialize book if not exists
    if book not in jesus_refs:
        jesus_refs[book] = {}
    
    # Initialize chapter if not exists  
    if chapter not in jesus_refs[book]:
        jesus_refs[book][chapter] = []
    
    # Add verse range
    for verse in range(start_verse, end_verse + 1):
        if verse not in jesus_refs[book][chapter]:
            jesus_refs[book][chapter].append(verse)

# Sort verses in each chapter
for book in jesus_refs:
    for chapter in jesus_refs[book]:
        jesus_refs[book][chapter].sort()

# Convert to more readable format with verse ranges
jesus_refs_formatted = {}
for book in jesus_refs:
    jesus_refs_formatted[book] = {}
    for chapter in jesus_refs[book]:
        verses = jesus_refs[book][chapter]
        
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
        
        jesus_refs_formatted[book][chapter] = ranges

# Save the formatted output
output = {
    "description": "Bible verses containing Jesus' words (red letter)",
    "note": "This can be applied to any Bible translation to mark Jesus' words in red",
    "total_books": len(jesus_refs_formatted),
    "references": jesus_refs_formatted
}

with open('jesus_words_references.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

print(f"Created jesus_words_references.json")
print(f"Total books with Jesus' words: {len(jesus_refs_formatted)}")
print(f"\nBooks included: {', '.join(sorted(jesus_refs_formatted.keys()))}")

# Print summary statistics
total_verses = sum(len(verses) for book in jesus_refs for chapter in jesus_refs[book] for verses in [jesus_refs[book][chapter]])
print(f"\nTotal individual verses with Jesus' words: {total_verses}")

# Print first few examples
print("\n\nExample references:")
count = 0
for book in sorted(jesus_refs_formatted.keys()):
    for chapter in sorted(jesus_refs_formatted[book].keys(), key=int):
        verse_list = ', '.join(jesus_refs_formatted[book][chapter])
        print(f"{book} {chapter}: {verse_list}")
        count += 1
        if count >= 10:
            break
    if count >= 10:
        break
