import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('seed has at least 30 profiles', () => {
  const profiles = JSON.parse(fs.readFileSync(new URL('./data/profiles.json', import.meta.url), 'utf8'));
  assert.ok(profiles.length >= 30);
});

test('every profile has required fields', () => {
  const profiles = JSON.parse(fs.readFileSync(new URL('./data/profiles.json', import.meta.url), 'utf8'));
  for (const profile of profiles) {
    assert.ok(profile.name);
    assert.ok(profile.age);
    assert.ok(profile.photo);
    assert.ok(profile.bio);
    assert.ok(profile.city);
    assert.ok(Array.isArray(profile.interests));
  }
});
