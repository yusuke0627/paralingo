import React, { useEffect, useMemo, useState } from 'react';
import { Button, ScrollView, Separator, Text, Theme, XStack, YStack } from 'tamagui';
import { ReviewItem, ReviewStatus } from '../../domain/entities';
import { PosColoredSentence } from './PosColoredSentence';
import { DEFAULT_REVIEW_STATUS_FILTER, ReviewStatusFilter, toggleReviewStatusFilter } from './reviewFilter';

const normalizeReviewItem = (item: any): ReviewItem => ({
  id: item.id,
  en: item.en,
  ja: item.ja,
  posTokens: Array.isArray(item.posTokens) ? item.posTokens : undefined,
  reason: item.reason,
  status: item.status,
  createdAt: new Date(item.createdAt),
});

const reasonLabel = (reason: string): string => {
  if (reason === 'unknown') return 'あとで確認';
  if (reason === 'later') return 'あとで振り返る';
  return reason;
};

export const ReviewScreen: React.FC = () => {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<ReviewStatusFilter>(DEFAULT_REVIEW_STATUS_FILTER);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadItems = async (status?: ReviewStatus | null) => {
    setLoading(true);
    try {
      // @ts-ignore
      if (!window.paralingo || typeof window.paralingo.listReviewItems !== 'function') {
        setStatusMessage('Review APIが未反映です。アプリを再起動して再試行してください');
        setItems([]);
        return;
      }
      // @ts-ignore
      const result = await window.paralingo.listReviewItems(status ?? undefined);
      if (!result.ok) {
        setStatusMessage(result.error || 'Reviewデータの取得に失敗しました');
        setItems([]);
        return;
      }
      setItems((result.items || []).map(normalizeReviewItem));
      setStatusMessage(null);
    } catch (error: any) {
      setStatusMessage(error?.message || 'Reviewデータの取得に失敗しました');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems(statusFilter);
  }, [statusFilter]);

  const grouped = useMemo(() => items, [items]);

  const handleStatusUpdate = async (id: string | undefined, nextStatus: ReviewStatus) => {
    if (!id) return;
    // @ts-ignore
    if (!window.paralingo || typeof window.paralingo.setReviewItemStatus !== 'function') {
      setStatusMessage('Review APIが未反映です。アプリを再起動して再試行してください');
      return;
    }
    // @ts-ignore
    const result = await window.paralingo.setReviewItemStatus({ id, status: nextStatus });
    if (!result.ok) {
      setStatusMessage(result.error || '更新に失敗しました');
      return;
    }
    await loadItems(statusFilter ?? undefined);
    setStatusMessage(null);
  };

  return (
    <Theme name="dark">
      <YStack flex={1} bg="$background">
        <XStack padding="$4" gap="$2" alignItems="center" justifyContent="space-between">
          <XStack gap="$2">
            <Button
              size="$3"
              theme={statusFilter === 'pending' ? 'active' : undefined}
              onPress={() => setStatusFilter((current) => toggleReviewStatusFilter(current, 'pending'))}
            >
              未解決
            </Button>
            <Button
              size="$3"
              theme={statusFilter === 'resolved' ? 'active' : undefined}
              onPress={() => setStatusFilter((current) => toggleReviewStatusFilter(current, 'resolved'))}
            >
              解決済み
            </Button>
          </XStack>

          <Button size="$2" onPress={() => loadItems(statusFilter ?? undefined)}>
            再読込
          </Button>
        </XStack>

        {statusMessage && (
          <XStack paddingHorizontal="$4" paddingBottom="$2">
            <Text color="$yellow10" fontSize="$2">{statusMessage}</Text>
          </XStack>
        )}

        <Separator borderColor="$borderColor" />

        <ScrollView flex={1} padding="$4">
          <YStack gap="$3">
            {loading && <Text color="$color10">読み込み中...</Text>}

            {!loading && grouped.length === 0 && (
              <Text color="$color10">まだ項目がありません。</Text>
            )}

            {!loading && grouped.map((item) => (
              <YStack
                key={item.id}
                gap="$2"
                padding="$3"
                borderWidth={1}
                borderColor="$borderColor"
                borderRadius="$4"
                backgroundColor="$background02"
              >
                <XStack justifyContent="space-between" alignItems="center">
                  <Text color="$color9" fontSize="$2">{reasonLabel(item.reason)}</Text>
                  <Text color="$color8" fontSize="$1">
                    {new Date(item.createdAt).toLocaleString()}
                  </Text>
                </XStack>

                <PosColoredSentence
                  text={item.en}
                  posTokens={item.posTokens}
                  sentenceIndex={0}
                  showSlashGuide={false}
                />
                <Text fontSize="$3" color="$color11">{item.ja}</Text>

                <XStack gap="$2" justifyContent="flex-end" marginTop="$1">
                  {item.status === 'pending' && (
                    <Button size="$2" theme="green" onPress={() => handleStatusUpdate(item.id, 'resolved')}>
                      わかった
                    </Button>
                  )}
                  {item.status === 'resolved' && (
                    <Button size="$2" onPress={() => handleStatusUpdate(item.id, 'pending')}>
                      もう一度
                    </Button>
                  )}
                </XStack>
              </YStack>
            ))}
          </YStack>
        </ScrollView>
      </YStack>
    </Theme>
  );
};
