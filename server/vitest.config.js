import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./test/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.config.*',
        'coverage/'
      ],
      thresholds: {
        global: {
          branches: 60,
          functions: 70,
          lines: 75,
          statements: 75
        }
      }
    },
    include: [
      '**/*.{test,spec}.{js,ts}'
    ],
    exclude: [
      'node_modules',
      '../src',
      '../build'
    ],
    testTimeout: 10000
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.')
    }
  }
})