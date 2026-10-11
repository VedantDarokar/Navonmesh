const mongoose = require('mongoose');

const deviceTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    role: {
        type: String,
        enum: ['coordinator', 'participant', 'all', 'admin'],
        default: 'all'
    },
    userId: {
        type: String,
        default: ''
    },
    platform: {
        type: String,
        default: 'android'
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('DeviceToken', deviceTokenSchema);
