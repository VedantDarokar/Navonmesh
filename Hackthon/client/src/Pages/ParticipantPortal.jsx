import React, { useState, useEffect } from 'react';
import { 
    FaHome, FaCompass, FaQrcode, FaCalendarAlt, FaUsers, FaAward, FaQuestionCircle, 
    FaCheckCircle, FaExclamationTriangle, FaDownload, FaEdit, FaSave, FaPlus, FaTrash, 
    FaPhone, FaMapMarkerAlt, FaBullhorn, FaClock, FaPaperPlane, FaShieldAlt
} from 'react-icons/fa';
import '../Styles/participant_portal.css';
import { getApiUrl } from '../utils/apiConfig';
import QRCode from 'qrcode';

const ParticipantPortal = ({ teamData, onLogout }) => {
    // Active Tab in Participant Portal
    const [tab, setTab] = useState('home'); // 'home' | 'explore' | 'pass' | 'schedule' | 'team' | 'cert' | 'support'

    // Team Data & Edit Form State
    const [team, setTeam] = useState(teamData || null);
    const [teamName, setTeamName] = useState(teamData?.teamName || '');
    const [college, setCollege] = useState(teamData?.college || '');
    const [leaderName, setLeaderName] = useState(teamData?.leaderName || '');
    const [leaderPhone, setLeaderPhone] = useState(teamData?.leaderPhone || '');
    const [members, setMembers] = useState(teamData?.members || []);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState({ success: '', error: '' });

    // Dynamic QR Pass State
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [passLoading, setPassLoading] = useState(false);

    // Helpdesk / Distress Form State
    const [helpIssue, setHelpIssue] = useState('');
    const [helpStatus, setHelpStatus] = useState('');
    const [helpLoading, setHelpLoading] = useState(false);

    // Countdown State (To Navonmesh 2027)
    const [timeLeft, setTimeLeft] = useState({ days: 12, hours: 8, minutes: 24, seconds: 15 });

    const API_URL = getApiUrl();

    // Reload latest team data on mount
    useEffect(() => {
        const id = team?.id || team?._id || team?.teamId;
        if (id) {
            fetch(`${API_URL}/api/team/profile/${id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.team) {
                        setTeam(data.team);
                        setTeamName(data.team.teamName || '');
                        setCollege(data.team.college || '');
                        setLeaderName(data.team.leaderName || '');
                        setLeaderPhone(data.team.leaderPhone || '');
                        setMembers(data.team.members || []);
                    }
                })
                .catch(err => console.error('Failed to sync team:', err));
        }
    }, []);

    // Generate dynamic QR pass
    useEffect(() => {
        const passIdentifier = team?.teamId || team?.id || 'NAVONMESH_PARTICIPANT';
        QRCode.toDataURL(passIdentifier, {
            width: 260,
            margin: 2,
            color: { dark: '#070a13', light: '#ffffff' }
        }).then(url => setQrCodeUrl(url)).catch(err => console.error(err));
    }, [team]);

    // Live Countdown Timer
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

    // Save team name & members update
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
                    members: members
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setTeam(data.team);
                sessionStorage.setItem('teamData', JSON.stringify(data.team));
                setSaveStatus({ success: 'Team details updated & synced with server!', error: '' });
                setTimeout(() => setSaveStatus({ success: '', error: '' }), 4000);
            } else {
                setSaveStatus({ success: '', error: data.error || 'Failed to update details.' });
            }
        } catch (err) {
            setSaveStatus({ success: '', error: 'Network error. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    const handleAddMember = () => {
        if (members.length >= 4) {
            alert('Maximum team size reached (5 members total including leader).');
            return;
        }
        setMembers([...members, { name: '', email: '', phone: '', college: team?.college || '' }]);
    };

    const handleRemoveMember = (idx) => {
        setMembers(members.filter((_, i) => i !== idx));
    };

    const handleMemberChange = (idx, field, value) => {
        const updated = [...members];
        updated[idx][field] = value;
        setMembers(updated);
    };

    // Raise Helpdesk Distress Signal
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
                    groupNumber: 1, // Default general participant stream
                    issueDescription: `[${team?.teamId || 'TEAM'}] ${team?.teamName}: ${helpIssue.trim()}`
                })
            });

            if (res.ok) {
                setHelpStatus('Ticket dispatched! Mission Control alerted.');
                setHelpIssue('');
            } else {
                setHelpStatus('Signal failed. Please reach the offline help desk.');
            }
        } catch (err) {
            setHelpStatus('Connection error. Find an event coordinator.');
        } finally {
            setHelpLoading(false);
        }
    };

    // Download Pass Canvas Image
    const handleDownloadPass = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 750;
        const ctx = canvas.getContext('2d');

        // Dark background
        ctx.fillStyle = '#070a13';
        ctx.fillRect(0, 0, 600, 750);

        // Header gradient
        const grad = ctx.createLinearGradient(0, 0, 600, 100);
        grad.addColorStop(0, '#d4af37');
        grad.addColorStop(1, '#fbbf24');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 600, 110);

        // Header text
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 26px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('NAVONMESH 2027', 300, 50);
        ctx.font = '15px Inter, sans-serif';
        ctx.fillText('OFFICIAL DIGITAL SQUAD PASS', 300, 80);

        // Team Info
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px Orbitron, sans-serif';
        ctx.fillText(team?.teamName || 'Squad Pass', 300, 160);

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 16px monospace';
        ctx.fillText(`TEAM ID: ${team?.teamId || 'SQUAD'}`, 300, 190);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px Inter, sans-serif';
        ctx.fillText(`Event: ${team?.event || 'National Tech Fest'} • ${team?.college || 'SSGMCE Shegaon'}`, 300, 220);

        // QR Code image
        if (qrCodeUrl) {
            const img = new Image();
            img.src = qrCodeUrl;
            img.onload = () => {
                ctx.drawImage(img, 180, 260, 240, 240);

                ctx.fillStyle = '#34d399';
                ctx.font = 'bold 14px Orbitron, sans-serif';
                ctx.fillText('✓ VALID DIGITAL PASS • SINGLE USE MEAL LOCK', 300, 540);

                ctx.fillStyle = '#64748b';
                ctx.font = '12px Inter, sans-serif';
                ctx.fillText(`Leader: ${team?.leaderName || ''} (${team?.leaderPhone || ''})`, 300, 580);
                ctx.fillText(`Issued: ${new Date().toLocaleDateString('en-IN')}`, 300, 610);

                const link = document.createElement('a');
                link.download = `Navonmesh_Pass_${team?.teamId || 'Squad'}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            };
        }
    };

    return (
        <div className="participant-portal-container">
            {/* SUB-NAVIGATION PILLS */}
            <div style={{
                display: 'flex',
                gap: '6px',
                overflowX: 'auto',
                paddingBottom: '10px',
                marginBottom: '10px',
                scrollbarWidth: 'none'
            }}>
                <button
                    onClick={() => setTab('home')}
                    style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        border: '1px solid var(--coor-card-border)',
                        background: tab === 'home' ? 'var(--coor-accent-bright)' : 'rgba(255,255,255,0.05)',
                        color: tab === 'home' ? '#000' : '#fff',
                        fontSize: '11px',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        cursor: 'pointer'
                    }}
                >
                    🏠 Home
                </button>
                <button
                    onClick={() => setTab('explore')}
                    style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        border: '1px solid var(--coor-card-border)',
                        background: tab === 'explore' ? 'var(--coor-accent-bright)' : 'rgba(255,255,255,0.05)',
                        color: tab === 'explore' ? '#000' : '#fff',
                        fontSize: '11px',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        cursor: 'pointer'
                    }}
                >
                    🔍 Explore
                </button>
                <button
                    onClick={() => setTab('pass')}
                    style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        border: '1px solid var(--coor-card-border)',
                        background: tab === 'pass' ? 'var(--coor-accent-bright)' : 'rgba(255,255,255,0.05)',
                        color: tab === 'pass' ? '#000' : '#fff',
                        fontSize: '11px',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        cursor: 'pointer'
                    }}
                >
                    🎫 My Pass
                </button>
                <button
                    onClick={() => setTab('schedule')}
                    style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        border: '1px solid var(--coor-card-border)',
                        background: tab === 'schedule' ? 'var(--coor-accent-bright)' : 'rgba(255,255,255,0.05)',
                        color: tab === 'schedule' ? '#000' : '#fff',
                        fontSize: '11px',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        cursor: 'pointer'
                    }}
                >
                    🗺️ Schedule
                </button>
                <button
                    onClick={() => setTab('team')}
                    style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        border: '1px solid var(--coor-card-border)',
                        background: tab === 'team' ? 'var(--coor-accent-bright)' : 'rgba(255,255,255,0.05)',
                        color: tab === 'team' ? '#000' : '#fff',
                        fontSize: '11px',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        cursor: 'pointer'
                    }}
                >
                    👥 Squad
                </button>
                <button
                    onClick={() => setTab('cert')}
                    style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        border: '1px solid var(--coor-card-border)',
                        background: tab === 'cert' ? 'var(--coor-accent-bright)' : 'rgba(255,255,255,0.05)',
                        color: tab === 'cert' ? '#000' : '#fff',
                        fontSize: '11px',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        cursor: 'pointer'
                    }}
                >
                    🏆 Certs
                </button>
                <button
                    onClick={() => setTab('support')}
                    style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        border: '1px solid var(--coor-card-border)',
                        background: tab === 'support' ? 'var(--coor-accent-bright)' : 'rgba(255,255,255,0.05)',
                        color: tab === 'support' ? '#000' : '#fff',
                        fontSize: '11px',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        cursor: 'pointer'
                    }}
                >
                    🆘 Help
                </button>
            </div>

            {/* TAB A: PARTICIPANT HOME */}
            {tab === 'home' && (
                <>
                    <div className="mitra-hero-card">
                        <div className="mitra-hero-top">
                            <div>
                                <h2 className="mitra-welcome-title">Welcome, {team?.teamName || 'Squad'}!</h2>
                                <span className="mitra-team-badge">ID: {team?.teamId || 'SQUAD'}</span>
                            </div>
                            <span className="mitra-status-chip confirmed">
                                ✓ VERIFIED PASS
                            </span>
                        </div>

                        <div className="mitra-alert-strip">
                            <span className="mitra-alert-tag">LIVE</span>
                            <span>Hackathon Problem Statements & Seating Matrix now active!</span>
                        </div>
                    </div>

                    {/* COUNTDOWN TO EVENT */}
                    <div className="mitra-section-header">
                        <h3 className="mitra-section-title"><FaClock /> COUNTDOWN TO FEST</h3>
                    </div>
                    <div className="mitra-countdown-box">
                        <div className="mitra-count-unit">
                            <div className="mitra-count-num">{timeLeft.days}</div>
                            <div className="mitra-count-lbl">Days</div>
                        </div>
                        <div className="mitra-count-unit">
                            <div className="mitra-count-num">{timeLeft.hours}</div>
                            <div className="mitra-count-lbl">Hours</div>
                        </div>
                        <div className="mitra-count-unit">
                            <div className="mitra-count-num">{timeLeft.minutes}</div>
                            <div className="mitra-count-lbl">Mins</div>
                        </div>
                        <div className="mitra-count-unit">
                            <div className="mitra-count-num">{timeLeft.seconds}</div>
                            <div className="mitra-count-lbl">Secs</div>
                        </div>
                    </div>

                    {/* FEATURED EVENTS */}
                    <div className="mitra-section-header">
                        <h3 className="mitra-section-title"><FaCompass /> FEATURED ARENAS</h3>
                        <span className="mitra-section-link" onClick={() => setTab('explore')}>View All</span>
                    </div>

                    <div className="mitra-events-grid">
                        <div className="mitra-event-card" onClick={() => setTab('explore')}>
                            <div>
                                <span className="mitra-event-badge srijan">SRIJAN '27</span>
                                <h4 className="mitra-event-name">National Hackathon</h4>
                                <p className="mitra-event-desc">24-hour non-stop coding, hardware integration, and prototyping challenge.</p>
                            </div>
                            <div className="mitra-event-footer">
                                <span>₹50,000+ Prizes</span>
                                <span>CS Labs</span>
                            </div>
                        </div>

                        <div className="mitra-event-card" onClick={() => setTab('explore')}>
                            <div>
                                <span className="mitra-event-badge ankur">ANKUR '27</span>
                                <h4 className="mitra-event-name">Project Expo</h4>
                                <p className="mitra-event-desc">Showcase working engineering projects, working prototypes & startup ideas.</p>
                            </div>
                            <div className="mitra-event-footer">
                                <span>₹30,000+ Prizes</span>
                                <span>Mech Arena</span>
                            </div>
                        </div>

                        <div className="mitra-event-card" onClick={() => setTab('explore')}>
                            <div>
                                <span className="mitra-event-badge udbhav">UDBHAV '27</span>
                                <h4 className="mitra-event-name">National Conference</h4>
                                <p className="mitra-event-desc">Research paper presentation, technical symposium and keynote lectures.</p>
                            </div>
                            <div className="mitra-event-footer">
                                <span>Certificates + Cash</span>
                                <span>Seminar Hall</span>
                            </div>
                        </div>

                        <div className="mitra-event-card" onClick={() => setTab('explore')}>
                            <div>
                                <span className="mitra-event-badge cultural">RHYTHM '27</span>
                                <h4 className="mitra-event-name">Cultural Night</h4>
                                <p className="mitra-event-desc">Singing, Dance, Battle of Bands, and high-voltage celebrity DJ performance.</p>
                            </div>
                            <div className="mitra-event-footer">
                                <span>Day 1 Evening</span>
                                <span>Main Stage</span>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* TAB B: EXPLORE & REGISTER */}
            {tab === 'explore' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className="mitra-section-header">
                        <h3 className="mitra-section-title"><FaCompass /> BROWSE FEST ARENAS & WORKSHOPS</h3>
                    </div>

                    <div className="mitra-help-card">
                        <span className="mitra-event-badge srijan">HACKATHON TRACK</span>
                        <h4 style={{ margin: '6px 0', color: '#fff', fontSize: '13px' }}>SRIJAN 2027 (24H HACKATHON)</h4>
                        <p style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.4' }}>
                            <strong>Eligibility:</strong> Engineering & Polytechnic students (Teams of 2–5).<br/>
                            <strong>Prize Pool:</strong> ₹50,000+ with trophies and incubation support.<br/>
                            <strong>Tracks:</strong> AI/ML, Web3, Smart Cities, HealthTech, Agritech.
                        </p>
                    </div>

                    <div className="mitra-help-card">
                        <span className="mitra-event-badge ankur">PROJECT COMPETITION</span>
                        <h4 style={{ margin: '6px 0', color: '#fff', fontSize: '13px' }}>ANKUR 2027 (EXPO)</h4>
                        <p style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.4' }}>
                            <strong>Eligibility:</strong> Degree and Diploma tracks (Teams of 2–4).<br/>
                            <strong>Evaluation:</strong> Working prototype demonstration to industrial jury.<br/>
                            <strong>Prize Pool:</strong> ₹30,000+ with best innovation awards.
                        </p>
                    </div>

                    <div className="mitra-help-card">
                        <span className="mitra-event-badge udbhav">PAPER & SYMPOSIUM</span>
                        <h4 style={{ margin: '6px 0', color: '#fff', fontSize: '13px' }}>UDBHAV 2027 (CONFERENCE)</h4>
                        <p style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.4' }}>
                            <strong>Tracks:</strong> Computer, Mechanical, Electrical, Civil, Applied Sciences.<br/>
                            <strong>Publication:</strong> Selected papers indexed in conference proceedings.
                        </p>
                    </div>

                    <div className="mitra-help-card">
                        <span className="mitra-event-badge cultural">SPECIAL TRACK</span>
                        <h4 style={{ margin: '6px 0', color: '#fff', fontSize: '13px' }}>VAYUVEGA (DRONE RACING)</h4>
                        <p style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.4' }}>
                            Obstacle course drone navigation, line follower challenges, and aerial speed trials.
                        </p>
                    </div>
                </div>
            )}

            {/* TAB C: MY NAVONMESH PASS */}
            {tab === 'pass' && (
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                    <div className="mitra-hero-card" style={{ textAlign: 'center' }}>
                        <span className="mitra-event-badge srijan">ACTIVE PASS</span>
                        <h3 style={{ margin: '6px 0', color: '#fff', fontSize: '15px' }}>{team?.teamName || 'Squad Pass'}</h3>
                        <p style={{ fontSize: '12px', color: '#fbbf24', fontFamily: 'monospace', fontWeight: 'bold' }}>
                            {team?.teamId || 'SQUAD'}
                        </p>

                        <div style={{
                            background: '#fff',
                            borderRadius: '16px',
                            padding: '14px',
                            display: 'inline-block',
                            margin: '14px 0',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
                        }}>
                            {qrCodeUrl ? (
                                <img src={qrCodeUrl} alt="QR Pass" style={{ width: '200px', height: '200px', display: 'block' }} />
                            ) : (
                                <p style={{ color: '#000', fontSize: '12px' }}>Generating Dynamic QR...</p>
                            )}
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '8px',
                            flexWrap: 'wrap',
                            margin: '8px 0 16px'
                        }}>
                            <span style={{ fontSize: '10px', background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)', padding: '3px 8px', borderRadius: '10px' }}>
                                ✓ Main Gate Entry
                            </span>
                            <span style={{ fontSize: '10px', background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)', padding: '3px 8px', borderRadius: '10px' }}>
                                🍽️ Mess Canteen Linked
                            </span>
                            <span style={{ fontSize: '10px', background: 'rgba(56,189,248,0.15)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)', padding: '3px 8px', borderRadius: '10px' }}>
                                🪑 Lab Seat Assigned
                            </span>
                        </div>

                        <button className="mitra-save-btn" onClick={handleDownloadPass}>
                            <FaDownload /> DOWNLOAD DIGITAL PASS
                        </button>
                    </div>
                </div>
            )}

            {/* TAB D: SCHEDULE & CAMPUS GUIDE */}
            {tab === 'schedule' && (
                <div>
                    <div className="mitra-section-header">
                        <h3 className="mitra-section-title"><FaCalendarAlt /> DAY-WISE AGENDA</h3>
                    </div>

                    <div className="mitra-timeline">
                        <div className="mitra-timeline-item">
                            <div className="mitra-time-chip">
                                <strong>08:30 AM</strong>
                                <span>Day 1</span>
                            </div>
                            <div className="mitra-timeline-details">
                                <h4>Reporting & Kit Collection</h4>
                                <p>Collect badges, ID lanyards, and meal pass verification.</p>
                                <span className="mitra-venue-tag"><FaMapMarkerAlt /> Registration Desks</span>
                            </div>
                        </div>

                        <div className="mitra-timeline-item">
                            <div className="mitra-time-chip">
                                <strong>10:00 AM</strong>
                                <span>Day 1</span>
                            </div>
                            <div className="mitra-timeline-details">
                                <h4>Grand Inauguration Ceremony</h4>
                                <p>Keynote addresses by dignitaries and hackathon problem statement release.</p>
                                <span className="mitra-venue-tag"><FaMapMarkerAlt /> SSGMCE Auditorium</span>
                            </div>
                        </div>

                        <div className="mitra-timeline-item">
                            <div className="mitra-time-chip">
                                <strong>11:30 AM</strong>
                                <span>Day 1</span>
                            </div>
                            <div className="mitra-timeline-details">
                                <h4>24-Hour Hackathon Commences</h4>
                                <p>Teams deploy to allocated workstations with high-speed WiFi.</p>
                                <span className="mitra-venue-tag"><FaMapMarkerAlt /> CS Dept Labs</span>
                            </div>
                        </div>

                        <div className="mitra-timeline-item">
                            <div className="mitra-time-chip">
                                <strong>01:00 PM</strong>
                                <span>Day 1</span>
                            </div>
                            <div className="mitra-timeline-details">
                                <h4>Lunch Break</h4>
                                <p>Scan personal QR code at counter for fresh catering.</p>
                                <span className="mitra-venue-tag"><FaMapMarkerAlt /> Central Mess</span>
                            </div>
                        </div>

                        <div className="mitra-timeline-item">
                            <div className="mitra-time-chip">
                                <strong>07:30 PM</strong>
                                <span>Day 1</span>
                            </div>
                            <div className="mitra-timeline-details">
                                <h4>Cultural Night & DJ Eve</h4>
                                <p>Music performances and cultural showcase.</p>
                                <span className="mitra-venue-tag"><FaMapMarkerAlt /> Open Air Stage</span>
                            </div>
                        </div>

                        <div className="mitra-timeline-item">
                            <div className="mitra-time-chip">
                                <strong>11:30 AM</strong>
                                <span>Day 2</span>
                            </div>
                            <div className="mitra-timeline-details">
                                <h4>Final Jury Evaluation & Demos</h4>
                                <p>Present final code, hardware prototype, and business model.</p>
                                <span className="mitra-venue-tag"><FaMapMarkerAlt /> Evaluation Rooms</span>
                            </div>
                        </div>

                        <div className="mitra-timeline-item">
                            <div className="mitra-time-chip">
                                <strong>03:30 PM</strong>
                                <span>Day 2</span>
                            </div>
                            <div className="mitra-timeline-details">
                                <h4>Valedictory & Prize Distribution</h4>
                                <p>Announcement of winners and cash prize handover.</p>
                                <span className="mitra-venue-tag"><FaMapMarkerAlt /> Auditorium</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB E: MY TEAM & RESULTS (EDITABLE SQUAD) */}
            {tab === 'team' && (
                <div className="mitra-team-editor-card">
                    <div className="mitra-section-header">
                        <h3 className="mitra-section-title"><FaUsers /> SQUAD MANAGEMENT</h3>
                    </div>
                    <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 14px 0' }}>
                        Modify your team name, college, or members. Changes automatically sync to admin.
                    </p>

                    {saveStatus.success && (
                        <div style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', padding: '8px 10px', borderRadius: '8px', fontSize: '11px', marginBottom: '10px' }}>
                            <FaCheckCircle /> {saveStatus.success}
                        </div>
                    )}

                    {saveStatus.error && (
                        <div style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', padding: '8px 10px', borderRadius: '8px', fontSize: '11px', marginBottom: '10px' }}>
                            <FaExclamationTriangle /> {saveStatus.error}
                        </div>
                    )}

                    <form onSubmit={handleSaveTeam}>
                        <div className="mitra-form-group">
                            <label className="mitra-form-label">Team / Squad Name</label>
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
                            <label className="mitra-form-label">Team Leader Name</label>
                            <input
                                type="text"
                                className="mitra-form-input"
                                value={leaderName}
                                onChange={(e) => setLeaderName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mitra-form-group">
                            <label className="mitra-form-label">Leader Phone</label>
                            <input
                                type="tel"
                                className="mitra-form-input"
                                value={leaderPhone}
                                onChange={(e) => setLeaderPhone(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mitra-section-header" style={{ marginTop: '16px' }}>
                            <h4 style={{ margin: 0, fontSize: '12px', color: '#fff' }}>Team Members ({members.length})</h4>
                        </div>

                        {members.map((m, idx) => (
                            <div key={idx} className="mitra-member-row">
                                <div className="mitra-member-row-header">
                                    <span>Member #{idx + 2}</span>
                                    <button
                                        type="button"
                                        className="mitra-delete-btn"
                                        onClick={() => handleRemoveMember(idx)}
                                        title="Remove Member"
                                    >
                                        <FaTrash />
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
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        className="mitra-form-input"
                                        value={m.email || ''}
                                        onChange={(e) => handleMemberChange(idx, 'email', e.target.value)}
                                    />
                                    <input
                                        type="tel"
                                        placeholder="Phone"
                                        className="mitra-form-input"
                                        value={m.phone || ''}
                                        onChange={(e) => handleMemberChange(idx, 'phone', e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}

                        <button type="button" className="mitra-add-member-btn" onClick={handleAddMember}>
                            <FaPlus /> Add Team Member
                        </button>

                        <button type="submit" className="mitra-save-btn" disabled={saving}>
                            <FaSave /> {saving ? 'SYNCING...' : 'SAVE SQUAD DETAILS'}
                        </button>
                    </form>
                </div>
            )}

            {/* TAB F: CERTIFICATES & PROFILE */}
            {tab === 'cert' && (
                <div style={{ textAlign: 'center' }}>
                    <div className="mitra-cert-card">
                        <FaAward className="mitra-cert-icon" />
                        <h3 className="mitra-cert-title">PARTICIPATION CERTIFICATE</h3>
                        <p className="mitra-cert-sub">
                            Issued for participating in {team?.event || 'Navonmesh 2027'}. Digitally signed and verifiable.
                        </p>

                        <div style={{
                            background: 'rgba(0,0,0,0.3)',
                            padding: '10px',
                            borderRadius: '10px',
                            fontSize: '11px',
                            fontFamily: 'monospace',
                            color: '#34d399',
                            marginBottom: '14px'
                        }}>
                            VERIFICATION ID: NAV27-{team?.teamId || 'CERT'}-SSGMCE
                        </div>

                        <button className="mitra-download-cert-btn" onClick={() => alert('Certificate will unlock immediately upon valedictory session completion!')}>
                            <FaDownload /> DOWNLOAD DIGITAL CERTIFICATE
                        </button>
                    </div>
                </div>
            )}

            {/* TAB G: HELP & SUPPORT */}
            {tab === 'support' && (
                <div>
                    <div className="mitra-section-header">
                        <h3 className="mitra-section-title"><FaQuestionCircle /> HELPDESK & SUPPORT</h3>
                    </div>

                    <div className="mitra-help-card">
                        <h4 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '13px' }}>🚨 Raise Helpdesk Alert</h4>
                        <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 10px 0' }}>
                            Report issues with hardware, power, WiFi, accommodation, or lost items. Main admin command center will be alerted.
                        </p>

                        {helpStatus && (
                            <div style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', padding: '8px', borderRadius: '8px', fontSize: '11px', marginBottom: '8px' }}>
                                {helpStatus}
                            </div>
                        )}

                        <form onSubmit={handleRaiseHelp}>
                            <textarea
                                rows="3"
                                placeholder="Describe your query or requirement (e.g. need LAN cable at table 14, hostel room key, etc.)"
                                className="mitra-form-input"
                                style={{ width: '100%', resize: 'none', marginBottom: '8px' }}
                                value={helpIssue}
                                onChange={(e) => setHelpIssue(e.target.value)}
                                required
                            />
                            <button type="submit" className="mitra-save-btn" disabled={helpLoading}>
                                <FaPaperPlane /> {helpLoading ? 'SENDING...' : 'TRANSMIT HELP REQUEST'}
                            </button>
                        </form>
                    </div>

                    <div className="mitra-help-card">
                        <h4 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '13px' }}>📞 Emergency Contacts</h4>
                        <div className="mitra-contact-item">
                            <span>Boys Accommodation Desk</span>
                            <span style={{ color: '#fbbf24' }}>+91 94031 22894</span>
                        </div>
                        <div className="mitra-contact-item">
                            <span>Girls Accommodation Desk</span>
                            <span style={{ color: '#ec4899' }}>+91 91724 34091</span>
                        </div>
                        <div className="mitra-contact-item">
                            <span>Technical & WiFi Support</span>
                            <span style={{ color: '#38bdf8' }}>+91 88056 71290</span>
                        </div>
                        <div className="mitra-contact-item">
                            <span>Medical & First Aid (Dispensary)</span>
                            <span style={{ color: '#34d399' }}>Ext 204</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParticipantPortal;
