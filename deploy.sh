#!/bin/bash

# SFIMP Website Deployment Script
# Deploys to GitHub Pages

echo "🚀 Deploying SFIMP Website to GitHub Pages..."

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Error: Please run this script from the sfimp-website directory"
    exit 1
fi

# Add all changes
git add .

# Commit
git commit -m "Update website $(date '+%Y-%m-%d %H:%M')"

# Check if gh-pages branch exists
if git ls-remote --heads origin gh-pages | grep -q 'gh-pages'; then
    # Push to gh-pages branch
    git subtree push --prefix sfimp-website origin gh-pages
    echo "✅ Deployed to GitHub Pages!"
else
    echo "⚠️ gh-pages branch doesn't exist. Creating it..."
    git checkout --orphan gh-pages
    git reset --hard
    cp -r ../sfimp-website/* .
    git add .
    git commit -m "Initial website deployment"
    git push -u origin gh-pages
    git checkout main
    echo "✅ Initial deployment complete!"
fi
