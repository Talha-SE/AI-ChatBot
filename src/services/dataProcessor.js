class DataProcessor {
    constructor(crawledData) {
        this.crawledData = crawledData;
    }

    process() {
        // Process the crawled data to extract useful information
        const processedData = this.crawledData.map(page => {
            return {
                title: page.title,
                content: this.extractContent(page),
                url: page.url
            };
        });
        return processedData;
    }

    extractContent(page) {
        // Extract relevant content from the page
        return page.content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    }

    getKeywords(page) {
        // Generate keywords from the page content
        const words = page.content.split(/\s+/);
        const keywordCount = {};
        words.forEach(word => {
            word = word.toLowerCase();
            keywordCount[word] = (keywordCount[word] || 0) + 1;
        });
        return Object.keys(keywordCount).sort((a, b) => keywordCount[b] - keywordCount[a]).slice(0, 10);
    }
}

module.exports = DataProcessor;