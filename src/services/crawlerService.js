const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');

class CrawlerService {
    constructor(baseUrl, options = {}) {
        this.baseUrl = this.normalizeUrl(baseUrl);
        this.domain = new URL(this.baseUrl).hostname;
        this.visitedUrls = new Set();
        this.data = [];
        
        // Configuration options
        this.maxPages = options.maxPages || 10;
        this.includeExternalLinks = options.includeExternalLinks || false;
        this.maxDepth = options.maxDepth || 3;
        this.timeout = options.timeout || 15000;
        this.respectRobots = options.respectRobots || true;
        
        this.currentDepth = 0;
    }

    normalizeUrl(url) {
        if (!url) throw new Error('URL is required');
        
        // Remove whitespace and common prefixes
        url = url.trim();
        
        // Handle different URL formats
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        
        // Remove www. if present and add https://
        if (url.startsWith('www.')) {
            return 'https://' + url;
        }
        
        // Handle URLs without protocol
        if (url.includes('.')) {
            // Check if it looks like a domain
            const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
            if (domainRegex.test(url.split('/')[0])) {
                return 'https://' + url;
            }
        }
        
        throw new Error('Invalid URL format');
    }

    async crawl(url = null, depth = 0) {
        const targetUrl = url || this.baseUrl;
        
        if (this.visitedUrls.has(targetUrl) || 
            this.data.length >= this.maxPages || 
            depth > this.maxDepth) {
            return;
        }

        this.visitedUrls.add(targetUrl);
        
        try {
            console.log(`Crawling (depth ${depth}): ${targetUrl}`);
            
            const response = await axios.get(targetUrl, {
                timeout: this.timeout,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                },
                maxRedirects: 5,
                validateStatus: (status) => status < 400
            });
            
            const $ = cheerio.load(response.data);
            await this.extractData($, targetUrl);
            
            // Only crawl more links if we haven't reached the limit
            if (this.data.length < this.maxPages && depth < this.maxDepth) {
                const links = this.getLinks($, targetUrl);
                
                // Limit concurrent requests
                const batchSize = 3;
                for (let i = 0; i < links.length && this.data.length < this.maxPages; i += batchSize) {
                    const batch = links.slice(i, i + batchSize);
                    const promises = batch.map(link => this.crawl(link, depth + 1));
                    await Promise.allSettled(promises);
                    
                    // Add delay between batches
                    if (i + batchSize < links.length) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
            }
        } catch (error) {
            console.log(`Failed to crawl ${targetUrl}: ${error.message}`);
        }
    }

    async extractData($, url) {
        const title = $('title').text().trim() || $('h1').first().text().trim() || 'No Title';
        
        // Extract content
        const contentSelectors = ['main', 'article', '.content', '#content', 'body'];
        let content = '';
        
        for (const selector of contentSelectors) {
            const element = $(selector).first();
            if (element.length > 0) {
                element.find('script, style, nav, header, footer, aside').remove();
                content = element.text().trim();
                if (content.length > 100) break;
            }
        }
        
        // Clean up the text
        const cleanContent = content
            .replace(/\s+/g, ' ')
            .replace(/\n+/g, ' ')
            .trim();
        
        if (cleanContent.length > 50) {
            this.data.push({ 
                url, 
                title, 
                content: cleanContent.substring(0, 8000),
                crawledAt: new Date(),
                wordCount: cleanContent.split(' ').length
            });
        }
    }

    getLinks($, currentUrl) {
        const links = [];
        const currentDomain = new URL(currentUrl).hostname;
        
        $('a[href]').each((_, element) => {
            const href = $(element).attr('href');
            if (href && href.trim()) {
                try {
                    let absoluteUrl;
                    
                    if (href.startsWith('http://') || href.startsWith('https://')) {
                        absoluteUrl = href;
                    } else {
                        absoluteUrl = new URL(href, currentUrl).href;
                    }
                    
                    const urlObj = new URL(absoluteUrl);
                    const linkDomain = urlObj.hostname;
                    
                    const isExternalLink = linkDomain !== currentDomain;
                    const shouldInclude = this.includeExternalLinks || !isExternalLink;
                    
                    if (shouldInclude && 
                        !this.visitedUrls.has(absoluteUrl) &&
                        this.isValidLink(absoluteUrl)) {
                        links.push(absoluteUrl);
                    }
                } catch (urlError) {
                    // Skip invalid URLs
                }
            }
        });
        
        return links.slice(0, 10); // Limit number of links
    }

    isValidLink(url) {
        try {
            const urlObj = new URL(url);
            
            // Skip certain file types
            const skipExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.zip'];
            const pathname = urlObj.pathname.toLowerCase();
            
            if (skipExtensions.some(ext => pathname.endsWith(ext))) {
                return false;
            }
            
            return ['http:', 'https:'].includes(urlObj.protocol);
        } catch {
            return false;
        }
    }

    getCrawledData() {
        return this.data;
    }

    getStats() {
        const totalWords = this.data.reduce((sum, page) => sum + (page.wordCount || 0), 0);
        const avgWordsPerPage = this.data.length > 0 ? Math.round(totalWords / this.data.length) : 0;
        
        return {
            totalPages: this.data.length,
            totalWords,
            avgWordsPerPage,
            visitedUrls: this.visitedUrls.size,
            domains: [...new Set(this.data.map(page => new URL(page.url).hostname))]
        };
    }
}

module.exports = CrawlerService;