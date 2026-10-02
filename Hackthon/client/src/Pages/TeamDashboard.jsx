import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserShield, FaUsers, FaQrcode, FaLock, FaSave, FaSignOutAlt, FaPlus, FaTrash, FaCheckCircle, FaExclamationTriangle, FaUtensils, FaClock, FaDownload } from 'react-icons/fa';
import '../Styles/team_dashboard.css';
import '../Styles/team_pass.css';

const TeamDashboard = () => {
    const navigate = useNavigate();
    const [team, setTeam] = useState(null);
    const [activeTab, setActiveTab] = useState('members'); // 'members' | 'passes' | 'security'
    const [loading, setLoading] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState('');
    const [saveError, setSaveError] = useState('');

    // Passes state
    const [passesData, setPassesData] = useState(null);
    const [passesLoading, setPassesLoading] = useState(false);

    // Editable form state
    const [teamName, setTeamName] = useState('');
    const [college, setCollege] = useState('');
    const [leaderName, setLeaderName] = useState('');
    const [leaderPhone, setLeaderPhone] = useState('');
    const [problemStatement, setProblemStatement] = useState('');
    const [members, setMembers] = useState([]);

    // Security state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passMsg, setPassMsg] = useState('');
    const [passErr, setPassErr] = useState('');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const raw = sessionStorage.getItem('teamData');
        if (!raw) {
            navigate('/team-login');
            return;
        }
        try {
            const data = JSON.parse(raw);
            loadTeamProfile(data.id || data._id);
        } catch (e) {
            navigate('/team-login');
        }
    }, []);

    const loadTeamProfile = async (id) => {
        try {
            const res = await fetch(`${API_URL}/api/team/profile/${id}`);
            const data = await res.json();
            if (res.ok && data.success) {
                setTeam(data.team);
                sessionStorage.setItem('teamData', JSON.stringify(data.team));

                // Populate form
                setTeamName(data.team.teamName || '');
                setCollege(data.team.college || '');
                setLeaderName(data.team.leaderName || '');
                setLeaderPhone(data.team.leaderPhone || '');
                setProblemStatement(data.team.problemStatement || '');
                setMembers(data.team.members || []);

                // Load dynamic passes for this team
                loadPasses(data.team.teamId || data.team.leaderPhone);
            }
        } catch (e) {
            console.error('Failed to reload team profile:', e);
        }
    };

    const loadPasses = async (identifier) => {
        const targetId = identifier || team?.teamId || team?.id || team?._id || team?.leaderPhone;
        if (!targetId) return;
        setPassesLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/food/participant-pass`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identifier: String(targetId).trim(),
                    teamId: team?.teamId,
                    id: team?.id || team?._id
                })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setPassesData(data);
            }
        } catch (e) {
            console.error('Passes load error:', e);
        } finally {
            setPassesLoading(false);
        }
    };

    const downloadPassImage = (participant, currentTeam) => {
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

        // Participant Name
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 26px Arial, sans-serif';
        ctx.fillText(participant.name, 300, 200);

        // Role & Team
        ctx.font = '18px Arial, sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`${participant.role} • Team: ${currentTeam?.teamName || team?.teamName || ''}`, 300, 235);

        // College
        ctx.font = '14px Arial, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(participant.college || team?.college || 'SSGMCE Shegaon', 300, 265);

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

    const downloadAllPasses = () => {
        if (!passesData || !passesData.participants) return;
        passesData.participants.forEach((p, idx) => {
            setTimeout(() => {
                downloadPassImage(p, passesData.team || team);
            }, idx * 400);
        });
    };

    const handleLogout = () => {
        sessionStorage.removeItem('teamToken');
        sessionStorage.removeItem('teamData');
        sessionStorage.removeItem('teamId');
        navigate('/team-login');
    };

    // Member array operations
    const handleMemberChange = (index, field, value) => {
        const updated = [...members];
        updated[index] = { ...updated[index], [field]: value };
        setMembers(updated);
    };

    const handleAddMember = () => {
        if (members.length >= 3) {
            alert('A maximum of 4 total members (1 Leader + 3 Members) is permitted.');
            return;
        }
        setMembers([...members, { name: '', email: '', phone: '', college: college || '' }]);
    };

    const handleRemoveMember = (index) => {
        if (window.confirm('Are you sure you want to remove this member?')) {
            const updated = members.filter((_, i) => i !== index);
            setMembers(updated);
        }
    };

    // Submit Updates
    const handleSaveUpdates = async (e) => {
        e.preventDefault();
        setSaveSuccess('');
        setSaveError('');
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/team/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    teamId: team.teamId || team.id,
                    teamName,
                    leaderName,
                    leaderPhone,
                    college,
                    members,
                    problemStatement
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setSaveSuccess(data.message);
                loadTeamProfile(team.id || team._id);
                loadPasses(team.teamId || team.leaderPhone || team.id);
            } else {
                setSaveError(data.error || 'Failed to update team details.');
            }
        } catch (err) {
            setSaveError('Network error saving updates.');
        } finally {
            setLoading(false);
        }
    };

    // Handle Password Change
    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPassMsg('');
        setPassErr('');

        if (!currentPassword || !newPassword) {
            setPassErr('Please fill in both current and new password.');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/team/change-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    teamId: team.teamId || team.id,
                    currentPassword,
                    newPassword
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setPassMsg('✅ Password changed successfully!');
                setCurrentPassword('');
                setNewPassword('');
            } else {
                setPassErr(data.error || 'Failed to change password.');
            }
        } catch (err) {
            setPassErr('Network error updating password.');
        }
    };

    if (!team) {
        return (
            <div className="team-dashboard-loading">
                <div className="loader-orbit"></div>
                <p>Retrieving Team Roster...</p>
            </div>
        );
    }

    const isPsLocked = (team.psChangeCount || 0) >= 1;
    const isDeadlinePassed = team.psDeadline && new Date() > new Date(team.psDeadline);

    return (
        <div className="team-dashboard-container">
            {/* Header Strip */}
            <header className="team-dash-header">
                <div className="header-team-badge">
                    <span className="squad-id-pill">{team.teamId || 'TEAM'}</span>
                    <div>
                        <h2>{team.teamName}</h2>
                        <p className="event-meta">{team.event} • Navonmesh {team.edition || '2027'}</p>
                    </div>
                </div>

                <div className="dash-header-actions">
                    <div className="dash-nav-pills">
                        <button
                            className={`dash-tab-btn ${activeTab === 'members' ? 'active' : ''}`}
                            onClick={() => setActiveTab('members')}
                        >
                            <FaUsers /> Team Roster & Details
                        </button>
                        <button
                            className={`dash-tab-btn ${activeTab === 'passes' ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab('passes');
                                loadPasses(team?.teamId || team?.leaderPhone || team?.id);
                            }}
                        >
                            <FaQrcode /> Meal Passes (QR)
                        </button>
                        <button
                            className={`dash-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
                            onClick={() => setActiveTab('security')}
                        >
                            <FaLock /> Security
                        </button>
                    </div>

                    <button className="team-logout-btn" onClick={handleLogout} title="Logout">
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </header>

            {/* Main Content Body */}
            <main className="team-dash-content">
                {saveSuccess && (
                    <div className="dash-alert success">
                        <FaCheckCircle /> {saveSuccess}
                    </div>
                )}
                {saveError && (
                    <div className="dash-alert error">
                        <FaExclamationTriangle /> {saveError}
                    </div>
                )}

                {/* Tab 1: Members & Details */}
                {activeTab === 'members' && (
                    <form onSubmit={handleSaveUpdates} className="team-update-form">
                        {/* Section: General Info */}
                        <div className="dash-card">
                            <h3 className="section-title">General Team Information</h3>
                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label>Team Name</label>
                                    <input
                                        type="text"
                                        value={teamName}
                                        onChange={(e) => setTeamName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>College / Institution</label>
                                    <input
                                        type="text"
                                        value={college}
                                        onChange={(e) => setCollege(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section: Problem Statement (SINGLE-USE CHANGE RULE) */}
                        {team.event && team.event.includes('Srijan') && (
                            <div className="dash-card ps-card">
                                <div className="ps-card-header">
                                    <div>
                                        <h3 className="section-title">Problem Statement Track</h3>
                                        <p className="ps-rule-text">
                                            ⚠️ <strong>Strict Rule:</strong> Changing problem statement is permitted <strong>ONLY ONCE</strong> per team before the event deadline.
                                        </p>
                                    </div>
                                    <span className={`ps-quota-badge ${isPsLocked ? 'locked' : 'available'}`}>
                                        {isPsLocked ? '🔒 Change Quota Used (Locked)' : '✓ 1 Change Available'}
                                    </span>
                                </div>

                                <div className="ps-input-group">
                                    <select
                                        value={problemStatement}
                                        onChange={(e) => setProblemStatement(e.target.value)}
                                        disabled={isPsLocked || isDeadlinePassed}
                                        className={`ps-select ${isPsLocked ? 'disabled' : ''}`}
                                    >
                                        <option value="Student Innovation">Student Innovation (Open Innovation)</option>
                                        <option value="Problem Statement 1">Problem Statement 1 (Coming Soon)</option>
                                        <option value="Problem Statement 2">Problem Statement 2 (Coming Soon)</option>
                                    </select>

                                    {isPsLocked && (
                                        <div className="locked-explainer">
                                            🔒 Your team has already exercised its 1-time change quota to <strong>{problemStatement}</strong>. Changes can no longer be made.
                                        </div>
                                    )}
                                    {isDeadlinePassed && !isPsLocked && (
                                        <div className="locked-explainer deadline">
                                            ⏰ Problem statement editing window closed on {new Date(team.psDeadline).toLocaleDateString()}.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Section: Team Leader */}
                        <div className="dash-card">
                            <h3 className="section-title">Team Leader Details</h3>
                            <div className="form-grid-3">
                                <div className="form-group">
                                    <label>Leader Name</label>
                                    <input
                                        type="text"
                                        value={leaderName}
                                        onChange={(e) => setLeaderName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Leader Mobile Number</label>
                                    <input
                                        type="tel"
                                        value={leaderPhone}
                                        onChange={(e) => setLeaderPhone(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Leader Email (Identity Anchor - Immutable)</label>
                                    <input
                                        type="email"
                                        value={team.leaderEmail}
                                        disabled
                                        className="locked-email-input"
                                        title="Leader email cannot be changed as it is your official verified team account"
                                    />
                                    <span className="email-lock-hint">🔒 Fixed registered address</span>
                                </div>
                            </div>
                        </div>

                        {/* Section: Team Members */}
                        <div className="dash-card">
                            <div className="members-section-header">
                                <div>
                                    <h3 className="section-title">Team Members ({members.length})</h3>
                                    <p className="ps-rule-text">You can add, edit, or swap members and update their contact numbers.</p>
                                </div>
                                {members.length < 3 && (
                                    <button type="button" className="add-member-btn" onClick={handleAddMember}>
                                        <FaPlus /> Add Team Member
                                    </button>
                                )}
                            </div>

                            <div className="members-inputs-list">
                                {members.length === 0 ? (
                                    <div className="no-members-box">
                                        No additional members registered yet. Click "Add Team Member" above to add your crew.
                                    </div>
                                ) : (
                                    members.map((m, idx) => (
                                        <div key={idx} className="member-form-row">
                                            <div className="member-index-pill">Member {idx + 2}</div>
                                            <div className="member-fields-grid">
                                                <div className="form-group">
                                                    <label>Full Name</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Full Name"
                                                        value={m.name || ''}
                                                        onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Email Address</label>
                                                    <input
                                                        type="email"
                                                        placeholder="Email Address"
                                                        value={m.email || ''}
                                                        onChange={(e) => handleMemberChange(idx, 'email', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Mobile Number</label>
                                                    <input
                                                        type="tel"
                                                        placeholder="10-digit Phone"
                                                        value={m.phone || ''}
                                                        onChange={(e) => handleMemberChange(idx, 'phone', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                className="remove-member-btn"
                                                onClick={() => handleRemoveMember(idx)}
                                                title="Remove this member"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Save Action */}
                        <div className="form-submit-bar">
                            <button type="submit" className="save-changes-btn" disabled={loading}>
                                <FaSave /> {loading ? 'SAVING UPDATES...' : 'SAVE ALL TEAM CHANGES'}
                            </button>
                            <span className="sync-notice">Changes instantly update the admin dashboard roster.</span>
                        </div>
                    </form>
                )}

                {/* Tab 2: Meal Passes */}
                {activeTab === 'passes' && (
                    <div className="passes-tab-wrapper" style={{ width: '100%', maxWidth: '1200px' }}>
                        <div className="dash-card" style={{ marginBottom: '24px' }}>
                            <div className="meal-hub-intro" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                                <div>
                                    <h3 className="section-title" style={{ margin: 0 }}><FaUtensils /> Team Member Meal Passes</h3>
                                    <p className="ps-rule-text" style={{ marginTop: '8px' }}>
                                        Every participant has an individual digital pass featuring their registered name and dynamic QR code. Present this QR at the mess/canteen counter during meal hours.
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    <button
                                        type="button"
                                        style={{
                                            background: 'linear-gradient(135deg, #10b981, #059669)',
                                            color: '#fff',
                                            border: 'none',
                                            padding: '11px 20px',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontFamily: 'Orbitron, sans-serif',
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            boxShadow: '0 0 15px rgba(16, 185, 129, 0.35)'
                                        }}
                                        onClick={downloadAllPasses}
                                        disabled={!passesData || passesLoading}
                                    >
                                        <FaDownload /> DOWNLOAD ALL PASSES
                                    </button>
                                </div>
                            </div>

                            <div className="meal-timings-strip" style={{ marginTop: '16px' }}>
                                <div className="time-pill">🌅 <strong>Breakfast:</strong> 08:00 AM – 09:30 AM</div>
                                <div className="time-pill">🍛 <strong>Lunch:</strong> 11:00 AM – 02:00 PM</div>
                                <div className="time-pill">🌙 <strong>Dinner:</strong> 07:00 PM – 09:30 PM</div>
                            </div>
                        </div>

                        {passesLoading ? (
                            <div style={{ textAlign: 'center', padding: '50px', color: '#38bdf8' }}>
                                <div className="loader-orbit" style={{ margin: '0 auto 16px auto' }}></div>
                                <p>Generating participant passes with latest member details...</p>
                            </div>
                        ) : passesData && passesData.participants && passesData.participants.length > 0 ? (
                            <div className="passes-cards-grid">
                                {passesData.participants.map((p, idx) => (
                                    <div key={p.participantId || idx} className="individual-pass-card">
                                        <div className="pass-card-header">
                                            <div className="pass-role-tag">{p.role}</div>
                                            <span className="pass-id-chip">{p.participantId}</span>
                                        </div>

                                        <div className="pass-participant-info">
                                            <h3>{p.name}</h3>
                                            <p className="college-sub">{p.college || team.college || 'SSGMCE Shegaon'}</p>
                                        </div>

                                        <div className="pass-qr-frame">
                                            <img src={p.qrCodeUrl} alt={`${p.name} QR Pass`} className="qr-image" />
                                            <span className="qr-badge">Single Dynamic QR</span>
                                        </div>

                                        {/* Today's Status */}
                                        <div className="today-meal-status">
                                            <span className="status-label">Today's Meals:</span>
                                            <div className="meal-indicators">
                                                <span className={`meal-indicator ${p.todayMeals?.breakfast ? 'claimed' : 'available'}`}>
                                                    {p.todayMeals?.breakfast ? <FaCheckCircle /> : '○'} Breakfast
                                                </span>
                                                <span className={`meal-indicator ${p.todayMeals?.lunch ? 'claimed' : 'available'}`}>
                                                    {p.todayMeals?.lunch ? <FaCheckCircle /> : '○'} Lunch
                                                </span>
                                                <span className={`meal-indicator ${p.todayMeals?.dinner ? 'claimed' : 'available'}`}>
                                                    {p.todayMeals?.dinner ? <FaCheckCircle /> : '○'} Dinner
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            className="download-pass-btn"
                                            onClick={() => downloadPassImage(p, passesData.team || team)}
                                        >
                                            <FaDownload /> DOWNLOAD PASS ({p.name.split(' ')[0]})
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                <p style={{ marginBottom: '14px', fontSize: '0.95rem' }}>
                                    No passes loaded yet or generation in progress.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => loadPasses(team?.teamId || team?.leaderPhone || team?.id)}
                                    style={{
                                        background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                                        color: '#fff',
                                        border: 'none',
                                        padding: '10px 22px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontFamily: 'Orbitron, sans-serif',
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold',
                                        letterSpacing: '1px',
                                        boxShadow: '0 0 15px rgba(2, 132, 199, 0.4)'
                                    }}
                                >
                                    🔄 REFRESH / GENERATE QR PASSES
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab 3: Security & Password */}
                {activeTab === 'security' && (
                    <div className="security-tab-wrapper">
                        <div className="dash-card">
                            <h3 className="section-title"><FaLock /> Update Team Password</h3>
                            <p className="ps-rule-text">
                                Change your team password. All participants with your Team ID (<strong>{team.teamId}</strong>) will use this password to access this portal.
                            </p>

                            {passMsg && <div className="dash-alert success">{passMsg}</div>}
                            {passErr && <div className="dash-alert error">{passErr}</div>}

                            <form onSubmit={handleChangePassword} className="change-pass-form">
                                <div className="form-group">
                                    <label>Current Password</label>
                                    <input
                                        type="password"
                                        placeholder="Enter current password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>New Password (min 6 characters)</label>
                                    <input
                                        type="password"
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="save-pass-btn">
                                    UPDATE PASSWORD
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default TeamDashboard;
