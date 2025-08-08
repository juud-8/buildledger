import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        'build/',
        'coverage/',
        '**/*.config.*',
        'public/',
        'scripts/'
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 80,
          statements: 80
        }
      }
    },
    include: [
      'src/**/*.{test,spec}.{js,jsx,ts,tsx}'
    ],
    exclude: [
      'node_modules',
      'build',
      'server'
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})