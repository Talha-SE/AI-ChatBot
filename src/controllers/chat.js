const GeminiService = require('../services/geminiService');
const MistralService = require('../services/mistralService');
const Conversation = require('../models/conversation');
const Website = require('../models/website');
const { formatChatResponse, isProductQuery, formatProductResponse } = require('../utils/helpers');

class ChatController {
    constructor() {
        this.geminiService = new GeminiService();
        this.mistralService = new MistralService();
    }

    async handleUserQuery(req, res) {
        try {
            const { query, message } = req.body;
            const userQuery = query || message;
            const userId = req.body.userId || 'anonymous';

            if (!userQuery) {
                return res.status(400).json({ error: 'Query or message is required' });
            }

            // Get conversation history for context
            const conversation = await Conversation.findOne({ userId }).sort({ createdAt: -1 });
            const conversationHistory = conversation ? conversation.messages : [];

            // Get website data from database
            const websites = await Website.find({});
            const websiteData = websites.length > 0 ? websites[0].pages : null;

            // Check if this is a product query
            const productQuery = isProductQuery(userQuery);
            
            try {
                // Try using Gemini API first
                const rawResponse = await this.geminiService.generateResponse(userQuery, websiteData, conversationHistory);
                
                // Format response based on query type
                let formattedResponse;
                if (productQuery) {
                    // For product queries, we need to determine if the product exists
                    // This is a simplified check - in reality, you'd have more sophisticated detection
                    const productExists = !rawResponse.toLowerCase().includes("couldn't find") && 
                                          !rawResponse.toLowerCase().includes("not available") &&
                                          !rawResponse.toLowerCase().includes("don't have");
                    
                    formattedResponse = formatProductResponse(rawResponse, productExists);
                } else {
                    formattedResponse = formatChatResponse(rawResponse);
                }
                
                // Save conversation
                await this.saveConversation(userId, userQuery, formattedResponse);
                
                res.json({ response: formattedResponse, reply: formattedResponse });
            } catch (geminiError) {
                console.error('Gemini API Error:', geminiError);
                
                try {
                    // Fallback to Mistral API if Gemini fails
                    console.log('Falling back to Mistral API');
                    const mistralResponse = await this.mistralService.generateResponse(userQuery, websiteData, conversationHistory);
                    
                    // Format response based on query type
                    let formattedMistralResponse;
                    if (productQuery) {
                        // For product queries, determine if the product exists
                        const productExists = !mistralResponse.toLowerCase().includes("couldn't find") && 
                                              !mistralResponse.toLowerCase().includes("not available") &&
                                              !mistralResponse.toLowerCase().includes("don't have");
                        
                        formattedMistralResponse = formatProductResponse(mistralResponse, productExists);
                    } else {
                        formattedMistralResponse = formatChatResponse(mistralResponse);
                    }
                    
                    // Save conversation
                    await this.saveConversation(userId, userQuery, formattedMistralResponse);
                    
                    res.json({ response: formattedMistralResponse, reply: formattedMistralResponse });
                } catch (mistralError) {
                    console.error('Mistral API Error:', mistralError);
                    throw new Error('Both Gemini and Mistral APIs failed');
                }
            }
        } catch (error) {
            console.error('Error handling user query:', error);
            const errorMessage = 'I apologize, but I encountered an issue while processing your request. Please try again in a moment.';
            res.status(500).json({ error: errorMessage, response: errorMessage, reply: errorMessage });
        }
    }

    async getChatHistory(req, res) {
        try {
            const userId = req.query.userId || 'anonymous';
            const conversation = await Conversation.findOne({ userId }).sort({ createdAt: -1 });
            
            if (!conversation) {
                return res.json({ messages: [] });
            }

            res.json({ messages: conversation.messages });
        } catch (error) {
            console.error('Error fetching chat history:', error);
            res.status(500).json({ error: 'Failed to fetch chat history' });
        }
    }

    async startNewChat(req, res) {
        try {
            const userId = req.body.userId || 'anonymous';
            
            // Delete existing conversation to start fresh
            await Conversation.deleteMany({ userId });
            
            res.json({ 
                success: true, 
                message: 'New chat started successfully!',
                messages: []
            });
        } catch (error) {
            console.error('Error starting new chat:', error);
            res.status(500).json({ error: 'Failed to start new chat' });
        }
    }

    async saveConversation(userId, userMessage, botResponse) {
        try {
            let conversation = await Conversation.findOne({ userId });
            
            if (!conversation) {
                conversation = new Conversation({
                    userId,
                    messages: []
                });
            }

            conversation.messages.push(
                { sender: 'user', text: userMessage },
                { sender: 'bot', text: botResponse }
            );

            await conversation.save();
        } catch (error) {
            console.error('Error saving conversation:', error);
        }
    }
}

module.exports = ChatController;