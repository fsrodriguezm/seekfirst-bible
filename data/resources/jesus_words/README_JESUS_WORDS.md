# Jesus' Words (Red Letter) Reference Guide

This directory contains extracted references to all verses where Jesus speaks in the Bible (traditionally shown in red in "Red Letter" Bibles).

## Attribution

- The `kjv.ont` file used for this extraction was obtained from [The Word Project](https://www.theword.net/index.php?downloads.modules&l=english).
- The idea for this feature was inspired by a discussion on [Christianity Stack Exchange](https://christianity.stackexchange.com/questions/32128/looking-for-red-letter-bible-in-database-format).

## Files Generated

### 1. `jesus_words_references.json` ⭐ **USE THIS FILE**

**The primary file for your webapp feature.**

**Structure:**

```json
{
  "description": "Bible verses containing Jesus' words (red letter)",
  "note": "This can be applied to any Bible translation",
  "total_books": 6,
  "references": {
    "Matthew": {
      "3": ["15"],
      "4": ["4", "7", "10", "19"],
      "5": ["3-16"],
      ...
    }
  }
}
```

**Usage:** Loop through this JSON to mark verses red in any Bible translation on your site.

### 2. `jesus_words.json`

Detailed extraction with full text of each quote, context, and word counts. Good for reference but not needed for the red-letter feature.

### 3. `extract_jesus_words.py`

The Python script that extracts Jesus' words from `kjv.ont` file and matches them to Bible verses.

## Statistics

- **Total Books:** 6 (Matthew, Mark, Luke, John, Acts, Revelation)
- **Total Individual Verses:** 925 verses where Jesus speaks
- **Total Quotes:** 599 distinct quotations

## Books Breakdown

| Book       | Chapters with Jesus' Words |
| ---------- | -------------------------- |
| Matthew    | 26 chapters (3-28)         |
| Mark       | 14 chapters (1-16)         |
| Luke       | 19 chapters (2-24)         |
| John       | 21 chapters (1-21)         |
| Acts       | 7 chapters (scattered)     |
| Revelation | 3 chapters (1, 16, 22)     |

## Implementation Example

```javascript
// Load the reference file
const jesusWords = await fetch("/bibles/jesus_words_references.json").then(
  (r) => r.json()
);

// Check if a verse should be red
function isJesusWord(book, chapter, verse) {
  if (!jesusWords.references[book]) return false;
  if (!jesusWords.references[book][chapter]) return false;

  const ranges = jesusWords.references[book][chapter];

  for (const range of ranges) {
    if (range.includes("-")) {
      const [start, end] = range.split("-").map(Number);
      if (verse >= start && verse <= end) return true;
    } else {
      if (verse === Number(range)) return true;
    }
  }

  return false;
}

// Usage
if (isJesusWord("Matthew", "5", 3)) {
  // Mark this verse in red
}
```

## Sample References

- **Matthew 5:3-16** - Beatitudes and "You are the light of the world"
- **Matthew 24-25** - Olivet Discourse (end times)
- **John 3:3-21** - Born again conversation with Nicodemus
- **John 14-17** - Upper Room Discourse
- **Luke 15** - Parables of the Lost Sheep, Coin, and Prodigal Son

## Source

Extracted from `kjv.ont` file using `<FR>` and `<Fr>` tags which mark red letter text in the King James Version. Cross-referenced with `KJV.json` to get accurate verse citations.

## Notes

- 405 out of 599 quotes (67.6%) were successfully matched to specific verse references
- Some quotes could not be matched due to formatting differences or variations in text
- The reference list includes all individual verses, even if Jesus only speaks part of the verse
- This can be applied to **any Bible translation** on your website
