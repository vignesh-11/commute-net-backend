const express = require('express');
const chatController = require('../controllers/chatController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router.route('/myChats').get(chatController.fetchChats);
module.exports = router;