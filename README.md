# Notable Dinner Guests

Bring history's greatest minds to your table. Select 2-5 historical figures and watch them converse on topics you choose.

## Setup

This app requires a local web server to run (browsers block API requests from files opened directly).

### Steps to Run

1. Open **Terminal**
2. Navigate to the app folder:
   ```
   cd "/Users/chadtimblin/My Drive/Create/4. Apps/Notable Dinner Guests"
   ```
3. Start the local server:
   ```
   python3 -m http.server 8000
   ```
4. Open http://localhost:8000 in your browser

### First-Time Setup

You'll need a free Google Gemini API key:
1. Go to https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Paste the key into the app

## Features

- 11 historical figures including Walt Whitman, Carl Sagan, Marcus Aurelius, and more
- 12 preset conversation topics (or create your own)
- Conversations grounded in real source material from Wikiquote, Open Library, and Project Gutenberg
- Responsive design for desktop and mobile

## Project Structure

```
Notable Dinner Guests/
├── index.html
├── css/
│   └── styles.css
└── js/
    ├── guests.js    # Historical figures data
    ├── topics.js    # Conversation topics & prompt building
    ├── sources.js   # Wikiquote, Open Library, Gutenberg APIs
    ├── api.js       # Gemini API integration
    └── app.js       # Main application logic
```

## Deployment

The app is hosted on GitHub Pages at: https://spongetimblin.github.io/notable-dinner-guests/

**To update the live site after making changes:**
Ask Claude to "commit and push my changes" and it will handle the Git commands for you.
