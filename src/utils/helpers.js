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

    generateMistralResponse: (text) => {
        // Function to format the text for the Mistral API request
        return {
            model: "mistral-small-latest",
            temperature: 0.7,
            messages: [
                {
                    role: "user",
                    content: text
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
    },

    formatProductResponse: (text, productExists = null) => {
        // Function to format product-related responses
        if (!text) return '';
        
        // Format the product response with better structure
        let formatted = text;
        
        // If we know the product status, enhance the response
        if (productExists === false) {
            // Extract any product suggestions from the response
            const suggestions = [];
            const lines = text.split('\n');
            
            for (const line of lines) {
                if (line.includes('recommend') || line.includes('suggest') || 
                    line.includes('alternative') || line.includes('similar') ||
                    line.match(/\b(try|check out)\b/i)) {
                    suggestions.push(line.trim());
                }
            }
            
            // If suggestions were found, format them nicely
            if (suggestions.length > 0) {
                formatted = "I couldn't find that exact product. Here are some alternatives you might like:\n\n";
                formatted += suggestions.join('\n');
            } else {
                formatted = "I couldn't find that exact product. " + text;
            }
        } else if (productExists === true) {
            // For existing products, ensure details are formatted well
            if (!text.includes('Price:') && !text.includes('price:')) {
                // Try to extract price if mentioned
                const priceMatch = text.match(/(\$\d+(\.\d{2})?|\d+(\.\d{2})?\s(USD|dollars))/i);
                if (priceMatch) {
                    const price = priceMatch[0];
                    formatted = text.replace(price, `Price: ${price}`);
                }
            }
        }
        
        return formatted;
    },
    
    isProductQuery: (text) => {
        // Function to detect if a query is product-related
        if (!text) return false;
        
        const productIndicators = [
            'product', 'buy', 'purchase', 'order', 'item',
            'how much', 'price', 'cost', 'available', 'in stock',
            'shipping', 'delivery', 'model', 'brand', 'version'
        ];
        
        const lowercaseText = text.toLowerCase();
        return productIndicators.some(indicator => lowercaseText.includes(indicator));
    }
};