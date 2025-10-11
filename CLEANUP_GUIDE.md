# 🔐 Git History Cleanup Guide

## ⚠️ CRITICAL: Your API Key is Exposed!

Your OpenAI API key is currently visible in git history. Follow these steps **BEFORE** making the repository public.

---

## 📋 Step-by-Step Instructions

### Step 1: Revoke Your Current API Key 🔑

**DO THIS FIRST!**

1. Go to https://platform.openai.com/api-keys
2. Find the key starting with `sk-proj-SSB1q7dAR-J1QUr44eqF...`
3. Click "Revoke" or "Delete"
4. Confirm the revocation

⚠️ **Why:** Once the repo is public, anyone can see your key in the git history and use it.

---

### Step 2: Install git-filter-repo 📦

```bash
# On macOS
brew install git-filter-repo

# On Linux
pip3 install git-filter-repo

# Or download from:
# https://github.com/newren/git-filter-repo
```

---

### Step 3: Run the Cleanup Script 🧹

```bash
cd /Users/oss/Desktop/personal/International_Information
./cleanup-sensitive-data.sh
```

The script will:
- Create a backup branch (`backup-before-cleanup`)
- Remove all `.env` files from git history
- Verify the cleanup

---

### Step 4: Force Push to Remote 🚀

⚠️ **WARNING:** This will rewrite history on GitHub/GitLab!

```bash
# Push all branches
git push origin --force --all

# Push tags (if any)
git push origin --force --tags
```

---

### Step 5: Create New API Key 🆕

1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Give it a name (e.g., "International Travel App")
4. Copy the new key

---

### Step 6: Update Local Environment 💻

```bash
# Copy the template
cp env.example .env.local

# Edit .env.local and add your NEW key
# OPENAI_KEY=sk-proj-YOUR_NEW_KEY_HERE
```

---

### Step 7: Update Vercel Environment 🌐

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Update `OPENAI_KEY` with your new key
5. Redeploy your application

---

### Step 8: Verify Cleanup ✅

```bash
# Check if .env files still exist in history (should be empty)
git log --all --full-history -- .env .env.local

# Check current files are not tracked
git status

# Verify .env is ignored
echo ".env" | git check-ignore -v -
```

---

### Step 9: Make Repository Public 🌍

Now it's safe to make your repository public!

1. Go to your GitHub/GitLab repository settings
2. Change visibility to "Public"
3. Confirm the change

---

## 📝 Additional Notes

### For Team Members

If you have collaborators, they need to:

```bash
# Delete their local copy
cd ..
rm -rf International_Information

# Re-clone the repository
git clone <your-repo-url>
cd International_Information

# Set up their own .env.local
cp env.example .env.local
# Add their API key
```

### Alternative: Manual Cleanup

If `git-filter-repo` doesn't work, you can use BFG Repo-Cleaner:

```bash
# Install BFG
brew install bfg

# Run cleanup
bfg --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

---

## 🆘 Troubleshooting

**Problem:** `git-filter-repo` not found
- **Solution:** Install it using the commands in Step 2

**Problem:** "refusing to overwrite existing backup"
- **Solution:** Delete the backup branch: `git branch -D backup-before-cleanup`

**Problem:** Remote push rejected
- **Solution:** Use `--force` flag (history has been rewritten)

**Problem:** Vercel still using old key
- **Solution:** Update environment variable AND trigger a new deployment

---

## ✅ Checklist Before Going Public

- [ ] API key revoked on OpenAI platform
- [ ] git-filter-repo installed
- [ ] Cleanup script executed successfully
- [ ] Force pushed to all remotes
- [ ] New API key generated
- [ ] Local .env.local updated
- [ ] Vercel environment variables updated
- [ ] Application tested with new key
- [ ] Git history verified clean
- [ ] Team members notified (if applicable)

---

## 🔒 Best Practices Going Forward

1. **Never commit `.env` files** - They're now in `.gitignore`
2. **Use `.env.local` for development** - Already ignored
3. **Use Vercel env vars for production** - Secure and encrypted
4. **Use `env.example`** - Template for team members
5. **Rotate keys regularly** - Security best practice
6. **Use GitHub secrets for CI/CD** - If using GitHub Actions

---

**Questions?** Check the [GitHub documentation on removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)

