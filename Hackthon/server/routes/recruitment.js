const express = require('express');
const router = express.Router();
const Recruitment = require('../models/Recruitment');
const sendEmail = require('../utils/email');

// POST — submit a recruitment application
router.post('/', async (req, res) => {
    try {
        const { name, contactNo, email, year, designation } = req.body;

        if (!name || !contactNo || !email || !year || !designation) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        const application = new Recruitment({ name, contactNo, email, year, designation });
        await application.save();

        res.status(201).json({ success: true, message: 'Application submitted successfully.' });
    } catch (err) {
        console.error('Recruitment submission error:', err);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
});

// GET — fetch all recruitment applications (admin protected)
router.get('/', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader !== 'Bearer admin_secret_token_navonmesh') {
        return res.status(401).json({ error: 'Unauthorized Access' });
    }

    try {
        const applications = await Recruitment.find().sort({ submittedAt: -1 });
        res.json({ count: applications.length, entries: applications });
    } catch (err) {
        console.error('Error fetching recruitment data:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE — delete a single recruitment application (admin only)
router.delete('/:id', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader !== 'Bearer admin_secret_token_navonmesh') {
        return res.status(401).json({ error: 'Unauthorized Access' });
    }

    try {
        await Recruitment.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Delete failed' });
    }
});

// POST — send acknowledgment email to applicant (admin only)
router.post('/:id/send-mail', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader !== 'Bearer admin_secret_token_navonmesh') {
        return res.status(401).json({ error: 'Unauthorized Access' });
    }

    try {
        const application = await Recruitment.findById(req.params.id);
        if (!application) return res.status(404).json({ error: 'Application not found' });

        const htmlContent = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #05060f; color: #e2e8f0; max-width: 600px; margin: 0 auto; border: 1px solid rgba(0,243,255,0.2); border-top: 3px solid #00f3ff;">
            <div style="padding: 30px 40px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05);">
                <p style="font-size: 0.7rem; letter-spacing: 4px; color: #00f3ff; margin: 0 0 10px;">NAVONMESH '27 // RECRUITMENT DIVISION</p>
                <h1 style="font-size: 2rem; font-weight: 900; color: #fff; margin: 0; letter-spacing: -1px;">APPLICATION RECEIVED</h1>
            </div>
            <div style="padding: 35px 40px;">
                <p style="font-size: 1rem; color: #94a3b8; line-height: 1.7; margin-bottom: 24px;">
                    Dear <strong style="color: #fff;">${application.name}</strong>,<br><br>
                    Thank you for applying to be a part of Team Navonmesh '27. Your application has been successfully received and is currently under review by our recruitment team.
                </p>
                <div style="background: rgba(0,243,255,0.05); border-left: 3px solid #00f3ff; padding: 20px 24px; margin: 28px 0; border-radius: 2px;">
                    <p style="font-size: 0.65rem; letter-spacing: 3px; color: #00f3ff; margin: 0 0 14px;">APPLICATION DETAILS</p>
                    <table style="width: 100%; font-size: 0.9rem; border-collapse: collapse;">
                        <tr><td style="color: #64748b; padding: 5px 0; width: 40%;">Name</td><td style="color: #e2e8f0; font-weight: 600;">${application.name}</td></tr>
                        <tr><td style="color: #64748b; padding: 5px 0;">Contact</td><td style="color: #e2e8f0;">${application.contactNo}</td></tr>
                        <tr><td style="color: #64748b; padding: 5px 0;">Year</td><td style="color: #e2e8f0;">${application.year}</td></tr>
                        <tr><td style="color: #64748b; padding: 5px 0;">Applied For</td><td style="color: #00f3ff; font-weight: 700;">${application.designation}</td></tr>
                    </table>
                </div>
                <p style="font-size: 0.9rem; color: #94a3b8; line-height: 1.7;">
                    Our team will review your profile and reach out to you shortly with the next steps. If you have any questions, feel free to contact us.
                </p>
                <div style="text-align: center; margin-top: 32px;">
                    <p style="font-size: 0.7rem; letter-spacing: 3px; color: #334155;">NAVONMESH '27 — PCET, NAGPUR</p>
                </div>
            </div>
        </div>`;

        const sent = await sendEmail({
            to: application.email,
            subject: `Application Received — Navonmesh '27 Recruitment`,
            htmlContent
        });

        if (sent) {
            res.json({ success: true, message: `Acknowledgment email sent to ${application.email}` });
        } else {
            res.status(500).json({ error: 'Failed to send email. Check SMTP credentials.' });
        }
    } catch (err) {
        console.error('Send mail error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
