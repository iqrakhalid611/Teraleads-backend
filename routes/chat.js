const express = require('express');
const { authenticate } = require('../middleware/auth');
const chatController = require('../controllers/chatController');

const router = express.Router();

router.use(authenticate);

router.post('/', chatController.postChat);
router.get('/', chatController.getHistory);

module.exports = router;
