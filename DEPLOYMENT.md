# AI Chatbot Deployment Guide

## 🚀 Deploy to Vercel

### Prerequisites
- GitHub account
- Vercel account
- MongoDB Atlas database
- Google Gemini API key

### Step 1: Push to GitHub

1. **Initialize Git repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create GitHub repository:**
   - Go to GitHub and create a new repository
   - Don't initialize with README (since you already have files)

3. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/yourusername/ai-chatbot.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy to Vercel

1. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment Variables:**
   In Vercel dashboard, add these environment variables:
   ```
   API_KEY=your_gemini_api_key
   DATABASE_URL=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

3. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app will be available at: `https://your-app-name.vercel.app`

### Step 3: Test Deployment

1. **Admin Interface:**
   - Visit: `https://your-app-name.vercel.app/api/admin`
   - Crawl a website to test functionality

2. **Chat Interface:**
   - Visit: `https://your-app-name.vercel.app/api/chat-interface`
   - Test chatbot responses

3. **Widget Integration:**
   - Embed script: `<script src="https://your-app-name.vercel.app/api/widget"></script>`

### Environment Variables Explained

- `API_KEY`: Your Google Gemini API key
- `DATABASE_URL`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens (generate a random string)

### Post-Deployment Checklist

- [ ] Admin interface loads correctly
- [ ] Chat interface works
- [ ] Website crawling functions
- [ ] Database connection established
- [ ] API endpoints respond correctly

### Troubleshooting

**Common Issues:**
1. **Database connection fails:** Check DATABASE_URL format
2. **API key errors:** Verify Gemini API key is correct
3. **Timeout errors:** Adjust vercel.json maxDuration if needed

**Logs:**
- Check Vercel function logs in dashboard
- Monitor API responses for errors

### Custom Domain (Optional)

1. Go to Vercel project settings
2. Add your custom domain
3. Configure DNS records as instructed
4. Update embed scripts with new domain

---

**Need Help?** Check the main README.md for detailed setup instructions.
