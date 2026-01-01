# Deploying to Vercel

This guide will help you deploy your Decorate My House application to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup) (free)
2. Your Supabase project set up with:
   - Database tables created (run `supabase/schema.sql`)
   - Google OAuth configured (if using Google Sign-In)
3. Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Prepare Your Repository

1. Make sure all your code is committed and pushed to your Git repository:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. Ensure your `.env.local` file is NOT committed (it should be in `.gitignore`)

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your Git repository
4. Configure your project:
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `next build` (default)
   - **Output Directory**: `.next` (default)

5. Add Environment Variables (click "Environment Variables"):
   ```
   NEXT_PUBLIC_SUPABASE_URL = your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your_supabase_anon_key
   ```

6. Click "Deploy"

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow the prompts and add environment variables when asked

## Step 3: Configure Supabase for Production

After deployment, you need to update your Supabase settings:

### Update Authentication URLs

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Add your Vercel deployment URL to:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**: Add:
     - `https://your-app.vercel.app`
     - `https://your-app.vercel.app/auth/callback`
     - `https://your-app.vercel.app/**` (wildcard for all paths)

### Update Google OAuth (if using)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to your OAuth 2.0 Client
3. Add Authorized JavaScript origins:
   - `https://your-app.vercel.app`
4. Add Authorized redirect URIs:
   - `https://your-supabase-project.supabase.co/auth/v1/callback`

## Step 4: Verify Deployment

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Test the following:
   - ✅ Authentication (Login/Signup)
   - ✅ Google Sign-In (if configured)
   - ✅ House creation
   - ✅ Window/letter creation
   - ✅ Sharing links
   - ✅ Countdown timer
   - ✅ Letter visibility after Christmas

## Custom Domain (Optional)

1. In your Vercel dashboard, go to your project settings
2. Click "Domains"
3. Add your custom domain and follow the DNS configuration instructions

## Troubleshooting

### Environment Variables Not Working
- Make sure you've set both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Redeploy after adding environment variables

### Authentication Errors
- Verify redirect URLs in Supabase match your Vercel domain
- Check that Google OAuth redirect URIs are correctly configured

### Images Not Loading
- Ensure all assets in `/public/assets/` are committed to your repository
- Check browser console for 404 errors

### Database Errors
- Verify your database schema is up to date (run `supabase/schema.sql`)
- Check Row Level Security (RLS) policies are enabled

## Continuous Deployment

Vercel automatically redeploys your app when you push to your Git repository:
```bash
git add .
git commit -m "Update features"
git push origin main
```

Your changes will be live in a few minutes!

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)


