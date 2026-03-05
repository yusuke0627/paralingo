import React from 'react';
import { createRoot } from 'react-dom/client';
import { TamaguiProvider, Theme } from 'tamagui';
import tamaguiConfig from '../../tamagui.config';
import { TranslationOverlay } from './TranslationOverlay';

// Import Tamagui CSS
import 'tamagui/dist/tamagui.css';

const App = () => {
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <Theme name="dark">
        <div style={{ width: '100%', height: '100%', padding: 10 }}>
          <TranslationOverlay />
        </div>
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
