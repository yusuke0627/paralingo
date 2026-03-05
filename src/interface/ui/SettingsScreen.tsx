import React, { useState, useEffect } from 'react';
import { YStack, XStack, H1, Label, Input, Button, ScrollView, Text, Card, Theme } from 'tamagui';
import { Settings, Save, AlertCircle } from '@tamagui/lucide-icons';

export const SettingsScreen: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState<'gemini' | 'chatgpt'>('gemini');
  const [shortcut, setShortcut] = useState('CommandOrControl+Shift+T');
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      // @ts-ignore
      if (window.paralingo) {
        const settings = await window.paralingo.getSettings();
        if (settings) {
          setApiKey(settings.geminiApiKey || '');
          setProvider(settings.aiProvider || 'gemini');
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
      geminiApiKey: apiKey,
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
      <ScrollView p="$4" bg="$background">
        <YStack space="$5">
          <XStack space="$2" ai="center">
            <Settings size="$1.5" />
            <H1 size="$8">Settings</H1>
          </XStack>

          <Card p="$4" elevate bordered>
            <YStack space="$4">
              <YStack space="$2">
                <Label fontWeight="bold">AI API Key (Gemini)</Label>
                <Input
                  secureTextEntry
                  value={apiKey}
                  onChangeText={setApiKey}
                  placeholder="Enter your API Key"
                  autoFocus
                />
                <Text size="$2" color="$color10">
                  Your API key is stored locally and never sent to our servers.
                </Text>
              </YStack>

              <YStack space="$2">
                <Label fontWeight="bold">AI Provider</Label>
                <XStack space="$2">
                  <Button
                    theme={provider === 'gemini' ? 'active' : undefined}
                    onPress={() => setProvider('gemini')}
                  >
                    Gemini
                  </Button>
                  <Button
                    theme={provider === 'chatgpt' ? 'active' : undefined}
                    onPress={() => setProvider('chatgpt')}
                  >
                    ChatGPT
                  </Button>
                </XStack>
              </YStack>

              <YStack space="$2">
                <Label fontWeight="bold">Global Shortcut</Label>
                <Input value={shortcut} onChangeText={setShortcut} />
                <Text size="$2" color="$color10">
                  Default: CommandOrControl+Shift+T
                </Text>
              </YStack>
            </YStack>
          </Card>

          <Button
            icon={<Save />}
            themeInverse
            onPress={handleSave}
            size="$5"
          >
            Save Changes
          </Button>

          {status && (
            <XStack ai="center" jc="center" space="$2" p="$2" bg="$green5" br="$4">
              <AlertCircle size="$1" color="$green10" />
              <Text color="$green10">{status}</Text>
            </XStack>
          )}
        </YStack>
      </ScrollView>
    </Theme>
  );
};
