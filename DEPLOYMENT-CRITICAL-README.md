# 🚨 CRITICAL: BUILDLEDGER DEPLOYMENT INSTRUCTIONS

## ⚠️ NEVER USE `vercel --prod` - IT WILL BREAK THE SITE

### ✅ CORRECT DEPLOYMENT METHOD (ALWAYS USE THIS):

```bash
vercel build --prod && vercel --prod --prebuilt
```

### ❌ WRONG METHOD (NEVER USE):

```bash
vercel --prod
# ☝️ THIS BREAKS THE SITE EVERY TIME
```

## 🔍 WHY THIS HAPPENS

1. **Windows vs Linux**: Local Windows development works with flexible import paths
2. **Vercel Linux Build**: Strict module resolution fails on Vercel's Linux environment
3. **Import Path Issue**: `./pages/landing` vs `./pages/landing/index.jsx`

## 🛠 THE SOLUTION

**Prebuilt Deployment**: Build locally (where it works) then upload the built files to Vercel

## 📋 DEPLOYMENT CHECKLIST

Before deploying, ALWAYS:

1. ✅ Test build locally: `npm run build`
2. ✅ Use correct command: `vercel build --prod && vercel --prod --prebuilt`
3. ✅ Verify "Using prebuilt build artifacts..." appears in logs
4. ✅ Never use `vercel --prod` alone

## 🚨 IF SOMEONE BREAKS IT AGAIN

Run this immediate fix:
```bash
vercel build --prod && vercel --prod --prebuilt
```

## 🎯 SYMPTOMS OF THE PROBLEM

- Error: `Could not resolve "./pages/landing/index.jsx"`
- Build fails on Vercel with module resolution errors
- Local build works fine, Vercel build fails

## 💡 LONG-TERM SOLUTION OPTIONS

1. **Keep using prebuilt** (current working solution)
2. **Fix all import paths** to use absolute paths
3. **Update Vite config** for better module resolution
4. **Use different bundler** that handles this better

## 📞 WHO TO BLAME WHEN THIS BREAKS

1. Check git history for who deployed with wrong command
2. Whoever used `vercel --prod` instead of prebuilt method
3. Anyone who ignored this documentation

---

## 🎯 REMEMBER: 

### `vercel build --prod && vercel --prod --prebuilt`
### NEVER `vercel --prod`

---

*This issue has happened multiple times. Following these instructions prevents it.*