#!/bin/bash

echo "🚀 Setting up Vercel for deployment..."
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Login to Vercel
echo "🔑 Logging in to Vercel..."
vercel login

# Link project
echo "🔗 Linking project to Vercel..."
vercel link

# Get project information
echo "📋 Getting project information..."
if [ -f ".vercel/project.json" ]; then
    VERCEL_ORG_ID=$(cat .vercel/project.json | grep -o '"orgId":"[^"]*"' | cut -d'"' -f4)
    VERCEL_PROJECT_ID=$(cat .vercel/project.json | grep -o '"projectId":"[^"]*"' | cut -d'"' -f4)

    echo ""
    echo "📝 Add these secrets to your GitHub repository:"
    echo "   Repository → Settings → Secrets and variables → Actions"
    echo ""
    echo "   VERCEL_TOKEN: (Get from https://vercel.com/account/tokens)"
    echo "   VERCEL_ORG_ID: $VERCEL_ORG_ID"
    echo "   VERCEL_PROJECT_ID: $VERCEL_PROJECT_ID"
    echo ""
else
    echo "❌ Could not find .vercel/project.json"
    echo "   Please run 'vercel link' manually first"
fi

echo ""
echo "✅ Setup complete! Now:"
echo "1. Add the secrets above to your GitHub repository"
echo "2. Push your code to the main branch"
echo "3. GitHub Actions will automatically deploy to Vercel"
