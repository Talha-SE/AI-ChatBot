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

    formatProductResponse: (text) => {
        // Specialized function for formatting product-related responses
        if (!text) return '';
        
        // First apply basic formatting
        let formatted = text
            .replace(/\*{1,3}(.*?)\*{1,3}/g, '$1')  // Remove asterisks
            .replace(/#{1,6}\s/g, '')               // Remove headers
            .replace(/`{1,3}(.*?)`{1,3}/g, '$1')    // Remove code blocks
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Keep link text only
            .trim();
    
        // Identify and highlight key product details (price, category, etc.)
        const priceMatch = formatted.match(/(\$\d+(\.\d{1,2})?|\d+(\.\d{1,2})?\s*(?:USD|dollars|€|£))/i);
        const categoryMatch = formatted.match(/category:?\s*([^\.,:;\n]+)/i);
        
        // Keep sentences concise and product-focused
        let sentences = formatted.split(/(?<=[.!?])\s+/);
        sentences = sentences.filter(s => 
            s.trim().length > 0 && 
            !s.toLowerCase().includes('i don\'t have') && 
            !s.toLowerCase().includes('i\'m not able') &&
            !s.toLowerCase().includes('i cannot provide')
        );
        
        if (sentences.length > 3) {
            sentences = sentences.slice(0, 3); // Keep only first 3 sentences for brevity
        }
        
        formatted = sentences.join(' ');
        
        // Format in a more structured way if we found price/category
        if (priceMatch || categoryMatch) {
            let structuredResponse = '';
            
            if (sentences.length > 0 && !sentences[0].toLowerCase().includes('price') && !sentences[0].toLowerCase().includes('category')) {
                // Use first sentence as general description
                structuredResponse = sentences[0] + ' ';
            }
            
            // Add price if found
            if (priceMatch) {
                structuredResponse += `Price: ${priceMatch[0]}. `;
            }
            
            // Add category if found
            if (categoryMatch) {
                structuredResponse += `Category: ${categoryMatch[1]}. `;
            }
            
            // Add any other details
            sentences.slice(1).forEach(sentence => {
                if (!sentence.toLowerCase().includes('price') && 
                    !sentence.toLowerCase().includes('category') && 
                    sentence.trim().length > 0) {
                    structuredResponse += sentence + ' ';
                }
            });
            
            formatted = structuredResponse.trim();
        }
        
        // Ensure proper capitalization and punctuation
        if (formatted.length > 0) {
            formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
            if (!/[.!?]$/.test(formatted)) {
                formatted += '.';
            }
        }
        
        return formatted;
    },

    // New functions for file processing
    processTrainingFile: (fileBuffer, fileType) => {
        // Function to process uploaded training files
        try {
            if (fileType === 'application/json') {
                // Process JSON file
                const jsonString = fileBuffer.toString();
                console.log(`Processing JSON file, size: ${jsonString.length} bytes`);
                
                try {
                    const jsonData = JSON.parse(jsonString);
                    return formatTrainingData(jsonData);
                } catch (jsonError) {
                    console.error('JSON parse error:', jsonError);
                    return { error: `Invalid JSON format: ${jsonError.message}` };
                }
            } else if (fileType.includes('text/')) {
                // Process text file (CSV, plain text, etc.)
                const textData = fileBuffer.toString();
                
                // Check if it's a CSV file
                if (fileType === 'text/csv') {
                    return processCSVData(textData);
                }
                
                // Plain text - split by paragraphs
                return processPlainText(textData);
            } else if (fileType === 'application/pdf') {
                // For PDF files, return basic text content
                // Note: Real PDF processing would require additional libraries
                return { error: 'PDF processing requires additional setup' };
            } else {
                return { error: 'Unsupported file type' };
            }
        } catch (error) {
            console.error('File processing error:', error);
            return { error: `Failed to process file: ${error.message}` };
        }
    },

    formatTrainingData: (data) => {
        // Convert different data formats to a standardized training format
        if (Array.isArray(data)) {
            // Handle array data
            return data.map(item => {
                // Extract question/answer pairs or content blocks
                if (item.question && item.answer) {
                    return {
                        title: item.question,
                        content: item.answer,
                        category: item.category || 'FAQ'
                    };
                } else if (item.content) {
                    return {
                        content: item.content,
                        title: item.title || 'Untitled',
                        category: item.category || 'General'
                    };
                } else if (typeof item === 'string') {
                    return {
                        content: item,
                        title: item.substring(0, 30) + '...',
                        category: 'General'
                    };
                }
                return item;
            });
        } else if (typeof data === 'object') {
            // Handle object data
            const formattedData = [];
            for (const key in data) {
                if (typeof data[key] === 'string') {
                    formattedData.push({
                        title: key,
                        content: data[key],
                        category: 'General'
                    });
                } else if (typeof data[key] === 'object') {
                    // Handle nested objects - could be QA pairs or structured content
                    const item = data[key];
                    if (item.question && item.answer) {
                        formattedData.push({
                            title: item.question,
                            content: item.answer,
                            category: item.category || key || 'FAQ'
                        });
                    } else if (item.title && (item.content || item.text)) {
                        formattedData.push({
                            title: item.title,
                            content: item.content || item.text,
                            category: item.category || key || 'General'
                        });
                    } else {
                        // Flatten the object
                        formattedData.push({
                            title: key,
                            content: JSON.stringify(item),
                            category: 'General'
                        });
                    }
                }
            }
            return formattedData;
        }
        
        return { error: 'Invalid data format' };
    }
};

// Helper functions for file processing
function formatTrainingData(data) {
    // Default formatting for general training data
    try {
        if (Array.isArray(data)) {
            const formattedData = [];
            for (const item of data) {
                // Skip null or empty items
                if (!item) continue;
                
                if (typeof item === 'string') {
                    // Simple string entries
                    formattedData.push({
                        title: item.substring(0, 50).trim() || 'Text Entry',
                        content: item,
                        category: 'General'
                    });
                } else if (typeof item === 'object') {
                    // Handle different JSON structures
                    // Case 1: Question-Answer format
                    if (item.question && (item.answer || item.response)) {
                        formattedData.push({
                            title: item.question,
                            content: item.answer || item.response,
                            category: item.category || 'FAQ'
                        });
                    }
                    // Case 2: Title-Content format (like articles)
                    else if (item.title && (item.content || item.text || item.body)) {
                        formattedData.push({
                            title: item.title,
                            content: item.content || item.text || item.body,
                            category: item.category || 'Article'
                        });
                    }
                    // Case 3: Name-Value pairs
                    else if (item.name && item.value) {
                        formattedData.push({
                            title: item.name,
                            content: item.value,
                            category: item.category || 'Data'
                        });
                    }
                    // Case 4: Key-Content pairs (custom format)
                    else if (Object.keys(item).length > 0) {
                        // Use the first field as title if no title field exists
                        const firstKey = Object.keys(item)[0];
                        const title = item.title || item.name || firstKey;
                        
                        // Try to find the main content
                        const content = item.content || item.text || item.body || 
                                        item.description || item[firstKey] || 
                                        JSON.stringify(item);
                                        
                        formattedData.push({
                            title: title,
                            content: content,
                            category: item.category || 'General'
                        });
                    }
                }
            }
            
            return formattedData;
        } else if (typeof data === 'object' && !Array.isArray(data)) {
            // Handle object with key-value pairs
            return Object.entries(data).map(([key, value]) => {
                if (typeof value === 'string') {
                    return {
                        title: key,
                        content: value,
                        category: 'General'
                    };
                } else if (typeof value === 'object') {
                    return {
                        title: key,
                        content: JSON.stringify(value),
                        category: 'JSON'
                    };
                }
                return {
                    title: key,
                    content: String(value),
                    category: 'General'
                };
            });
        }
    } catch (error) {
        console.error('Error formatting training data:', error);
        return { error: 'Failed to format data: ' + error.message };
    }
    
    return { error: 'Invalid data format' };
}

function processCSVData(csvText) {
    // Basic CSV processing
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const result = [];
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',').map(v => v.trim());
        const entry = {};
        
        headers.forEach((header, index) => {
            entry[header] = values[index] || '';
        });
        
        result.push(entry);
    }
    
    return result;
}

function processPlainText(text) {
    // Convert plain text to content blocks
    const paragraphs = text.split(/\n\s*\n/); // Split by paragraph
    
    return paragraphs
        .filter(p => p.trim().length > 0)
        .map((content, index) => ({
            title: `Section ${index + 1}`,
            content: content.trim(),
            category: 'General'
        }));
}