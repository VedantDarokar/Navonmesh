import React, { useState, useEffect, useRef } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { 
    FaShieldAlt, FaUserCheck, FaBell, FaCheckCircle, FaExclamationTriangle, 
    FaTasks, FaQrcode, FaClock, FaChair, FaChartBar, FaSync, FaUtensils, 
    FaPhone, FaBroadcastTower, FaTimes, FaArrowRight, FaFilter, FaCheck,
    FaPlay, FaPause, FaRedo, FaFolderOpen, FaCube, FaUsers, FaLaptopCode
} from 'react-icons/fa';
import '../Styles/coordinator_duty_portal.css';
import { getApiUrl } from '../utils/apiConfig';
import { getCoordinatorProfile, COORDINATOR_PROFILES } from '../utils/coordinatorProfiles';

import FoodScannerPage from './FoodScannerPage';
import Admin from './Admin';
import { io } from 'socket.io-client';
import BroadcastNotificationModal from '../Components/BroadcastNotificationModal';

const CoordinatorDutyPortal = ({ onLogout, theme = 'theme-light', onThemeToggle }) => {
    // 6 Main Tabs matching Mockup: 'hub' | 'scanner' | 'timer' | 'seats' | 'issues' | 'admin_full'
    const [dutyTab, setDutyTab] = useState('hub');

    const dutyTabRef = useRef(dutyTab);
    const showAssignModalRef = useRef(false);
    const showAlertModalRef = useRef(false);

    useEffect(() => {
        dutyTabRef.current = dutyTab;
    }, [dutyTab]);

    const navigateToTab = (tab) => {
        if (tab !== dutyTab) {
            try {
                if (typeof window !== 'undefined' && window.history) {
                    window.history.pushState({ dutyTab: tab }, '');
                }
            } catch (e) {}
            setDutyTab(tab);
        }
    };

    // Coordinator Identity
    const adminSession = (() => {
        try {
            return JSON.parse(sessionStorage.getItem('adminInfo') || localStorage.getItem('adminInfo') || '{}');
        } catch (e) {
            return {};
        }
    })();
    const adminId = localStorage.getItem('adminId') || sessionStorage.getItem('adminId') || 'vedant.navonmesh';
    const profile = getCoordinatorProfile(adminId);
    const adminSubRole = adminSession?.subRole || profile.subRole || 'Overall Head';

    // Broadcast Authorization (Vedant & Nihal)
    const cleanAdminId = String(adminId || '').toLowerCase().trim();
    const isBroadcastAdmin = 
        ['vedant.navonmesh', 'nihal.navonmesh', 'vedant,navonmesh'].includes(cleanAdminId) ||
        ['nihal kankal', 'vedant darokar'].includes(String(profile?.name || '').toLowerCase().trim());

    // Broadcast & Notification State
    const [showBroadcastModal, setShowBroadcastModal] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadNotifCount, setUnreadNotifCount] = useState(0);
    const [showNotificationsDrawer, setShowNotificationsDrawer] = useState(false);
    const [activeNotificationToast, setActiveNotificationToast] = useState(null);

    // Tasks & Alerts State
    const [tasks, setTasks] = useState([]);
    const [pendingTasksCount, setPendingTasksCount] = useState(0);
    const [loadingTasks, setLoadingTasks] = useState(false);
    const [showTaskAlertModal, setShowTaskAlertModal] = useState(false);

    // Master Admin Task Assignment Modal State (Nihal Kankal)
    const [showAssignTaskModal, setShowAssignTaskModal] = useState(false);

    // ANDROID HARDWARE BACK BUTTON & BROWSER BACK HANDLER
    useEffect(() => {
        let listenerHandle = null;

        const handleBackAction = () => {
            if (showAssignModalRef.current) {
                setShowAssignTaskModal(false);
                return;
            }
            if (showAlertModalRef.current) {
                setShowTaskAlertModal(false);
                return;
            }
            if (dutyTabRef.current !== 'hub') {
                setDutyTab('hub');
                return;
            }
            try {
                CapacitorApp.exitApp();
            } catch (err) {}
        };

        const setupBackListener = async () => {
            try {
                listenerHandle = await CapacitorApp.addListener('backButton', () => {
                    handleBackAction();
                });
            } catch (err) {}
        };

        setupBackListener();

        const onPopState = () => {
            handleBackAction();
        };

        window.addEventListener('popstate', onPopState);

        return () => {
            if (listenerHandle?.remove) {
                listenerHandle.remove();
            }
            window.removeEventListener('popstate', onPopState);
        };
    }, []);

    // Live Metrics State
    const [stats, setStats] = useState({
        totalSquads: 240,
        checkedIn: 184,
        mealsScanned: 520,
        activeIssues: 0
    });

    // Active Issues from Participants
    const [issues, setIssues] = useState([]);
    const [loadingIssues, setLoadingIssues] = useState(false);
    const [distressFilter, setDistressFilter] = useState('open'); // 'open' | 'resolved'

    // Live Meal Distribution Stats State
    const [mealStats, setMealStats] = useState({
        breakfast: 0,
        lunch: 0,
        dinner: 0,
        total: 0,
        dateStr: ''
    });

    const API_URL = getApiUrl();

    // --------------------------------------------------------------------------
    // VIEW 3: EVENT TIMER STATE (Synchronized Countdown & Presets)
    // --------------------------------------------------------------------------
    const [timerSeconds, setTimerSeconds] = useState(3600); // Default 1 hour
    const [isTimerRunning, setIsTimerRunning] = useState(true);
    const [activeTimerPreset, setActiveTimerPreset] = useState('30m');
    const [currentActivity, setCurrentActivity] = useState({
        name: 'Lunch Break',
        startedAt: '01:00 PM',
        duration: '1 hour',
        endsAt: '02:00 PM',
        icon: '☀️'
    });

    useEffect(() => {
        let interval = null;
        if (isTimerRunning && timerSeconds > 0) {
            interval = setInterval(() => {
                setTimerSeconds(prev => (prev > 0 ? prev - 1 : 0));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, timerSeconds]);

    const formatTimerUnits = (totalSec) => {
        const hrs = Math.floor(totalSec / 3600);
        const mins = Math.floor((totalSec % 3600) / 60);
        const secs = totalSec % 60;
        return {
            hours: String(hrs).padStart(2, '0'),
            minutes: String(mins).padStart(2, '0'),
            seconds: String(secs).padStart(2, '0')
        };
    };

    const handleSelectPreset = (presetKey, seconds, activityName, durationStr) => {
        setActiveTimerPreset(presetKey);
        setTimerSeconds(seconds);
        setIsTimerRunning(true);
        const now = new Date();
        const startStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const endD = new Date(now.getTime() + seconds * 1000);
        const endStr = endD.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setCurrentActivity({
            name: activityName,
            startedAt: startStr,
            duration: durationStr,
            endsAt: endStr,
            icon: activityName.includes('Lunch') ? '☀️' : (activityName.includes('Dinner') ? '🌙' : '⏱️')
        });
    };

    const handleToggleTimer = () => {
        setIsTimerRunning(prev => !prev);
    };

    const handleResetTimer = () => {
        if (activeTimerPreset === '15m') setTimerSeconds(900);
        else if (activeTimerPreset === '30m') setTimerSeconds(1800);
        else if (activeTimerPreset === '45m') setTimerSeconds(2700);
        else setTimerSeconds(3600);
    };

    // --------------------------------------------------------------------------
    // VIEW 4: SEATING GRID MATRIX STATE (Desks 1-112)
    // --------------------------------------------------------------------------
    const [selectedSeat, setSelectedSeat] = useState(null);

    // Tactical teams mapping matching hackathon deployment grid
    const defaultTacticalTeams = {
        1: 'COMBINATORS', 2: 'TECH TITANS', 3: 'VISIONARIES', 4: 'INFINITE', 5: 'KRUSHNA FORCE',
        6: 'ANANT', 7: 'MISSION X', 8: 'TEAM INDIA', 9: 'TECH WARRIORS', 10: 'CODENINJAS',
        11: 'RIOT TITANS', 12: 'HACKERS', 13: 'CODEX', 14: 'QUANTUM', 15: 'TEAM ALPHA',
        16: 'TEAM BRAVO', 17: 'COMMIT', 18: 'TEAM FORCE', 19: 'IGNITEX', 20: 'CHATBOTS',
        21: 'JAY G', 22: 'TEAM NOVA', 23: 'CODE BLAST', 24: 'CAPTAIN', 25: 'D-CODE',
        26: 'GENZ', 27: 'BRAIN', 28: 'VISION', 29: 'CODENEXUS', 30: 'SIMPLIFI',
        31: 'MEDQ', 32: 'TEAM NEXUS', 33: 'CODEX', 34: 'SOLUTIONS', 35: 'TEAM X',
        36: 'CODE CRAFT', 37: 'DATA MINDS', 38: 'PS3 OPS', 39: 'CODEFORCE', 40: 'THE CODERS',
        41: 'KALP', 42: 'MINDMATRIX', 43: 'LIFE LINE', 44: 'AGRIVISION', 45: 'TEAM SPARK',
        46: 'THE CREW', 47: 'DEPENDENCY', 48: 'QUANTUM', 49: 'TEAM INFINITY', 50: 'INNOVATORS',
        51: 'CYPHER', 52: 'DIVAB', 53: 'ELEVATE', 54: 'NEURAL', 56: 'SORTX',
        57: 'TEAM PRO', 58: 'TECH MINDS', 59: 'ALGO-RHYTHM', 60: 'DEVX', 61: 'BITSO',
        62: 'BROGRAMMERS', 64: 'ECHO', 65: 'ALPHA', 66: 'DEV MASTERS', 67: 'NEXUS',
        68: 'FOURBYTE', 69: '404 BRAIN', 70: 'TECH TITANS', 71: 'TEAM CYBER', 72: 'SCRIPT KINGS',
        73: 'CODE BLOCKS', 74: 'APEX', 75: 'TECH FORCE', 76: 'TEAM PULSE', 77: 'DEBUGGERS',
        78: 'INNOVATORS', 79: 'RUNTIME', 80: 'CODE ELITE', 81: 'TEAM CORE', 82: 'NOVA',
        83: 'AVINYA', 84: 'VOLT', 85: 'CAMPUS CODE', 86: 'TECH SQUAD', 87: 'CATALYST',
        88: 'GPAIT', 89: 'CODEBYTE', 90: 'TECHNO', 91: 'FALCONS', 92: 'ARJUN',
        93: 'THE INVINCIBLES', 94: 'PERSEVERANCE', 95: 'DREAMERS', 96: 'CODE KNIGHTS', 97: 'QUAD',
        98: 'CODE PHANTOMS', 99: 'BINARY', 100: 'NEXTRUN', 102: 'ZENTRIX', 103: 'ECE WARRIORS',
        104: 'DATA WIZARDS', 105: 'BYTE-FORCE', 106: 'HACKERSPACE', 107: 'PRIMEX', 108: 'TECH HEROES',
        109: 'VIBECODE', 110: 'TECHNOVATION', 111: 'TEAM MATRIX', 112: 'CLOUDCRAFT'
    };

    // Generate consistent 112 tactical seats (1 to 112)
    const seatingGrid = useRef(
        Array.from({ length: 112 }, (_, i) => {
            const seatNumber = i + 1;
            const teamName = defaultTacticalTeams[seatNumber];
            const isEngaged = !!teamName;
            return {
                id: seatNumber,
                seatNumber: String(seatNumber).padStart(2, '0'),
                isEngaged,
                sector: seatNumber <= 56 ? 'Sector Path A' : 'Sector Path B',
                squadName: teamName || null,
                leaderName: isEngaged ? `Lead Dev (${teamName})` : null,
                college: isEngaged ? 'SSGMCE Shegaon' : null,
                track: 'Srijan Hackathon'
            };
        })
    ).current;

    // --------------------------------------------------------------------------
    // VIEW 6: CONTROL STREAM STATE (Full Admin Terminal Modal)
    // --------------------------------------------------------------------------
    const [showFullAdminModal, setShowFullAdminModal] = useState(false);
    const [selectedStreamMessage, setSelectedStreamMessage] = useState(null);

    // Fetch Tasks
    const fetchTasks = async () => {
        setLoadingTasks(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/coordinator-tasks?coordinatorId=${encodeURIComponent(adminId)}`);
            const data = await res.json();
            if (res.ok && data.success) {
                setTasks(data.tasks || []);
                const pending = (data.tasks || []).filter(t => t.status !== 'COMPLETED').length;
                setPendingTasksCount(pending);
            }
        } catch (err) {
        } finally {
            setLoadingTasks(false);
        }
    };

    // Fetch Live Issues
    const fetchIssues = async () => {
        setLoadingIssues(true);
        try {
            const res = await fetch(`${API_URL}/api/issues`);
            const data = await res.json();
            if (res.ok && Array.isArray(data)) {
                setIssues(data);
                const activeCount = data.filter(i => i.status === 'active').length;
                setStats(prev => ({ ...prev, activeIssues: activeCount }));
            }
        } catch (err) {
        } finally {
            setLoadingIssues(false);
        }
    };

    // Fetch Live Meal Distribution Stats
    const fetchMealStats = async () => {
        try {
            const res = await fetch(`${API_URL}/api/food/stats`);
            const data = await res.json();
            if (res.ok && data.success && data.counts) {
                setMealStats({
                    breakfast: data.counts.breakfast || 0,
                    lunch: data.counts.lunch || 0,
                    dinner: data.counts.dinner || 0,
                    total: data.counts.total || 0,
                    dateStr: data.dateStr || ''
                });
                setStats(prev => ({ ...prev, mealsScanned: data.counts.total || 0 }));
            }
        } catch (err) {}
    };

    // Mark Issue Resolved
    const handleResolveIssue = async (issueId) => {
        try {
            const res = await fetch(`${API_URL}/api/issues/${issueId}/resolve`, {
                method: 'PUT'
            });
            if (res.ok) {
                fetchIssues();
            }
        } catch (err) {}
    };

    // Fetch Live Notifications / Broadcasts
    const fetchNotifications = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/notifications?role=coordinator`);
            const data = await res.json();
            if (res.ok && data.success) {
                setNotifications(data.notifications || []);
            }
        } catch (e) {}
    };

    useEffect(() => {
        fetchTasks();
        fetchIssues();
        fetchMealStats();
        fetchNotifications();

        let socket = null;
        try {
            socket = io(API_URL, { transports: ['websocket'] });
            socket.on('new-notification', (notif) => {
                if (notif.target === 'all' || notif.target === 'coordinator') {
                    setNotifications(prev => [notif, ...prev]);
                    setUnreadNotifCount(c => c + 1);
                    setActiveNotificationToast(notif);
                    setTimeout(() => setActiveNotificationToast(null), 8000);

                    // Trigger OS notification if allowed
                    if ('Notification' in window && Notification.permission === 'granted') {
                        try {
                            new Notification(notif.title, {
                                body: notif.message,
                                icon: '/navonmesh_official_logo.png'
                            });
                        } catch (err) {}
                    }
                }
            });

            socket.on('notification-deleted', ({ id }) => {
                setNotifications(prev => prev.filter(n => n._id !== id));
            });
        } catch (err) {
            console.warn('Socket connect fallback:', err);
        }

        const interval = setInterval(() => {
            fetchTasks();
            fetchIssues();
            fetchMealStats();
            fetchNotifications();
        }, 10000);

        return () => {
            clearInterval(interval);
            if (socket) socket.disconnect();
        };
    }, []);

    const openIssues = issues.filter(i => i.status === 'active');
    const resolvedIssues = issues.filter(i => i.status === 'resolved');

    const timerUnits = formatTimerUnits(timerSeconds);

    return (
        <div className={`coordinator-duty-portal ${theme}`}>

            {/* ==================================================== */}
            {/* VIEW 1: 🏠 DUTY HUB (MATCHING SCREEN 1)              */}
            {/* ==================================================== */}
            {dutyTab === 'hub' && (
                <div className="coor-pane-hub animate-fade-in">
                    {/* Top Quick Sub-Nav Pills Matching Mockup Screen 1 */}
                    <div className="hub-top-pills-bar">
                        <button className="hub-sub-pill active">
                            Duty Hub
                        </button>
                        <button className="hub-sub-pill" onClick={() => navigateToTab('scanner')}>
                            Scanner
                        </button>
                        <button className="hub-sub-pill" onClick={() => navigateToTab('timer')}>
                            Timer
                        </button>
                        <button className="hub-sub-pill" onClick={() => navigateToTab('admin_full')}>
                            More
                        </button>
                    </div>

                    {/* 1. OFFICIAL FEST DUTY HERO CARD */}
                    <div className="coor-welcome-hero-card">
                        <div className="hero-top-row">
                            <div className="hero-profile-flex">
                                <div className="hero-avatar-circle">
                                    <img 
                                        src={profile.image} 
                                        alt={profile.name} 
                                        className="hero-avatar-img" 
                                    />
                                </div>
                                <div className="hero-profile-details">
                                    <span className="hero-role-tag">OFFICIAL FEST DUTY</span>
                                    <h2 className="hero-name-title">
                                        <span className="hero-welcome-prefix">Welcome,</span>
                                        <span className="hero-user-name">{profile.name}!</span>
                                    </h2>
                                    <p className="hero-duty-sub">
                                        {profile.subRole || adminSubRole}
                                    </p>
                                    <div className="hero-meta-pills">
                                        <span className="duty-status-badge on-duty">
                                            ● ACTIVE SHIFT ON-DUTY
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="hero-top-btns-flex" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <button 
                                    className="coor-notif-bell-btn" 
                                    onClick={() => { setShowNotificationsDrawer(true); setUnreadNotifCount(0); }} 
                                    title="View Live Fest Announcements"
                                >
                                    <FaBell />
                                    {unreadNotifCount > 0 && <span className="coor-notif-badge">{unreadNotifCount}</span>}
                                </button>
                                <button className="refresh-duty-btn" onClick={() => { fetchTasks(); fetchMealStats(); fetchIssues(); fetchNotifications(); }} title="Refresh Live Duty Data">
                                    <FaSync className={loadingTasks ? 'spin-icon' : ''} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* COMMAND AUTHORITY BROADCAST HERO CARD (VEDANT & NIHAL ONLY) */}
                    {isBroadcastAdmin && (
                        <div className="coor-broadcast-hero-banner" onClick={() => setShowBroadcastModal(true)}>
                            <div className="bcast-banner-icon-ring">
                                <FaBroadcastTower />
                            </div>
                            <div className="bcast-banner-info">
                                <div className="bcast-banner-badge">COMMAND AUTHORITY • OVERALL HEADS</div>
                                <h4 className="bcast-banner-title">Broadcast Custom Notification</h4>
                                <p className="bcast-banner-desc">Push live alerts to Coordinators, Participants, or Everyone</p>
                            </div>
                            <button className="bcast-banner-action-btn" type="button">
                                Transmit <FaArrowRight />
                            </button>
                        </div>
                    )}

                    {/* 2. LIVE MEALS BREAKDOWN CARD */}
                    <div className="coor-meal-overview-card">
                        <div className="meal-card-header">
                            <div>
                                <h3 className="meal-card-title">Live Meals Breakdown</h3>
                                <span className="section-micro-tag">REAL-TIME MESS VERIFICATIONS</span>
                            </div>
                        </div>

                        {/* 4 Pills in a Single Mobile Row */}
                        <div className="meal-mini-grid">
                            <div className="meal-mini-pill breakfast">
                                <span className="mini-icon">🌅</span>
                                <div className="mini-content">
                                    <span className="mini-label">Breakfast</span>
                                    <strong className="mini-val">{mealStats.breakfast}</strong>
                                </div>
                            </div>
                            <div className="meal-mini-pill lunch">
                                <span className="mini-icon">🍛</span>
                                <div className="mini-content">
                                    <span className="mini-label">Lunch</span>
                                    <strong className="mini-val">{mealStats.lunch}</strong>
                                </div>
                            </div>
                            <div className="meal-mini-pill dinner">
                                <span className="mini-icon">🌙</span>
                                <div className="mini-content">
                                    <span className="mini-label">Dinner</span>
                                    <strong className="mini-val">{mealStats.dinner}</strong>
                                </div>
                            </div>
                            <div className="meal-mini-pill total">
                                <span className="mini-icon">🍱</span>
                                <div className="mini-content">
                                    <span className="mini-label">Total</span>
                                    <strong className="mini-val">{mealStats.total}</strong>
                                </div>
                            </div>
                        </div>

                        {/* Full Width Food Scanner Action Button */}
                        <button 
                            className="coor-open-scanner-action-btn"
                            onClick={() => navigateToTab('scanner')}
                        >
                            <FaQrcode style={{ marginRight: '8px' }} /> Open Food Scanner (Next QR Ready)
                        </button>
                    </div>

                    {/* 3. THREE METRIC CARDS ROW */}
                    <div className="coor-metric-grid">
                        <div className="coor-metric-card squads-card" onClick={() => navigateToTab('seats')}>
                            <span className="coor-metric-label">Checked-in Squads</span>
                            <span className="coor-metric-val">{stats.checkedIn} / {stats.totalSquads}</span>
                            <span className="coor-metric-sub">76% Reported</span>
                        </div>
                        <div className="coor-metric-card meals-card" onClick={() => navigateToTab('scanner')}>
                            <span className="coor-metric-label">Meals Scanned</span>
                            <span className="coor-metric-val">Counters 1–4</span>
                            <span className="coor-metric-sub">Active Shift</span>
                        </div>
                        <div className="coor-metric-card distress-card" onClick={() => navigateToTab('issues')}>
                            <span className="coor-metric-label">Distress Tickets</span>
                            <span className="coor-metric-val">{openIssues.length} Open</span>
                            <span className="coor-metric-sub">View Tickets →</span>
                        </div>
                    </div>
                </div>
            )}

            {/* ==================================================== */}
            {/* VIEW 2: 📱 QR SCANNER (MATCHING SCREEN 2)            */}
            {/* ==================================================== */}
            {dutyTab === 'scanner' && (
                <div className="coor-pane-view animate-fade-in">
                    <FoodScannerPage />
                </div>
            )}

            {/* ==================================================== */}
            {/* VIEW 3: ⏱️ HACKATHON ROUND & BREAK TIMER (SCREEN 3)   */}
            {/* ==================================================== */}
            {dutyTab === 'timer' && (
                <div className="coor-pane-view timer-pane animate-fade-in">
                    {/* Main Timer Display Card */}
                    <div className="mockup-timer-card">
                        <div className="timer-card-header">
                            <span className="section-micro-tag">OFFICIAL FEST EVENT TIMER</span>
                            <h2 className="timer-main-title">Hackathon Round & Break Timer</h2>
                            <div className="timer-status-pill-wrap">
                                <span className={`timer-status-badge ${isTimerRunning ? 'running' : 'paused'}`}>
                                    ● {isTimerRunning ? 'Countdown Running' : 'Timer Paused'}
                                </span>
                            </div>
                        </div>

                        {/* 3-Box Big LED Digital Clock Display */}
                        <div className="timer-digital-display-row">
                            <div className="timer-unit-box">
                                <span className="timer-digit">{timerUnits.hours}</span>
                                <span className="timer-unit-lbl">Hours</span>
                            </div>
                            <span className="timer-colon-separator">:</span>
                            <div className="timer-unit-box">
                                <span className="timer-digit">{timerUnits.minutes}</span>
                                <span className="timer-unit-lbl">Minutes</span>
                            </div>
                            <span className="timer-colon-separator">:</span>
                            <div className="timer-unit-box">
                                <span className="timer-digit">{timerUnits.seconds}</span>
                                <span className="timer-unit-lbl">Seconds</span>
                            </div>
                        </div>

                        {/* 4 Quick Preset Buttons Row */}
                        <div className="timer-preset-pills-row">
                            <button 
                                className={`timer-preset-btn ${activeTimerPreset === '15m' ? 'active' : ''}`}
                                onClick={() => handleSelectPreset('15m', 900, 'Quick Break', '15 mins')}
                            >
                                15m Quick
                            </button>
                            <button 
                                className={`timer-preset-btn ${activeTimerPreset === '30m' ? 'active' : ''}`}
                                onClick={() => handleSelectPreset('30m', 1800, 'Lunch Break', '30 mins')}
                            >
                                30m Lunch
                            </button>
                            <button 
                                className={`timer-preset-btn ${activeTimerPreset === '45m' ? 'active' : ''}`}
                                onClick={() => handleSelectPreset('45m', 2700, 'Dinner Service', '45 mins')}
                            >
                                45m Dinner
                            </button>
                            <button 
                                className={`timer-preset-btn ${activeTimerPreset === '1h' ? 'active' : ''}`}
                                onClick={() => handleSelectPreset('1h', 3600, 'Overnight Rest', '1 hour')}
                            >
                                1h Rest
                            </button>
                        </div>

                        {/* Primary Action Button (Pause Break / Start Break) */}
                        <button 
                            className={`timer-primary-action-btn ${isTimerRunning ? 'running' : 'paused'}`}
                            onClick={handleToggleTimer}
                        >
                            {isTimerRunning ? (
                                <>
                                    <FaPause style={{ marginRight: '8px' }} /> Pause Break
                                </>
                            ) : (
                                <>
                                    <FaPlay style={{ marginRight: '8px' }} /> Resume Break
                                </>
                            )}
                        </button>

                        {/* Reset Button */}
                        <button className="timer-reset-btn" onClick={handleResetTimer}>
                            <FaRedo style={{ marginRight: '6px' }} /> Reset
                        </button>
                    </div>

                    {/* Current Activity Card */}
                    <div className="timer-current-activity-card">
                        <div className="activity-card-left">
                            <span className="activity-icon-big">{currentActivity.icon}</span>
                            <div>
                                <h4 className="activity-title">{currentActivity.name}</h4>
                                <p className="activity-sub">Started at {currentActivity.startedAt}</p>
                                <span className="activity-duration">Duration: {currentActivity.duration}</span>
                            </div>
                        </div>
                        <div className="activity-card-right">
                            <span className="activity-ends-lbl">Ends at {currentActivity.endsAt}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* ==================================================== */}
            {/* VIEW 4: 🪑 SEATING MATRIX (MATCHING SCREEN 4)       */}
            {/* ==================================================== */}
            {dutyTab === 'seats' && (
                <div className="coor-pane-view seating-pane animate-fade-in">
                    {/* Top 5 Metric Cards */}
                    <div className="seating-stats-grid">
                        <div className="seat-stat-card">
                            <span className="s-stat-lbl">Total Registered Teams</span>
                            <strong className="s-stat-val">112</strong>
                        </div>
                        <div className="seat-stat-card">
                            <span className="s-stat-lbl">Total Participants</span>
                            <strong className="s-stat-val">448</strong>
                        </div>
                        <div className="seat-stat-card">
                            <span className="s-stat-lbl">Srijan Teams</span>
                            <strong className="s-stat-val">52</strong>
                        </div>
                        <div className="seat-stat-card">
                            <span className="s-stat-lbl">Combat Ready (Assigned)</span>
                            <strong className="s-stat-val highlighted">112</strong>
                        </div>
                        <div className="seat-stat-card full-width">
                            <span className="s-stat-lbl">Awaiting Orders</span>
                            <strong className="s-stat-val">0</strong>
                        </div>
                    </div>

                    {/* Seating Grid Section (Tactical Layout Matching Screenshot) */}
                    <div className="tactical-seating-container">
                        <div className="section-header tactical-header-sub">
                            <div className="title-with-icon">
                                <FaChair className="header-icon" />
                                <h3 className="tactical-grid-h3">
                                    SEATING GRID <span className="count-label">1-112</span>
                                </h3>
                            </div>
                            <div className="legend-pills">
                                <span className="tactical-legend-pill available">VACANT</span>
                                <span className="tactical-legend-pill occupied">ENGAGED</span>
                            </div>
                        </div>

                        <div className="tactical-grid-wrapper">
                            {/* Left Column: Sector Path B */}
                            <div className="tactical-grid-side left">
                                {seatingGrid.slice(60, 88).map((seat) => (
                                    <div
                                        key={seat.id}
                                        className={`tactical-cell ${seat.isEngaged ? 'occupied' : 'vacant'} ${selectedSeat?.id === seat.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedSeat(seat)}
                                        title={`Desk #${seat.seatNumber} (${seat.isEngaged ? seat.squadName : 'Vacant'})`}
                                    >
                                        <div className="cell-corner top-left"></div>
                                        <div className="cell-corner bottom-right"></div>
                                        <span className="cell-num">{seat.seatNumber}</span>
                                        {seat.isEngaged && (
                                            <div className="cell-occupant">
                                                <span className="occ-name">{seat.squadName}</span>
                                                <div className="occ-scanner"></div>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                <div className="tactical-horizontal-road">
                                    <div className="road-line"></div>
                                    <span>SECTOR PATH B</span>
                                    <div className="road-line"></div>
                                </div>

                                {seatingGrid.slice(88, 112).map((seat) => (
                                    <div
                                        key={seat.id}
                                        className={`tactical-cell ${seat.isEngaged ? 'occupied' : 'vacant'} ${selectedSeat?.id === seat.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedSeat(seat)}
                                        title={`Desk #${seat.seatNumber} (${seat.isEngaged ? seat.squadName : 'Vacant'})`}
                                    >
                                        <div className="cell-corner top-left"></div>
                                        <div className="cell-corner bottom-right"></div>
                                        <span className="cell-num">{seat.seatNumber}</span>
                                        {seat.isEngaged && (
                                            <div className="cell-occupant">
                                                <span className="occ-name">{seat.squadName}</span>
                                                <div className="occ-scanner"></div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Center Access Road */}
                            <div className="tactical-road"></div>

                            {/* Right Column: Sector Path A */}
                            <div className="tactical-grid-side right">
                                {seatingGrid.slice(0, 28).map((seat) => (
                                    <div
                                        key={seat.id}
                                        className={`tactical-cell ${seat.isEngaged ? 'occupied' : 'vacant'} ${selectedSeat?.id === seat.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedSeat(seat)}
                                        title={`Desk #${seat.seatNumber} (${seat.isEngaged ? seat.squadName : 'Vacant'})`}
                                    >
                                        <div className="cell-corner top-left"></div>
                                        <div className="cell-corner bottom-right"></div>
                                        <span className="cell-num">{seat.seatNumber}</span>
                                        {seat.isEngaged && (
                                            <div className="cell-occupant">
                                                <span className="occ-name">{seat.squadName}</span>
                                                <div className="occ-scanner"></div>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                <div className="tactical-horizontal-road">
                                    <div className="road-line"></div>
                                    <span>SECTOR PATH A</span>
                                    <div className="road-line"></div>
                                </div>

                                {seatingGrid.slice(28, 60).map((seat) => (
                                    <div
                                        key={seat.id}
                                        className={`tactical-cell ${seat.isEngaged ? 'occupied' : 'vacant'} ${selectedSeat?.id === seat.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedSeat(seat)}
                                        title={`Desk #${seat.seatNumber} (${seat.isEngaged ? seat.squadName : 'Vacant'})`}
                                    >
                                        <div className="cell-corner top-left"></div>
                                        <div className="cell-corner bottom-right"></div>
                                        <span className="cell-num">{seat.seatNumber}</span>
                                        {seat.isEngaged && (
                                            <div className="cell-occupant">
                                                <span className="occ-name">{seat.squadName}</span>
                                                <div className="occ-scanner"></div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Selected Seat Quick Modal / Drawer */}
                    {selectedSeat && (
                        <div className="seat-detail-bottom-drawer">
                            <div className="seat-drawer-header">
                                <div>
                                    <h4 className="drawer-seat-title">Desk #{selectedSeat.seatNumber} • {selectedSeat.sector}</h4>
                                    <span className={`drawer-seat-status ${selectedSeat.isEngaged ? 'engaged' : 'vacant'}`}>
                                        {selectedSeat.isEngaged ? '● SQUAD ASSIGNED & VERIFIED' : '○ VACANT DESK'}
                                    </span>
                                </div>
                                <button className="drawer-close-btn" onClick={() => setSelectedSeat(null)}>
                                    <FaTimes />
                                </button>
                            </div>
                            {selectedSeat.isEngaged ? (
                                <div className="drawer-seat-content">
                                    <p><strong>Squad:</strong> {selectedSeat.squadName}</p>
                                    <p><strong>Lead Dev:</strong> {selectedSeat.leaderName}</p>
                                    <p><strong>Institution:</strong> {selectedSeat.college}</p>
                                    <p><strong>Track:</strong> {selectedSeat.track}</p>
                                </div>
                            ) : (
                                <p className="drawer-seat-vacant-msg">This desk is currently free and available for on-spot allocation.</p>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ==================================================== */}
            {/* VIEW 5: 🚨 DISTRESS TICKETS (MATCHING SCREEN 5)      */}
            {/* ==================================================== */}
            {dutyTab === 'issues' && (
                <div className="coor-pane-view distress-pane animate-fade-in">
                    <div className="distress-header-box">
                        <span className="section-micro-tag">LIVE PARTICIPANT ASSISTANCE</span>
                        <div className="distress-title-flex">
                            <h2 className="distress-main-heading">Active Distress Tickets ({openIssues.length})</h2>
                            <button className="distress-refresh-btn" onClick={fetchIssues} title="Refresh Live Distress Desk">
                                <FaSync className={loadingIssues ? 'spin-icon' : ''} /> Refresh
                            </button>
                        </div>
                    </div>

                    {/* Segmented Control: Open vs Resolved */}
                    <div className="distress-segmented-tabs">
                        <button 
                            className={`distress-seg-pill ${distressFilter === 'open' ? 'active' : ''}`}
                            onClick={() => setDistressFilter('open')}
                        >
                            Open Tickets ({openIssues.length})
                        </button>
                        <button 
                            className={`distress-seg-pill ${distressFilter === 'resolved' ? 'active' : ''}`}
                            onClick={() => setDistressFilter('resolved')}
                        >
                            Resolved ({resolvedIssues.length})
                        </button>
                    </div>

                    {/* Empty State: Large Shield with Checkmark (Matching Mockup Screen 5) */}
                    {(distressFilter === 'open' ? openIssues : resolvedIssues).length === 0 ? (
                        <div className="mockup-distress-empty-card">
                            <div className="distress-shield-circle-halo">
                                <svg width="78" height="90" viewBox="0 0 84 96" fill="none">
                                    <path 
                                        d="M42 4L6 18V44C6 68 42 90 42 90C42 90 78 68 78 44V18L42 4Z" 
                                        fill="url(#shieldGradLight)" 
                                        stroke="#10b981" 
                                        strokeWidth="2.5"
                                    />
                                    <path 
                                        d="M26 46L37 57L58 35" 
                                        stroke="#ffffff" 
                                        strokeWidth="4" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                    />
                                    <defs>
                                        <linearGradient id="shieldGradLight" x1="42" y1="4" x2="42" y2="90" gradientUnits="userSpaceOnUse">
                                            <stop stopColor="#34d399" stopOpacity="0.45"/>
                                            <stop stopColor="#059669" stopOpacity="0.95"/>
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>
                            <h3 className="distress-empty-title">No Active Issues!</h3>
                            <p className="distress-empty-desc">
                                All squad requests have been resolved smoothly.
                            </p>
                        </div>
                    ) : (
                        <div className="distress-tickets-list">
                            {(distressFilter === 'open' ? openIssues : resolvedIssues).map(issue => (
                                <div key={issue._id} className={`distress-ticket-card ${issue.status}`}>
                                    <div className="ticket-card-top">
                                        <span className="ticket-table-badge">Table / Group #{issue.groupNumber || 'Unassigned'}</span>
                                        <span className={`ticket-status-pill ${issue.status}`}>
                                            {issue.status === 'active' ? '● Open Alert' : '✓ Resolved'}
                                        </span>
                                    </div>
                                    <p className="ticket-desc">{issue.issueDescription}</p>
                                    <div className="ticket-card-footer">
                                        <span className="ticket-time">
                                            {new Date(issue.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {issue.status === 'active' && (
                                            <button 
                                                className="ticket-resolve-btn"
                                                onClick={() => handleResolveIssue(issue._id)}
                                            >
                                                <FaCheck /> Mark Resolved
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ==================================================== */}
            {/* VIEW 6: 🎛️ CONTROL / EVENT STREAMS (SCREEN 6)        */}
            {/* ==================================================== */}
            {dutyTab === 'admin_full' && (
                <div className="coor-pane-view control-pane animate-fade-in">
                    <div className="control-cards-list">
                        {/* 1. Navonmesh 2027 (Srijan From Today) */}
                        <div 
                            className="event-stream-card card-navonmesh-2027"
                            onClick={() => setSelectedStreamMessage('Navonmesh 2027 stream active: 4 newly registered teams ready for evaluation.')}
                        >
                            <div className="stream-card-left">
                                <h3 className="stream-title">Navonmesh 2027</h3>
                                <span className="stream-badge-tag">SRIJAN (FROM TODAY)</span>
                                <div className="stream-stats-row">
                                    <strong className="stream-num">4</strong>
                                    <span className="stream-unit">Teams<br/>NEW REGISTRATIONS</span>
                                </div>
                                <span className="stream-action-link">Open 2027 Stream →</span>
                            </div>
                            <div className="stream-card-right">
                                {/* 3D Isometric Blue Cubes SVG */}
                                <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                                    <polygon points="50,15 80,32 50,49 20,32" fill="#60a5fa" />
                                    <polygon points="20,32 50,49 50,82 20,65" fill="#2563eb" />
                                    <polygon points="50,49 80,32 80,65 50,82" fill="#1d4ed8" />
                                    <polygon points="70,55 92,67 70,79 48,67" fill="#93c5fd" opacity="0.8" />
                                </svg>
                            </div>
                        </div>

                        {/* 2. Navonmesh 2026 (Archive Folder) */}
                        <div 
                            className="event-stream-card card-navonmesh-2026"
                            onClick={() => setSelectedStreamMessage('Navonmesh 2026 archive unlocked: 115 registered squads stored in cloud records.')}
                        >
                            <div className="stream-card-left">
                                <h3 className="stream-title">Navonmesh 2026</h3>
                                <span className="stream-badge-tag amber">ARCHIVE FOLDER</span>
                                <div className="stream-stats-row">
                                    <strong className="stream-num amber">115</strong>
                                    <span className="stream-unit">Teams<br/>Earlier 114–115 Teams</span>
                                </div>
                                <span className="stream-action-link amber">Open 2026 Archive →</span>
                            </div>
                            <div className="stream-card-right">
                                {/* 3D Isometric Golden Folder SVG */}
                                <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                                    <path d="M15 35L35 25L55 25L65 35L85 35C88 35 90 37 90 40L90 75C90 78 88 80 85 80L15 80C12 80 10 78 10 75L10 40C10 37 12 35 15 35Z" fill="#f59e0b" />
                                    <polygon points="10,48 90,48 80,82 20,82" fill="#fbbf24" />
                                    <path d="M22 40L42 30L60 30L78 40" stroke="#fde68a" strokeWidth="2" opacity="0.6" />
                                </svg>
                            </div>
                        </div>

                        {/* 3. Ankur (Project Expo) */}
                        <div 
                            className="event-stream-card card-ankur"
                            onClick={() => setSelectedStreamMessage('Ankur Project Expo stream: 61 teams / 218 technical participants verified.')}
                        >
                            <div className="stream-card-left">
                                <h3 className="stream-title">Ankur</h3>
                                <span className="stream-badge-tag purple">PROJECT EXPO</span>
                                <div className="stream-stats-row">
                                    <strong className="stream-num purple">61</strong>
                                    <span className="stream-unit">Teams<br/>Participants: 218</span>
                                </div>
                                <span className="stream-action-link purple">Access Stream →</span>
                            </div>
                            <div className="stream-card-right">
                                {/* 3D Purple Isometric Crystals SVG */}
                                <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                                    <polygon points="50,18 78,35 50,52 22,35" fill="#c084fc" />
                                    <polygon points="22,35 50,52 50,85 22,68" fill="#9333ea" />
                                    <polygon points="50,52 78,35 78,68 50,85" fill="#7e22ce" />
                                </svg>
                            </div>
                        </div>

                        {/* 4. Udbhav (Conference) */}
                        <div 
                            className="event-stream-card card-udbhav"
                            onClick={() => setSelectedStreamMessage('Udbhav Conference session active: Auditorium session & keynote speaker matrix ready.')}
                        >
                            <div className="stream-card-left">
                                <h3 className="stream-title">Udbhav</h3>
                                <span className="stream-badge-tag indigo">CONFERENCE</span>
                                <div className="stream-stats-row">
                                    <strong className="stream-num indigo">8</strong>
                                    <span className="stream-unit">Tracks<br/>Research & Paper Expo</span>
                                </div>
                                <span className="stream-action-link indigo">Auditorium Portal →</span>
                            </div>
                            <div className="stream-card-right">
                                {/* 3D Conference / Crowd Graphic SVG */}
                                <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                                    <circle cx="50" cy="35" r="14" fill="#818cf8" />
                                    <circle cx="28" cy="42" r="10" fill="#6366f1" opacity="0.8" />
                                    <circle cx="72" cy="42" r="10" fill="#6366f1" opacity="0.8" />
                                    <path d="M25 78C25 64 36 55 50 55C64 55 75 64 75 78" fill="#4f46e5" />
                                    <path d="M12 82C12 72 20 65 30 65C34 65 38 67 41 70" fill="#4338ca" opacity="0.7" />
                                    <path d="M88 82C88 72 80 65 70 65C66 65 62 67 59 70" fill="#4338ca" opacity="0.7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Launch Full Desktop Admin Terminal Button */}
                    <div style={{ padding: '16px 0 24px 0', textAlign: 'center' }}>
                        <button 
                            className="open-full-admin-btn"
                            onClick={() => setShowFullAdminModal(true)}
                        >
                            ⚙️ Open Full Admin Command Center
                        </button>
                    </div>

                    {/* Stream Notification Toast / Modal */}
                    {selectedStreamMessage && (
                        <div className="stream-toast-notice animate-fade-in">
                            <span>📡 {selectedStreamMessage}</span>
                            <button onClick={() => setSelectedStreamMessage(null)}><FaTimes /></button>
                        </div>
                    )}

                    {/* Full Admin Modal */}
                    {showFullAdminModal && (
                        <div className="full-admin-modal-overlay">
                            <div className="full-admin-modal-card">
                                <div className="full-admin-modal-header">
                                    <h3>ADMIN COMMAND CENTER</h3>
                                    <button onClick={() => setShowFullAdminModal(false)}><FaTimes /></button>
                                </div>
                                <div className="full-admin-modal-body">
                                    <Admin />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ==================================================== */}
            {/* FLOATING MOBILE BOTTOM NAVIGATION DOCK (6 TABS)      */}
            {/* ==================================================== */}
            <nav className="coor-bottom-nav">
                <button 
                    className={`coor-bottom-tab ${dutyTab === 'hub' ? 'active' : ''}`}
                    onClick={() => navigateToTab('hub')}
                >
                    <FaTasks className="bottom-icon" />
                    <span>Duty Hub</span>
                    {pendingTasksCount > 0 && <span className="bottom-badge">{pendingTasksCount}</span>}
                </button>
                <button 
                    className={`coor-bottom-tab ${dutyTab === 'scanner' ? 'active' : ''}`}
                    onClick={() => navigateToTab('scanner')}
                >
                    <FaQrcode className="bottom-icon" />
                    <span>Scanner</span>
                </button>
                <button 
                    className={`coor-bottom-tab ${dutyTab === 'timer' ? 'active' : ''}`}
                    onClick={() => navigateToTab('timer')}
                >
                    <FaClock className="bottom-icon" />
                    <span>Timer</span>
                </button>
                <button 
                    className={`coor-bottom-tab ${dutyTab === 'seats' ? 'active' : ''}`}
                    onClick={() => navigateToTab('seats')}
                >
                    <FaChair className="bottom-icon" />
                    <span>Seating</span>
                </button>
                <button 
                    className={`coor-bottom-tab ${dutyTab === 'issues' ? 'active' : ''}`}
                    onClick={() => navigateToTab('issues')}
                >
                    <FaShieldAlt className="bottom-icon" />
                    <span>Distress</span>
                    {openIssues.length > 0 && <span className="bottom-badge urgent">{openIssues.length}</span>}
                </button>
                <button 
                    className={`coor-bottom-tab ${dutyTab === 'admin_full' ? 'active' : ''}`}
                    onClick={() => navigateToTab('admin_full')}
                >
                    <FaChartBar className="bottom-icon" />
                    <span>Control</span>
                </button>
            </nav>

            {/* FLOATING LIVE BROADCAST NOTIFICATION TOAST */}
            {activeNotificationToast && (
                <div className="coor-live-notif-toast animate-slide-down">
                    <div className="notif-toast-icon-wrap"><FaBroadcastTower /></div>
                    <div className="notif-toast-details">
                        <div className="notif-toast-top-row">
                            <span className="notif-toast-category-tag">{activeNotificationToast.category?.toUpperCase() || 'BROADCAST'}</span>
                            <span className="notif-toast-author">By {activeNotificationToast.senderName}</span>
                        </div>
                        <strong className="notif-toast-heading">{activeNotificationToast.title}</strong>
                        <p className="notif-toast-text">{activeNotificationToast.message}</p>
                    </div>
                    <button className="notif-toast-dismiss" onClick={() => setActiveNotificationToast(null)}>
                        <FaTimes />
                    </button>
                </div>
            )}

            {/* LIVE FEST NOTIFICATIONS / ANNOUNCEMENTS DRAWER */}
            {showNotificationsDrawer && (
                <div className="coor-notif-drawer-backdrop" onClick={() => setShowNotificationsDrawer(false)}>
                    <div className="coor-notif-drawer-pane" onClick={(e) => e.stopPropagation()}>
                        <div className="notif-drawer-top">
                            <div>
                                <h3 className="notif-drawer-title">Fest Announcements</h3>
                                <p className="notif-drawer-desc">Broadcasts & live duty updates</p>
                            </div>
                            <button className="notif-drawer-exit" onClick={() => setShowNotificationsDrawer(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="notif-drawer-items-list">
                            {notifications.length === 0 ? (
                                <div className="notif-drawer-none">
                                    <FaBell className="notif-drawer-none-icon" />
                                    <p>No broadcast announcements yet today.</p>
                                </div>
                            ) : (
                                notifications.map((n) => (
                                    <div key={n._id} className="notif-card-item">
                                        <div className="notif-card-top">
                                            <span className={`notif-card-tag ${n.category || 'announcement'}`}>{n.category?.toUpperCase() || 'INFO'}</span>
                                            <span className="notif-card-time">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <h4 className="notif-card-title">{n.title}</h4>
                                        <p className="notif-card-text">{n.message}</p>
                                        <div className="notif-card-footer">
                                            <span>From: <strong>{n.senderName}</strong></span>
                                            <span>Audience: <strong>{n.target?.toUpperCase()}</strong></span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* MASTER BROADCAST TERMINAL MODAL (VEDANT & NIHAL ONLY) */}
            {isBroadcastAdmin && (
                <BroadcastNotificationModal
                    isOpen={showBroadcastModal}
                    onClose={() => setShowBroadcastModal(false)}
                    adminUser={{ id: adminId, name: profile.name }}
                    theme={theme}
                />
            )}
        </div>
    );
};

export default CoordinatorDutyPortal;
