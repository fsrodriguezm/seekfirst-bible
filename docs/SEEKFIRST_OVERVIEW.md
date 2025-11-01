# SeekFirst Bible Study Web App

## Overview

SeekFirst is a modern, responsive web application designed for rich, contextual Bible study. The app emphasizes seeking "first the kingdom of God and his righteousness" (Matthew 6:33) by providing believers with intuitive tools to explore Scripture across multiple Bible translations with integrated search, cross-references, and AI-powered insights.

## Core Features

### 📖 Bible Reading & Navigation

**Multiple Bible Versions:** Support for 30+ English and Spanish translations including:

- King James Version (KJV)
- New King James Version (NKJV)
- English Standard Version (ESV)
- New American Standard Bible (NASB)
- New International Version (NIV)
- Spanish Reina-Valera (RVR1960), Nueva Traducción Viviente (NTV), and more

**Key Features:**

- **Intuitive Navigation:** Select books, chapters, and verses with easy-to-use dropdown controls
- **Previous/Next Chapter Navigation:** Quick navigation buttons for seamless reading flow
- **Book Timeline:** Visual timeline showing the structure and historical progression of each book
- **Responsive Verse Display:** Clean, readable verse formatting with customizable font sizes

### 🔍 Advanced Search

- **Full-Text Search:** Search across entire Bible versions for keywords and phrases
- **Bible Reference Parsing:** Supports multiple Bible reference formats:
  - `Mat 2:3` - Navigate to Matthew chapter 2, verse 3
  - `Rev 2:1-5` - Navigate to Revelation chapter 2, verse 1-5
  - Book name abbreviations (Mat, Matt, Rev, etc.)
- **Smart Detection:** Automatically distinguishes between Bible references and keyword searches
- **Search Results Panel:** Integrated results display with direct navigation links
- **Book Name Suggestions:** Auto-complete dropdown for book name suggestions while typing

### ✏️ Verse Selection & Annotation

- **Multi-Verse Selection:** Click verses to select multiple verses for study
- **Copy to Clipboard:** Copy selected verses in formatted text with references
- **Visual Feedback:** Selected verses are highlighted and counted
- **Verse Selection Lock:** Lock current verse selection while scrolling through cross-references
- **Selected Verse Count:** Real-time display of how many verses are selected

### 🔴 Red Letter Edition

- **Jesus' Words Highlighting:** Verses where Jesus speaks are highlighted in red
- **God's Words:** Option to highlight verses where God speaks (Old Testament)
- **Toggle Controls:** Easy on/off toggle for red letter mode
- **Multi-Language Support:** Works with both English and Spanish Bible versions

### 📚 Cross-References

- **Interactive Cross-Reference Panel:** Click on verses to see related passages
- **SQLite Database:** Efficient lookup using indexed cross-reference databases
- **Verse Linking:** Navigate directly to related verses with one click
- **Context Preservation:** Maintains current reading position while exploring references
- **Cross-Reference Lock:** Keep a verse's references visible while scrolling

### 💡 Explanation & Commentary

- **AI-Powered Exegesis:** Get detailed biblical explanations using grammatical-historical hermeneutics
- **Multi-Verse Explanations:** Select multiple verses to understand their relationship
- **Structured Analysis:** Explanations organized into sections:
  - Historical & cultural context
  - Original language insights (Hebrew, Greek, Aramaic)
  - Word studies with lexical data
  - Cross-references and thematic connections
  - Modern applications and implications
- **Language Support:** Explanations available in English and Spanish
- **Toggle Panel:** Show/hide explanation panel on demand

### 🎨 User Experience

- **Dark/Light Theme Toggle:** Seamless theme switching with persistent preferences
- **Font Size Controls:** Increase/decrease font size for comfortable reading
- **Persistent State:** Remembers last viewed book, chapter, and preferences via localStorage
- **Responsive Design:** Optimized layouts for desktop, tablet, and mobile devices
- **Smooth Animations:** Elegant transitions and visual feedback throughout the app

### 🌐 Multilingual Support

- **Bilingual Interface:** Full support for English and Spanish
- **Language Detection:** Automatically detects Bible version language
- **Book Name Translation:** Automatic mapping between English and Spanish book names
- **URL-Based Language:** Routes support `/en/` and `/es/` language prefixes

### 📱 Technical Features

- **Clean URL Structure:** SEO-friendly routes like `/en/KJV/Matthew/24/3`
- **URL Canonicalization:** Automatic 301 redirects to standardized URL format
- **Server-Side Rendering:** Next.js SSR for fast initial page loads
- **API Routes:** Backend API for Bible data, resources, and cross-references
- **Caching Strategy:** Efficient caching for Bible translations and metadata

### 📊 Reference Data

- **"Jesus Revealed" Annotations:** Book-level descriptions showing how Jesus is revealed throughout Scripture
- **Book Metadata:** Historical and contextual information about each biblical book
- **Bible Licensing:** Proper attribution and licensing information displayed for each translation
- **Cross-Reference Database:** Comprehensive cross-reference data from Treasury of Scripture Knowledge (OpenBible.info)

### 🔗 Additional Resources

- **Curated Study Links:** "Start Here" section with key passages for new believers:
  - John 3 - Being born again
  - Romans 3 - All have sinned
  - Romans 5 - Christ died for us
  - Romans 8 - Life in the Spirit
- **About & License Pages:** Information about the project and scripture credits
- **Feedback Form:** Easy way for users to share suggestions and report issues
- **No Ads, No Donations:** Free, ad-free study experience

## Technology Stack

- **Frontend:** React with TypeScript
- **Framework:** Next.js (App Router & Pages Router)
- **Styling:** CSS3 with responsive design patterns
- **Icons:** Lucide React
- **State Management:** React Hooks & Context API
- **Database:** SQLite for cross-references
- **API Backend:** Node.js API routes
- **Deployment Ready:** Vercel, Netlify, or self-hosted

## Design Philosophy

SeekFirst emphasizes:

- **Theological Neutrality:** Scholarly, unbiased approaches to Scripture
- **User Agency:** All features are optional and customizable
- **Accessibility:** Clean, readable interface with high contrast
- **Performance:** Fast loading times and smooth interactions
- **Simplicity:** Focus on Scripture without distraction
- **Freedom:** No paywalls, ads, or tracking—shared freely for God's glory

## Getting Started

Visit [http://seekfirst.com](http://seekfirst.com) to begin your Bible study journey.

---

> **Mission:** "Seek first the kingdom of God and his righteousness, and all these things will be added to you." — Matthew 6:33
