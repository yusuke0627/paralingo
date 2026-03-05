import React, { useState, useEffect } from 'react';
import { YStack, XStack, Text, Card, Button, ScrollView, Separator, Theme } from 'tamagui';
import { Save, Copy, CheckCircle } from '@tamagui/lucide-icons';
import { PosColoredSentence } from './PosColoredSentence';

interface TranslationPair {
  en: string;
  ja: string;
}

export const TranslationOverlay: React.FC = () => {
  const [pairs, setPairs] = useState<TranslationPair[]>([]);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    // @ts-ignore - paralingo is exposed via preload script
    if (window.paralingo) {
      window.paralingo.onTranslationResult((result: any) => {
        setPairs(result.pairs);
        setSavedIds(new Set());
      });
    }
  }, []);

  const handleSave = async (pair: TranslationPair, index: number) => {
    // @ts-ignore
    await window.paralingo.saveVocab(pair.en, pair.ja);
    setSavedIds(prev => new Set(prev).add(index));
  };

  if (pairs.length === 0) {
    return (
      <Theme name="dark">
        <YStack f={1} jc="center" ai="center" bg="$background05" br="$6" p="$4" space>
          <Text color="$color10" italic>Copy English text to translate...</Text>
        </YStack>
      </Theme>
    );
  }

  return (
    <Theme name="dark">
      <Card
        f={1}
        bg="$background"
        br="$6"
        elevate
        bordered
        animation="bouncy"
        enterStyle={{ opacity: 0, scale: 0.9, y: 10 }}
        shadowColor="$shadowColor"
        shadowRadius={20}
      >
        <ScrollView p="$4">
          <YStack space="$4">
            {pairs.map((pair, index) => (
              <YStack key={index} space="$2">
                <XStack jc="space-between" ai="flex-start" space>
                  <YStack f={1} space="$1">
                    <Text fontSize="$6" fontWeight="700" lineHeight="$6">
                      <PosColoredSentence text={pair.en} />
                    </Text>
                    <Text color="$color11" fontSize="$4" lineHeight="$4">
                      {pair.ja}
                    </Text>
                  </YStack>

                  <XStack space="$2">
                    <Button
                      size="$3"
                      circular
                      icon={savedIds.has(index) ? <CheckCircle color="$green10" /> : <Save />}
                      chromeless
                      onPress={() => handleSave(pair, index)}
                      disabled={savedIds.has(index)}
                      opacity={savedIds.has(index) ? 0.5 : 1}
                    />
                  </XStack>
                </XStack>
                {index < pairs.length - 1 && <Separator borderColor="$borderColor" opacity={0.5} />}
              </YStack>
            ))}
          </YStack>
        </ScrollView>

        <Card.Footer p="$3" b={0}>
          <XStack f={1} jc="flex-end" space="$2">
            <Button size="$2" themeInverse circular icon={<Copy size={12} />} chromeless />
          </XStack>
        </Card.Footer>
      </Card>
    </Theme>
  );
};
