import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(),
      viteStaticCopy({
      targets: [
        {
          src: 'staticwebapp.config.json',
          dest: '.' // Copies to root of `dist/`
        }
      ]
    })
    
  ],
  build: {
    sourcemap: true,  // Enable source maps for production build
  },
  resolve: {
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
  },
})

