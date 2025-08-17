// uniconnect-backend/models/LostItemConversation.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PrivateMessageSchema = new Schema({
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const LostItemConversationSchema = new Schema({
    item: { type: Schema.Types.ObjectId, ref: 'LostItem', required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    messages: [PrivateMessageSchema],

    // --- THIS IS THE UPGRADE FOR NOTIFICATIONS ---
    lastMessageAt: {
        type: Date,
        default: Date.now
    },
    unreadBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
});

module.exports = mongoose.model('LostItemConversation', LostItemConversationSchema);