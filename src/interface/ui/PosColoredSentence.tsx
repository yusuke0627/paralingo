import React from 'react';
import { Text, YStack } from 'tamagui';
import { PosToken } from '../../domain/entities';

interface PosColoredSentenceProps {
  text: string;
  posTokens?: PosToken[];
  sentenceIndex: number;
  showSlashGuide?: boolean;
}

const CLAUSE_TRIGGER_WORDS = new Set([
  'that',
  'which',
  'who',
  'whom',
  'whose',
  'when',
  'where',
  'because',
  'if',
  'although',
  'while',
  'but',
  'or',
]);

const getTokenWord = (token: PosToken | undefined): string => {
  if (!token) return '';
  return token.text.replace(/\s+/g, ' ').trim();
};

export const PosColoredSentence: React.FC<PosColoredSentenceProps> = ({ text, posTokens, sentenceIndex, showSlashGuide = false }) => {
  // Keep the current prop shape for compatibility even though sentenceIndex is not used here.
  void sentenceIndex;

  const getColorForPos = (pos: string): string | undefined => {
    switch (pos) {
      case 'Noun':
      case 'Pronoun':
        return '#82b1ff';
      case 'Verb':
        return '#ff8a65';
      case 'Adjective':
        return '#aed581';
      case 'Adverb':
        return '#ce93d8';
      case 'Preposition':
      case 'Conjunction':
        return '#9e9e9e';
      case 'Interjection':
        return '#ffd54f';
      case 'Article':
        return '#bdbdbd';
      default:
        return undefined;
    }
  };

  if (!posTokens || posTokens.length === 0) {
    return <Text>{text}</Text>;
  }

  return (
    <YStack paddingTop="$1" paddingBottom="$1" position="relative">
      <Text lineHeight="$5">
        {posTokens.flatMap((token, i) => {
          const color = getColorForPos(token.pos);
          const word = getTokenWord(token).toLowerCase();
          const prevToken = posTokens[i - 1];
          const prevWord = getTokenWord(prevToken);
          const isWordToken = /^[a-z][a-z'-]*$/i.test(word);
          const isClauseTrigger = token.pos === 'Conjunction' || CLAUSE_TRIGGER_WORDS.has(word);
          const shouldSlashBefore = showSlashGuide && i > 0 && isWordToken && isClauseTrigger
            && prevWord !== ',' && prevWord !== ';' && prevWord !== ':';
          const shouldSlashAfter = showSlashGuide && (word === ',' || word === ';' || word === ':');

          const chunks: React.ReactNode[] = [];
          if (shouldSlashBefore) {
            chunks.push(
              <Text key={`slash-before-${i}`} color="#7dd3fc" fontWeight="700">
                {' / '}
              </Text>
            );
          }

          chunks.push(
            <Text key={`token-${i}`} color={color || '$color'}>
              {token.text}
            </Text>
          );

          if (shouldSlashAfter) {
            chunks.push(
              <Text key={`slash-after-${i}`} color="#7dd3fc" fontWeight="700">
                {' / '}
              </Text>
            );
          }

          return chunks;
        })}
      </Text>
    </YStack>
  );
};
