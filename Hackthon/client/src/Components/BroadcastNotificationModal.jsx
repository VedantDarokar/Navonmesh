import React, { useState, useEffect } from 'react';
import { 
    FaBroadcastTower, FaTimes, FaPaperPlane, FaBell, FaUsers, 
    FaShieldAlt, FaRocket, FaExclamationTriangle, FaUtensils, 
    FaClock, FaInfoCircle, FaTrash, FaCheckCircle, FaMobileAlt
} from 'react-icons/fa';
import '../Styles/broadcast_notification_modal.css';
import { getApiUrl } from '../utils/apiConfig';
import navonmeshLogo from '../assets/navonmesh_official_logo.png';

const BroadcastNotificationModal = ({ isOpen, onClose, adminUser, theme = 'theme-light' }) => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [target, setTarget] = useState('all'); // 'all' | 'coordinator' | 'participant'
    const [category, setCategory] = useState('announcement'); // 'announcement' | 'urgent' | 'meal' | 'schedule' | 'general'
    const [sending, setSending] = useState(false);
    const [statusFeedback, setStatusFeedback] = useState({ type: '', text: '' });
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const API_URL = getApiUrl();
    const senderId = (adminUser?.id || localStorage.getItem('adminId') || 'vedant.navonmesh').toLowerCase().trim();
    const senderName = adminUser?.name || (senderId.includes('nihal') ? 'Nihal Kankal (Overall Head)' : 'Vedant Darokar (Overall Head)');

    // Fetch past broadcasts
    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/notifications?role=all`);
            const data = await res.json();
            if (res.ok && data.success) {
                setHistory(data.notifications || []);
            }
        } catch (e) {
            console.error('Failed to load history:', e);
        } finally {
            setLoadingHistory(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchHistory();
            setStatusFeedback({ type: '', text: '' });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleBroadcast = async (e) => {
        e.preventDefault();
        if (!title.trim() || !message.trim()) {
            setStatusFeedback({ type: 'error', text: 'Please provide both title and announcement message.' });
            return;
        }

        setSending(true);
        setStatusFeedback({ type: '', text: '' });

        try {
            const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken') || '';
            const res = await fetch(`${API_URL}/api/admin/broadcast-notification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-admin-id': senderId
                },
                body: JSON.stringify({
                    senderId,
                    senderName,
                    title: title.trim(),
                    message: message.trim(),
                    target,
                    category
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setStatusFeedback({ type: 'success', text: `🚀 Notification broadcasted to ${target.toUpperCase()}!` });
                setTitle('');
                setMessage('');
                fetchHistory();

                // Trigger local notification preview on sender device too if permitted
                if ('Notification' in window && Notification.permission === 'granted') {
                    try {
                        new Notification(`[Navonmesh Broadcast] ${data.notification?.title || title}`, {
                            body: data.notification?.message || message,
                            icon: navonmeshLogo
                        });
                    } catch (err) {}
                }
            } else {
                setStatusFeedback({ type: 'error', text: data.message || 'Failed to broadcast notification.' });
            }
        } catch (err) {
            setStatusFeedback({ type: 'error', text: 'Network error connecting to broadcast service.' });
        } finally {
            setSending(false);
        }
    };

    const handleDelete = async (notifId) => {
        if (!window.confirm('Are you sure you want to revoke this broadcast?')) return;
        try {
            const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken') || '';
            const res = await fetch(`${API_URL}/api/admin/notifications/${notifId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-admin-id': senderId
                }
            });
            if (res.ok) {
                setHistory(prev => prev.filter(n => n._id !== notifId));
            }
        } catch (e) {
            console.error('Failed to revoke:', e);
        }
    };

    return (
        <div className={`broadcast-modal-backdrop ${theme}`}>
            <div className="broadcast-modal-dialog">
                {/* Modal Top Header */}
                <div className="bcast-modal-header">
                    <div className="bcast-header-title-flex">
                        <div className="bcast-icon-pulse">
                            <FaBroadcastTower />
                        </div>
                        <div>
                            <div className="bcast-authority-pill">
                                COMMAND AUTHORITY • {senderId.includes('nihal') ? 'NIHAL KANKAL' : 'VEDANT DAROKAR'}
                            </div>
                            <h3 className="bcast-title">Broadcast Notification</h3>
                            <p className="bcast-sub">Transmits live alert to coordinators and participants instantly</p>
                        </div>
                    </div>
                    <button className="bcast-close-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="bcast-modal-body">
                    {/* Broadcast Form */}
                    <form onSubmit={handleBroadcast} className="bcast-form">
                        {/* 1. Target Audience Selector */}
                        <div className="bcast-field-group">
                            <label className="bcast-label">TARGET AUDIENCE</label>
                            <div className="bcast-target-grid">
                                <button
                                    type="button"
                                    className={`bcast-target-btn ${target === 'all' ? 'active' : ''}`}
                                    onClick={() => setTarget('all')}
                                >
                                    <FaUsers />
                                    <span>All Fest (Everyone)</span>
                                </button>
                                <button
                                    type="button"
                                    className={`bcast-target-btn ${target === 'coordinator' ? 'active' : ''}`}
                                    onClick={() => setTarget('coordinator')}
                                >
                                    <FaShieldAlt />
                                    <span>Coordinators Only</span>
                                </button>
                                <button
                                    type="button"
                                    className={`bcast-target-btn ${target === 'participant' ? 'active' : ''}`}
                                    onClick={() => setTarget('participant')}
                                >
                                    <FaRocket />
                                    <span>Participants Only</span>
                                </button>
                            </div>
                        </div>

                        {/* 2. Alert Category */}
                        <div className="bcast-field-group">
                            <label className="bcast-label">ALERT CATEGORY</label>
                            <div className="bcast-cat-pills">
                                <button
                                    type="button"
                                    className={`bcast-cat-pill ${category === 'announcement' ? 'active' : ''}`}
                                    onClick={() => setCategory('announcement')}
                                >
                                    📢 Announcement
                                </button>
                                <button
                                    type="button"
                                    className={`bcast-cat-pill urgent ${category === 'urgent' ? 'active' : ''}`}
                                    onClick={() => setCategory('urgent')}
                                >
                                    🚨 Urgent Alert
                                </button>
                                <button
                                    type="button"
                                    className={`bcast-cat-pill meal ${category === 'meal' ? 'active' : ''}`}
                                    onClick={() => setCategory('meal')}
                                >
                                    🍱 Food / Mess
                                </button>
                                <button
                                    type="button"
                                    className={`bcast-cat-pill ${category === 'schedule' ? 'active' : ''}`}
                                    onClick={() => setCategory('schedule')}
                                >
                                    ⏱️ Schedule Shift
                                </button>
                                <button
                                    type="button"
                                    className={`bcast-cat-pill ${category === 'general' ? 'active' : ''}`}
                                    onClick={() => setCategory('general')}
                                >
                                    ℹ️ General Info
                                </button>
                            </div>
                        </div>

                        {/* 3. Title Input */}
                        <div className="bcast-field-group">
                            <label className="bcast-label">NOTIFICATION TITLE</label>
                            <input
                                type="text"
                                className="bcast-input-text"
                                placeholder="e.g., Round 1 Hackathon Coding Commencing Now!"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                maxLength={80}
                                required
                            />
                        </div>

                        {/* 4. Message Textarea */}
                        <div className="bcast-field-group">
                            <label className="bcast-label">MESSAGE / BODY</label>
                            <textarea
                                className="bcast-textarea"
                                placeholder="Type the broadcast message here. All target users will receive a push alert on their phones..."
                                rows={3}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                maxLength={300}
                                required
                            />
                            <div className="bcast-char-count">{message.length}/300</div>
                        </div>

                        {/* 5. Mobile Phone Preview */}
                        <div className="bcast-preview-card">
                            <div className="bcast-preview-header">
                                <FaMobileAlt />
                                <span>LIVE PHONE NOTIFICATION PREVIEW</span>
                            </div>
                            <div className="bcast-preview-banner">
                                <div className="bcast-preview-app-icon">
                                    <img src={navonmeshLogo} alt="Navonmesh" />
                                </div>
                                <div className="bcast-preview-text">
                                    <div className="bcast-preview-top-line">
                                        <strong className="bcast-preview-app-name">NAVONMESH MITRA</strong>
                                        <span className="bcast-preview-time">Just now</span>
                                    </div>
                                    <h5 className="bcast-preview-title">
                                        {title || 'Notification Title Preview'}
                                    </h5>
                                    <p className="bcast-preview-body">
                                        {message || 'Your custom message will appear here on every recipient phone in real time.'}
                                    </p>
                                    <div className="bcast-preview-tags">
                                        <span className={`bcast-ptag target ${target}`}>
                                            TO: {target.toUpperCase()}
                                        </span>
                                        <span className={`bcast-ptag cat ${category}`}>
                                            {category.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Feedback message */}
                        {statusFeedback.text && (
                            <div className={`bcast-feedback-box ${statusFeedback.type}`}>
                                {statusFeedback.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                                <span>{statusFeedback.text}</span>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="bcast-submit-btn"
                            disabled={sending || !title.trim() || !message.trim()}
                        >
                            <FaPaperPlane />
                            <span>
                                {sending 
                                    ? 'TRANSMITTING BROADCAST...' 
                                    : `SEND BROADCAST TO ${target.toUpperCase()}`}
                            </span>
                        </button>
                    </form>

                    {/* Broadcast History List */}
                    <div className="bcast-history-section">
                        <h4 className="bcast-history-heading">Recent Broadcast Transmissions</h4>
                        {loadingHistory ? (
                            <p className="bcast-empty">Loading history...</p>
                        ) : history.length === 0 ? (
                            <p className="bcast-empty">No broadcasts transmitted yet today.</p>
                        ) : (
                            <div className="bcast-history-list">
                                {history.map((item) => (
                                    <div key={item._id} className="bcast-history-item">
                                        <div className="bcast-h-top">
                                            <div className="bcast-h-badges">
                                                <span className={`bcast-h-target ${item.target}`}>
                                                    {item.target.toUpperCase()}
                                                </span>
                                                <span className={`bcast-h-cat ${item.category}`}>
                                                    {item.category.toUpperCase()}
                                                </span>
                                            </div>
                                            <button 
                                                className="bcast-h-delete-btn" 
                                                onClick={() => handleDelete(item._id)}
                                                title="Revoke notification"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                        <h5 className="bcast-h-title">{item.title}</h5>
                                        <p className="bcast-h-msg">{item.message}</p>
                                        <div className="bcast-h-meta">
                                            <span>By: {item.senderName}</span>
                                            <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BroadcastNotificationModal;
