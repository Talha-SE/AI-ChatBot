const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/chat');

const chatController = new ChatController();

// Route to handle user queries
router.post('/query', chatController.handleUserQuery.bind(chatController));

// Route to get chat history
router.get('/history', chatController.getChatHistory.bind(chatController));

// Route to start a new chat
router.post('/new', chatController.startNewChat.bind(chatController));

module.exports = router;