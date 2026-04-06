# Deploy

Deploy the app to Vercel production.

## When to Use

Run `/deploy` to build and deploy the app to production at `workout-app-rho-six.vercel.app`.

## Steps

### 1. Build Check

Run the production build first to catch errors before deploying:

```bash
export PATH="/c/nvm4w/nodejs:$PATH"
npm run build
```

If the build fails, fix the errors before proceeding. Do NOT deploy broken code.

### 2. Deploy to Production

```bash
export PATH="/c/nvm4w/nodejs:$PATH"
npx vercel --prod
```

### 3. Report Result

After deployment completes, report:
- Whether the deploy succeeded or failed
- The production URL
- If it failed, show the error output
