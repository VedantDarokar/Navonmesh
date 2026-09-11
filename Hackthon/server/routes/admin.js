const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Registration = require('../models/Registration');
const Accommodation = require('../models/Accommodation');
const Cultural = require('../models/Cultural');
const sendEmail = require('../utils/email');
const Timer = require('../models/Timer');
const CommitteeMember = require('../models/CommitteeMember');
const Recruitment = require('../models/Recruitment');

const coreMembersUtil = require('../utils/coreMembers');

router.post('/login', (req, res) => {
    const { id, password } = req.body;
    const cleanId = (id || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    const admins = [
        { id: 'nihal1512', password: 'rutuja1512', name: 'Nihal', subRole: 'Overall Head' },
        { id: 'vedant1510', password: 'Vedant@15', name: 'Vedant', subRole: 'Overall Head' }
    ];

    let adminUser = admins.find(a => a.id.toLowerCase() === cleanId && a.password === cleanPassword);

    // Also check core members
    if (!adminUser) {
        const coreMembers = coreMembersUtil.getCoreMembers();
        const member = coreMembers.find(m => 
            (m.loginId && m.loginId.toLowerCase() === cleanId) || 
            (m.email && m.email.toLowerCase() === cleanId) ||
            (m.sisId && m.sisId.toLowerCase() === cleanId)
        );

        if (member && member.password === cleanPassword) {
            adminUser = {
                name: member.name,
                subRole: `Core Member (${member.class || member.year || 'SSGMCE'})`
            };
        }
    }

    if (adminUser) {
        return res.json({
            success: true,
            token: 'admin_secret_token_navonmesh',
            adminInfo: {
                id: adminUser.id || cleanId,
                name: adminUser.name,
                subRole: adminUser.subRole
            }
        });
    } else {
        return res.status(401).json({ success: false, message: 'Invalid Admin Credentials' });
    }
});

// GET Core Members (Only nihal.ssgmce has clearance to view cleartext passwords)
router.get('/core-members', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader !== 'Bearer admin_secret_token_navonmesh') {
        return res.status(401).json({ error: 'Unauthorized Access' });
    }
    const requesterId = (req.headers['x-admin-id'] || '').toLowerCase().trim();
    const isAuthorized = ['nihal.ssgmce', 'nihal1512'].includes(requesterId);
    const members = coreMembersUtil.getCoreMembers();

    const formattedMembers = members.map(m => ({
        ...m,
        password: isAuthorized ? m.password : '••••••••'
    }));

    res.json({ success: true, count: formattedMembers.length, entries: formattedMembers });
});

// POST Core Members Upload / Update
router.post('/core-members/upload', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader !== 'Bearer admin_secret_token_navonmesh') {
        return res.status(401).json({ error: 'Unauthorized Access' });
    }

    const { csvContent, members } = req.body;

    let parsedMembers = [];
    if (csvContent) {
        parsedMembers = coreMembersUtil.parseCSV(csvContent);
    } else if (Array.isArray(members)) {
        parsedMembers = members.map(m => {
            const creds = coreMembersUtil.generateCredentials(m.name, m.dob);
            return {
                ...m,
                loginId: m.loginId || creds.loginId,
                password: m.password || creds.password
            };
        });
    }

    if (parsedMembers.length > 0) {
        coreMembersUtil.saveCoreMembers(parsedMembers);
        return res.json({ 
            success: true, 
            message: `Successfully loaded ${parsedMembers.length} core members`, 
            count: parsedMembers.length, 
            entries: parsedMembers 
        });
    } else {
        return res.status(400).json({ error: 'No valid member rows found in upload' });
    }
});

// DELETE Core Members Clear
router.delete('/core-members/clear', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader !== 'Bearer admin_secret_token_navonmesh') {
        return res.status(401).json({ error: 'Unauthorized Access' });
    }
    coreMembersUtil.saveCoreMembers([]);
    res.json({ success: true, message: 'Core members cleared' });
});

// Fetch all entries count and data
router.get('/data', async (req, res) => {
    // Auth Check
    const authHeader = req.headers.authorization;
    if (authHeader !== 'Bearer admin_secret_token_navonmesh') {
        return res.status(401).json({ error: 'Unauthorized Access' });
    }

    try {
        const srijan = await Registration.find({ event: 'Srijan (Hackathon)' });
        const ankur = await Registration.find({ event: 'Ankur (Project Expo)' });
        const udbhav = await Registration.find({ event: 'Udbhav (Conference)' });
        const cultural = await Cultural.find();
        const accommodation = await Accommodation.find();

        let totalGirls = 0;
        let totalBoys = 0;

        accommodation.forEach(a => {
            totalGirls += a.girlsCount || 0;
            totalBoys += a.boysCount || 0;
        });

        res.json({
            srijan: {
                count: srijan.length,
                entries: srijan.map(r => ({ ...r._doc, paymentVerified: r.paymentVerified, psEdited: r.psEdited }))
            },
            ankur: {
                count: ankur.length,
                entries: ankur.map(r => ({ ...r._doc, category: r.studentCategory, paymentVerified: r.paymentVerified }))
            },
            udbhav: {
                count: udbhav.length,
                entries: udbhav.map(r => ({ ...r._doc, paymentVerified: r.paymentVerified }))
            },
            cultural: {
                count: cultural.length,
                entries: cultural.map(r => ({ ...r._doc, paymentVerified: r.paymentVerified }))
            },
            accommodation: {
                count: accommodation.length,
                totalGirls,
                totalBoys,
                entries: accommodation.map(r => ({
                    ...r._doc,
                    girls: r.girlsCount,
                    boys: r.boysCount,
                    paymentVerified: r.paymentVerified
                }))
            }
        });
    } catch (err) {
        console.error('Error fetching admin data:', err);
        res.status(500).json({ error: 'Server error fetching data' });
    }
});

// Send confirmation email after UTR check
router.post('/send-confirmation/:id', async (req, res) => {
    // Auth Check
    const authHeader = req.headers.authorization;
    if (authHeader !== 'Bearer admin_secret_token_navonmesh') {
        return res.status(401).json({ error: 'Unauthorized Access' });
    }

    try {
        const teamId = req.params.id;
        const reg = await Registration.findById(teamId);

        if (!reg) return res.status(404).json({ error: 'Team not found' });
        if (reg.paymentVerified) return res.status(400).json({ error: 'Email already sent' });

        // Collect all emails
        const emails = [reg.leaderEmail, ...reg.members.map(m => m.email)].filter(Boolean);

        // Define contacts
        let eventHeadContact = '';
        if (reg.event.includes('Srijan')) {
            eventHeadContact = 'Atharva Tayade (+91 8767968475)';
        } else if (reg.event.includes('Ankur')) {
            eventHeadContact = 'Krushna Kokate (+91 8261905585)';
        } else if (reg.event.includes('Udbhav')) {
            eventHeadContact = 'Tanmay Kurhekar (+91 8605359181)';
        }

        const overallHeads = 'Overall Heads Contacts: Nihal Kankal (+91 8766417815), Vedant Darokar (+91 8208772402)';

        // HTML Content
        const htmlContent = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border: 1px solid #e0e0e0;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 2px;">Navonmesh '26</h1>
                <p style="color: #a8c0ff; margin: 10px 0 0 0; font-size: 16px;">The Horizon of Innovation</p>
            </div>

            <!-- Main Content -->
            <div style="padding: 40px 30px; color: #333333;">
                <h2 style="color: #1a1a1a; margin-top: 0; font-size: 24px;">Registration Confirmed! 🎉</h2>
                <p style="font-size: 16px; line-height: 1.6; color: #555555;">
                    Hello <strong>${reg.leaderName}</strong> and Team <strong style="color: #2a5298;">${reg.teamName}</strong>,
                </p>
                <p style="font-size: 16px; line-height: 1.6; color: #555555;">
                    Get ready to blast off! We're thrilled to inform you that your registration for <strong>${reg.event}</strong> has been successfully verified. 
                    Your payment is confirmed, and your team is officially onboard.
                </p>

                <!-- Team Details Card -->
                <div style="background-color: #f8f9fa; border-left: 4px solid #2a5298; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
                    <h3 style="margin-top: 0; color: #1a1a1a; font-size: 18px; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">Mission Details</h3>
                    <ul style="list-style-type: none; padding: 0; margin: 0;">
                        <li style="margin-bottom: 10px;"><strong style="color: #555;">Team Name:</strong> <span style="font-weight: 600;">${reg.teamName}</span></li>
                        <li style="margin-bottom: 10px;"><strong style="color: #555;">Category:</strong> ${reg.event}</li>
                        <li style="margin-bottom: 10px;"><strong style="color: #555;">Leader:</strong> ${reg.leaderName}</li>
                        <li style="margin-bottom: 10px;"><strong style="color: #555;">Crew Size:</strong> ${reg.teamSize} Member(s)</li>
                        ${reg.college ? `<li style="margin-bottom: 0;"><strong style="color: #555;">Institute:</strong> ${reg.college}</li>` : ''}
                    </ul>
                </div>

                <!-- Contact Section -->
                <h3 style="color: #1a1a1a; font-size: 18px; margin-top: 30px;">Need Assistance?</h3>
                <p style="font-size: 15px; color: #666; margin-bottom: 10px;">Reach out to your event commanders:</p>
                <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px;">
                    <ul style="list-style: none; padding: 0; margin: 0; font-size: 14px; color: #333;">
                        <li style="margin-bottom: 8px;">👨‍🚀 <strong>Event Head:</strong> ${eventHeadContact}</li>
                        <li>👑 <strong>Overall Heads:</strong> Nihal Kankal (+91 8766417815) <br> <span style="margin-left:24px;">Vedant Darokar (+91 8208772402)</span></li>
                    </ul>
                </div>

                <div style="margin-top: 40px; text-align: center; border-top: 1px solid #eee; padding-top: 30px;">
                    <p style="font-size: 18px; color: #2a5298; font-weight: bold; margin-bottom: 5px;">See you at Navonmesh '26!</p>
                    <p style="font-size: 14px; color: #888; margin: 0; margin-bottom: 10px;">Further updates will be sent to you on WhatsApp and via Email.</p>
                    <p style="font-size: 14px; color: #888; margin: 0;">- Navonmesh '26 Organizing Committee</p>
                </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
                <p style="margin: 0;">This is an automated message. Please do not reply directly to this email.</p>
            </div>
        </div>
        `;

        const mailSuccess = await sendEmail({
            to: emails,
            subject: `Registration Confirmed - Navonmesh 2026 (${reg.teamName})`,
            htmlContent
        });

        if (mailSuccess) {
            reg.paymentVerified = true;
            await reg.save();
            return res.json({ success: true, message: 'Confirmation email sent successfully' });
        } else {
            return res.status(500).json({ error: 'Failed to send email' });
        }

    } catch (err) {
        console.error('Email sending error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Send confirmation email for Cultural event
router.post('/cultural/send-confirmation/:id', async (req, res) => {
    // Auth Check
    const authHeader = req.headers.authorization;
    if (authHeader !== 'Bearer admin_secret_token_navonmesh') {
        return res.status(401).json({ error: 'Unauthorized Access' });
    }

    try {
        const participantId = req.params.id;
        const reg = await Cultural.findById(participantId);

        if (!reg) return res.status(404).json({ error: 'Participant not found' });
        if (reg.paymentVerified) return res.status(400).json({ error: 'Email already sent' });

        // Collect all emails
        const emails = [reg.email].filter(Boolean);

        // Define contacts
        const eventHeadContact = 'Sushant Akhare (+91 97631 82186)';
        const overallHeads = 'Overall Heads Contacts: Nihal Kankal (+91 8766417815), Vedant Darokar (+91 8208772402)';

        // HTML Content
        const htmlContent = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border: 1px solid #e0e0e0;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #cc2b5e 0%, #753a88 100%); padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 2px;">Navonmesh '26</h1>
                <p style="color: #ffb8d2; margin: 10px 0 0 0; font-size: 16px;">कलास्पंदन '26</p>
            </div>

            <!-- Main Content -->
            <div style="padding: 40px 30px; color: #333333;">
                <h2 style="color: #1a1a1a; margin-top: 0; font-size: 24px;">Registration Confirmed! 🎉</h2>
                <p style="font-size: 16px; line-height: 1.6; color: #555555;">
                    Hello <strong style="color: #cc2b5e;">${reg.participantName}</strong>,
                </p>
                <p style="font-size: 16px; line-height: 1.6; color: #555555;">
                    Get ready to shine on stage! We're thrilled to inform you that your registration for the <strong>Cultural Event (कलास्पंदन)</strong> has been successfully verified. 
                    Your payment is confirmed, and you are officially onboard.
                </p>

                <!-- Performance Details Card -->
                <div style="background-color: #fcf5f8; border-left: 4px solid #cc2b5e; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
                    <h3 style="margin-top: 0; color: #1a1a1a; font-size: 18px; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">Performance Details</h3>
                    <ul style="list-style-type: none; padding: 0; margin: 0;">
                        <li style="margin-bottom: 10px;"><strong style="color: #555;">Participant:</strong> <span style="font-weight: 600;">${reg.participantName}</span></li>
                        <li style="margin-bottom: 10px;"><strong style="color: #555;">Activity:</strong> ${reg.activity}</li>
                        <li style="margin-bottom: 10px;"><strong style="color: #555;">Class/Branch:</strong> ${reg.className}</li>
                        ${reg.member2Name ? `<li style="margin-bottom: 10px;"><strong style="color: #555;">Partner Name:</strong> ${reg.member2Name}</li>` : ''}
                        ${reg.groupSize ? `<li style="margin-bottom: 10px;"><strong style="color: #555;">Group Size:</strong> ${reg.groupSize} Members</li>` : ''}
                        ${reg.college ? `<li style="margin-bottom: 0;"><strong style="color: #555;">Institute:</strong> ${reg.college}</li>` : ''}
                    </ul>
                </div>

                <!-- Contact Section -->
                <h3 style="color: #1a1a1a; font-size: 18px; margin-top: 30px;">Need Assistance?</h3>
                <p style="font-size: 15px; color: #666; margin-bottom: 10px;">Reach out to your event commanders:</p>
                <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px;">
                    <ul style="list-style: none; padding: 0; margin: 0; font-size: 14px; color: #333;">
                        <li style="margin-bottom: 8px;">🎭 <strong>Cultural Head:</strong> ${eventHeadContact}</li>
                        <li>👑 <strong>Overall Heads:</strong> Nihal Kankal (+91 8766417815) <br> <span style="margin-left:24px;">Vedant Darokar (+91 8208772402)</span></li>
                    </ul>
                </div>

                <div style="margin-top: 40px; text-align: center; border-top: 1px solid #eee; padding-top: 30px;">
                    <p style="font-size: 18px; color: #cc2b5e; font-weight: bold; margin-bottom: 5px;">See you at Navonmesh '26!</p>
                    <p style="font-size: 14px; color: #888; margin: 0; margin-bottom: 10px;">Further updates will be sent to you on WhatsApp and via Email.</p>
                    <p style="font-size: 14px; color: #888; margin: 0;">- Navonmesh '26 Organizing Committee</p>
                </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
                <p style="margin: 0;">This is an automated message. Please do not reply directly to this email.</p>
            </div>
        </div>
        `;

        const mailSuccess = await sendEmail({
            to: emails,
            subject: `Registration Confirmed - Navonmesh 2026 Cultural Event`,
            htmlContent
        });

        if (mailSuccess) {
            reg.paymentVerified = true;
            await reg.save();
            return res.json({ success: true, message: 'Confirmation email sent successfully' });
        } else {
            return res.status(500).json({ error: 'Failed to send email' });
        }

    } catch (err) {
        console.error('Email sending error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Send confirmation email for Accommodation
router.post('/accommodation/send-confirmation/:id', async (req, res) => {
    // Auth Check
    const authHeader = req.headers.authorization;
    if (authHeader !== 'Bearer admin_secret_token_navonmesh') {
        return res.status(401).json({ error: 'Unauthorized Access' });
    }

    try {
        const accId = req.params.id;
        const reg = await Accommodation.findById(accId);

        if (!reg) return res.status(404).json({ error: 'Accommodation record not found' });
        if (reg.paymentVerified) return res.status(400).json({ error: 'Email already sent' });

        // Collect all emails
        const emails = [reg.leaderEmail, ...reg.members.map(m => m.email)].filter(Boolean);

        // Overall Heads
        const overallHeads = 'Nihal Kankal (+91 8766417815), Vedant Darokar (+91 8208772402)';

        // HTML Content
        const htmlContent = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border: 1px solid #e0e0e0;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #0f172a 0%, #334155 100%); padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 2px;">Navonmesh '26</h1>
                <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 16px;">Accommodation Request Confirmed</p>
            </div>

            <!-- Main Content -->
            <div style="padding: 40px 30px; color: #333333;">
                <h2 style="color: #1a1a1a; margin-top: 0; font-size: 24px;">Stay Secured! 🏠</h2>
                <p style="font-size: 16px; line-height: 1.6; color: #555555;">
                    Hello <strong>${reg.leaderName}</strong>,
                </p>
                <p style="font-size: 16px; line-height: 1.6; color: #555555;">
                    Your request for accommodation during <strong>Navonmesh '26</strong> has been received and confirmed. We have reserved space for your team based on your registration details.
                </p>

                <!-- Stay Details Card -->
                <div style="background-color: #f8fafc; border-left: 4px solid #334155; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
                    <h3 style="margin-top: 0; color: #1a1a1a; font-size: 18px; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">Stay Details</h3>
                    <ul style="list-style-type: none; padding: 0; margin: 0;">
                        <li style="margin-bottom: 10px;"><strong style="color: #555;">Team Name:</strong> <span style="font-weight: 600;">${reg.teamName}</span></li>
                        <li style="margin-bottom: 10px;"><strong style="color: #555;">Associated Event:</strong> ${reg.event}</li>
                        <li style="margin-bottom: 10px;"><strong style="color: #555;">Total Occupants:</strong> ${reg.teamSize}</li>
                        <li style="margin-bottom: 10px;"><strong style="color: #555;">Girls:</strong> ${reg.girlsCount} | <strong style="color: #555;">Boys:</strong> ${reg.boysCount}</li>
                        ${reg.college ? `<li style="margin-bottom: 0;"><strong style="color: #555;">Institute:</strong> ${reg.college}</li>` : ''}
                    </ul>
                </div>

                <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin-top: 20px;">
                    <p style="font-size: 14px; color: #475569; margin: 0;"><strong>Note:</strong> Please carry your College ID Cards. Accommodation facility is subject to institute rules and discipline guidelines.</p>
                </div>

                <!-- Contact Section -->
                <h3 style="color: #1a1a1a; font-size: 18px; margin-top: 30px;">Queries Regarding Stay?</h3>
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px;">
                    <ul style="list-style: none; padding: 0; margin: 0; font-size: 14px; color: #333;">
                        <li>👑 <strong>Overall Heads:</strong> Nihal Kankal (+91 8766417815), Vedant Darokar (+91 8208772402)</li>
                    </ul>
                </div>

                <div style="margin-top: 40px; text-align: center; border-top: 1px solid #eee; padding-top: 30px;">
                    <p style="font-size: 18px; color: #334155; font-weight: bold; margin-bottom: 5px;">We wish you a comfortable stay!</p>
                    <p style="font-size: 14px; color: #888; margin: 0;">- Navonmesh '26 Organizing Committee</p>
                </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
                <p style="margin: 0;">This is an automated message regarding your stay arrangements.</p>
            </div>
        </div>
        `;

        const mailSuccess = await sendEmail({
            to: emails,
            subject: `Accommodation Confirmed - Navonmesh 2026 (${reg.teamName})`,
            htmlContent
        });

        if (mailSuccess) {
            reg.paymentVerified = true;
            await reg.save();
            return res.json({ success: true, message: 'Accommodation confirmation email sent successfully' });
        } else {
            return res.status(500).json({ error: 'Failed to send email' });
        }

    } catch (err) {
        console.error('Accommodation Email error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

function formatEmailBodyHtml(rawText) {
    if (!rawText) return '';

    const lines = rawText.split(/\r?\n/);
    let scheduleItems = [];
    let contentLines = [];
    let inSchedule = true;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (inSchedule && (
            line.toUpperCase().includes('VENUE') ||
            line.toUpperCase().includes('TIME') ||
            line.toUpperCase().includes('AGENDA') ||
            line.toUpperCase().includes('DATE') ||
            line.startsWith('📍') ||
            line.startsWith('⏰') ||
            line.startsWith('🎯') ||
            line.startsWith('🏛')
        )) {
            scheduleItems.push(line);
        } else if (inSchedule && (line.startsWith('───') || line.startsWith('═══') || line === '')) {
            if (scheduleItems.length > 0 && (line.startsWith('───') || line.startsWith('═══'))) {
                inSchedule = false;
            }
        } else {
            inSchedule = false;
            contentLines.push(lines[i]);
        }
    }

    let html = '';

    if (scheduleItems.length > 0) {
        html += `
        <!-- High-Priority Schedule & Venue Banner -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px; background:linear-gradient(135deg,#240810 0%,#160e11 100%); border:1.5px solid #c9a84c; border-radius:8px; box-shadow:0 6px 22px rgba(0,0,0,0.65);">
          <tr>
            <td style="padding:18px 22px;">
              <div style="font-size:11px; letter-spacing:3px; color:#f0d060; font-family:Georgia,serif; text-transform:uppercase; margin-bottom:12px; font-weight:bold; border-bottom:1px solid rgba(201,168,76,0.35); padding-bottom:8px;">
                &#10022; &nbsp; OFFICIAL VENUE &amp; TIME DIRECTIVE &nbsp; &#10022;
              </div>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                ${scheduleItems.map(item => {
                    const cleaned = item.replace(/^[📍⏰🎯🏛️📋\s]+/, '');
                    const parts = cleaned.split(/[:：](.*)/s);
                    const label = parts[0] ? parts[0].trim() : cleaned;
                    const value = parts[1] ? parts[1].trim() : '';
                    return `
                    <tr>
                      <td style="padding:6px 0; font-family:Georgia,serif; font-size:14px; vertical-align:top;">
                        <span style="color:#f5df9e; font-weight:bold; letter-spacing:1px; text-transform:uppercase;">&#10022; ${label}${value ? ':' : ''}</span>
                        ${value ? `<span style="color:#FFFDF5; margin-left:8px; font-weight:600; font-size:14.5px;">${value}</span>` : ''}
                      </td>
                    </tr>`;
                }).join('')}
              </table>
            </td>
          </tr>
        </table>`;
    }

    const remainingText = contentLines.join('\n').trim();

    if (remainingText.includes('POD.AI') || remainingText.includes('POD AI') || remainingText.includes('Advisory') || remainingText.includes('ADVISORY')) {
        const paragraphs = remainingText.split(/\n\s*\n/);
        const formattedParagraphs = paragraphs.map(p => {
            const trimmed = p.trim();
            if (trimmed.toUpperCase().includes('POD.AI') || trimmed.toUpperCase().includes('POD AI') || trimmed.toUpperCase().includes('ADVISORY')) {
                return `
                <div style="background:rgba(245,158,11,0.09); border-left:4px solid #f59e0b; border:1px solid rgba(245,158,11,0.3); border-left-width:4px; border-radius:0 8px 8px 0; padding:16px 20px; margin:24px 0; color:#fef3c7; font-size:14.5px; line-height:1.8; font-family:Georgia,serif;">
                  ${trimmed.replace(/\n/g, '<br>')}
                </div>`;
            } else if (trimmed.startsWith('Dear ')) {
                return `<p style="font-size:17.5px; color:#f5df9e; font-weight:bold; margin:0 0 16px; font-family:Georgia,serif; letter-spacing:0.5px;">${trimmed}</p>`;
            } else {
                return `<p style="margin:0 0 16px; color:#ede5d8; font-size:15px; line-height:1.9; font-family:Georgia,serif;">${trimmed.replace(/\n/g, '<br>')}</p>`;
            }
        });
        html += formattedParagraphs.join('');
    } else {
        html += `<div style="font-family:Georgia,'Times New Roman',serif;font-size:15.5px;line-height:1.9;color:#ede5d8;white-space:pre-wrap;word-break:break-word;">${remainingText}</div>`;
    }

    return html;
}

// Bulk Email Broadcasting Route
router.post('/send-bulk-email', async (req, res) => {
    // Auth Check
    const authHeader = req.headers.authorization;
    if (authHeader !== 'Bearer admin_secret_token_navonmesh') {
        return res.status(401).json({ error: 'Unauthorized Access' });
    }

    const { subject, body, targetEvents, recipients: selectedRecipients, recipientScope } = req.body;

    if (!subject || !body) {
        return res.status(400).json({ error: 'Subject and Body are required' });
    }

    try {
        let recipients = [];

        // If explicit recipients are provided from the frontend, use them
        if (selectedRecipients && selectedRecipients.length > 0) {
            if (recipientScope === 'ALL') {
                // Fetch full documents to expand recipients to include all team members
                const ids = selectedRecipients.map(r => r.id);
                const validMongoIds = ids.filter(id => id && mongoose.Types.ObjectId.isValid(id));

                let regs = [], accs = [], cults = [], recruits = [];
                if (validMongoIds.length > 0) {
                    [regs, accs, cults, recruits] = await Promise.all([
                        Registration.find({ _id: { $in: validMongoIds } }),
                        Accommodation.find({ _id: { $in: validMongoIds } }),
                        Cultural.find({ _id: { $in: validMongoIds } }),
                        Recruitment.find({ _id: { $in: validMongoIds } })
                    ]);
                }

                let expandedRecipients = [];

                // Expanded logic for Main Registrations
                regs.forEach(r => {
                    expandedRecipients.push({ name: r.leaderName, email: r.leaderEmail, team: r.teamName });
                    if (r.members && r.members.length > 0) {
                        r.members.forEach(m => {
                            if (m.email) expandedRecipients.push({ name: m.name, email: m.email, team: r.teamName });
                        });
                    }
                });

                // Expanded logic for Accommodation
                accs.forEach(a => {
                    expandedRecipients.push({ name: a.leaderName, email: a.leaderEmail, team: a.teamName });
                    if (a.members && a.members.length > 0) {
                        a.members.forEach(m => {
                            if (m.email) expandedRecipients.push({ name: m.name, email: m.email, team: a.teamName });
                        });
                    }
                });

                // Expanded logic for Cultural (Cultural usually doesn't have member emails)
                cults.forEach(c => {
                    expandedRecipients.push({ name: c.participantName, email: c.email, team: 'Cultural Performance' });
                });

                // Expanded logic for Recruitment
                recruits.forEach(rc => {
                    expandedRecipients.push({
                        name: rc.name,
                        email: rc.email,
                        team: `Recruitment (${rc.designation || 'Applicant'})`,
                        designation: rc.designation || 'Applicant'
                    });
                });

                // Expanded logic for Core Members
                const allCores = coreMembersUtil.getCoreMembers();
                const matchedCores = allCores.filter(c => ids.includes(c.id) || ids.includes(c.sisId) || ids.includes(c.loginId) || ids.includes(`core_${c.name}`));
                matchedCores.forEach(cm => {
                    expandedRecipients.push({
                        name: cm.name,
                        email: cm.email,
                        team: `Core Member - ${cm.class || cm.year || 'SSGMCE'}`,
                        designation: 'Core Member',
                        loginId: cm.loginId || '',
                        password: cm.password || '',
                        sisId: cm.sisId || '',
                        class: cm.class || '',
                        dob: cm.dob || '',
                        year: cm.year || '',
                        type: 'Core Member'
                    });
                });

                // Preserve any directly selected Core Members who already carry credentials
                selectedRecipients.filter(r => r.type === 'Core Member' || r.loginId).forEach(cm => {
                    if (!expandedRecipients.some(x => x.email && x.email.toLowerCase() === (cm.email || '').toLowerCase())) {
                        expandedRecipients.push(cm);
                    }
                });

                recipients = expandedRecipients;
            } else {
                // Leaders only / direct selected recipients
                const allCores = coreMembersUtil.getCoreMembers();
                recipients = selectedRecipients.map(r => {
                    if (r.type === 'Core Member' || r.loginId) {
                        const matched = allCores.find(c =>
                            c.id === r.id ||
                            c.sisId === r.id ||
                            c.loginId === r.id ||
                            (r.loginId && c.loginId && c.loginId.toLowerCase() === r.loginId.toLowerCase()) ||
                            (c.email && r.email && c.email.toLowerCase() === r.email.toLowerCase())
                        );
                        if (matched) {
                            return {
                                ...r,
                                loginId: matched.loginId,
                                password: matched.password, // Server holds the true password
                                sisId: matched.sisId,
                                class: matched.class,
                                dob: matched.dob,
                                year: matched.year
                            };
                        }
                    }
                    return r;
                });
            }
        } else {
            // Fallback to legacy behavior: fetch based on targetEvents
            let allRecipients = [];
            const targets = targetEvents || ['ALL'];
            const isAll = targets.includes('ALL');

            // 1. Fetch from Main Registration (Hackathon, Expo, Conference)
            if (isAll || targets.some(t => ['Srijan (Hackathon)', 'Ankur (Project Expo)', 'Udbhav (Conference)'].includes(t))) {
                let registrationQuery = {};
                if (!isAll) {
                    const subEvents = targets.filter(t => ['Srijan (Hackathon)', 'Ankur (Project Expo)', 'Udbhav (Conference)'].includes(t));
                    if (subEvents.length > 0) registrationQuery.event = { $in: subEvents };
                }
                const regs = await Registration.find(registrationQuery);
                regs.forEach(r => {
                    allRecipients.push({
                        name: r.leaderName,
                        email: r.leaderEmail,
                        team: r.teamName
                    });
                    if (recipientScope === 'ALL' && r.members && r.members.length > 0) {
                        r.members.forEach(m => {
                            if (m.email) allRecipients.push({ name: m.name, email: m.email, team: r.teamName });
                        });
                    }
                });
            }

            // 2. Fetch from Cultural
            if (isAll || targets.includes('Cultural')) {
                const cults = await Cultural.find();
                cults.forEach(c => allRecipients.push({
                    name: c.participantName,
                    email: c.email,
                    team: 'Cultural Team'
                }));
            }

            // 3. Fetch from Accommodation
            if (isAll || targets.includes('Accommodation')) {
                const accs = await Accommodation.find();
                accs.forEach(a => {
                    allRecipients.push({
                        name: a.leaderName,
                        email: a.leaderEmail,
                        team: a.teamName
                    });
                    if (recipientScope === 'ALL' && a.members && a.members.length > 0) {
                        a.members.forEach(m => {
                            if (m.email) allRecipients.push({ name: m.name, email: m.email, team: a.teamName });
                        });
                    }
                });
            }

            // 4. Fetch from Recruitment
            if (isAll || targets.includes('Recruitment')) {
                const recruits = await Recruitment.find();
                recruits.forEach(rc => {
                    allRecipients.push({
                        name: rc.name,
                        email: rc.email,
                        team: `Recruitment (${rc.designation || 'Applicant'})`,
                        designation: rc.designation || 'Applicant'
                    });
                });
            }

            // 5. Fetch from Core Members
            if (isAll || targets.includes('Core Members')) {
                const cores = coreMembersUtil.getCoreMembers();
                cores.forEach(cm => {
                    allRecipients.push({
                        name: cm.name,
                        email: cm.email,
                        team: `Core Member - ${cm.class || cm.year || 'SSGMCE'}`,
                        designation: 'Core Member',
                        loginId: cm.loginId || '',
                        password: cm.password || '',
                        sisId: cm.sisId || '',
                        class: cm.class || '',
                        dob: cm.dob || '',
                        year: cm.year || '',
                        type: 'Core Member'
                    });
                });
            }

            // Remove duplicates if any (same email in multiple collections)
            const uniqueRecipientsMap = new Map();
            allRecipients.forEach(r => {
                if (r.email && !uniqueRecipientsMap.has(r.email.toLowerCase())) {
                    uniqueRecipientsMap.set(r.email.toLowerCase(), r);
                }
            });
            recipients = Array.from(uniqueRecipientsMap.values());
        }

        if (recipients.length === 0) {
            return res.status(404).json({ error: 'No recipients found for selected targets' });
        }

        let successCount = 0;
        let failCount = 0;

        for (const recipient of recipients) {
            try {
                const displayName = recipient.name || 'Participant';
                const displayTeam = recipient.team || 'Team';
                const displayDesignation = recipient.designation || (recipient.type === 'Recruitment' ? 'Applicant' : 'Participant');
                const displayLoginId = recipient.loginId || '';
                const displayPassword = recipient.password || '';
                const displaySisId = recipient.sisId || '';
                const displayClass = recipient.class || '';
                const displayDob = recipient.dob || '';
                const displayYear = recipient.year || '';

                const personalizedSubject = (subject || '')
                    .replace(/{{participantName}}/gi, displayName)
                    .replace(/{{leaderName}}/gi, displayName)
                    .replace(/{{name}}/gi, displayName)
                    .replace(/{{teamName}}/gi, displayTeam)
                    .replace(/{{designation}}/gi, displayDesignation)
                    .replace(/{{loginId}}/gi, displayLoginId)
                    .replace(/{{login_id}}/gi, displayLoginId)
                    .replace(/{{loginid}}/gi, displayLoginId)
                    .replace(/{{username}}/gi, displayLoginId)
                    .replace(/{{password}}/gi, displayPassword)
                    .replace(/{{pass}}/gi, displayPassword);

                const personalizedBody = body
                    .replace(/{{participantName}}/gi, displayName)
                    .replace(/{{leaderName}}/gi, displayName)
                    .replace(/{{name}}/gi, displayName)
                    .replace(/{{teamName}}/gi, displayTeam)
                    .replace(/{{designation}}/gi, displayDesignation)
                    .replace(/{{loginId}}/gi, displayLoginId)
                    .replace(/{{login_id}}/gi, displayLoginId)
                    .replace(/{{loginid}}/gi, displayLoginId)
                    .replace(/{{username}}/gi, displayLoginId)
                    .replace(/{{id}}/gi, displayLoginId)
                    .replace(/{{password}}/gi, displayPassword)
                    .replace(/{{pass}}/gi, displayPassword)
                    .replace(/{{sisId}}/gi, displaySisId)
                    .replace(/{{sis_id}}/gi, displaySisId)
                    .replace(/{{class}}/gi, displayClass)
                    .replace(/{{dob}}/gi, displayDob)
                    .replace(/{{year}}/gi, displayYear);

                const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Navonmesh '27 - Official Communication</title>
</head>
<body style="margin:0;padding:0;background-color:#0d0b09;font-family:Georgia,'Times New Roman',serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(180deg,#120e0a 0%,#090705 100%);padding:36px 12px;">
  <tr>
    <td align="center">
      <table width="620" cellpadding="0" cellspacing="0" border="0" style="max-width:620px;width:100%;border-radius:10px;overflow:hidden;border:1px solid #483921;box-shadow:0 18px 60px rgba(0,0,0,0.85);background-color:#161411;">
        <!-- Top Gold Accent Bar -->
        <tr>
          <td style="height:4px;background:linear-gradient(90deg,#2d1200,#c9a84c,#f5d77f,#c9a84c,#2d1200);"></td>
        </tr>
        <!-- Burgundy Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#4d0b1a 0%,#701529 50%,#4d0b1a 100%);padding:38px 30px 30px;text-align:center;">
            <p style="margin:0 0 10px;font-size:11px;letter-spacing:8px;color:#f0d060;font-family:Georgia,'Times New Roman',serif;text-transform:uppercase;">&#10022; &nbsp; N A V O N M E S H &nbsp; ' 2 7 &nbsp; &#10022;</p>
            <h1 style="margin:0;font-size:34px;font-weight:900;color:#FFFDF5;font-family:Georgia,'Times New Roman',serif;letter-spacing:4px;line-height:1.15;text-shadow:0 3px 12px rgba(0,0,0,0.6);text-transform:uppercase;">NAVONMESH '27</h1>
            <p style="margin:8px 0 14px;font-size:11px;letter-spacing:7px;color:#e8c87a;font-family:Georgia,'Times New Roman',serif;text-transform:uppercase;">S S G M C E &nbsp;&nbsp; S H E G A O N</p>
            <p style="margin:0;font-size:13px;color:rgba(240,208,96,0.6);letter-spacing:6px;">&#10022; &nbsp; ─────── &nbsp; &#10022; &nbsp; ─────── &nbsp; &#10022;</p>
          </td>
        </tr>
        <!-- Gold Trim Line -->
        <tr>
          <td style="height:4px;background:linear-gradient(90deg,#2d1200,#c9a84c,#f5d77f,#c9a84c,#2d1200);"></td>
        </tr>
        <!-- Main Message Area -->
        <tr>
          <td style="background:#171512;padding:36px 42px 28px;">
            ${personalizedSubject ? `
            <div style="text-align:center;margin-bottom:26px;">
              <span style="display:inline-block;background:rgba(112,21,41,0.35);border:1px solid rgba(201,168,76,0.45);border-radius:20px;padding:6px 20px;color:#f5d77f;font-size:12px;letter-spacing:2px;font-family:Georgia,serif;font-weight:bold;text-transform:uppercase;">
                ${personalizedSubject}
              </span>
            </div>` : ''}
            
            ${formatEmailBodyHtml(personalizedBody)}

            <!-- Official Dispatch Ribbon -->
            <div style="margin:34px 0 16px;text-align:center;">
              <span style="display:inline-block;background:linear-gradient(135deg,#5b1121 0%,#7d1b30 100%);border:1px solid #c9a84c;border-radius:5px;padding:10px 28px;color:#f5df9e;font-size:11px;letter-spacing:4px;font-family:Georgia,serif;font-weight:bold;text-transform:uppercase;box-shadow:0 4px 15px rgba(0,0,0,0.45);">
                &#10022; &nbsp; OFFICIAL DISPATCH &nbsp; &#10022;
              </span>
            </div>

            <!-- Signature block -->
            <div style="border-top:1px solid #3c301d;margin-top:30px;padding-top:22px;">
              <p style="margin:0 0 5px;font-size:13.5px;color:#c9a84c;font-style:italic;font-family:Georgia,serif;">With Warm Regards,</p>
              <p style="margin:0;font-size:16px;color:#FFFDF5;font-weight:bold;font-family:Georgia,serif;letter-spacing:1px;">Navonmesh '27 Organizing Council</p>
              <p style="margin:4px 0 0;font-size:12px;color:#9c8a70;font-family:Georgia,serif;">Shri Sant Gajanan Maharaj College of Engineering (SSGMCE), Shegaon</p>
            </div>
          </td>
        </tr>
        <!-- Footer Bottom Gold Trim -->
        <tr>
          <td style="height:3px;background:linear-gradient(90deg,#2d1200,#c9a84c,#f5d77f,#c9a84c,#2d1200);"></td>
        </tr>
        <!-- Burgundy Footer -->
        <tr>
          <td style="background:linear-gradient(135deg,#4d0b1a 0%,#701529 50%,#4d0b1a 100%);padding:22px 30px;text-align:center;">
            <p style="margin:0 0 6px;font-size:11px;letter-spacing:5px;color:#f0d060;font-family:Georgia,serif;">&#10022; &nbsp; ───────── &nbsp; &#10022; &nbsp; ───────── &nbsp; &#10022;</p>
            <p style="margin:0;font-size:10px;letter-spacing:4px;color:rgba(240,208,96,0.75);font-family:Georgia,serif;text-transform:uppercase;">NAVONMESH '27 &nbsp;&#8212;&nbsp; SSGMCE SHEGAON</p>
            <p style="margin:6px 0 0;font-size:9px;letter-spacing:2px;color:rgba(255,253,245,0.45);font-family:Georgia,serif;">INNOVATION &bull; LEADERSHIP &bull; STUDENT BRILLIANCE</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

                if (!recipient.email || recipient.email === 'N/A' || !recipient.email.includes('@')) {
                    console.log(`Skipping invalid or placeholder email: ${recipient.email} for ${recipient.name}`);
                    failCount++;
                    continue;
                }

                const mailSuccess = await sendEmail({
                    to: recipient.email,
                    subject: personalizedSubject || subject,
                    htmlContent
                });

                if (mailSuccess) successCount++;
                else failCount++;

                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (err) {
                console.error(`Failed to send email to ${recipient.email}:`, err);
                failCount++;
            }
        }

        res.json({
            success: true,
            message: `Broadcasting complete. Recipient Count: ${recipients.length}, Success: ${successCount}, Failed: ${failCount}`,
            totals: { success: successCount, failed: failCount, total: recipients.length }
        });

    } catch (err) {
        console.error('Bulk Email error:', err);
        res.status(500).json({ error: err.message || 'Server error during broadcast' });
    }
});

// Update registration details for event day
router.put('/update-registration/:id', async (req, res) => {
    // Auth Check
    const authHeader = req.headers.authorization;
    if (authHeader !== 'Bearer admin_secret_token_navonmesh') {
        return res.status(401).json({ error: 'Unauthorized Access' });
    }

    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedReg = await Registration.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedReg) {
            return res.status(404).json({ error: 'Registration not found' });
        }

        res.json({ success: true, entry: updatedReg });
    } catch (err) {
        console.error('Update registration error:', err);
        res.status(500).json({ error: 'Server error updating registration' });
    }
});

// --- Committee Management Routes ---
router.get('/committee', async (req, res) => {
    try {
        const members = await CommitteeMember.find().sort({ createdAt: -1 });
        res.json(members);
    } catch (err) {
        res.status(500).json({ error: 'Sync error' });
    }
});

router.post('/committee/add', async (req, res) => {
    const authHeader = req.headers.authorization;
    const adminId = req.headers['x-admin-id']; // Special header to check who is performing the action

    if (authHeader !== 'Bearer admin_secret_token_navonmesh' || adminId !== 'nihal1512') {
        return res.status(401).json({ error: 'Unauthorized Access. Only Nihal can add members.' });
    }

    try {
        const { name, phone, department } = req.body;
        const newMember = new CommitteeMember({ name, phone, department, addedBy: adminId });
        await newMember.save();
        res.json(newMember);
    } catch (err) {
        res.status(500).json({ error: 'Add member error' });
    }
});

router.delete('/committee/:id', async (req, res) => {
    const authHeader = req.headers.authorization;
    const adminId = req.headers['x-admin-id'];

    if (authHeader !== 'Bearer admin_secret_token_navonmesh' || adminId !== 'nihal1512') {
        return res.status(401).json({ error: 'Unauthorized Access. Only Nihal can remove members.' });
    }

    try {
        await CommitteeMember.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Delete error' });
    }
});

// --- New Shared Timer Routes ---
router.get('/timer', async (req, res) => {
    try {
        let timer = await Timer.findOne({ eventId: 'global_break_timer' });
        if (!timer) {
            timer = new Timer({ eventId: 'global_break_timer' });
            await timer.save();
        }
        res.json(timer);
    } catch (err) {
        res.status(500).json({ error: 'Timer sync error' });
    }
});

router.post('/timer/update', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader !== 'Bearer admin_secret_token_navonmesh') {
        return res.status(401).json({ error: 'Unauthorized Access' });
    }

    try {
        const { isActive, endTime, pausedAt } = req.body;
        let timer = await Timer.findOne({ eventId: 'global_break_timer' });

        if (!timer) {
            timer = new Timer({ eventId: 'global_break_timer' });
        }

        timer.isActive = isActive;
        if (endTime !== undefined) timer.endTime = endTime;
        if (pausedAt !== undefined) timer.pausedAt = pausedAt;

        await timer.save();
        res.json(timer);
    } catch (err) {
        res.status(500).json({ error: 'Timer update error' });
    }
});

module.exports = router;

