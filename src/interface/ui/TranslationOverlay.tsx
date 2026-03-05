import React, { useState, useEffect } from 'react';
import { PosColoredSentence } from './PosColoredSentence';
// Note: Assuming Tamagui components are available in the project setup
// import { View, Text, ScrollView, Button, XStack, YStack } from 'tamagui';

export const TranslationOverlay: React.FC = () => {
  const [results, setResults] = useState<{ en: string, ja: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listen for translation results via IPC
    if (window.paralingo) {
      window.paralingo.onTranslationResult((result: any) => {
        if (result.ok) {
          setResults(result.sentences);
          setError(null);
        } else {
          setError(result.error);
        }
      });
    }
  }, []);

  const handleSave = (en: string, ja: string) => {
    if (window.paralingo) {
      window.paralingo.saveVocab({
        term: en,
        translation: [ja],
        content: [results.map(r => r.en).join(' ')],
        createdAt: new Date()
      });
    }
  };

  return (
    <div style={{ padding: 20, backgroundColor: '#1a1a1a', color: 'white', borderRadius: 8 }}>
      <h1 style={{ fontSize: 18, marginBottom: 16 }}>ParaLingo Translation</h1>

      {error && <p style={{ color: '#ff6b6b' }}>{error}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {results.map((pair, index) => (
          <div key={index} style={{ borderBottom: '1px solid #333', paddingBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 'bold', margin: 0, fontSize: '1.1em' }}>
                  <PosColoredSentence text={pair.en} />
                </p>
                <p style={{ color: '#aaa', margin: '4px 0 0 0' }}>{pair.ja}</p>
              </div>
              <button
                onClick={() => handleSave(pair.en, pair.ja)}
                style={{ marginLeft: 12, padding: '4px 8px', cursor: 'pointer' }}
              >
                Save
              </button>
            </div>
          </div>
        ))}
      </div>

      {results.length === 0 && !error && <p>Waiting for translation... (Press Cmd+Shift+T)</p>}
    </div>
  );
};
