# AI Interviewer

An AI-powered interview system with voice support using Llama-3.2-3B model via Oxlo AI API.

## 🚀 Quick Start

### Local Development
```bash
# Clone and setup
git clone <your-repo>
cd ai-interviewer
npm run setup

# Start the server
npm start
```

### One-Click Deploy

| Platform | Link | Type |
|----------|------|------|
| **Replit** | [![Deploy on Replit](https://replit.com/badge/github/YOUR_USERNAME/ai-interviewer)](https://replit.com/github/YOUR_USERNAME/ai-interviewer) | Full Stack ✅ |
| **Vercel** | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/ai-interviewer) | Frontend Only |
| **Render** | [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/YOUR_USERNAME/ai-interviewer) | Full Stack ✅ |
| **Netlify** | [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/YOUR_USERNAME/ai-interviewer) | Frontend Only |

## 📋 Features

- 🤖 **AI Interviewer**: Powered by Llama-3.2-3B model
- 🎤 **Voice Support**: Real-time voice interaction
- 📄 **Resume Analysis**: Automatic resume parsing and question generation
- 📊 **Performance Tracking**: Real-time scoring and feedback
- 🔄 **Multiple Modes**: HR, DSA, System Design interviews
- 📱 **Responsive Design**: Works on all devices

## 🔧 Configuration

### Required Environment Variables
```bash
OXLO_API_KEY=your_oxlo_api_key_here
PORT=3001
```

### Get Your API Key
1. Visit [Oxlo AI](https://oxlo.ai)
2. Sign up and get your API key
3. Add it to your environment variables

## 🏗️ Project Structure

```
ai-interviewer/
├── backend/
│   ├── ai.js          # AI API integration
│   └── sessions.js    # Session management
├── frontend/
│   ├── src/           # React app source
│   └── public/        # Static assets
├── server.js          # Main server file
├── package.json       # Dependencies
└── .env.example       # Environment variables template
```

## 🌍 Deployment Options

### 1. Replit (Recommended - Free)
- Full WebSocket support
- Auto-deployment from GitHub
- Free tier available

### 2. Vercel + Render
- Vercel for frontend (static hosting)
- Render for backend (API + WebSocket)

### 3. Netlify + Railway
- Netlify for frontend
- Railway for backend

### 4. Glitch
- Full-stack deployment
- Easy to use

📖 **See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions**

## 🎯 Interview Modes

- **HR Mode**: Behavioral questions, cultural fit
- **DSA Mode**: Data structures, algorithms
- **System Design**: Architecture, scalability

## 📊 Difficulty Levels

- **Easy**: Beginner-friendly questions
- **Medium**: Intermediate level
- **Hard**: Advanced, challenging questions

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, WebSocket
- **Frontend**: React, Modern CSS
- **AI**: Llama-3.2-3B via Oxlo AI API
- **Real-time**: WebSocket for live interaction

## 📝 API Usage

The app uses Oxlo AI's OpenAI-compatible API with the Llama-3.2-3B model for:
- Resume analysis
- Question generation
- Response evaluation
- Final report generation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

If you encounter any issues:
1. Check the [DEPLOYMENT.md](./DEPLOYMENT.md) guide
2. Verify your API key is set correctly
3. Check platform-specific requirements
4. Open an issue on GitHub
