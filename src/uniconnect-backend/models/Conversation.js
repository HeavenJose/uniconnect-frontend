// uniconnect-backend/models/Conversation.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PrivateMessageSchema = new Schema({
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const ConversationSchema = new Schema({
    listing: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    messages: [PrivateMessageSchema],
    
    // --- THIS IS THE UPGRADE FOR NOTIFICATIONS ---
    // This tracks when the last message was sent
    lastMessageAt: {
        type: Date,
        default: Date.now
    },
    // This stores the ID of the user who has an unread message
    unreadBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
});

module.exports = mongoose.model('Conversation', ConversationSchema);