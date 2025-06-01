const Website = require('../models/website');
const CrawlerService = require('../services/crawlerService');

class AdminController {
    static async getDashboard(req, res) {
        try {
            res.sendFile('admin/index.html', { root: 'public' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to load admin dashboard' });
        }
    }

    static async setupChatbot(req, res) {
        try {
            const { websiteUrl } = req.body;
            
            if (!websiteUrl) {
                return res.status(400).json({ error: 'Website URL is required' });
            }

            // Start crawling the website
            const crawler = new CrawlerService(websiteUrl);
            await crawler.crawl(websiteUrl);
            const crawledData = crawler.getCrawledData();

            // Save website data to database
            const website = new Website({
                url: websiteUrl,
                title: crawledData[0]?.title || 'Unknown',
                pages: crawledData.map(page => ({
                    path: page.url,
                    content: page.body
                }))
            });

            await website.save();
            res.json({ success: true, message: 'Website crawled successfully' });
        } catch (error) {
            console.error('Setup error:', error);
            res.status(500).json({ error: 'Failed to setup chatbot' });
        }
    }

    static async getWebsites(req, res) {
        try {
            const websites = await Website.find({});
            res.json(websites);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch websites' });
        }
    }

    static async deleteWebsite(req, res) {
        try {
            await Website.findByIdAndDelete(req.params.id);
            res.json({ success: true, message: 'Website deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete website' });
        }
    }
}

module.exports = AdminController;