import React, { useState, useEffect, useRef } from 'react';
import '../Styles/breakTimer.css';
import NavonmeshLogo from '../assets/namonvesh-logo.png';

const BreakTimer = () => {
    const [timeLeft, setTimeLeft] = useState(86400); // 24 hours
    const [isActive, setIsActive] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [password, setPassword] = useState('');
    const [pendingAction, setPendingAction] = useState(null); // 'start', 'pause', or 'reset'
    const [error, setError] = useState('');

    // Server Endpoints
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const CORRECT_PASSWORD = 'Nihal@1512';
    const timerRef = useRef(null);

    // Initial Sync & Periodical Sync
    useEffect(() => {
        syncWithServer();
        const syncInterval = setInterval(syncWithServer, 5000); // Sync every 5 seconds
        return () => clearInterval(syncInterval);
    }, []);

    // Local Timer Logic
    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isActive, timeLeft]);

    const syncWithServer = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/timer`);
            const data = await res.json();

            const now = Date.now();
            const serverEndTime = new Date(data.endTime).getTime();

            if (data.isActive) {
                const remaining = Math.max(0, Math.floor((serverEndTime - now) / 1000));
                setTimeLeft(remaining);
                setIsActive(true);
            } else {
                const pauseTime = data.pausedAt ? new Date(data.pausedAt).getTime() : now;
                const remaining = Math.max(0, Math.floor((serverEndTime - pauseTime) / 1000));
                setTimeLeft(remaining);
                setIsActive(false);
            }
        } catch (err) {
            console.error('Sync error:', err);
        }
    };

    const updateServer = async (updates) => {
        try {
            const token = sessionStorage.getItem('adminToken');
            await fetch(`${API_URL}/api/admin/timer/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updates)
            });
            syncWithServer(); // Pull back the exact final state
        } catch (err) {
            console.error('Update error:', err);
        }
    };

    const handleActionRequest = (action) => {
        const token = sessionStorage.getItem('adminToken');
        if (!token) {
            setError('ADMIN SESSION EXPIRED. PLEASE RE-LOGIN.');
            return;
        }
        setPendingAction(action);
        setShowPasswordModal(true);
        setError('');
        setPassword('');
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (password === CORRECT_PASSWORD) {
            const now = Date.now();
            if (pendingAction === 'start') {
                // Resume from where we are
                const newEndTime = now + (timeLeft * 1000);
                updateServer({ isActive: true, endTime: new Date(newEndTime), pausedAt: null });
            } else if (pendingAction === 'pause') {
                updateServer({ isActive: false, pausedAt: new Date(now) });
            } else if (pendingAction === 'reset') {
                const dayInMs = 86400 * 1000;
                updateServer({ isActive: false, endTime: new Date(now + dayInMs), pausedAt: new Date(now) });
            }
            setShowPasswordModal(false);
            setPendingAction(null);
            setPassword('');
        } else {
            setError('Access Denied');
        }
    };

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return {
            h: h.toString().padStart(2, '0'),
            m: m.toString().padStart(2, '0'),
            s: s.toString().padStart(2, '0')
        };
    };

    const { h, m, s } = formatTime(timeLeft);

    return (
        <div className="simple-timer-page">
            <div className="timer-wrapper">
                <div className="timer-header">
                    <div className="timer-badge-pill">
                        ⏱️ OFFICIAL FEST EVENT TIMER
                    </div>
                    <h2 className="timer-main-title">Hackathon Round & Break Timer</h2>
                    <div className={`status-glow-text ${isActive ? 'active' : ''}`}>
                        {isActive ? '● COUNTDOWN RUNNING' : '⏸ TIMER PAUSED'}
                    </div>
                </div>

                <div className="time-display-vertical">
                    <div className="time-block">
                        <span className="time-val">{h}</span>
                        <span className="time-lab">HOURS</span>
                    </div>
                    <div className="time-divider">:</div>
                    <div className="time-block">
                        <span className="time-val">{m}</span>
                        <span className="time-lab">MINUTES</span>
                    </div>
                    <div className="time-divider">:</div>
                    <div className="time-block">
                        <span className="time-val">{s}</span>
                        <span className="time-lab">SECONDS</span>
                    </div>
                </div>

                {/* Quick Presets */}
                <div className="timer-presets">
                    <button className="preset-chip" onClick={() => {
                        const now = Date.now();
                        updateServer({ isActive: true, endTime: new Date(now + 15 * 60 * 1000), pausedAt: null });
                    }}>15m Quick</button>
                    <button className="preset-chip" onClick={() => {
                        const now = Date.now();
                        updateServer({ isActive: true, endTime: new Date(now + 30 * 60 * 1000), pausedAt: null });
                    }}>30m Lunch</button>
                    <button className="preset-chip" onClick={() => {
                        const now = Date.now();
                        updateServer({ isActive: true, endTime: new Date(now + 45 * 60 * 1000), pausedAt: null });
                    }}>45m Dinner</button>
                    <button className="preset-chip" onClick={() => {
                        const now = Date.now();
                        updateServer({ isActive: true, endTime: new Date(now + 60 * 60 * 1000), pausedAt: null });
                    }}>1h Rest</button>
                </div>

                <div className="timer-actions">
                    {!isActive ? (
                        <button className="main-btn start" onClick={() => handleActionRequest('start')}>
                            ▶ START BREAK
                        </button>
                    ) : (
                        <button className="main-btn pause" onClick={() => handleActionRequest('pause')}>
                            ⏸ PAUSE BREAK
                        </button>
                    )}
                    <button className="reset-btn" onClick={() => {
                        handleActionRequest('reset');
                    }}>↺ RESET</button>
                </div>
            </div>

            {showPasswordModal && (
                <div className="pass-overlay">
                    <div className="pass-modal">
                        <h3>Security Check</h3>
                        <p>Enter password to {pendingAction}</p>
                        <form onSubmit={handlePasswordSubmit}>
                            <input
                                type="password"
                                placeholder="Password"
                                autoFocus
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            {error && <div className="pass-error">{error}</div>}
                            <div className="pass-btns">
                                <button type="submit" className="confirm">Confirm</button>
                                <button type="button" className="cancel" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BreakTimer;
