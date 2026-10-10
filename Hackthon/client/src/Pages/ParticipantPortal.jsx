import React, { useState, useEffect } from 'react';
import { 
    FaHome, FaUsers, FaCalendarAlt, FaAward, FaQuestionCircle, 
    FaCheckCircle, FaExclamationTriangle, FaDownload, FaEdit, FaSave, FaPlus, FaTrash, 
    FaPhone, FaMapMarkerAlt, FaBullhorn, FaClock, FaPaperPlane, FaShieldAlt,
    FaLock, FaUnlock, FaQrcode, FaUtensils, FaArrowRight, FaSync
} from 'react-icons/fa';
import '../Styles/participant_portal.css';
import { getApiUrl } from '../utils/apiConfig';
import QRCode from 'qrcode';

// Official Problem Statements List (Restricted to 3 Tracks as requested)
const OFFICIAL_PROBLEM_STATEMENTS = [
    { id: 'PS01', title: 'Student Innovation', category: 'Innovation Track', desc: 'Open category for student projects, research ideas, and creative technical prototypes.' },
    { id: 'PS02', title: 'Problem Statement 1', category: 'Domain Track 1', desc: 'Hardware, software, and engineering innovation statement 1.' },
    { id: 'PS03', title: 'Problem Statement 2', category: 'Domain Track 2', desc: 'Advanced technical challenge problem statement 2.' }
];

const ParticipantPortal = ({ teamData, onLogout }) => {
    // 5 Dedicated App Tabs: 'home' | 'squad' | 'timeline' | 'results_certs' | 'sos'
    const [tab, setTab] = useState('home');

    // Live Team State
    const [team, setTeam] = useState(teamData || null);
    const [loadingTeam, setLoadingTeam] = useState(false);

    // Edit Squad State
    const [teamName, setTeamName] = useState(teamData?.teamName || '');
    const [college, setCollege] = useState(teamData?.college || '');
    const [leaderName, setLeaderName] = useState(teamData?.leaderName || '');
    const [leaderPhone, setLeaderPhone] = useState(teamData?.leaderPhone || '');
    const [problemStatement, setProblemStatement] = useState(teamData?.problemStatement || '');
    const [members, setMembers] = useState(teamData?.members || []);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState({ success: '', error: '' });

    // Individual Member Passes State (Leader + all members)
    const [passesData, setPassesData] = useState(null);
    const [passesLoading, setPassesLoading] = useState(false);
    const [passesError, setPassesError] = useState('');

    // Timeline Selector (Default matches registered event)
    const [selectedTimelineEvent, setSelectedTimelineEvent] = useState(() => {
        const ev = (teamData?.event || '').toLowerCase();
        if (ev.includes('hackathon') || ev.includes('srijan')) return 'hackathon';
        if (ev.includes('expo') || ev.includes('ankur')) return 'expo';
        if (ev.includes('pursuit') || ev.includes('udbhav') || ev.includes('conference')) return 'pursuit';
        return 'hackathon';
    });

    // SOS / Help Ticket State
    const [helpIssue, setHelpIssue] = useState('');
    const [helpCategory, setHelpCategory] = useState('Technical Support');
    const [helpStatus, setHelpStatus] = useState('');
    const [helpLoading, setHelpLoading] = useState(false);

    // Countdown State (To March 2026 Event Day)
    const [timeLeft, setTimeLeft] = useState({ days: 12, hours: 8, minutes: 24, seconds: 15 });

    const API_URL = getApiUrl();

    // Sync team data on mount & refresh
    const fetchLatestProfile = async () => {
        const id = team?.teamId || team?.id || team?._id;
        if (!id) return;
        setLoadingTeam(true);
        try {
            const res = await fetch(`${API_URL}/api/team/profile/${id}`);
            const data = await res.json();
            if (res.ok && data.success && data.team) {
                setTeam(data.team);
                sessionStorage.setItem('teamData', JSON.stringify(data.team));
                setTeamName(data.team.teamName || '');
                setCollege(data.team.college || '');
                setLeaderName(data.team.leaderName || '');
                setLeaderPhone(data.team.leaderPhone || '');
                setProblemStatement(data.team.problemStatement || '');
                setMembers(data.team.members || []);
            }
        } catch (err) {
            console.error('Failed to sync team:', err);
        } finally {
            setLoadingTeam(false);
        }
    };

    // Load individual member meal passes from shared API
    const fetchIndividualPasses = async () => {
        const queryId = team?.teamId || team?.id || team?._id || team?.leaderPhone;
        if (!queryId) return;
        setPassesLoading(true);
        setPassesError('');
        try {
            const res = await fetch(`${API_URL}/api/food/participant-pass`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identifier: String(queryId).trim(),
                    teamId: team?.teamId
                })
            });
            const data = await res.json();
            if (res.ok && data.success && Array.isArray(data.participants)) {
                setPassesData(data);
            } else {
                // Client-side fallback if server meal scan route is offline: generate passes for leader + members
                generateLocalFallbackPasses();
            }
        } catch (err) {
            generateLocalFallbackPasses();
        } finally {
            setPassesLoading(false);
        }
    };

    // Client fallback to ensure member passes ALWAYS render
    const generateLocalFallbackPasses = async () => {
        if (!team) return;
        try {
            const participants = [];
            // 1. Leader
            const leaderQr = await QRCode.toDataURL(team.teamId ? `${team.teamId}-LEADER` : 'SQUAD-LEADER', {
                width: 320,
                margin: 2
            });
            participants.push({
                participantId: `${team.teamId || 'SQUAD'}-L`,
                name: team.leaderName || 'Leader',
                role: 'Team Leader',
                email: team.leaderEmail,
                phone: team.leaderPhone,
                college: team.college || 'SSGMCE',
                qrCodeUrl: leaderQr,
                todayMeals: { breakfast: false, lunch: false, dinner: false }
            });

            // 2. Members
            if (Array.isArray(team.members)) {
                for (let i = 0; i < team.members.length; i++) {
                    const m = team.members[i];
                    const memQr = await QRCode.toDataURL(`${team.teamId || 'SQUAD'}-M${i + 1}`, {
                        width: 320,
                        margin: 2
                    });
                    participants.push({
                        participantId: `${team.teamId || 'SQUAD'}-M${i + 1}`,
                        name: m.name || `Member ${i + 1}`,
                        role: 'Squad Member',
                        email: m.email || '',
                        phone: m.phone || '',
                        college: m.college || team.college || 'SSGMCE',
                        qrCodeUrl: memQr,
                        todayMeals: { breakfast: false, lunch: false, dinner: false }
                    });
                }
            }
            setPassesData({ team, participants });
        } catch (e) {
            console.error('Local pass generation failed:', e);
        }
    };

    useEffect(() => {
        fetchLatestProfile();
    }, []);

    useEffect(() => {
        if (team) {
            fetchIndividualPasses();
        }
    }, [team?.teamId, team?.teamName, members.length]);

    // Live Event Countdown
    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
                if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
                if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
                return prev;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // ----------------------------------------------------
    // SQUAD EDIT & DATABASE SYNC
    // ----------------------------------------------------
    const handleSaveTeam = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSaveStatus({ success: '', error: '' });

        try {
            const res = await fetch(`${API_URL}/api/team/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    teamId: team?.teamId || team?.id || team?._id,
                    teamName: teamName.trim(),
                    college: college.trim(),
                    leaderName: leaderName.trim(),
                    leaderPhone: leaderPhone.trim(),
                    // Leader Email is permanently locked and intentionally omitted/unchangeable
                    members: members,
                    problemStatement: problemStatement
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setTeam(data.team);
                sessionStorage.setItem('teamData', JSON.stringify(data.team));
                setSaveStatus({ success: 'Squad details updated and synced to database!', error: '' });
                fetchIndividualPasses();
                setTimeout(() => setSaveStatus({ success: '', error: '' }), 5000);
            } else {
                setSaveStatus({ success: '', error: data.error || 'Failed to update squad details.' });
            }
        } catch (err) {
            setSaveStatus({ success: '', error: 'Network error. Please check your connection.' });
        } finally {
            setSaving(false);
        }
    };

    const handleAddMember = () => {
        if (members.length >= 4) {
            alert('A maximum of 5 squad members total (1 Leader + 4 Members) is permitted.');
            return;
        }
        setMembers([...members, { name: '', email: '', phone: '', college: team?.college || '' }]);
    };

    const handleRemoveMember = (idx) => {
        if (window.confirm('Are you sure you want to remove this squad member?')) {
            setMembers(members.filter((_, i) => i !== idx));
        }
    };

    const handleMemberChange = (idx, field, value) => {
        const updated = [...members];
        updated[idx][field] = value;
        setMembers(updated);
    };

    // Download Single Member Pass Image
    const handleDownloadIndividualPass = (participant) => {
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 780;
        const ctx = canvas.getContext('2d');

        // Dark background
        ctx.fillStyle = '#060a14';
        ctx.fillRect(0, 0, 600, 780);

        // Header band
        const grad = ctx.createLinearGradient(0, 0, 600, 120);
        grad.addColorStop(0, '#00f0ff');
        grad.addColorStop(1, '#9d4edd');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 600, 120);

        // Title
        ctx.fillStyle = '#03060d';
        ctx.font = 'bold 24px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('YUGANANTAR • NAVONMESH 2026', 300, 52);
        ctx.font = '14px Inter, sans-serif';
        ctx.fillText('OFFICIAL DIGITAL MEAL & ENTRY PASS', 300, 84);

        // Participant & Squad details
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Orbitron, sans-serif';
        ctx.fillText(participant.name, 300, 175);

        ctx.fillStyle = '#00f0ff';
        ctx.font = 'bold 15px monospace';
        ctx.fillText(`${participant.role} • ${participant.participantId}`, 300, 208);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px Inter, sans-serif';
        ctx.fillText(`Squad: ${team?.teamName || 'Squad'} (${team?.teamId || ''})`, 300, 236);
        ctx.fillText(participant.college || team?.college || 'SSGMCE Shegaon', 300, 260);

        // QR Code
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.roundRect(165, 290, 270, 270, 16);
            ctx.fill();

            ctx.drawImage(img, 180, 305, 240, 240);

            // Instructions
            ctx.fillStyle = '#10b981';
            ctx.font = 'bold 13px Orbitron, sans-serif';
            ctx.fillText('✓ VALID INDIVIDUAL PASS • BREAKFAST, LUNCH & DINNER', 300, 600);

            ctx.fillStyle = '#64748b';
            ctx.font = '12px Inter, sans-serif';
            ctx.fillText(`Registered Event: ${team?.event || 'National Tech Fest'}`, 300, 640);
            ctx.fillText(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 300, 670);

            const link = document.createElement('a');
            link.download = `Pass_${participant.name.replace(/\s+/g, '_')}_${participant.participantId}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        };
        img.src = participant.qrCodeUrl;
    };

    // Download All Passes
    const handleDownloadAllPasses = () => {
        if (!passesData?.participants) return;
        passesData.participants.forEach((p, idx) => {
            setTimeout(() => {
                handleDownloadIndividualPass(p);
            }, idx * 400);
        });
    };

    // Raise Emergency / Help Desk Alert
    const handleRaiseHelp = async (e) => {
        e.preventDefault();
        if (!helpIssue.trim()) return;

        setHelpLoading(true);
        setHelpStatus('');

        try {
            const res = await fetch(`${API_URL}/api/issues/raise`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    groupNumber: team?.groupNo || 1,
                    issueDescription: `[${team?.teamId || 'SQUAD'}] ${team?.teamName} (${helpCategory}): ${helpIssue.trim()}`
                })
            });

            if (res.ok) {
                setHelpStatus('Ticket dispatched! Coordinators and Control Room alerted.');
                setHelpIssue('');
            } else {
                setHelpStatus('Signal failed. Please use offline emergency phone numbers below.');
            }
        } catch (err) {
            setHelpStatus('Connection error. Please call the emergency numbers below directly.');
        } finally {
            setHelpLoading(false);
        }
    };

    const isPsLocked = (team?.psChangeCount || 0) >= 1;

    return (
        <div className="participant-portal-container">
            {/* ---------------------------------------------------- */}
            {/* APP TOP NAVIGATION TABS (5 DEDICATED SECTIONS)        */}
            {/* ---------------------------------------------------- */}
            <div className="mitra-tabs-nav">
                <button
                    onClick={() => setTab('home')}
                    className={`mitra-tab-pill ${tab === 'home' ? 'active' : ''}`}
                >
                    <FaHome /> Home
                </button>
                <button
                    onClick={() => setTab('squad')}
                    className={`mitra-tab-pill ${tab === 'squad' ? 'active' : ''}`}
                >
                    <FaUsers /> Squad
                </button>
                <button
                    onClick={() => setTab('timeline')}
                    className={`mitra-tab-pill ${tab === 'timeline' ? 'active' : ''}`}
                >
                    <FaCalendarAlt /> Timeline
                </button>
                <button
                    onClick={() => setTab('results_certs')}
                    className={`mitra-tab-pill ${tab === 'results_certs' ? 'active' : ''}`}
                >
                    <FaAward /> Results & Certs
                </button>
                <button
                    onClick={() => setTab('sos')}
                    className={`mitra-tab-pill ${tab === 'sos' ? 'active' : ''}`}
                    style={tab === 'sos' ? { background: '#ef4444', borderColor: '#ef4444', color: '#fff' } : {}}
                >
                    <FaPhone /> SOS / Contact
                </button>
            </div>

            {/* ==================================================== */}
            {/* TAB 1: 🏠 HOME (WELCOME, REGISTERED INFO, MEAL PASSES) */}
            {/* ==================================================== */}
            {tab === 'home' && (
                <div className="tab-pane-home">
                    {/* A. WELCOME SQUAD BANNER */}
                    <div className="mitra-hero-card">
                        <div className="mitra-hero-top">
                            <div>
                                <span className="squad-salutation">WELCOME SQUAD</span>
                                <h2 className="mitra-welcome-title">
                                    {team?.teamName || 'Squad Participant'}
                                </h2>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                                    <span className="mitra-team-badge">
                                        SQUAD ID: {team?.teamId || 'PENDING'}
                                    </span>
                                    <span className="mitra-status-chip confirmed">
                                        <FaCheckCircle /> Registered & Verified
                                    </span>
                                </div>
                            </div>
                            <button 
                                onClick={fetchLatestProfile} 
                                className="refresh-mini-btn" 
                                title="Refresh Squad Data"
                            >
                                <FaSync className={loadingTeam ? 'spin-icon' : ''} />
                            </button>
                        </div>
                    </div>

                    {/* B. FOR WHAT THE SQUAD REGISTERED */}
                    <div className="registered-event-card">
                        <div className="card-top-header">
                            <span className="section-micro-tag">OFFICIAL REGISTRATION</span>
                            <span className="event-tag-badge">{team?.event || 'National Hackathon 2026'}</span>
                        </div>

                        <h3 className="event-title-display">
                            {team?.event || 'SRIJAN 24H HACKATHON 2026'}
                        </h3>
                        <p className="event-college-sub">
                            {team?.college || 'SSGMCE Shegaon'} • {team?.studentCategory || 'Engineering Degree'}
                        </p>

                        <div className="reg-info-grid">
                            <div className="info-box">
                                <span className="info-label">Assigned Problem Statement</span>
                                <span className="info-val ps-highlight">
                                    {team?.problemStatement || 'PS-02: AI, ML & Cyber Security'}
                                </span>
                            </div>
                            <div className="info-box">
                                <span className="info-label">Table & Workstation</span>
                                <span className="info-val">
                                    {team?.tableNo ? `Table #${team.tableNo} (Lab 3)` : 'Allocated at Reporting Desk'}
                                </span>
                            </div>
                            <div className="info-box">
                                <span className="info-label">Team Leader</span>
                                <span className="info-val">
                                    {team?.leaderName} ({team?.leaderPhone})
                                </span>
                            </div>
                            <div className="info-box">
                                <span className="info-label">Squad Strength</span>
                                <span className="info-val">
                                    {1 + (team?.members?.length || 0)} Total Members
                                </span>
                            </div>
                        </div>

                        <div className="shortcut-actions-row">
                            <button className="shortcut-btn" onClick={() => setTab('squad')}>
                                <FaEdit /> Edit Squad Details
                            </button>
                            <button className="shortcut-btn" onClick={() => setTab('timeline')}>
                                <FaClock /> View Schedule
                            </button>
                            <button className="shortcut-btn" onClick={() => setTab('sos')}>
                                <FaPhone /> Need Help?
                            </button>
                        </div>
                    </div>

                    {/* C. COUNTDOWN TO EVENT */}
                    <div className="countdown-mini-strip">
                        <div className="cd-header">
                            <FaClock /> TIME REMAINING TO CONCLAVE COMMENCEMENT
                        </div>
                        <div className="cd-grid">
                            <div className="cd-box">
                                <span className="cd-num">{timeLeft.days}</span>
                                <span className="cd-lbl">DAYS</span>
                            </div>
                            <div className="cd-box">
                                <span className="cd-num">{timeLeft.hours}</span>
                                <span className="cd-lbl">HRS</span>
                            </div>
                            <div className="cd-box">
                                <span className="cd-num">{timeLeft.minutes}</span>
                                <span className="cd-lbl">MIN</span>
                            </div>
                            <div className="cd-box">
                                <span className="cd-num">{timeLeft.seconds}</span>
                                <span className="cd-lbl">SEC</span>
                            </div>
                        </div>
                    </div>

                    {/* D. MESS & MEAL PASSES FOR ALL MEMBERS */}
                    <div className="member-meal-passes-section">
                        <div className="passes-header-row">
                            <div>
                                <span className="section-micro-tag">INDIVIDUAL MESS PASSES</span>
                                <h3 className="section-sub-title">
                                    <FaUtensils /> Digital Mess & Entry Passes
                                </h3>
                                <p className="section-mini-desc">
                                    Each squad member has an individual QR pass for breakfast, lunch, and dinner counters.
                                </p>
                            </div>
                            {passesData?.participants?.length > 1 && (
                                <button className="download-all-btn" onClick={handleDownloadAllPasses}>
                                    <FaDownload /> Save All Passes
                                </button>
                            )}
                        </div>

                        {passesLoading ? (
                            <div className="passes-loading-box">
                                <div className="pulse-spinner" />
                                <p>Generating high-contrast individual member QR passes...</p>
                            </div>
                        ) : (
                            <div className="individual-passes-list">
                                {passesData?.participants?.map((p, idx) => (
                                    <div key={idx} className="individual-pass-card">
                                        <div className="pass-card-left">
                                            <div className="pass-member-badge">
                                                <span className={`role-pill ${p.role.includes('Leader') ? 'leader' : 'member'}`}>
                                                    {p.role}
                                                </span>
                                                <span className="pid-pill">{p.participantId}</span>
                                            </div>

                                            <h4 className="pass-member-name">{p.name}</h4>
                                            <p className="pass-member-contact">
                                                {p.phone || team?.leaderPhone} • {p.college || team?.college}
                                            </p>

                                            {/* Meal Tokens Status */}
                                            <div className="meal-tokens-bar">
                                                <div className={`meal-token-pill ${p.todayMeals?.breakfast ? 'scanned' : 'ready'}`}>
                                                    <span>🌅 Breakfast</span>
                                                    <strong>{p.todayMeals?.breakfast ? '✓ Scanned' : 'Available'}</strong>
                                                </div>
                                                <div className={`meal-token-pill ${p.todayMeals?.lunch ? 'scanned' : 'ready'}`}>
                                                    <span>☀️ Lunch</span>
                                                    <strong>{p.todayMeals?.lunch ? '✓ Scanned' : 'Available'}</strong>
                                                </div>
                                                <div className={`meal-token-pill ${p.todayMeals?.dinner ? 'scanned' : 'ready'}`}>
                                                    <span>🌙 Dinner</span>
                                                    <strong>{p.todayMeals?.dinner ? '✓ Scanned' : 'Available'}</strong>
                                                </div>
                                            </div>

                                            <button 
                                                className="download-pass-single-btn" 
                                                onClick={() => handleDownloadIndividualPass(p)}
                                            >
                                                <FaDownload /> Download PNG Pass
                                            </button>
                                        </div>

                                        <div className="pass-card-right">
                                            <div className="qr-box-mount">
                                                {p.qrCodeUrl ? (
                                                    <img src={p.qrCodeUrl} alt={`${p.name} QR Pass`} className="qr-image" />
                                                ) : (
                                                    <div className="qr-placeholder">QR Generating...</div>
                                                )}
                                            </div>
                                            <span className="qr-scan-hint">Scan at Mess Counter</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ==================================================== */}
            {/* TAB 2: 👥 SQUAD (EDIT DETAILS, LOCKED EMAIL, PS EDIT)  */}
            {/* ==================================================== */}
            {tab === 'squad' && (
                <div className="tab-pane-squad">
                    <div className="squad-editor-header">
                        <span className="section-micro-tag">TEAM MANAGEMENT</span>
                        <h2 className="editor-title"><FaUsers /> Squad Details & Member Editor</h2>
                        <p className="editor-sub">
                            Changes saved here update the database in real-time and automatically sync between the mobile app and official website.
                        </p>
                    </div>

                    {saveStatus.success && (
                        <div className="alert-box success">
                            <FaCheckCircle /> {saveStatus.success}
                        </div>
                    )}
                    {saveStatus.error && (
                        <div className="alert-box error">
                            <FaExclamationTriangle /> {saveStatus.error}
                        </div>
                    )}

                    <form onSubmit={handleSaveTeam} className="squad-edit-form">
                        {/* 1. SQUAD GENERAL INFO */}
                        <div className="form-section-card">
                            <h4 className="card-section-heading">1. Squad Identity</h4>

                            <div className="mitra-form-group">
                                <label className="mitra-form-label">Squad / Team Name</label>
                                <input
                                    type="text"
                                    className="mitra-form-input"
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mitra-form-group">
                                <label className="mitra-form-label">College / Institute</label>
                                <input
                                    type="text"
                                    className="mitra-form-input"
                                    value={college}
                                    onChange={(e) => setCollege(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mitra-form-group">
                                <label className="mitra-form-label">Squad ID (Permanent System Assigned)</label>
                                <input
                                    type="text"
                                    className="mitra-form-input locked"
                                    value={team?.teamId || 'SQUAD'}
                                    disabled
                                    readOnly
                                />
                            </div>
                        </div>

                        {/* 2. TEAM LEADER DETAILS (LEADER EMAIL PERMANENTLY LOCKED) */}
                        <div className="form-section-card">
                            <h4 className="card-section-heading">2. Team Leader</h4>

                            <div className="mitra-form-group">
                                <label className="mitra-form-label">Leader Full Name</label>
                                <input
                                    type="text"
                                    className="mitra-form-input"
                                    value={leaderName}
                                    onChange={(e) => setLeaderName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mitra-form-group">
                                <label className="mitra-form-label">Leader Phone Number</label>
                                <input
                                    type="tel"
                                    className="mitra-form-input"
                                    value={leaderPhone}
                                    onChange={(e) => setLeaderPhone(e.target.value)}
                                    required
                                />
                            </div>

                            {/* LEADER EMAIL IS PERMANENTLY LOCKED */}
                            <div className="mitra-form-group">
                                <div className="label-with-lock">
                                    <label className="mitra-form-label">Leader Email Address</label>
                                    <span className="locked-pill"><FaLock /> Locked Credential</span>
                                </div>
                                <input
                                    type="email"
                                    className="mitra-form-input locked"
                                    value={team?.leaderEmail || ''}
                                    disabled
                                    readOnly
                                    title="Leader Email cannot be altered after registration"
                                />
                                <span className="field-security-note">
                                    🔒 Leader Email is permanent and cannot be modified for security, authentication, and prize entitlement integrity.
                                </span>
                            </div>
                        </div>

                        {/* 3. PROBLEM STATEMENT CHANGE (CAN BE CHANGED ONLY ONCE) */}
                        <div className="form-section-card">
                            <div className="ps-header-flex">
                                <h4 className="card-section-heading">3. Problem Statement</h4>
                                {isPsLocked ? (
                                    <span className="ps-quota-badge locked">
                                        <FaLock /> Locked (1/1 Changes Used)
                                    </span>
                                ) : (
                                    <span className="ps-quota-badge editable">
                                        <FaUnlock /> Editable (1 Change Remaining)
                                    </span>
                                )}
                            </div>

                            {isPsLocked ? (
                                <div className="ps-locked-notice">
                                    <FaLock className="lock-icon-lg" />
                                    <div>
                                        <strong>Problem Statement is Permanently Locked</strong>
                                        <p>
                                            Your squad has already used its one-time modification quota for the Problem Statement. Under conclave guidelines, further modifications are prohibited.
                                        </p>
                                        <div className="current-locked-ps">
                                            Current: <strong>{problemStatement || team?.problemStatement}</strong>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p className="ps-edit-guideline">
                                        ⚡ <strong>Notice:</strong> Problem statement can be modified <strong>ONLY ONCE</strong> before the deadline. Choose your domain carefully!
                                    </p>
                                    <div className="mitra-form-group">
                                        <label className="mitra-form-label">Select Problem Statement Track</label>
                                        <select
                                            className="mitra-form-input ps-dropdown"
                                            value={problemStatement}
                                            onChange={(e) => setProblemStatement(e.target.value)}
                                        >
                                            <option value="">-- Choose Problem Statement --</option>
                                            {OFFICIAL_PROBLEM_STATEMENTS.map((ps) => (
                                                <option key={ps.id} value={ps.title}>
                                                    {ps.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* 4. SQUAD MEMBERS (EDITABLE) */}
                        <div className="form-section-card">
                            <div className="members-header-flex">
                                <h4 className="card-section-heading">4. Squad Members ({members.length})</h4>
                                <span className="quota-hint">Max 4 additional members</span>
                            </div>

                            {members.map((m, idx) => (
                                <div key={idx} className="mitra-member-row">
                                    <div className="mitra-member-row-header">
                                        <span className="member-index-tag">Member #{idx + 2}</span>
                                        <button
                                            type="button"
                                            className="mitra-delete-btn"
                                            onClick={() => handleRemoveMember(idx)}
                                            title="Remove Member"
                                        >
                                            <FaTrash /> Remove
                                        </button>
                                    </div>

                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        className="mitra-form-input"
                                        value={m.name || ''}
                                        onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                                        required
                                    />

                                    <div className="grid-2-inputs">
                                        <input
                                            type="tel"
                                            placeholder="Phone Number"
                                            className="mitra-form-input"
                                            value={m.phone || ''}
                                            onChange={(e) => handleMemberChange(idx, 'phone', e.target.value)}
                                        />
                                        <input
                                            type="email"
                                            placeholder="Email Address"
                                            className="mitra-form-input"
                                            value={m.email || ''}
                                            onChange={(e) => handleMemberChange(idx, 'email', e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}

                            <button 
                                type="button" 
                                className="mitra-add-member-btn" 
                                onClick={handleAddMember}
                                disabled={members.length >= 4}
                            >
                                <FaPlus /> Add Squad Member
                            </button>
                        </div>

                        {/* SUBMIT BUTTON */}
                        <button type="submit" className="save-squad-action-btn" disabled={saving}>
                            <FaSave /> {saving ? 'SYNCING TO DATABASE...' : 'SAVE SQUAD DETAILS & SYNC'}
                        </button>
                    </form>
                </div>
            )}

            {/* ==================================================== */}
            {/* TAB 3: 📅 TIMELINE (RESPECTIVE EVENT TIMELINES)       */}
            {/* ==================================================== */}
            {tab === 'timeline' && (
                <div className="tab-pane-timeline">
                    <div className="timeline-header">
                        <span className="section-micro-tag">OFFICIAL SCHEDULE</span>
                        <h2 className="timeline-heading"><FaCalendarAlt /> Conclave Event Timeline</h2>
                        <p className="timeline-sub">
                            Day-by-day milestone agenda for your registered event and overall conclave activities.
                        </p>
                    </div>

                    {/* Timeline Event Switcher */}
                    <div className="timeline-event-selector">
                        <button 
                            className={`tl-filter-btn ${selectedTimelineEvent === 'hackathon' ? 'active' : ''}`}
                            onClick={() => setSelectedTimelineEvent('hackathon')}
                        >
                            💻 24H Hackathon
                        </button>
                        <button 
                            className={`tl-filter-btn ${selectedTimelineEvent === 'expo' ? 'active' : ''}`}
                            onClick={() => setSelectedTimelineEvent('expo')}
                        >
                            ⚙️ Project Expo
                        </button>
                        <button 
                            className={`tl-filter-btn ${selectedTimelineEvent === 'pursuit' ? 'active' : ''}`}
                            onClick={() => setSelectedTimelineEvent('pursuit')}
                        >
                            🚀 Pursuit Symposium
                        </button>
                    </div>

                    {/* HACKATHON TIMELINE */}
                    {selectedTimelineEvent === 'hackathon' && (
                        <div className="timeline-stream">
                            <div className="timeline-day-separator">DAY 1 — REPORTING & SPRINT COMMENCEMENT</div>

                            <div className="mitra-timeline-item">
                                <div className="mitra-time-chip"><strong>08:30 AM</strong><span>Day 1</span></div>
                                <div className="mitra-timeline-details">
                                    <h4>Reporting, Badges & Kit Distribution</h4>
                                    <p>Collect hardware kit, squad lanyards, WiFi access keys, and meal tokens.</p>
                                    <span className="mitra-venue-tag"><FaMapMarkerAlt /> Registration Desks, Main Foyer</span>
                                </div>
                            </div>

                            <div className="mitra-timeline-item">
                                <div className="mitra-time-chip"><strong>10:00 AM</strong><span>Day 1</span></div>
                                <div className="mitra-timeline-details">
                                    <h4>Grand Inaugural Ceremony</h4>
                                    <p>Keynote address by chief guests, jury briefing, and rules walkthrough.</p>
                                    <span className="mitra-venue-tag"><FaMapMarkerAlt /> SSGMCE Central Auditorium</span>
                                </div>
                            </div>

                            <div className="mitra-timeline-item active-pulse">
                                <div className="mitra-time-chip highlight"><strong>11:30 AM</strong><span>Day 1</span></div>
                                <div className="mitra-timeline-details">
                                    <h4>24-Hour Hackathon Coding Commences</h4>
                                    <p>Squads deploy to assigned lab workstations. Git repos initialize.</p>
                                    <span className="mitra-venue-tag"><FaMapMarkerAlt /> CSE & IT Dept Labs</span>
                                </div>
                            </div>

                            <div className="mitra-timeline-item">
                                <div className="mitra-time-chip"><strong>01:00 PM</strong><span>Day 1</span></div>
                                <div className="mitra-timeline-details">
                                    <h4>Lunch Break (Central Mess)</h4>
                                    <p>Scan individual meal passes at the counter for fresh catering.</p>
                                    <span className="mitra-venue-tag"><FaMapMarkerAlt /> Central Mess Canteen</span>
                                </div>
                            </div>

                            <div className="mitra-timeline-item">
                                <div className="mitra-time-chip"><strong>03:30 PM</strong><span>Day 1</span></div>
                                <div className="mitra-timeline-details">
                                    <h4>Mentoring Round 1: Architecture Review</h4>
                                    <p>Industrial mentors evaluate system design, tech stack feasibility, and API choices.</p>
                                    <span className="mitra-venue-tag"><FaMapMarkerAlt /> Workstations</span>
                                </div>
                            </div>

                            <div className="mitra-timeline-item">
                                <div className="mitra-time-chip"><strong>08:00 PM</strong><span>Day 1</span></div>
                                <div className="mitra-timeline-details">
                                    <h4>Dinner & Cultural Energy Break</h4>
                                    <p>Dinner served at campus mess. Open air cultural music showcase.</p>
                                    <span className="mitra-venue-tag"><FaMapMarkerAlt /> Mess & Open Air Stage</span>
                                </div>
                            </div>

                            <div className="mitra-timeline-item">
                                <div className="mitra-time-chip"><strong>11:30 PM</strong><span>Day 1</span></div>
                                <div className="mitra-timeline-details">
                                    <h4>Midnight Debugging & Red Bull Fuel</h4>
                                    <p>Energy drinks, tea, midnight snacks, and tech mentors on-call.</p>
                                    <span className="mitra-venue-tag"><FaMapMarkerAlt /> Hackathon Labs</span>
                                </div>
                            </div>

                            <div className="timeline-day-separator">DAY 2 — EVALUATION & GRAND FINALE</div>

                            <div className="mitra-timeline-item">
                                <div className="mitra-time-chip"><strong>07:30 AM</strong><span>Day 2</span></div>
                                <div className="mitra-timeline-details">
                                    <h4>Breakfast & Morning Refresh</h4>
                                    <p>Hot breakfast and coffee served at the mess.</p>
                                    <span className="mitra-venue-tag"><FaMapMarkerAlt /> Central Mess</span>
                                </div>
                            </div>

                            <div className="mitra-timeline-item">
                                <div className="mitra-time-chip"><strong>10:30 AM</strong><span>Day 2</span></div>
                                <div className="mitra-timeline-details">
                                    <h4>Checkpoint 2: Live Prototype Review</h4>
                                    <p>Jury inspection of working features, frontend UX, and database models.</p>
                                    <span className="mitra-venue-tag"><FaMapMarkerAlt /> Workstations</span>
                                </div>
                            </div>

                            <div className="mitra-timeline-item highlight">
                                <div className="mitra-time-chip highlight"><strong>01:30 PM</strong><span>Day 2</span></div>
                                <div className="mitra-timeline-details">
                                    <h4>Final Code Freeze & Pitch Submission</h4>
                                    <p>GitHub push lock. Submit final presentation deck and demo video.</p>
                                    <span className="mitra-venue-tag"><FaMapMarkerAlt /> Portal Submission</span>
                                </div>
                            </div>

                            <div className="mitra-timeline-item">
                                <div className="mitra-time-chip"><strong>03:30 PM</strong><span>Day 2</span></div>
                                <div className="mitra-timeline-details">
                                    <h4>Grand Jury Presentations & Top 10 Demos</h4>
                                    <p>Top squads pitch on stage in front of industrial leaders and investors.</p>
                                    <span className="mitra-venue-tag"><FaMapMarkerAlt /> Main Auditorium</span>
                                </div>
                            </div>

                            <div className="mitra-timeline-item">
                                <div className="mitra-time-chip"><strong>06:00 PM</strong><span>Day 2</span></div>
                                <div className="mitra-timeline-details">
                                    <h4>Valedictory & Prize Distribution</h4>
                                    <p>Winner announcements, ₹2,50,000+ prize awards, and certificate unlock.</p>
                                    <span className="mitra-venue-tag"><FaMapMarkerAlt /> Central Auditorium</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PROJECT EXPO TIMELINE */}
                    {selectedTimelineEvent === 'expo' && (
                        <div className="timeline-stream">
                            <div className="mitra-timeline-item">
                                <div className="mitra-time-chip"><strong>09:00 AM</strong><span>Day 1</span></div>
                                <div className="mitra-timeline-details">
                                    <h4>Hardware Booth Setup & Testing</h4>
                                    <p>Install hardware models, posters, power plugs, and display screens.</p>
                                    <span className="mitra-venue-tag"><FaMapMarkerAlt /> Mechanical & Electrical Hangar</span>
                                </div>
                            </div>
                            <div className="mitra-timeline-item">
                                <div className="mitra-time-chip"><strong>11:00 AM</strong><span>Day 1</span></div>
                                <div className="mitra-timeline-details">
                                    <h4>First Round of Technical Jury Review</h4>
                                    <p>Working model live demonstrations and technical Q&A with professors.</p>
                                    <span className="mitra-venue-tag"><FaMapMarkerAlt /> Expo Arena</span>
                                </div>
                            </div>
                            <div className="mitra-timeline-item">
                                <div className="mitra-time-chip"><strong>02:30 PM</strong><span>Day 1</span></div>
                                <div className="mitra-timeline-details">
                                    <h4>Public & Industrial Visitor Exhibition</h4>
                                    <p>Open floor demonstration for delegates, faculty, and industry visitors.</p>
                                    <span className="mitra-venue-tag"><FaMapMarkerAlt /> Expo Arena</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PURSUIT SYMPOSIUM TIMELINE */}
                    {selectedTimelineEvent === 'pursuit' && (
                        <div className="timeline-stream">
                            <div className="mitra-timeline-item">
                                <div className="mitra-time-chip"><strong>10:30 AM</strong><span>Day 1</span></div>
                                <div className="mitra-timeline-details">
                                    <h4>Paper Presentation Track Sessions</h4>
                                    <p>Presenting selected research papers across Computer, ENTC, and Mechanical tracks.</p>
                                    <span className="mitra-venue-tag"><FaMapMarkerAlt /> Seminar Halls 1–4</span>
                                </div>
                            </div>
                            <div className="mitra-timeline-item">
                                <div className="mitra-time-chip"><strong>02:00 PM</strong><span>Day 1</span></div>
                                <div className="mitra-timeline-details">
                                    <h4>Blind Coding & Speed Debugging Sprint</h4>
                                    <p>High-speed competitive programming battles.</p>
                                    <span className="mitra-venue-tag"><FaMapMarkerAlt /> Computer Center</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ==================================================== */}
            {/* TAB 4: 🏆 RESULTS & CERTIFICATES (RESULTS FIRST!)    */}
            {/* ==================================================== */}
            {tab === 'results_certs' && (
                <div className="tab-pane-results-certs">
                    {/* 1. RESULTS SECTION (FIRST AS SPECIFIED) */}
                    <div className="results-card-container">
                        <div className="results-header">
                            <span className="section-micro-tag">EVALUATION & LEADERBOARD</span>
                            <h3 className="results-heading"><FaAward /> Event Results</h3>
                        </div>

                        {/* SPECIFIED TEXT REQUIREMENT */}
                        <div className="results-notice-box">
                            <div className="notice-icon-circle">⏳</div>
                            <div className="notice-text-content">
                                <h4 className="notice-title">Results Announcement Schedule</h4>
                                <p className="notice-body">
                                    Results will be declared here once the event concludes and jury evaluation is finalized.
                                </p>
                            </div>
                        </div>

                        {/* LIVE SCORING STAGE TRACKER */}
                        <div className="evaluation-rounds-tracker">
                            <h4 className="rounds-title">Jury Evaluation Stages</h4>

                            <div className="round-step-item">
                                <div className="step-circle active">1</div>
                                <div className="step-content">
                                    <div className="step-header">
                                        <strong>Round 1: Idea, Architecture & Feasibility</strong>
                                        <span className="step-badge ongoing">In Progress</span>
                                    </div>
                                    <p>Evaluation of problem statement alignment, wireframes, and technology stack.</p>
                                </div>
                            </div>

                            <div className="round-step-item">
                                <div className="step-circle pending">2</div>
                                <div className="step-content">
                                    <div className="step-header">
                                        <strong>Round 2: Prototype Implementation & Code Quality</strong>
                                        <span className="step-badge pending">Upcoming</span>
                                    </div>
                                    <p>Inspection of live features, working hardware/APIs, and git commits.</p>
                                </div>
                            </div>

                            <div className="round-step-item">
                                <div className="step-circle pending">3</div>
                                <div className="step-content">
                                    <div className="step-header">
                                        <strong>Final Round: Grand Stage Pitch & Live Demo</strong>
                                        <span className="step-badge pending">Valedictory Session</span>
                                    </div>
                                    <p>Top teams present to the grand industrial panel in the main auditorium.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. DIGITAL CERTIFICATES SECTION (LOCKED UNTIL ADMIN UNLOCKS) */}
                    <div className="certificates-card-container">
                        <div className="cert-header">
                            <span className="section-micro-tag">OFFICIAL CREDENTIAL</span>
                            <h3 className="cert-heading"><FaShieldAlt /> Digital Participation & Merit Certificate</h3>
                        </div>

                        {team?.certificatesUnlocked ? (
                            /* UNLOCKED STATE */
                            <div className="cert-unlocked-box">
                                <div className="cert-badge-success">
                                    <FaCheckCircle /> CERTIFICATES UNLOCKED & VERIFIED
                                </div>
                                <h4 className="unlocked-title">Your Official Certificates Are Ready!</h4>
                                <p className="unlocked-sub">
                                    Digitally signed with unique QR verification by SSGMCE Patron, Convener & Jury President.
                                </p>

                                <div className="cert-members-download-list">
                                    {/* Leader Cert */}
                                    <div className="cert-download-row">
                                        <div>
                                            <strong>{team?.leaderName} (Leader)</strong>
                                            <span className="cert-meta">ID: CERT-YUG26-{team?.teamId}-01</span>
                                        </div>
                                        <button 
                                            className="cert-btn-download"
                                            onClick={() => alert(`Downloading Certificate for ${team?.leaderName}...`)}
                                        >
                                            <FaDownload /> Download PDF
                                        </button>
                                    </div>

                                    {/* Members Certs */}
                                    {team?.members?.map((m, idx) => (
                                        <div key={idx} className="cert-download-row">
                                            <div>
                                                <strong>{m.name || `Member ${idx + 2}`}</strong>
                                                <span className="cert-meta">ID: CERT-YUG26-{team?.teamId}-0{idx + 2}</span>
                                            </div>
                                            <button 
                                                className="cert-btn-download"
                                                onClick={() => alert(`Downloading Certificate for ${m.name}...`)}
                                            >
                                                <FaDownload /> Download PDF
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            /* LOCKED STATE */
                            <div className="cert-locked-box">
                                <div className="lock-icon-wrap">
                                    <FaLock className="huge-lock-icon" />
                                </div>
                                <span className="locked-badge-chip">🔒 SYSTEM LOCKED</span>

                                <h4 className="locked-state-title">
                                    Certificates Will Be Available After Admin Unlocks That System
                                </h4>
                                <p className="locked-state-desc">
                                    Certificates remain locked during the active conclave. Once the valedictory ceremony concludes and the admin finalizes the attendance and results, the certificate download portal will unlock automatically.
                                </p>

                                <div className="certificate-mock-preview">
                                    <div className="watermark-overlay">CERTIFICATE LOCKED PREVIEW</div>
                                    <div className="mock-title">SHRI SANT GAJANAN MAHARAJ COLLEGE OF ENGINEERING</div>
                                    <div className="mock-sub">YUGANANTAR • NATIONAL TECH CONCLAVE 2026</div>
                                    <div className="mock-body">
                                        This certifies that <strong>{team?.leaderName || 'Squad Member'}</strong> of <strong>{team?.teamName || 'Squad'}</strong> has successfully participated in <strong>{team?.event || 'National Hackathon 2026'}</strong>.
                                    </div>
                                    <div className="mock-footer">
                                        <span>Dr. S. B. Somani (Principal)</span>
                                        <span>Convener (Navonmesh 2026)</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ==================================================== */}
            {/* TAB 5: 🚨 SOS / CONTACT US                            */}
            {/* ==================================================== */}
            {tab === 'sos' && (
                <div className="tab-pane-sos">
                    <div className="sos-banner-alert">
                        <div className="sos-alert-top">
                            <span className="sos-icon-pulse">🚨</span>
                            <div>
                                <h3 className="sos-banner-title">EMERGENCY SOS & IMMEDIATE HELPDESK</h3>
                                <p className="sos-banner-desc">
                                    24/7 dedicated support for technical, electrical, accommodation, medical, or security requirements.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* IMMEDIATE HOTLINE CALL CARDS */}
                    <div className="hotlines-grid">
                        <div className="hotline-card">
                            <div className="hotline-info">
                                <span className="hotline-role">Central Control Room</span>
                                <strong className="hotline-number">+91 94031 22894</strong>
                            </div>
                            <a href="tel:+919403122894" className="dial-btn">Call Now</a>
                        </div>

                        <div className="hotline-card urgent">
                            <div className="hotline-info">
                                <span className="hotline-role">Ambulance & Dispensary</span>
                                <strong className="hotline-number">+91 94228 12345</strong>
                            </div>
                            <a href="tel:+919422812345" className="dial-btn medical">Emergency Call</a>
                        </div>

                        <div className="hotline-card">
                            <div className="hotline-info">
                                <span className="hotline-role">Mess & Canteen Manager</span>
                                <strong className="hotline-number">+91 98230 56789</strong>
                            </div>
                            <a href="tel:+919823056789" className="dial-btn">Call Now</a>
                        </div>

                        <div className="hotline-card">
                            <div className="hotline-info">
                                <span className="hotline-role">Technical & WiFi Helpdesk</span>
                                <strong className="hotline-number">+91 88056 71290</strong>
                            </div>
                            <a href="tel:+918805671290" className="dial-btn">Call Now</a>
                        </div>

                        <div className="hotline-card">
                            <div className="hotline-info">
                                <span className="hotline-role">Campus Security & Gate 1</span>
                                <strong className="hotline-number">+91 98901 23456</strong>
                            </div>
                            <a href="tel:+919890123456" className="dial-btn">Call Now</a>
                        </div>
                    </div>

                    {/* DISPATCH HELP TICKET FORM */}
                    <div className="help-ticket-card">
                        <h4 className="ticket-title"><FaPaperPlane /> Dispatch Digital Help Ticket</h4>
                        <p className="ticket-sub">
                            Send an immediate notification to floor coordinators. We will reach your assigned table within 5 minutes.
                        </p>

                        {helpStatus && (
                            <div className="alert-box success">
                                <FaCheckCircle /> {helpStatus}
                            </div>
                        )}

                        <form onSubmit={handleRaiseHelp}>
                            <div className="mitra-form-group">
                                <label className="mitra-form-label">Category of Assistance</label>
                                <select 
                                    className="mitra-form-input"
                                    value={helpCategory}
                                    onChange={(e) => setHelpCategory(e.target.value)}
                                >
                                    <option value="Technical Support">Technical & High-Speed WiFi</option>
                                    <option value="Hardware / Extension">Hardware, Multi-plugs & Power</option>
                                    <option value="Mess & Meals">Mess Scan & Meal Assistance</option>
                                    <option value="Accommodation & Bedding">Hostel Room & Accommodation</option>
                                    <option value="Medical First Aid">Medical & First Aid Need</option>
                                </select>
                            </div>

                            <div className="mitra-form-group">
                                <label className="mitra-form-label">Describe your requirement</label>
                                <textarea
                                    rows="3"
                                    placeholder="e.g. Table #12 needs additional LAN cable and 16A power socket"
                                    className="mitra-form-input text-area"
                                    value={helpIssue}
                                    onChange={(e) => setHelpIssue(e.target.value)}
                                    required
                                />
                            </div>

                            <button type="submit" className="transmit-ticket-btn" disabled={helpLoading}>
                                <FaPaperPlane /> {helpLoading ? 'DISPATCHING ALERT...' : 'TRANSMIT HELP ALERT'}
                            </button>
                        </form>
                    </div>

                    {/* VENUE LOCATIONS */}
                    <div className="campus-venues-card">
                        <h4 className="venues-title"><FaMapMarkerAlt /> Key Campus Coordinates</h4>
                        <div className="venues-grid">
                            <div className="venue-pill"><strong>Central Auditorium:</strong> Main Inauguration & Valedictory</div>
                            <div className="venue-pill"><strong>CSE / IT Dept Labs:</strong> 24H Hackathon Workstations</div>
                            <div className="venue-pill"><strong>Central Mess:</strong> Breakfast, Lunch & Dinner Counters</div>
                            <div className="venue-pill"><strong>Hostel Block A & C:</strong> Boys Accommodation</div>
                            <div className="venue-pill"><strong>Hostel Block E:</strong> Girls Accommodation</div>
                            <div className="venue-pill"><strong>Campus Dispensary:</strong> 24/7 Medical Doctor on Duty</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParticipantPortal;
