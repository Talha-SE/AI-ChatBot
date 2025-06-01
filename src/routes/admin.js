const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/admin');

// Route to get the admin dashboard
router.get('/', AdminController.getDashboard);

// Route to set up the chatbot with a website link
router.post('/setup', AdminController.setupChatbot);

// Route to get the list of crawled websites
router.get('/websites', AdminController.getWebsites);

// Route to delete a website from the list
router.delete('/websites/:id', AdminController.deleteWebsite);

module.exports = router;