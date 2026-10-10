const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Registration = require('../models/Registration');
const sendEmail = require('../utils/email');

// Configurable Problem Statement edit deadline (e.g. Oct 25, 2026 23:59 IST)
const PS_CHANGE_DEADLINE = new Date('2026-10-25T23:59:59+05:30');

// Helper to safely find team by Team ID or MongoDB _id without CastError
const findTeamById = async (idOrCode) => {
    if (!idOrCode) return null;
    const clean = String(idOrCode).trim();
    const orConditions = [{ teamId: clean.toUpperCase() }];
    if (mongoose.Types.ObjectId.isValid(clean) && clean.length === 24) {
        orConditions.push({ _id: new mongoose.Types.ObjectId(clean) });
    }
    return await Registration.findOne({ $or: orConditions });
};

// Helper to generate unique Team ID like SQUAD001
const generateTeamId = async () => {
    // Find all teams with SQUAD prefix to extract max number
    const squads = await Registration.find({ teamId: { $regex: /^SQUAD\d+$/i } }).select('teamId');
    let maxNum = 0;
    squads.forEach(t => {
        const match = t.teamId.match(/SQUAD(\d+)/i);
        if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxNum) maxNum = num;
        }
    });

    if (maxNum === 0) {
        const count = await Registration.countDocuments();
        maxNum = count;
    }
    const nextNum = maxNum + 1;
    return `SQUAD${String(nextNum).padStart(3, '0')}`;
};

// Helper to generate unique 8-character password
const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#';
    let pass = '';
    for (let i = 0; i < 8; i++) {
        pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
};

// Helper: send credentials email
const sendCredentialsEmail = async (team) => {
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0b1329; color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #1e293b;">
        <div style="background: linear-gradient(135deg, #0ea5e9, #6366f1); padding: 25px; text-align: center;">
            <h1 style="margin: 0; color: #fff; font-size: 24px; letter-spacing: 2px;">NAVONMESH 2027</h1>
            <p style="margin: 6px 0 0 0; color: #e0f2fe; font-size: 14px;">Official Team Credentials & Dashboard Access</p>
        </div>
        <div style="padding: 30px 25px; color: #cbd5e1;">
            <h2 style="color: #38bdf8; margin-top: 0;">Welcome, Team ${team.teamName}! 🚀</h2>
            <p>Your team registration has been recorded. Below are your official login credentials to access your team dashboard:</p>
            
            <div style="background: #1e293b; border-left: 4px solid #38bdf8; padding: 20px; border-radius: 0 8px 8px 0; margin: 25px 0;">
                <p style="margin: 0 0 10px 0; font-size: 15px;">
                    <strong style="color: #94a3b8;">TEAM ID:</strong> 
                    <span style="color: #38bdf8; font-size: 18px; font-weight: bold; font-family: monospace; letter-spacing: 1px;">${team.teamId}</span>
                </p>
                <p style="margin: 0 0 10px 0; font-size: 15px;">
                    <strong style="color: #94a3b8;">PASSWORD:</strong> 
                    <span style="color: #10b981; font-size: 18px; font-weight: bold; font-family: monospace; letter-spacing: 1px;">${team.teamPassword}</span>
                </p>
                <p style="margin: 0; font-size: 15px;">
                    <strong style="color: #94a3b8;">EVENT:</strong> 
                    <span style="color: #fff;">${team.event}</span>
                </p>
            </div>

            <div style="background: rgba(14, 165, 233, 0.1); border-radius: 8px; padding: 16px; margin: 20px 0; font-size: 13px; line-height: 1.6;">
                <strong style="color: #38bdf8;">What you can do in your Team Dashboard:</strong><br>
                ✓ Update team members' names, mobile numbers, and colleges<br>
                ✓ Update team leader contact details (Leader Email is fixed)<br>
                ✓ Change Problem Statement (<strong>Allowed ONLY ONCE</strong> before deadline)<br>
                ✓ Access & download individual dynamic QR Meal Passes<br>
                ✓ Change your password anytime
            </div>

            <div style="text-align: center; margin: 30px 0 15px 0;">
                <a href="http://localhost:5173/#/team-login" style="background: linear-gradient(135deg, #0ea5e9, #2563eb); color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 30px; font-weight: bold; font-size: 14px; display: inline-block;">
                    LOGIN TO TEAM DASHBOARD
                </a>
            </div>

            <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 25px;">
                Keep your Team ID and password secure. If you lose your password, you can use the "Forgot Password" feature on the login page using the registered leader email (${team.leaderEmail}).
            </p>
        </div>
    </div>
    `;

    return await sendEmail({
        to: [team.leaderEmail, ...(team.members || []).map(m => m.email)].filter(Boolean),
        subject: `Navonmesh 2027 Team Credentials - ${team.teamId} (${team.teamName})`,
        htmlContent
    });
};

// 1. POST /api/team/login - Team login with teamId / email + password
router.post('/login', async (req, res) => {
    try {
        const { identifier, password } = req.body;
        if (!identifier || !password) {
            return res.status(400).json({ error: 'Please provide Team ID / Email and password.' });
        }

        const cleanId = String(identifier).trim();
        const cleanPass = String(password).trim();

        // Find team by teamId (case-insensitive) or leaderEmail
        const team = await Registration.findOne({
            $or: [
                { teamId: { $regex: new RegExp(`^${cleanId}$`, 'i') } },
                { leaderEmail: cleanId.toLowerCase() },
                { leaderPhone: cleanId }
            ]
        });

        if (!team) {
            return res.status(404).json({ error: 'Team not found with the provided identifier.' });
        }

        // Validate password
        // (Allows assigned teamPassword, or fallback to leaderPhone if legacy)
        const validPass = team.teamPassword || team.leaderPhone;
        if (cleanPass !== validPass) {
            return res.status(401).json({ error: 'Incorrect password. Try using "Forgot Password" if you lost it.' });
        }

        res.json({
            success: true,
            team: {
                id: team._id,
                teamId: team.teamId || `SQUAD${String(team._id).slice(-3).toUpperCase()}`,
                teamName: team.teamName,
                event: team.event,
                edition: team.edition,
                studentCategory: team.studentCategory,
                problemStatement: team.problemStatement,
                originalProblemStatement: team.originalProblemStatement || team.problemStatement,
                psChangeCount: team.psChangeCount || (team.psEdited ? 1 : 0),
                psDeadline: PS_CHANGE_DEADLINE,
                teamSize: team.teamSize,
                leaderName: team.leaderName,
                leaderEmail: team.leaderEmail,
                leaderPhone: team.leaderPhone,
                college: team.college,
                members: team.members || [],
                paymentVerified: team.paymentVerified,
                utrNumber: team.utrNumber,
                certificatesUnlocked: Boolean(team.certificatesUnlocked),
                groupNo: team.groupNo,
                tableNo: team.tableNo
            }
        });

    } catch (err) {
        console.error('Team login error:', err);
        res.status(500).json({ error: 'Server error during team login' });
    }
});

// 2. GET /api/team/profile/:teamId - Fetch team profile
router.get('/profile/:teamId', async (req, res) => {
    try {
        const team = await findTeamById(req.params.teamId);

        if (!team) return res.status(404).json({ error: 'Team not found' });

        res.json({
            success: true,
            team: {
                id: team._id,
                teamId: team.teamId,
                teamName: team.teamName,
                event: team.event,
                edition: team.edition,
                studentCategory: team.studentCategory,
                problemStatement: team.problemStatement,
                psChangeCount: team.psChangeCount || 0,
                psDeadline: PS_CHANGE_DEADLINE,
                teamSize: team.teamSize,
                leaderName: team.leaderName,
                leaderEmail: team.leaderEmail,
                leaderPhone: team.leaderPhone,
                college: team.college,
                members: team.members || [],
                paymentVerified: team.paymentVerified,
                utrNumber: team.utrNumber,
                certificatesUnlocked: Boolean(team.certificatesUnlocked),
                groupNo: team.groupNo,
                tableNo: team.tableNo
            }
        });
    } catch (err) {
        console.error('Profile fetch error:', err);
        res.status(500).json({ error: 'Server error fetching profile' });
    }
});

// 3. PUT /api/team/update - Update team details (except leaderEmail)
router.put('/update', async (req, res) => {
    try {
        const { teamId, teamName, leaderName, leaderPhone, college, members, problemStatement } = req.body;

        if (!teamId) {
            return res.status(400).json({ error: 'Team ID is required.' });
        }

        const team = await findTeamById(teamId);

        if (!team) {
            return res.status(404).json({ error: 'Team not found.' });
        }

        const updateFields = {};

        // 1. Update basic info (LEADER EMAIL CANNOT BE CHANGED!)
        if (teamName) {
            team.teamName = teamName.trim();
            updateFields.teamName = team.teamName;
        }
        if (leaderName) {
            team.leaderName = leaderName.trim();
            updateFields.leaderName = team.leaderName;
        }
        if (leaderPhone) {
            team.leaderPhone = leaderPhone.trim();
            updateFields.leaderPhone = team.leaderPhone;
        }
        if (college !== undefined) {
            team.college = college.trim();
            updateFields.college = team.college;
        }

        // 2. Update members array if provided
        if (Array.isArray(members)) {
            team.members = members.map(m => ({
                name: m.name ? m.name.trim() : '',
                email: m.email ? m.email.trim() : '',
                phone: m.phone ? m.phone.trim() : '',
                college: m.college ? m.college.trim() : (team.college || '')
            }));
            team.teamSize = team.members.length + 1;
            updateFields.members = team.members;
            updateFields.teamSize = team.teamSize;
        }

        // 3. Handle Problem Statement Change (Allowed ONLY ONCE before deadline)
        if (problemStatement && problemStatement !== team.problemStatement) {
            const now = new Date();
            if (now > PS_CHANGE_DEADLINE) {
                return res.status(403).json({
                    error: `Problem statement change deadline has expired (${PS_CHANGE_DEADLINE.toLocaleDateString()}). Changes are no longer allowed.`
                });
            }

            if ((team.psChangeCount || 0) >= 1) {
                return res.status(403).json({
                    error: 'Problem Statement can be changed ONLY ONCE! Your team has already used its change quota.'
                });
            }

            // Save original and mark changed
            if (!team.originalProblemStatement) {
                team.originalProblemStatement = team.problemStatement;
                updateFields.originalProblemStatement = team.originalProblemStatement;
            }
            team.problemStatement = problemStatement;
            team.psChangeCount = (team.psChangeCount || 0) + 1;
            team.psEdited = true;

            updateFields.problemStatement = team.problemStatement;
            updateFields.psChangeCount = team.psChangeCount;
            updateFields.psEdited = team.psEdited;
        }

        await Registration.updateOne({ _id: team._id }, { $set: updateFields });

        res.json({
            success: true,
            message: 'Team details updated successfully! Changes are synced with admin.',
            team: {
                id: team._id,
                teamId: team.teamId,
                teamName: team.teamName,
                leaderName: team.leaderName,
                leaderEmail: team.leaderEmail,
                leaderPhone: team.leaderPhone,
                event: team.event,
                edition: team.edition,
                studentCategory: team.studentCategory,
                college: team.college,
                members: team.members,
                problemStatement: team.problemStatement,
                psChangeCount: team.psChangeCount,
                psEdited: team.psEdited,
                certificatesUnlocked: Boolean(team.certificatesUnlocked),
                groupNo: team.groupNo,
                tableNo: team.tableNo
            }
        });

    } catch (err) {
        console.error('Update error:', err);
        res.status(500).json({ error: 'Failed to update team details: ' + err.message });
    }
});

// 4. POST /api/team/change-password - Change team password inside dashboard
router.post('/change-password', async (req, res) => {
    try {
        const { teamId, currentPassword, newPassword } = req.body;
        if (!teamId || !currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Please provide Team ID, current password, and new password.' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
        }

        const team = await findTeamById(teamId);

        if (!team) return res.status(404).json({ error: 'Team not found.' });

        const actualPass = team.teamPassword || team.leaderPhone;
        if (currentPassword.trim() !== actualPass) {
            return res.status(401).json({ error: 'Current password is incorrect.' });
        }

        await Registration.updateOne(
            { _id: team._id },
            { $set: { teamPassword: newPassword.trim() } }
        );

        res.json({ success: true, message: 'Password changed successfully!' });
    } catch (err) {
        console.error('Change password error:', err);
        res.status(500).json({ error: 'Server error changing password: ' + err.message });
    }
});

// 5. POST /api/team/forgot-password - Send 6-digit OTP to Leader Email
router.post('/forgot-password', async (req, res) => {
    try {
        const { identifier } = req.body;
        if (!identifier) {
            return res.status(400).json({ error: 'Please enter your Team ID or Leader Email.' });
        }

        const cleanId = String(identifier).trim();
        const team = await Registration.findOne({
            $or: [
                { teamId: { $regex: new RegExp(`^${cleanId}$`, 'i') } },
                { leaderEmail: cleanId.toLowerCase() }
            ]
        });

        if (!team) {
            return res.status(404).json({ error: 'No registered team found with this ID or Email.' });
        }

        // Generate 6-digit OTP
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

        await Registration.updateOne(
            { _id: team._id },
            { $set: { otp, otpExpiry } }
        );

        const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #0b1329; color: #fff; border-radius: 12px; padding: 25px; border: 1px solid #1e293b;">
            <h2 style="color: #38bdf8; text-align: center; margin-top: 0;">Password Reset OTP 🔐</h2>
            <p style="color: #cbd5e1;">Hello <strong>${team.leaderName}</strong> (Team: ${team.teamName}),</p>
            <p style="color: #cbd5e1;">You requested to reset your password for Team ID: <strong>${team.teamId || 'Your Team'}</strong>.</p>
            
            <div style="text-align: center; margin: 25px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #10b981; background: #1e293b; padding: 12px 24px; border-radius: 8px; border: 1px dashed #10b981; font-family: monospace;">
                    ${otp}
                </span>
            </div>

            <p style="color: #94a3b8; font-size: 13px; text-align: center;">
                This OTP is valid for <strong>10 minutes</strong>. Do not share this OTP with anyone.
            </p>
        </div>
        `;

        await sendEmail({
            to: team.leaderEmail,
            subject: `Navonmesh Password Reset OTP: ${otp}`,
            htmlContent
        });

        res.json({
            success: true,
            message: `OTP has been sent to the team leader's email: ${team.leaderEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3')}`,
            maskedEmail: team.leaderEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
            teamId: team.teamId
        });

    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ error: 'Server error generating OTP: ' + err.message });
    }
});

// 6. POST /api/team/reset-password - Verify OTP and set new password
router.post('/reset-password', async (req, res) => {
    try {
        const { identifier, otp, newPassword } = req.body;
        if (!identifier || !otp || !newPassword) {
            return res.status(400).json({ error: 'All fields (Team ID/Email, OTP, and New Password) are required.' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
        }

        const cleanId = String(identifier).trim();
        const team = await Registration.findOne({
            $or: [
                { teamId: { $regex: new RegExp(`^${cleanId}$`, 'i') } },
                { leaderEmail: cleanId.toLowerCase() }
            ]
        });

        if (!team) return res.status(404).json({ error: 'Team not found.' });

        if (!team.otp || team.otp !== String(otp).trim()) {
            return res.status(400).json({ error: 'Invalid OTP code. Please enter the 6-digit code sent to your email.' });
        }

        if (!team.otpExpiry || new Date() > team.otpExpiry) {
            return res.status(400).json({ error: 'OTP has expired. Please request a new OTP.' });
        }

        // Set new password and clear OTP
        await Registration.updateOne(
            { _id: team._id },
            {
                $set: { teamPassword: newPassword.trim() },
                $unset: { otp: 1, otpExpiry: 1 }
            }
        );

        res.json({
            success: true,
            message: 'Password reset successfully! You can now login with your new password.'
        });

    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ error: 'Server error resetting password: ' + err.message });
    }
});

// 7. POST /api/team/resend-credentials/:id - Admin resend team ID & password email
router.post('/resend-credentials/:id', async (req, res) => {
    try {
        const team = await Registration.findById(req.params.id);
        if (!team) return res.status(404).json({ error: 'Team not found' });

        let needsUpdate = false;
        const updateFields = {};
        // Ensure team has teamId and teamPassword
        if (!team.teamId) {
            team.teamId = await generateTeamId();
            updateFields.teamId = team.teamId;
            needsUpdate = true;
        }
        if (!team.teamPassword) {
            team.teamPassword = generatePassword();
            updateFields.teamPassword = team.teamPassword;
            needsUpdate = true;
        }
        if (needsUpdate) {
            await Registration.updateOne({ _id: team._id }, { $set: updateFields });
        }

        const sent = await sendCredentialsEmail(team);
        if (sent) {
            res.json({ 
                success: true, 
                message: `Credentials (Team ID: ${team.teamId}) successfully sent to ${team.leaderEmail}`,
                teamId: team.teamId,
                teamPassword: team.teamPassword
            });
        } else {
            res.status(500).json({ error: 'Failed to send credentials email' });
        }
    } catch (err) {
        console.error('Resend credentials error:', err);
        res.status(500).json({ error: 'Server error resending credentials: ' + err.message });
    }
});

// 8. POST /api/team/backfill-credentials - Auto-assign SQUAD IDs and passwords to existing teams
router.post('/backfill-credentials', async (req, res) => {
    try {
        const existingSquads = await Registration.find({ teamId: { $regex: /^SQUAD\d+$/i } }).select('teamId');
        let maxNum = 0;
        existingSquads.forEach(t => {
            const match = t.teamId.match(/SQUAD(\d+)/i);
            if (match) {
                const num = parseInt(match[1], 10);
                if (num > maxNum) maxNum = num;
            }
        });

        const teams = await Registration.find({
            $or: [{ teamId: { $exists: false } }, { teamId: null }, { teamId: '' }]
        }).sort({ registrationDate: 1 });

        let assigned = 0;
        for (let i = 0; i < teams.length; i++) {
            const t = teams[i];
            maxNum++;
            const sId = `SQUAD${String(maxNum).padStart(3, '0')}`;
            const generatedPass = t.teamPassword || generatePassword();
            await Registration.updateOne(
                { _id: t._id },
                { $set: { teamId: sId, teamPassword: generatedPass } }
            );
            assigned++;
        }
        res.json({
            success: true,
            message: `Successfully backfilled ${assigned} teams with SQUAD IDs and passwords`,
            count: assigned
        });
    } catch (err) {
        console.error('Backfill error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Helper exported for register.js
module.exports = {
    router,
    generateTeamId,
    generatePassword,
    sendCredentialsEmail,
    PS_CHANGE_DEADLINE
};
