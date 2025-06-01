module.exports = {
    generateResponse: (text) => {
        // Function to format the text for the Gemini API request
        return {
            contents: [
                {
                    parts: [
                        {
                            text: text
                        }
                    ]
                }
            ]
        };
    },

    validateUrl: (url) => {
        // Function to validate the provided URL
        const urlPattern = new RegExp('^(https?:\\/\\/)?' + // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])?)\\.)+([a-z]{2,}|[a-z\\d-]{2,})|' + // domain name
            'localhost|' + // localhost
            '\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}|' + // IP address
            '\\[?[a-fA-F0-9]*:[a-fA-F0-9:%.~+\\-]*\\])' + // IPv6
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+:]*)*' + // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
            '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
        return !!urlPattern.test(url);
    },

    extractDomain: (url) => {
        // Function to extract the domain from a URL
        const urlObj = new URL(url);
        return urlObj.hostname;
    },

    formatChatResponse: (text) => {
        // Function to format chat responses for better readability
        if (!text) return '';
        
        // Remove excessive formatting and make it conversational
        let formatted = text
            .replace(/\*{1,3}(.*?)\*{1,3}/g, '$1')  // Remove asterisks
            .replace(/#{1,6}\s/g, '')               // Remove headers
            .replace(/`{1,3}(.*?)`{1,3}/g, '$1')    // Remove code blocks
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Keep link text only
            .replace(/^\s*[-*+•]\s/gm, '')          // Remove bullet points
            .replace(/^\s*\d+\.\s/gm, '')           // Remove numbered lists
            .replace(/\n{3,}/g, '\n\n')             // Limit line breaks
            .replace(/\s+/g, ' ')                   // Normalize spaces
            .trim();

        // Ensure proper capitalization and punctuation
        if (formatted.length > 0) {
            formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
            if (!/[.!?]$/.test(formatted)) {
                formatted += '.';
            }
        }

        return formatted;
    }
};