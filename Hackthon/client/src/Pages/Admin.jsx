import React, { useState, useEffect, useRef } from 'react';
import '../Styles/admin.css';
import bgVideo from '../assets/bg.mp4';
import { FaMusic, FaUsers, FaHotel, FaProjectDiagram, FaDesktop, FaChartPie, FaTable, FaSync, FaDownload, FaEye, FaTimes, FaCheckCircle } from 'react-icons/fa';
import * as XLSX from 'xlsx';

const Admin = () => {
    const [loggedIn, setLoggedIn] = useState(false);
    const [loginData, setLoginData] = useState({ id: '', password: '' });
    const [error, setError] = useState('');

    // Dashboard state
    const [summary, setSummary] = useState(null);
    const [activeEvent, setActiveEvent] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'messages'
    const [loading, setLoading] = useState(false);
    const [authLoading, setAuthLoading] = useState(false);
    const [adminInfo, setAdminInfo] = useState({ name: '', subRole: '' });
    const [accFilter, setAccFilter] = useState('ALL');
    const [srijanFilter, setSrijanFilter] = useState('ALL');
    const [culturalActivityFilter, setCulturalActivityFilter] = useState('ALL');
    const [culturalSubFilter, setCulturalSubFilter] = useState('ALL');
    const [ankurFilter, setAnkurFilter] = useState('ALL');
    const [adminId, setAdminId] = useState('');
    const [recruitment, setRecruitment] = useState({ count: 0, entries: [] });
    const [recruitFilter, setRecruitFilter] = useState('ALL');
    const [recruitSearch, setRecruitSearch] = useState('');

    // Management State
    const [activeManagementTab, setActiveManagementTab] = useState('Girls Accommodation');
    const [committeeMembers, setCommitteeMembers] = useState([]);
    const [managementAuth, setManagementAuth] = useState({ open: false, password: '', verified: false, error: '' });
    const [newMember, setNewMember] = useState({ name: '', phone: '' });

    const departments = ['Girls Accommodation', 'Boys Accommodation', 'FOOD', 'SRIJAN TEAM', 'ANKUR TEAM', 'DISCIPLINE TEAM'];

    const [broadcastData, setBroadcastData] = useState({
        subject: '',
        body: '',
        targetEvents: ['ALL'],
        recipientScope: 'LEADERS' // 'LEADERS' or 'ALL'
    });
    const [selectedRecipientIds, setSelectedRecipientIds] = useState([]); // List of IDs to send to
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [broadcasting, setBroadcasting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [revisedFilter, setRevisedFilter] = useState('ALL'); // 'ALL', 'REVISED', 'PENDING'
    const [editingPS, setEditingPS] = useState(null); // { id: '', value: '' }
    const [updatingPS, setUpdatingPS] = useState(false);

    const detailPanelRef = useRef(null);

    useEffect(() => {
        if (activeEvent && detailPanelRef.current) {
            detailPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [activeEvent]);

    useEffect(() => {
        const token = sessionStorage.getItem('adminToken');
        if (token) {
            setAdminId(sessionStorage.getItem('adminId') || '');
            setAdminInfo({
                name: sessionStorage.getItem('adminName'),
                subRole: sessionStorage.getItem('adminSubRole')
            });
            setLoggedIn(true);
            fetchData(token);
        }
    }, []);

    const handleLoginChange = (e) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
    };

    const handleMouseMove = (e) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / card.clientWidth) * 100;
        const y = ((e.clientY - rect.top) / card.clientHeight) * 100;
        card.style.setProperty('--mouse-x', `${x}%`);
        card.style.setProperty('--mouse-y', `${y}%`);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setAuthLoading(true);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await fetch(`${API_URL}/api/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData)
            });
            const data = await res.json();

            // Simulate hyperspace jump delay for the theme
            await new Promise(resolve => setTimeout(resolve, 1500));

            if (res.ok && data.success) {
                sessionStorage.setItem('adminToken', data.token);
                sessionStorage.setItem('adminName', data.adminInfo.name);
                sessionStorage.setItem('adminSubRole', data.adminInfo.subRole);
                sessionStorage.setItem('adminId', loginData.id);
                setAdminId(loginData.id);
                setAdminInfo(data.adminInfo);
                setLoggedIn(true);
                fetchData(data.token);
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('Server error');
        } finally {
            setAuthLoading(false);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('adminToken');
        sessionStorage.removeItem('adminName');
        sessionStorage.removeItem('adminSubRole');
        setLoggedIn(false);
        setSummary(null);
        setActiveEvent(null);
        setAdminInfo({ name: '', subRole: '' });
    };

    const downloadExcel = () => {
        if (!summary || !activeEvent) return;

        let displayEntries = summary[activeEvent].entries;

        if (activeEvent === 'accommodation' && accFilter !== 'ALL') {
            displayEntries = displayEntries.filter(e => e.event === accFilter);
        } else if (activeEvent === 'srijan' && srijanFilter !== 'ALL') {
            displayEntries = displayEntries.filter(e => e.problemStatement === srijanFilter);
        } else if (activeEvent === 'cultural' && culturalActivityFilter !== 'ALL') {
            displayEntries = displayEntries.filter(e => e.activity.toLowerCase().includes(culturalActivityFilter));
            if (culturalSubFilter !== 'ALL') {
                displayEntries = displayEntries.filter(e => e.activity.toLowerCase() === culturalSubFilter);
            }
        } else if (activeEvent === 'ankur' && ankurFilter !== 'ALL') {
            displayEntries = displayEntries.filter(e => e.category === ankurFilter);
        }

        // Map data for export
        let exportData = [];
        if (activeEvent === 'accommodation') {
            exportData = displayEntries.map((e, i) => ({
                '#': i + 1,
                'Event': e.event,
                'Team Name': e.teamName,
                'College': e.college,
                'Leader': e.leaderName,
                'Size': e.teamSize,
                'Girls': e.girls,
                'Boys': e.boys
            }));
        } else if (activeEvent === 'cultural') {
            exportData = displayEntries.map((e, i) => ({
                '#': i + 1,
                'Participant Name': e.participantName,
                'Class': e.className,
                'Activity': e.activity,
                'Member 2': e.member2Name ? `${e.member2Name} (${e.member2Class})` : '-',
                'Group Size': e.groupSize || '-',
                'Contact': e.contact,
                'Email': e.email
            }));
        } else {
            // Srijan, Ankur, Udbhav
            exportData = displayEntries.map((e, i) => ({
                '#': i + 1,
                'Group Name': e.teamName,
                'Leader Name': e.leaderName || 'N/A',
                'College': e.college || 'N/A',
                'Group Size': e.teamSize || 'N/A',
                'UTR Number': e.utrNumber || 'N/A',
                ...(activeEvent === 'ankur' ? { 'Category': e.category || 'N/A' } : {}),
                ...(activeEvent === 'srijan' ? { 'Problem Statement': e.problemStatement || 'N/A' } : {})
            }));
        }

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, activeEvent.toUpperCase());
        XLSX.writeFile(wb, `${activeEvent}_data_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const fetchData = async (token) => {
        setLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await fetch(`${API_URL}/api/admin/data`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setSummary(data);
                fetchCommittee();
                fetchRecruitment(token);
            } else {
                handleLogout();
            }
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const fetchRecruitment = async (token) => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const t = token || sessionStorage.getItem('adminToken');
            const res = await fetch(`${API_URL}/api/recruitment`, {
                headers: { 'Authorization': `Bearer ${t}` }
            });
            if (res.ok) {
                const data = await res.json();
                setRecruitment(data);
            }
        } catch (err) {
            console.error('Recruitment fetch error:', err);
        }
    };

    const handleDeleteRecruitment = async (id) => {
        if (!window.confirm('Remove this application?')) return;
        const token = sessionStorage.getItem('adminToken');
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await fetch(`${API_URL}/api/recruitment/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchRecruitment(token);
        } catch (err) { console.error(err); }
    };

    const handleSendRecruitmentMail = async (id, name, email) => {
        if (!window.confirm(`Send acknowledgment email to ${name} (${email})?`)) return;
        const token = sessionStorage.getItem('adminToken');
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await fetch(`${API_URL}/api/recruitment/${id}/send-mail`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok && data.success) {
                alert(`✅ ${data.message}`);
                // Update local state directly so button reflects "Sent" immediately
                setRecruitment(prev => ({
                    ...prev,
                    entries: prev.entries.map(entry =>
                        entry._id === id ? { ...entry, mailSent: true } : entry
                    )
                }));
            } else {
                alert(`❌ ${data.error || 'Failed to send email'}`);
            }
        } catch (err) {
            alert('Network error sending email');
            console.error(err);
        }
    };

    const handleSendAllRecruitmentMail = async () => {
        const unsent = recruitment.entries.filter(e => !e.mailSent);
        if (unsent.length === 0) {
            alert('All applicants have already been mailed!');
            return;
        }
        if (!window.confirm(`Send acknowledgment emails to all ${unsent.length} unsent applicant(s)?`)) return;
        const token = sessionStorage.getItem('adminToken');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        let successIds = [];
        let failCount = 0;
        for (const entry of unsent) {
            try {
                const res = await fetch(`${API_URL}/api/recruitment/${entry._id}/send-mail`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok && data.success) {
                    successIds.push(entry._id);
                } else {
                    failCount++;
                }
            } catch {
                failCount++;
            }
        }
        // Update local state for all successfully sent entries
        if (successIds.length > 0) {
            setRecruitment(prev => ({
                ...prev,
                entries: prev.entries.map(entry =>
                    successIds.includes(entry._id) ? { ...entry, mailSent: true } : entry
                )
            }));
        }
        alert(`✅ Sent: ${successIds.length}  ❌ Failed: ${failCount}`);
    };

    const downloadRecruitmentExcel = () => {
        const exportData = recruitment.entries.map((e, i) => ({
            '#': i + 1,
            'Name': e.name,
            'Contact No': e.contactNo,
            'Email': e.email,
            'Year': e.year,
            'Branch': e.branch || 'N/A',
            'Designation': e.designation,
            'Submitted At': new Date(e.submittedAt).toLocaleString('en-IN')
        }));
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Recruitment');
        XLSX.writeFile(wb, `recruitment_applications_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const fetchCommittee = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await fetch(`${API_URL}/api/admin/committee`);
            const data = await res.json();
            if (res.ok) setCommitteeMembers(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!newMember.name || !newMember.phone) return;
        const token = sessionStorage.getItem('adminToken');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        try {
            const res = await fetch(`${API_URL}/api/admin/committee/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-admin-id': adminId
                },
                body: JSON.stringify({ ...newMember, department: activeManagementTab })
            });
            if (res.ok) {
                setNewMember({ name: '', phone: '' });
                fetchCommittee();
            } else {
                const d = await res.json();
                alert(d.error);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteMember = async (id) => {
        if (!window.confirm('Remove from committee?')) return;
        const token = sessionStorage.getItem('adminToken');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        try {
            const res = await fetch(`${API_URL}/api/admin/committee/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-admin-id': adminId
                }
            });
            if (res.ok) fetchCommittee();
        } catch (err) {
            console.error(err);
        }
    };

    const handleManagementAuth = (e) => {
        e.preventDefault();
        if (managementAuth.password === 'Nihal@1512') {
            setManagementAuth({ ...managementAuth, verified: true, error: '', open: false });
            setActiveTab('management');
        } else {
            setManagementAuth({ ...managementAuth, error: 'Incorrect Access Code' });
        }
    };

    const handleSendBulkEmail = async (e) => {
        e.preventDefault();

        if (selectedRecipientIds.length === 0) {
            alert('Please select at least one recipient.');
            return;
        }

        if (!window.confirm(`Are you sure you want to broadcast this message to ${selectedRecipientIds.length} selected recipients?`)) return;

        setBroadcasting(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

            // Map selected IDs back to their details for the backend
            // Or just send the IDs and let backend handle it? 
            // Better to send specific recipient list to avoid any confusion
            const recipientsToSend = getAllAvailableRecipients()
                .filter(r => selectedRecipientIds.includes(r.id))
                .map(r => ({ id: r.id, email: r.email, name: r.name, team: r.team, type: r.type }));

            const res = await fetch(`${API_URL}/api/admin/send-bulk-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}`
                },
                body: JSON.stringify({
                    subject: broadcastData.subject,
                    body: broadcastData.body,
                    targetEvents: broadcastData.targetEvents,
                    recipientScope: broadcastData.recipientScope,
                    recipients: recipientsToSend // Send explicit list of leaders/groups
                })
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                setBroadcastData({ ...broadcastData, subject: '', body: '' });
                setSelectedRecipientIds([]);
            } else {
                alert(data.error || 'Broadcast failed');
            }
        } catch (err) {
            console.error(err);
            alert('Network error');
        }
        setBroadcasting(false);
    };

    const getAllAvailableRecipients = () => {
        if (!summary) return [];
        let list = [];

        const targets = broadcastData.targetEvents;
        const isAll = targets.includes('ALL');

        if (isAll || targets.includes('Srijan (Hackathon)')) {
            summary.srijan.entries.forEach(e => list.push({ id: e._id, name: e.leaderName, email: e.leaderEmail || 'N/A', team: e.teamName, type: 'Registration' }));
        }
        if (isAll || targets.includes('Ankur (Project Expo)')) {
            summary.ankur.entries.forEach(e => list.push({ id: e._id, name: e.leaderName, email: e.leaderEmail || 'N/A', team: e.teamName, type: 'Registration' }));
        }
        if (isAll || targets.includes('Udbhav (Conference)')) {
            summary.udbhav.entries.forEach(e => list.push({ id: e._id, name: e.leaderName, email: e.leaderEmail || 'N/A', team: e.teamName, type: 'Registration' }));
        }
        if (isAll || targets.includes('Cultural')) {
            summary.cultural.entries.forEach(e => list.push({ id: e._id, name: e.participantName, email: e.email || 'N/A', team: 'Cultural Team', type: 'Cultural' }));
        }
        if (isAll || targets.includes('Accommodation')) {
            summary.accommodation.entries.forEach(e => list.push({ id: e._id, name: e.leaderName, email: e.leaderEmail || 'N/A', team: e.teamName, type: 'Accommodation' }));
        }

        return list;
    };

    const toggleRecipient = (id) => {
        setSelectedRecipientIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const selectAllFiltered = () => {
        const available = getAllAvailableRecipients();
        const availableIds = available.map(r => r.id);
        const allSelected = availableIds.every(id => selectedRecipientIds.includes(id));

        if (allSelected) {
            // Deselect only the ones currently visible
            setSelectedRecipientIds(prev => prev.filter(id => !availableIds.includes(id)));
        } else {
            // Select all currently visible
            setSelectedRecipientIds(prev => [...new Set([...prev, ...availableIds])]);
        }
    };

    const handleSendMail = async (teamId, eventType) => {
        if (!window.confirm('Send confirmation email to this participant/team?')) return;

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const endpoint = eventType === 'cultural'
                ? `${API_URL}/api/admin/cultural/send-confirmation/${teamId}`
                : eventType === 'accommodation'
                    ? `${API_URL}/api/admin/accommodation/send-confirmation/${teamId}`
                    : `${API_URL}/api/admin/send-confirmation/${teamId}`;

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}`
                }
            });
            const data = await res.json();
            if (res.ok && data.success) {
                alert('Email sent successfully!');
                fetchData(sessionStorage.getItem('adminToken')); // Refresh data
            } else {
                alert(data.error || 'Failed to send email');
            }
        } catch (err) {
            console.error(err);
            alert('Error sending email');
        }
    };

    const handleVerifyRemaining = async () => {
        if (!summary || !activeEvent) return;

        let displayEntries = summary[activeEvent].entries;

        // Apply any active filters (same logic as table rendering)
        if (activeEvent === 'accommodation' && accFilter !== 'ALL') {
            displayEntries = displayEntries.filter(e => e.event === accFilter);
        } else if (activeEvent === 'srijan' && srijanFilter !== 'ALL') {
            displayEntries = displayEntries.filter(e => e.problemStatement === srijanFilter);
        } else if (activeEvent === 'cultural' && culturalActivityFilter !== 'ALL') {
            displayEntries = displayEntries.filter(e => e.activity.toLowerCase().includes(culturalActivityFilter));
            if (culturalSubFilter !== 'ALL') {
                displayEntries = displayEntries.filter(e => e.activity.toLowerCase() === culturalSubFilter);
            }
        } else if (activeEvent === 'ankur' && ankurFilter !== 'ALL') {
            displayEntries = displayEntries.filter(e => e.category === ankurFilter);
        }

        // Apply Search Filter
        if (searchTerm) {
            const lowSearch = searchTerm.toLowerCase();
            displayEntries = displayEntries.filter(e =>
                (e.teamName && e.teamName.toLowerCase().includes(lowSearch)) ||
                (e.leaderName && e.leaderName.toLowerCase().includes(lowSearch)) ||
                (e.participantName && e.participantName.toLowerCase().includes(lowSearch)) ||
                (e.utrNumber && e.utrNumber.toLowerCase().includes(lowSearch)) ||
                (e.college && e.college.toLowerCase().includes(lowSearch))
            );
        }

        const remainingEntries = displayEntries.filter(e => !e.paymentVerified);

        if (remainingEntries.length === 0) {
            alert('No remaining unverified entries in this view.');
            return;
        }

        if (!window.confirm(`Are you sure you want to verify and send confirmation emails to ALL ${remainingEntries.length} remaining teams in this view?`)) return;

        setLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const token = sessionStorage.getItem('adminToken');

            // We'll process them one by one or in parallel
            // Note: If there are many, a backend bulk endpoint would be better, 
            // but here we follow the existing pattern of handleSendMail.
            const results = await Promise.all(remainingEntries.map(async (entry) => {
                const endpoint = activeEvent === 'cultural'
                    ? `${API_URL}/api/admin/cultural/send-confirmation/${entry._id}`
                    : activeEvent === 'accommodation'
                        ? `${API_URL}/api/admin/accommodation/send-confirmation/${entry._id}`
                        : `${API_URL}/api/admin/send-confirmation/${entry._id}`;

                try {
                    const res = await fetch(endpoint, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    return res.ok;
                } catch (err) {
                    return false;
                }
            }));

            const successCount = results.filter(r => r).length;
            alert(`Process complete! Successfully verified ${successCount} out of ${remainingEntries.length} teams.`);
            fetchData(token); // Refresh the UI
        } catch (err) {
            console.error(err);
            alert('Error during bulk verification.');
        } finally {
            setLoading(false);
        }
    };

    const handlePSUpdate = async (id) => {
        if (!editingPS || !editingPS.value) return;
        setUpdatingPS(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const token = sessionStorage.getItem('adminToken');
            const res = await fetch(`${API_URL}/api/admin/update-registration/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    problemStatement: editingPS.value,
                    psEdited: true
                })
            });

            if (res.ok) {
                setEditingPS(null);
                fetchData(token);
            } else {
                alert('Failed to update problem statement');
            }
        } catch (err) {
            console.error(err);
            alert('Error updating problem statement');
        } finally {
            setUpdatingPS(false);
        }
    };

    const handlePSStatusToggle = async (id, currentStatus) => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const token = sessionStorage.getItem('adminToken');
            const res = await fetch(`${API_URL}/api/admin/update-registration/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    psEdited: !currentStatus
                })
            });

            if (res.ok) {
                fetchData(token);
            } else {
                alert('Failed to update status');
            }
        } catch (err) {
            console.error(err);
            alert('Error updating status');
        }
    };

    if (!loggedIn) {
        return (
            <div className="admin-login-container app-layout">
                <video
                    className="global-bg-video"
                    src={bgVideo}
                    autoPlay
                    loop
                    muted
                    playsInline
                />

                <form className="admin-login-form" onSubmit={handleLogin}>
                    <h2>Command Center Access</h2>
                    {error && <p className="admin-error">{error}</p>}
                    <input
                        type="text"
                        name="id"
                        placeholder="Admin ID"
                        value={loginData.id}
                        onChange={handleLoginChange}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        required
                    />
                    <button type="submit" disabled={authLoading || loading}>
                        {authLoading || loading ? 'ESTABLISHING UPLINK...' : 'INITIATE HYPER-DRIVE'}
                    </button>
                    <button type="button" className="ghost-btn" onClick={() => window.location.href = '#/'}>Return Home</button>
                </form>
            </div>
        );
    }

    const getCulturalTotals = () => {
        if (!summary || !summary.cultural) return {};
        const totals = {};
        summary.cultural.entries.forEach(entry => {
            const activity = entry.activity.toLowerCase();
            totals[activity] = (totals[activity] || 0) + 1;
        });
        return totals;
    };

    const culturalTotals = getCulturalTotals();

    return (
        <div className="admin-dashboard app-layout">
            {managementAuth.open && (
                <div className="cosmic-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
                    <div className="cosmic-modal" style={{ background: '#111', border: '1px solid #f59e0b', padding: '40px', borderRadius: '15px', textAlign: 'center', maxWidth: '400px', width: '90%' }}>
                        <h2 style={{ color: '#f59e0b', fontFamily: 'Orbitron', marginBottom: '20px' }}>Security Clearance</h2>
                        <form onSubmit={handleManagementAuth}>
                            <input
                                type="password"
                                placeholder="Enter Access Code"
                                value={managementAuth.password}
                                onChange={(e) => setManagementAuth({ ...managementAuth, password: e.target.value })}
                                style={{ width: '100%', padding: '15px', background: '#000', border: '1px solid #333', color: '#fff', textAlign: 'center', fontSize: '1.2rem', marginBottom: '20px' }}
                                autoFocus
                            />
                            {managementAuth.error && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '15px' }}>{managementAuth.error}</p>}
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" style={{ flex: 1, padding: '12px', background: '#f59e0b', color: '#000', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>VERIFY</button>
                                <button type="button" onClick={() => setManagementAuth({ ...managementAuth, open: false, password: '' })} style={{ flex: 1, padding: '12px', background: '#222', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>CANCEL</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <video
                className="global-bg-video"
                src={bgVideo}
                autoPlay
                loop
                muted
                playsInline
            />

            <header className="admin-header">
                <div className="admin-profile-info">
                    <div className="admin-welcome-line">
                        <span className="welcome-tag">SYSTEM ACCESS GRANTED</span>
                        <h2 className="admin-name-display">{adminInfo.name}</h2>
                    </div>
                    <div className="admin-meta-info">
                        <span className="sub-role-badge">{adminInfo.subRole}</span>
                        <p className="admin-desc-text">NAVONMESH COMMAND CENTRAL v2.6</p>
                    </div>
                </div>
                <div className="admin-actions">
                    <button
                        className={`nav-mode-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        DASHBOARD
                    </button>
                    <button
                        className={`nav-mode-btn ${activeTab === 'messages' ? 'active' : ''}`}
                        onClick={() => setActiveTab('messages')}
                    >
                        COMMUNICATION HUB
                    </button>
                    <button
                        className={`nav-mode-btn ${activeTab === 'recruitment' ? 'active' : ''}`}
                        onClick={() => setActiveTab('recruitment')}
                        style={activeTab === 'recruitment' ? { borderColor: '#00f3ff', color: '#00f3ff' } : {}}
                    >
                        RECRUITMENT ({recruitment.count})
                    </button>
                    <button className="refresh-btn" onClick={() => fetchData(sessionStorage.getItem('adminToken'))} title="Refresh Data">
                        <FaSync className={loading ? 'spin' : ''} />
                    </button>
                    <button className="maintenance-btn" onClick={() => window.open('/#/admin/maintenance', '_blank')}>Maintenance</button>
                    <button className="event-day-btn" onClick={() => window.open('/#/admin/event-day', '_blank')} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Orbitron', fontSize: '0.8rem' }}>Event Day</button>
                    <button className="timer-btn-admin" onClick={() => window.open('/#/admin/break-timer', '_blank')} style={{ background: 'linear-gradient(135deg, #00f3ff 0%, #00d4ff 100%)', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Orbitron', fontSize: '0.8rem', fontWeight: 'bold' }}>Timer</button>
                    <button className="management-btn-admin" onClick={() => setManagementAuth({ ...managementAuth, open: true })} style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Orbitron', fontSize: '0.8rem', fontWeight: 'bold' }}>Management</button>
                    <button className="logout-btn" onClick={handleLogout}>Abort Mission</button>

                </div>
            </header>


            {loading ? (
                <div className="admin-loader">Synchronizing data...</div>
            ) : summary ? (
                activeTab === 'recruitment' ? (
                    <div className="admin-content">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                            <div>
                                <h2 style={{ fontFamily: 'Orbitron', color: '#00f3ff', margin: 0, fontSize: '1.2rem', letterSpacing: '3px' }}>RECRUITMENT APPLICATIONS</h2>
                                <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '4px 0 0', letterSpacing: '1px' }}>NAVONMESH '27 — TEAM ASSEMBLY</p>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <input
                                    type="text"
                                    placeholder="Search name / designation..."
                                    value={recruitSearch}
                                    onChange={(e) => setRecruitSearch(e.target.value)}
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,243,255,0.2)', color: '#fff', padding: '8px 14px', borderRadius: '4px', fontSize: '0.8rem', outline: 'none', width: '220px' }}
                                />
                                <select
                                    value={recruitFilter}
                                    onChange={(e) => setRecruitFilter(e.target.value)}
                                    style={{ background: '#0f1623', border: '1px solid rgba(0,243,255,0.2)', color: '#00f3ff', padding: '8px 12px', borderRadius: '4px', fontSize: '0.8rem', outline: 'none' }}
                                >
                                    <option value="ALL">All Designations</option>
                                    {['Coordinator','Overall Head','Srijan Head','Ankur Head','Udbhav Head','Drone Head','Management Co-Head','Publicity Co-Head','Accommodation Co-Head','Logistics Co-Head','Technical Co-Head','Event Co-Head','Discipline Co-Head','Graphics Co-Head','Videography Co-Head','Social Media Co-Head'].map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                                <button onClick={downloadRecruitmentExcel} style={{ background: 'rgba(0,243,255,0.1)', border: '1px solid rgba(0,243,255,0.3)', color: '#00f3ff', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Orbitron', fontSize: '0.7rem', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <FaDownload /> EXPORT
                                </button>
                                <button
                                    onClick={handleSendAllRecruitmentMail}
                                    style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.35)', color: '#22c55e', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Orbitron', fontSize: '0.7rem', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                                    title="Send acknowledgment email to all unsent applicants"
                                >
                                    ✉ SEND ALL
                                </button>
                                <button onClick={() => fetchRecruitment()} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                                    <FaSync />
                                </button>
                            </div>
                        </div>

                        {(() => {
                            let filtered = recruitment.entries;
                            if (recruitFilter !== 'ALL') filtered = filtered.filter(e => e.designation === recruitFilter);
                            if (recruitSearch.trim()) {
                                const s = recruitSearch.toLowerCase();
                                filtered = filtered.filter(e =>
                                    e.name.toLowerCase().includes(s) ||
                                    e.designation.toLowerCase().includes(s) ||
                                    (e.branch && e.branch.toLowerCase().includes(s)) ||
                                    e.email.toLowerCase().includes(s) ||
                                    e.contactNo.includes(s)
                                );
                            }
                            return (
                                <>
                                    <div style={{ color: '#64748b', fontSize: '0.75rem', letterSpacing: '2px', marginBottom: '12px' }}>
                                        SHOWING {filtered.length} OF {recruitment.count} APPLICATIONS
                                    </div>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Inter, sans-serif', fontSize: '1rem' }}>
                                            <thead>
                                                <tr style={{ background: 'rgba(0,243,255,0.05)', borderBottom: '1px solid rgba(0,243,255,0.2)' }}>
                                                    {['#','Name','Contact No','Email','Year','Branch','Designation','Action'].map(h => (
                                                        <th key={h} style={{ padding: '12px 14px', color: '#00f3ff', fontFamily: 'Orbitron', fontSize: '0.8rem', letterSpacing: '2px', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filtered.length === 0 ? (
                                                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#334155', letterSpacing: '2px', fontSize: '0.8rem' }}>NO APPLICATIONS FOUND</td></tr>
                                                ) : filtered.map((e, i) => (
                                                    <tr key={e._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}
                                                        onMouseEnter={ev => ev.currentTarget.style.background = 'rgba(0,243,255,0.03)'}
                                                        onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}
                                                    >
                                                        <td style={{ padding: '12px 14px', color: '#475569' }}>{i + 1}</td>
                                                        <td style={{ padding: '12px 14px', color: '#e2e8f0', fontWeight: 500 }}>{e.name}</td>
                                                        <td style={{ padding: '12px 14px', color: '#94a3b8' }}>{e.contactNo}</td>
                                                        <td style={{ padding: '12px 14px', color: '#94a3b8' }}>{e.email}</td>
                                                        <td style={{ padding: '12px 14px' }}>
                                                            <span style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa', padding: '3px 10px', borderRadius: '20px', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>{e.year}</span>
                                                        </td>
                                                        <td style={{ padding: '12px 14px' }}>
                                                            <span style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa', padding: '3px 10px', borderRadius: '20px', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>{e.branch || 'N/A'}</span>
                                                        </td>
                                                        <td style={{ padding: '12px 14px' }}>
                                                            <span style={{ background: 'rgba(0,243,255,0.08)', color: '#00f3ff', padding: '3px 10px', borderRadius: '2px', fontSize: '0.9rem', whiteSpace: 'nowrap', border: '1px solid rgba(0,243,255,0.2)' }}>{e.designation}</span>
                                                        </td>
                                                        <td style={{ padding: '12px 14px' }}>
                                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                                <button
                                                                    onClick={() => handleSendRecruitmentMail(e._id, e.name, e.email)}
                                                                    title={`Send acknowledgment to ${e.email}`}
                                                                    style={{ background: e.mailSent ? 'rgba(34,197,94,0.18)' : 'rgba(34,197,94,0.08)', border: `1px solid ${e.mailSent ? 'rgba(34,197,94,0.6)' : 'rgba(34,197,94,0.3)'}`, color: '#22c55e', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem', whiteSpace: 'nowrap' }}
                                                                >
                                                                    {e.mailSent ? '✉ Sent' : '✉ Mail'}
                                                                </button>
                                                                <button onClick={() => handleDeleteRecruitment(e._id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>
                                                                    <FaTimes />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                ) : activeTab === 'dashboard' ? (
                    <div className="admin-content">

                        <div className="stats-grid">
                            <div className={`stat-card ${activeEvent === 'srijan' ? 'active' : ''}`}
                                onClick={() => setActiveEvent('srijan')}
                                onMouseMove={handleMouseMove}>
                                <div className="stat-card-scan"></div>
                                <div className="stat-icon-bg"><FaDesktop /></div>
                                <div className="stat-info">
                                    <h3>Srijan</h3>
                                    <p className="stat-sub">Hackathon</p>
                                </div>
                                <div className="stat-main">
                                    <div className="stat-number">{summary.srijan.count} <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>Teams</span></div>
                                    <div className="stat-sub" style={{ fontSize: '0.8rem', opacity: 0.6 }}>Participants: {summary.srijan.entries.reduce((acc, e) => acc + (parseInt(e.teamSize) || 0), 0)}</div>
                                    <div className="click-details">ACCESS STREAM</div>
                                </div>
                            </div>
                            <div className={`stat-card ${activeEvent === 'ankur' ? 'active' : ''}`}
                                onClick={() => setActiveEvent('ankur')}
                                onMouseMove={handleMouseMove}>
                                <div className="stat-card-scan"></div>
                                <div className="stat-icon-bg"><FaProjectDiagram /></div>
                                <div className="stat-info">
                                    <h3>Ankur</h3>
                                    <p className="stat-sub">Project Expo</p>
                                </div>
                                <div className="stat-main">
                                    <div className="stat-number">{summary.ankur.count} <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>Teams</span></div>
                                    <div className="stat-sub" style={{ fontSize: '0.8rem', opacity: 0.6 }}>Participants: {summary.ankur.entries.reduce((acc, e) => acc + (parseInt(e.teamSize) || 0), 0)}</div>
                                    <div className="click-details">ACCESS STREAM</div>
                                </div>
                            </div>
                            <div className={`stat-card ${activeEvent === 'udbhav' ? 'active' : ''}`}
                                onClick={() => setActiveEvent('udbhav')}
                                onMouseMove={handleMouseMove}>
                                <div className="stat-card-scan"></div>
                                <div className="stat-icon-bg"><FaUsers /></div>
                                <div className="stat-info">
                                    <h3>Udbhav</h3>
                                    <p className="stat-sub">Conference</p>
                                </div>
                                <div className="stat-main">
                                    <div className="stat-number">{summary.udbhav.count} <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>Teams</span></div>
                                    <div className="stat-sub" style={{ fontSize: '0.8rem', opacity: 0.6 }}>Participants: {summary.udbhav.entries.reduce((acc, e) => acc + (parseInt(e.teamSize) || 0), 0)}</div>
                                    <div className="click-details">ACCESS STREAM</div>
                                </div>
                            </div>
                            <div className={`stat-card ${activeEvent === 'cultural' ? 'active' : ''}`}
                                onClick={() => setActiveEvent('cultural')}
                                onMouseMove={handleMouseMove}>
                                <div className="stat-card-scan"></div>
                                <div className="stat-icon-bg"><FaMusic /></div>
                                <div className="stat-info">
                                    <h3>Cultural</h3>
                                    <p className="stat-sub">Kala Spandan</p>
                                </div>
                                <div className="stat-main">
                                    <div className="stat-number">{summary.cultural.count}</div>
                                    <div className="click-details">ACCESS STREAM</div>
                                </div>
                            </div>
                            <div className={`stat-card ${activeEvent === 'accommodation' ? 'active' : ''}`}
                                onClick={() => setActiveEvent('accommodation')}
                                onMouseMove={handleMouseMove}>
                                <div className="stat-card-scan"></div>
                                <div className="stat-icon-bg"><FaHotel /></div>
                                <div className="stat-info">
                                    <h3>Stay</h3>
                                    <p className="stat-sub">Requisitions</p>
                                </div>
                                <div className="stat-main">
                                    <div className="stat-number">{summary.accommodation.count}</div>
                                    <div className="click-details">ACCESS STREAM</div>
                                </div>
                            </div>
                            <div className={`stat-card ${activeTab === 'recruitment' ? 'active' : ''}`}
                                onClick={() => setActiveTab('recruitment')}
                                onMouseMove={handleMouseMove}>
                                <div className="stat-card-scan"></div>
                                <div className="stat-icon-bg"><FaChartPie /></div>
                                <div className="stat-info">
                                    <h3>Recruitment</h3>
                                    <p className="stat-sub">Navonmesh '27</p>
                                </div>
                                <div className="stat-main">
                                    <div className="stat-number">{recruitment.count} <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>Applied</span></div>
                                    <div className="click-details">ACCESS STREAM</div>
                                </div>
                            </div>
                        </div>

                        {activeEvent && (
                            <div className="detail-panel" ref={detailPanelRef}>
                                <div className="panel-header-row">
                                    <div className="panel-title-group">
                                        <h3><FaTable style={{ marginRight: '10px' }} /> {activeEvent.toUpperCase()} DATA STREAM</h3>
                                        <div className="acc-sub-filters">
                                            <button className={
                                                (activeEvent === 'accommodation' && accFilter === 'ALL') ||
                                                    (activeEvent === 'srijan' && srijanFilter === 'ALL') ||
                                                    (activeEvent === 'cultural' && culturalActivityFilter === 'ALL') ? 'active' : ''
                                            } onClick={() => {
                                                setAccFilter('ALL');
                                                setSrijanFilter('ALL');
                                                setCulturalActivityFilter('ALL');
                                                setCulturalSubFilter('ALL');
                                                setAnkurFilter('ALL');
                                            }}>Total</button>

                                            <div className="search-box-admin" style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0 10px', border: '1px solid rgba(255,255,255,0.1)', marginLeft: '10px' }}>
                                                <input
                                                    type="text"
                                                    placeholder="Search Teams/Leads/UTR..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    style={{ background: 'transparent', border: 'none', color: '#fff', padding: '8px', fontSize: '0.8rem', outline: 'none', width: '200px' }}
                                                />
                                            </div>

                                            <div className="revised-filters" style={{ display: 'flex', gap: '5px', marginLeft: '10px' }}>
                                                <button
                                                    onClick={() => setRevisedFilter('ALL')}
                                                    style={{ background: revisedFilter === 'ALL' ? '#7c3aed' : 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '0.7rem', cursor: 'pointer', transition: '0.3s' }}
                                                >
                                                    All Status
                                                </button>
                                                <button
                                                    onClick={() => setRevisedFilter('REVISED')}
                                                    style={{ background: revisedFilter === 'REVISED' ? '#22c55e' : 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '0.7rem', cursor: 'pointer', transition: '0.3s' }}
                                                >
                                                    Revised Only
                                                </button>
                                                <button
                                                    onClick={() => setRevisedFilter('PENDING')}
                                                    style={{ background: revisedFilter === 'PENDING' ? '#ef4444' : 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '0.7rem', cursor: 'pointer', transition: '0.3s' }}
                                                >
                                                    Pending Only
                                                </button>
                                            </div>

                                            {activeEvent === 'accommodation' && (
                                                <>
                                                    <button className={accFilter === 'SRIJAN' ? 'active' : ''} onClick={() => setAccFilter('SRIJAN')}>Srijan</button>
                                                    <button className={accFilter === 'ANKUR' ? 'active' : ''} onClick={() => setAccFilter('ANKUR')}>Ankur</button>
                                                    <button className={accFilter === 'UDBHAV' ? 'active' : ''} onClick={() => setAccFilter('UDBHAV')}>Udbhav</button>
                                                </>
                                            )}
                                            {activeEvent === 'srijan' && (
                                                <>
                                                    <button className={srijanFilter === 'Student Innovation' ? 'active' : ''} onClick={() => setSrijanFilter('Student Innovation')}>Innovation</button>
                                                    <button className={srijanFilter === 'Problem Statement 1' ? 'active' : ''} onClick={() => setSrijanFilter('Problem Statement 1')}>PS 1</button>
                                                    <button className={srijanFilter === 'Problem Statement 2' ? 'active' : ''} onClick={() => setSrijanFilter('Problem Statement 2')}>PS 2</button>
                                                </>
                                            )}

                                            {activeEvent === 'cultural' && (
                                                <>
                                                    <button className={culturalActivityFilter === 'singing' ? 'active' : ''} onClick={() => { setCulturalActivityFilter('singing'); setCulturalSubFilter('ALL'); }}>Singing</button>
                                                    <button className={culturalActivityFilter === 'dance' ? 'active' : ''} onClick={() => { setCulturalActivityFilter('dance'); setCulturalSubFilter('ALL'); }}>Dance</button>
                                                    <button className={culturalActivityFilter === 'anchoring' ? 'active' : ''} onClick={() => { setCulturalActivityFilter('anchoring'); setCulturalSubFilter('ALL'); }}>Anchoring</button>
                                                    <button className={culturalActivityFilter === 'other' ? 'active' : ''} onClick={() => { setCulturalActivityFilter('other'); setCulturalSubFilter('ALL'); }}>Other</button>
                                                </>
                                            )}
                                            {activeEvent === 'ankur' && (
                                                <>
                                                    <button className={ankurFilter === 'Degree Students' ? 'active' : ''} onClick={() => setAnkurFilter('Degree Students')}>Degree</button>
                                                    <button className={ankurFilter === 'Diploma Students' ? 'active' : ''} onClick={() => setAnkurFilter('Diploma Students')}>Diploma</button>
                                                </>
                                            )}
                                            <button className="download-excel-btn" onClick={downloadExcel} title="Download Current Data as Excel">
                                                <FaDownload /> EXCEL
                                            </button>
                                            <button className="verify-remaining-btn" onClick={handleVerifyRemaining} style={{
                                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                color: '#fff',
                                                border: 'none',
                                                padding: '8px 16px',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontFamily: 'Orbitron',
                                                fontSize: '0.7rem',
                                                fontWeight: 'bold',
                                                boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)'
                                            }}>
                                                VERIFY REMAINING
                                            </button>
                                        </div>
                                    </div>

                                    {activeEvent === 'cultural' && culturalActivityFilter === 'singing' && (
                                        <div className="acc-sub-filters animate-fade-in" style={{ marginTop: '10px' }}>
                                            <button className={culturalSubFilter === 'ALL' ? 'active' : ''} onClick={() => setCulturalSubFilter('ALL')}>All Singing</button>
                                            <button className={culturalSubFilter === 'solo singing' ? 'active' : ''} onClick={() => setCulturalSubFilter('solo singing')}>Solo</button>
                                            <button className={culturalSubFilter === 'duo singing' ? 'active' : ''} onClick={() => setCulturalSubFilter('duo singing')}>Duo</button>
                                        </div>
                                    )}

                                    {activeEvent === 'cultural' && culturalActivityFilter === 'dance' && (
                                        <div className="acc-sub-filters animate-fade-in" style={{ marginTop: '10px' }}>
                                            <button className={culturalSubFilter === 'ALL' ? 'active' : ''} onClick={() => setCulturalSubFilter('ALL')}>All Dance</button>
                                            <button className={culturalSubFilter === 'solo dance' ? 'active' : ''} onClick={() => setCulturalSubFilter('solo dance')}>Solo</button>
                                            <button className={culturalSubFilter === 'duo dance' ? 'active' : ''} onClick={() => setCulturalSubFilter('duo dance')}>Duo</button>
                                            <button className={culturalSubFilter === 'group dance' ? 'active' : ''} onClick={() => setCulturalSubFilter('group dance')}>Group</button>
                                        </div>
                                    )}

                                    {activeEvent === 'accommodation' && (() => {
                                        const filteredEntries = accFilter === 'ALL'
                                            ? summary.accommodation.entries
                                            : summary.accommodation.entries.filter(e => e.event === accFilter);

                                        const girls = filteredEntries.reduce((sum, e) => sum + e.girls, 0);
                                        const boys = filteredEntries.reduce((sum, e) => sum + e.boys, 0);
                                        const total = girls + boys || 1;

                                        return (
                                            <div className="pie-section">
                                                <div className="cosmic-pie" style={{
                                                    background: `conic-gradient(#ec4899 0% ${(girls / total) * 100}%, #3b82f6 ${(girls / total) * 100}% 100%)`
                                                }}></div>
                                                <div className="pie-legend">
                                                    <div className="legend-item"><span className="dot girls"></span> Girls: {girls}</div>
                                                    <div className="legend-item"><span className="dot boys"></span> Boys: {boys}</div>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {activeEvent === 'srijan' && (() => {
                                        const innovations = summary.srijan.entries.filter(e => e.problemStatement === 'Student Innovation').length;
                                        const ps1 = summary.srijan.entries.filter(e => e.problemStatement === 'Problem Statement 1').length;
                                        const ps2 = summary.srijan.entries.filter(e => e.problemStatement === 'Problem Statement 2').length;
                                        const totalParticipants = summary.srijan.entries.reduce((acc, e) => acc + (parseInt(e.teamSize) || 0), 0);

                                        return (
                                            <div className="pie-section stats-summary">
                                                <div className="summary-pill highlight">Total Participants: <span>{totalParticipants}</span></div>
                                                <div className="summary-pill">Teams: <span>{summary.srijan.entries.length}</span></div>
                                                <div className="summary-pill">Innovation: <span>{innovations}</span></div>
                                                <div className="summary-pill">PS 1: <span>{ps1}</span></div>
                                                <div className="summary-pill">PS 2: <span>{ps2}</span></div>
                                            </div>
                                        );
                                    })()}

                                    {activeEvent === 'ankur' && (() => {
                                        const degreeTeams = summary.ankur.entries.filter(e => e.category === 'Degree Students').length;
                                        const diplomaTeams = summary.ankur.entries.filter(e => e.category === 'Diploma Students').length;
                                        const totalParticipants = summary.ankur.entries.reduce((acc, e) => acc + (parseInt(e.teamSize) || 0), 0);

                                        return (
                                            <div className="pie-section stats-summary">
                                                <div className="summary-pill highlight">Total Participants: <span>{totalParticipants}</span></div>
                                                <div className="summary-pill">Total Teams: <span>{summary.ankur.entries.length}</span></div>
                                                <div className="summary-pill">Degree: <span>{degreeTeams}</span></div>
                                                <div className="summary-pill">Diploma: <span>{diplomaTeams}</span></div>
                                            </div>
                                        );
                                    })()}

                                    {activeEvent === 'udbhav' && (() => {
                                        const totalParticipants = summary.udbhav.entries.reduce((acc, e) => acc + (parseInt(e.teamSize) || 0), 0);

                                        return (
                                            <div className="pie-section stats-summary">
                                                <div className="summary-pill highlight">Total Participants: <span>{totalParticipants}</span></div>
                                                <div className="summary-pill">Total Teams: <span>{summary.udbhav.entries.length}</span></div>
                                            </div>
                                        );
                                    })()}

                                    {activeEvent === 'cultural' && (
                                        <div className="cultural-summary-grid">
                                            {Object.entries(culturalTotals).map(([activity, count]) => (
                                                <div key={activity} className="summary-pill">
                                                    {activity.charAt(0).toUpperCase() + activity.slice(1)}: <span>{count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="data-table-container">
                                    <table className="data-table">
                                        <thead>
                                            {activeEvent === 'accommodation' ? (
                                                <tr>
                                                    <th>#</th>
                                                    <th>Event</th>
                                                    <th>Team Name</th>
                                                    <th>College</th>
                                                    <th>Leader</th>
                                                    <th>Size</th>
                                                    <th>Girls</th>
                                                    <th>Boys</th>
                                                    <th>Action</th>
                                                </tr>
                                            ) : activeEvent === 'cultural' ? (
                                                <tr>
                                                    <th>#</th>
                                                    <th>Participant Name</th>
                                                    <th>Class</th>
                                                    <th>Activity</th>
                                                    <th>Member 2</th>
                                                    <th>Group Size</th>
                                                    <th>Contact</th>
                                                    <th>Email</th>
                                                    <th>Action</th>
                                                </tr>
                                            ) : (
                                                <tr>
                                                    <th>#</th>
                                                    <th>Group Name</th>
                                                    <th>Leader Name</th>
                                                    <th>College</th>
                                                    <th>Group Size</th>
                                                    <th>UTR Number</th>
                                                    {activeEvent === 'ankur' && <th>Category</th>}
                                                    {activeEvent === 'srijan' && (
                                                        <>
                                                            <th>Problem St.</th>
                                                            <th>Revised</th>
                                                        </>
                                                    )}
                                                    <th className="action-header">Actions</th>
                                                </tr>
                                            )}
                                        </thead>
                                        <tbody>
                                            {(() => {
                                                let displayEntries = summary[activeEvent].entries;

                                                if (activeEvent === 'accommodation' && accFilter !== 'ALL') {
                                                    displayEntries = displayEntries.filter(e => e.event === accFilter);
                                                } else if (activeEvent === 'srijan' && srijanFilter !== 'ALL') {
                                                    displayEntries = displayEntries.filter(e => e.problemStatement === srijanFilter);
                                                } else if (activeEvent === 'cultural' && culturalActivityFilter !== 'ALL') {
                                                    displayEntries = displayEntries.filter(e => e.activity.toLowerCase().includes(culturalActivityFilter));
                                                    if (culturalSubFilter !== 'ALL') {
                                                        displayEntries = displayEntries.filter(e => e.activity.toLowerCase() === culturalSubFilter);
                                                    }
                                                } else                                                if (activeEvent === 'ankur' && ankurFilter !== 'ALL') {
                                                    displayEntries = displayEntries.filter(e => e.category === ankurFilter);
                                                }

                                                // Revised Status Filter
                                                if (revisedFilter === 'REVISED') {
                                                    displayEntries = displayEntries.filter(e => e.psEdited);
                                                } else if (revisedFilter === 'PENDING') {
                                                    displayEntries = displayEntries.filter(e => !e.psEdited);
                                                }

                                                // Apply Search Filter
                                                if (searchTerm) {
                                                    const lowSearch = searchTerm.toLowerCase();
                                                    displayEntries = displayEntries.filter(e =>
                                                        (e.teamName && e.teamName.toLowerCase().includes(lowSearch)) ||
                                                        (e.leaderName && e.leaderName.toLowerCase().includes(lowSearch)) ||
                                                        (e.participantName && e.participantName.toLowerCase().includes(lowSearch)) ||
                                                        (e.utrNumber && e.utrNumber.toLowerCase().includes(lowSearch)) ||
                                                        (e.college && e.college.toLowerCase().includes(lowSearch))
                                                    );
                                                }

                                                return displayEntries.length > 0 ? (
                                                    displayEntries.map((entry, idx) => (
                                                        <tr key={entry._id}>
                                                            <td>{idx + 1}</td>
                                                            {activeEvent === 'accommodation' ? (
                                                                <>
                                                                    <td className="event-badge-cell">
                                                                        <span className={`event-mini-badge ${entry.event.toLowerCase()}`}>
                                                                            {entry.event}
                                                                        </span>
                                                                    </td>
                                                                    <td>{entry.teamName}</td>
                                                                    <td>{entry.college}</td>
                                                                    <td>{entry.leaderName}</td>
                                                                    <td className="mono">{entry.teamSize}</td>
                                                                    <td className="girls-cell">{entry.girls}</td>
                                                                    <td className="boys-cell">{entry.boys}</td>
                                                                    <td>
                                                                        <div className="action-btn-group">
                                                                            <button
                                                                                onClick={() => handleSendMail(entry._id, 'accommodation')}
                                                                                disabled={entry.paymentVerified}
                                                                                className="verify-mail-btn"
                                                                            >
                                                                                {entry.paymentVerified ? 'Verified' : 'Verify & Mail'}
                                                                            </button>
                                                                            <button
                                                                                onClick={() => { setSelectedEntry({ ...entry, _type: 'accommodation' }); setShowModal(true); }}
                                                                                className="view-details-btn"
                                                                                title="View Full Details"
                                                                            >
                                                                                <FaEye />
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </>
                                                            ) : activeEvent === 'cultural' ? (
                                                                <>
                                                                    <td>{entry.participantName}</td>
                                                                    <td><span className="class-badge" style={{
                                                                        background: 'rgba(192, 132, 252, 0.2)',
                                                                        color: '#c084fc',
                                                                        padding: '4px 8px',
                                                                        borderRadius: '6px',
                                                                        fontSize: '0.8rem',
                                                                        fontWeight: 'bold'
                                                                    }}>{entry.className}</span></td>
                                                                    <td><span className={`activity-badge ${entry.activity.split(' ')[0]}`} style={{
                                                                        background: 'rgba(129, 140, 248, 0.2)',
                                                                        color: '#818cf8',
                                                                        padding: '4px 8px',
                                                                        borderRadius: '6px',
                                                                        fontSize: '0.8rem',
                                                                        fontWeight: 'bold'
                                                                    }}>{entry.activity}</span></td>
                                                                    <td>{entry.member2Name ? `${entry.member2Name} (${entry.member2Class})` : '-'}</td>
                                                                    <td className="mono">{entry.groupSize || '-'}</td>
                                                                    <td>{entry.contact}</td>
                                                                    <td style={{ fontSize: '0.8rem', opacity: 0.8 }}>{entry.email}</td>
                                                                    <td>
                                                                        <div className="action-btn-group">
                                                                            <button
                                                                                onClick={() => handleSendMail(entry._id, 'cultural')}
                                                                                disabled={entry.paymentVerified}
                                                                                className="verify-mail-btn"
                                                                            >
                                                                                {entry.paymentVerified ? 'Verified' : 'Verify & Mail'}
                                                                            </button>
                                                                            <button
                                                                                onClick={() => { setSelectedEntry({ ...entry, _type: 'cultural' }); setShowModal(true); }}
                                                                                className="view-details-btn"
                                                                                title="View Full Details"
                                                                            >
                                                                                <FaEye />
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <td>{entry.teamName}</td>
                                                                    <td>{entry.leaderName || 'N/A'}</td>
                                                                    <td>{entry.college || 'N/A'}</td>
                                                                    <td>{entry.teamSize || 'N/A'}</td>
                                                                    <td>
                                                                        <span className="utr-highlight" style={{
                                                                            color: '#22c55e',
                                                                            fontFamily: 'monospace',
                                                                            fontWeight: 'bold'
                                                                        }}>
                                                                            {entry.utrNumber || 'N/A'}
                                                                        </span>
                                                                    </td>
                                                                    {activeEvent === 'ankur' && <td>{entry.category || 'N/A'}</td>}
                                                                    {activeEvent === 'srijan' && (
                                                                        <>
                                                                            <td
                                                                                style={{
                                                                                    color: entry.psEdited ? '#f59e0b' : 'inherit',
                                                                                    fontWeight: entry.psEdited ? 'bold' : 'normal',
                                                                                    cursor: 'pointer',
                                                                                    borderBottom: '1px dashed transparent',
                                                                                }}
                                                                                onClick={() => setEditingPS({ id: entry._id, value: entry.problemStatement })}
                                                                                title="Click to edit Problem Statement"
                                                                            >
                                                                                {editingPS && editingPS.id === entry._id ? (
                                                                                    <div style={{ display: 'flex', gap: '5px' }}>
                                                                                        <select
                                                                                            value={editingPS.value}
                                                                                            onChange={(e) => setEditingPS({ ...editingPS, value: e.target.value })}
                                                                                            autoFocus
                                                                                            style={{ background: '#000', color: '#fff', border: '1px solid #f59e0b', borderRadius: '4px', padding: '2px 5px', fontSize: '0.8rem', cursor: 'pointer' }}
                                                                                            onBlur={() => !updatingPS && setEditingPS(null)}
                                                                                        >
                                                                                            <option value="Problem Statement 1">Problem Statement 1</option>
                                                                                            <option value="Problem Statement 2">Problem Statement 2</option>
                                                                                            <option value="Student Innovation">Student Innovation</option>
                                                                                        </select>
                                                                                        <button
                                                                                            onClick={(e) => { e.stopPropagation(); handlePSUpdate(entry._id); }}
                                                                                            style={{ background: '#f59e0b', color: '#000', border: 'none', borderRadius: '4px', padding: '2px 8px', fontSize: '0.7rem', fontWeight: 'bold' }}
                                                                                        >
                                                                                            SET
                                                                                        </button>
                                                                                    </div>
                                                                                ) : (
                                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                        {entry.problemStatement || 'N/A'}
                                                                                        {entry.psEdited && <FaCheckCircle style={{ color: '#22c55e', fontSize: '1rem', marginLeft: 'auto', filter: 'drop-shadow(0 0 5px rgba(34, 197, 94, 0.5))' }} title="Change applied successfully" />}
                                                                                    </div>
                                                                                )}
                                                                            </td>
                                                                            <td>
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={entry.psEdited || false}
                                                                                    onChange={() => handlePSStatusToggle(entry._id, entry.psEdited)}
                                                                                    style={{ cursor: 'pointer', width: '20px', height: '20px', accentColor: '#22c55e' }}
                                                                                    title="Mark as Revised/Checked"
                                                                                />
                                                                            </td>
                                                                        </>
                                                                    )}
                                                                    <td>
                                                                        <div className="action-btn-group">
                                                                            <button className="view-details-btn" title="View Full Intel" onClick={() => { setSelectedEntry({ ...entry, _type: activeEvent }); setShowModal(true); }}>
                                                                                <FaEye />
                                                                            </button>
                                                                            <button
                                                                                className="verify-mail-btn"
                                                                                onClick={() => handleSendMail(entry._id, activeEvent)}
                                                                                disabled={entry.paymentVerified}
                                                                            >
                                                                                {entry.paymentVerified ? 'Verified' : 'Verify & Mail'}
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </>
                                                            )}
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={10} className="empty-row">No records found for this telemetry array.</td>
                                                    </tr>
                                                );
                                            })()}
                                        </tbody>
                                    </table>
                                </div>
                            </div >
                        )}
                    </div>
                ) : activeTab === 'management' ? (
                    <div className="management-section animate-fade-in" style={{ padding: '40px', color: '#fff' }}>
                        <div className="management-header" style={{ marginBottom: '40px', borderBottom: '1px solid rgba(245, 158, 11, 0.3)', paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h1 style={{ fontFamily: 'Orbitron', color: '#f59e0b', margin: 0 }}>COMMITTEE MANAGEMENT</h1>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Personnel Deployment Registry</p>
                            </div>
                            <button onClick={() => setActiveTab('dashboard')} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}>CLOSE</button>
                        </div>

                        <div className="management-tabs" style={{ display: 'flex', gap: '15px', marginBottom: '40px', flexWrap: 'wrap' }}>
                            {departments.map(dept => (
                                <button
                                    key={dept}
                                    onClick={() => setActiveManagementTab(dept)}
                                    style={{
                                        padding: '12px 24px',
                                        background: activeManagementTab === dept ? '#f59e0b' : 'rgba(255,255,255,0.05)',
                                        color: activeManagementTab === dept ? '#000' : '#fff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontFamily: 'Orbitron',
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold',
                                        transition: '0.3s'
                                    }}
                                >{dept}</button>
                            ))}
                        </div>

                        <div className="management-content-grid" style={{ display: 'grid', gridTemplateColumns: adminId === 'nihal1512' ? '1fr 1fr' : '1fr', gap: '40px' }}>
                            {adminId === 'nihal1512' && (
                                <div className="add-member-form" style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '30px', borderRadius: '15px' }}>
                                    <h3 style={{ color: '#f59e0b', marginBottom: '20px', fontFamily: 'Orbitron' }}>Add to {activeManagementTab}</h3>
                                    <form onSubmit={handleAddMember}>
                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Member Name</label>
                                            <input
                                                type="text"
                                                value={newMember.name}
                                                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                                                placeholder="Enter Full Name"
                                                style={{ width: '100%', padding: '12px', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '5px' }}
                                            />
                                        </div>
                                        <div style={{ marginBottom: '30px' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Phone Number</label>
                                            <input
                                                type="text"
                                                value={newMember.phone}
                                                onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                                                placeholder="+91 00000 00000"
                                                style={{ width: '100%', padding: '12px', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '5px' }}
                                            />
                                        </div>
                                        <button type="submit" style={{ width: '100%', padding: '15px', background: '#f59e0b', color: '#000', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>ENGAGE RECRUIT</button>
                                    </form>
                                </div>
                            )}

                            <div className="members-list-container">
                                <h3 style={{ marginBottom: '20px', fontFamily: 'Orbitron' }}>Active Units: {activeManagementTab}</h3>
                                <div className="members-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {committeeMembers.filter(m => m.department === activeManagementTab).length === 0 ? (
                                        <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '40px' }}>No units deployed in this sector.</p>
                                    ) : (
                                        committeeMembers.filter(m => m.department === activeManagementTab).map(member => (
                                            <div key={member._id} style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <h4 style={{ margin: '0 0 5px 0' }}>{member.name}</h4>
                                                    <p style={{ margin: 0, color: '#00f3ff', fontSize: '0.9rem' }}>{member.phone}</p>
                                                </div>
                                                {adminId === 'nihal1512' && (
                                                    <button onClick={() => handleDeleteMember(member._id)} style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: 'none', padding: '8px', borderRadius: '5px', cursor: 'pointer' }}>
                                                        <FaTimes />
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Message System View */
                    <div className="admin-content broadcast-hub">
                        <div className="broadcast-layout">
                            {/* Left Side: Composer */}
                            <div className="broadcast-composer">
                                <div className="detail-panel">
                                    <h3>BROADCAST COMPOSER</h3>
                                    <p className="broadcast-subtitle">Personalized emails will be sent to the selected recipients on the right.</p>

                                    <form className="broadcast-form" onSubmit={handleSendBulkEmail}>
                                        <div className="form-group" style={{ marginBottom: '20px' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', color: '#c084fc', fontFamily: 'Orbitron' }}>Email Subject</label>
                                            <input
                                                type="text"
                                                placeholder="Enter the broadcast subject..."
                                                value={broadcastData.subject}
                                                onChange={(e) => setBroadcastData({ ...broadcastData, subject: e.target.value })}
                                                style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(139, 92, 246, 0.3)', color: '#fff', borderRadius: '8px' }}
                                                required
                                            />
                                        </div>

                                        <div className="form-group" style={{ marginBottom: '20px' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', color: '#c084fc', fontFamily: 'Orbitron', fontSize: '0.9rem' }}>Broadcast Scope</label>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => setBroadcastData({ ...broadcastData, recipientScope: 'LEADERS' })}
                                                    className={`scope-pill ${broadcastData.recipientScope === 'LEADERS' ? 'active' : ''}`}
                                                    style={{
                                                        flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.3)',
                                                        background: broadcastData.recipientScope === 'LEADERS' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(0,0,0,0.2)',
                                                        color: broadcastData.recipientScope === 'LEADERS' ? '#fff' : '#94a3b8',
                                                        cursor: 'pointer', fontFamily: 'Orbitron', fontSize: '0.7rem'
                                                    }}
                                                >
                                                    TEAM LEADERS ONLY
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setBroadcastData({ ...broadcastData, recipientScope: 'ALL' })}
                                                    className={`scope-pill ${broadcastData.recipientScope === 'ALL' ? 'active' : ''}`}
                                                    style={{
                                                        flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.3)',
                                                        background: broadcastData.recipientScope === 'ALL' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(0,0,0,0.2)',
                                                        color: broadcastData.recipientScope === 'ALL' ? '#fff' : '#94a3b8',
                                                        cursor: 'pointer', fontFamily: 'Orbitron', fontSize: '0.7rem'
                                                    }}
                                                >
                                                    ALL PARTICIPANTS
                                                </button>
                                            </div>
                                            <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '5px' }}>
                                                {broadcastData.recipientScope === 'ALL'
                                                    ? 'Mails will be sent to leaders and all registered team members.'
                                                    : 'Mails will be sent only to primary team contacts/leaders.'}
                                            </p>
                                        </div>

                                        <div className="form-group" style={{ marginBottom: '20px' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', color: '#c084fc', fontFamily: 'Orbitron' }}>Message Content</label>
                                            <div className="template-tips" style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '10px' }}>
                                                Use <code>{'{{teamName}}'}</code> or <code>{'{{leaderName}}'}</code> for personalization.
                                            </div>
                                            <textarea
                                                rows="8"
                                                placeholder={`Greeting, {{leaderName}} of {{teamName}}! 

Welcome to the command hub. Your mission details are as follows...`}
                                                value={broadcastData.body}
                                                onChange={(e) => setBroadcastData({ ...broadcastData, body: e.target.value })}
                                                style={{ width: '100%', padding: '15px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(139, 92, 246, 0.3)', color: '#fff', borderRadius: '8px', fontFamily: 'Inter', lineHeight: '1.6' }}
                                                required
                                            />
                                        </div>

                                        <div className="broadcast-actions">
                                            <div className="selection-counter" style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '15px' }}>
                                                Selected Recipients: <span style={{ color: '#c084fc', fontWeight: 'bold' }}>{selectedRecipientIds.length}</span>
                                            </div>
                                            <button type="submit" className="send-all-btn" disabled={broadcasting || selectedRecipientIds.length === 0} style={{
                                                background: 'linear-gradient(135deg, #7c3aed 0%, #c026d3 100%)',
                                                color: '#fff',
                                                padding: '12px 30px',
                                                border: 'none',
                                                borderRadius: '12px',
                                                fontFamily: 'Orbitron',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                                width: '100%',
                                                opacity: (broadcasting || selectedRecipientIds.length === 0) ? 0.6 : 1
                                            }}>
                                                {broadcasting ? 'TRANSMITTING...' : `INITIATE BROADCAST TO ${selectedRecipientIds.length} ${broadcastData.recipientScope === 'ALL' ? 'TEAMS (ALL MEMBERS)' : 'TEAM LEADERS'}`}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            {/* Right Side: Recipient Selection */}
                            <div className="broadcast-recipients">
                                <div className="detail-panel">
                                    <div className="recipient-header">
                                        <h3>RECIPIENT FLEET</h3>
                                        <button className="select-all-btn" onClick={selectAllFiltered}>
                                            {(() => {
                                                const available = getAllAvailableRecipients();
                                                const availableIds = available.map(r => r.id);
                                                return availableIds.every(id => selectedRecipientIds.includes(id)) ? 'DESELECT ALL' : 'SELECT ALL';
                                            })()}
                                        </button>
                                    </div>

                                    <div className="broadcast-targets" style={{ marginTop: '15px' }}>
                                        <div className="target-options">
                                            {['ALL', 'Srijan (Hackathon)', 'Ankur (Project Expo)', 'Udbhav (Conference)', 'Cultural', 'Accommodation'].map(ev => (
                                                <button
                                                    key={ev}
                                                    type="button"
                                                    className={`target-chip ${broadcastData.targetEvents.includes(ev) ? 'selected' : ''}`}
                                                    onClick={() => {
                                                        if (ev === 'ALL') {
                                                            setBroadcastData({ ...broadcastData, targetEvents: ['ALL'] });
                                                        } else {
                                                            const newTargets = broadcastData.targetEvents.includes(ev)
                                                                ? broadcastData.targetEvents.filter(t => t !== ev)
                                                                : [...broadcastData.targetEvents.filter(t => t !== 'ALL'), ev];
                                                            setBroadcastData({ ...broadcastData, targetEvents: newTargets.length ? newTargets : ['ALL'] });
                                                        }
                                                    }}
                                                >
                                                    {ev === 'ALL' ? 'Total' : ev.split(' ')[0]}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="recipient-list">
                                        {getAllAvailableRecipients().map(recipient => (
                                            <div
                                                key={recipient.id}
                                                className={`recipient-item ${selectedRecipientIds.includes(recipient.id) ? 'selected' : ''}`}
                                                onClick={() => toggleRecipient(recipient.id)}
                                            >
                                                <div className="recipient-checkbox">
                                                    {selectedRecipientIds.includes(recipient.id) && <div className="check-mark"></div>}
                                                </div>
                                                <div className="recipient-info">
                                                    <div className="recipient-name">{recipient.team}</div>
                                                    <div className="recipient-leader">{recipient.name}</div>
                                                </div>
                                                <div className="recipient-type-badge">{recipient.type.charAt(0)}</div>
                                            </div>
                                        ))}
                                        {getAllAvailableRecipients().length === 0 && (
                                            <div className="empty-recipients">No recipients found for selected streams.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            ) : null}
            {/* Details Modal */}
            {
                showModal && selectedEntry && (
                    <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>{selectedEntry._type.toUpperCase()} - FULL INTEL</h3>
                                <button className="close-modal" onClick={() => setShowModal(false)}><FaTimes /></button>
                            </div>
                            <div className="modal-body">
                                <div className="detail-section">
                                    <h4>Core Information</h4>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <label>Team/Participant Name</label>
                                            <span>{selectedEntry.teamName || selectedEntry.participantName}</span>
                                        </div>
                                        <div className="detail-item">
                                            <label>Event Type</label>
                                            <span className="badge">{selectedEntry.event || selectedEntry._type}</span>
                                        </div>
                                        <div className="detail-item">
                                            <label>College</label>
                                            <span>{selectedEntry.college}</span>
                                        </div>
                                        <div className="detail-item">
                                            <label>Registration Date</label>
                                            <span>{new Date(selectedEntry.registrationDate).toLocaleString()}</span>
                                        </div>
                                        {selectedEntry.utrNumber && (
                                            <div className="detail-item">
                                                <label>UTR Number</label>
                                                <span className="utr-highlight">{selectedEntry.utrNumber}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Type Specific Fields */}
                                {selectedEntry._type === 'accommodation' ? (
                                    <div className="detail-section">
                                        <h4>Accommodation Details</h4>
                                        <div className="detail-grid">
                                            <div className="detail-item"><label>Total Size</label><span>{selectedEntry.teamSize}</span></div>
                                            <div className="detail-item"><label>Girls Count</label><span>{selectedEntry.girlsCount}</span></div>
                                            <div className="detail-item"><label>Boys Count</label><span>{selectedEntry.boysCount}</span></div>
                                        </div>
                                    </div>
                                ) : selectedEntry._type === 'cultural' ? (
                                    <div className="detail-section">
                                        <h4>Performance Details</h4>
                                        <div className="detail-grid">
                                            <div className="detail-item"><label>Activity</label><span>{selectedEntry.activity}</span></div>
                                            <div className="detail-item"><label>Class</label><span>{selectedEntry.className}</span></div>
                                            {selectedEntry.groupSize && <div className="detail-item"><label>Group Size</label><span>{selectedEntry.groupSize}</span></div>}
                                        </div>
                                        {selectedEntry.member2Name && (
                                            <div className="detail-grid" style={{ marginTop: '10px' }}>
                                                <div className="detail-item"><label>Member 2 Name</label><span>{selectedEntry.member2Name}</span></div>
                                                <div className="detail-item"><label>Member 2 Class</label><span>{selectedEntry.member2Class}</span></div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="detail-section">
                                        <h4>Event Specifics</h4>
                                        <div className="detail-grid">
                                            {selectedEntry.problemStatement && (
                                                <div className="detail-item"><label>Problem Statement</label><span>{selectedEntry.problemStatement}</span></div>
                                            )}
                                            {selectedEntry.category && (
                                                <div className="detail-item"><label>Category</label><span>{selectedEntry.category}</span></div>
                                            )}
                                            <div className="detail-item"><label>Team Size</label><span>{selectedEntry.teamSize}</span></div>
                                        </div>
                                    </div>
                                )}

                                {/* Leader / Primary Contact */}
                                <div className="detail-section">
                                    <h4>{selectedEntry.leaderName ? 'Leader Information' : 'Contact Information'}</h4>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <label>Name</label>
                                            <span>{selectedEntry.leaderName || selectedEntry.participantName}</span>
                                        </div>
                                        <div className="detail-item">
                                            <label>Email</label>
                                            <span>{selectedEntry.leaderEmail || selectedEntry.email}</span>
                                        </div>
                                        <div className="detail-item">
                                            <label>Phone</label>
                                            <span>{selectedEntry.leaderPhone || selectedEntry.contact}</span>
                                        </div>
                                        {selectedEntry.leaderGender && (
                                            <div className="detail-item">
                                                <label>Gender</label>
                                                <span>{selectedEntry.leaderGender}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Unified Team Roster */}
                                <div className="detail-section">
                                    <h4>Full Detailed Roster</h4>
                                    <div className="members-table-wrapper">
                                        <table className="members-mini-table">
                                            <thead>
                                                <tr>
                                                    <th>MSR #</th>
                                                    <th>Name / Role</th>
                                                    <th>Email / Contact Status</th>
                                                    <th>Extra Details</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {/* Member 1 (Leader/Participant) */}
                                                <tr>
                                                    <td>1</td>
                                                    <td>
                                                        <strong>{selectedEntry.leaderName || selectedEntry.participantName || selectedEntry.fullName}</strong>
                                                        <div className="badge" style={{ fontSize: '0.6rem', marginTop: '4px' }}>LEADER / LEAD</div>
                                                    </td>
                                                    <td>
                                                        <div>{selectedEntry.leaderEmail || selectedEntry.email}</div>
                                                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{selectedEntry.leaderPhone || selectedEntry.contact || selectedEntry.phone}</div>
                                                    </td>
                                                    <td>
                                                        {selectedEntry.leaderGender && <div>Gender: {selectedEntry.leaderGender}</div>}
                                                        {selectedEntry.className && <div>Class: {selectedEntry.className}</div>}
                                                        {selectedEntry.college && <div style={{ fontSize: '0.7rem' }}>{selectedEntry.college}</div>}
                                                    </td>
                                                </tr>

                                                {/* Other Members (Registration/Accommodation Style) */}
                                                {selectedEntry.members && selectedEntry.members.map((m, idx) => (
                                                    <tr key={idx}>
                                                        <td>{idx + 2}</td>
                                                        <td>{m.name}</td>
                                                        <td>
                                                            <div>{m.email}</div>
                                                            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{m.phone}</div>
                                                        </td>
                                                        <td>
                                                            {m.gender && <div>Gender: {m.gender}</div>}
                                                            {selectedEntry.college && <div style={{ fontSize: '0.7rem' }}>{selectedEntry.college}</div>}
                                                        </td>
                                                    </tr>
                                                ))}

                                                {/* Cultural Member 2 (Duo Style) */}
                                                {selectedEntry._type === 'cultural' && selectedEntry.member2Name && (
                                                    <tr>
                                                        <td>2</td>
                                                        <td>{selectedEntry.member2Name}</td>
                                                        <td>-</td>
                                                        <td>
                                                            {selectedEntry.member2Class && <div>Class: {selectedEntry.member2Class}</div>}
                                                        </td>
                                                    </tr>
                                                )}

                                                {/* If it's a group with no specific member names but size is given */}
                                                {selectedEntry.groupSize > (selectedEntry.member2Name ? 2 : 1) && (
                                                    <tr>
                                                        <td>...</td>
                                                        <td colSpan="3" style={{ fontStyle: 'italic', opacity: 0.6 }}>
                                                            Additional group members: {selectedEntry.groupSize - (selectedEntry.member2Name ? 2 : 1)} more participants
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Payment Evidence */}
                                {selectedEntry.utrNumber && (
                                    <div className="detail-section">
                                        <h4>Financial Uplink</h4>
                                        <div className="detail-grid">
                                            <div className="detail-item">
                                                <label>UTR NUMBER</label>
                                                <span style={{ fontSize: '1.2rem', color: '#00e5ff', letterSpacing: '2px', fontWeight: 'bold' }}>{selectedEntry.utrNumber}</span>
                                            </div>
                                            <div className="detail-item">
                                                <label>PAYMENT STATUS</label>
                                                <span className="badge" style={{ background: selectedEntry.paymentVerified ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: selectedEntry.paymentVerified ? '#22c55e' : '#ef4444' }}>
                                                    {selectedEntry.paymentVerified ? 'VERIFIED' : 'PENDING VERIFICATION'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button className="close-btn" onClick={() => setShowModal(false)}>DISMISS UPLINK</button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Admin;
