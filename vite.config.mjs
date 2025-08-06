// Root vite config that references the actual config in config/
import { defineConfig } from 'vite'
import path from 'path'

// Import the actual config
import config from './config/vite.config.mjs'

export default config