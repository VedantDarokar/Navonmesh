import React, { useState, useEffect, useMemo, useRef } from 'react';
import { io } from 'socket.io-client';
import { FaSearch, FaUserEdit, FaTrash, FaCheckCircle, FaTimes, FaUsers, FaChair, FaSync, FaSignal } from 'react-icons/fa';
import '../Styles/admin.css'; // Reusing styles and adding specific ones
import bgVideo from '../assets/bg.mp4';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const EventDayAdmin = () => {
    const [loggedIn, setLoggedIn] = useState(false);
    const [adminInfo, setAdminInfo] = useState({ name: '', subRole: '' });
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTable, setSelectedTable] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [editingDetails, setEditingDetails] = useState({});
    const [socketConnected, setSocketConnected] = useState(false);
    const [verifiedSections, setVerifiedSections] = useState({
        team: false,
        leader: false,
        members: []
    });
    const [deploymentSuccess, setDeploymentSuccess] = useState(null);
    const socketRef = useRef(null);

    useEffect(() => {
        const token = sessionStorage.getItem('adminToken');
        if (token) {
            setAdminInfo({
                name: sessionStorage.getItem('adminName'),
                subRole: sessionStorage.getItem('adminSubRole')
            });
            setLoggedIn(true);
            fetchData(token);
        } else {
            window.location.href = '#/admin';
        }

        // Initialize Socket
        const socket = io(API_URL, {
            transports: ['websocket'],
            reconnectionAttempts: 10
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Connected to mission control');
            setSocketConnected(true);
        });

        socket.on('disconnect', () => {
            setSocketConnected(false);
        });

        socket.on('seat-updated', (data) => {
            console.log('Received live seat update:', data);
            setRegistrations(prev => {
                // First, check if this update is already reflected to avoid unnecessary re-renders
                const currentReg = prev.find(r => r._id === data.registrationId);
                if (currentReg && currentReg.tableNo === data.tableNo) return prev;

                return prev.map(reg => {
                    // Update the specific team
                    if (reg._id === data.registrationId) {
                        return { ...reg, groupNo: data.groupNo, tableNo: data.tableNo };
                    }
                    // If another team was at this table, unassign them (to avoid double allocation)
                    if (data.tableNo !== null && reg.tableNo === data.tableNo) {
                        return { ...reg, tableNo: null, groupNo: null };
                    }
                    return reg;
                });
            });
        });

        socket.on('team-detail-updated', (data) => {
            setRegistrations(prev => prev.map(reg =>
                reg._id === data.id ? { ...reg, ...data.details } : reg
            ));
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };

    }, []);

    const fetchData = async (token) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/data`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                // Only Srijan (Hackathon) teams are displayed in the Event Day panel
                setRegistrations(data.srijan.entries);
            }

        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

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
                // Update local state and broadcast via socket
                setRegistrations(prev => prev.map(reg => reg._id === id ? { ...reg, ...updates } : reg));
                if (socketRef.current) {
                    socketRef.current.emit('seat-update', {
                        registrationId: id,
                        groupNo: updates.groupNo || null,
                        tableNo: updates.tableNo || null
                    });
                }
                return true;
            }
        } catch (err) {
            console.error(err);
        }
        return false;
    };

    const tableGrid = useMemo(() => {
        const grid = Array.from({ length: 112 }, (_, i) => i + 1);
        return grid.map(num => {
            const occupant = registrations.find(r => r.tableNo === num);
            return { number: num, occupant };
        });
    }, [registrations]);

    const filteredParticipants = useMemo(() => {
        if (!searchTerm) return [];
        return registrations.filter(r =>
            r.teamName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.leaderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.leaderPhone?.includes(searchTerm)
        ).slice(0, 10);
    }, [searchTerm, registrations]);

    const handleTableClick = (table) => {
        setSelectedTable(table);
        if (table.occupant) {
            setEditingEntry(table.occupant);
            setEditingDetails({ ...table.occupant });
        } else {
            setEditingEntry(null);
            setSearchTerm('');
        }
        setVerifiedSections({
            team: false,
            leader: false,
            members: []
        });
        setShowEditModal(true);
    };

    const assignTeamToTable = (entry) => {
        // Instead of immediate assignment, open verification flow
        setEditingEntry(entry);
        setEditingDetails({
            ...entry,
            tableNo: selectedTable.number,
            groupNo: selectedTable.number
        });
        setVerifiedSections({
            team: false,
            leader: false,
            members: new Array(entry.members?.length || 0).fill(false)
        });
        setSearchTerm('');
    };

    const isFullyVerified = useMemo(() => {
        const membersOk = Object.keys(verifiedSections.members).length === (editingDetails.members?.length || 0)
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

    const handleAddMember = () => {
        setEditingDetails(prev => ({
            ...prev,
            members: [...(prev.members || []), { name: '', phone: '', college: '', email: '' }]
        }));
        setVerifiedSections(prev => ({
            ...prev,
            members: [...prev.members, false]
        }));
    };

    const handleRemoveMember = (idx) => {
        setEditingDetails(prev => {
            const newMembers = [...prev.members];
            newMembers.splice(idx, 1);
            return { ...prev, members: newMembers };
        });
        setVerifiedSections(prev => {
            const newMembersVerified = [...prev.members];
            newMembersVerified.splice(idx, 1);
            return { ...prev, members: newMembersVerified };
        });
    };


    const unassignTable = async () => {
        if (!editingEntry) return;
        const ok = await handleUpdateEntry(editingEntry._id, { tableNo: null, groupNo: null });
        if (ok) {
            setShowEditModal(false);
            setEditingEntry(null);
            setEditingDetails({});
        }
    };

    const saveDetails = async (e) => {
        e.preventDefault();
        const ok = await handleUpdateEntry(editingEntry._id, editingDetails);
        if (ok) {
            if (socketRef.current) {
                socketRef.current.emit('team-detail-update', { id: editingEntry._id, details: editingDetails });
            }
            setShowEditModal(false);
        }
    };


    if (!loggedIn) return null;

    return (
        <div className="admin-dashboard event-day-panel app-layout tactical-theme">
            <video className="global-bg-video" src={bgVideo} autoPlay loop muted playsInline />
            <div className="tactical-overlay"></div>

            <header className="admin-header tactical-header">
                <div className="admin-profile-info">
                    <div className="admin-welcome-line">
                        <div className="pulse-tag">MISSION CONNECTED</div>
                        <h2 className="admin-name-display tactical-title">NAVONMESH COMMAND CENTRAL <span className="version">v3.0</span></h2>
                    </div>
                </div>

                <div className="header-meta-stats">
                    <div className="meta-stat-item">
                        <div className="meta-label"><FaSignal /> SYSTEM LATENCY</div>
                        <div className="meta-value">24ms</div>
                    </div>
                    <div className={`meta-stat-item connection-badge ${socketConnected ? 'online' : 'offline'}`}>
                        <div className="meta-label">UPLINK STATUS</div>
                        <div className="meta-value">{socketConnected ? 'STABLE' : 'INTERRUPT'}</div>
                    </div>
                    <div className="status-indicator-dot small"></div>
                </div>

                <div className="admin-actions">
                    <button className="tactical-btn secondary" onClick={() => window.location.href = '#/admin'}>
                        <FaTimes /> ABORT OPS
                    </button>
                    <button className="refresh-btn tactical-refresh" onClick={() => fetchData(sessionStorage.getItem('adminToken'))}>
                        <FaSync className={loading ? 'spin' : ''} />
                    </button>
                </div>
            </header>

            <div className="admin-content tactical-content">
                {/* Stats Dashboard Top Bar */}
                <div className="tactical-stats-bar">
                    <div className="t-stat">
                        <span className="t-label">TOTAL TEAMS</span>
                        <span className="t-value">{registrations.length}</span>
                        <div className="t-progress" style={{ width: '100%' }}></div>
                    </div>
                    <div className="t-stat highlighted">
                        <span className="t-label">COMBAT READY (ASSIGNED)</span>
                        <span className="t-value">{registrations.filter(r => r.tableNo).length}</span>
                        <div className="t-progress" style={{ width: `${(registrations.filter(r => r.tableNo).length / Math.max(registrations.length, 1)) * 100}%` }}></div>
                    </div>
                    <div className="t-stat danger">
                        <span className="t-label">AWAITING ORDERS</span>
                        <span className="t-value">{registrations.filter(r => !r.tableNo).length}</span>
                        <div className="t-progress" style={{ width: `${(registrations.filter(r => !r.tableNo).length / Math.max(registrations.length, 1)) * 100}%` }}></div>
                    </div>
                </div>

                <div className="event-day-layout tactical-grid-container">
                    {/* Left: Operations Panel (Search) */}
                    <div className="ops-sidebar tactical-sidebar">
                        <div className="glass-box ops-search-box">
                            <div className="sidebar-header">
                                <FaSearch className="sidebar-header-icon" />
                                <h3>TARGET SEARCH</h3>
                            </div>
                            <div className="tactical-search-input">
                                <input
                                    type="text"
                                    placeholder="SCANNING FOR TARGETS (TEAM/LEADER)..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <div className="input-glow"></div>
                            </div>

                            <div className="search-results custom-scroll">
                                {filteredParticipants.length > 0 ? (
                                    filteredParticipants.map(r => (
                                        <div key={r._id} className="tactical-list-item" onClick={() => {
                                            setEditingEntry(r);
                                            setEditingDetails({ ...r });
                                            setVerifiedSections({
                                                team: false,
                                                leader: false,
                                                members: new Array(r.members?.length || 0).fill(false)
                                            });
                                            setSearchTerm(''); // Clear search on select
                                            setDeploymentSuccess(null);
                                        }}>
                                            <div className="item-main">
                                                <div className="item-name">{r.teamName}</div>
                                                <div className="item-sub">{r.leaderName}</div>
                                            </div>
                                            <div className={`item-badge ${r.tableNo ? 'assigned' : 'pending'}`}>
                                                {r.tableNo ? `STATION ${r.tableNo}` : 'PNDG'}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    searchTerm ? (
                                        <div className="no-results-tactical">NO TARGETS IN RANGE</div>
                                    ) : (
                                        <div className="search-placeholder-tactical">ENTER TELEMETRY DATA TO START SCAN</div>
                                    )
                                )}
                            </div>
                        </div>

                        <div className="glass-box connection-panel">
                            <div className="conn-title">COMMS TERMINAL</div>
                            <div className="conn-status-line">
                                <span className={`dot ${socketConnected ? 'online' : 'offline'}`}></span>
                                <span>{socketConnected ? 'ENCRYPTED CHANNEL ACTIVE' : 'RE-ESTABLISHING UPLINK...'}</span>
                            </div>
                            <div className="terminal-text">
                                &gt; Real-time data sync active.<br />
                                &gt; All stations monitoring changes.<br />
                                &gt; Protocol: WS-SECURE
                            </div>
                        </div>
                    </div>

                    {/* Right: Dynamic Interface (Verification, Success or Seating) */}
                    <div className="main-ops-interface glass-box">
                        {deploymentSuccess ? (
                            <div className="deployment-success-screen">
                                <div className="success-tactical-header">
                                    <div className="success-pulse">
                                        <FaCheckCircle className="success-big-icon" />
                                    </div>
                                    <h2>MISSION ACCOMPLISHED</h2>
                                    <div className="success-divider"></div>
                                </div>
                                <div className="success-details">
                                    <div className="success-row">
                                        <span className="s-label">OPERATIVE SQUAD</span>
                                        <span className="s-value">{deploymentSuccess.teamName}</span>
                                    </div>
                                    <div className="success-row">
                                        <span className="s-label">ASSIGNED STATION</span>
                                        <span className="s-value highlight-success">STATION {deploymentSuccess.tableNo}</span>
                                    </div>
                                    <div className="success-row">
                                        <span className="s-label">DEPLOYMENT STATUS</span>
                                        <span className="s-value">STABLE & VERIFIED</span>
                                    </div>
                                </div>
                                <div className="success-actions">
                                    <button className="tactical-submit ready" onClick={() => setDeploymentSuccess(null)}>
                                        <FaSync /> INITIATE NEXT DEPLOYMENT
                                    </button>
                                </div>
                            </div>
                        ) : editingEntry && !isFullyVerified ? (
                            <div className="verification-terminal">
                                <div className="tactical-header-sub">
                                    <div className="title-with-icon">
                                        <FaUserEdit className="header-icon" />
                                        <h3>DATA VERIFICATION: {editingEntry.teamName}</h3>
                                    </div>
                                    <div className="verification-header-actions">
                                        <button className="tactical-btn secondary sm" onClick={() => setEditingEntry(null)}>
                                            <FaTimes /> ABORT
                                        </button>
                                        {editingEntry.tableNo && (
                                            <button className="tactical-btn danger sm" onClick={unassignTable}>
                                                <FaTrash /> DISENGAGE
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="tactical-form-grid custom-scroll" style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '10px' }}>
                                    <div className="form-item span-2 section-verify-row">
                                        <div className="section-label-group">
                                            <label>TEAM & PROBLEM STATEMENT</label>
                                            <button type="button"
                                                className={`tally-btn ${verifiedSections.team ? 'verified' : ''}`}
                                                onClick={() => handleTally('team')}
                                            >
                                                {verifiedSections.team ? <><FaCheckCircle /> SECURE</> : 'VERIFY'}
                                            </button>
                                        </div>
                                        <div className="field-group">
                                            <select
                                                value={editingDetails.problemStatement || ''}
                                                onChange={e => setEditingDetails({ ...editingDetails, problemStatement: e.target.value })}
                                                className="tactical-select"
                                            >
                                                <option value="Problem Statement 1">Problem Statement 1</option>
                                                <option value="Problem Statement 2">Problem Statement 2</option>
                                                <option value="Student Innovation">Student Innovation</option>
                                            </select>
                                            <input type="text" placeholder="TEAM NAME" value={editingDetails.teamName || ''} onChange={e => setEditingDetails({ ...editingDetails, teamName: e.target.value })} />
                                            <input type="text" placeholder="ORIGIN COLLEGE" value={editingDetails.college || ''} onChange={e => setEditingDetails({ ...editingDetails, college: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="form-item span-2 section-verify-row">
                                        <div className="section-label-group">
                                            <label>SQUAD LEADER VERIFICATION</label>
                                            <button type="button"
                                                className={`tally-btn ${verifiedSections.leader ? 'verified' : ''}`}
                                                onClick={() => handleTally('leader')}
                                            >
                                                {verifiedSections.leader ? <><FaCheckCircle /> SECURE</> : 'VERIFY'}
                                            </button>
                                        </div>
                                        <div className="field-group-multi">
                                            <input type="text" placeholder="LEADER NAME" value={editingDetails.leaderName || ''} onChange={e => setEditingDetails({ ...editingDetails, leaderName: e.target.value })} />
                                            <input type="text" placeholder="PHONE" value={editingDetails.leaderPhone || ''} onChange={e => setEditingDetails({ ...editingDetails, leaderPhone: e.target.value })} />
                                            <input type="text" placeholder="EMAIL" value={editingDetails.leaderEmail || ''} onChange={e => setEditingDetails({ ...editingDetails, leaderEmail: e.target.value })} />
                                        </div>
                                    </div>

                                    {editingDetails.members?.map((member, idx) => (
                                        <div key={idx} className="form-item span-2 section-verify-row member-row">
                                            <div className="section-label-group">
                                                <label>OPERATIVE {idx + 2}</label>
                                                <div className="section-actions">
                                                    {editingDetails.members.length > 0 && (
                                                        <button type="button"
                                                            className="tactical-btn danger sm"
                                                            style={{ marginRight: '10px', padding: '4px 8px' }}
                                                            onClick={() => handleRemoveMember(idx)}
                                                        >
                                                            <FaTrash style={{ fontSize: '0.7rem' }} />
                                                        </button>
                                                    )}
                                                    <button type="button"
                                                        className={`tally-btn ${verifiedSections.members[idx] ? 'verified' : ''}`}
                                                        onClick={() => handleTally('members', idx)}
                                                    >
                                                        {verifiedSections.members[idx] ? <><FaCheckCircle /> SECURE</> : 'VERIFY'}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="field-group-multi">
                                                <input type="text" placeholder="NAME" value={member.name || ''} onChange={e => {
                                                    const m = [...editingDetails.members]; m[idx].name = e.target.value; setEditingDetails({ ...editingDetails, members: m });
                                                }} />
                                                <input type="text" placeholder="PHONE" value={member.phone || ''} onChange={e => {
                                                    const m = [...editingDetails.members]; m[idx].phone = e.target.value; setEditingDetails({ ...editingDetails, members: m });
                                                }} />
                                                <input type="text" placeholder="COLLEGE" value={member.college || ''} onChange={e => {
                                                    const m = [...editingDetails.members]; m[idx].college = e.target.value; setEditingDetails({ ...editingDetails, members: m });
                                                }} />
                                            </div>
                                            <div className="field-group-solo">
                                                <input type="text" placeholder="EMAIL" value={member.email || ''} onChange={e => {
                                                    const m = [...editingDetails.members]; m[idx].email = e.target.value; setEditingDetails({ ...editingDetails, members: m });
                                                }} />
                                            </div>
                                        </div>
                                    ))}

                                    <div className="form-item span-2 add-member-container" style={{ textAlign: 'center', marginBottom: '10px' }}>
                                        <button
                                            type="button"
                                            className="tactical-btn secondary sm"
                                            onClick={handleAddMember}
                                            style={{ width: '100%', padding: '12px', borderStyle: 'dashed', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.05)' }}
                                        >
                                            <FaUsers style={{ marginRight: '8px' }} /> ADD NEW OPERATIVE (MEMBER)
                                        </button>
                                    </div>

                                    <div className="form-item span-2 section-verify-row payment-row pre-verified">
                                        <div className="section-label-group">
                                            <label>PAYMENT STATUS (UTR)</label>
                                            <div className="verification-status cleared">
                                                <FaCheckCircle /> PRE-VERIFIED
                                            </div>
                                        </div>
                                        <div className="utr-readout">
                                            <div className="utr-label">VERIFIED UTR:</div>
                                            <div className="utr-value">{editingDetails.utrNumber || 'NOT FOUND'}</div>
                                        </div>
                                    </div>

                                    <div className="verification-footer">
                                        <div className={`status-badge ${isFullyVerified ? 'ready' : 'pending'}`}>
                                            {isFullyVerified ? 'VERIFICATION COMPLETE: READY FOR ALLOTMENT' : 'AWAITING FULL DATA CLEARANCE...'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid-section">
                                <div className="section-header tactical-header-sub">
                                    <div className="title-with-icon">
                                        <FaChair className="header-icon" />
                                        <h3>
                                            {isFullyVerified ? (
                                                <span className="allotment-alert">SELECT DEPLOYMENT STATION FOR: {editingDetails.teamName}</span>
                                            ) : 'SEATING GRID'}
                                            {!isFullyVerified && <span className="count-label"> 1-112</span>}
                                        </h3>
                                    </div>
                                    <div className="legend-pills">
                                        {isFullyVerified && <button className="tactical-btn secondary sm" style={{ marginRight: '15px' }} onClick={() => setVerifiedSections(p => ({ ...p, team: false }))}><FaSync /> RE-VERIFY</button>}
                                        <span className="pill available">VACANT</span>
                                        <span className="pill occupied">ENGAGED</span>
                                    </div>
                                </div>
                                <div className={`tactical-grid-wrapper ${isFullyVerified ? 'allotment-mode' : ''}`}>
                                    <div className="tactical-grid-side left">
                                        {tableGrid.slice(60, 88).map(t => (
                                            <div
                                                key={t.number}
                                                className={`tactical-cell ${t.occupant ? 'occupied' : 'vacant'} ${isFullyVerified ? 'can-allot' : ''}`}
                                                onClick={() => {
                                                    if (isFullyVerified) {
                                                        const updatePayload = {
                                                            ...editingDetails,
                                                            tableNo: t.number,
                                                            groupNo: t.number
                                                        };
                                                        handleUpdateEntry(editingDetails._id, updatePayload).then(ok => {
                                                            if (ok) {
                                                                setDeploymentSuccess(updatePayload);
                                                                setEditingEntry(null);
                                                            }
                                                        });
                                                    } else {
                                                        handleTableClick(t);
                                                    }
                                                }}
                                            >
                                                <div className="cell-corner top-left"></div>
                                                <div className="cell-corner bottom-right"></div>
                                                <span className="cell-num">{t.number.toString().padStart(2, '0')}</span>
                                                {t.occupant && (
                                                    <div className="cell-occupant">
                                                        <span className="occ-name">{t.occupant.teamName}</span>
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
                                        {tableGrid.slice(88, 112).map(t => (
                                            <div
                                                key={t.number}
                                                className={`tactical-cell ${t.occupant ? 'occupied' : 'vacant'} ${isFullyVerified ? 'can-allot' : ''}`}
                                                onClick={() => {
                                                    if (isFullyVerified) {
                                                        const updatePayload = {
                                                            ...editingDetails,
                                                            tableNo: t.number,
                                                            groupNo: t.number
                                                        };
                                                        handleUpdateEntry(editingDetails._id, updatePayload).then(ok => {
                                                            if (ok) {
                                                                setDeploymentSuccess(updatePayload);
                                                                setEditingEntry(null);
                                                            }
                                                        });
                                                    } else {
                                                        handleTableClick(t);
                                                    }
                                                }}
                                            >
                                                <div className="cell-corner top-left"></div>
                                                <div className="cell-corner bottom-right"></div>
                                                <span className="cell-num">{t.number.toString().padStart(2, '0')}</span>
                                                {t.occupant && (
                                                    <div className="cell-occupant">
                                                        <span className="occ-name">{t.occupant.teamName}</span>
                                                        <div className="occ-scanner"></div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="tactical-road"></div>

                                    <div className="tactical-grid-side right">
                                        {tableGrid.slice(0, 28).map(t => (
                                            <div
                                                key={t.number}
                                                className={`tactical-cell ${t.occupant ? 'occupied' : 'vacant'} ${isFullyVerified ? 'can-allot' : ''}`}
                                                onClick={() => {
                                                    if (isFullyVerified) {
                                                        const updatePayload = {
                                                            ...editingDetails,
                                                            tableNo: t.number,
                                                            groupNo: t.number
                                                        };
                                                        handleUpdateEntry(editingDetails._id, updatePayload).then(ok => {
                                                            if (ok) {
                                                                setDeploymentSuccess(updatePayload);
                                                                setEditingEntry(null);
                                                            }
                                                        });
                                                    } else {
                                                        handleTableClick(t);
                                                    }
                                                }}
                                            >
                                                <div className="cell-corner top-left"></div>
                                                <div className="cell-corner bottom-right"></div>
                                                <span className="cell-num">{t.number.toString().padStart(2, '0')}</span>
                                                {t.occupant && (
                                                    <div className="cell-occupant">
                                                        <span className="occ-name">{t.occupant.teamName}</span>
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
                                        {tableGrid.slice(28, 60).map(t => (
                                            <div
                                                key={t.number}
                                                className={`tactical-cell ${t.occupant ? 'occupied' : 'vacant'} ${isFullyVerified ? 'can-allot' : ''}`}
                                                onClick={() => {
                                                    if (isFullyVerified) {
                                                        const updatePayload = {
                                                            ...editingDetails,
                                                            tableNo: t.number,
                                                            groupNo: t.number
                                                        };
                                                        handleUpdateEntry(editingDetails._id, updatePayload).then(ok => {
                                                            if (ok) {
                                                                setDeploymentSuccess(updatePayload);
                                                                setEditingEntry(null);
                                                            }
                                                        });
                                                    } else {
                                                        handleTableClick(t);
                                                    }
                                                }}
                                            >
                                                <div className="cell-corner top-left"></div>
                                                <div className="cell-corner bottom-right"></div>
                                                <span className="cell-num">{t.number.toString().padStart(2, '0')}</span>
                                                {t.occupant && (
                                                    <div className="cell-occupant">
                                                        <span className="occ-name">{t.occupant.teamName}</span>
                                                        <div className="occ-scanner"></div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal only for Edit Details of existing occupants */}
            {showEditModal && editingEntry && (
                <div className="tactical-modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="tactical-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-tactical-header">
                            <div className="modal-title-group">
                                <div className="modal-tag">STATION MODIFICATION</div>
                                <h3>MANAGING: {editingEntry.teamName}</h3>
                            </div>
                            <button className="modal-exit" onClick={() => setShowEditModal(false)}><FaTimes /></button>
                        </div>

                        <div className="modal-tactical-body">
                            <form className="tactical-form" onSubmit={saveDetails}>
                                <div className="station-control-bar">
                                    <div className="station-label">CURRENT STATION: <span>{editingEntry.tableNo || 'UNASSIGNED'}</span></div>
                                    <button type="button" className="tactical-unassign" onClick={unassignTable}>
                                        <FaTrash /> DISENGAGE STATION
                                    </button>
                                </div>
                                {/* Rest of edit form... (Minimal for quick edits) */}
                                <div className="tactical-form-grid">
                                    <div className="form-item span-2">
                                        <label>TEAM IDENTIFIER</label>
                                        <input type="text" value={editingDetails.teamName} onChange={e => setEditingDetails({ ...editingDetails, teamName: e.target.value })} />
                                    </div>
                                </div>
                                <button type="submit" className="tactical-submit ready">SAVE CHANGES</button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .tactical-theme {
                    --neon-green: #10b981;
                    --neon-blue: #3b82f6;
                    --neon-purple: #8b5cf6;
                    --neon-red: #ef4444;
                    --bg-deep: #020617;
                    --glass: rgba(15, 23, 42, 0.7);
                    --glass-border: rgba(255, 255, 255, 0.1);
                    font-family: 'Inter', sans-serif;
                    color: #f8fafc;
                }

                .tactical-overlay {
                    position: fixed;
                    inset: 0;
                    background: radial-gradient(circle at center, transparent 0%, var(--bg-deep) 100%);
                    pointer-events: none;
                    z-index: 0;
                }

                .tactical-header {
                    background: rgba(2, 6, 23, 0.8) !important;
                    border-bottom: 2px solid var(--neon-purple);
                    box-shadow: 0 4px 30px rgba(0,0,0,0.5);
                    backdrop-filter: blur(10px);
                    padding: 1rem 2rem;
                    z-index: 10;
                }

                .tactical-title {
                    font-family: 'Orbitron', sans-serif;
                    letter-spacing: 2px;
                    color: var(--neon-purple);
                    text-shadow: 0 0 15px rgba(139, 92, 246, 0.5);
                }

                .tactical-title .version {
                    font-size: 0.7rem;
                    background: var(--neon-purple);
                    color: white;
                    padding: 2px 6px;
                    border-radius: 4px;
                    margin-left: 10px;
                    vertical-align: middle;
                }

                .header-meta-stats {
                    display: flex;
                    gap: 30px;
                    margin: 0 auto 0 40px;
                }

                .meta-stat-item {
                    display: flex;
                    flex-direction: column;
                }

                .meta-label {
                    font-size: 0.6rem;
                    color: #64748b;
                    font-weight: 800;
                    letter-spacing: 1px;
                }

                .meta-value {
                    font-family: 'Orbitron', monospace;
                    font-size: 0.8rem;
                    color: var(--neon-blue);
                }

                .connection-badge.online .meta-value { color: var(--neon-green); }
                .connection-badge.offline .meta-value { color: var(--neon-red); }

                .tactical-stats-bar {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                    margin-bottom: 25px;
                    z-index: 5;
                    position: relative;
                }

                .t-stat {
                    background: var(--glass);
                    border: 1px solid var(--glass-border);
                    padding: 15px 20px;
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    overflow: hidden;
                }

                .t-stat.highlighted { border-color: rgba(16, 185, 129, 0.3); }
                .t-stat.danger { border-color: rgba(239, 68, 68, 0.3); }

                .t-label { font-size: 0.7rem; font-weight: 900; color: #94a3b8; letter-spacing: 1px; margin-bottom: 5px; }
                .t-value { font-size: 1.8rem; font-family: 'Orbitron', sans-serif; font-weight: 900; }
                .t-progress { position: absolute; bottom: 0; left: 0; height: 3px; background: var(--neon-blue); transition: width 1s; }
                .highlighted .t-progress { background: var(--neon-green); box-shadow: 0 0 10px var(--neon-green); }
                .danger .t-progress { background: var(--neon-red); }

                .tactical-grid-container {
                    display: grid;
                    grid-template-columns: 350px 1fr;
                    gap: 25px;
                    align-items: start;
                    position: relative;
                    z-index: 5;
                }

                .glass-box {
                    background: var(--glass);
                    border: 1px solid var(--glass-border);
                    border-radius: 16px;
                    backdrop-filter: blur(12px);
                    padding: 20px;
                }

                .tactical-header-sub {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    padding-bottom: 15px;
                    margin-bottom: 15px;
                }

                .title-with-icon { display: flex; align-items: center; gap: 12px; }
                .header-icon { color: var(--neon-purple); font-size: 1.2rem; }
                .tactical-header-sub h3 { margin: 0; font-family: 'Orbitron', sans-serif; font-size: 1rem; letter-spacing: 1px; }

                .legend-pills { display: flex; gap: 10px; }
                .pill { font-size: 0.6rem; font-weight: 900; padding: 4px 10px; border-radius: 4px; border: 1px solid; }
                .pill.available { color: var(--neon-blue); border-color: rgba(59, 130, 246, 0.3); background: rgba(59, 130, 246, 0.1); }
                .pill.occupied { color: var(--neon-green); border-color: rgba(16, 185, 129, 0.3); background: rgba(16, 185, 129, 0.1); }

                .tactical-grid-wrapper {
                    display: flex;
                    justify-content: space-between;
                    gap: 10px;
                    padding: 5px;
                    height: auto;
                    align-items: flex-start;
                }

                .tactical-grid-side {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 5px;
                    flex: 1;
                    direction: rtl; /* Start numbering from right side (top-right) */
                }

                .tactical-road {
                    width: 40px;
                    background: rgba(255,255,255,0.02);
                    border-left: 1px dashed rgba(255,255,255,0.1);
                    border-right: 1px dashed rgba(255,255,255,0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    align-self: stretch;
                    position: relative;
                }

                .tactical-horizontal-road {
                    grid-column: 1 / -1;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 15px;
                    margin: 5px 0;
                    opacity: 0.4;
                    direction: ltr; /* Ensure text isn't mirrored by parent RTL */
                }

                .tactical-horizontal-road span {
                    font-size: 0.5rem;
                    color: white;
                    letter-spacing: 3px;
                    font-weight: 900;
                    white-space: nowrap;
                    font-family: 'Orbitron', sans-serif;
                }

                .road-line {
                    flex: 1;
                    height: 1px;
                    background: repeating-linear-gradient(to right, rgba(255,255,255,0.1) 0, rgba(255,255,255,0.1) 5px, transparent 5px, transparent 10px);
                }

                .tactical-road::after {
                    content: 'ACCESS ROAD';
                    writing-mode: vertical-rl;
                    font-size: 0.5rem;
                    color: rgba(255,255,255,0.1);
                    letter-spacing: 5px;
                    text-transform: uppercase;
                }

                .tactical-cell {
                    aspect-ratio: 1;
                    direction: ltr;
                    background: rgba(30, 41, 59, 0.3);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 6px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                }

                .tactical-cell:hover {
                    background: rgba(139, 92, 246, 0.1);
                    border-color: var(--neon-purple);
                    transform: scale(1.05);
                    z-index: 2;
                }

                .tactical-cell.occupied {
                    background: rgba(16, 185, 129, 0.1);
                    border-color: rgba(16, 185, 129, 0.4);
                }

                .tactical-cell.occupied .cell-num { color: var(--neon-green); text-shadow: 0 0 8px var(--neon-green); }

                .cell-corner { position: absolute; width: 4px; height: 4px; border: 1px solid var(--neon-blue); opacity: 0.5; }
                .top-left { top: 2px; left: 2px; border-right: 0; border-bottom: 0; }
                .bottom-right { bottom: 2px; right: 2px; border-left: 0; border-top: 0; }

                .cell-num { font-family: 'Orbitron', monospace; font-size: 0.85rem; font-weight: 700; color: #475569; }
                
                .cell-occupant { 
                    position: absolute; bottom: 0; left: 0; right: 0; 
                    background: rgba(16, 185, 129, 0.2); 
                    padding: 2px; display: flex; flex-direction: column; align-items: center;
                }
                .occ-name { font-size: 0.45rem; font-weight: 800; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; text-transform: uppercase; }
                .occ-scanner { height: 1px; width: 100%; background: var(--neon-green); animation: scan 2s infinite linear; }

                @keyframes scan {
                    0% { transform: translateY(-2px); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateY(2px); opacity: 0; }
                }

                .tactical-search-input {
                    position: relative;
                    margin-bottom: 20px;
                }

                .tactical-search-input input {
                    width: 100%;
                    background: rgba(0,0,0,0.4);
                    border: 1px solid rgba(139, 92, 246, 0.3);
                    padding: 12px 15px;
                    border-radius: 8px;
                    color: var(--neon-blue);
                    font-family: 'Orbitron', sans-serif;
                    font-size: 0.75rem;
                    transition: all 0.3s;
                }

                .tactical-search-input input:focus {
                    outline: none;
                    border-color: var(--neon-blue);
                    box-shadow: 0 0 15px rgba(59, 130, 246, 0.2);
                    background: rgba(0,0,0,0.6);
                }

                .input-glow { position: absolute; bottom: 0; left: 50%; width: 0; height: 1px; background: var(--neon-blue); transition: all 0.3s; transform: translateX(-50%); }
                .tactical-search-input input:focus + .input-glow { width: 100%; }

                .tactical-list-item {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.05);
                    padding: 12px;
                    border-radius: 10px;
                    margin-bottom: 10px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .tactical-list-item:hover {
                    background: rgba(139, 92, 246, 0.1);
                    border-color: rgba(139, 92, 246, 0.3);
                    transform: translateX(5px);
                }

                .item-name { font-weight: 800; font-size: 0.85rem; color: #e2e8f0; }
                .item-sub { font-size: 0.7rem; color: #64748b; }
                .item-badge { 
                    font-family: 'Orbitron', sans-serif; font-size: 0.6rem; font-weight: 900; 
                    padding: 4px 8px; border-radius: 4px;
                }
                .item-badge.assigned { color: var(--neon-green); background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); }
                .item-badge.pending { color: #94a3b8; background: rgba(148, 163, 184, 0.1); border: 1px solid rgba(148, 163, 184, 0.3); }

                .connection-panel { margin-top: auto; padding: 15px; border-left: 2px solid var(--neon-blue); }
                .conn-title { font-size: 0.65rem; font-weight: 900; color: var(--neon-blue); letter-spacing: 2px; margin-bottom: 10px; }
                .terminal-text { font-family: 'Courier New', monospace; font-size: 0.7rem; color: #10b981; line-height: 1.6; opacity: 0.7; }

                .tactical-modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(2, 6, 23, 0.9);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 100;
                    animation: fadeIn 0.3s;
                }

                .tactical-modal-content {
                    background: var(--bg-deep);
                    border: 1px solid var(--neon-purple);
                    width: 90%;
                    max-width: 600px;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 0 50px rgba(139, 92, 246, 0.3);
                    position: relative;
                }

                .modal-tactical-header {
                    padding: 20px 25px;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: rgba(139, 92, 246, 0.1);
                }

                .modal-tag { color: var(--neon-purple); font-size: 0.6rem; font-weight: 900; letter-spacing: 3px; }
                .modal-tactical-header h3 { margin: 5px 0 0 0; font-family: 'Orbitron', sans-serif; font-size: 1.1rem; }

                .modal-exit { background: none; border: none; color: #64748b; font-size: 1.2rem; cursor: pointer; transition: color 0.2s; }
                .modal-exit:hover { color: var(--neon-red); }

                .modal-tactical-body { padding: 25px; max-height: 80vh; overflow-y: auto; }

                .tactical-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .form-item { display: flex; flex-direction: column; gap: 8px; }
                .form-item.span-2 { grid-column: span 2; }
                .form-item label { font-size: 0.65rem; font-weight: 900; color: #94a3b8; letter-spacing: 1px; }
                .form-item input, .tactical-select {
                    background: #111827;
                    border: 1px solid rgba(255,255,255,0.15);
                    padding: 12px;
                    border-radius: 8px;
                    color: white;
                    font-size: 0.9rem;
                    transition: all 0.3s;
                    cursor: pointer;
                }

                .tactical-select option {
                    background-color: #111827;
                    color: white;
                    padding: 10px;
                }

                .form-item input:focus, .tactical-select:focus { 
                    outline: none; 
                    border-color: var(--neon-blue); 
                    background: #1e293b;
                    box-shadow: 0 0 10px rgba(59, 130, 246, 0.2);
                }

                .form-divider {
                    grid-column: span 2;
                    padding: 8px 0;
                    border-bottom: 1px solid rgba(139, 92, 246, 0.2);
                    margin: 20px 0 5px 0;
                    color: var(--neon-purple);
                    font-weight: 900;
                    font-size: 0.75rem;
                    letter-spacing: 2px;
                }

                .station-control-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: rgba(255,255,255,0.02);
                    padding: 15px;
                    border-radius: 12px;
                    margin-bottom: 25px;
                }

                .station-label { font-family: 'Orbitron', sans-serif; font-size: 0.9rem; color: #94a3b8; }
                .station-label span { color: var(--neon-blue); text-shadow: 0 0 10px var(--neon-blue); }

                .tactical-unassign {
                    background: rgba(239, 68, 68, 0.1);
                    color: var(--neon-red);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    padding: 8px 15px;
                    border-radius: 8px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex; gap: 8px; align-items: center;
                }
                .tactical-unassign:hover { background: var(--neon-red); color: white; }

                .tactical-submit {
                    width: 100%;
                    padding: 18px;
                    background: linear-gradient(90deg, var(--neon-purple), var(--neon-blue));
                    border: none;
                    border-radius: 12px;
                    color: white;
                    font-family: 'Orbitron', sans-serif;
                    font-weight: 900;
                    letter-spacing: 2px;
                    cursor: pointer;
                    margin-top: 30px;
                    box-shadow: 0 5px 20px rgba(139, 92, 246, 0.3);
                }

                .tactical-submit:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(139, 92, 246, 0.5); }

                .no-results-tactical { text-align: center; color: var(--neon-red); padding: 20px; font-weight: 700; opacity: 0.8; }
                .search-placeholder-tactical { text-align: center; color: #64748b; padding: 20px; font-size: 0.8rem; font-style: italic; }

                .utr-display {
                    font-family: 'Orbitron', monospace;
                    color: var(--neon-blue);
                    font-size: 1.1rem;
                    font-weight: 900;
                    letter-spacing: 2px;
                    margin-top: 5px;
                }

                .section-verify-row {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    padding: 15px;
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .section-label-group {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    padding-bottom: 8px;
                }

                .tally-btn {
                    padding: 4px 12px;
                    font-size: 0.65rem;
                    font-weight: 900;
                    font-family: 'Orbitron', sans-serif;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: #94a3b8;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: 0.3s;
                }

                .tally-btn.verified {
                    background: rgba(16, 185, 129, 0.2);
                    border-color: var(--neon-green);
                    color: var(--neon-green);
                    box-shadow: 0 0 10px rgba(16, 185, 129, 0.2);
                }

                .field-group { display: flex; flex-direction: column; gap: 8px; }
                .field-group-multi { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
                .field-group-solo { width: 100%; }

                .utr-readout {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    background: rgba(59, 130, 246, 0.1);
                    padding: 10px 15px;
                    border-radius: 8px;
                }

                .utr-label { font-size: 0.65rem; font-weight: 900; color: var(--neon-blue); }
                .utr-value { font-family: 'Orbitron', monospace; font-size: 1rem; color: white; letter-spacing: 2px; }

                .tactical-submit.locked {
                    background: #1e293b;
                    color: #64748b;
                    cursor: not-allowed;
                    opacity: 0.7;
                    box-shadow: none;
                }

                .tactical-submit.ready {
                    background: linear-gradient(90deg, var(--neon-green), var(--neon-blue));
                    box-shadow: 0 5px 20px rgba(16, 185, 129, 0.3);
                }

                /* Verification UI Aesthetics */
                .verification-terminal {
                    animation: slideInRight 0.4s ease-out;
                    padding: 5px;
                }

                .verification-footer {
                    margin-top: 30px;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    padding-top: 20px;
                }

                .status-badge {
                    padding: 15px;
                    border-radius: 8px;
                    text-align: center;
                    font-family: 'Orbitron', sans-serif;
                    font-size: 0.8rem;
                    letter-spacing: 2px;
                    font-weight: 900;
                    transition: 0.4s;
                }

                .status-badge.pending {
                    background: rgba(239, 68, 68, 0.1);
                    color: var(--neon-red);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                }

                .status-badge.ready {
                    background: rgba(16, 185, 129, 0.1);
                    color: var(--neon-green);
                    border: 1px solid var(--neon-green);
                    box-shadow: 0 0 20px rgba(16, 185, 129, 0.2);
                }

                .verification-status.cleared {
                    color: var(--neon-green);
                    font-family: 'Orbitron', sans-serif;
                    font-size: 0.7rem;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 900;
                    text-shadow: 0 0 5px var(--neon-green);
                }

                .pre-verified {
                    border-left: 3px solid var(--neon-green) !important;
                    background: rgba(16, 185, 129, 0.05) !important;
                }

                .allotment-alert {
                    color: var(--neon-green);
                    text-shadow: 0 0 10px var(--neon-green);
                    animation: pulse 2s infinite;
                }

                /* Deployment Success Aesthetics */
                .deployment-success-screen {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    min-height: 500px;
                    text-align: center;
                    animation: zoomIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                .success-big-icon {
                    font-size: 5rem;
                    color: var(--neon-green);
                    filter: drop-shadow(0 0 20px var(--neon-green));
                    margin-bottom: 20px;
                }

                .success-pulse {
                    animation: pulse-glow 2s infinite;
                }

                .success-tactical-header h2 {
                    font-family: 'Orbitron', sans-serif;
                    letter-spacing: 5px;
                    color: white;
                    margin-bottom: 10px;
                }

                .success-divider {
                    height: 2px;
                    width: 100px;
                    background: linear-gradient(90deg, transparent, var(--neon-green), transparent);
                    margin: 0 auto 30px;
                }

                .success-details {
                    background: rgba(0, 0, 0, 0.4);
                    border: 1px solid rgba(16, 185, 129, 0.2);
                    padding: 30px;
                    border-radius: 16px;
                    width: 100%;
                    max-width: 500px;
                    margin-bottom: 40px;
                }

                .success-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 12px 0;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .success-row:last-child { border-bottom: none; }
                .s-label { color: #94a3b8; font-family: 'Orbitron', sans-serif; font-size: 0.7rem; letter-spacing: 1px; }
                .s-value { color: white; font-weight: bold; font-size: 0.9rem; }
                .highlight-success { color: var(--neon-green); font-family: 'Orbitron', sans-serif; font-size: 1.1rem !important; }

                @keyframes zoomIn {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }

                @keyframes pulse-glow {
                    0% { transform: scale(1); filter: drop-shadow(0 0 10px var(--neon-green)); }
                    50% { transform: scale(1.05); filter: drop-shadow(0 0 30px var(--neon-green)); }
                    100% { transform: scale(1); filter: drop-shadow(0 0 10px var(--neon-green)); }
                }

                .allotment-mode .tactical-cell.can-allot:hover {
                    border-color: var(--neon-green);
                    box-shadow: 0 0 15px var(--neon-green);
                    transform: scale(1.05);
                }

                .tactical-btn.sm { padding: 6px 12px; font-size: 0.7rem; }
                
                .verification-header-actions, .section-actions {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                }

                .tactical-btn.danger {
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid var(--neon-red);
                    color: var(--neon-red);
                }

                .tactical-btn.danger:hover {
                    background: var(--neon-red);
                    color: white;
                    box-shadow: 0 0 15px rgba(239, 68, 68, 0.4);
                }
                
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                @keyframes pulse {
                    0% { opacity: 0.6; }
                    50% { opacity: 1; }
                    100% { opacity: 0.6; }
                }

                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

                /* Custom Scrollbar */
                .custom-scroll::-webkit-scrollbar { width: 5px; }
                .custom-scroll::-webkit-scrollbar-track { background: transparent; }
                .custom-scroll::-webkit-scrollbar-thumb { background: rgba(139, 92, 246, 0.3); border-radius: 10px; }

                @media (max-width: 1200px) {
                    .tactical-grid { grid-template-columns: repeat(5, 1fr); }
                }

                @media (max-width: 1024px) {
                    .tactical-grid-container {
                        grid-template-columns: 1fr;
                    }
                    .ops-sidebar {
                        order: 2;
                    }
                }
            `}</style>
        </div>
    );
};

export default EventDayAdmin;
