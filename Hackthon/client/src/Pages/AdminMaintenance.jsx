import React, { useState, useEffect, useMemo, useRef } from 'react';
import { io } from 'socket.io-client';
import { FaSearch, FaUserEdit, FaTrash, FaCheckCircle, FaTimes, FaUsers, FaChair, FaSync, FaSignal } from 'react-icons/fa';
import '../Styles/admin_maintenance.css';
import bgVideo from '../assets/bg.mp4';

const AdminMaintenance = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [resolving, setResolving] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [socketConnected, setSocketConnected] = useState(false);
    const socketRef = useRef(null);

    // Verification/Allotment States
    const [selectedTable, setSelectedTable] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [editingDetails, setEditingDetails] = useState({});
    const [deploymentSuccess, setDeploymentSuccess] = useState(null);
    const [verifiedSections, setVerifiedSections] = useState({
        team: false,
        leader: false,
        members: []
    });

    const boxes = Array.from({ length: 100 }, (_, i) => i + 1);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const fetchData = async () => {
        const token = sessionStorage.getItem('adminToken');
        if (!token) return;
        
        try {
            // Fetch Srijan Data for Allotment
            const resData = await fetch(`${API_URL}/api/admin/data`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await resData.json();
            if (resData.ok) {
                setRegistrations(data.srijan.entries);
            }

            // Fetch Issues
            const response = await fetch(`${API_URL}/api/issues`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const issuesData = await response.json();
            if (response.ok) {
                setIssues(issuesData);
            }
            setLoading(false);
        } catch (error) {
            console.error('Failed to sync telemetry:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Socket Initialization for Live Sync
        const socket = io(API_URL, {
            transports: ['websocket'],
            reconnectionAttempts: 10
        });
        socketRef.current = socket;

        socket.on('connect', () => setSocketConnected(true));
        socket.on('disconnect', () => setSocketConnected(false));
        socket.on('seat-updated', (data) => {
            setRegistrations(prev => prev.map(reg => 
                reg._id === data.registrationId ? { ...reg, tableNo: data.tableNo } : 
                (data.tableNo && reg.tableNo && reg.tableNo === data.tableNo ? { ...reg, tableNo: null } : reg)
            ));
        });
        socket.on('team-detail-updated', (data) => {
            setRegistrations(prev => prev.map(reg => reg._id === data.id ? { ...reg, ...data.details } : reg));
        });

        const intervalId = setInterval(() => {
            if (document.visibilityState === 'visible') fetchData();
        }, 3000);

        // Instant fetch on window focus
        const handleFocus = () => fetchData();
        window.addEventListener('focus', handleFocus);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener('focus', handleFocus);
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, []);

    const handleUpdateEntry = async (id, updates) => {
        try {
            const token = sessionStorage.getItem('adminToken');
            const res = await fetch(`${API_URL}/api/admin/update-registration/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updates)
            });
            const data = await res.json();
            if (data.success) {
                setRegistrations(prev => prev.map(reg => reg._id === id ? { ...reg, ...updates } : reg));
                if (socketRef.current) {
                    socketRef.current.emit('seat-update', {
                        registrationId: id,
                        tableNo: updates.tableNo || null
                    });
                }
                return true;
            }
        } catch (err) { console.error(err); }
        return false;
    };

    const filteredParticipants = useMemo(() => {
        if (!searchTerm) return [];
        return registrations.filter(r =>
            r.teamName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.leaderName?.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 8);
    }, [searchTerm, registrations]);

    const isFullyVerified = useMemo(() => {
        const membersOk = verifiedSections.members.length === (editingDetails.members?.length || 0)
            ? verifiedSections.members.every(v => v === true)
            : false;
        return verifiedSections.team && verifiedSections.leader && (editingDetails.members?.length > 0 ? membersOk : true);
    }, [verifiedSections, editingDetails]);

    const handleTally = (section, index = null) => {
        setVerifiedSections(prev => {
            if (index !== null) {
                const newMembers = [...prev.members];
                newMembers[index] = !newMembers[index];
                return { ...prev, members: newMembers };
            }
            return { ...prev, [section]: !prev[section] };
        });
    };

    const markResolved = async (issueId) => {
        setResolving(issueId);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/issues/resolve/${issueId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                // Instantly remove it from local state to feel snappy
                setIssues(issues.filter(i => i._id !== issueId));
            } else {
                alert('Failed to resolve issue. Try again.')
            }
        } catch (error) {
            console.error('Failed to resolve issue:', error);
            alert('Error connecting to the system.');
        } finally {
            setResolving(null);
        }
    };

    return (
        <div className="maintenance-dashboard app-layout tactical-theme">
            <video className="global-bg-video" src={bgVideo} autoPlay loop muted playsInline />
            <div className="tactical-overlay"></div>

            <header className="maintenance-header tactical-header">
                <div className="admin-profile-info">
                    <div className="admin-welcome-line">
                        <div className="pulse-tag">MAINTENANCE UPLINK</div>
                        <h2 className="admin-name-display tactical-title">REGISTRATION & COMMAND CENTER <span className="version">v3.1</span></h2>
                    </div>
                </div>

                <div className="header-meta-stats">
                    <div className="meta-stat-item">
                        <div className="meta-label">UPLINK STATUS</div>
                        <div className={`meta-value ${socketConnected ? 'online' : 'offline'}`}>{socketConnected ? 'STABLE' : 'INTERRUPTED'}</div>
                    </div>
                    <div className="meta-stat-item">
                        <div className="meta-label">ACTIVE ALERTS</div>
                        <div className="meta-value" style={{ color: issues.length > 0 ? '#ef4444' : '#10b981' }}>{issues.length}</div>
                    </div>
                </div>

                <div className="admin-actions">
                    <button  className="tactical-btn" onClick={() => {
                            sessionStorage.clear();
                            window.location.hash = '/admin';
                        }}>LOGOUT</button>
                    <button className="tactical-btn secondary sm" onClick={fetchData}>
                        <FaSync className={loading ? 'spin' : ''} />
                    </button>
                </div>
            </header>

            <div className="maintenance-content tactical-content">
                <div className="tactical-grid-container" style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '25px' }}>
                    
                    {/* LEFT SIDEBAR: TEAM SEARCH & VERIFICATION */}
                    <div className="ops-sidebar tactical-sidebar glass-box" style={{ padding: '20px', borderRadius: '16px' }}>
                        <div className="sidebar-header" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
                            <FaSearch /> <h3>OPERATIVE SEARCH</h3>
                        </div>
                        
                        <div className="tactical-search-input" style={{ marginBottom: '20px' }}>
                            <input 
                                type="text" 
                                placeholder="SCAN TEAM OR LEADER..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                            />
                        </div>

                        <div className="search-results custom-scroll" style={{ maxHeight: 'calc(100vh - 350px)', overflowY: 'auto' }}>
                            {filteredParticipants.map(r => (
                                <div key={r._id} className="team-list-item" onClick={() => {
                                    setEditingEntry(r);
                                    setEditingDetails({ ...r });
                                    setVerifiedSections({ team: false, leader: false, members: new Array(r.members?.length || 0).fill(false) });
                                    setSearchTerm('');
                                    setDeploymentSuccess(null);
                                }} style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}>
                                    <div style={{ fontWeight: 'bold' }}>{r.teamName}</div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{r.leaderName}</div>
                                    <div className={`status-pill ${r.tableNo ? 'assigned' : 'pending'}`}>{r.tableNo ? `Station ${r.tableNo}` : 'Unassigned'}</div>
                                </div>
                            ))}
                        </div>

                        {editingEntry && (
                            <div className="current-operative-box" style={{ marginTop: '20px', padding: '15px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', border: '1px solid var(--neon-purple)' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--neon-purple)', fontWeight: 'bold' }}>SELECTED TARGET</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '5px 0' }}>{editingEntry.teamName}</div>
                                
                                <div className="verification-pill-group" style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '10px' }}>
                                    <button onClick={() => handleTally('team')} className={`min-pill ${verifiedSections.team ? 'ok' : ''}`}>TEAM</button>
                                    <button onClick={() => handleTally('leader')} className={`min-pill ${verifiedSections.leader ? 'ok' : ''}`}>LEADER</button>
                                    {isFullyVerified && <div className="allotment-ready-badge">READY TO ALLOT STATION</div>}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* MAIN GRID: MAINTENANCE & ALLOTMENT */}
                    <div className="main-command-area glass-box" style={{ padding: '20px', borderRadius: '16px' }}>
                        <div className="telemetry-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '10px' }}>
                            {boxes.map(num => {
                                const activeIssue = issues.find(i => Number(i.groupNumber) === num);
                                const occupant = registrations.find(r => Number(r.tableNo) === num);

                                return (
                                    <div
                                        key={num}
                                        className={`telemetry-box ${activeIssue ? 'alert-active blink' : ''} ${occupant ? 'occupied' : 'vacant'} ${isFullyVerified ? 'allot-mode' : ''}`}
                                        onClick={() => {
                                            if (isFullyVerified && !occupant) {
                                                handleUpdateEntry(editingEntry._id, { tableNo: num, groupNo: num }).then(ok => {
                                                    if (ok) {
                                                        setDeploymentSuccess({ teamName: editingEntry.teamName, tableNo: num });
                                                        setEditingEntry(null);
                                                    }
                                                });
                                            }
                                        }}
                                        style={{ 
                                            aspectRatio: '1', 
                                            background: activeIssue ? 'rgba(239, 68, 68, 0.2)' : (occupant ? 'rgba(16, 185, 129, 0.1)' : 'rgba(30, 41, 59, 0.3)'),
                                            border: activeIssue ? '1px solid #ef4444' : (occupant ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)'),
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            position: 'relative'
                                        }}
                                    >
                                        <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>GP {num}</span>
                                        {occupant && <div style={{ fontSize: '0.55rem', textAlign: 'center', fontWeight: 'bold', color: '#10b981', overflow: 'hidden', maxWidth: '90%' }}>{occupant.teamName.substring(0, 10)}</div>}
                                        {activeIssue && (
                                            <div className="alert-overlay" onClick={() => markResolved(activeIssue._id)} style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(239, 68, 68, 0.8)', color: '#fff', borderRadius: '8px', zIndex: 10 }}>
                                                <div style={{ fontSize: '0.6rem', fontWeight: 'bold' }}>DISTRESS</div>
                                                <button style={{ fontSize: '0.5rem', background: '#fff', color: '#000', border: 'none', padding: '2px 4px', borderRadius: '4px', marginTop: '2px' }}>ACK</button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* DEPLOYMENT SUCCESS POPUP */}
            {deploymentSuccess && (
                <div className="success-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="success-modal" style={{ background: '#111', padding: '40px', borderRadius: '20px', border: '2px solid #10b981', textAlign: 'center' }}>
                        <FaCheckCircle style={{ fontSize: '4rem', color: '#10b981', marginBottom: '20px' }} />
                        <h2 style={{ color: '#fff' }}>STATION SECURED</h2>
                        <p style={{ margin: '20px 0', fontSize: '1.2rem' }}>Team <strong>{deploymentSuccess.teamName}</strong> deployed to <strong>Station {deploymentSuccess.tableNo}</strong></p>
                        <button onClick={() => setDeploymentSuccess(null)} style={{ padding: '12px 30px', background: '#10b981', border: 'none', color: '#000', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>DISMISS</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMaintenance;
