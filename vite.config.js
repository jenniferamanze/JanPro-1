import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/JanPro-1/' // For GitHub Pages, since repo is JanPro-1
})