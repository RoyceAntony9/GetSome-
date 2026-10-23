import test from 'node:test';
import assert from 'node:assert/strict';
import { validateOutreachContent, CHANNEL_LIMITS } from './channelValidator';

test('channelValidator respects LinkedIn Connection 300 character limit', () => {
  const shortNote = "Loved your keynote at FinTech Summit on cloud migration. Would love to connect.";
  const res = validateOutreachContent('linkedin_connect', shortNote);
  assert.equal(res.isValid, true);
  assert.equal(res.characterCount, shortNote.length);
  assert.equal(res.maxAllowed, 300);

  const longNote = 'A'.repeat(305);
  const resOver = validateOutreachContent('linkedin_connect', longNote);
  assert.equal(resOver.isValid, false);
  assert.ok(resOver.warnings.some(w => w.includes('exceeds channel limit')));
});

test('channelValidator detects banned generic AI phrases', () => {
  const draft = "Hi Sarah, I hope this message finds you well! We build amazing AI tools.";
  const res = validateOutreachContent('email', draft, 'Quick question');
  assert.equal(res.isValid, false);
  assert.ok(res.bannedPhrasesFound.includes('i hope this message finds you well'));
});

test('channelValidator validates email subject lines and body limits', () => {
  const goodBody = "We tracked the recent announcement regarding your core banking API overhaul. Here is how teams reduce sync latency.";
  const goodSubject = "Question on API latency at Stripe";
  const res = validateOutreachContent('email', goodBody, goodSubject);
  assert.equal(res.isValid, true);
  assert.equal(res.subjectCharacterCount, goodSubject.length);

  const longSubject = 'A'.repeat(100);
  const badSubjectRes = validateOutreachContent('email', goodBody, longSubject);
  assert.equal(badSubjectRes.isValid, false);
});
