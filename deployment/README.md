# Deployment

This directory contains all deployment-related configuration files and scripts.

## Files

### Platform Configurations
- **Dockerfile** - Docker container configuration for containerized deployments
- **railway.toml** - Railway platform deployment configuration
- **nixpacks.toml** - Nixpacks build configuration
- **vercel.json** - Vercel serverless deployment configuration
- **serve.js** - Static file server for production builds

## Supported Platforms

### Vercel (Recommended)
- **File**: `vercel.json`
- **Type**: Serverless/Static
- **Commands**:
  ```bash
  npm run deploy:correct  # Proper deployment
  vercel build --prod && vercel --prod --prebuilt
  ```

### Railway
- **File**: `railway.toml`
- **Type**: Container/Server
- **Commands**:
  ```bash
  npm run railway:build
  npm run railway:start
  ```

### Docker
- **File**: `Dockerfile`
- **Type**: Container
- **Commands**:
  ```bash
  docker build -t buildledger .
  docker run -p 3000:3000 buildledger
  ```

### Nixpacks
- **File**: `nixpacks.toml`
- **Type**: Build system
- **Used by**: Railway and other platforms

## Deployment Process

### 1. Build
```bash
npm run build
```

### 2. Test Locally
```bash
npm run serve
# or
node deployment/serve.js
```

### 3. Deploy to Platform
Choose your deployment method:

**Vercel (Static/Serverless)**:
```bash
npm run deploy:correct
```

**Railway (Container)**:
```bash
# Railway automatically uses railway.toml
git push railway main
```

**Docker**:
```bash
docker build -t buildledger .
docker run -p 3000:3000 buildledger
```

## Environment Variables

### Required for Production
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

### Optional
- `VITE_OPENAI_API_KEY` - OpenAI API key for AI features
- `VITE_TWILIO_PHONE_NUMBER` - Twilio phone number

### Supabase Edge Functions
- `TWILIO_ACCOUNT_SID` - Set in Supabase dashboard
- `TWILIO_AUTH_TOKEN` - Set in Supabase dashboard
- `TWILIO_PHONE_NUMBER` - Set in Supabase dashboard

## Important Notes

### Vercel Deployment
⚠️ **Critical**: Always use the correct deployment command:
- ✅ `npm run deploy:correct`
- ❌ `vercel --prod` (causes build issues)

### Railway Configuration
- Uses `serve.js` for static file serving
- Automatically installs dependencies
- Supports Node.js 18+

### Docker Configuration
- Multi-stage build for optimization
- Nginx serves static files
- Optimized for production

## Troubleshooting

### Build Issues
1. Clear build cache: `rm -rf build/ dist/`
2. Reinstall dependencies: `npm install`
3. Check environment variables

### Deployment Failures
1. Verify environment variables are set
2. Check build logs for errors
3. Ensure all files are committed to git
4. Review platform-specific documentation

### Performance Issues
1. Check bundle size: `npm run build`
2. Optimize images and assets
3. Review code splitting
4. Monitor deployment metrics

## Contributing

When updating deployment configs:
1. Test changes locally first
2. Update relevant documentation
3. Verify on staging environment
4. Monitor production deployments
5. Update this README if needed