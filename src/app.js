require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const connectDB = require('../config/database');
const adminRoutes = require('./routes/admin');
const chatRoutes = require('./routes/chat');
const apiRoutes = require('./routes/api');

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Verify critical environment variables
if (!process.env.API_KEY) {
    console.error('ERROR: Gemini API_KEY is not set. Please add it to your environment variables.');
}

if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL is not set. Please add it to your environment variables.');
}

if (!process.env.JWT_SECRET) {
    console.warn('WARNING: JWT_SECRET is not set. Using a default value is insecure.');
}

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// CORS for Vercel deployment
app.use((req, res, next) => {
    const allowedOrigins = [
        'https://ai-chatbot-silk-three.vercel.app',
        'http://localhost:3000',
        'http://localhost:3001'
    ];
    
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    } else {
        res.header('Access-Control-Allow-Origin', '*');
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// API Documentation route
app.get('/', (req, res) => {
    const baseUrl = req.protocol + '://' + req.get('host');
    res.json({
        name: "AI Chatbot API",
        version: "1.0.0",
        description: "Complete AI Chatbot API with embedded interfaces",
        deployment: "Vercel Serverless",
        status: "Active",
        endpoints: {
            chat: {
                "/api/chat": "POST - Send message to chatbot",
                "/api/chat/new": "POST - Start new conversation"
            },
            admin: {
                "/api/admin": "GET - Access admin interface",
                "/api/crawl": "POST - Crawl new website",
                "/api/websites": "GET - List all websites",
                "/api/websites/:id": "GET/DELETE - Manage specific website"
            },
            widget: {
                "/api/widget": "GET - Get embeddable chatbot script",
                "/api/chat-interface": "GET - Access standalone chat interface"
            },
            system: {
                "/api/config": "GET - Get chatbot configuration and status"
            }
        },
        integration: {
            embed_chatbot: "Add <script src='YOUR_DOMAIN/api/widget'></script> to any website",
            admin_access: "Visit YOUR_DOMAIN/api/admin for management",
            chat_interface: "Visit YOUR_DOMAIN/api/chat-interface for testing"
        },
        examples: {
            embed_script: `<script src='${baseUrl}/api/widget'></script>`,
            admin_url: `${baseUrl}/api/admin`,
            chat_url: `${baseUrl}/api/chat-interface`
        }
    });
});

// Legacy routes for backward compatibility
app.get('/chat', (req, res) => {
    res.redirect('/api/chat-interface');
});

app.get('/admin', (req, res) => {
    res.redirect('/api/admin');
});

// Routes
app.use('/admin', adminRoutes);
app.use('/chat', chatRoutes);
app.use('/api', apiRoutes);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Route not found',
        availableRoutes: ['/api/admin', '/api/chat-interface', '/api/chat', '/api/crawl']
    });
});

// For Vercel deployment
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
        console.log(`Chat interface: http://localhost:${PORT}/api/chat-interface`);
        console.log(`Admin panel: http://localhost:${PORT}/api/admin`);
    });
}

// Export for Vercel
module.exports = app;