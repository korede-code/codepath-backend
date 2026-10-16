# Deploy Your First App

Deploying means making your app **publicly accessible** on the internet.

## Deployment Platforms

### For Static Sites
- **Netlify** — best for static sites
- **Vercel** — great for React/Next.js
- **GitHub Pages** — free for public repos

### For Full-Stack Apps
- **Render** — free tier available
- **Railway** — easy deployment
- **Fly.io** — global deployment

### For Databases
- **Neon** — serverless PostgreSQL
- **Supabase** — open-source Firebase alternative
- **MongoDB Atlas** — cloud MongoDB

## Deploying to Vercel (Frontend)

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Deploy

```bash
vercel
```

Follow the prompts. Your app is live in seconds!

### 3. Deploy from GitHub

- Push code to GitHub
- Go to [vercel.com](https://vercel.com)
- Click **Import Project**
- Select your repo
- Click **Deploy**

## Deploying to Render (Backend)

### 1. Create account at [render.com](https://render.com)

### 2. Create New Web Service

- Connect GitHub repo
- Select your backend repo

### 3. Configure

| Setting | Value |
|---------|-------|
| Environment | Node |
| Build Command | `npm install` |
| Start Command | `npm start` |

### 4. Add Environment Variables

```
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret
NODE_ENV=production
FRONTEND_URL=https://your-app.web.app
```

### 5. Click **Create Web Service**

## Common Deployment Issues

### Issue: App crashes after deploy
**Cause:** Environment variables missing
**Fix:** Add all .env variables to platform

### Issue: CORS errors
**Cause:** Frontend URL not allowed
**Fix:** Add frontend URL to backend CORS config

### Issue: Database connection fails
**Cause:** Wrong DATABASE_URL or SSL
**Fix:** Add `?sslmode=require` to connection string

### Issue: Build fails
**Cause:** Missing dependencies
**Fix:** Check package.json has all deps

## Post-Deployment Checklist

- [ ] App loads without errors
- [ ] Database connects
- [ ] Authentication works
- [ ] API endpoints respond
- [ ] Images/assets load
- [ ] Environment variables set
- [ ] CORS configured
- [ ] HTTPS enabled