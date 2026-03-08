import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { ClipboardPort } from '../application/ports/ClipboardPort';
import { RunTranslationFromClipboard } from '../application/use-cases/RunTranslationFromClipboard';
import { TranslationPair } from '../domain/entities';
import { SQLiteVocabRepository } from '../infrastructure/db/SQLiteVocabRepository';

class FakeClipboardPort implements ClipboardPort {
  constructor(private value: string) {}

  async readText(): Promise<string> {
    return this.value;
  }

  async writeText(text: string): Promise<void> {
    this.value = text;
  }
}

class FakeTranslatorGateway {
  public lastInput = '';

  async translate(text: string): Promise<TranslationPair[]> {
    this.lastInput = text;
    return [
      {
        en: text,
        ja: 'テスト訳',
        posTokens: [
          { text: 'This', pos: 'Pronoun' },
          { text: ' ', pos: 'Other' },
          { text: 'is', pos: 'Verb' },
          { text: ' ', pos: 'Other' },
          { text: 'a', pos: 'Article' },
          { text: ' ', pos: 'Other' },
          { text: 'pen', pos: 'Noun' },
          { text: '.', pos: 'Punctuation' },
        ],
      },
    ];
  }
}

describe('reading to review flow smoke test', () => {
  it('translates clipboard text and moves one item from pending to resolved', async () => {
    const clipboard = new FakeClipboardPort('\n  This is a pen.  \n');
    const translator = new FakeTranslatorGateway();
    const useCase = new RunTranslationFromClipboard(clipboard, translator);
    const pairs = await useCase.execute();

    expect(translator.lastInput).toBe('This is a pen.');
    expect(pairs).toHaveLength(1);

    const dbDir = mkdtempSync(path.join(tmpdir(), 'paralingo-smoke-db-'));
    const dbPath = path.join(dbDir, 'smoke.sqlite');
    const repo = new SQLiteVocabRepository(dbPath);

    await repo.saveReview({
      en: pairs[0].en,
      ja: pairs[0].ja,
      posTokens: pairs[0].posTokens,
      reason: 'later',
      status: 'pending',
      createdAt: new Date(),
    });

    const pending = await repo.listReviews('pending');
    expect(pending).toHaveLength(1);

    await repo.updateReviewStatus(pending[0].id!, 'resolved');

    const resolved = await repo.listReviews('resolved');
    expect(resolved).toHaveLength(1);
    expect(resolved[0].en).toBe('This is a pen.');
  });
});
