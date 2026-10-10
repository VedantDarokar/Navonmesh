import React, { useState, useEffect } from 'react';
import { 
    FaShieldAlt, FaUserCheck, FaBell, FaCheckCircle, FaExclamationTriangle, 
    FaTasks, FaQrcode, FaClock, FaChair, FaChartBar, FaSync, FaUtensils, 
    FaPhone, FaBroadcastTower, FaTimes, FaArrowRight, FaFilter, FaCheck
} from 'react-icons/fa';
import '../Styles/coordinator_duty_portal.css';
import { getApiUrl } from '../utils/apiConfig';

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

    // Tasks & Alerts State
    const [tasks, setTasks] = useState([]);
    const [pendingTasksCount, setPendingTasksCount] = useState(0);
    const [loadingTasks, setLoadingTasks] = useState(false);
    const [showTaskAlertModal, setShowTaskAlertModal] = useState(false);
    const [alertDismissed, setAlertDismissed] = useState(false);

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

                // Show alert popup if there are pending tasks and not previously dismissed in this turn
                if (pending > 0 && !alertDismissed) {
                    setShowTaskAlertModal(true);
                }
            }
        } catch (err) {
            console.error('Failed to load coordinator tasks:', err);
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
            console.error('Failed to load issues:', err);
        } finally {
            setLoadingIssues(false);
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
        const interval = setInterval(() => {
            fetchTasks();
            fetchIssues();
        }, 15000); // 15-sec background sync
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
            {/* VIEW 1: 📋 DUTY HUB (WELCOME, TASKS & NOTIFICATIONS) */}
            {/* ==================================================== */}
            {dutyTab === 'hub' && (
                <div className="coor-pane-hub">
                    {/* WELCOME COORDINATOR HERO CARD */}
                    <div className="coor-welcome-hero-card">
                        <div className="hero-top-row">
                            <div>
                                <span className="hero-role-tag">OFFICIAL FEST DUTY</span>
                                <h2 className="hero-name-title">
                                    Welcome, Coordinator {adminName}!
                                </h2>
                                <p className="hero-duty-sub">
                                    Assigned Role: <strong>{adminSubRole}</strong>
                                </p>
                                <div className="hero-meta-pills">
                                    <span className="duty-status-badge on-duty">
                                        ● ACTIVE SHIFT ON-DUTY
                                    </span>
                                    <span className="duty-id-badge">
                                        ID: {adminId}
                                    </span>
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

                    {/* LIVE FEST METRICS OVERVIEW */}
                    <div className="coor-stats-grid">
                        <div className="stat-card">
                            <span className="stat-label">Checked-In Squads</span>
                            <span className="stat-number">{stats.checkedIn} / {stats.totalSquads}</span>
                            <span className="stat-progress">76% Reported</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-label">Meals Scanned Today</span>
                            <span className="stat-number">{stats.mealsScanned}</span>
                            <span className="stat-progress">Counters 1–4 Active</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-label">Distress Tickets</span>
                            <span className="stat-number urgent">{stats.activeIssues} Open</span>
                            <span className="stat-progress" onClick={() => setDutyTab('issues')} style={{ cursor: 'pointer', color: '#00f0ff' }}>
                                View Tickets →
                            </span>
                        </div>
                    </div>

                    {/* ASSIGNED TASKS CHECKLIST SECTION */}
                    <div className="tasks-section-container">
                        <div className="section-header-flex">
                            <div>
                                <span className="section-micro-tag">ADMIN DIRECTIVES</span>
                                <h3 className="section-main-heading">
                                    <FaTasks /> Assigned Coordinator Tasks ({tasks.length})
                                </h3>
                            </div>
                            <button className="coor-mini-action-btn" onClick={fetchTasks}>
                                <FaSync /> Sync
                            </button>
                        </div>

                        {loadingTasks ? (
                            <div className="tasks-loading-state">
                                <div className="pulse-spinner" />
                                <p>Loading assigned tasks from Admin Command...</p>
                            </div>
                        ) : tasks.length === 0 ? (
                            <div className="tasks-empty-state">
                                <FaCheckCircle className="empty-check-icon" />
                                <h4>All Duties Cleared!</h4>
                                <p>No pending operational tasks assigned currently. Stand by for floor alerts.</p>
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
                                                <span className="task-assigned-by">By: {task.assignedBy}</span>
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

                    {/* QUICK ACTION LAUNCHPAD */}
                    <div className="quick-duty-launchpad">
                        <span className="section-micro-tag">OPERATIONAL TOOLS</span>
                        <h3 className="section-main-heading">Quick Tool Launchpad</h3>

                        <div className="launchpad-grid">
                            <div className="launch-card" onClick={() => setDutyTab('scanner')}>
                                <FaQrcode className="launch-icon scanner" />
                                <h4>Mess Scanner</h4>
                                <p>Scan participant QR codes for breakfast, lunch, or dinner.</p>
                            </div>
                            <div className="launch-card" onClick={() => setDutyTab('timer')}>
                                <FaClock className="launch-icon timer" />
                                <h4>Break Timer</h4>
                                <p>Mobile-optimized countdown for lunch & coding sprints.</p>
                            </div>
                            <div className="launch-card" onClick={() => setDutyTab('seats')}>
                                <FaChair className="launch-icon seats" />
                                <h4>Seating Allocations</h4>
                                <p>Verify squad workstations and table numbers.</p>
                            </div>
                            <div className="launch-card" onClick={() => setDutyTab('issues')}>
                                <FaExclamationTriangle className="launch-icon issues" />
                                <h4>Distress Desk</h4>
                                <p>Resolve table alerts for LAN, power, or medical help.</p>
                            </div>
                        </div>
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
                <div className="coor-pane-view">
                    <Admin />
                </div>
            )}
        </div>
    );
};

export default CoordinatorDutyPortal;
