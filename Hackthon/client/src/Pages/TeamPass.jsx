import React, { useState } from 'react';
import { FaQrcode, FaDownload, FaUtensils, FaUserShield, FaArrowLeft, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import '../Styles/team_pass.css';

const TeamPass = () => {
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [teamData, setTeamData] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        if (!loginId.trim()) {
            setError('Please enter Team Name, Leader Phone, or Email.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/food/participant-pass`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identifier: loginId.trim(),
                    password: password.trim()
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setTeamData(data);
            } else {
                setError(data.error || 'Team not found. Please verify your phone number or email.');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Server connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const downloadPassImage = (participant, team) => {
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 800;
        const ctx = canvas.getContext('2d');

        // Dark gradient background
        const grad = ctx.createLinearGradient(0, 0, 600, 800);
        grad.addColorStop(0, '#0a0f1d');
        grad.addColorStop(1, '#070b14');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 600, 800);

        // Header band
        const headerGrad = ctx.createLinearGradient(0, 0, 600, 140);
        headerGrad.addColorStop(0, '#0ea5e9');
        headerGrad.addColorStop(1, '#6366f1');
        ctx.fillStyle = headerGrad;
        ctx.fillRect(0, 0, 600, 140);

        // Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 30px "Orbitron", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('NAVONMESH 2027', 300, 60);

        ctx.font = '16px Arial, sans-serif';
        ctx.fillStyle = '#e0f2fe';
        ctx.fillText('OFFICIAL DIGITAL MEAL PASS', 300, 95);

        // Team & Name Box
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 26px Arial, sans-serif';
        ctx.fillText(participant.name, 300, 200);

        ctx.font = '18px Arial, sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`${participant.role} • Team: ${team.teamName}`, 300, 235);

        ctx.font = '14px Arial, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(participant.college || 'SSGMCE Shegaon', 300, 265);

        // QR Code
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            // White card for QR
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.roundRect(160, 300, 280, 280, 16);
            ctx.fill();

            ctx.drawImage(img, 175, 315, 250, 250);

            // Participant ID
            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 18px monospace';
            ctx.fillText(participant.participantId, 300, 620);

            // Rules
            ctx.fillStyle = '#94a3b8';
            ctx.font = '13px Arial, sans-serif';
            ctx.fillText('Valid for 1 scan per meal slot (Breakfast, Lunch, Dinner)', 300, 665);
            ctx.fillText('Breakfast: 8-9:30 AM | Lunch: 11 AM-2 PM | Dinner: 7-9:30 PM', 300, 690);

            // Trigger download
            const a = document.createElement('a');
            a.download = `MealPass_${participant.name.replace(/\s+/g, '_')}.png`;
            a.href = canvas.toDataURL('image/png');
            a.click();
        };
        img.src = participant.qrCodeUrl;
    };

    return (
        <div className="team-pass-page-container">
            {!teamData ? (
                <div className="team-pass-login-card">
                    <div className="pass-logo-badge">
                        <FaUtensils />
                    </div>
                    <h2>Participant Meal Passes</h2>
                    <p className="subtitle">
                        Login to access and download your team's individual dynamic QR meal passes for Navonmesh 2027.
                    </p>

                    <form onSubmit={handleLogin} className="pass-login-form">
                        {error && <div className="pass-error-alert">{error}</div>}

                        <div className="input-field-group">
                            <label>Team Identifier</label>
                            <input
                                type="text"
                                placeholder="Enter Leader Phone, Email, or Team Name"
                                value={loginId}
                                onChange={(e) => setLoginId(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="input-field-group">
                            <label>Password <span className="hint">(Default: Leader Phone number)</span></label>
                            <input
                                type="password"
                                placeholder="Enter password (default: Leader Phone)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button type="submit" className="login-pass-btn" disabled={loading}>
                            {loading ? 'RETRIEVING PASSES...' : 'VIEW TEAM PASSES'}
                        </button>
                    </form>

                    <div className="login-note-box">
                        💡 <strong>How it works:</strong> Each participant has their own unique QR code. The exact same QR automatically unlocks for Breakfast, Lunch, and Dinner at the mess counter!
                    </div>
                </div>
            ) : (
                <div className="team-passes-view">
                    <div className="passes-top-bar">
                        <button className="back-btn" onClick={() => setTeamData(null)}>
                            <FaArrowLeft /> Switch Team
                        </button>
                        <div className="team-header-info">
                            <h2>{teamData.team.teamName}</h2>
                            <p>{teamData.team.event} • {teamData.team.college || 'SSGMCE Shegaon'}</p>
                        </div>
                    </div>

                    <div className="meal-timings-strip">
                        <div className="time-pill">🌅 <strong>Breakfast:</strong> 08:00 AM – 09:30 AM</div>
                        <div className="time-pill">🍛 <strong>Lunch:</strong> 11:00 AM – 02:00 PM</div>
                        <div className="time-pill">🌙 <strong>Dinner:</strong> 07:00 PM – 09:30 PM</div>
                    </div>

                    <div className="passes-cards-grid">
                        {teamData.participants.map((p, idx) => (
                            <div key={p.participantId || idx} className="individual-pass-card">
                                <div className="pass-card-header">
                                    <div className="pass-role-tag">{p.role}</div>
                                    <span className="pass-id-chip">{p.participantId}</span>
                                </div>

                                <div className="pass-participant-info">
                                    <h3>{p.name}</h3>
                                    <p className="college-sub">{p.college}</p>
                                </div>

                                <div className="pass-qr-frame">
                                    <img src={p.qrCodeUrl} alt={`${p.name} QR Pass`} className="qr-image" />
                                    <span className="qr-badge">Single Dynamic QR</span>
                                </div>

                                {/* Today's Status */}
                                <div className="today-meal-status">
                                    <span className="status-label">Today's Meals:</span>
                                    <div className="meal-indicators">
                                        <span className={`meal-indicator ${p.todayMeals.breakfast ? 'claimed' : 'available'}`}>
                                            {p.todayMeals.breakfast ? <FaCheckCircle /> : '○'} Breakfast
                                        </span>
                                        <span className={`meal-indicator ${p.todayMeals.lunch ? 'claimed' : 'available'}`}>
                                            {p.todayMeals.lunch ? <FaCheckCircle /> : '○'} Lunch
                                        </span>
                                        <span className={`meal-indicator ${p.todayMeals.dinner ? 'claimed' : 'available'}`}>
                                            {p.todayMeals.dinner ? <FaCheckCircle /> : '○'} Dinner
                                        </span>
                                    </div>
                                </div>

                                <button
                                    className="download-pass-btn"
                                    onClick={() => downloadPassImage(p, teamData.team)}
                                >
                                    <FaDownload /> DOWNLOAD DIGITAL PASS
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamPass;
