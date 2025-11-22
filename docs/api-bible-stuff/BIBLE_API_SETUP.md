# Bible API Configuration

## Getting Started

To use the Bible API, you need to:

1. **Get an API Key**
   - Visit: https://scripture.api.bible/
   - Sign up for a free account
   - Generate an API key

2. **Set up Environment Variable**
   - Create or edit `.env.local` in your project root
   - Add your API key:
     ```
     NEXT_PUBLIC_BIBLE_API_KEY=your_api_key_here
     ```

3. **Use the API in Your Application**

   **Option A: Use the hook with API support**
   ```tsx
   import { useBibleData } from '@/hooks/useBibleDataWithApi'

   export function MyComponent() {
     const { verses, isLoading, source } = useBibleData({
       bibleId: 'KJV_ID',
       book: 'Genesis',
       chapter: 1,
       setBook: setBook,
       setChapter: setChapter,
       crossReferenceMode: false,
       useApiIfAvailable: true  // Enable API usage
     })

     return (
       <div>
         <p>Data from: {source}</p>
         {/* Your component */}
       </div>
     )
   }
   ```

   **Option B: Use the API service directly**
   ```tsx
   import bibleApiService from '@/utils/bibleApiService'

   // Get all available bibles
   const bibles = await bibleApiService.getBibles()

   // Get chapter verses
   const verses = await bibleApiService.getChapterVerses('592420522e16049f-01', 'PRO.3')

   // Get specific verses
   const verseList = await bibleApiService.getVerses('592420522e16049f-01', ['PRO.3.5', 'PRO.3.6'])
   ```

## Available Bible IDs

Here are some popular translations:

**English:**
- `9879dbb7cfe39e4d-01` - World English Bible (WEB)
- `de4e12af7f28f599-01` - King James Version (KJV)
- `06125adad2d5898a-01` - American Standard Version (ASV)

**Spanish:**
- `592420522e16049f-01` - Reina Valera 1909 (RVR09)

## Chapter ID Format

The Bible API uses chapter IDs in this format:
- `PRO.3` - Book.Chapter
- Common book abbreviations: GEN, EXO, LEV, NUM, DEU, JOS, JDG, RUT, 1SA, 2SA, 1KI, 2KI, 1CH, 2CH, EZR, NEH, EST, JOB, PSA, PRO, ECC, SNG, ISA, JER, LAM, EZK, DAN, HOS, JOL, AMO, OBA, JON, MIC, NAM, HAB, ZEP, HAG, ZEC, MAL, MAT, MRK, LUK, JHN, ACT, ROM, 1CO, 2CO, GAL, EPH, PHP, COL, 1TH, 2TH, 1TI, 2TI, TIT, PHM, HEB, JAS, 1PE, 2PE, 1JN, 2JN, 3JN, JUD, REV

## Example: Get Proverbs 3:5-6 from RVR09

```bash
curl --location 'https://rest.api.bible/v1/bibles/592420522e16049f-01/chapters/PRO.3' \
  --header 'api-key: YOUR_API_KEY_HERE'
```

## Testing

Use the `BibleApiTester` component to test your API setup:

```tsx
import BibleApiTester from '@/components/BibleApiTester'

export default function TestPage() {
  return <BibleApiTester />
}
```

## API Documentation

Full documentation available at: https://docs.api.bible/
