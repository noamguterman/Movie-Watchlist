import { defineConfig } from 'vite'

export default defineConfig({
  base: '/Movie-Watchlist/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html',
        watchlist: './watchlist.html'
      }
    }
  }
})