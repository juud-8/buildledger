# Configuration

This directory contains all project configuration files.

## Files

### Build & Development
- **vite.config.mjs** - Vite build tool configuration
- **postcss.config.js** - PostCSS processing configuration  
- **tailwind.config.js** - Tailwind CSS framework configuration
- **tailwind-plugin.js** - Custom Tailwind plugins
- **jsconfig.json** - JavaScript/TypeScript project configuration

### Environment
- **.env.example** - Example environment variables file

## Configuration Overview

### Vite Configuration
**File**: `vite.config.mjs`
- Build tool configuration
- Plugin setup (React, TypeScript paths)
- Dev server settings
- Build optimization

### Tailwind CSS
**File**: `tailwind.config.js`
- CSS framework configuration
- Custom colors and themes
- Plugin configurations
- Content paths for purging

**File**: `tailwind-plugin.js`
- Custom Tailwind utilities
- Component classes
- Animation definitions

### PostCSS
**File**: `postcss.config.js`
- CSS processing pipeline
- Tailwind integration
- Autoprefixer configuration

### JavaScript Project
**File**: `jsconfig.json`
- Path mapping and aliases
- Module resolution
- IDE support configuration

## Root Configuration Access

Configuration files are accessible from the project root via proxy files:

```javascript
// Root files that import from config/
- vite.config.mjs → ./config/vite.config.mjs
- tailwind.config.js → ./config/tailwind.config.js  
- postcss.config.js → ./config/postcss.config.js
```

This allows tools to find configs in the expected root location while keeping them organized.

## Environment Variables

### Development
Copy `.env.example` to `.env.local` and configure:

```bash
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key

# Optional
VITE_OPENAI_API_KEY=your_openai_key
VITE_TWILIO_PHONE_NUMBER=your_twilio_number
```

### Production
Set environment variables in your deployment platform:
- Vercel: Project Settings → Environment Variables
- Railway: Project → Variables
- Docker: Use `--env-file` or `-e` flags

## Customization

### Adding New Configurations
1. Add config file to this directory
2. Create root proxy file if needed
3. Update build tools to recognize config
4. Document changes in this README

### Modifying Existing Configs
1. Edit files in `config/` directory
2. Test changes locally
3. Verify build still works
4. Update documentation

### Theme Customization
Modify `tailwind.config.js`:
- Colors: Update color palette
- Fonts: Add custom font families
- Spacing: Modify spacing scale
- Components: Add component styles

## Development Tools

### Vite Features
- Hot Module Replacement (HMR)
- Fast builds with esbuild
- TypeScript support
- Path aliases (@/ → src/)

### Tailwind Features  
- JIT compilation
- Custom utility classes
- Component extraction
- Dark mode support

### PostCSS Features
- Autoprefixer for browser compatibility
- Tailwind processing
- Custom transforms

## Troubleshooting

### Build Issues
1. Clear Vite cache: `rm -rf node_modules/.vite`
2. Verify config syntax
3. Check file paths and imports

### Styling Issues
1. Verify Tailwind content paths
2. Check PostCSS processing order
3. Clear browser cache

### Path Resolution
1. Verify jsconfig.json paths
2. Check Vite alias configuration
3. Restart development server

## Contributing

When updating configurations:
1. Test changes thoroughly
2. Verify build and dev servers work
3. Update documentation
4. Consider backward compatibility
5. Update root proxy files if needed