# 🚀 Vercel Environment Variables Setup

## Step-by-Step Guide to Add Your OpenAI API Key to Vercel

---

## Method 1: Using Vercel Dashboard (Easiest)

### Step 1: Go to Your Project
1. Visit https://vercel.com/dashboard
2. Find and click on your `International_Information` project

### Step 2: Access Environment Variables
1. Click on **Settings** tab (top navigation)
2. Click on **Environment Variables** in the left sidebar

### Step 3: Add Your API Key
1. In the "Key" field, enter: `OPENAI_KEY`
2. In the "Value" field, paste your OpenAI API key (e.g., `sk-proj-...`)
3. Select which environments to use it in:
   - ✅ **Production** (for live site)
   - ✅ **Preview** (for branch deployments)
   - ✅ **Development** (for local `vercel dev`)
4. Click **Save**

### Step 4: Redeploy
1. Go to **Deployments** tab
2. Click the three dots `...` on the latest deployment
3. Click **Redeploy**
4. Your app will now use the environment variable!

---

## Method 2: Using Vercel CLI

```bash
# Make sure you're logged in
vercel login

# Link your project (if not already)
vercel link

# Add the environment variable
vercel env add OPENAI_KEY

# When prompted:
# - Paste your API key
# - Select: Production, Preview, Development (use spacebar to select)
# - Press Enter

# Redeploy
vercel --prod
```

---

## Method 3: Add Multiple Variables at Once

If you have multiple environment variables:

```bash
# Add them one by one
vercel env add OPENAI_KEY
vercel env add NEXT_PUBLIC_API_URL
# etc...

# Or import from a file (create vercel-env.json)
{
  "OPENAI_KEY": "sk-proj-your-key-here"
}

# Then run:
vercel env pull .env.local
```

---

## Verify It's Working

### Check on Vercel Dashboard:
1. Go to Settings → Environment Variables
2. You should see `OPENAI_KEY` listed
3. The value will be hidden (shows as `•••••`)

### Test Your Deployment:
1. Visit your live site: https://your-project.vercel.app
2. Try using the AI agent feature
3. Check the browser console for errors
4. If it works, you're all set! ✅

---

## Important Notes

### Security:
- ✅ Environment variables are **encrypted** on Vercel
- ✅ They are **NOT** visible in your git repository
- ✅ They are **NOT** exposed to the browser (unless prefixed with `NEXT_PUBLIC_`)
- ✅ Each team member can have their own local `.env.local`

### Variable Naming:
- `OPENAI_KEY` - Backend only (secure)
- `NEXT_PUBLIC_*` - Exposed to browser (use for public values only)

### When Variables Update:
- Changes take effect on **next deployment**
- You must **redeploy** for changes to apply
- Local development uses `.env.local` (not Vercel env vars)

---

## Troubleshooting

### Problem: API still not working after adding env var
**Solution:** Redeploy your project (deployments don't auto-redeploy on env changes)

### Problem: "OPENAI_KEY is undefined"
**Solution:** 
- Check the variable name matches exactly (case-sensitive)
- Verify it's enabled for "Production" environment
- Redeploy the project

### Problem: Works locally but not on Vercel
**Solution:**
- Local uses `.env.local`
- Vercel uses dashboard env vars
- Make sure both have the same key

---

## Quick Reference

```bash
# View all environment variables
vercel env ls

# Remove a variable
vercel env rm OPENAI_KEY

# Pull Vercel env vars to local .env.local
vercel env pull .env.local
```

---

## For Your Local Development

Create `.env.local` (never commit this):

```env
OPENAI_KEY=sk-proj-your-key-here
```

This file is already in `.gitignore` and won't be committed.

---

## Screenshot Guide

**Where to find it:**
Vercel Dashboard → Your Project → Settings (tab) → Environment Variables (sidebar)

**What you'll see:**
- A form with "Key" and "Value" fields
- Checkboxes for Production/Preview/Development
- List of existing environment variables below

That's it! Your OpenAI API key is now securely stored on Vercel! 🎉

