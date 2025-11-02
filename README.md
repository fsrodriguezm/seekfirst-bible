# SeekFirst Bible Study Web App

A modern React web application for Bible study with search functionality and AI-powered explanations.

## Features

- **Bible Reading**: Browse through different Bible versions (KJV, NIV, ESV, NLT, NASB, NKJV)
- **Search**: Search for verses across the entire Bible with highlighted results
- **Verse Selection**: Click verses to select them for explanation
- **AI Explanations**: Get detailed biblical explanations using grammatical-historical exegesis
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Navigate to the project directory:

   ```bash
   cd seekfirst-bible
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and visit `http://localhost:3000`

### Building for Production

To build the app for production:

```bash
npm run build
```

The production build outputs to the `.next` directory. To preview the production build locally, run:

```bash
npm run start
```

### Deployment

You can deploy this Next.js app to any platform that supports Node.js:

- Vercel (recommended)
- Netlify (Next.js runtime)
- Cloudflare Pages Functions
- AWS Amplify / Elastic Beanstalk

## Technology Stack

- **React** - Frontend framework
- **Next.js** - React framework and build pipeline
- **CSS3** - Styling with modern features
- **Lucide React** - Icon library
- **Groq API** - AI-powered explanations

## Project Structure

```
src/
├── App.jsx                     # Main app component
├── App.css                     # App-level styles
├── index.css                   # Global styles
├── styles/                     # Responsive styles
├── components/                 # UI building blocks
├── contexts/                   # React contexts
├── hooks/                      # Custom hooks
└── utils/                      # Utility helpers

pages/
├── _app.jsx                    # Global styles and top-level wrapper
└── index.jsx                   # Home page entry point

public/
├── favicon.svg                 # Static assets exposed publicly
└── videos/                     # Background video loops

data/
├── bibles/                     # Bible JSON assets served via API
└── resources/                  # Supplementary JSON/DB datasets served via API

```

## Features in Detail

### Bible Reading

- Select from multiple Bible versions
- Navigate by book and chapter
- Previous/next chapter navigation
- Responsive verse display

### Search

- Full-text search across all Bible versions
- Highlighted search terms in results
- Click to navigate to specific verses
- Search result highlighting

### AI Explanations

- Select multiple verses for explanation
- AI-powered exegesis using Groq API
- Structured explanations with sections:
  - Historical context
  - Original language insights
  - Word studies
  - Cross-references
  - Applications
- Copy explanations to clipboard

## API Configuration

The app uses the Groq API for explanations. The API key is currently hardcoded for demo purposes. For production use, you should:

1. Move the API key to environment variables
2. Consider implementing a backend proxy for API calls
3. Add proper error handling and rate limiting

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

This is part of the SeekFirst iOS app project. See the main project for contribution guidelines.

## License

See the main SeekFirst project for license information.
