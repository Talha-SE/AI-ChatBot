const axios = require('axios');

class GeminiService {
    constructor() {
        this.apiKey = process.env.API_KEY;
        this.baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
    }

    async generateResponse(query, websiteData = null, conversationHistory = []) {
        try {
            let prompt = this.formatPrompt(query, websiteData, conversationHistory);

            const response = await axios.post(`${this.baseUrl}?key=${this.apiKey}`, {
                contents: [
                    {
                        parts: [
                            {
                                text: prompt
                            }
                        ]
                    }
                ]
            }, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const rawResponse = response.data.candidates[0].content.parts[0].text;
            return this.formatResponse(rawResponse);
        } catch (error) {
            console.error('Gemini API Error:', error.response?.data || error.message);
            throw new Error('Failed to generate response from Gemini API');
        }
    }

    formatPrompt(query, websiteData, conversationHistory) {
        let prompt = `You are a helpful AI assistant that answers questions based on website content.\n\n`;
        
        if (websiteData && websiteData.length > 0) {
            prompt += `Website Content:\n`;
            websiteData.forEach(page => {
                prompt += `Page: ${page.title || 'Untitled'}\n`;
                prompt += `URL: ${page.path}\n`;
                prompt += `Content: ${page.content.substring(0, 1000)}...\n\n`;
            });
        }
        
        if (conversationHistory && conversationHistory.length > 0) {
            prompt += `Previous conversation:\n`;
            conversationHistory.slice(-6).forEach(msg => {
                prompt += `${msg.sender}: ${msg.text}\n`;
            });
            prompt += `\n`;
        }
        
        prompt += `User Question: ${query}\n\n`;
        prompt += `Please provide a helpful and accurate response based on the website content above. If the information is not available in the content, please say so.`;
        
        return prompt;
    }

    formatResponse(rawResponse) {
        return rawResponse.trim();
    }
}

module.exports = GeminiService;