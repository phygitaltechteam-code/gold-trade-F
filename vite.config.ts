import {defineConfig} from 'vite';
import viteReact from '@vitejs/plugin-react';
import {TanStackRouterVite} from '@tanstack/router-plugin/vite';
import {resolve} from 'path';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [TanStackRouterVite(), viteReact(), basicSsl()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
  },
  build: {
    chunkSizeWarningLimit: 3000,
  },
});
