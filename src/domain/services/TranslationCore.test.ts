import { describe, expect, it } from 'vitest';
import { TranslationCore } from './TranslationCore';

describe('TranslationCore.splitIntoSentences', () => {
  it('treats each non-empty line as one sentence when newlines exist', () => {
    const core = new TranslationCore();
    const result = core.splitIntoSentences('\n  This is a pen.\n\nBut this is not mine. \n  ');

    expect(result).toEqual(['This is a pen.', 'But this is not mine.']);
  });

  it('falls back to punctuation splitting for a single-line paragraph', () => {
    const core = new TranslationCore();
    const result = core.splitIntoSentences('This is a pen. But this is not mine.');

    expect(result).toEqual(['This is a pen.', 'But this is not mine.']);
  });

  it('keeps bullet-like lines as separate sentences even without punctuation', () => {
    const core = new TranslationCore();
    const result = core.splitIntoSentences('A short heading\nAnother bullet line\nFinal bullet');

    expect(result).toEqual(['A short heading', 'Another bullet line', 'Final bullet']);
  });
});
