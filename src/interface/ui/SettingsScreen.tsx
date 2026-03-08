import React, { useState, useEffect } from 'react';
import { YStack, XStack, H1, Label, Input, Button, ScrollView, Text, Card, Theme } from 'tamagui';
import { Settings, Save, AlertCircle } from '@tamagui/lucide-icons';

export const SettingsScreen: React.FC = () => {
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [provider, setProvider] = useState<'gemini' | 'chatgpt' | 'auto'>('auto');
  const [shortcut, setShortcut] = useState('CommandOrControl+Shift+T');
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      // @ts-ignore
      if (window.paralingo) {
        const settings = await window.paralingo.getSettings();
        if (settings) {
          setGeminiApiKey(settings.apiKey || '');
          setOpenaiApiKey(settings.openaiApiKey || '');
          setProvider(settings.aiProvider || 'auto');
          setShortcut(settings.globalShortcut || 'CommandOrControl+Shift+T');
        }
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setStatus('Saving...');
    // @ts-ignore
    const result = await window.paralingo.saveSettings({
      apiKey: geminiApiKey,
      openaiApiKey: openaiApiKey,
      aiProvider: provider,
      globalShortcut: shortcut
    });

    if (result.ok) {
      setStatus('Settings saved successfully!');
    } else {
      setStatus(`Error: ${result.error}`);
    }
    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <Theme name="dark">
      <YStack flex={1} bg="$background">
        <ScrollView flex={1} width="100%">
          <YStack p="$4" space="$5">
            <XStack space="$3" ai="center">
              <Settings size={28} color="$color" />
              <H1 size="$8" fontWeight="800">Settings</H1>
            </XStack>

            <Card p="$4" elevate bordered space="$4">
              <YStack space="$4">
                {/* Gemini API Key */}
                <YStack space="$2">
                  <Label fontWeight="bold">Gemini API Key</Label>
                  <Input
                    secureTextEntry
                    value={geminiApiKey}
                    onChangeText={setGeminiApiKey}
                    placeholder="Enter your Gemini API Key"
                  />
                  <Text fontSize="$2" color="$color10">
                    Get your key from ai.google.dev
                  </Text>
                </YStack>

                {/* OpenAI API Key */}
                <YStack space="$2">
                  <Label fontWeight="bold">OpenAI (ChatGPT) API Key</Label>
                  <Input
                    secureTextEntry
                    value={openaiApiKey}
                    onChangeText={setOpenaiApiKey}
                    placeholder="Enter your OpenAI API Key"
                  />
                  <Text fontSize="$2" color="$color10">
                    Get your key from platform.openai.com
                  </Text>
                </YStack>

                {/* Provider Selection */}
                <YStack space="$2">
                  <Label fontWeight="bold">AI Provider</Label>
                  <XStack space="$2">
                    <Button
                      theme={provider === 'auto' ? 'active' : undefined}
                      onPress={() => setProvider('auto')}
                      flex={1}
                    >
                      Auto (Round Robin)
                    </Button>
                    <Button
                      theme={provider === 'gemini' ? 'active' : undefined}
                      onPress={() => setProvider('gemini')}
                      flex={1}
                    >
                      Gemini
                    </Button>
                    <Button
                      theme={provider === 'chatgpt' ? 'active' : undefined}
                      onPress={() => setProvider('chatgpt')}
                      flex={1}
                    >
                      ChatGPT
                    </Button>
                  </XStack>
                  <Text fontSize="$2" color="$color10">
                    Auto: 両方のキーを交互に利用し、制限時は自動で切替え
                  </Text>
                </YStack>

                {/* Global Shortcut */}
                <YStack space="$2">
                  <Label fontWeight="bold">Global Shortcut</Label>
                  <Input value={shortcut} onChangeText={setShortcut} />
                  <Text fontSize="$2" color="$color10">
                    Default: CommandOrControl+Shift+T
                  </Text>
                </YStack>
              </YStack>
            </Card>

            <Button
              icon={Save}
              themeInverse
              onPress={handleSave}
              size="$5"
              fontWeight="bold"
            >
              Save Changes
            </Button>

            {status && (
              <XStack ai="center" jc="center" space="$2" p="$3" bg="$background02" br="$4" bordered borderColor="$borderColor">
                <AlertCircle size={16} color="$color10" />
                <Text color="$color" fontSize="$3">{status}</Text>
              </XStack>
            )}
          </YStack>
        </ScrollView>
      </YStack>
    </Theme>
  );
};
