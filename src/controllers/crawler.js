const axios = require('axios');
const CrawlerService = require('../services/crawlerService');
const Website = require('../models/website');

class CrawlerController {
    constructor() {
        this.visitedUrls = new Set();
    }

    async startCrawling(req, res) {
        try {
            const { 
                url, 
                maxPages = 10, 
                includeExternalLinks = false,
                maxDepth = 3,
                timeout = 15000
            } = req.body;
            
            if (!url) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'URL is required' 
                });
            }

            // Validate and normalize URL
            let normalizedUrl;
            try {
                const crawler = new CrawlerService(url, {
                    maxPages: Math.min(Math.max(parseInt(maxPages), 1), 100),
                    includeExternalLinks: Boolean(includeExternalLinks),
                    maxDepth: Math.min(Math.max(parseInt(maxDepth), 1), 5),
                    timeout: Math.min(Math.max(parseInt(timeout), 5000), 30000)
                });
                normalizedUrl = crawler.baseUrl;
            } catch (error) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Invalid URL format: ${error.message}` 
                });
            }

            console.log(`Starting to crawl: ${normalizedUrl}`);
            
            // Test if the URL is accessible first
            try {
                await axios.get(normalizedUrl, { 
                    timeout: 10000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    },
                    maxRedirects: 5
                });
            } catch (testError) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Cannot access the website: ${testError.message}` 
                });
            }

            const crawler = new CrawlerService(normalizedUrl, {
                maxPages,
                includeExternalLinks,
                maxDepth,
                timeout
            });

            await crawler.crawl();
            const crawledData = crawler.getCrawledData();
            const stats = crawler.getStats();

            if (crawledData.length === 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'No content could be extracted from the website.' 
                });
            }

            // Save to database
            const existingWebsite = await Website.findOne({ url: normalizedUrl });
            if (existingWebsite) {
                existingWebsite.pages = crawledData.map(page => ({
                    path: page.url,
                    content: page.content,
                    title: page.title,
                    wordCount: page.wordCount,
                    crawledAt: page.crawledAt
                }));
                existingWebsite.title = crawledData[0]?.title || 'Unknown';
                existingWebsite.description = `Crawled ${crawledData.length} pages`;
                existingWebsite.metadata = { ...stats };
                existingWebsite.updatedAt = new Date();
                await existingWebsite.save();
            } else {
                const website = new Website({
                    url: normalizedUrl,
                    title: crawledData[0]?.title || 'Unknown',
                    description: `Crawled ${crawledData.length} pages`,
                    pages: crawledData.map(page => ({
                        path: page.url,
                        content: page.content,
                        title: page.title,
                        wordCount: page.wordCount,
                        crawledAt: page.crawledAt
                    })),
                    metadata: { ...stats }
                });
                await website.save();
            }

            res.json({ 
                success: true, 
                message: `Website crawled successfully! Found ${crawledData.length} pages.`,
                pagesCount: crawledData.length,
                stats
            });
        } catch (error) {
            console.error('Crawling error:', error);
            res.status(500).json({ 
                success: false, 
                message: `Failed to crawl website: ${error.message}` 
            });
        }
    }
}

module.exports = CrawlerController;