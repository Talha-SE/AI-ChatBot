const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/chat');
const CrawlerController = require('../controllers/crawler');
const Website = require('../models/website'); // Assuming the model is in models/website.js

const chatController = new ChatController();
const crawlerController = new CrawlerController();

// Route for handling user queries
router.post('/chat', chatController.handleUserQuery.bind(chatController));

// Route for starting a new chat
router.post('/chat/new', chatController.startNewChat.bind(chatController));

// Route for starting the website crawling process
router.post('/crawl', crawlerController.startCrawling.bind(crawlerController));

// Route to get all crawled websites
router.get('/websites', async (req, res) => {
    try {
        const websites = await Website.find({});
        res.json(websites);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch websites' });
    }
});

// Route to serve chatbot widget script
router.get('/widget', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.sendFile('widget/chatbot.js', { root: 'public' });
});

// Route to serve admin interface
router.get('/admin', (req, res) => {
    res.sendFile('admin/index.html', { root: 'public' });
});

// Route to serve chat interface
router.get('/chat-interface', (req, res) => {
    res.sendFile('chat/index.html', { root: 'public' });
});

// Route to serve integration guide
router.get('/integration', (req, res) => {
    res.sendFile('integration.html', { root: 'public' });
});

// Route to serve link tree page
router.get('/link-tree', (req, res) => {
    res.sendFile('link-tree.html', { root: 'public' });
});

// Route to get chatbot configuration
router.get('/config', async (req, res) => {
    try {
        const websites = await Website.find({});
        const config = {
            available: websites.length > 0,
            websiteCount: websites.length,
            totalPages: websites.reduce((sum, site) => sum + (site.pages?.length || 0), 0),
            lastUpdated: websites.length > 0 ? websites[0].updatedAt : null
        };
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch configuration' });
    }
});

// Route to get specific website data
router.get('/websites/:id', async (req, res) => {
    try {
        const website = await Website.findById(req.params.id);
        if (!website) {
            return res.status(404).json({ error: 'Website not found' });
        }
        res.json(website);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch website' });
    }
});

// Route to delete specific website data
router.delete('/websites/:id', async (req, res) => {
    try {
        const website = await Website.findByIdAndDelete(req.params.id);
        if (!website) {
            return res.status(404).json({ error: 'Website not found' });
        }
        res.json({ success: true, message: 'Website deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete website' });
    }
});

module.exports = router;