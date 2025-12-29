# Deployment Guide - Vercel

This guide will help you deploy PitchPad to Vercel with better-auth authentication.

## Prerequisites

- GitHub account
- Vercel account
- Google Cloud Console account (for OAuth)
- PostgreSQL database (you already have Neon configured)

## Step 1: Prepare Your Code

```bash
# Make sure all changes are committed
git add .
git commit -m "Ready for production deployment"
git push origin main
```

## Step 2: Configure Google OAuth for Production

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your OAuth 2.0 Client
3. Under **Authorized JavaScript origins**, add:
   - `https://your-project-name.vercel.app` (you'll update this after first deployment)
4. Under **Authorized redirect URIs**, add:
   - `https://your-project-name.vercel.app/api/auth/callback/google`
5. Click **Save**

> **Note:** You can add multiple URIs for different environments (staging, production, custom domains)

## Step 3: Deploy to Vercel

### Option A: Via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com/new)
2. Click **Import Project**
3. Select your GitHub repository
4. Configure your project:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** ./
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

## Step 4: Configure Environment Variables in Vercel

In your Vercel project dashboard → **Settings** → **Environment Variables**, add:

### Required Variables

```bash
# Database (your existing Neon database)
DATABASE_URL=postgresql://neondb_owner:npg_QwEMhI6igfv1@ep-square-credit-a4vd5nrr-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Better Auth Secret (generate new or use existing)
BETTER_AUTH_SECRET=LWGFZ4a9kNVevvA6tb1BiKhbee4tSjVu88wMLHlnkSs=

# App URLs (use your Vercel domain)
BETTER_AUTH_URL=https://your-project.vercel.app
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

> **Important:** Make sure to set environment variables for all environments (Production, Preview, Development)

## Step 5: Update Google OAuth with Actual Domain

After your first deployment:

1. Note your Vercel domain (e.g., `cold-text-xyz.vercel.app`)
2. Go back to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
3. Update the **Authorized JavaScript origins** and **Redirect URIs** with your actual domain
4. Redeploy if needed (Vercel auto-redeploys on git push)

## Step 6: Run Database Migrations (If Needed)

If this is your first deployment or you've made schema changes:

### Option A: Run locally against production DB

```bash
# Make sure DATABASE_URL points to production
npx prisma migrate deploy
```

### Option B: Run in Vercel CLI

```bash
vercel env pull .env.production
npx prisma migrate deploy
```

## Troubleshooting

### Issue: OAuth redirect not working

**Solution:** Make sure your Google OAuth redirect URI exactly matches:
```
https://your-domain.vercel.app/api/auth/callback/google
```

### Issue: Database connection errors

**Solution:**
1. Verify `DATABASE_URL` in Vercel environment variables
2. Check if your Neon database allows connections from Vercel IPs
3. Ensure `sslmode=require` is in the connection string

### Issue: Better Auth errors

**Solution:**
1. Regenerate `BETTER_AUTH_SECRET`: `openssl rand -base64 32`
2. Make sure environment variables are set for all environments
3. Check browser console for client-side errors

## Custom Domain Setup (Optional)

1. Go to Vercel project → **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records as instructed by Vercel
4. Update Google OAuth URIs with your custom domain
5. (Optional) Set `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` to your custom domain

## Automatic Deployments

Vercel automatically deploys:
- **Production**: Pushes to `main` branch
- **Preview**: Pull requests and other branches

## Environment-Specific Configuration

- **Production**: Set in Vercel dashboard
- **Preview**: Can share production vars or override specific ones
- **Development**: Use local `.env` file

## Security Checklist

- ✅ Use strong `BETTER_AUTH_SECRET` (32+ characters)
- ✅ Never commit `.env` to git (already in `.gitignore`)
- ✅ Restrict OAuth redirect URIs to your domains only
- ✅ Use environment variables for all sensitive data
- ✅ Enable HTTPS (automatic with Vercel)
- ✅ Regularly rotate secrets

## Next Steps

1. Set up monitoring (Vercel Analytics)
2. Configure error tracking (Sentry, LogRocket)
3. Set up email service for password resets
4. Add custom domain
5. Configure caching and performance optimizations

## Useful Commands

```bash
# Pull environment variables from Vercel
vercel env pull

# View deployment logs
vercel logs

# Promote preview deployment to production
vercel promote

# Redeploy (without changes)
vercel --prod
```

## Support

- [Better Auth Docs](https://www.better-auth.com)
- [Vercel Docs](https://vercel.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
