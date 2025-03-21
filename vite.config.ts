import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: "./", // Asegura que los assets se carguen correctamente en Netlify
  build: {
    outDir: "dist",
  }
});
