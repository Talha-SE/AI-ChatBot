# AI Chatbot Project

[![License: CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/ai-chatbot)

This project implements an AI chatbot that can be integrated into any website to handle user queries. The chatbot utilizes the Gemini API for generating responses based on the content of the specified website.

## 🌟 Features

- **Website Crawling**: Automatically crawls and indexes website content
- **AI-Powered Responses**: Uses Google Gemini API for intelligent responses
- **Easy Integration**: Simple script tag integration for any website
- **Admin Dashboard**: Comprehensive management interface
- **Real-time Chat**: Interactive chat interface with conversation history
- **Responsive Design**: Works on desktop and mobile devices
- **Serverless Deployment**: Optimized for Vercel deployment

## 🚀 Live Demo

- **API Documentation**: [https://ai-chatbot-silk-three.vercel.app](https://ai-chatbot-silk-three.vercel.app)
- **Admin Dashboard**: [https://ai-chatbot-silk-three.vercel.app/api/admin](https://ai-chatbot-silk-three.vercel.app/api/admin)
- **Chat Interface**: [https://ai-chatbot-silk-three.vercel.app/api/chat-interface](https://ai-chatbot-silk-three.vercel.app/api/chat-interface)

## 📁 Project Structure

```
ai-chatbot/
├── src/
│   ├── app.js                  # Main application entry point
│   ├── controllers/            # Request handlers
│   ├── services/              # Business logic (Gemini AI, Web Crawler)
│   ├── models/                # Database models
│   ├── routes/                # API routes
│   └── utils/                 # Utility functions
├── public/                    # Static files (Admin & Chat interfaces)
├── config/                    # Configuration files
├── vercel.json               # Vercel deployment configuration
├── package.json              # Dependencies and scripts
└── README.md                 # This file
```

## 🛠️ Quick Setup

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/ai-chatbot.git
cd ai-chatbot
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
# Edit .env with your credentials
```

### 3. Run Locally
```bash
npm start
# or for development
npm run dev
```

### 4. Access Interfaces
- Admin: http://localhost:3000/api/admin
- Chat: http://localhost:3000/api/chat-interface

## 🌐 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/ai-chatbot)

**Quick Deploy:**
1. Click the button above
2. Connect your GitHub account
3. Add environment variables in Vercel dashboard:
   - `API_KEY` (Your Gemini API key)
   - `DATABASE_URL` (Your MongoDB connection string)
   - `JWT_SECRET` (Your JWT secret key)
4. Deploy!

**Manual Deploy:** See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## 📚 Environment Variables

Add these in Vercel dashboard under Settings > Environment Variables:

```bash
API_KEY=your_gemini_api_key_here
DATABASE_URL=your_mongodb_connection_string
JWT_SECRET=your_random_secret_key
```

## 🎯 Integration

### Embed Chatbot Widget
Add this single line to any website:
```html
<script src="https://ai-chatbot-silk-three.vercel.app/api/widget"></script>
```

### API Usage
```javascript
// Send message to chatbot
fetch('https://ai-chatbot-silk-three.vercel.app/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Hello!' })
})
```

## 📋 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | POST | Send message to chatbot |
| `/api/chat/new` | POST | Start new conversation |
| `/api/crawl` | POST | Crawl new website |
| `/api/websites` | GET | List crawled websites |
| `/api/admin` | GET | Admin dashboard |
| `/api/widget` | GET | Chatbot widget script |

## 🔧 Configuration

### Crawling Options
- **Max Pages**: 1-100 pages per website
- **Max Depth**: 1-5 levels deep
- **External Links**: Include/exclude external domains
- **Timeout**: 5-30 seconds per request

### Supported Formats
- **URLs**: `example.com`, `www.example.com`, `https://example.com`
- **Content**: HTML pages, articles, documentation
- **Languages**: Multi-language support through Gemini AI

## 🛡️ Security Features

- Environment variable protection
- CORS configuration
- Input validation and sanitization
- Rate limiting ready
- Secure database connections

## 🎨 Customization

### Styling
- Modify `/public/chat/style.css` for chat interface
- Update `/public/admin/style.css` for admin dashboard
- Customize colors, fonts, and layouts

### Functionality
- Extend AI prompts in `/src/services/geminiService.js`
- Add new crawling strategies in `/src/services/crawlerService.js`
- Create custom routes in `/src/routes/`

## 📱 Mobile Support

- Responsive design for all screen sizes
- Touch-optimized interactions
- Mobile-friendly admin interface
- Progressive Web App ready

## 🔍 Monitoring & Analytics

- Built-in request logging
- Error tracking and reporting
- Performance metrics
- Usage statistics in admin dashboard

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

## 📄 License

This project is licensed under the Creative Commons Attribution 4.0 International License (CC BY 4.0) - see the [LICENSE](LICENSE) file for details.

**You are free to:**
- Share — copy and redistribute the material in any medium or format
- Adapt — remix, transform, and build upon the material for any purpose, even commercially

**Under the following terms:**
- Attribution — You must give appropriate credit, provide a link to the license, and indicate if changes were made

© 2025 AI Chatbot Project. Licensed under [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/).

## 🆘 Support

- **Live Demo**: [https://ai-chatbot-silk-three.vercel.app](https://ai-chatbot-silk-three.vercel.app)
- **Documentation**: Check this README and DEPLOYMENT.md
- **Issues**: Create GitHub issue for bugs
- **Discussions**: Use GitHub discussions for questions

## 🙏 Acknowledgments

- Google Gemini AI for natural language processing
- Vercel for serverless hosting
- MongoDB for database services
- Open source community for tools and libraries

---

**Made with ❤️ for the developer community**