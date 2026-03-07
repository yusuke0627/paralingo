import React, { useState, useEffect } from 'react';
import { YStack, XStack, Text, ScrollView, Separator, Button, Theme, Spinner } from 'tamagui';
import { X, ExternalLink, Bookmark, Check } from '@tamagui/lucide-icons';
import { TranslationPair } from '../../domain/entities';
import { PosColoredSentence } from './PosColoredSentence';

interface PosLegendProps {
  slashGuideEnabled: boolean;
  onToggleSlashGuide: () => void;
}

const PosLegend: React.FC<PosLegendProps> = ({
  slashGuideEnabled,
  onToggleSlashGuide,
}) => (
  <YStack backgroundColor="$background02" borderTopWidth={1} borderColor="$borderColor">
    <XStack flexWrap="wrap" gap="$2" paddingHorizontal="$3" paddingTop="$2" paddingBottom="$1.5" justifyContent="center" alignItems="center">
      <XStack alignItems="center" gap="$2" backgroundColor="#82b1ff20" paddingHorizontal="$2" paddingVertical="$1" borderRadius="$4"><div style={{ width: 8, height: 8, backgroundColor: '#82b1ff', borderRadius: 4 }} /><Text fontSize="$3" color="#82b1ff" fontWeight="bold">名詞/代名詞</Text></XStack>
      <XStack alignItems="center" gap="$2" backgroundColor="#ff8a6520" paddingHorizontal="$2" paddingVertical="$1" borderRadius="$4"><div style={{ width: 8, height: 8, backgroundColor: '#ff8a65', borderRadius: 4 }} /><Text fontSize="$3" color="#ff8a65" fontWeight="bold">動詞</Text></XStack>
      <XStack alignItems="center" gap="$2" backgroundColor="#aed58120" paddingHorizontal="$2" paddingVertical="$1" borderRadius="$4"><div style={{ width: 8, height: 8, backgroundColor: '#aed581', borderRadius: 4 }} /><Text fontSize="$3" color="#aed581" fontWeight="bold">形容詞</Text></XStack>
      <XStack alignItems="center" gap="$2" backgroundColor="#ce93d820" paddingHorizontal="$2" paddingVertical="$1" borderRadius="$4"><div style={{ width: 8, height: 8, backgroundColor: '#ce93d8', borderRadius: 4 }} /><Text fontSize="$3" color="#ce93d8" fontWeight="bold">副詞</Text></XStack>
      <XStack alignItems="center" gap="$2" backgroundColor="#9e9e9e20" paddingHorizontal="$2" paddingVertical="$1" borderRadius="$4"><div style={{ width: 8, height: 8, backgroundColor: '#9e9e9e', borderRadius: 4 }} /><Text fontSize="$3" color="#9e9e9e" fontWeight="bold">前置詞/接続詞</Text></XStack>
      <XStack alignItems="center" gap="$2" backgroundColor="#ffd54f20" paddingHorizontal="$2" paddingVertical="$1" borderRadius="$4"><div style={{ width: 8, height: 8, backgroundColor: '#ffd54f', borderRadius: 4 }} /><Text fontSize="$3" color="#ffd54f" fontWeight="bold">間投詞</Text></XStack>
      <XStack alignItems="center" gap="$2" backgroundColor="#bdbdbd20" paddingHorizontal="$2" paddingVertical="$1" borderRadius="$4"><div style={{ width: 8, height: 8, backgroundColor: '#bdbdbd', borderRadius: 4 }} /><Text fontSize="$3" color="#bdbdbd" fontWeight="bold">冠詞</Text></XStack>
    </XStack>

    <XStack paddingHorizontal="$3" paddingBottom="$2" gap="$2" justifyContent="center" alignItems="center" flexWrap="wrap">
      <Button
        size="$2"
        theme={slashGuideEnabled ? 'green' : undefined}
        onPress={onToggleSlashGuide}
        pressStyle={{ opacity: 0.85, scale: 0.98 }}
      >
        {slashGuideEnabled ? 'スラッシュガイド: ON' : 'スラッシュガイド: OFF'}
      </Button>
    </XStack>
  </YStack>
);

export const TranslationOverlay: React.FC = () => {
  const [pairs, setPairs] = useState<TranslationPair[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedIndexes, setSavedIndexes] = useState<number[]>([]);
  const [slashGuideEnabled, setSlashGuideEnabled] = useState(true);
  const [reviewSavedKeys, setReviewSavedKeys] = useState<string[]>([]);
  const [reviewStatusMessage, setReviewStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    // @ts-ignore
    if (window.paralingo) {
      // @ts-ignore
      window.paralingo.onTranslationResult((data: any) => {
        if (data.loading) {
          setLoading(true);
          setPairs([]);
          setError(null);
          setSavedIndexes([]);
          setReviewSavedKeys([]);
          setReviewStatusMessage(null);
        } else if (data.ok === false) {
          setLoading(false);
          setError(data.error);
        } else {
          setLoading(false);
          setPairs(data.pairs || []);
        }
      });
      // We don't remove listener as it's not supported by current preload
    }
  }, []);

  const handleSave = async (pair: TranslationPair, index: number) => {
    // @ts-ignore
    if (window.paralingo) {
      // @ts-ignore
      await window.paralingo.saveVocab(pair.en, pair.ja);
      setSavedIndexes(curr => [...curr, index]);
    }
  };

  const handleClose = () => {
    setPairs([]);
    setError(null);
    setLoading(false);
    setReviewSavedKeys([]);
    setReviewStatusMessage(null);
    // Note: window.paralingo.hideWindow does not exist in preload.
    // Setting state to empty array triggers the fallback UI.
  };

  const handleSaveReview = async (pair: TranslationPair, index: number) => {
    const key = `${index}-later`;
    // @ts-ignore
    if (!window.paralingo || reviewSavedKeys.includes(key)) return;
    // @ts-ignore
    if (typeof window.paralingo.saveReviewItem !== 'function') {
      setReviewStatusMessage('Review APIが未反映です。アプリ再起動後に再試行してください');
      setTimeout(() => setReviewStatusMessage(null), 2600);
      return;
    }
    setReviewStatusMessage('保存中...');
    try {
      // @ts-ignore
      const result = await window.paralingo.saveReviewItem({
        en: pair.en,
        ja: pair.ja,
        posTokens: pair.posTokens,
        reason: 'later',
      });
      if (result.ok) {
        setReviewSavedKeys((current) => [...current, key]);
        setReviewStatusMessage('「後で読む」に保存しました');
        setTimeout(() => setReviewStatusMessage(null), 1800);
        return;
      }
      setReviewStatusMessage(result.error || 'Review保存に失敗しました');
      setTimeout(() => setReviewStatusMessage(null), 2200);
    } catch (error: any) {
      setReviewStatusMessage(error?.message || 'Review保存に失敗しました');
      setTimeout(() => setReviewStatusMessage(null), 2200);
    }
  };

  const isFallback = pairs.some(p => p.isFallback);

  if (!loading && pairs.length === 0 && !error) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
        <Text color="$color10" fontStyle="italic">コピーした英文を翻訳中...</Text>
      </YStack>
    );
  }

  return (
    <Theme name="dark">
      <YStack
        flex={1}
        backgroundColor="$background"
        borderRadius="$4"
        elevation="$4"
        borderWidth={1}
        borderColor="$borderColor"
        shadowColor="$shadowColor"
        shadowRadius={20}
      >
        {loading && (
          <YStack flex={1} justifyContent="center" alignItems="center" gap="$4">
            <Spinner size="large" color="$color10" />
            <Text color="$color10">翻訳を取得中...</Text>
          </YStack>
        )}

        {error && (
          <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" gap="$4">
            <Text color="$red10" fontSize="$5" fontWeight="bold">エラーが発生しました</Text>
            <Text color="$color11" textAlign="center">{error}</Text>
            <Button onPress={handleClose}>閉じる</Button>
          </YStack>
        )}

        {!loading && !error && pairs.length > 0 && (
          <>
            {/* Fallback Warning Banner */}
            {isFallback && (
              <XStack
                backgroundColor="$yellow2"
                paddingHorizontal="$4"
                paddingVertical="$2"
                borderBottomWidth={1}
                borderColor="$yellow8"
              >
                <Text color="$yellow10" fontSize="$2" fontWeight="bold" flex={1}>
                  ⚠️ APIの上限に達したため、簡易翻訳モードで表示しています。
                </Text>
              </XStack>
            )}

            {/* Legend fixed at top area */}
            {!isFallback && (
              <PosLegend
                slashGuideEnabled={slashGuideEnabled}
                onToggleSlashGuide={() => setSlashGuideEnabled((current) => !current)}
              />
            )}

            {reviewStatusMessage && (
              <XStack paddingHorizontal="$3" paddingTop="$1.5">
                <Text color="$color10" fontSize="$2">{reviewStatusMessage}</Text>
              </XStack>
            )}

            <YStack flex={1} padding="$3" gap="$2">
              <YStack
                flex={1}
                borderWidth={1}
                borderColor="$borderColor"
                borderRadius="$4"
                overflow="hidden"
              >
                <ScrollView padding="$3">
                  <YStack gap="$2.5">
                    {pairs.map((pair, index) => {
                      return (
                        <YStack
                          key={index}
                          gap="$2"
                          padding="$2.5"
                          borderWidth={1}
                          borderRadius="$4"
                          borderColor="$borderColor"
                          backgroundColor="$background"
                        >
                          <XStack justifyContent="space-between" alignItems="flex-start" gap="$4">
                            <YStack flex={1} gap="$2">
                              <YStack paddingBottom="$1">
                                <PosColoredSentence
                                  text={pair.en}
                                  posTokens={pair.posTokens}
                                  sentenceIndex={index}
                                  showSlashGuide={slashGuideEnabled}
                                />
                              </YStack>
                              <Text color="$color11" fontSize="$4" lineHeight="$4" paddingBottom="$0.5">
                                {pair.ja}
                              </Text>
                            </YStack>

                            <YStack gap="$1.5" paddingLeft="$2" alignItems="flex-end">
                              <XStack gap="$2">
                                <Button
                                  size="$2"
                                  minWidth={30}
                                  paddingHorizontal="$1.5"
                                  onPress={() => handleSaveReview(pair, index)}
                                  disabled={reviewSavedKeys.includes(`${index}-later`)}
                                  theme={reviewSavedKeys.includes(`${index}-later`) ? 'green' : undefined}
                                  pressStyle={{ opacity: 0.85, scale: 0.98 }}
                                  title="後で読むの追加"
                                  aria-label="後で読むの追加"
                                >
                                  +
                                </Button>
                                <Button
                                  size="$2"
                                  circular
                                  icon={savedIndexes.includes(index) ? Check : Bookmark}
                                  onPress={() => handleSave(pair, index)}
                                  theme={savedIndexes.includes(index) ? 'green' : undefined}
                                  disabled={savedIndexes.includes(index)}
                                />
                                <Button
                                  size="$2"
                                  circular
                                  icon={ExternalLink}
                                  onPress={() => {
                                    window.open(`https://www.google.com/search?q=define+${encodeURIComponent(pair.en)}`);
                                  }}
                                />
                              </XStack>
                              {pair.modelName && (
                                <Text color="$color8" fontSize="$1" fontStyle="italic">
                                  via {pair.modelName}
                                </Text>
                              )}
                            </YStack>
                          </XStack>
                          {index < pairs.length - 1 && <Separator borderColor="$borderColor" opacity={0.5} marginTop="$2" />}
                        </YStack>
                      );
                    })}
                  </YStack>
                </ScrollView>
              </YStack>
            </YStack>

            <XStack
              padding="$3"
              justifyContent="flex-end"
              borderTopWidth={1}
              borderColor="$borderColor"
              backgroundColor="$background02"
            >
              <Button
                size="$3"
                theme="active"
                icon={X}
                onPress={handleClose}
              >
                Close
              </Button>
            </XStack>
          </>
        )}
      </YStack>
    </Theme>
  );
};
