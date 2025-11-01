# Bible Routing Implementation

## Overview

This implementation provides a comprehensive routing system for Bible passages with support for:

- Full chapters and verse ranges
- Abbreviated book names
- Colon format URLs (with redirect)
- Lowercase normalization
- 301 redirects to canonical URLs

## Route Structure

### Primary Route (Canonical)

**Pattern:** `/en/<version>/<book>/<chapter>[/<verses>]`

**File:** `pages/[lang]/[version]/[book]/[chapter]/[[...verses]].tsx`

**Examples:**

- `/en/kjv/matthew/24` - Full chapter
- `/en/kjv/matthew/24/3` - Single verse
- `/en/kjv/matthew/24/3-5` - Verse range

### Colon Format Redirect

**Pattern:** `/en/<version>/<book>/<chapter:verses>`

**Handled by:** Same file as primary route - `pages/[lang]/[version]/[book]/[chapter]/[[...verses]].tsx`

**Note:** The colon format is detected within the main route handler. When a colon is found in the chapter parameter, it triggers a 301 redirect to the canonical format.

**Examples:**

- `/en/kjv/matthew/24:3` → `/en/kjv/matthew/24/3` (301)
- `/en/kjv/matthew/24:3-5` → `/en/kjv/matthew/24/3-5` (301)

## Features

### 1. Book Name Normalization

All book abbreviations are normalized to canonical form:

- `mat`, `matt`, `mt` → `matthew`
- `1cor`, `1co` → `1-corinthians`
- `rev`, `reve` → `revelation`

**Redirects with 301:**

- `/en/kjv/matt/24/3` → `/en/kjv/matthew/24/3`

### 2. Version Slug Normalization

Version IDs are normalized to lowercase slugs:

- `KJV` → `kjv`
- `NASB1995` → `nasb1995`

### 3. Lowercase Enforcement

All paths are lowercase in canonical form. Mixed case redirects to lowercase:

- `/en/KJV/Matthew/24` → `/en/kjv/matthew/24` (301)

### 4. Verse Range Parsing

Supports:

- Single verse: `3`
- Verse range: `3-5`
- Future: Multiple ranges: `3-5,7-9` (structure ready)

## File Structure

```
src/utils/
  ├── bookSlugNormalizer.ts    # Book name & slug handling
  ├── versionMap.ts             # Version slug mapping
  ├── bibleReferenceParser.ts   # Reference parsing utilities
  └── bibleBookLists.ts         # Canonical book lists

pages/
  └── [lang]/
      └── [version]/
          └── [book]/
              └── [chapter]/
                  └── [[...verses]].tsx        # Main route (handles canonical & colon format)
```

## URL Validation

The routing system validates:

1. **Language:** Currently only `en` supported
2. **Version:** Must exist in version map
3. **Book:** Must be valid book name or abbreviation
4. **Chapter:** Must be positive integer
5. **Verses:** Must match format `N` or `N-M` where M > N

Invalid URLs return 404.

## SEO Considerations

### Canonical URLs

All non-canonical URLs redirect with 301 to canonical form for SEO.

### Meta Tags

Each page includes:

- Dynamic `<title>`: "Matthew 24:3-5 - KJV | SeekFirst"
- `<meta name="description">`: Descriptive text about the passage

### URL Structure Benefits

- Clean, readable URLs
- Consistent format
- Proper use of hyphens for multi-word book names
- Lowercase for consistency

## Integration with App

The route passes initial state to the App component:

```tsx
<App
  initialBook="Matthew"
  initialChapter={24}
  initialVersion="KJV"
  initialVerses="3-5"
/>
```

The `BibleView` component receives these props and initializes its state accordingly.

## Future Enhancements

### Potential Additions:

1. **Multiple verse ranges:** `3-5,7-9,11`
2. **Spanish support:** `/es/<version>/<libro>/<capitulo>`
3. **Version comparison:** `/compare/kjv,niv/matthew/24`
4. **Search URLs:** `/search?q=love`
5. **Topical URLs:** `/topics/salvation`

### Route Priority

Next.js matches routes based on specificity. The main route handles both canonical URLs and colon format redirects within the same handler for simplicity.

The `[chapter]` parameter can contain either:

- A plain chapter number: `24`
- A colon format: `24:3-5` (triggers redirect)

## Testing Scenarios

### Valid URLs (200 OK)

- `/en/kjv/matthew/24`
- `/en/kjv/matthew/24/3`
- `/en/kjv/matthew/24/3-5`
- `/en/esv/1-corinthians/13`
- `/en/niv/revelation/21/1-4`

### Redirects (301)

- `/en/kjv/matt/24` → `/en/kjv/matthew/24`
- `/en/kjv/matthew/24:3` → `/en/kjv/matthew/24/3`
- `/en/KJV/matthew/24` → `/en/kjv/matthew/24`
- `/en/kjv/1cor/13` → `/en/kjv/1-corinthians/13`

### Invalid (404)

- `/en/invalid/matthew/24`
- `/en/kjv/notabook/24`
- `/en/kjv/matthew/abc`
- `/en/kjv/matthew/24/abc`
- `/fr/kjv/matthew/24` (unsupported language)

## Notes

- All routing logic is server-side (SSR) for SEO and performance
- Redirects are permanent (301) to consolidate SEO value
- Book abbreviations support common variations from multiple traditions
- Version slugs are flexible but normalize to lowercase
