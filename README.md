# Coy Discover

A mobile-first swipe discovery app built for the Coy SDE Intern assignment.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. The React app runs on Vite and the Express API runs on port 3001.

## Production

```bash
npm run build
npm start
```

Open `http://localhost:3001`.

## Features

- 30 seeded profiles
- Touch drag gestures and desktop pass/like buttons
- Swipe animations and clear like/pass feedback
- Persistent swipes and mutual matches using `server/data/state.json`
- Match celebration modal
- Matches screen with mutual matches only
- Empty feed state
- Placeholder Home tab

## API

- `GET /feed` - profiles that have not been swiped
- `POST /swipe` - body: `{ "profileId": "p1", "action": "like" }`
- `GET /matches` - all mutual matches
