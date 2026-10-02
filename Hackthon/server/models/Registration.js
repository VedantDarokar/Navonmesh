const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    college: { type: String }
});

const RegistrationSchema = new mongoose.Schema({
    teamId: { 
        type: String, 
        unique: true, 
        sparse: true, 
        index: true 
    }, // e.g. SQUAD001
    teamPassword: { 
        type: String 
    }, // Unique password shared via Gmail
    psChangeCount: { 
        type: Number, 
        default: 0 
    }, // Track problem statement edits (max 1)
    originalProblemStatement: { 
        type: String 
    },
    
    // OTP fields for Forgot Password
    otp: { 
        type: String 
    },
    otpExpiry: { 
        type: Date 
    },

    event: { type: String, required: true },
    edition: { type: String, default: '2026' }, // Default '2026' for previous teams
    teamName: { type: String, required: true },
    studentCategory: { type: String }, // Optional, mostly for Ankur
    problemStatement: { type: String }, // Optional, mostly for Srijan
    teamSize: { type: Number, required: true },

    // Leader info
    leaderName: { type: String, required: true },
    leaderEmail: { type: String, required: true },
    leaderPhone: { type: String, required: true },
    college: { type: String }, // Optional

    // Other members (2 to 4)
    members: [MemberSchema],

    // Payment Info
    utrNumber: { type: String, unique: true, sparse: true },
    agreed: { type: Boolean, required: true },
    paymentVerified: { type: Boolean, default: false },

    registrationDate: { type: Date, default: Date.now },

    // Event Day Details
    groupNo: { type: Number },
    tableNo: { type: Number },

    // Admin Edits
    psEdited: { type: Boolean, default: false }
});

module.exports = mongoose.model('Registration', RegistrationSchema);
