const express = require('express');
const router = express.Router();
const DeviceToken = require('../models/DeviceToken');

// POST /api/notifications/register-token
// Registers or updates device FCM token
router.post('/register-token', async (req, res) => {
    try {
        const { token, role = 'coordinator', userId = '', platform = 'android' } = req.body;
        if (!token) {
            return res.status(400).json({ success: false, message: 'Token is required' });
        }

        const updated = await DeviceToken.findOneAndUpdate(
            { token },
            {
                token,
                role: role.toLowerCase(),
                userId,
                platform,
                lastUpdated: new Date()
            },
            { upsert: true, new: true }
        );

        res.json({
            success: true,
            message: 'Device token registered successfully',
            device: updated
        });
    } catch (err) {
        console.error('Error registering device token:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/notifications/device-count
router.get('/device-count', async (req, res) => {
    try {
        const count = await DeviceToken.countDocuments();
        res.json({ success: true, count });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
