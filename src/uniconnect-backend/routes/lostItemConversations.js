// uniconnect-backend/routes/lostItemConversations.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const LostItemConversation = require('../models/LostItemConversation');
const LostItem = require('../models/LostItem');

// Start a conversation or send a message (WITH NOTIFICATIONS)
router.post('/', auth, async (req, res) => {
    const { itemId, text } = req.body;
    try {
        const item = await LostItem.findById(itemId);
        if (!item) return res.status(404).json({ msg: 'Item not found.' });

        const posterId = item.user;
        const contacterId = req.user.id;

        let conversation = await LostItemConversation.findOne({
            item: itemId,
            participants: { $all: [posterId, contacterId] }
        });

        if (!conversation) {
            conversation = new LostItemConversation({
                item: itemId,
                participants: [posterId, contacterId],
                messages: []
            });
        }

        const newMessage = { sender: contacterId, text: text };
        conversation.messages.push(newMessage);
        
        // Set notification for the receiver
        const receiverId = (posterId.toString() === contacterId) ? null : posterId;
        conversation.unreadBy = receiverId;
        conversation.lastMessageAt = Date.now();
        
        await conversation.save();
        
        const populatedConversation = await LostItemConversation.findById(conversation._id)
            .populate('participants', ['fullName'])
            .populate('messages.sender', ['fullName']);

        res.json(populatedConversation);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// Get a conversation for a specific item (No changes)
router.get('/item/:itemId', auth, async (req, res) => {
    try {
        const conversation = await LostItemConversation.findOne({
            item: req.params.itemId,
            participants: req.user.id
        }).populate('participants', ['fullName']).populate('messages.sender', ['fullName']);

        if (!conversation) return res.json(null);
        res.json(conversation);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// --- THIS IS THE MISSING ROUTE THAT FIXES THE ERROR ---
// @route   GET /api/lost-item-conversations/notifications
// @desc    Get all notifications for the logged-in user
router.get('/notifications', auth, async (req, res) => {
    try {
        const notifications = await LostItemConversation.find({ unreadBy: req.user.id })
            .populate('item', ['itemName']) // Get the item name for the notification
            .sort({ lastMessageAt: -1 });
        res.json(notifications);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// --- NEW ROUTE TO MARK A CONVERSATION AS READ ---
router.put('/read/:conversationId', auth, async (req, res) => {
    try {
        const conversation = await LostItemConversation.findById(req.params.conversationId);
        if (!conversation) return res.status(404).json({ msg: 'Conversation not found.' });

        if (conversation.unreadBy && conversation.unreadBy.toString() === req.user.id) {
            conversation.unreadBy = null;
            await conversation.save();
        }
        res.json({ msg: 'Conversation marked as read.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;