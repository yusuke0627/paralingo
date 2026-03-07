import { describe, expect, it } from 'vitest';
import { TranslationCore } from './TranslationCore';

describe('TranslationCore.splitIntoSentences', () => {
  it('trims edges, collapses newlines, and removes empty sentences', () => {
    const core = new TranslationCore();
    const result = core.splitIntoSentences('\n  This is a pen.\n\nBut this is not mine. \n\n');

    expect(result).toEqual(['This is a pen.', 'But this is not mine.']);
  });
});
