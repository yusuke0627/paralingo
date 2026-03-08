import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { tamaguiPlugin } from '@tamagui/vite-plugin';
import path from 'path';

export default defineConfig({
  define: {
    'process.env.TAMAGUI_TARGET': JSON.stringify('web'),
  },
  plugins: [
    react(),
    tamaguiPlugin({
      config: './src/tamagui.config.ts',
      components: ['tamagui'],
    }),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('@tamagui/lucide-icons') || id.includes('lucide-react-native')) return 'vendor-icons';
          if (id.includes('@tamagui') || id.includes('tamagui')) return 'vendor-tamagui';
          if (id.includes('@google/generative-ai')) return 'vendor-ai';
          return;
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'react-native': 'react-native-web',
    },
  },
  server: {
    port: 5173,
    strictPort: true, // Don't try other ports, Electron expects 5173
  },
});
