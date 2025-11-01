# Route Testing Guide

## Quick Test URLs

Copy and paste these URLs into your browser while the dev server is running at `http://localhost:3000`

### ✅ Canonical URLs (Should work directly - 200 OK)

```
http://localhost:3000/en/kjv/matthew/24
http://localhost:3000/en/kjv/matthew/24/3
http://localhost:3000/en/kjv/matthew/24/3-5
http://localhost:3000/en/niv/john/3/16
http://localhost:3000/en/esv/1-corinthians/13
http://localhost:3000/en/kjv/revelation/21/1-4
```

### ↪️ Redirect URLs (Should redirect to canonical - 301)

#### Abbreviated Book Names

```
http://localhost:3000/en/kjv/matt/24
http://localhost:3000/en/kjv/mat/24/3
http://localhost:3000/en/kjv/1cor/13
http://localhost:3000/en/kjv/rev/21
http://localhost:3000/en/kjv/gen/1/1
```

#### Colon Format

```
http://localhost:3000/en/kjv/matthew/24:3
http://localhost:3000/en/kjv/matthew/24:3-5
http://localhost:3000/en/kjv/john/3:16
http://localhost:3000/en/niv/1-corinthians/13:4-8
```

#### Mixed Case (should redirect to lowercase)

```
http://localhost:3000/en/KJV/matthew/24
http://localhost:3000/en/Kjv/Matthew/24
http://localhost:3000/en/kjv/Matthew/24
```

### ❌ Invalid URLs (Should return 404)

```
http://localhost:3000/en/invalidversion/matthew/24
http://localhost:3000/en/kjv/notabook/24
http://localhost:3000/en/kjv/matthew/abc
http://localhost:3000/en/kjv/matthew/24/notverses
http://localhost:3000/fr/kjv/matthew/24
```

## Testing with curl

### Test Canonical URL

```bash
curl -I http://localhost:3000/en/kjv/matthew/24
# Should return: HTTP/1.1 200 OK
```

### Test Redirect

```bash
curl -I http://localhost:3000/en/kjv/matt/24
# Should return: HTTP/1.1 308 Permanent Redirect (or 301)
# Location: /en/kjv/matthew/24
```

### Test Colon Format Redirect

```bash
curl -I http://localhost:3000/en/kjv/matthew/24:3
# Should return: HTTP/1.1 308 Permanent Redirect (or 301)
# Location: /en/kjv/matthew/24/3
```

### Test 404

```bash
curl -I http://localhost:3000/en/invalid/matthew/24
# Should return: HTTP/1.1 404 Not Found
```

## Browser DevTools Testing

1. Open browser DevTools (F12)
2. Go to Network tab
3. Visit a redirect URL (e.g., `/en/kjv/matt/24`)
4. You should see:
   - First request: 308/301 redirect
   - Second request: 200 OK to canonical URL
5. Check the final URL in address bar matches canonical format

## Expected Behavior

### Successful Navigation

- URL is clean and lowercase
- Book names are full canonical names (not abbreviations)
- Chapter and verses are separated by `/` (not `:`)
- Page loads with correct Bible content

### SEO Benefits

- All variations point to single canonical URL
- Search engines consolidate ranking signals
- Users can share clean, readable URLs

## Common Book Abbreviations to Test

| Abbreviation  | Canonical     | Test URL          |
| ------------- | ------------- | ----------------- |
| matt, mat, mt | matthew       | `/en/kjv/matt/5`  |
| 1cor, 1co     | 1-corinthians | `/en/kjv/1cor/13` |
| rev, reve     | revelation    | `/en/kjv/rev/1`   |
| gen, ge       | genesis       | `/en/kjv/gen/1/1` |
| ps, psa       | psalms        | `/en/kjv/ps/23`   |
| phil, php     | philippians   | `/en/kjv/phil/4`  |

## Troubleshooting

### Route not working?

1. Check if dev server is running: `npm run dev`
2. Verify file structure matches expected paths
3. Check browser console for errors
4. Look at terminal output for Next.js errors

### Redirects not working?

1. Clear browser cache
2. Try in incognito/private window
3. Check Network tab for redirect chain
4. Verify getServerSideProps is returning correct redirect object

### 404 on valid URL?

1. Verify version exists in `versionMap.ts`
2. Check book name is in `ENGLISH_BIBLE_BOOKS`
3. Ensure chapter is a valid number
4. Check verse format is `N` or `N-M`
