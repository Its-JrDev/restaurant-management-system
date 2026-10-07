import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

function forceReloadPlugin() {
  return {
    name: 'force-reload',
    handleHotUpdate({ file, server }) {
      if (file.endsWith('.js') && !file.includes('node_modules')) {
        server.hot.send({ type: 'full-reload' });
        return [];
      }
    },
  };
}

export default defineConfig({
  root: ".",
  publicDir: "public",
  server: {
    port: 3000,
    open: true,
    watch: {
      usePolling: true,
      interval: 100,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    tailwindcss(),
    forceReloadPlugin(),
  ],
});
