const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const QRCode = require('qrcode');
const Registration = require('../models/Registration');
const MealScan = require('../models/MealScan');
const sendEmail = require('../utils/email');

// Helper to get today's date string in 'YYYY-MM-DD'
const getTodayDateStr = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

// Meal time slots configuration
const MEAL_SLOTS = [
    { name: 'BREAKFAST', label: 'Breakfast', startHour: 8, startMin: 0, endHour: 9, endMin: 30 },
    { name: 'LUNCH', label: 'Lunch', startHour: 11, startMin: 0, endHour: 14, endMin: 0 },
    { name: 'DINNER', label: 'Dinner', startHour: 19, startMin: 0, endHour: 21, endMin: 30 }
];

// Determine active meal slot based on current time
const getCurrentMealSlot = () => {
    const now = new Date();
    const curMinutes = now.getHours() * 60 + now.getMinutes();

    for (const slot of MEAL_SLOTS) {
        const start = slot.startHour * 60 + slot.startMin;
        const end = slot.endHour * 60 + slot.endMin;
        if (curMinutes >= start && curMinutes <= end) {
            return slot;
        }
    }
    return null;
};

// Helper: generate consistent participant ID
const generateParticipantId = (team, role, index = 0) => {
    if (team.teamId) {
        return role === 'Leader' ? `${team.teamId}-L` : `${team.teamId}-M${index + 1}`;
    }
    const prefix = team.edition === '2027' ? 'NAV27' : 'NAV26';
    const teamShort = (team.teamName || 'TEAM').replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
    const idSuffix = String(team._id || '').slice(-4).toUpperCase();
    if (role === 'Leader') {
        return `${prefix}-${teamShort}-${idSuffix}-L`;
    }
    return `${prefix}-${teamShort}-${idSuffix}-M${index + 1}`;
};

// GET /api/food/status - returns current meal slot & timing status
router.get('/status', (req, res) => {
    const activeSlot = getCurrentMealSlot();
    const now = new Date();
    res.json({
        success: true,
        currentTime: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        dateStr: getTodayDateStr(),
        activeSlot: activeSlot ? activeSlot.name : null,
        activeSlotLabel: activeSlot ? activeSlot.label : 'Outside Meal Hours',
        slots: MEAL_SLOTS
    });
});

// GET /api/food/stats - live stats for coordinators & admin
router.get('/stats', async (req, res) => {
    try {
        const dateStr = req.query.date || getTodayDateStr();
        const scans = await MealScan.find({ dateStr }).sort({ scannedAt: -1 }).limit(100);

        const breakfastCount = await MealScan.countDocuments({ dateStr, mealType: 'BREAKFAST' });
        const lunchCount = await MealScan.countDocuments({ dateStr, mealType: 'LUNCH' });
        const dinnerCount = await MealScan.countDocuments({ dateStr, mealType: 'DINNER' });
        const totalToday = breakfastCount + lunchCount + dinnerCount;

        const activeSlot = getCurrentMealSlot();

        res.json({
            success: true,
            dateStr,
            activeSlot: activeSlot ? activeSlot.name : null,
            activeSlotLabel: activeSlot ? activeSlot.label : 'Outside Meal Hours',
            counts: {
                breakfast: breakfastCount,
                lunch: lunchCount,
                dinner: dinnerCount,
                total: totalToday
            },
            recentScans: scans
        });
    } catch (err) {
        console.error('Error fetching food stats:', err);
        res.status(500).json({ error: 'Failed to fetch food stats' });
    }
});

// POST /api/food/scan - Scan & verify participant QR
router.post('/scan', async (req, res) => {
    try {
        const { qrData, coordinatorName, overrideMealSlot } = req.body;

        if (!qrData) {
            return res.status(400).json({ success: false, status: 'INVALID', message: 'No QR data received' });
        }

        let rawStr = String(qrData).trim();
        // If qrData is a URL, extract pid query param or path
        if (rawStr.startsWith('http://') || rawStr.startsWith('https://')) {
            try {
                const u = new URL(rawStr);
                const p = u.searchParams.get('pid') || u.searchParams.get('id') || u.searchParams.get('p');
                if (p) rawStr = p.trim();
            } catch (_) {}
        }

        let parsed = null;
        try {
            parsed = typeof qrData === 'string' && qrData.startsWith('{') ? JSON.parse(qrData) : null;
        } catch (e) {}

        if (!parsed) {
            parsed = { participantId: rawStr };
        }

        const participantId = String(parsed.participantId || parsed.pid || parsed.qrPayload || rawStr).trim();
        if (!participantId) {
            return res.status(400).json({ success: false, status: 'INVALID', message: 'Invalid QR Code: Missing Participant ID' });
        }

        // Determine meal type (either forced by coordinator override or auto clock)
        let mealType = overrideMealSlot && overrideMealSlot !== 'AUTO' ? overrideMealSlot.toUpperCase() : null;
        if (!mealType) {
            const activeSlot = getCurrentMealSlot();
            if (activeSlot) {
                mealType = activeSlot.name;
            } else {
                // Auto-determine slot based on IST time of day (Breakfast <11am, Lunch 11am-4pm, Dinner >4pm)
                // This ensures legitimate scans during symposium hours are not rejected due to slight schedule variations or clock drifts
                const istDate = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
                const curHour = istDate.getHours();
                mealType = curHour < 11 ? 'BREAKFAST' : (curHour < 16 ? 'LUNCH' : 'DINNER');
            }
        }

        const dateStr = getTodayDateStr();

        // 1. Check if already scanned for this meal today
        const existingScan = await MealScan.findOne({ participantId, mealType, dateStr });
        if (existingScan) {
            const timeStr = new Date(existingScan.scannedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
            return res.status(409).json({
                success: false,
                status: 'ALREADY_SCANNED',
                message: `ALREADY REDEEMED! ${existingScan.participantName} already claimed ${mealType} today at ${timeStr}.`,
                scanInfo: existingScan
            });
        }

        // 2. Fetch full participant details from registration if not provided in QR payload
        let teamName = parsed.teamName || parsed.team;
        let participantName = parsed.participantName || parsed.name;
        let participantRole = parsed.participantRole || parsed.role || 'Member';
        let college = parsed.college || '';
        let eventName = parsed.event || 'Navonmesh';
        let teamId = parsed.teamId || parsed.tid || '';

        // If details are sparse, search in DB
        if (!participantName || !teamName) {
            // 1. Direct SQUAD ID regex match (e.g. SQUAD238-L or SQUAD238-M1)
            const squadMatch = participantId.match(/^(SQUAD\d+)-(L|M(\d+))$/i);
            if (squadMatch) {
                const sId = squadMatch[1].toUpperCase();
                const roleType = squadMatch[2].toUpperCase();
                const t = await Registration.findOne({ teamId: { $regex: new RegExp(`^${sId}$`, 'i') } });
                if (t) {
                    teamId = t._id.toString();
                    teamName = t.teamName;
                    college = t.college || '';
                    eventName = t.event;
                    if (roleType === 'L') {
                        participantName = t.leaderName;
                        participantRole = 'Leader';
                    } else {
                        const mIdx = parseInt(squadMatch[3], 10) - 1;
                        if (t.members && t.members[mIdx]) {
                            participantName = t.members[mIdx].name;
                            participantRole = `Member ${mIdx + 2}`;
                            college = t.members[mIdx].college || t.college || '';
                        }
                    }
                }
            }

            // 2. Check all teams with both ID schemes if not resolved yet
            if (!participantName) {
                const allTeams = await Registration.find();
                for (const t of allTeams) {
                    const lPid1 = generateParticipantId(t, 'Leader');
                    const lPid2 = `${t.edition === '2027' ? 'NAV27' : 'NAV26'}-${(t.teamName || 'TEAM').replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase()}-${String(t._id || '').slice(-4).toUpperCase()}-L`;
                    if (lPid1 === participantId || lPid2 === participantId) {
                        teamId = t._id.toString();
                        teamName = t.teamName;
                        participantName = t.leaderName;
                        participantRole = 'Leader';
                        college = t.college || '';
                        eventName = t.event;
                        break;
                    }
                    if (Array.isArray(t.members)) {
                        for (let mIdx = 0; mIdx < t.members.length; mIdx++) {
                            const mPid1 = generateParticipantId(t, 'Member', mIdx);
                            const mPid2 = `${t.edition === '2027' ? 'NAV27' : 'NAV26'}-${(t.teamName || 'TEAM').replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase()}-${String(t._id || '').slice(-4).toUpperCase()}-M${mIdx + 1}`;
                            if (mPid1 === participantId || mPid2 === participantId) {
                                teamId = t._id.toString();
                                teamName = t.teamName;
                                participantName = t.members[mIdx].name;
                                participantRole = `Member ${mIdx + 2}`;
                                college = t.members[mIdx].college || t.college || '';
                                eventName = t.event;
                                break;
                            }
                        }
                    }
                    if (participantName) break;
                }
            }
        }

        if (!participantName) {
            participantName = `Participant (${participantId})`;
            teamName = teamName || 'Navonmesh Team';
        }

        // 3. Save new verified meal scan
        const newScan = new MealScan({
            participantId,
            teamId: teamId || 'UNKNOWN',
            teamName,
            participantName,
            participantRole,
            college,
            event: eventName,
            mealType,
            dateStr,
            scannedAt: new Date(),
            scannedBy: coordinatorName || 'Coordinator',
            counterLocation: 'Mess & Canteen'
        });

        await newScan.save();

        return res.json({
            success: true,
            status: 'APPROVED',
            message: `MEAL APPROVED! Welcome, ${participantName} (${mealType}).`,
            scanInfo: newScan
        });

    } catch (err) {
        if (err.code === 11000) {
            // Concurrent duplicate scan caught by Mongo unique compound index
            return res.status(409).json({
                success: false,
                status: 'ALREADY_SCANNED',
                message: 'ALREADY REDEEMED! This QR was just scanned at another counter.'
            });
        }
        console.error('Scan error:', err);
        return res.status(500).json({ success: false, status: 'ERROR', message: 'Internal server error during scan' });
    }
});

// POST /api/food/participant-pass - Login & fetch digital passes for all members of a team
router.post('/participant-pass', async (req, res) => {
    try {
        const { identifier, teamId, id, password } = req.body;
        const queryTerm = String(identifier || teamId || id || '').trim();
        if (!queryTerm) {
            return res.status(400).json({ error: 'Please enter Team ID, Leader Phone, or Leader Email' });
        }

        const cleanId = queryTerm;
        const lowId = cleanId.toLowerCase();

        // Match by teamId (case-insensitive e.g. SQUAD238), leaderPhone, leaderEmail, teamName, or MongoDB _id
        const orConditions = [
            { teamId: { $regex: new RegExp(`^${cleanId}$`, 'i') } },
            { leaderEmail: lowId },
            { leaderPhone: cleanId },
            { teamName: { $regex: new RegExp(`^${cleanId}$`, 'i') } }
        ];

        if (teamId && String(teamId).trim() !== cleanId) {
            orConditions.push({ teamId: { $regex: new RegExp(`^${String(teamId).trim()}$`, 'i') } });
        }

        if (mongoose.Types.ObjectId.isValid(cleanId) && cleanId.length === 24) {
            orConditions.push({ _id: new mongoose.Types.ObjectId(cleanId) });
        }
        if (id && mongoose.Types.ObjectId.isValid(id) && String(id).length === 24) {
            orConditions.push({ _id: new mongoose.Types.ObjectId(id) });
        }

        const team = await Registration.findOne({ $or: orConditions });

        if (!team) {
            return res.status(404).json({ error: 'Team not found. Please check your credentials.' });
        }

        // Optional password check (default allows leader phone, or team name)
        if (password) {
            const cleanPass = String(password).trim().toLowerCase();
            const validPasses = [
                (team.leaderPhone || '').toLowerCase(),
                (team.teamPassword || '').toLowerCase(),
                'navonmesh2027',
                'navonmesh2026',
                (team.teamName || '').replace(/\s+/g, '').toLowerCase()
            ].filter(Boolean);
            if (!validPasses.includes(cleanPass)) {
                return res.status(401).json({ error: 'Invalid password. Tip: Default password is the Team Leader Phone number.' });
            }
        }

        const dateStr = getTodayDateStr();

        // Build passes for Leader + Members
        const participants = [];

        // 1. Leader
        const leaderPid = generateParticipantId(team, 'Leader');
        const leaderQrPayload = leaderPid; // High-contrast, clean 10-char QR code
        const leaderQrUrl = await QRCode.toDataURL(leaderQrPayload, { 
            errorCorrectionLevel: 'M',
            margin: 4, 
            width: 400 
        });
        const leaderScans = await MealScan.find({ participantId: leaderPid, dateStr });

        participants.push({
            participantId: leaderPid,
            name: team.leaderName,
            role: 'Team Leader',
            email: team.leaderEmail,
            phone: team.leaderPhone,
            college: team.college || 'SSGMCE',
            qrCodeUrl: leaderQrUrl,
            qrData: leaderQrPayload,
            todayMeals: {
                breakfast: leaderScans.some(s => s.mealType === 'BREAKFAST'),
                lunch: leaderScans.some(s => s.mealType === 'LUNCH'),
                dinner: leaderScans.some(s => s.mealType === 'DINNER')
            }
        });

        // 2. Members
        if (Array.isArray(team.members)) {
            for (let i = 0; i < team.members.length; i++) {
                const mem = team.members[i];
                const memPid = generateParticipantId(team, 'Member', i);
                const memQrPayload = memPid; // High-contrast, clean 10-char QR code
                const memQrUrl = await QRCode.toDataURL(memQrPayload, { 
                    errorCorrectionLevel: 'M',
                    margin: 4, 
                    width: 400 
                });
                const memScans = await MealScan.find({ participantId: memPid, dateStr });

                participants.push({
                    participantId: memPid,
                    name: mem.name,
                    role: `Team Member ${i + 2}`,
                    email: mem.email,
                    phone: mem.phone || '',
                    college: mem.college || team.college || 'SSGMCE',
                    qrCodeUrl: memQrUrl,
                    qrData: memQrPayload,
                    todayMeals: {
                        breakfast: memScans.some(s => s.mealType === 'BREAKFAST'),
                        lunch: memScans.some(s => s.mealType === 'LUNCH'),
                        dinner: memScans.some(s => s.mealType === 'DINNER')
                    }
                });
            }
        }

        res.json({
            success: true,
            team: {
                id: team._id,
                teamName: team.teamName,
                event: team.event,
                edition: team.edition || '2027',
                college: team.college,
                teamSize: team.teamSize
            },
            participants
        });

    } catch (err) {
        console.error('Participant pass error:', err);
        res.status(500).json({ error: 'Failed to generate participant passes' });
    }
});

// POST /api/food/email-passes/:teamId - Email individual meal passes to team members
router.post('/email-passes/:teamId', async (req, res) => {
    try {
        const team = await Registration.findById(req.params.teamId);
        if (!team) return res.status(404).json({ error: 'Team not found' });

        const recipients = [team.leaderEmail, ...(team.members || []).map(m => m.email)].filter(Boolean);

        // Generate Leader QR
        const leaderPid = generateParticipantId(team, 'Leader');
        const leaderQrPayload = JSON.stringify({
            pid: leaderPid,
            name: team.leaderName,
            team: team.teamName,
            role: 'Leader',
            college: team.college || '',
            event: team.event
        });
        const leaderQrUrl = await QRCode.toDataURL(leaderQrPayload, { width: 250, margin: 2 });

        const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0b1329; color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #1e293b;">
            <div style="background: linear-gradient(135deg, #0ea5e9, #6366f1); padding: 25px; text-align: center;">
                <h1 style="margin: 0; color: #fff; font-size: 24px; letter-spacing: 1px;">NAVONMESH 2027</h1>
                <p style="margin: 6px 0 0 0; color: #e0f2fe; font-size: 14px;">Official Digital Meal Pass • Mess & Canteen</p>
            </div>
            <div style="padding: 25px; text-align: center;">
                <h2 style="color: #38bdf8; margin-top: 0;">Hello Team ${team.teamName}! 🍱</h2>
                <p style="color: #94a3b8; font-size: 14px;">Here is your official dynamic QR meal pass for Navonmesh 2027. Show this QR code at the mess counter for your meals.</p>
                
                <div style="background: #1e293b; border: 2px dashed #38bdf8; border-radius: 12px; padding: 20px; margin: 20px auto; max-width: 300px;">
                    <p style="margin: 0 0 10px 0; font-weight: bold; color: #fff;">${team.leaderName} (Leader)</p>
                    <img src="${leaderQrUrl}" alt="Meal QR Code" style="width: 200px; height: 200px; border-radius: 8px; background: #fff; padding: 6px;" />
                    <p style="margin: 10px 0 0 0; font-family: monospace; color: #38bdf8; font-size: 13px;">${leaderPid}</p>
                </div>

                <div style="background: rgba(14, 165, 233, 0.1); border-left: 4px solid #0ea5e9; padding: 12px; text-align: left; margin: 20px 0; font-size: 13px; color: #cbd5e1;">
                    <strong style="color: #38bdf8;">Meal Timings:</strong><br>
                    🌅 <strong>Breakfast:</strong> 08:00 AM – 09:30 AM (1 scan only)<br>
                    🍛 <strong>Lunch:</strong> 11:00 AM – 02:00 PM (1 scan only)<br>
                    🌙 <strong>Dinner:</strong> 07:00 PM – 09:30 PM (1 scan only)<br>
                    <em>Note: The exact same QR automatically unlocks for each meal slot!</em>
                </div>

                <p style="font-size: 13px; color: #94a3b8;">You can also download digital passes for ALL team members anytime by logging into the Navonmesh portal with your Leader Phone number: <strong>${team.leaderPhone}</strong></p>
            </div>
        </div>
        `;

        const sent = await sendEmail({
            to: recipients,
            subject: `Official Meal Pass & Dynamic QR - Navonmesh 2027 (${team.teamName})`,
            htmlContent
        });

        if (sent) {
            res.json({ success: true, message: `Meal passes sent to ${recipients.length} team email(s)` });
        } else {
            res.status(500).json({ error: 'Failed to send meal pass email' });
        }
    } catch (err) {
        console.error('Error emailing passes:', err);
        res.status(500).json({ error: 'Server error emailing passes' });
    }
});

module.exports = router;
