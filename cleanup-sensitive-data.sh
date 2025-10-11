#!/bin/bash

# Script to remove sensitive data (.env files) from git history
# This uses git filter-repo which is the recommended tool for this task

set -e  # Exit on error

echo "🔐 Git History Cleanup Script"
echo "=============================="
echo ""
echo "⚠️  WARNING: This will rewrite git history!"
echo "⚠️  All commit hashes will change!"
echo "⚠️  You'll need to force push to remote!"
echo ""
echo "📋 Prerequisites:"
echo "   1. Make sure you've REVOKED your OpenAI API key at https://platform.openai.com/api-keys"
echo "   2. Make sure all team members are aware of this operation"
echo "   3. Back up your repository if needed"
echo ""
echo "🔍 Files to be removed from history:"
echo "   - .env"
echo "   - .env.local"
echo "   - .env.production"
echo "   - .env.development"
echo ""

read -p "Have you revoked your API key and ready to proceed? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Aborted. Please revoke your API key first!"
    exit 1
fi

echo ""
echo "📦 Checking for git-filter-repo..."

# Check if git-filter-repo is installed
if ! command -v git-filter-repo &> /dev/null; then
    echo "❌ git-filter-repo is not installed!"
    echo ""
    echo "📥 Install it using:"
    echo "   brew install git-filter-repo"
    echo ""
    echo "Or visit: https://github.com/newren/git-filter-repo"
    exit 1
fi

echo "✅ git-filter-repo found!"
echo ""
echo "🧹 Starting cleanup..."
echo ""

# Create a backup branch
echo "📸 Creating backup branch..."
git branch backup-before-cleanup 2>/dev/null || echo "   (backup branch already exists)"

# Remove .env files from all branches and history
echo "🗑️  Removing .env files from git history..."
git filter-repo --invert-paths \
    --path .env \
    --path .env.local \
    --path .env.production \
    --path .env.development \
    --force

echo ""
echo "✅ Git history cleaned!"
echo ""
echo "🔍 Verifying cleanup..."
if git log --all --full-history --pretty=format:"%H" -- .env .env.local | head -1; then
    echo "⚠️  Warning: .env files may still exist in history"
else
    echo "✅ No .env files found in history!"
fi

echo ""
echo "📝 Next steps:"
echo "   1. Verify the cleanup: git log --all --oneline"
echo "   2. Test your application works correctly"
echo "   3. Force push to remote:"
echo "      git push origin --force --all"
echo "      git push origin --force --tags"
echo "   4. Notify team members to re-clone the repository"
echo "   5. Generate a NEW API key and add it to .env.local (NOT .env)"
echo "   6. Update your Vercel environment variables with the new key"
echo ""
echo "✨ Done!"

