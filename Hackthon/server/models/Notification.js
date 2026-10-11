const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true,
        trim: true
    },
    message: { 
        type: String, 
        required: true,
        trim: true
    },
    target: { 
        type: String, 
        enum: ['all', 'coordinator', 'participant'], 
        default: 'all' 
    },
    category: { 
        type: String, 
        enum: ['announcement', 'urgent', 'meal', 'schedule', 'general'], 
        default: 'announcement' 
    },
    senderId: { 
        type: String, 
        required: true,
        trim: true
    },
    senderName: { 
        type: String, 
        required: true,
        trim: true
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Notification', notificationSchema);
