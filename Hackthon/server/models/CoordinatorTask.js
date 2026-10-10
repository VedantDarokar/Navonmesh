const mongoose = require('mongoose');

const coordinatorTaskSchema = new mongoose.Schema({
    assignedTo: {
        type: String,
        required: true,
        default: 'all' // coordinator ID (e.g. 'nihal.navonmesh') or 'all'
    },
    coordinatorName: {
        type: String,
        default: 'Coordinator'
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    priority: {
        type: String,
        enum: ['URGENT', 'HIGH', 'MEDIUM', 'LOW'],
        default: 'HIGH'
    },
    status: {
        type: String,
        enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
        default: 'PENDING'
    },
    dueTime: {
        type: String,
        default: 'Event Day Shift'
    },
    assignedBy: {
        type: String,
        default: 'Admin Command Center'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('CoordinatorTask', coordinatorTaskSchema);
