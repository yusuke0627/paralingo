import React from 'react';
import { createRoot } from 'react-dom/client';
import { TamaguiProvider, Theme, YStack, XStack, Button, Text } from 'tamagui';
import tamaguiConfig from '../../tamagui.config';
import { TranslationOverlay } from './TranslationOverlay';
import { SettingsScreen } from './SettingsScreen';
import { ReviewScreen } from './ReviewScreen';

// Import CSS if needed, but tamagui/dist/tamagui.css is missing in this version
// import '@tamagui/core/reset.css';

const App = () => {
  const [currentView, setCurrentView] = React.useState<'translation' | 'review' | 'settings'>('translation');

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <Theme name="dark">
        <YStack f={1} bg="$background05" p="$2">
          <XStack
            h={30}
            ai="center"
            jc="flex-start"
            px="$3"
            mb="$2"
            borderRadius="$4"
            backgroundColor="$background08"
            style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
          >
            <Text fontSize="$2" color="$color10">
              ParaLingo
            </Text>
          </XStack>

          <XStack gap="$2" mb="$2" px="$1">
            <Button
              size="$2"
              flex={1}
              theme={currentView === 'translation' ? 'active' : undefined}
              onPress={() => setCurrentView('translation')}
            >
              Reading
            </Button>
            <Button
              size="$2"
              flex={1}
              theme={currentView === 'review' ? 'active' : undefined}
              onPress={() => setCurrentView('review')}
            >
              Review
            </Button>
            <Button
              size="$2"
              flex={1}
              theme={currentView === 'settings' ? 'active' : undefined}
              onPress={() => setCurrentView('settings')}
            >
              Settings
            </Button>
          </XStack>

          <YStack f={1}>
            <YStack f={1} display={currentView === 'translation' ? 'flex' : 'none'}>
              <TranslationOverlay />
            </YStack>
            <YStack f={1} display={currentView === 'review' ? 'flex' : 'none'}>
              <ReviewScreen />
            </YStack>
            <YStack f={1} display={currentView === 'settings' ? 'flex' : 'none'}>
              <SettingsScreen />
            </YStack>
          </YStack>
        </YStack>
      </Theme>
    </TamaguiProvider>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
