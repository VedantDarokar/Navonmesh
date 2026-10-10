import React, { useState, useEffect } from 'react';
import { 
    FaShieldAlt, FaUser, FaLock, FaQrcode, FaClock, FaChartBar, FaChair, 
    FaPalette, FaSignOutAlt, FaCheckCircle, FaExclamationTriangle, FaUsers, 
    FaRocket, FaCompass, FaCalendarAlt
} from 'react-icons/fa';
import '../Styles/coordinator_app.css';
import '../Styles/coordinator_duty_portal.css';
import '../Styles/participant_portal.css';
import navonmeshLogo from '../assets/navonmesh_official_logo.png';
import { getApiUrl } from '../utils/apiConfig';

// Import Duty Components & Participant Portal
import Admin from './Admin';
import FoodScannerPage from './FoodScannerPage';
import BreakTimer from './BreakTimer';
import EventDayAdmin from './EventDayAdmin';
import ParticipantPortal from './ParticipantPortal';
import CoordinatorDutyPortal from './CoordinatorDutyPortal';

const CoordinatorApp = () => {
    // Role selection for login: 'participant' | 'coordinator'
    const [loginRole, setLoginRole] = useState('participant');

    // Session State
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState(null); // 'participant' | 'coordinator'
    const [teamData, setTeamData] = useState(null);

    // Form inputs
    const [loginData, setLoginData] = useState({ id: '', password: '' });
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [lockoutTimer, setLockoutTimer] = useState(0);

    // Active Tab for Coordinator ('scanner' | 'timer' | 'event-day' | 'dashboard')
    const [activeTab, setActiveTab] = useState('scanner');

    // Theme Engine ('theme-gold' | 'theme-emerald' | 'theme-nebula')
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('coor_theme') || 'theme-gold';
    });

    const API_URL = getApiUrl();

    // Verify existing session on mount
    useEffect(() => {
        const adminToken = sessionStorage.getItem('adminToken');
        const teamToken = sessionStorage.getItem('teamToken');
        const rawTeam = sessionStorage.getItem('teamData');

        if (adminToken) {
            setIsLoggedIn(true);
            setUserRole('coordinator');
        } else if (teamToken && rawTeam) {
            try {
                const parsed = JSON.parse(rawTeam);
                setTeamData(parsed);
                setIsLoggedIn(true);
                setUserRole('participant');
            } catch (e) {
                // Ignore parse error
            }
        }
    }, []);

    // Rate-limit lockout countdown
    useEffect(() => {
        if (lockoutTimer > 0) {
            const timer = setTimeout(() => setLockoutTimer(prev => prev - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [lockoutTimer]);

    const handleThemeToggle = () => {
        const themes = ['theme-gold', 'theme-emerald', 'theme-nebula'];
        const nextIdx = (themes.indexOf(theme) + 1) % themes.length;
        const nextTheme = themes[nextIdx];
        setTheme(nextTheme);
        localStorage.setItem('coor_theme', nextTheme);
    };

    const getThemeLabel = () => {
        if (theme === 'theme-gold') return 'Gold';
        if (theme === 'theme-emerald') return 'Emerald';
        return 'Nebula';
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (lockoutTimer > 0) return;

        setLoginError('');
        setLoginLoading(true);

        try {
            if (loginRole === 'participant') {
                // Participant Squad Login
                const res = await fetch(`${API_URL}/api/team/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        identifier: loginData.id.trim(),
                        password: loginData.password.trim()
                    })
                });

                const data = await res.json();
                if (res.ok && data.success) {
                    sessionStorage.setItem('teamToken', 'team_active_' + (data.team.id || data.team._id));
                    sessionStorage.setItem('teamData', JSON.stringify(data.team));
                    sessionStorage.setItem('teamId', data.team.teamId);
                    setTeamData(data.team);
                    setUserRole('participant');
                    setIsLoggedIn(true);
                    setFailedAttempts(0);
                } else {
                    handleLoginFailure(data.error || 'Invalid Team ID or Password. Default password is leader phone number.');
                }
            } else {
                // Coordinator Duty Login
                const res = await fetch(`${API_URL}/api/admin/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: loginData.id.trim(),
                        password: loginData.password.trim()
                    })
                });

                const data = await res.json();
                if (res.ok && data.success) {
                    sessionStorage.setItem('adminToken', data.token);
                    sessionStorage.setItem('adminName', data.adminInfo.name);
                    sessionStorage.setItem('adminSubRole', data.adminInfo.subRole);
                    sessionStorage.setItem('adminId', loginData.id);
                    setUserRole('coordinator');
                    setIsLoggedIn(true);
                    setFailedAttempts(0);
                    setActiveTab('scanner');
                } else {
                    handleLoginFailure(data.message || 'Invalid coordinator credentials.');
                }
            }
        } catch (err) {
            setLoginError('Server connection failed. Please verify internet connection.');
        } finally {
            setLoginLoading(false);
        }
    };

    const handleLoginFailure = (msg) => {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);
        if (newAttempts >= 5) {
            setLockoutTimer(30);
            setLoginError('Too many failed attempts. Security cooldown active (30s).');
        } else {
            setLoginError(msg);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('adminToken');
        sessionStorage.removeItem('adminName');
        sessionStorage.removeItem('adminSubRole');
        sessionStorage.removeItem('adminId');
        sessionStorage.removeItem('teamToken');
        sessionStorage.removeItem('teamData');
        sessionStorage.removeItem('teamId');
        setIsLoggedIn(false);
        setUserRole(null);
        setTeamData(null);
        setLoginData({ id: '', password: '' });
        setActiveTab('scanner');
    };

    const adminSubRole = sessionStorage.getItem('adminSubRole') || 'Coordinator';

    return (
        <div className={`coordinator-app-container ${theme}`}>
            {/* TOP APP HEADER */}
            <header className="coor-header">
                <div className="coor-header-brand">
                    <div className="coor-header-logo-box">
                        <img src={navonmeshLogo} alt="Navonmesh Logo" className="coor-header-logo-img" />
                    </div>
                    <div>
                        <h1 className="coor-brand-title">NAVONMESH MITRA</h1>
                        <p className="coor-brand-sub">
                            {isLoggedIn 
                                ? (userRole === 'participant' ? `SQUAD: ${teamData?.teamName?.toUpperCase() || 'PORTAL'}` : `DUTY: ${adminSubRole.toUpperCase()}`)
                                : 'FEST COMPANION'}
                        </p>
                    </div>
                </div>

                <div className="coor-header-actions">
                    {/* Theme Switcher Button */}
                    <button
                        className="coor-theme-btn"
                        onClick={handleThemeToggle}
                        title="Change App Theme"
                    >
                        <FaPalette style={{ fontSize: '10px' }} />
                        <span>{getThemeLabel()}</span>
                    </button>

                    {/* Logout Button */}
                    {isLoggedIn && (
                        <button
                            className="coor-logout-btn"
                            onClick={handleLogout}
                            title="Log Out"
                        >
                            <FaSignOutAlt style={{ fontSize: '10px' }} />
                            <span>Exit</span>
                        </button>
                    )}
                </div>
            </header>

            {/* PRE-LOGIN VIEW: ROLE SELECTION & AUTHENTICATION */}
            {!isLoggedIn ? (
                <main className="coor-auth-view">
                    <div className="coor-auth-card">
                        <div className="coor-auth-logo-frame">
                            <img src={navonmeshLogo} alt="Navonmesh Mitra" className="coor-auth-logo-img" />
                        </div>

                        <h2 className="coor-auth-heading">NAVONMESH MITRA</h2>
                        <p className="coor-auth-subtext">Official Technical Fest Companion • SSGMCE</p>

                        {/* ROLE SELECTOR TABS */}
                        <div style={{
                            display: 'flex',
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid var(--coor-card-border)',
                            borderRadius: '12px',
                            padding: '3px',
                            marginBottom: '16px'
                        }}>
                            <button
                                type="button"
                                onClick={() => { setLoginRole('participant'); setLoginError(''); }}
                                style={{
                                    flex: 1,
                                    padding: '8px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: loginRole === 'participant' ? 'var(--coor-accent-bright)' : 'transparent',
                                    color: loginRole === 'participant' ? '#000' : 'var(--coor-text-sub)',
                                    fontFamily: 'var(--coor-display-font)',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px'
                                }}
                            >
                                <FaRocket /> Squad / Team
                            </button>
                            <button
                                type="button"
                                onClick={() => { setLoginRole('coordinator'); setLoginError(''); }}
                                style={{
                                    flex: 1,
                                    padding: '8px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: loginRole === 'coordinator' ? 'var(--coor-accent-bright)' : 'transparent',
                                    color: loginRole === 'coordinator' ? '#000' : 'var(--coor-text-sub)',
                                    fontFamily: 'var(--coor-display-font)',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px'
                                }}
                            >
                                <FaShieldAlt /> Coordinator
                            </button>
                        </div>

                        <div className="coor-badge-security">
                            <FaShieldAlt />
                            <span>256-BIT ENCRYPTED SESSION</span>
                        </div>

                        {loginError && (
                            <div className="coor-auth-error">
                                <FaExclamationTriangle />
                                <span>{loginError}</span>
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="coor-auth-form">
                            <div className="coor-input-group">
                                <label className="coor-input-label">
                                    {loginRole === 'participant' ? 'Team ID / Leader Phone / Email' : 'Coordinator ID / Passcode'}
                                </label>
                                <div className="coor-input-wrapper">
                                    <FaUser className="coor-input-icon" />
                                    <input
                                        type="text"
                                        placeholder={loginRole === 'participant' ? 'e.g. SQUAD001 or phone' : 'e.g. nihal.navonmesh'}
                                        className="coor-input-field"
                                        value={loginData.id}
                                        onChange={(e) => setLoginData({ ...loginData, id: e.target.value })}
                                        required
                                        autoCapitalize="none"
                                        autoCorrect="off"
                                    />
                                </div>
                            </div>

                            <div className="coor-input-group">
                                <label className="coor-input-label">
                                    Password {loginRole === 'participant' && <span style={{ opacity: 0.7 }}>(Default: Leader Phone)</span>}
                                </label>
                                <div className="coor-input-wrapper">
                                    <FaLock className="coor-input-icon" />
                                    <input
                                        type="password"
                                        placeholder="Enter password"
                                        className="coor-input-field"
                                        value={loginData.password}
                                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="coor-auth-submit-btn"
                                disabled={loginLoading || lockoutTimer > 0}
                            >
                                <FaCheckCircle />
                                <span>
                                    {lockoutTimer > 0
                                        ? `LOCKED (${lockoutTimer}s)`
                                        : loginLoading
                                        ? 'AUTHENTICATING...'
                                        : loginRole === 'participant' ? 'ENTER SQUAD PORTAL' : 'VERIFY & ENTER DUTY'}
                                </span>
                            </button>
                        </form>

                        <p className="coor-auth-footer-note">
                            {loginRole === 'participant' 
                                ? 'Participants can manage squad details, download QR passes, check live schedules, and raise help tickets.'
                                : 'Coordinator access is monitored. Unauthorized duty access is logged with timestamp and device ID.'}
                        </p>
                    </div>
                </main>
            ) : userRole === 'participant' ? (
                /* ================= PARTICIPANT / SQUAD PORTAL ================= */
                <ParticipantPortal teamData={teamData} onLogout={handleLogout} />
            ) : (
                /* ================= COORDINATOR DUTY PORTAL ================= */
                <CoordinatorDutyPortal onLogout={handleLogout} />
            )}
        </div>
    );
};

export default CoordinatorApp;
