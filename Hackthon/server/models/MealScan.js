const mongoose = require('mongoose');

const MealScanSchema = new mongoose.Schema({
    participantId: { 
        type: String, 
        required: true, 
        trim: true,
        index: true 
    },
    teamId: { 
        type: String, 
        required: true, 
        trim: true 
    },
    teamName: { 
        type: String, 
        required: true, 
        trim: true 
    },
    participantName: { 
        type: String, 
        required: true, 
        trim: true 
    },
    participantRole: { 
        type: String, 
        default: 'Member' 
    }, // 'Leader' | 'Member'
    participantEmail: { 
        type: String, 
        trim: true 
    },
    participantPhone: { 
        type: String, 
        trim: true 
    },
    college: { 
        type: String, 
        trim: true 
    },
    event: { 
        type: String, 
        default: 'Srijan 2027' 
    },
    mealType: { 
        type: String, 
        required: true, 
        enum: ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS'],
        uppercase: true 
    },
    dateStr: { 
        type: String, 
        required: true 
    }, // 'YYYY-MM-DD'
    scannedAt: { 
        type: Date, 
        default: Date.now 
    },
    scannedBy: { 
        type: String, 
        default: 'Coordinator' 
    },
    counterLocation: { 
        type: String, 
        default: 'Mess & Canteen' 
    }
}, { timestamps: true });

// Compound unique index: guarantees a participant can only be scanned ONCE per meal per day!
MealScanSchema.index({ participantId: 1, mealType: 1, dateStr: 1 }, { unique: true });

module.exports = mongoose.model('MealScan', MealScanSchema);
