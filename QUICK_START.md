# 🚀 Quick Start (After Cleanup)

## For You (Repository Owner)

```bash
# 1. Revoke old API key at https://platform.openai.com/api-keys

# 2. Install git-filter-repo
brew install git-filter-repo

# 3. Run cleanup
./cleanup-sensitive-data.sh

# 4. Force push
git push origin --force --all

# 5. Create new API key at https://platform.openai.com/api-keys

# 6. Set up local environment
cp env.example .env.local
# Edit .env.local and add your new key

# 7. Update Vercel environment variables

# 8. Make repo public on GitHub/GitLab
```

---

## For New Contributors (After Repo is Public)

```bash
# Clone the repository
git clone <repo-url>
cd International_Information

# Install dependencies
pnpm install

# Set up environment
cp env.example .env.local
# Edit .env.local and add your OpenAI API key

# Run development server
pnpm dev
```

---

## Environment Setup

Your `.env.local` should look like:

```env
OPENAI_KEY=sk-proj-YOUR_NEW_KEY_HERE
```

**Never commit this file!** It's already in `.gitignore`.

