import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeDomain, normalizeProfileUrl, generateProspectFingerprint, isDuplicateProspect } from './dedup';

test('normalizeDomain extracts clean domain without protocol or path', () => {
  assert.equal(normalizeDomain('https://www.stripe.com/docs/api'), 'stripe.com');
  assert.equal(normalizeDomain('http://sub.domain.co.uk:8080/path?arg=1'), 'sub.domain.co.uk');
  assert.equal(normalizeDomain('company.io/'), 'company.io');
});

test('normalizeProfileUrl normalizes LinkedIn profile links', () => {
  assert.equal(
    normalizeProfileUrl('http://www.linkedin.com/in/alex-chen/?ref=xyz'),
    'https://linkedin.com/in/alex-chen'
  );
});

test('isDuplicateProspect detects duplicates across names and linkedin URLs', () => {
  const existing = [
    {
      name: 'Elena Rostova',
      company: 'Datacore Systems',
      domain: 'datacore.io',
      linkedinUrl: 'https://linkedin.com/in/elena-rostova',
    },
  ];

  // Exact same linkedin URL
  assert.equal(
    isDuplicateProspect(
      { name: 'Elena R.', company: 'Datacore', linkedinUrl: 'https://www.linkedin.com/in/elena-rostova/' },
      existing
    ),
    true
  );

  // Same name & company
  assert.equal(
    isDuplicateProspect(
      { name: 'Elena Rostova', company: 'Datacore Systems', domain: 'datacore.io' },
      existing
    ),
    true
  );

  // Different prospect
  assert.equal(
    isDuplicateProspect(
      { name: 'Marcus Vance', company: 'HyperScale', domain: 'hyperscale.com' },
      existing
    ),
    false
  );
});
