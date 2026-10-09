import React, { useState, useEffect } from 'react';
import { FaShieldAlt, FaUser, FaLock, FaQrcode, FaClock, FaChartBar, FaChair, FaPalette, FaSignOutAlt, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import '../Styles/coordinator_app.css';
import coordinatorLogo from '../assets/coordinator_logo.png';
import { getApiUrl } from '../utils/apiConfig';

// Import Duty Components
import Admin from './Admin';
import FoodScannerPage from './FoodScannerPage';
import BreakTimer from './BreakTimer';
import EventDayAdmin from './EventDayAdmin';

const CoordinatorApp = () => {
    // Session State
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loginData, setLoginData] = useState({ id: '', password: '' });
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [lockoutTimer, setLockoutTimer] = useState(0);

    // Active Duty Tab ('dashboard' | 'scanner' | 'timer' | 'event-day')
    const [activeTab, setActiveTab] = useState('scanner');

    // Theme Engine ('theme-gold' | 'theme-emerald' | 'theme-nebula')
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('coor_theme') || 'theme-gold';
    });

    const API_URL = getApiUrl();

    // Verify existing session on mount
    useEffect(() => {
        const token = sessionStorage.getItem('adminToken');
        if (token) {
            setIsLoggedIn(true);
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
            const res = await fetch(`${API_URL}/api/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData)
            });

            const data = await res.json();

            if (res.ok && data.success) {
                sessionStorage.setItem('adminToken', data.token);
                sessionStorage.setItem('adminName', data.adminInfo.name);
                sessionStorage.setItem('adminSubRole', data.adminInfo.subRole);
                sessionStorage.setItem('adminId', loginData.id);
                setIsLoggedIn(true);
                setFailedAttempts(0);
                setActiveTab('scanner'); // Default directly to QR scanner on coordinator launch
            } else {
                const newAttempts = failedAttempts + 1;
                setFailedAttempts(newAttempts);
                if (newAttempts >= 5) {
                    setLockoutTimer(30);
                    setLoginError('Too many failed attempts. Security cooldown active (30s).');
                } else {
                    setLoginError(data.message || 'Invalid credentials. Access denied.');
                }
            }
        } catch (err) {
            setLoginError('Secure server connection failed. Please check network.');
        } finally {
            setLoginLoading(false);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('adminToken');
        sessionStorage.removeItem('adminName');
        sessionStorage.removeItem('adminSubRole');
        sessionStorage.removeItem('adminId');
        setIsLoggedIn(false);
        setLoginData({ id: '', password: '' });
        setActiveTab('scanner');
    };

    const adminSubRole = sessionStorage.getItem('adminSubRole') || 'Coordinator';

    return (
        <div className={`coordinator-app-container ${theme}`}>
            {/* TOP HEADER */}
            <header className="coor-header">
                <div className="coor-header-brand">
                    <img src={coordinatorLogo} alt="Navonmesh Logo" className="coor-header-logo" />
                    <div>
                        <h1 className="coor-brand-title">NAVONMESH</h1>
                        <p className="coor-brand-sub">
                            {isLoggedIn ? `DUTY: ${adminSubRole.toUpperCase()}` : 'COORDINATOR PORTAL'}
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

                    {/* Logout Button (Only if logged in) */}
                    {isLoggedIn && (
                        <button
                            className="coor-logout-btn"
                            onClick={handleLogout}
                            title="End Session"
                        >
                            <FaSignOutAlt style={{ fontSize: '10px' }} />
                            <span>Exit</span>
                        </button>
                    )}
                </div>
            </header>

            {/* PRE-LOGIN VIEW (STRICT PROTECTED GATE) */}
            {!isLoggedIn ? (
                <main className="coor-auth-view">
                    <div className="coor-auth-card">
                        <div className="coor-auth-logo-frame">
                            <img src={coordinatorLogo} alt="Coordinator Badge" className="coor-auth-logo-img" />
                        </div>

                        <h2 className="coor-auth-heading">DUTY AUTHENTICATION</h2>
                        <p className="coor-auth-subtext">Navonmesh 2027 Coordinator Operations</p>

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
                                <label className="coor-input-label">Coordinator ID / Passcode</label>
                                <div className="coor-input-wrapper">
                                    <FaUser className="coor-input-icon" />
                                    <input
                                        type="text"
                                        placeholder="e.g. food, admin, or id"
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
                                <label className="coor-input-label">Security Password</label>
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
                                        : 'VERIFY & ENTER'}
                                </span>
                            </button>
                        </form>

                        <p className="coor-auth-footer-note">
                            Strictly for registered event coordinators and faculty administrators. Unauthorized access attempts are monitored and logged.
                        </p>
                    </div>
                </main>
            ) : (
                /* POST-LOGIN AUTHENTICATED DUTY INTERFACE */
                <>
                    <main className="coor-main-content">
                        {activeTab === 'scanner' && <FoodScannerPage />}
                        {activeTab === 'timer' && <BreakTimer />}
                        {activeTab === 'event-day' && <EventDayAdmin />}
                        {activeTab === 'dashboard' && <Admin />}
                    </main>

                    {/* BOTTOM NAVIGATION BAR (ONLY ACCESSIBLE POST-LOGIN) */}
                    <nav className="coor-bottom-nav">
                        <button
                            className={`coor-nav-item ${activeTab === 'scanner' ? 'active' : ''}`}
                            onClick={() => setActiveTab('scanner')}
                        >
                            <FaQrcode className="coor-nav-icon" />
                            <span className="coor-nav-label">Scanner</span>
                        </button>

                        <button
                            className={`coor-nav-item ${activeTab === 'timer' ? 'active' : ''}`}
                            onClick={() => setActiveTab('timer')}
                        >
                            <FaClock className="coor-nav-icon" />
                            <span className="coor-nav-label">Timer</span>
                        </button>

                        <button
                            className={`coor-nav-item ${activeTab === 'event-day' ? 'active' : ''}`}
                            onClick={() => setActiveTab('event-day')}
                        >
                            <FaChair className="coor-nav-icon" />
                            <span className="coor-nav-label">Seats</span>
                        </button>

                        <button
                            className={`coor-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                            onClick={() => setActiveTab('dashboard')}
                        >
                            <FaChartBar className="coor-nav-icon" />
                            <span className="coor-nav-label">Control</span>
                        </button>
                    </nav>
                </>
            )}
        </div>
    );
};

export default CoordinatorApp;
