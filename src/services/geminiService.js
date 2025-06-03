const axios = require('axios');

class GeminiService {
    constructor() {
        this.apiKey = process.env.API_KEY;
        this.apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    }

    async generateResponse(userQuery, contextData, conversationHistory = []) {
        try {
            if (!this.apiKey) {
                throw new Error('Gemini API key not found');
            }

            // Prepare context from website data and training data
            let context = '';
            
            // Only include relevant context based on the user query to save tokens
            if (contextData && contextData.length > 0) {
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

            // Construct the prompt
            let prompt = '';
            
            if (formattedHistory) {
                prompt += `Previous conversation:\n${formattedHistory}\n\n`;
            }
            
            if (context) {
                prompt += `${context}\n\n`;
            }
            
            prompt += `User: ${userQuery}\n\nAssistant: `;

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
}

module.exports = GeminiService;