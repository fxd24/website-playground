# 🚀 Deployment Guide

## Option 1: Vercel (Recommended for Next.js)

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (recommended)

### Step 2: Generate Vercel Token
1. Go to [Vercel Dashboard → Account → Tokens](https://vercel.com/account/tokens)
2. Create new token with name "GitHub Actions"
3. Copy the token

### Step 3: Add Vercel Token to GitHub
1. Go to your GitHub repo → Settings → Secrets and variables → Actions
2. Add new secret named `VERCEL_TOKEN`
3. Paste your Vercel token as the value

### Step 4: Deploy
1. Push your code to GitHub main branch
2. GitHub Actions will automatically deploy to Vercel
3. Get your Vercel URL (e.g., `your-app.vercel.app`)

### Step 5: Connect Cloudflare Domain
1. In Vercel Dashboard, go to your project → Settings → Domains
2. Add your Cloudflare domain
3. Copy the Vercel nameservers
4. In Cloudflare Dashboard:
   - Go to your domain → DNS → Nameservers
   - Replace Cloudflare nameservers with Vercel's nameservers
   - Wait for DNS propagation (can take up to 24 hours)

---

## Option 2: Netlify

### Step 1: Create Netlify Account
1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub

### Step 2: Deploy via GitHub
1. In Netlify Dashboard, click "Add new site" → "Import from Git"
2. Connect your GitHub repo
3. Configure build settings:
   - Base directory: `.`
   - Build command: `npm run build`
   - Publish directory: `.next`

### Step 3: Connect Cloudflare Domain
1. In Netlify Dashboard, go to Site settings → Domain management
2. Add your custom domain
3. Follow Cloudflare DNS instructions

---

## Option 3: GitHub Pages (Static Only)

**⚠️ Note: Only works if you export as static site**

### Step 1: Update next.config.js
```javascript
module.exports = {
  output: 'export',
  trailingSlash: true,
}
```

### Step 2: Update package.json
```json
{
  "scripts": {
    "export": "next build && next export"
  }
}
```

### Step 3: GitHub Actions Workflow
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Setup Node
      uses: actions/setup-node@v4
      with:
        node-version: '18'

    - name: Install dependencies
      run: npm ci

    - name: Build
      run: npm run export

    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./out
```

---

## Current Configuration

✅ **Vercel config** created (`vercel.json`)
✅ **GitHub Actions workflow** created (`.github/workflows/deploy.yml`)
✅ **Ready for automatic deployment**

## Environment Variables

Add these to your deployment platform if needed:

```bash
# If you add authentication later
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://yourdomain.com

# Database connection (if you add one)
DATABASE_URL=your-database-url
```

## Monitoring

After deployment, monitor:
- **GitHub Actions**: Check workflow runs in Actions tab
- **Vercel/Netlify Dashboard**: View deployment logs and analytics
- **Cloudflare**: DNS propagation status

## Troubleshooting

### Common Issues:

1. **Build fails**: Check that all dependencies are in `package.json`
2. **DNS not working**: Wait 24-48 hours for propagation
3. **Environment variables**: Ensure they're set in deployment platform

### Support:
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- Netlify: [netlify.com/docs](https://docs.netlify.com)
- Cloudflare: [developers.cloudflare.com](https://developers.cloudflare.com)
