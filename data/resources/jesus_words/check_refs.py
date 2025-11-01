import json

data = json.load(open('jesus_words.json'))
refs_with_book = [(q['reference'], len(q['text'])) for q in data['citations'] if q['book']]
print('Sample references with sizes:')
for ref, size in refs_with_book[20:30]:
    print(f'{ref}: {size} chars')

print('\n\nAll unique references (book:chapter format):')
refs_by_chapter = {}
for q in data['citations']:
    if q['book'] and q['chapter']:
        key = f"{q['book']} {q['chapter']}"
        if key not in refs_by_chapter:
            refs_by_chapter[key] = []
        refs_by_chapter[key].append(f"{q['start_verse']}-{q['end_verse']}" if q['start_verse'] != q['end_verse'] else q['start_verse'])

for chapter, verses in sorted(refs_by_chapter.items()):
    print(f"{chapter}: {', '.join(sorted(set(verses), key=lambda x: int(str(x).split('-')[0])))}")
