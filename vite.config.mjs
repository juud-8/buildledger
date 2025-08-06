import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': '/src'
    }
  },
  build: {
    outDir: "build",
    chunkSizeWarningLimit: 2000,
    commonjsOptions: {
      include: [/node_modules/]
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('recharts') || id.includes('d3')) {
              return 'vendor-charts';
            }
            if (id.includes('stripe')) {
              return 'vendor-stripe';
            }
            if (id.includes('framer-motion') || id.includes('lucide-react') || id.includes('@radix-ui')) {
              return 'vendor-ui';
            }
            if (id.includes('supabase') || id.includes('axios')) {
              return 'vendor-api';
            }
            return 'vendor-other';
          }
        }
      }
    }
  },
  plugins: [react()],
  server: {
    port: 4028,
    host: "0.0.0.0",
    strictPort: true,
    allowedHosts: ['.amazonaws.com', '.builtwithrocket.new']
  },
  preview: {
    port: parseInt(process.env.PORT) || 4173,
    host: "0.0.0.0",
    strictPort: false
  }
});