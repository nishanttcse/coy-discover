import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3001;
const profilesPath = path.join(__dirname, 'data', 'profiles.json');
const statePath = path.join(__dirname, 'data', 'state.json');

app.use(express.json());

const profiles = JSON.parse(fs.readFileSync(profilesPath, 'utf8'));
const seededLikes = new Set(['p2', 'p4', 'p6', 'p9', 'p10', 'p12', 'p16', 'p20', 'p24', 'p30']);

function readState() {
  if (!fs.existsSync(statePath)) {
    const initial = { swipes: {} };
    fs.mkdirSync(path.dirname(statePath), { recursive: true });
    fs.writeFileSync(statePath, JSON.stringify(initial, null, 2));
  }
  return JSON.parse(fs.readFileSync(statePath, 'utf8'));
}

function writeState(state) {
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
}

app.get('/feed', (_req, res) => {
  const state = readState();
  const feed = profiles.filter((profile) => !state.swipes[profile.id]);
  res.json(feed);
});

app.post('/swipe', (req, res) => {
  const { profileId, action } = req.body;
  if (!profiles.some((profile) => profile.id === profileId)) {
    return res.status(404).json({ error: 'Profile not found' });
  }
  if (!['like', 'pass'].includes(action)) {
    return res.status(400).json({ error: 'Action must be like or pass' });
  }

  const state = readState();
  state.swipes[profileId] = action;
  writeState(state);

  const match = action === 'like' && seededLikes.has(profileId);
  res.json({ match });
});

app.get('/matches', (_req, res) => {
  const state = readState();
  const matches = profiles.filter(
    (profile) => state.swipes[profile.id] === 'like' && seededLikes.has(profile.id)
  );
  res.json(matches);
});

if (process.env.NODE_ENV === 'production') {
  const distPath = path.resolve(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  app.get(/^(?!\/(?:feed|swipe|matches)$).*$/, (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Coy API listening on http://localhost:${port}`);
});
