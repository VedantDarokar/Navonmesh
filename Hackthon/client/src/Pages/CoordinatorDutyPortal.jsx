import React, { useState, useEffect } from 'react';
import { 
    FaShieldAlt, FaUserCheck, FaBell, FaCheckCircle, FaExclamationTriangle, 
    FaTasks, FaQrcode, FaClock, FaChair, FaChartBar, FaSync, FaUtensils, 
    FaPhone, FaBroadcastTower, FaTimes, FaArrowRight, FaFilter, FaCheck
} from 'react-icons/fa';
import '../Styles/coordinator_duty_portal.css';
import { getApiUrl } from '../utils/apiConfig';
import { getCoordinatorProfile, COORDINATOR_PROFILES } from '../utils/coordinatorProfiles';

import FoodScannerPage from './FoodScannerPage';
import BreakTimer from './BreakTimer';
import EventDayAdmin from './EventDayAdmin';
import Admin from './Admin';

const CoordinatorDutyPortal = ({ onLogout }) => {
    // Duty Tabs: 'hub' | 'scanner' | 'timer' | 'seats' | 'issues' | 'admin_full'
    const [dutyTab, setDutyTab] = useState('hub');

    // Coordinator Identity
    const adminName = sessionStorage.getItem('adminName') || 'Coordinator';
    const adminSubRole = sessionStorage.getItem('adminSubRole') || 'Field Coordinator';
    const adminId = sessionStorage.getItem('adminId') || 'nihal.navonmesh';
    const profile = getCoordinatorProfile(adminId);

    // Tasks & Alerts State
    const [tasks, setTasks] = useState([]);
    const [pendingTasksCount, setPendingTasksCount] = useState(0);
    const [loadingTasks, setLoadingTasks] = useState(false);
    const [showTaskAlertModal, setShowTaskAlertModal] = useState(false);
    const [alertDismissed, setAlertDismissed] = useState(false);

    // Master Admin Task Assignment Modal State (Nihal Kankal)
    const [showAssignTaskModal, setShowAssignTaskModal] = useState(false);
    const [newTaskData, setNewTaskData] = useState({
        assignedTo: 'all',
        title: '',
        description: '',
        priority: 'HIGH',
        dueTime: '12:00 PM'
    });
    const [submittingTask, setSubmittingTask] = useState(false);

    // Live Metrics State
    const [stats, setStats] = useState({
        totalSquads: 240,
        checkedIn: 184,
        mealsScanned: 520,
        activeIssues: 2
    });

    // Active Issues from Participants
    const [issues, setIssues] = useState([]);
    const [loadingIssues, setLoadingIssues] = useState(false);

    // Live Meal Distribution Stats State
    const [mealStats, setMealStats] = useState({
        breakfast: 0,
        lunch: 0,
        dinner: 0,
        total: 0,
        dateStr: ''
    });

    const API_URL = getApiUrl();

    // Fetch Assigned Tasks by Admin
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
            console.error('Failed to load coordinator tasks:', err);
        } finally {
            setLoadingTasks(false);
        }
    };

    // Create New Task (Master Admin Nihal)
    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!newTaskData.title.trim()) return;
        setSubmittingTask(true);
        try {
            const assignedProfile = getCoordinatorProfile(newTaskData.assignedTo);
            const res = await fetch(`${API_URL}/api/admin/coordinator-tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assignedTo: newTaskData.assignedTo,
                    coordinatorName: assignedProfile.name || (newTaskData.assignedTo === 'all' ? 'All Coordinators' : newTaskData.assignedTo),
                    title: newTaskData.title.trim(),
                    description: newTaskData.description.trim(),
                    priority: newTaskData.priority,
                    dueTime: newTaskData.dueTime
                })
            });
            if (res.ok) {
                setShowAssignTaskModal(false);
                setNewTaskData({
                    assignedTo: 'all',
                    title: '',
                    description: '',
                    priority: 'HIGH',
                    dueTime: '12:00 PM'
                });
                fetchTasks();
            }
        } catch (err) {
            console.error('Failed to create task:', err);
        } finally {
            setSubmittingTask(false);
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
            console.error('Failed to load issues:', err);
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
        } catch (err) {
            console.error('Failed to load meal stats:', err);
        }
    };

    // Mark Task Completed
    const handleToggleTaskStatus = async (taskId, currentStatus) => {
        const nextStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
        try {
            const res = await fetch(`${API_URL}/api/admin/coordinator-tasks/${taskId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: nextStatus })
            });
            if (res.ok) {
                fetchTasks();
            }
        } catch (err) {
            console.error('Failed to update task:', err);
        }
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
        } catch (err) {
            console.error('Failed to resolve issue:', err);
        }
    };

    useEffect(() => {
        fetchTasks();
        fetchIssues();
        fetchMealStats();
        const interval = setInterval(() => {
            fetchTasks();
            fetchIssues();
            fetchMealStats();
        }, 12000); // 12-sec background sync
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="coordinator-duty-portal">
            {/* ---------------------------------------------------- */}
            {/* POP-UP TASK ALERT MODAL FOR ASSIGNED ADMIN DUTIES     */}
            {/* ---------------------------------------------------- */}
            {showTaskAlertModal && (
                <div className="coor-alert-overlay">
                    <div className="coor-alert-modal">
                        <div className="alert-modal-header">
                            <span className="alert-bell-icon">🚨</span>
                            <div>
                                <h3 className="alert-modal-title">ADMIN DUTY ALERT</h3>
                                <p className="alert-modal-sub">
                                    You have {pendingTasksCount} assigned duty task(s) remaining!
                                </p>
                            </div>
                            <button 
                                className="close-alert-btn" 
                                onClick={() => {
                                    setShowTaskAlertModal(false);
                                    setAlertDismissed(true);
                                }}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="alert-tasks-list">
                            {tasks.filter(t => t.status !== 'COMPLETED').map((t, idx) => (
                                <div key={idx} className="alert-task-item">
                                    <div className="task-priority-dot-wrap">
                                        <span className={`priority-badge ${t.priority.toLowerCase()}`}>
                                            {t.priority}
                                        </span>
                                    </div>
                                    <div className="task-info">
                                        <h4 className="task-title-text">{t.title}</h4>
                                        <p className="task-desc-text">{t.description}</p>
                                        <span className="task-due-time">⏰ Due: {t.dueTime}</span>
                                    </div>
                                    <button 
                                        className="mark-done-btn"
                                        onClick={() => handleToggleTaskStatus(t._id, t.status)}
                                    >
                                        <FaCheck /> Done
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button 
                            className="ack-alert-btn"
                            onClick={() => {
                                setShowTaskAlertModal(false);
                                setAlertDismissed(true);
                            }}
                        >
                            Acknowledge & Proceed to Duty Hub
                        </button>
                    </div>
                </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* ASSIGN DUTY TASK MODAL (MASTER ADMIN NIHAL)          */}
            {/* ---------------------------------------------------- */}
            {showAssignTaskModal && (
                <div className="coor-alert-overlay" onClick={() => setShowAssignTaskModal(false)}>
                    <div className="coor-alert-modal assign-task-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="alert-modal-header">
                            <span className="alert-bell-icon">📋</span>
                            <div>
                                <h3 className="alert-modal-title" style={{ color: '#fbbf24' }}>ASSIGN DUTY DIRECTIVE</h3>
                                <p className="alert-modal-sub">Dispatch task to coordinator</p>
                            </div>
                            <button className="close-alert-btn" onClick={() => setShowAssignTaskModal(false)}>
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleCreateTask} className="assign-task-form">
                            <div className="coor-form-group">
                                <label className="coor-form-label">Assign To Coordinator:</label>
                                <select 
                                    className="coor-form-select"
                                    value={newTaskData.assignedTo}
                                    onChange={(e) => setNewTaskData({ ...newTaskData, assignedTo: e.target.value })}
                                >
                                    <option value="all">📢 All Floor Coordinators</option>
                                    {Object.entries(COORDINATOR_PROFILES).map(([cid, cp]) => (
                                        <option key={cid} value={cid}>
                                            {cp.name} ({cp.subRole})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="coor-form-group">
                                <label className="coor-form-label">Directive Title:</label>
                                <input 
                                    type="text" 
                                    className="coor-form-input" 
                                    placeholder="e.g. Inspect Mess Counter 3 Rush" 
                                    value={newTaskData.title}
                                    onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="coor-form-row">
                                <div className="coor-form-group half">
                                    <label className="coor-form-label">Priority:</label>
                                    <select 
                                        className="coor-form-select"
                                        value={newTaskData.priority}
                                        onChange={(e) => setNewTaskData({ ...newTaskData, priority: e.target.value })}
                                    >
                                        <option value="URGENT">🔴 Urgent</option>
                                        <option value="HIGH">🟡 High</option>
                                        <option value="MEDIUM">🔵 Medium</option>
                                    </select>
                                </div>
                                <div className="coor-form-group half">
                                    <label className="coor-form-label">Due Time:</label>
                                    <input 
                                        type="text" 
                                        className="coor-form-input" 
                                        placeholder="e.g. 01:30 PM" 
                                        value={newTaskData.dueTime}
                                        onChange={(e) => setNewTaskData({ ...newTaskData, dueTime: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="coor-form-group">
                                <label className="coor-form-label">Details / Instructions:</label>
                                <textarea 
                                    className="coor-form-textarea" 
                                    placeholder="Specific directives or location notes..."
                                    rows={3}
                                    value={newTaskData.description}
                                    onChange={(e) => setNewTaskData({ ...newTaskData, description: e.target.value })}
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="coor-submit-directive-btn"
                                disabled={submittingTask}
                            >
                                {submittingTask ? 'DISPATCHING...' : 'DISPATCH TASK DIRECTIVE ➔'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* SUB-NAVIGATION BAR FOR COORDINATORS                  */}
            {/* ---------------------------------------------------- */}
            <div className="coor-duty-nav">
                <button 
                    className={`coor-nav-pill ${dutyTab === 'hub' ? 'active' : ''}`}
                    onClick={() => setDutyTab('hub')}
                >
                    <FaTasks /> Duty Hub {pendingTasksCount > 0 && <span className="nav-badge-alert">{pendingTasksCount}</span>}
                </button>
                <button 
                    className={`coor-nav-pill ${dutyTab === 'scanner' ? 'active' : ''}`}
                    onClick={() => setDutyTab('scanner')}
                >
                    <FaQrcode /> Scanner
                </button>
                <button 
                    className={`coor-nav-pill ${dutyTab === 'timer' ? 'active' : ''}`}
                    onClick={() => setDutyTab('timer')}
                >
                    <FaClock /> Timer
                </button>
                <button 
                    className={`coor-nav-pill ${dutyTab === 'seats' ? 'active' : ''}`}
                    onClick={() => setDutyTab('seats')}
                >
                    <FaChair /> Seating
                </button>
                <button 
                    className={`coor-nav-pill ${dutyTab === 'issues' ? 'active' : ''}`}
                    onClick={() => setDutyTab('issues')}
                >
                    <FaExclamationTriangle /> Distress {stats.activeIssues > 0 && <span className="nav-badge-urgent">{stats.activeIssues}</span>}
                </button>
                <button 
                    className={`coor-nav-pill ${dutyTab === 'admin_full' ? 'active' : ''}`}
                    onClick={() => setDutyTab('admin_full')}
                >
                    <FaChartBar /> Control
                </button>
            </div>

            {/* ==================================================== */}
            {/* VIEW 1: 📋 DUTY HUB (MATCHING IMAGE 3 MOCKUP)       */}
            {/* ==================================================== */}
            {dutyTab === 'hub' && (
                <div className="coor-pane-hub">
                    {/* 1. WELCOME COORDINATOR HERO CARD */}
                    <div className="coor-welcome-hero-card">
                        <div className="hero-top-row">
                            <div className="hero-profile-wrap">
                                <div className="coor-profile-circle-frame" title={profile.name}>
                                    <img src={profile.image} alt={profile.name} className="coor-profile-img" />
                                </div>
                                <div className="hero-profile-details">
                                    <span className="hero-role-tag">OFFICIAL FEST DUTY</span>
                                    <h2 className="hero-name-title">
                                        Welcome, {profile.name}!
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
                            <button className="refresh-duty-btn" onClick={fetchTasks} title="Refresh Tasks">
                                <FaSync className={loadingTasks ? 'spin-icon' : ''} />
                            </button>
                        </div>
                    </div>

                    {/* PENDING ADMIN TASK NOTIFICATION BANNER */}
                    {pendingTasksCount > 0 && (
                        <div className="pending-task-banner-alert" onClick={() => setShowTaskAlertModal(true)}>
                            <div className="banner-left">
                                <span className="banner-icon-ring">🚨</span>
                                <div>
                                    <h4 className="banner-alert-title">
                                        {pendingTasksCount} PENDING ADMIN TASK(S) ASSIGNED
                                    </h4>
                                    <p className="banner-alert-sub">
                                        Tap to view and mark tasks assigned by Admin Command Center.
                                    </p>
                                </div>
                            </div>
                            <span className="banner-action-arrow"><FaArrowRight /></span>
                        </div>
                    )}

                    {/* 2. 🍱 LIVE MEALS BREAKDOWN CARD (MATCHING IMAGE 3 MOCKUP) */}
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

                        {/* Full Width Food Scanner Button (Matching Image 3) */}
                        <button 
                            className="coor-open-scanner-action-btn"
                            onClick={() => setDutyTab('scanner')}
                        >
                            Open Food Scanner (Next QR Ready)
                        </button>
                    </div>

                    {/* 3. 📊 THREE METRIC CARDS (SCREENSHOT 3 - DISTINCT COLORS, NO GLOW) */}
                    <div className="coor-metric-grid">
                        <div className="coor-metric-card squads-card">
                            <span className="coor-metric-label">Checked-In Squads</span>
                            <span className="coor-metric-val">{stats.checkedIn} / {stats.totalSquads}</span>
                            <span className="coor-metric-sub">76% Reported</span>
                        </div>
                        <div className="coor-metric-card meals-card">
                            <span className="coor-metric-label">Meals Scanned</span>
                            <span className="coor-metric-val">{mealStats.total || stats.mealsScanned}</span>
                            <span className="coor-metric-sub">Counters 1–4 Active</span>
                        </div>
                        <div className="coor-metric-card distress-card" onClick={() => setDutyTab('issues')}>
                            <span className="coor-metric-label">Distress Tickets</span>
                            <span className="coor-metric-val">{stats.activeIssues} Open</span>
                            <span className="coor-metric-sub">View Tickets →</span>
                        </div>
                    </div>

                    {/* 4. 🚀 2x2 QUICK ACTION LAUNCHPAD (MATCHING IMAGE 3) */}
                    <div className="quick-duty-launchpad">
                        <div className="launchpad-grid">
                            <div className="launch-card" onClick={() => setDutyTab('scanner')}>
                                <FaQrcode className="launch-icon scanner" />
                                <h4>Mess Scanner</h4>
                                <p>QR verification for meals</p>
                            </div>
                            <div className="launch-card" onClick={() => setDutyTab('timer')}>
                                <FaClock className="launch-icon timer" />
                                <h4>Break Timer</h4>
                                <p>Synchronized clock count</p>
                            </div>
                            <div className="launch-card" onClick={() => setDutyTab('seats')}>
                                <FaChair className="launch-icon seats" />
                                <h4>Seating Matrix</h4>
                                <p>Table allocations & squads</p>
                            </div>
                            <div className="launch-card" onClick={() => setDutyTab('issues')}>
                                <FaExclamationTriangle className="launch-icon issues" />
                                <h4>Distress Desk</h4>
                                <p>Participant table tickets</p>
                            </div>
                        </div>
                    </div>

                    {/* 5. 📝 ASSIGNED TASKS CHECKLIST (WITH ASSIGN MODAL FOR NIHAT / MASTER ADMIN) */}
                    <div className="tasks-section-container">
                        <div className="section-header-flex">
                            <div>
                                <span className="section-micro-tag">ADMIN DIRECTIVES</span>
                                <h3 className="section-main-heading">
                                    <FaTasks /> Assigned Tasks ({tasks.length})
                                </h3>
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                {adminId.toLowerCase().includes('nihal') && (
                                    <button 
                                        className="coor-mini-action-btn assign-btn"
                                        onClick={() => setShowAssignTaskModal(true)}
                                        title="Assign New Task to Coordinator"
                                    >
                                        ➕ Assign
                                    </button>
                                )}
                                <button className="coor-mini-action-btn" onClick={fetchTasks}>
                                    <FaSync />
                                </button>
                            </div>
                        </div>

                        {loadingTasks ? (
                            <div className="tasks-loading-state">
                                <div className="pulse-spinner" />
                                <p>Syncing assigned duty directives...</p>
                            </div>
                        ) : tasks.length === 0 ? (
                            <div className="tasks-empty-state">
                                <FaCheckCircle className="empty-check-icon" />
                                <h4>All Floor Duties Cleared!</h4>
                                <p>No pending operational tasks assigned currently.</p>
                            </div>
                        ) : (
                            <div className="tasks-card-list">
                                {tasks.map((task, idx) => {
                                    const isDone = task.status === 'COMPLETED';
                                    return (
                                        <div key={idx} className={`duty-task-card ${isDone ? 'completed' : ''}`}>
                                            <div className="task-card-header">
                                                <span className={`task-badge ${task.priority.toLowerCase()}`}>
                                                    {task.priority}
                                                </span>
                                                <span className="task-timing">⏰ {task.dueTime}</span>
                                            </div>

                                            <h4 className="task-main-title">{task.title}</h4>
                                            {task.description && (
                                                <p className="task-main-desc">{task.description}</p>
                                            )}

                                            <div className="task-card-footer">
                                                <span className="task-assigned-by">To: {task.coordinatorName || task.assignedTo}</span>
                                                <button 
                                                    className={`task-toggle-btn ${isDone ? 'done' : 'pending'}`}
                                                    onClick={() => handleToggleTaskStatus(task._id, task.status)}
                                                >
                                                    {isDone ? '✓ Completed' : 'Mark Completed'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ==================================================== */}
            {/* VIEW 2: 📱 QR SCANNER (FOOD & MESS)                  */}
            {/* ==================================================== */}
            {dutyTab === 'scanner' && (
                <div className="coor-pane-view">
                    <FoodScannerPage />
                </div>
            )}

            {/* ==================================================== */}
            {/* VIEW 3: ⏱️ RESPONSIVE BREAK TIMER                   */}
            {/* ==================================================== */}
            {dutyTab === 'timer' && (
                <div className="coor-pane-view">
                    <BreakTimer />
                </div>
            )}

            {/* ==================================================== */}
            {/* VIEW 4: 🪑 WORKSTATIONS & SEATING                   */}
            {/* ==================================================== */}
            {dutyTab === 'seats' && (
                <div className="coor-pane-view">
                    <EventDayAdmin />
                </div>
            )}

            {/* ==================================================== */}
            {/* VIEW 5: 🚨 DISTRESS TICKETS                          */}
            {/* ==================================================== */}
            {dutyTab === 'issues' && (
                <div className="coor-pane-hub">
                    <div className="section-header-flex">
                        <div>
                            <span className="section-micro-tag">LIVE PARTICIPANT ASSISTANCE</span>
                            <h3 className="section-main-heading">
                                <FaExclamationTriangle /> Active Distress Tickets ({issues.filter(i => i.status === 'active').length})
                            </h3>
                        </div>
                        <button className="coor-mini-action-btn" onClick={fetchIssues}>
                            <FaSync /> Refresh
                        </button>
                    </div>

                    {loadingIssues ? (
                        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>Loading live issues...</p>
                    ) : issues.length === 0 ? (
                        <div className="tasks-empty-state">
                            <FaCheckCircle className="empty-check-icon" />
                            <h4>No Active Issues!</h4>
                            <p>All squad requests have been resolved smoothly.</p>
                        </div>
                    ) : (
                        <div className="issues-list-container">
                            {issues.map((issue) => (
                                <div key={issue._id} className={`issue-card ${issue.status}`}>
                                    <div className="issue-card-top">
                                        <span className="issue-table-badge">Table / Group #{issue.groupNumber}</span>
                                        <span className={`issue-status-pill ${issue.status}`}>
                                            {issue.status === 'active' ? '● Open Alert' : '✓ Resolved'}
                                        </span>
                                    </div>
                                    <p className="issue-desc-content">{issue.issueDescription}</p>
                                    <div className="issue-card-bottom">
                                        <span className="issue-time">
                                            {new Date(issue.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {issue.status === 'active' && (
                                            <button 
                                                className="resolve-ticket-btn"
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
            {/* VIEW 6: 🎛️ FULL ADMIN CONTROL                      */}
            {/* ==================================================== */}
            {dutyTab === 'admin_full' && (
                <div className="coor-pane-view coor-admin-mobile-wrapper">
                    <Admin />
                </div>
            )}

            {/* FLOATING MOBILE BOTTOM NAVIGATION DOCK */}
            <nav className="coor-bottom-nav">
                <button 
                    className={`coor-bottom-tab ${dutyTab === 'hub' ? 'active' : ''}`}
                    onClick={() => setDutyTab('hub')}
                >
                    <FaTasks className="bottom-icon" />
                    <span>Duty Hub</span>
                    {pendingTasksCount > 0 && <span className="bottom-badge">{pendingTasksCount}</span>}
                </button>
                <button 
                    className={`coor-bottom-tab ${dutyTab === 'scanner' ? 'active' : ''}`}
                    onClick={() => setDutyTab('scanner')}
                >
                    <FaQrcode className="bottom-icon" />
                    <span>Scanner</span>
                </button>
                <button 
                    className={`coor-bottom-tab ${dutyTab === 'timer' ? 'active' : ''}`}
                    onClick={() => setDutyTab('timer')}
                >
                    <FaClock className="bottom-icon" />
                    <span>Timer</span>
                </button>
                <button 
                    className={`coor-bottom-tab ${dutyTab === 'seats' ? 'active' : ''}`}
                    onClick={() => setDutyTab('seats')}
                >
                    <FaChair className="bottom-icon" />
                    <span>Seating</span>
                </button>
                <button 
                    className={`coor-bottom-tab ${dutyTab === 'issues' ? 'active' : ''}`}
                    onClick={() => setDutyTab('issues')}
                >
                    <FaExclamationTriangle className="bottom-icon" />
                    <span>Distress</span>
                    {stats.activeIssues > 0 && <span className="bottom-badge urgent">{stats.activeIssues}</span>}
                </button>
                <button 
                    className={`coor-bottom-tab ${dutyTab === 'admin_full' ? 'active' : ''}`}
                    onClick={() => setDutyTab('admin_full')}
                >
                    <FaChartBar className="bottom-icon" />
                    <span>Control</span>
                </button>
            </nav>
        </div>
    );
};

export default CoordinatorDutyPortal;
