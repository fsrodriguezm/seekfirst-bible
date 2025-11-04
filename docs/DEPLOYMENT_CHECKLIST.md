# Pre-Deployment Checklist

## ✅ Code Changes Complete

- [x] Open Graph meta tags added to all pages
- [x] Twitter Card tags added to all pages
- [x] Keywords meta tags added
- [x] JSON-LD structured data implemented
- [x] Domain canonicalization middleware created
- [x] Sitemap updated with licensed versions only
- [x] Documentation updated
- [x] Build tested successfully

## ⚠️ Before Deploying

### Required Action Items

- [ ] **Create Open Graph image** (`public/og-bible-image.png`)
  - Size: 1200 × 630 pixels
  - See: `docs/OG_IMAGE_GUIDE.md`
  - Tools: Canva, Figma, or Photopea
  - Estimated time: 30 minutes

### Optional But Recommended

- [ ] Review all meta descriptions for accuracy
- [ ] Test build one more time: `npm run build`
- [ ] Review middleware.ts domain preference (www vs apex)
- [ ] Check that all Bible versions in sitemap are properly licensed

## 📤 Deployment Steps

### 1. Deploy to Production

```bash
git add .
git commit -m "feat: Add comprehensive SEO and social sharing features"
git push origin main
```

### 2. Immediate Post-Deployment Tests

- [ ] Visit: `https://seekfirstbible.com/api/sitemap.xml`
  - Should return valid XML with all URLs
- [ ] Visit: `https://seekfirstbible.com/robots.txt`
  - Should show robots.txt content
- [ ] Visit: `https://www.seekfirstbible.com/`
  - Should redirect to `https://seekfirstbible.com/`
- [ ] Visit: `https://seekfirstbible.com/en/kjv/john/3`
  - Right-click → View Page Source
  - Verify all meta tags present:
    - `<meta property="og:title"...`
    - `<meta name="twitter:card"...`
    - `<script type="application/ld+json"...`
    - `<link rel="canonical"...`

### 3. Test Social Previews

- [ ] **Facebook Debugger**

  1. Go to: https://developers.facebook.com/tools/debug/
  2. Enter: `https://seekfirstbible.com/en/kjv/john/3`
  3. Click "Debug"
  4. Verify preview shows correctly
  5. Click "Scrape Again" if needed

- [ ] **Twitter Card Validator**

  1. Go to: https://cards-dev.twitter.com/validator
  2. Enter: `https://seekfirstbible.com/en/kjv/john/3`
  3. Click "Preview card"
  4. Verify large image card appears

- [ ] **LinkedIn Post Inspector**

  1. Go to: https://www.linkedin.com/post-inspector/
  2. Enter: `https://seekfirstbible.com/en/kjv/john/3`
  3. Click "Inspect"
  4. Verify preview appears correctly

- [ ] **WhatsApp Test**
  1. Send a link in WhatsApp: `https://seekfirstbible.com/en/kjv/matthew/5`
  2. Verify rich preview appears

### 4. Google Search Console

- [ ] Log in to [Google Search Console](https://search.google.com/search-console)
- [ ] Navigate to "Sitemaps"
- [ ] Submit: `https://seekfirstbible.com/api/sitemap.xml`
- [ ] Wait for "Success" status

### 5. Bing Webmaster Tools

- [ ] Log in to [Bing Webmaster Tools](https://www.bing.com/webmasters)
- [ ] Navigate to "Sitemaps"
- [ ] Submit: `https://seekfirstbible.com/api/sitemap.xml`

### 6. Request Indexing (Priority Pages)

Use Google Search Console's URL Inspection tool:

- [ ] `https://seekfirstbible.com/`
- [ ] `https://seekfirstbible.com/en/kjv/john/3`
- [ ] `https://seekfirstbible.com/en/kjv/matthew/5`
- [ ] `https://seekfirstbible.com/en/kjv/psalm/23`
- [ ] `https://seekfirstbible.com/en/kjv/romans/8`
- [ ] `https://seekfirstbible.com/en/kjv/genesis/1`
- [ ] `https://seekfirstbible.com/en/kjv/revelation/1`
- [ ] `https://seekfirstbible.com/about`

For each:

1. Enter URL in inspection tool
2. Click "Request Indexing"
3. Wait for confirmation

## 📊 Monitoring Setup

### Week 1 After Deployment

- [ ] Check Google Search Console daily for:
  - New pages indexed
  - Coverage issues
  - Mobile usability issues
- [ ] Monitor social sharing:
  - Test links on different platforms
  - Check if previews work correctly
- [ ] Verify structured data:
  - Use [Rich Results Test](https://search.google.com/test/rich-results)
  - Test several Bible page URLs

### Month 1 After Deployment

- [ ] Review analytics:
  - Social media referral traffic
  - Search impression growth
  - Click-through rates
- [ ] Check backlink progress:
  - Use Google Search Console → Links report
  - Track referring domains
- [ ] Monitor rankings:
  - Check position for target keywords
  - "online bible study"
  - "read [book name] online"
  - "bible cross references"

## 🔗 Backlink Building Timeline

### Week 1-2

- [ ] Add link to GitHub profile README
- [ ] Update GitHub repo description with website link
- [ ] Add to LinkedIn profile projects section
- [ ] Create Twitter/X account @SeekFirstBible
- [ ] Create Facebook Page
- [ ] Post launch announcement on personal social media

### Week 3-4

- [ ] Write Dev.to article about building the app
- [ ] Submit to Product Hunt
- [ ] Post in r/Christianity
- [ ] Post in r/Bible
- [ ] Answer Bible questions on Quora with relevant links

### Month 2

- [ ] Submit to Christian app directories
- [ ] Contact 5 Bible study blogs for features
- [ ] Write guest post for Christian tech blog
- [ ] Engage on Christianity Stack Exchange

### Month 3+

- [ ] Create weekly devotional content
- [ ] Partner with churches
- [ ] YouTube demo videos
- [ ] Podcast interviews

## 📝 Content Calendar (Optional)

Share Bible verses regularly to build traffic:

**Daily Twitter Posts:**

- Monday: Wisdom (Proverbs)
- Tuesday: Encouragement (Psalms)
- Wednesday: Teaching (Gospels)
- Thursday: Grace (Paul's Letters)
- Friday: Hope (Prophets)
- Saturday: Worship (Psalms)
- Sunday: Salvation (Various)

**Format:**

```
📖 [Book] [Chapter]:[Verse]

"[Verse text]"

Read the full chapter: [Link]

#Bible #Scripture #Devotional
```

## 🎯 Success Criteria

After 30 days, you should see:

- ✅ 100+ pages indexed in Google
- ✅ Social links generating rich previews
- ✅ 5-10 backlinks from quality sources
- ✅ Some search impressions for Bible keywords

After 90 days:

- ✅ 500+ pages indexed
- ✅ Organic search traffic starting
- ✅ 20+ backlinks
- ✅ Ranking for long-tail keywords

## 🆘 Troubleshooting

**Social previews not working?**

- Clear cache using debugger tools
- Wait 24 hours and try again
- Verify og-image file exists and is accessible
- Check file size is < 5MB

**Sitemap not appearing in Search Console?**

- Verify XML is valid
- Check robots.txt references it correctly
- Wait 24-48 hours for initial processing

**Pages not getting indexed?**

- Verify robots.txt allows crawling
- Check for noindex tags
- Ensure pages are linked from homepage
- Request indexing manually

**WWW redirect not working?**

- Check middleware.ts is deployed
- Verify DNS has both www and apex records
- Test in incognito mode
- Check hosting platform settings

## 📚 Reference Documentation

- Full SEO guide: `docs/SEO_IMPLEMENTATION.md`
- Open Graph image guide: `docs/OG_IMAGE_GUIDE.md`
- Implementation summary: `docs/SOCIAL_SHARING_SUMMARY.md`
- This checklist: `docs/DEPLOYMENT_CHECKLIST.md`

---

**Ready to Deploy!** 🚀

Once you create the Open Graph image, you're good to go. Everything else is complete and tested.
