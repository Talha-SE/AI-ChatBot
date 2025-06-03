const axios = require('axios');

class GeminiService {
    constructor() {
        this.apiKey = process.env.API_KEY;
        this.apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    }

    async generateResponse(userQuery, contextData, conversationHistory = [], isProductQuery = false) {
        try {
            if (!this.apiKey) {
                throw new Error('Gemini API key not found');
            }

            // Prepare context from website data and training data
            let context = '';
            
            // Prioritize product information if it's a product query
            if (isProductQuery) {
                const productContext = this.getProductContext(userQuery, contextData);
                if (productContext.length > 0) {
                    context = 'Here is the relevant product information:\n\n' + 
                              productContext.map(item => {
                                  return `## ${item.title}\n${item.content}\n\n`;
                              }).join('---\n');
                }
            } else {
                // Otherwise use relevant context based on query keywords
                const relevantContext = this.getRelevantContext(userQuery, contextData);
                
                if (relevantContext.length > 0) {
                    context = 'Here is the relevant information:\n\n' + 
                              relevantContext.map(item => {
                                  let source = '';
                                  if (item.source === 'website') {
                                      source = ' (from crawled website)';
                                  } else if (item.source === 'training') {
                                      source = ` (from ${item.category} training data)`;
                                  }
                                  
                                  return `## ${item.title}${source}\n${item.content}\n\n`;
                              }).join('---\n');
                }
            }

            // Format conversation history
            const formattedHistory = conversationHistory.map(msg => {
                return `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`;
            }).join('\n');

            // Construct the prompt with specific instructions based on query type
            let prompt = '';
            
            if (formattedHistory) {
                prompt += `Previous conversation:\n${formattedHistory}\n\n`;
            }
            
            if (context) {
                prompt += `${context}\n\n`;
            }
            
            prompt += `User: ${userQuery}\n\n`;
            
            if (isProductQuery) {
                prompt += `Assistant: Please provide a concise answer about the product. Include key details such as price, category, features, and availability if that information is present. Keep your response brief and directly answer the user's question without unnecessary information. If specific product details are not available, acknowledge that and provide what you do know.\n\n`;
            } else {
                prompt += `Assistant: Please provide a helpful and concise response. Keep your answer direct and to the point, focusing only on what the user asked.\n\n`;
            }

            // Make the API call
            const response = await axios.post(
                `${this.apiEndpoint}?key=${this.apiKey}`,
                {
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024
                    }
                }
            );

            // Extract and return the response text
            const generatedText = response.data.candidates[0]?.content?.parts[0]?.text || '';
            return generatedText;
        } catch (error) {
            console.error('Gemini API error:', error.response?.data || error.message);
            throw new Error('Failed to generate response from Gemini API');
        }
    }
    
    getRelevantContext(query, contextData) {
        // Simple relevance matching based on keywords
        const queryWords = query.toLowerCase().split(/\s+/);
        const keywordMap = {};
        
        // Count keyword occurrences
        queryWords.forEach(word => {
            if (word.length > 3) { // Skip short words
                keywordMap[word] = (keywordMap[word] || 0) + 1;
            }
        });
        
        // Score each context item
        const scoredContext = contextData.map(item => {
            const content = (item.title + ' ' + item.content).toLowerCase();
            let score = 0;
            
            // Calculate score based on keyword matches
            Object.keys(keywordMap).forEach(keyword => {
                const regex = new RegExp(keyword, 'gi');
                const matches = (content.match(regex) || []).length;
                score += matches * keywordMap[keyword];
            });
            
            return { ...item, score };
        });
        
        // Sort by relevance score and take top items
        const sortedContext = scoredContext
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 5); // Limit to top 5 most relevant items
            
        return sortedContext;
    }

    // Special method for product queries
    getProductContext(query, contextData) {
        // Extract product-related terms from the query
        const queryWords = query.toLowerCase().split(/\s+/);
        const productTerms = queryWords.filter(word => 
            word.length > 3 && 
            !['what', 'when', 'where', 'which', 'who', 'why', 'how', 'the', 'and', 'for', 'with'].includes(word)
        );
        
        // Filter context items that are products or contain product information
        const productItems = contextData.filter(item => {
            // Check if the item is categorized as a product
            if (item.category && ['product', 'products', 'catalog', 'pricing'].includes(item.category.toLowerCase())) {
                return true;
            }
            
            // Look for product indicators in the content
            const content = (item.title + ' ' + item.content).toLowerCase();
            if (content.includes('price:') || 
                content.includes('$') || 
                content.includes('cost:') || 
                content.includes('product:') ||
                content.includes('category:') ||
                content.includes('specifications:')) {
                return true;
            }
            
            // Check if content contains product terms from the query
            return productTerms.some(term => content.includes(term));
        });
        
        // Score and sort the product items by relevance
        const scoredItems = productItems.map(item => {
            const content = (item.title + ' ' + item.content).toLowerCase();
            let score = 0;
            
            // Prioritize items that have price information if the query asks about price
            if (query.toLowerCase().includes('price') || query.toLowerCase().includes('cost')) {
                if (content.includes('price:') || content.includes('$') || content.includes('cost:')) {
                    score += 10;
                }
            }
            
            // Score based on query term matches
            productTerms.forEach(term => {
                const matches = (content.match(new RegExp(term, 'gi')) || []).length;
                score += matches * 2;
            });
            
            return { ...item, score };
        });
        
        return scoredItems
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 3); // Limit to top 3 most relevant product items
    }
}

module.exports = GeminiService;