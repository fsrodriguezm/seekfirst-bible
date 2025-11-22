# Bible API Integration - Summary

## What I've Created

### 1. **Bible API Service** (`src/utils/bibleApiService.ts`)
A reusable service for interacting with the REST Bible API:
- `getBibles()` - Get all available Bible versions
- `getBible(bibleId)` - Get a specific version
- `getChapter(bibleId, chapterId)` - Get chapter content
- `getVerses(bibleId, verseIds)` - Get specific verses
- `getBooks(bibleId)` - Get all books in a Bible
- `getChapterVerses(bibleId, chapterId)` - Get chapter parsed into verse map
- `parseChapterContent()` - Helper to convert HTML to verse map

### 2. **Enhanced Hook** (`src/hooks/useBibleDataWithApi.ts`)
Extended version of your existing `useBibleData` hook:
- Drop-in replacement for the current hook
- Fallback logic: Uses API if available, falls back to local JSON
- Works with your existing component structure
- Returns `source` to show whether data came from 'api' or 'local'

### 3. **Test Component** (`src/components/BibleApiTester.tsx`)
A development tool to test the API integration:
- Test getting all bibles
- Test fetching specific chapters (Spanish RVR09, English WEB)
- Shows results/errors in a nice UI
- Great for debugging API issues

### 4. **Setup Documentation** (`BIBLE_API_SETUP.md`)
Complete guide including:
- How to get an API key
- Environment variable setup
- Usage examples
- Available Bible IDs and chapter ID format
- Links to full documentation

## Quick Start

### Step 1: Get API Key
Visit https://scripture.api.bible/ and sign up for a free account

### Step 2: Configure Environment
Create `.env.local` in your project root:
```bash
NEXT_PUBLIC_BIBLE_API_KEY=your_api_key_here
```

### Step 3: Test the Integration
Add the test component to a page temporarily:
```tsx
import BibleApiTester from '@/components/BibleApiTester'

export default function TestPage() {
  return <BibleApiTester />
}
```

### Step 4: Use in Your App
Option A - Switch to the new hook (with fallback):
```tsx
import { useBibleData } from '@/hooks/useBibleDataWithApi'

const { verses, isLoading, source } = useBibleData({
  // ... your options
  useApiIfAvailable: true
})
```

Option B - Use the service directly:
```tsx
import bibleApiService from '@/utils/bibleApiService'

const verses = await bibleApiService.getChapterVerses('592420522e16049f-01', 'PRO.3')
```

## Example: Proverbs 3:5-6 from Reina Valera 1909

```bash
curl --location 'https://rest.api.bible/v1/bibles/592420522e16049f-01/chapters/PRO.3' \
  --header 'api-key: YOUR_API_KEY_HERE'
```

This will return verse data that the service parses into your verse map format.

## Key Features

✅ Works with your existing code structure
✅ Automatic fallback to local JSON if API fails
✅ No breaking changes to current implementation
✅ Easy to test and debug
✅ TypeScript support
✅ Handles multiple Bible translations
✅ Parses API response into your verse format

## Next Steps

1. Set the API key in `.env.local`
2. Test with the `BibleApiTester` component
3. Switch the existing hook to `useBibleDataWithApi` with `useApiIfAvailable: true`
4. The app will automatically try API first, fallback to local files if needed
