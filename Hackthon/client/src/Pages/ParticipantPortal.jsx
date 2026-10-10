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
            <div className="mitra-tabs-nav" style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                paddingBottom: '10px',
                marginBottom: '14px',
                scrollbarWidth: 'none',
                WebkitOverflowScrolling: 'touch'
            }}>
                <button
                    onClick={() => setTab('home')}
                    className={`mitra-tab-pill ${tab === 'home' ? 'active' : ''}`}
                    style={{
                        padding: '7px 14px',
                        borderRadius: '24px',
                        border: tab === 'home' ? '1px solid #fbbf24' : '1px solid rgba(255,255,255,0.12)',
                        background: tab === 'home' ? 'linear-gradient(135deg, #fbbf24 0%, #d4af37 100%)' : 'rgba(18, 24, 40, 0.7)',
                        color: tab === 'home' ? '#070a13' : '#cbd5e1',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                    }}
                >
                    🏠 Home
                </button>
                <button
                    onClick={() => setTab('explore')}
                    className={`mitra-tab-pill ${tab === 'explore' ? 'active' : ''}`}
                    style={{
                        padding: '7px 14px',
                        borderRadius: '24px',
                        border: tab === 'explore' ? '1px solid #fbbf24' : '1px solid rgba(255,255,255,0.12)',
                        background: tab === 'explore' ? 'linear-gradient(135deg, #fbbf24 0%, #d4af37 100%)' : 'rgba(18, 24, 40, 0.7)',
                        color: tab === 'explore' ? '#070a13' : '#cbd5e1',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                    }}
                >
                    🧭 Arenas
                </button>
                <button
                    onClick={() => setTab('pass')}
                    className={`mitra-tab-pill ${tab === 'pass' ? 'active' : ''}`}
                    style={{
                        padding: '7px 14px',
                        borderRadius: '24px',
                        border: tab === 'pass' ? '1px solid #fbbf24' : '1px solid rgba(255,255,255,0.12)',
                        background: tab === 'pass' ? 'linear-gradient(135deg, #fbbf24 0%, #d4af37 100%)' : 'rgba(18, 24, 40, 0.7)',
                        color: tab === 'pass' ? '#070a13' : '#cbd5e1',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                    }}
                >
                    🎫 My Pass
                </button>
                <button
                    onClick={() => setTab('schedule')}
                    className={`mitra-tab-pill ${tab === 'schedule' ? 'active' : ''}`}
                    style={{
                        padding: '7px 14px',
                        borderRadius: '24px',
                        border: tab === 'schedule' ? '1px solid #fbbf24' : '1px solid rgba(255,255,255,0.12)',
                        background: tab === 'schedule' ? 'linear-gradient(135deg, #fbbf24 0%, #d4af37 100%)' : 'rgba(18, 24, 40, 0.7)',
                        color: tab === 'schedule' ? '#070a13' : '#cbd5e1',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                    }}
                >
                    📅 Schedule
                </button>
                <button
                    onClick={() => setTab('team')}
                    className={`mitra-tab-pill ${tab === 'team' ? 'active' : ''}`}
                    style={{
                        padding: '7px 14px',
                        borderRadius: '24px',
                        border: tab === 'team' ? '1px solid #fbbf24' : '1px solid rgba(255,255,255,0.12)',
                        background: tab === 'team' ? 'linear-gradient(135deg, #fbbf24 0%, #d4af37 100%)' : 'rgba(18, 24, 40, 0.7)',
                        color: tab === 'team' ? '#070a13' : '#cbd5e1',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                    }}
                >
                    👥 Squad
                </button>
                <button
                    onClick={() => setTab('cert')}
                    className={`mitra-tab-pill ${tab === 'cert' ? 'active' : ''}`}
                    style={{
                        padding: '7px 14px',
                        borderRadius: '24px',
                        border: tab === 'cert' ? '1px solid #fbbf24' : '1px solid rgba(255,255,255,0.12)',
                        background: tab === 'cert' ? 'linear-gradient(135deg, #fbbf24 0%, #d4af37 100%)' : 'rgba(18, 24, 40, 0.7)',
                        color: tab === 'cert' ? '#070a13' : '#cbd5e1',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                    }}
                >
                    🏆 Certs
                </button>
                <button
                    onClick={() => setTab('support')}
                    className={`mitra-tab-pill ${tab === 'support' ? 'active' : ''}`}
                    style={{
                        padding: '7px 14px',
                        borderRadius: '24px',
                        border: tab === 'support' ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.12)',
                        background: tab === 'support' ? '#ef4444' : 'rgba(18, 24, 40, 0.7)',
                        color: tab === 'support' ? '#fff' : '#cbd5e1',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                    }}
                >
                    🆘 Help
                </button>
            </div>

            {/* TAB A: PARTICIPANT HOME */}
            {tab === 'home' && (
                <>
                    {/* HERO WELCOME CARD */}
                    <div 
                        className="mitra-hero-card"
                        style={{
                            background: 'linear-gradient(135deg, rgba(28, 37, 65, 0.9) 0%, rgba(11, 16, 30, 0.95) 100%)',
                            border: '1px solid rgba(251, 191, 36, 0.3)',
                            borderRadius: '18px',
                            padding: '18px',
                            marginBottom: '16px',
                            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
                        }}
                    >
                        <div 
                            className="mitra-hero-top"
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                gap: '12px',
                                marginBottom: '14px'
                            }}
                        >
                            <div>
                                <h2 
                                    className="mitra-welcome-title"
                                    style={{
                                        fontFamily: 'Orbitron, sans-serif',
                                        fontSize: '17px',
                                        fontWeight: '800',
                                        color: '#ffffff',
                                        margin: '0 0 6px 0',
                                        letterSpacing: '0.5px'
                                    }}
                                >
                                    Welcome, {team?.teamName || 'Squad'}!
                                </h2>
                                <span 
                                    className="mitra-team-badge"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        background: 'rgba(251, 191, 36, 0.12)',
                                        border: '1px solid rgba(251, 191, 36, 0.4)',
                                        color: '#fbbf24',
                                        fontFamily: 'Space Mono, monospace',
                                        fontSize: '11.5px',
                                        fontWeight: '700',
                                        padding: '3px 10px',
                                        borderRadius: '12px',
                                        letterSpacing: '0.8px'
                                    }}
                                >
                                    ID: {team?.teamId || 'SQUAD'}
                                </span>
                            </div>
                            <span 
                                className="mitra-status-chip confirmed"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    background: 'rgba(16, 185, 129, 0.18)',
                                    border: '1px solid rgba(16, 185, 129, 0.45)',
                                    color: '#34d399',
                                    padding: '4px 10px',
                                    borderRadius: '14px',
                                    fontSize: '10.5px',
                                    fontWeight: '800',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.6px',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                <FaCheckCircle /> VERIFIED PASS
                            </span>
                        </div>

                        {/* LIVE BULLETIN TICKER */}
                        <div 
                            className="mitra-alert-strip"
                            style={{
                                background: 'rgba(0, 0, 0, 0.45)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderLeft: '3px solid #fbbf24',
                                borderRadius: '10px',
                                padding: '9px 12px',
                                fontSize: '11.5px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                color: '#cbd5e1',
                                lineHeight: '1.4'
                            }}
                        >
                            <span 
                                className="mitra-alert-tag"
                                style={{
                                    background: '#fbbf24',
                                    color: '#070a13',
                                    fontWeight: '900',
                                    fontSize: '9.5px',
                                    padding: '2px 7px',
                                    borderRadius: '4px',
                                    letterSpacing: '0.6px',
                                    flexShrink: 0
                                }}
                            >
                                LIVE
                            </span>
                            <span>Hackathon Problem Statements & Seating Matrix now active!</span>
                        </div>
                    </div>

                    {/* COUNTDOWN TO FEST */}
                    <div 
                        className="mitra-section-header"
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            margin: '18px 0 10px 0'
                        }}
                    >
                        <h3 
                            className="mitra-section-title"
                            style={{
                                fontFamily: 'Orbitron, sans-serif',
                                fontSize: '13.5px',
                                fontWeight: '800',
                                color: '#fbbf24',
                                letterSpacing: '0.8px',
                                margin: 0,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <FaClock /> COUNTDOWN TO FEST
                        </h3>
                    </div>

                    <div 
                        className="mitra-countdown-box"
                        style={{
                            background: 'linear-gradient(135deg, rgba(17, 24, 43, 0.95) 0%, rgba(9, 13, 24, 0.98) 100%)',
                            border: '1px solid rgba(251, 191, 36, 0.25)',
                            borderRadius: '16px',
                            padding: '14px 10px',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: '8px',
                            margin: '12px 0 20px 0',
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
                        }}
                    >
                        <div 
                            className="mitra-count-unit"
                            style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                                borderRadius: '12px',
                                padding: '10px 4px',
                                textAlign: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <div className="mitra-count-num" style={{ fontFamily: 'Orbitron, monospace', fontSize: '22px', fontWeight: '900', color: '#fbbf24', lineHeight: '1.1' }}>{timeLeft.days}</div>
                            <div className="mitra-count-lbl" style={{ fontSize: '9.5px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: '4px' }}>Days</div>
                        </div>
                        <div 
                            className="mitra-count-unit"
                            style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                                borderRadius: '12px',
                                padding: '10px 4px',
                                textAlign: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <div className="mitra-count-num" style={{ fontFamily: 'Orbitron, monospace', fontSize: '22px', fontWeight: '900', color: '#fbbf24', lineHeight: '1.1' }}>{timeLeft.hours}</div>
                            <div className="mitra-count-lbl" style={{ fontSize: '9.5px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: '4px' }}>Hours</div>
                        </div>
                        <div 
                            className="mitra-count-unit"
                            style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                                borderRadius: '12px',
                                padding: '10px 4px',
                                textAlign: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <div className="mitra-count-num" style={{ fontFamily: 'Orbitron, monospace', fontSize: '22px', fontWeight: '900', color: '#fbbf24', lineHeight: '1.1' }}>{timeLeft.minutes}</div>
                            <div className="mitra-count-lbl" style={{ fontSize: '9.5px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: '4px' }}>Mins</div>
                        </div>
                        <div 
                            className="mitra-count-unit"
                            style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                                borderRadius: '12px',
                                padding: '10px 4px',
                                textAlign: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <div className="mitra-count-num" style={{ fontFamily: 'Orbitron, monospace', fontSize: '22px', fontWeight: '900', color: '#fbbf24', lineHeight: '1.1' }}>{timeLeft.seconds}</div>
                            <div className="mitra-count-lbl" style={{ fontSize: '9.5px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: '4px' }}>Secs</div>
                        </div>
                    </div>

                    {/* FEATURED ARENAS HEADER */}
                    <div 
                        className="mitra-section-header"
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            margin: '18px 0 12px 0'
                        }}
                    >
                        <h3 
                            className="mitra-section-title"
                            style={{
                                fontFamily: 'Orbitron, sans-serif',
                                fontSize: '13.5px',
                                fontWeight: '800',
                                color: '#fbbf24',
                                letterSpacing: '0.8px',
                                margin: 0,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <FaCompass /> FEATURED ARENAS
                        </h3>
                        <span 
                            className="mitra-section-link"
                            onClick={() => setTab('explore')}
                            style={{
                                fontSize: '11.5px',
                                fontWeight: '700',
                                color: '#38bdf8',
                                cursor: 'pointer',
                                textDecoration: 'none'
                            }}
                        >
                            View All &rarr;
                        </span>
                    </div>

                    {/* FEATURED ARENAS CARDS */}
                    <div 
                        className="mitra-events-grid"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                            gap: '12px',
                            marginBottom: '20px'
                        }}
                    >
                        <div 
                            className="mitra-event-card"
                            onClick={() => setTab('explore')}
                            style={{
                                background: 'linear-gradient(135deg, rgba(20, 27, 47, 0.85) 0%, rgba(10, 14, 26, 0.95) 100%)',
                                border: '1px solid rgba(255, 255, 255, 0.09)',
                                borderRadius: '16px',
                                padding: '14px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                                boxShadow: '0 6px 18px rgba(0, 0, 0, 0.35)'
                            }}
                        >
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span className="mitra-event-badge srijan" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.35)', padding: '3px 8px', borderRadius: '6px', fontSize: '9.5px', fontWeight: '800' }}>SRIJAN '27</span>
                                    <span style={{ fontSize: '10px', color: '#38bdf8', fontWeight: '700' }}>24H HACKATHON</span>
                                </div>
                                <h4 className="mitra-event-name" style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '14px', fontWeight: '800', color: '#ffffff', margin: '0 0 6px 0' }}>National Hackathon</h4>
                                <p className="mitra-event-desc" style={{ fontSize: '11.5px', color: '#94a3b8', lineHeight: '1.4', margin: '0 0 12px 0' }}>24-hour non-stop coding, hardware integration, and prototyping challenge.</p>
                            </div>
                            <div 
                                className="mitra-event-footer"
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                                    paddingTop: '10px',
                                    fontSize: '11px'
                                }}
                            >
                                <span style={{ color: '#fbbf24', fontWeight: '700' }}>🏆 ₹50,000+ Prizes</span>
                                <span style={{ color: '#38bdf8', fontWeight: '600' }}>📍 CS Dept Labs</span>
                            </div>
                        </div>

                        <div 
                            className="mitra-event-card"
                            onClick={() => setTab('explore')}
                            style={{
                                background: 'linear-gradient(135deg, rgba(20, 27, 47, 0.85) 0%, rgba(10, 14, 26, 0.95) 100%)',
                                border: '1px solid rgba(255, 255, 255, 0.09)',
                                borderRadius: '16px',
                                padding: '14px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                                boxShadow: '0 6px 18px rgba(0, 0, 0, 0.35)'
                            }}
                        >
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span className="mitra-event-badge ankur" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.35)', padding: '3px 8px', borderRadius: '6px', fontSize: '9.5px', fontWeight: '800' }}>ANKUR '27</span>
                                    <span style={{ fontSize: '10px', color: '#fbbf24', fontWeight: '700' }}>EXPO ARENA</span>
                                </div>
                                <h4 className="mitra-event-name" style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '14px', fontWeight: '800', color: '#ffffff', margin: '0 0 6px 0' }}>Project Expo</h4>
                                <p className="mitra-event-desc" style={{ fontSize: '11.5px', color: '#94a3b8', lineHeight: '1.4', margin: '0 0 12px 0' }}>Showcase working engineering projects, working prototypes & startup ideas.</p>
                            </div>
                            <div 
                                className="mitra-event-footer"
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                                    paddingTop: '10px',
                                    fontSize: '11px'
                                }}
                            >
                                <span style={{ color: '#fbbf24', fontWeight: '700' }}>🏆 ₹30,000+ Prizes</span>
                                <span style={{ color: '#fbbf24', fontWeight: '600' }}>📍 Mech Arena</span>
                            </div>
                        </div>

                        <div 
                            className="mitra-event-card"
                            onClick={() => setTab('explore')}
                            style={{
                                background: 'linear-gradient(135deg, rgba(20, 27, 47, 0.85) 0%, rgba(10, 14, 26, 0.95) 100%)',
                                border: '1px solid rgba(255, 255, 255, 0.09)',
                                borderRadius: '16px',
                                padding: '14px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                                boxShadow: '0 6px 18px rgba(0, 0, 0, 0.35)'
                            }}
                        >
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span className="mitra-event-badge udbhav" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.35)', padding: '3px 8px', borderRadius: '6px', fontSize: '9.5px', fontWeight: '800' }}>UDBHAV '27</span>
                                    <span style={{ fontSize: '10px', color: '#c084fc', fontWeight: '700' }}>CONFERENCE</span>
                                </div>
                                <h4 className="mitra-event-name" style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '14px', fontWeight: '800', color: '#ffffff', margin: '0 0 6px 0' }}>National Conference</h4>
                                <p className="mitra-event-desc" style={{ fontSize: '11.5px', color: '#94a3b8', lineHeight: '1.4', margin: '0 0 12px 0' }}>Research paper presentation, technical symposium and keynote lectures.</p>
                            </div>
                            <div 
                                className="mitra-event-footer"
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                                    paddingTop: '10px',
                                    fontSize: '11px'
                                }}
                            >
                                <span style={{ color: '#fbbf24', fontWeight: '700' }}>📜 Certificates + Cash</span>
                                <span style={{ color: '#c084fc', fontWeight: '600' }}>📍 Seminar Hall</span>
                            </div>
                        </div>

                        <div 
                            className="mitra-event-card"
                            onClick={() => setTab('explore')}
                            style={{
                                background: 'linear-gradient(135deg, rgba(20, 27, 47, 0.85) 0%, rgba(10, 14, 26, 0.95) 100%)',
                                border: '1px solid rgba(255, 255, 255, 0.09)',
                                borderRadius: '16px',
                                padding: '14px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                                boxShadow: '0 6px 18px rgba(0, 0, 0, 0.35)'
                            }}
                        >
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span className="mitra-event-badge cultural" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6', border: '1px solid rgba(236, 72, 153, 0.35)', padding: '3px 8px', borderRadius: '6px', fontSize: '9.5px', fontWeight: '800' }}>RHYTHM '27</span>
                                    <span style={{ fontSize: '10px', color: '#f472b6', fontWeight: '700' }}>CULTURAL NIGHT</span>
                                </div>
                                <h4 className="mitra-event-name" style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '14px', fontWeight: '800', color: '#ffffff', margin: '0 0 6px 0' }}>Grand Cultural Night</h4>
                                <p className="mitra-event-desc" style={{ fontSize: '11.5px', color: '#94a3b8', lineHeight: '1.4', margin: '0 0 12px 0' }}>Singing, Dance, Battle of Bands, and high-voltage celebrity DJ performance.</p>
                            </div>
                            <div 
                                className="mitra-event-footer"
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                                    paddingTop: '10px',
                                    fontSize: '11px'
                                }}
                            >
                                <span style={{ color: '#fbbf24', fontWeight: '700' }}>🎤 Day 1 Evening</span>
                                <span style={{ color: '#f472b6', fontWeight: '600' }}>📍 Main Stage</span>
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
                <div className="mitra-pass-wrapper" style={{ textAlign: 'center', padding: '6px 0', maxWidth: '440px', margin: '0 auto' }}>
                    <div 
                        className="mitra-pass-card" 
                        style={{ 
                            background: 'linear-gradient(135deg, rgba(24, 32, 54, 0.95) 0%, rgba(10, 14, 25, 0.98) 100%)',
                            border: '1px solid rgba(251, 191, 36, 0.4)',
                            borderRadius: '22px',
                            padding: '22px 18px',
                            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)',
                            position: 'relative'
                        }}
                    >
                        <span 
                            style={{ 
                                display: 'inline-block',
                                fontFamily: 'Orbitron, sans-serif',
                                fontSize: '10px',
                                fontWeight: 900,
                                color: '#070a13',
                                background: 'linear-gradient(135deg, #fbbf24, #d4af37)',
                                padding: '4px 14px',
                                borderRadius: '12px',
                                letterSpacing: '1px',
                                marginBottom: '10px'
                            }}
                        >
                            OFFICIAL DIGITAL SQUAD PASS
                        </span>

                        <h3 style={{ margin: '4px 0', color: '#ffffff', fontSize: '18px', fontFamily: 'Orbitron, sans-serif', fontWeight: 800 }}>
                            {team?.teamName || 'Squad Pass'}
                        </h3>
                        <div style={{ display: 'inline-block', margin: '4px 0 12px 0' }}>
                            <span 
                                style={{ 
                                    fontFamily: 'Space Mono, monospace', 
                                    fontSize: '12.5px', 
                                    color: '#fbbf24', 
                                    fontWeight: 'bold',
                                    background: 'rgba(251, 191, 36, 0.1)',
                                    border: '1px solid rgba(251, 191, 36, 0.35)',
                                    padding: '3px 10px',
                                    borderRadius: '8px'
                                }}
                            >
                                SQUAD ID: {team?.teamId || 'SQUAD'}
                            </span>
                        </div>

                        <p style={{ margin: '0 0 14px 0', fontSize: '11px', color: '#94a3b8' }}>
                            {team?.college || 'SSGMCE Shegaon'} • {team?.event || 'National Tech Fest 2027'}
                        </p>

                        {/* HIGH CONTRAST QR SCANNER BOX */}
                        <div style={{
                            background: '#ffffff',
                            borderRadius: '18px',
                            padding: '14px',
                            display: 'inline-block',
                            margin: '4px 0 14px 0',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.55)'
                        }}>
                            {qrCodeUrl ? (
                                <img src={qrCodeUrl} alt="QR Pass" style={{ width: '200px', height: '200px', display: 'block' }} />
                            ) : (
                                <p style={{ color: '#000', fontSize: '12px', padding: '40px 20px' }}>Generating Dynamic QR...</p>
                            )}
                        </div>

                        {/* ACCESS BADGES */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '8px',
                            flexWrap: 'wrap',
                            margin: '4px 0 16px 0'
                        }}>
                            <span style={{ fontSize: '10.5px', fontWeight: 700, background: 'rgba(16,185,129,0.18)', color: '#34d399', border: '1px solid rgba(16,185,129,0.4)', padding: '4px 10px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                ✓ Main Gate Entry
                            </span>
                            <span style={{ fontSize: '10.5px', fontWeight: 700, background: 'rgba(251,191,36,0.18)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.4)', padding: '4px 10px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                🍽️ Mess Canteen Linked
                            </span>
                            <span style={{ fontSize: '10.5px', fontWeight: 700, background: 'rgba(56,189,248,0.18)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.4)', padding: '4px 10px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                🪑 Lab Workstation Assigned
                            </span>
                        </div>

                        <div style={{ fontSize: '10.5px', color: '#64748b', marginBottom: '14px' }}>
                            Leader: <strong style={{ color: '#cbd5e1' }}>{team?.leaderName || 'N/A'}</strong> ({team?.leaderPhone || 'N/A'})
                        </div>

                        <button 
                            className="mitra-save-btn" 
                            onClick={handleDownloadPass}
                            style={{
                                background: 'linear-gradient(135deg, #fbbf24 0%, #d4af37 100%)',
                                color: '#070a13',
                                border: 'none',
                                borderRadius: '12px',
                                padding: '12px 20px',
                                fontFamily: 'Orbitron, sans-serif',
                                fontSize: '12px',
                                fontWeight: 800,
                                letterSpacing: '0.8px',
                                cursor: 'pointer',
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 16px rgba(251, 191, 36, 0.35)'
                            }}
                        >
                            <FaDownload /> SAVE PASS TO PHONE (PNG)
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
