import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { SQLiteVocabRepository } from './SQLiteVocabRepository';

describe('SQLiteVocabRepository review persistence', () => {
  it('stores and loads review posTokens', async () => {
    const dbDir = mkdtempSync(path.join(tmpdir(), 'paralingo-review-db-'));
    const dbPath = path.join(dbDir, 'review.sqlite');
    const repo = new SQLiteVocabRepository(dbPath);

    const posTokens = [
      { text: 'This', pos: 'Pronoun' as const },
      { text: ' ', pos: 'Other' as const },
      { text: 'works', pos: 'Verb' as const },
      { text: '.', pos: 'Punctuation' as const },
    ];

    await repo.saveReview({
      en: 'This works.',
      ja: 'これは動作します。',
      posTokens,
      reason: 'later',
      status: 'pending',
      createdAt: new Date(),
    });

    const rows = await repo.listReviews('pending');
    expect(rows).toHaveLength(1);
    expect(rows[0].posTokens).toEqual(posTokens);
  });
});
