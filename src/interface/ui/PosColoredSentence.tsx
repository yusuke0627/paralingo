import React from 'react';
import nlp from 'compromise';

interface PosColoredSentenceProps {
  text: string;
}

export const PosColoredSentence: React.FC<PosColoredSentenceProps> = ({ text }) => {
  // Parse the sentence using compromise
  const doc = nlp(text);

  // Get all terms (words and punctuation)
  const terms = doc.terms().out('array');
  const details = doc.terms().json();

  // Helper function to map POS tags to colors
  const getColorForTags = (tags: string[]): string | undefined => {
    if (tags.includes('Noun')) return '#82b1ff'; // Blue
    if (tags.includes('Verb')) return '#ff8a65'; // Orange
    if (tags.includes('Adjective')) return '#aed581'; // Green
    if (tags.includes('Adverb')) return '#ce93d8'; // Purple
    if (tags.includes('Preposition') || tags.includes('Conjunction')) return '#9e9e9e'; // Gray
    return undefined; // Default color
  };

  return (
    <span style={{ lineHeight: 1.5 }}>
      {details.map((termDetail: any, i: number) => {
        // Find the specific term inside the detail object
        const term = termDetail.terms?.[0];
        if (!term) return <React.Fragment key={i}>{termDetail.text}</React.Fragment>;

        const color = getColorForTags(term.tags);

        return (
          <span key={i}>
            <span style={{ color: color || 'inherit', transition: 'color 0.2s' }} title={term.tags.join(', ')}>
              {term.text}
            </span>
            {term.post && <span>{term.post}</span>}
          </span>
        );
      })}
    </span>
  );
};
