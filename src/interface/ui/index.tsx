import React from 'react';
import { createRoot } from 'react-dom/client';
import { TranslationOverlay } from './TranslationOverlay';

// Make background transparent for the overlay effect
const App = () => {
  return (
    <div style={{ width: '100%', height: '100%', padding: 10 }}>
      {/* We can add Tamagui Provider here later, using normal React for now */}
      <TranslationOverlay />
    </div>
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
