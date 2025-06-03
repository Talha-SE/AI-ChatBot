const axios = require('axios');

class MistralService {
    constructor() {
        this.apiKey = process.env.MISTRAL_API_KEY;
        this.baseUrl = "https://api.mistral.ai/v1/chat/completions";
    }

    async generateResponse(query, websiteData = null, conversationHistory = []) {
        try {
            let prompt = this.formatPrompt(query, websiteData, conversationHistory);

            const messages = [{ role: "user", content: prompt }];

            const response = await axios.post(this.baseUrl, {
                model: "mistral-small-latest",
                temperature: 0.7,
                messages: messages
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });

            const rawResponse = response.data.choices[0].message.content;
            return this.formatResponse(rawResponse);
        } catch (error) {
            console.error('Mistral API Error:', error.response?.data || error.message);
            throw new Error('Failed to generate response from Mistral API');
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

module.exports = MistralService;
