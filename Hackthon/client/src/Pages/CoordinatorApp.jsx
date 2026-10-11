import React, { useState, useEffect } from 'react';
import { 
    FaShieldAlt, FaUser, FaLock, FaQrcode, FaClock, FaChartBar, FaChair, 
    FaPalette, FaSignOutAlt, FaCheckCircle, FaExclamationTriangle, FaUsers, 
    FaRocket, FaCompass, FaCalendarAlt, FaEye, FaEyeSlash, FaSun, FaMoon
} from 'react-icons/fa';
import '../Styles/coordinator_app.css';
import '../Styles/coordinator_duty_portal.css';
import '../Styles/participant_portal.css';
import navonmeshDarkLogo from '../assets/navonmesh_official_logo.png';
import navonmeshBlackLogo from '../assets/navonmesh_black_logo.png';
import { getApiUrl } from '../utils/apiConfig';
import { getCoordinatorProfile } from '../utils/coordinatorProfiles';
import authStorage from '../utils/authStorage';
import { App as CapacitorApp } from '@capacitor/app';

// Import Duty Components & Participant Portal
import Admin from './Admin';
import FoodScannerPage from './FoodScannerPage';
import BreakTimer from './BreakTimer';
import EventDayAdmin from './EventDayAdmin';
import ParticipantPortal from './ParticipantPortal';
import CoordinatorDutyPortal from './CoordinatorDutyPortal';
import NavonmeshAppSplash from '../Components/NavonmeshAppSplash';
import AppPermissionsModal from '../Components/AppPermissionsModal';

const CoordinatorApp = () => {
    // App Launch Splash Screen (Blinkit-style opening)
    const [showSplash, setShowSplash] = useState(true);

    // First Launch Device Permissions Modal
    const [showPermissionsModal, setShowPermissionsModal] = useState(() => {
        return !localStorage.getItem('navonmesh_permissions_requested');
    });

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
    const [showPassword, setShowPassword] = useState(false);

    // Active Tab for Coordinator ('scanner' | 'timer' | 'event-day' | 'dashboard')
    const [activeTab, setActiveTab] = useState('scanner');

    // Theme Engine ('theme-light' [Default] | 'theme-dark')
    const [theme, setTheme] = useState(() => {
        // Always default to light theme; preserve user toggle preference but reset if stale dark
        const saved = localStorage.getItem('coor_theme');
        if (!saved) {
            localStorage.setItem('coor_theme', 'theme-light');
            return 'theme-light';
        }
        return saved;
    });

    const API_URL = getApiUrl();

    // Verify existing persistent session on mount (survives closing the app)
    useEffect(() => {
        const adminSession = authStorage.getAdminSession();
        const teamSession = authStorage.getTeamSession();

        if (adminSession) {
            setIsLoggedIn(true);
            setUserRole('coordinator');
        } else if (teamSession) {
            setTeamData(teamSession.teamData);
            setIsLoggedIn(true);
            setUserRole('participant');
        }
    }, []);

    // Rate-limit lockout countdown
    useEffect(() => {
        if (lockoutTimer > 0) {
            const timer = setTimeout(() => setLockoutTimer(prev => prev - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [lockoutTimer]);

    // Close app on back button if on login screen
    useEffect(() => {
        let listenerHandle = null;
        if (!isLoggedIn) {
            CapacitorApp.addListener('backButton', () => {
                try {
                    CapacitorApp.exitApp();
                } catch (e) {}
            }).then(handle => {
                listenerHandle = handle;
            }).catch(() => {});
        }
        return () => {
            if (listenerHandle?.remove) {
                listenerHandle.remove();
            }
        };
    }, [isLoggedIn]);

    const handleThemeToggle = () => {
        const nextTheme = theme === 'theme-light' ? 'theme-dark' : 'theme-light';
        setTheme(nextTheme);
        localStorage.setItem('coor_theme', nextTheme);
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
                    authStorage.setTeamSession({
                        teamToken: data.token,
                        teamData: data.team,
                        teamId: data.team.teamId
                    });
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
                    authStorage.setAdminSession({
                        token: data.token,
                        adminInfo: data.adminInfo,
                        adminId: loginData.id
                    });
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
        authStorage.clearAll();
        setIsLoggedIn(false);
        setUserRole(null);
        setTeamData(null);
        setLoginData({ id: '', password: '' });
        setActiveTab('scanner');
    };

    const adminSession = authStorage.getAdminSession();
    const activeAdminId = adminSession?.id || 'vedant.navonmesh';
    const coorProfile = getCoordinatorProfile(activeAdminId);
    const adminSubRole = adminSession?.subRole || coorProfile.subRole || 'Overall Head';

    // Dynamic Logo: User-provided black font logo in light theme, earlier dark logo in dark theme
    const activeLogo = theme === 'theme-light' ? navonmeshBlackLogo : navonmeshDarkLogo;
    const isLight = theme === 'theme-light';
    const brandTitleColor = isLight ? '#0f172a' : '#f8fafc';
    const brandSubColor   = isLight ? '#1e40af' : '#38bdf8';
    const brandTitleStyle = {
        color: brandTitleColor,
        WebkitTextFillColor: brandTitleColor,
        background: 'none',
        WebkitBackgroundClip: 'unset',
        backgroundClip: 'unset',
        textShadow: 'none',
        animation: 'none'
    };
    // Logo box inline style — light = white clean, dark = dark box
    const logoBoxStyle = isLight
        ? { background: '#ffffff', border: '1px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', borderRadius: '8px', padding: '3px 5px', width: '42px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }
        : { background: '#000000', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 0 10px rgba(251,191,36,0.2)', borderRadius: '8px', padding: '3px 5px', width: '42px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };

    // Early return during splash screen to guarantee nothing renders underneath
    if (showSplash) {
        return (
            <NavonmeshAppSplash 
                theme={theme} 
                onFinish={() => setShowSplash(false)} 
            />
        );
    }

    return (
        <div className={`coordinator-app-container ${theme}`}>
            {/* FIRST-TIME DEVICE PERMISSIONS REQUEST MODAL */}
            {showPermissionsModal && (
                <AppPermissionsModal 
                    theme={theme} 
                    onComplete={() => setShowPermissionsModal(false)} 
                />
            )}

            {/* TOP APP HEADER */}
            <header className="coor-header">
                <div className="coor-header-brand">
                    <div className="coor-header-logo-box" style={logoBoxStyle}>
                        <img src={activeLogo} alt="Navonmesh Logo" className="coor-header-logo-img" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <div className="coor-brand-text-col">
                        <h1 className="coor-brand-title" style={brandTitleStyle}>NAVONMESH MITRA</h1>
                        <p className="coor-brand-sub" style={{ color: brandSubColor }}>
                            {isLoggedIn 
                                ? (userRole === 'participant' ? `SQUAD: ${teamData?.teamName?.toUpperCase() || 'PORTAL'}` : `DUTY: ${(coorProfile.subRole || adminSubRole).toUpperCase()}`)
                                : 'FEST COMPANION'}
                        </p>
                    </div>
                </div>

                <div className="coor-header-actions">
                    {/* Compact Theme Switcher (Only the switch button - avoids label overlap) */}
                    <button 
                        type="button"
                        className="coor-theme-switch-btn" 
                        onClick={handleThemeToggle} 
                        title={theme === 'theme-light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
                        aria-label="Toggle Light / Dark Theme"
                    >
                        <div className={`theme-switch-track ${theme === 'theme-dark' ? 'dark' : 'light'}`}>
                            <span className="theme-switch-thumb">
                                {theme === 'theme-dark' ? <FaMoon className="theme-switch-thumb-icon" /> : <FaSun className="theme-switch-thumb-icon" />}
                            </span>
                        </div>
                    </button>

                    {/* Coordinator Profile Avatar in Circle Frame */}
                    {isLoggedIn && userRole === 'coordinator' && (
                        <div className="coor-header-profile-avatar" title={`${coorProfile.name} (${coorProfile.subRole})`}>
                            <img src={coorProfile.image} alt={coorProfile.name} className="coor-header-profile-img" />
                        </div>
                    )}

                    {/* Logout Button */}
                    {isLoggedIn && (
                        <button
                            className="coor-logout-btn"
                            onClick={handleLogout}
                            title="Log Out"
                        >
                            <FaSignOutAlt style={{ fontSize: '9px' }} />
                            <span>Exit</span>
                        </button>
                    )}
                </div>
            </header>

            {/* PRE-LOGIN VIEW: ROLE SELECTION & AUTHENTICATION */}
            {!isLoggedIn ? (
                <main className="coor-auth-view">
                    <div className="coor-auth-card">
                        <div 
                            className="coor-auth-logo-frame"
                            style={isLight
                                ? { background: '#ffffff', border: '1px solid #cbd5e1', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderRadius: '12px', padding: '10px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '160px', height: '64px', margin: '0 auto 12px' }
                                : { background: '#000000', border: '1px solid rgba(255,255,255,0.18)', boxShadow: '0 0 16px rgba(251,191,36,0.2)', borderRadius: '12px', padding: '10px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '160px', height: '64px', margin: '0 auto 12px' }
                            }
                        >
                            <img src={activeLogo} alt="Navonmesh Mitra" className="coor-auth-logo-img" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>

                        <h2 className="coor-auth-heading" style={brandTitleStyle}>NAVONMESH MITRA</h2>
                        <p className="coor-auth-subtext" style={{ color: isLight ? '#475569' : '#94a3b8' }}>Official Technical Fest Companion • SSGMCE</p>

                        {/* ROLE SELECTOR TABS */}
                        <div style={{
                            display: 'flex',
                            background: theme === 'theme-light' ? '#f1f5f9' : 'rgba(0,0,0,0.3)',
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
                                    background: loginRole === 'participant' ? (theme === 'theme-light' ? '#0284c7' : 'var(--coor-accent-bright)') : 'transparent',
                                    color: loginRole === 'participant' ? '#ffffff' : 'var(--coor-text-sub)',
                                    fontFamily: 'var(--coor-display-font)',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    transition: 'all 0.2s ease'
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
                                    background: loginRole === 'coordinator' ? (theme === 'theme-light' ? '#0284c7' : 'var(--coor-accent-bright)') : 'transparent',
                                    color: loginRole === 'coordinator' ? '#ffffff' : 'var(--coor-text-sub)',
                                    fontFamily: 'var(--coor-display-font)',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    transition: 'all 0.2s ease'
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
                                <label className="coor-input-label">USERNAME</label>
                                <div className="coor-input-wrapper">
                                    <FaUser className="coor-input-icon" />
                                    <input
                                        type="text"
                                        placeholder="Username"
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
                                <label className="coor-input-label">PASSWORD</label>
                                <div className="coor-input-wrapper">
                                    <FaLock className="coor-input-icon" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        className="coor-input-field coor-input-field-pwd"
                                        value={loginData.password}
                                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="coor-pwd-eye-btn"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
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
                <ParticipantPortal teamData={teamData} onLogout={handleLogout} theme={theme} />
            ) : (
                /* ================= COORDINATOR DUTY PORTAL ================= */
                <CoordinatorDutyPortal onLogout={handleLogout} theme={theme} onThemeToggle={handleThemeToggle} />
            )}
        </div>
    );
};

export default CoordinatorApp;
