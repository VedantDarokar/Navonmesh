const mongoose = require('mongoose');

const RecruitmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    contactNo: { type: String, required: true },
    email: { type: String, required: true },
    year: { type: String, required: true }, // '1st year', '2nd year', '3rd year'
    designation: { type: String, required: true },
    mailSent: { type: Boolean, default: false },
    submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Recruitment', RecruitmentSchema);
