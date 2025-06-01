# AI Chatbot Project

[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Talha-SE/AI-ChatBot)

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

- **Admin Dashboard**: [https://your-app.vercel.app/api/admin](https://your-app.vercel.app/api/admin)
- **Chat Interface**: [https://your-app.vercel.app/api/chat-interface](https://your-app.vercel.app/api/chat-interface)
- **API Documentation**: [https://your-app.vercel.app](https://your-app.vercel.app)

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
git clone https://github.com/Talha-SE/AI-ChatBot.git
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

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Talha-SE/AI-ChatBot)

**Quick Deploy:**
1. Click the button above
2. Connect your GitHub account
3. Add environment variables:
   - `API_KEY` (Gemini API key)
   - `DATABASE_URL` (MongoDB connection)
   - `JWT_SECRET` (Random secret key)
4. Deploy!

**Manual Deploy:** See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## 📚 Environment Variables

```bash
API_KEY=your_gemini_api_key_here
DATABASE_URL=your_mongodb_connection_string
JWT_SECRET=your_random_secret_key
PORT=3000
```

## 🎯 Integration

### Embed Chatbot Widget
Add this single line to any website:
```html
<script src="https://your-app.vercel.app/api/widget"></script>
```

### API Usage
```javascript
// Send message to chatbot
fetch('https://your-app.vercel.app/api/chat', {
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

This project is licensed under a **Commercial License** - see the [LICENSE](LICENSE) file for details.

**All Rights Reserved**

This software is the exclusive property of Talha-SE. 

**LICENSE OPTIONS:**

**🆓 Personal/Evaluation License (FREE)**
- ✅ Personal evaluation and testing only
- ❌ No commercial use
- ❌ No redistribution or sharing
- ❌ No modification
- 📧 Requires written permission

**💼 Commercial License (PAID)**
- ✅ Commercial use and deployment
- ✅ Business integration
- ✅ Support and updates included
- ✅ Custom enterprise terms available
- 💰 **Contact for pricing:** rtalha.work@gmail.com

**Unauthorized use is strictly prohibited**

**To obtain a license or pricing information, contact:** rtalha.work@gmail.com

© 2025 Talha-SE. All rights reserved.

## 🆘 Support

- **Documentation**: Check this README and DEPLOYMENT.md
- **Issues**: Create GitHub issue for bugs at https://github.com/Talha-SE/AI-ChatBot/issues
- **Discussions**: Use GitHub discussions for questions
- **Email**: rtalha.work@gmail.com

## 🙏 Acknowledgments

- Google Gemini AI for natural language processing
- Vercel for serverless hosting
- MongoDB for database services
- Open source community for tools and libraries

---

**Made with ❤️**