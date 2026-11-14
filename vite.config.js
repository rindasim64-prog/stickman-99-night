import { defineConfig } from 'vite';

export default defineConfig({
  // Relative asset paths so the build works from any folder or iframe URL
  // (needed for HTML5 portals such as Playgama).
  base: './',
  server: { host: true, port: 5173 },
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: { three: ['three'] },
      },
    },
  },
});
