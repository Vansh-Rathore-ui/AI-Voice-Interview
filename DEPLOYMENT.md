# AI Interviewer - Free Platform Deployment Guide

## 🚀 Quick Deploy Options

### 1. Replit (Recommended - Full Stack)
1. Fork this repository to your GitHub
2. Import to Replit: `https://replit.com/github/YOUR_USERNAME/ai-interviewer`
3. Set environment variables in Replit Secrets:
   - `OXLO_API_KEY`: Your Oxlo AI API key
   - `PORT`: 3001 (Replit sets this automatically)
4. Click "Run" button

### 2. Vercel (Frontend) + Render (Backend)

#### Frontend (Vercel):
1. Create `vercel.json` in root:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/build/**/*",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/frontend/build/$1"
    }
  ]
}
```
2. Connect your GitHub repo to Vercel
3. Deploy

#### Backend (Render):
1. Create `render.yaml`:
```yaml
services:
  - type: web
    name: ai-interviewer-api
    env: node
    buildCommand: "npm install && cd frontend && npm install && npm run build"
    startCommand: "node server.js"
    envVars:
      - key: PORT
        value: 10000
      - key: OXLO_API_KEY
        sync: false
```

### 3. Netlify (Frontend) + Railway (Backend)

#### Frontend (Netlify):
1. Build settings:
   - Build command: `cd frontend && npm run build`
   - Publish directory: `frontend/build`
2. Add redirect file `_redirects` in frontend/build:
   ```
   /* /index.html 200
   ```

#### Backend (Railway):
1. Connect GitHub repo
2. Set environment variables
3. Deploy

### 4. Glitch (Full Stack)
1. Import to Glitch
2. Add `.env` file with your API key
3. Glitch auto-detects and runs

## 🔧 Environment Variables Required

**For all platforms:**
- `OXLO_API_KEY`: Your Oxlo AI API key (get from https://oxlo.ai)
- `PORT`: Platform-specific (usually set automatically)

## 📝 Platform-Specific Notes

### Replit:
- ✅ WebSocket support built-in
- ✅ Auto-refresh on changes
- ✅ Free tier available
- ❌ Limited to 1000 requests/hour on free plan

### Vercel:
- ✅ Excellent CDN
- ✅ Custom domains
- ❌ No WebSocket support (need separate backend)
- ❌ Serverless functions timeout

### Render:
- ✅ Free tier with WebSocket
- ✅ Auto-deploy from GitHub
- ❌ Spins down after 15min inactivity

### Netlify:
- ✅ Great for static sites
- ✅ Form handling
- ❌ No backend support

### Railway:
- ✅ Free tier
- ✅ Good for Node.js apps
- ❌ Limited resources

## 🛠️ Build Process

The app automatically builds the React frontend when deployed:
```bash
npm run setup  # Install all dependencies and build
```

## 🔍 Troubleshooting

### WebSocket Issues:
- Ensure platform supports WebSockets
- Check if platform requires specific configuration
- Verify CORS settings

### Build Failures:
- Clear cache and rebuild
- Check Node.js version compatibility
- Verify all dependencies installed

### API Issues:
- Confirm OXLO_API_KEY is set correctly
- Check API rate limits
- Verify model availability

## 📊 Performance Optimization

For free platforms:
- Minimize API calls
- Use caching where possible
- Optimize bundle size
- Consider using CDN for static assets
