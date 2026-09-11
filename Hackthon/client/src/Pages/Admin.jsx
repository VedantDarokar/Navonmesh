import React, { useState, useEffect, useRef } from 'react';
import '../Styles/admin.css';
import bgVideo from '../assets/bg.mp4';
import { FaMusic, FaUsers, FaHotel, FaProjectDiagram, FaDesktop, FaChartPie, FaTable, FaSync, FaDownload, FaEye, FaTimes, FaCheckCircle } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import navonmeshLogo from '../assets/navonmesh_tricolor.png';
import ssgmceLogo from '../assets/SSGMCE-Colour-Logomark-01 2.png';

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
    const [recruitAttendanceFilter, setRecruitAttendanceFilter] = useState('ALL');
    const [coreMembers, setCoreMembers] = useState([]);
    const [coreMemberSearch, setCoreMemberSearch] = useState('');
    const [coreMemberYearFilter, setCoreMemberYearFilter] = useState('ALL');
    const [showCorePasswords, setShowCorePasswords] = useState(false);
    const coreFileInputRef = useRef(null);

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
        sessionStorage.removeItem('adminId');
        setAdminId('');
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
                'Category': e.category || e.problemStatement || 'N/A',
                'UTR': e.utrNumber || 'N/A',
                'Status': e.paymentVerified ? 'Verified' : 'Pending'
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
                fetchCoreMembers(token);
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

    const fetchCoreMembers = async (token) => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const t = token || sessionStorage.getItem('adminToken');
            const aid = adminId || sessionStorage.getItem('adminId') || '';
            const res = await fetch(`${API_URL}/api/admin/core-members`, {
                headers: { 
                    'Authorization': `Bearer ${t}`,
                    'x-admin-id': aid
                }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.entries) setCoreMembers(data.entries);
            }
        } catch (err) {
            console.error('Core members fetch error:', err);
        }
    };

    const handleCoreMembersFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const buffer = evt.target.result;
                const workbook = XLSX.read(buffer, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
                
                if (!rawRows || rawRows.length === 0) {
                    alert('Uploaded file contains no data rows');
                    return;
                }

                const mappedMembers = rawRows.map((row) => {
                    const keys = Object.keys(row);
                    const getVal = (keywords) => {
                        const key = keys.find(k => keywords.some(kw => k.toLowerCase().replace(/[^a-z0-9]/g, '').includes(kw)));
                        return key ? String(row[key]).trim() : '';
                    };

                    const name = getVal(['name', 'studentname', 'membername', 'fullname']) || Object.values(row)[0] || '';
                    const contactNo = getVal(['contact', 'phone', 'mobile', 'cell', 'whatsapp']) || '';
                    const email = getVal(['email', 'mail', 'emailaddress']) || '';
                    const dob = getVal(['dob', 'birth', 'dateofbirth', 'birthdate']) || '';
                    const sisId = getVal(['sis', 'sisid', 'enroll', 'reg', 'roll', 'id']) || '';
                    const className = getVal(['class', 'branch', 'dept', 'department']) || '';
                    const year = getVal(['year', 'yr', 'academic']) || '';

                    return {
                        name,
                        contactNo,
                        email,
                        dob,
                        sisId,
                        class: className,
                        year
                    };
                }).filter(m => m.name && m.name.length > 1 && !m.name.includes('PK\u0003'));

                if (mappedMembers.length === 0) {
                    alert('Could not find valid member rows with names in the uploaded file');
                    return;
                }

                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const res = await fetch(`${API_URL}/api/admin/core-members/upload`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}`
                    },
                    body: JSON.stringify({ members: mappedMembers })
                });
                const data = await res.json();
                if (res.ok) {
                    alert(`✅ Successfully loaded ${data.count} core members!`);
                    fetchCoreMembers();
                } else {
                    alert(data.error || 'Upload failed');
                }
            } catch (err) {
                console.error(err);
                alert('Error uploading/parsing Excel or CSV file. Please make sure it is a valid file.');
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleClearCoreMembers = async () => {
        if (!window.confirm('Are you sure you want to reset and clear the core members roster?')) return;
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        try {
            const res = await fetch(`${API_URL}/api/admin/core-members/clear`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}`
                }
            });
            const data = await res.json();
            if (res.ok) {
                alert('Core members roster cleared.');
                setCoreMembers([]);
            } else {
                alert(data.error || 'Failed to clear');
            }
        } catch (err) {
            console.error(err);
            alert('Network error');
        }
    };

    const isPasswordAuthorized = ['nihal.ssgmce', 'nihal1512'].includes((adminId || sessionStorage.getItem('adminId') || '').toLowerCase().trim());

    const downloadCoreMembersExcel = () => {
        if (!coreMembers || coreMembers.length === 0) {
            alert('No core members to export');
            return;
        }
        const exportData = coreMembers.map((e, i) => ({
            '#': i + 1,
            'Name': e.name,
            'Login ID': e.loginId,
            'Password': isPasswordAuthorized ? e.password : '••••••••',
            'Contact No': e.contactNo,
            'Email': e.email,
            'Date of Birth': e.dob,
            'SIS ID': e.sisId,
            'Class': e.class,
            'Year': e.year
        }));
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Core Members');
        XLSX.writeFile(wb, `core_members_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const downloadCoreMembersPDF = () => {
        if (!coreMembers || coreMembers.length === 0) {
            alert('No core members to export');
            return;
        }
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        doc.setFontSize(16);
        doc.text("Navonmesh '27 - Core Members Roster", 14, 15);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 14, 22);

        const tableData = coreMembers.map((e, i) => [
            i + 1,
            e.name,
            e.loginId,
            isPasswordAuthorized ? e.password : '••••••••',
            e.contactNo,
            e.email,
            e.dob,
            e.sisId,
            e.class,
            e.year
        ]);

        autoTable(doc, {
            startY: 28,
            head: [['#', 'Name', 'Login ID', 'Password', 'Contact No', 'Email', 'DOB', 'SIS ID', 'Class', 'Year']],
            body: tableData,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [245, 158, 11] }
        });

        doc.save(`navonmesh27_core_members_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text);
        alert(`${label || 'Value'} copied to clipboard: ${text}`);
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

    const handleUpdateAttendance = async (id, newStatus) => {
        // Optimistic UI update
        setRecruitment(prev => ({
            ...prev,
            entries: prev.entries.map(entry =>
                entry._id === id ? { ...entry, attendance: newStatus } : entry
            )
        }));

        const token = sessionStorage.getItem('adminToken');
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await fetch(`${API_URL}/api/recruitment/${id}/attendance`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ attendance: newStatus })
            });
            if (!res.ok) {
                console.error('Attendance update failed on server');
                fetchRecruitment(token);
            }
        } catch (err) {
            console.error('Attendance network error:', err);
            fetchRecruitment(token);
        }
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
            'Attendance': e.attendance || 'Pending',
            'Submitted At': new Date(e.submittedAt).toLocaleString('en-IN')
        }));
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Recruitment');
        XLSX.writeFile(wb, `recruitment_applications_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const downloadRecruitmentPDF = async () => {
        // Apply same filters as the table view
        let filtered = recruitment.entries;
        if (recruitFilter !== 'ALL') filtered = filtered.filter(e => e.designation === recruitFilter);
        if (recruitAttendanceFilter !== 'ALL') filtered = filtered.filter(e => (e.attendance || 'Pending') === recruitAttendanceFilter);
        if (recruitSearch.trim()) {
            const s = recruitSearch.toLowerCase();
            filtered = filtered.filter(e =>
                e.name.toLowerCase().includes(s) ||
                e.designation.toLowerCase().includes(s)
            );
        }

        // ── Helper: load image and return aspect-ratio-safe dimensions ───
        // Fits the image inside a maxW × maxH box without stretching.
        const fitLogo = (src, maxW, maxH) =>
            new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    const ratio = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight);
                    resolve({ src, w: img.naturalWidth * ratio, h: img.naturalHeight * ratio });
                };
                img.onerror = () => resolve(null);
                img.src = src;
            });

        const MAX_LOGO_W = 36;  // maximum allowed width (mm)
        const LOGO_H     = 22;  // fixed max height (mm)

        // Load both logos in parallel, preserving aspect ratio
        const [ssgmce, navonmesh] = await Promise.all([
            fitLogo(ssgmceLogo,   MAX_LOGO_W, LOGO_H),
            fitLogo(navonmeshLogo, MAX_LOGO_W, LOGO_H),
        ]);

        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const pageW = doc.internal.pageSize.getWidth();   // 297mm
        const pageH = doc.internal.pageSize.getHeight();  // 210mm
        const marginX = 12;

        // ── Layout constants ────────────────────────────────────────────
        const LOGO_Y        = 7;                          // top margin for logos
        const HEADER_BOTTOM = LOGO_Y + LOGO_H + 4;       // ~33mm — divider line
        const TABLE_START_Y = HEADER_BOTTOM + 2;          // ~35mm — table starts
        const CENTER_X      = pageW / 2;

        // Helper: draw full header (page 1 only)
        const drawHeader = () => {
            // ── SSGMCE logo — TOP LEFT (vertically centred in logo zone) ─
            if (ssgmce) {
                const ly = LOGO_Y + (LOGO_H - ssgmce.h) / 2;  // vertically center
                try { doc.addImage(ssgmce.src, 'PNG', marginX, ly, ssgmce.w, ssgmce.h); } catch (_) {}
            }

            // ── Navonmesh logo — TOP RIGHT (vertically centred) ──────────
            if (navonmesh) {
                const ly = LOGO_Y + (LOGO_H - navonmesh.h) / 2;
                const lx = pageW - marginX - navonmesh.w;
                try { doc.addImage(navonmesh.src, 'PNG', lx, ly, navonmesh.w, navonmesh.h); } catch (_) {}
            }

            // ── Center title text ────────────────────────────────────────
            const textY1 = LOGO_Y + 7;   // "Navonmesh'27"
            const textY2 = textY1 + 7;   // College name
            const textY3 = textY2 + 6;   // (Evaluation Sheet)

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(16);
            doc.setTextColor(20, 20, 80);
            doc.text("Navonmesh'27", CENTER_X, textY1, { align: 'center' });

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(50, 50, 50);
            doc.text('Shri Sant Gajanan Maharaj College of Engineering, Shegaon', CENTER_X, textY2, { align: 'center' });

            doc.setFont('helvetica', 'italic');
            doc.setFontSize(9);
            doc.setTextColor(90, 90, 90);
            doc.text('(Evaluation Sheet)', CENTER_X, textY3, { align: 'center' });

            // ── Divider line ─────────────────────────────────────────────
            doc.setDrawColor(20, 20, 80);
            doc.setLineWidth(0.6);
            doc.line(marginX, HEADER_BOTTOM, pageW - marginX, HEADER_BOTTOM);
        };

        // Draw header on page 1 only
        drawHeader();

        // ── Table ────────────────────────────────────────────────────────
        const head = [[
            { content: 'Sr. No.', styles: { halign: 'center' } },
            { content: 'Name',    styles: { halign: 'center' } },
            { content: 'Year',   styles: { halign: 'center' } },
            { content: 'Branch', styles: { halign: 'center' } },
            { content: 'Designation', styles: { halign: 'center' } },
            { content: 'Communication', styles: { halign: 'center' } },
            { content: 'Attitude',  styles: { halign: 'center' } },
            { content: 'Teamwork',  styles: { halign: 'center' } },
            { content: 'Technical', styles: { halign: 'center' } },
            { content: 'Planning',  styles: { halign: 'center' } },
        ]];

        const body = filtered.map((e, i) => [
            { content: i + 1, styles: { halign: 'center' } },
            e.name || '',
            { content: e.year || '', styles: { halign: 'center' } },
            e.branch || 'N/A',
            e.designation || '',
            '', '', '', '', ''
        ]);

        // Total column widths: 11+48+13+30+36+27+21+21+21+21 = 249mm
        // Center on 297mm page: (297 - 249) / 2 = 24mm each side
        const totalTableW = 249;
        const centeredMargin = (pageW - totalTableW) / 2;

        autoTable(doc, {
            head,
            body,
            startY: TABLE_START_Y,
            margin: { left: centeredMargin, right: centeredMargin },
            tableWidth: totalTableW,
            styles: {
                fontSize: 8,
                cellPadding: { top: 3, bottom: 3, left: 2, right: 2 },
                lineColor: [160, 160, 200],
                lineWidth: 0.3,
                textColor: [20, 20, 20],
                valign: 'middle',
                overflow: 'linebreak',
            },
            headStyles: {
                fillColor: [20, 20, 80],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 8,
                halign: 'center',
                cellPadding: { top: 4, bottom: 4, left: 2, right: 2 },
            },
            alternateRowStyles: { fillColor: [238, 242, 255] },
            columnStyles: {
                0: { cellWidth: 11, halign: 'center' },
                1: { cellWidth: 48 },
                2: { cellWidth: 13, halign: 'center' },
                3: { cellWidth: 30 },
                4: { cellWidth: 36 },
                5: { cellWidth: 27, halign: 'center' },
                6: { cellWidth: 21, halign: 'center' },
                7: { cellWidth: 21, halign: 'center' },
                8: { cellWidth: 21, halign: 'center' },
                9: { cellWidth: 21, halign: 'center' },
            },
            didDrawPage: (data) => {
                // Page 2+ onwards: only table continues — no header, no logos
                // Just add page number footer on every page
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(7);
                doc.setTextColor(160, 160, 160);
                doc.text(
                    `Page ${data.pageNumber}`,
                    pageW - marginX,
                    pageH - 4,
                    { align: 'right' }
                );
            }
        });

        const dateStr = new Date().toISOString().split('T')[0];
        doc.save(`navonmesh27_evaluation_${dateStr}.pdf`);
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
                .map(r => ({ 
                    id: r.id, 
                    email: r.email, 
                    name: r.name, 
                    team: r.team, 
                    designation: r.designation || '',
                    loginId: r.loginId || '',
                    password: r.password || '',
                    sisId: r.sisId || '',
                    class: r.class || '',
                    dob: r.dob || '',
                    year: r.year || '',
                    type: r.type 
                }));

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
        let list = [];

        const targets = broadcastData.targetEvents;
        const isAll = targets.includes('ALL');

        if (summary) {
            if (isAll || targets.includes('Srijan (Hackathon)')) {
                summary.srijan?.entries?.forEach(e => list.push({ id: e._id, name: e.leaderName, email: e.leaderEmail || 'N/A', team: e.teamName, type: 'Registration' }));
            }
            if (isAll || targets.includes('Ankur (Project Expo)')) {
                summary.ankur?.entries?.forEach(e => list.push({ id: e._id, name: e.leaderName, email: e.leaderEmail || 'N/A', team: e.teamName, type: 'Registration' }));
            }
            if (isAll || targets.includes('Udbhav (Conference)')) {
                summary.udbhav?.entries?.forEach(e => list.push({ id: e._id, name: e.leaderName, email: e.leaderEmail || 'N/A', team: e.teamName, type: 'Registration' }));
            }
            if (isAll || targets.includes('Cultural')) {
                summary.cultural?.entries?.forEach(e => list.push({ id: e._id, name: e.participantName, email: e.email || 'N/A', team: 'Cultural Team', type: 'Cultural' }));
            }
            if (isAll || targets.includes('Accommodation')) {
                summary.accommodation?.entries?.forEach(e => list.push({ id: e._id, name: e.leaderName, email: e.leaderEmail || 'N/A', team: e.teamName, type: 'Accommodation' }));
            }
        }

        if (isAll || targets.includes('Recruitment')) {
            if (recruitment && recruitment.entries) {
                recruitment.entries.forEach(e => list.push({
                    id: e._id,
                    name: e.name,
                    email: e.email || 'N/A',
                    team: `Recruitment (${e.designation || 'Applicant'})`,
                    designation: e.designation || 'Applicant',
                    type: 'Recruitment'
                }));
            }
        }

        if (isAll || targets.includes('Core Members')) {
            if (coreMembers && coreMembers.length > 0) {
                coreMembers.forEach((m, idx) => list.push({
                    id: m.id || m.sisId || m.loginId || `core_${idx}`,
                    name: m.name,
                    email: m.email || 'N/A',
                    team: `Core Member - ${m.class || m.year || 'SSGMCE'}`,
                    designation: 'Core Member',
                    loginId: m.loginId || '',
                    password: m.password || '',
                    sisId: m.sisId || '',
                    class: m.class || '',
                    dob: m.dob || '',
                    year: m.year || '',
                    type: 'Core Member'
                }));
            }
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
                    <div className="admin-nav-tabs">
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
                        <button
                            className={`nav-mode-btn ${activeTab === 'core-members' ? 'active' : ''}`}
                            onClick={() => setActiveTab('core-members')}
                            style={activeTab === 'core-members' ? { borderColor: '#f59e0b', color: '#f59e0b' } : {}}
                        >
                            CORE MEMBERS ({coreMembers.length})
                        </button>
                    </div>
                    <div className="admin-quick-actions">
                        <button className="refresh-btn" onClick={() => fetchData(sessionStorage.getItem('adminToken'))} title="Refresh Data">
                            <FaSync className={loading ? 'spin' : ''} />
                        </button>
                        <button className="maintenance-btn" onClick={() => window.open('/#/admin/maintenance', '_blank')}>Maintenance</button>
                        <button className="event-day-btn" onClick={() => window.open('/#/admin/event-day', '_blank')}>Event Day</button>
                        <button className="timer-btn-admin" onClick={() => window.open('/#/admin/break-timer', '_blank')}>Timer</button>
                        <button className="management-btn-admin" onClick={() => setManagementAuth({ ...managementAuth, open: true })}>Management</button>
                        <button className="logout-btn" onClick={handleLogout}>Abort Mission</button>
                    </div>
                </div>
            </header>


            {loading ? (
                <div className="admin-loader">Synchronizing data...</div>
            ) : summary ? (
                activeTab === 'core-members' ? (
                    <div className="admin-content">
                        <div className="recruitment-header-row">
                            <div>
                                <h2 style={{ fontFamily: 'Orbitron', color: '#f59e0b', margin: 0, fontSize: '1.2rem', letterSpacing: '3px' }}>CORE MEMBERS INTEL & ROSTER</h2>
                                <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '4px 0 0', letterSpacing: '1px' }}>SSGMCE COUNCIL & OPERATIVE LOGINS</p>
                            </div>
                            <div className="recruitment-toolbar">
                                <input
                                    type="text"
                                    className="recruit-search-input"
                                    placeholder="Search name, login ID, SIS ID, email..."
                                    value={coreMemberSearch}
                                    onChange={(e) => setCoreMemberSearch(e.target.value)}
                                    style={{ borderColor: 'rgba(245, 158, 11, 0.3)' }}
                                />
                                <select
                                    className="recruit-filter-select"
                                    value={coreMemberYearFilter}
                                    onChange={(e) => setCoreMemberYearFilter(e.target.value)}
                                    style={{ borderColor: 'rgba(245, 158, 11, 0.3)', color: '#f59e0b' }}
                                >
                                    <option value="ALL">All Years</option>
                                    <option value="1st">1st Year</option>
                                    <option value="2nd">2nd Year</option>
                                    <option value="3rd">3rd Year</option>
                                    <option value="4th">4th Year</option>
                                </select>
                                
                                <input
                                    type="file"
                                    ref={coreFileInputRef}
                                    accept=".csv,.xlsx,.xls,.txt"
                                    onChange={handleCoreMembersFileUpload}
                                    style={{ display: 'none' }}
                                />
                                <button
                                    className="recruit-action-btn"
                                    onClick={() => coreFileInputRef.current?.click()}
                                    style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.4)', cursor: 'pointer', fontFamily: 'Orbitron', fontSize: '0.75rem', padding: '8px 14px', borderRadius: '6px' }}
                                >
                                    📥 IMPORT / UPLOAD CSV
                                </button>
                                {isPasswordAuthorized && (
                                    <button
                                        className="recruit-action-btn"
                                        onClick={() => setShowCorePasswords(!showCorePasswords)}
                                        style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.2)', cursor: 'pointer', fontFamily: 'Orbitron', fontSize: '0.75rem', padding: '8px 14px', borderRadius: '6px' }}
                                    >
                                        <FaEye style={{ marginRight: '6px' }} /> {showCorePasswords ? 'HIDE PASSWORDS' : 'SHOW PASSWORDS'}
                                    </button>
                                )}
                                <button
                                    className="recruit-action-btn"
                                    onClick={downloadCoreMembersExcel}
                                    style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.3)', cursor: 'pointer', fontFamily: 'Orbitron', fontSize: '0.75rem', padding: '8px 14px', borderRadius: '6px' }}
                                >
                                    <FaDownload style={{ marginRight: '4px' }} /> EXCEL
                                </button>
                                <button
                                    className="recruit-action-btn"
                                    onClick={downloadCoreMembersPDF}
                                    style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', cursor: 'pointer', fontFamily: 'Orbitron', fontSize: '0.75rem', padding: '8px 14px', borderRadius: '6px' }}
                                >
                                    <FaDownload style={{ marginRight: '4px' }} /> PDF
                                </button>
                                <button
                                    className="recruit-action-btn"
                                    onClick={handleClearCoreMembers}
                                    style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.4)', cursor: 'pointer', fontFamily: 'Orbitron', fontSize: '0.75rem', padding: '8px 14px', borderRadius: '6px' }}
                                    title="Clear all core members"
                                >
                                    🗑 RESET ROSTER
                                </button>
                                <button
                                    className="recruit-action-btn"
                                    onClick={() => fetchCoreMembers()}
                                    style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.2)', cursor: 'pointer', padding: '8px 14px', borderRadius: '6px' }}
                                    title="Reload members"
                                >
                                    <FaSync />
                                </button>
                            </div>
                        </div>

                        {(() => {
                            let filtered = coreMembers;
                            if (coreMemberYearFilter !== 'ALL') {
                                filtered = filtered.filter(e => (e.year || '').toLowerCase().includes(coreMemberYearFilter.toLowerCase()));
                            }
                            if (coreMemberSearch.trim()) {
                                const s = coreMemberSearch.toLowerCase();
                                filtered = filtered.filter(e =>
                                    (e.name && e.name.toLowerCase().includes(s)) ||
                                    (e.loginId && e.loginId.toLowerCase().includes(s)) ||
                                    (e.sisId && e.sisId.toLowerCase().includes(s)) ||
                                    (e.email && e.email.toLowerCase().includes(s)) ||
                                    (e.contactNo && e.contactNo.includes(s)) ||
                                    (e.class && e.class.toLowerCase().includes(s))
                                );
                            }

                            return (
                                <>
                                    <div style={{ color: '#64748b', fontSize: '0.75rem', letterSpacing: '2px', marginBottom: '12px' }}>
                                        SHOWING {filtered.length} OF {coreMembers.length} CORE MEMBERS
                                    </div>
                                    <div className="data-table-container">
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    {['#', 'Name', 'Login ID', 'Password', 'Contact No', 'Email', 'DOB', 'SIS ID', 'Class', 'Year', 'Quick Copy'].map(h => (
                                                        <th key={h}>{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filtered.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={11} className="empty-row" style={{ padding: '50px 20px', textAlign: 'center' }}>
                                                            <div style={{ color: '#f59e0b', fontFamily: 'Orbitron', fontSize: '1.1rem', marginBottom: '8px' }}>NO CORE MEMBERS LOADED YET</div>
                                                            <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: '500px', margin: '0 auto 16px' }}>
                                                                Click <strong>"IMPORT / UPLOAD CSV"</strong> above to upload your core members CSV file, or place <code>core_members.csv</code> in <code>Hackthon/server/</code>.
                                                            </p>
                                                            <button
                                                                onClick={() => coreFileInputRef.current?.click()}
                                                                style={{ background: '#f59e0b', color: '#000', border: 'none', padding: '10px 24px', borderRadius: '8px', fontFamily: 'Orbitron', fontWeight: 'bold', cursor: 'pointer' }}
                                                            >
                                                                SELECT CSV FILE NOW
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ) : filtered.map((e, i) => (
                                                    <tr key={e.id || i}>
                                                        <td style={{ color: '#475569' }}>{i + 1}</td>
                                                        <td style={{ fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap' }}>{e.name}</td>
                                                        <td>
                                                            <span style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '3px 8px', borderRadius: '4px', fontFamily: 'Orbitron', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                                                                {e.loginId}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span style={{ background: 'rgba(139, 92, 246, 0.12)', color: '#c084fc', border: '1px solid rgba(139, 92, 246, 0.3)', padding: '3px 8px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                                                                {isPasswordAuthorized && showCorePasswords ? e.password : '••••••••'}
                                                            </span>
                                                        </td>
                                                        <td style={{ color: '#94a3b8', whiteSpace: 'nowrap' }}>{e.contactNo || 'N/A'}</td>
                                                        <td style={{ color: '#94a3b8' }}>{e.email || 'N/A'}</td>
                                                        <td style={{ color: '#e2e8f0', whiteSpace: 'nowrap' }}>{e.dob || 'N/A'}</td>
                                                        <td>
                                                            <span style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#60a5fa', padding: '2px 8px', borderRadius: '4px', fontSize: '0.78rem', fontFamily: 'Orbitron', whiteSpace: 'nowrap' }}>
                                                                {e.sisId || 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span style={{ color: '#cbd5e1', fontSize: '0.82rem' }}>{e.class || 'N/A'}</span>
                                                        </td>
                                                        <td>
                                                            <span style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#34d399', padding: '2px 8px', borderRadius: '12px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                                                                {e.year || 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                                <button
                                                                    onClick={() => copyToClipboard(e.loginId, 'Login ID')}
                                                                    style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#f59e0b', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem', fontFamily: 'Orbitron' }}
                                                                    title="Copy Login ID"
                                                                >
                                                                    ID
                                                                </button>
                                                                {isPasswordAuthorized && (
                                                                    <button
                                                                        onClick={() => copyToClipboard(e.password, 'Password')}
                                                                        style={{ background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)', color: '#c084fc', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem', fontFamily: 'Orbitron' }}
                                                                        title="Copy Password"
                                                                    >
                                                                        PASS
                                                                    </button>
                                                                )}
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
                ) : activeTab === 'recruitment' ? (
                    <div className="admin-content">
                        <div className="recruitment-header-row">
                            <div>
                                <h2 style={{ fontFamily: 'Orbitron', color: '#00f3ff', margin: 0, fontSize: '1.2rem', letterSpacing: '3px' }}>RECRUITMENT APPLICATIONS</h2>
                                <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '4px 0 0', letterSpacing: '1px' }}>NAVONMESH '27 — TEAM ASSEMBLY</p>
                            </div>
                            <div className="recruitment-toolbar">
                                <input
                                    type="text"
                                    className="recruit-search-input"
                                    placeholder="Search name / designation..."
                                    value={recruitSearch}
                                    onChange={(e) => setRecruitSearch(e.target.value)}
                                />
                                <select
                                    className="recruit-filter-select"
                                    value={recruitFilter}
                                    onChange={(e) => setRecruitFilter(e.target.value)}
                                >
                                    <option value="ALL">All Designations</option>
                                    {['Coordinator','Overall Head','Srijan Head','Ankur Head','Udbhav Head','Drone Head','Management Co-Head','Publicity Co-Head','Accommodation Co-Head','Logistics Co-Head','Technical Co-Head','Event Co-Head','Discipline Co-Head','Graphics Co-Head','Videography Co-Head','Social Media Co-Head'].map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                                <select
                                    className="recruit-filter-select"
                                    value={recruitAttendanceFilter}
                                    onChange={(e) => setRecruitAttendanceFilter(e.target.value)}
                                    style={recruitAttendanceFilter !== 'ALL' ? { borderColor: '#00f3ff', color: '#00f3ff' } : {}}
                                >
                                    <option value="ALL">All Attendance</option>
                                    <option value="Present">Present Only</option>
                                    <option value="Absent">Absent Only</option>
                                    <option value="Pending">Pending Only</option>
                                </select>
                                <button className="recruit-action-btn pdf" onClick={downloadRecruitmentPDF}>
                                    <FaDownload /> EXPORT PDF
                                </button>
                                <button
                                    className="recruit-action-btn send-all"
                                    onClick={handleSendAllRecruitmentMail}
                                    title="Send acknowledgment email to all unsent applicants"
                                >
                                    ✉ SEND ALL
                                </button>
                                <button className="recruit-action-btn refresh" onClick={() => fetchRecruitment()}>
                                    <FaSync />
                                </button>
                            </div>
                        </div>

                        {(() => {
                            let filtered = recruitment.entries;
                            if (recruitFilter !== 'ALL') filtered = filtered.filter(e => e.designation === recruitFilter);
                            if (recruitAttendanceFilter !== 'ALL') {
                                filtered = filtered.filter(e => (e.attendance || 'Pending') === recruitAttendanceFilter);
                            }
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
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                                        <div style={{ color: '#64748b', fontSize: '0.75rem', letterSpacing: '2px' }}>
                                            SHOWING {filtered.length} OF {recruitment.count} APPLICATIONS
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px', fontSize: '0.72rem', fontFamily: 'Orbitron, sans-serif', flexWrap: 'wrap' }}>
                                            <span style={{ color: '#4ade80', background: 'rgba(34,197,94,0.1)', padding: '4px 9px', borderRadius: '4px', border: '1px solid rgba(34,197,94,0.25)' }}>
                                                ✓ PRESENT: {recruitment.entries.filter(e => e.attendance === 'Present').length}
                                            </span>
                                            <span style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)', padding: '4px 9px', borderRadius: '4px', border: '1px solid rgba(239,68,68,0.25)' }}>
                                                ✗ ABSENT: {recruitment.entries.filter(e => e.attendance === 'Absent').length}
                                            </span>
                                            <span style={{ color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '4px 9px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                ⏳ PENDING: {recruitment.entries.filter(e => !e.attendance || e.attendance === 'Pending').length}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="data-table-container">
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    {['#','Name','Contact No','Email','Year','Branch','Designation','Attendance','Action'].map(h => (
                                                        <th key={h} style={h === 'Attendance' ? { textAlign: 'center' } : {}}>{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filtered.length === 0 ? (
                                                    <tr><td colSpan={9} className="empty-row">NO APPLICATIONS FOUND</td></tr>
                                                ) : filtered.map((e, i) => (
                                                    <tr key={e._id}>
                                                        <td style={{ color: '#475569' }}>{i + 1}</td>
                                                        <td style={{ fontWeight: 600, color: '#e2e8f0' }}>{e.name}</td>
                                                        <td style={{ color: '#94a3b8' }}>{e.contactNo}</td>
                                                        <td style={{ color: '#94a3b8' }}>{e.email}</td>
                                                        <td>
                                                            <span style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa', padding: '3px 10px', borderRadius: '20px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{e.year}</span>
                                                        </td>
                                                        <td>
                                                            <span style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa', padding: '3px 10px', borderRadius: '20px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{e.branch || 'N/A'}</span>
                                                        </td>
                                                        <td>
                                                            <span style={{ background: 'rgba(0,243,255,0.08)', color: '#00f3ff', padding: '3px 10px', borderRadius: '4px', fontSize: '0.85rem', whiteSpace: 'nowrap', border: '1px solid rgba(0,243,255,0.2)' }}>{e.designation}</span>
                                                        </td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            <div className="attendance-toggle-group">
                                                                <button
                                                                    type="button"
                                                                    className={`attendance-btn present ${e.attendance === 'Present' ? 'active' : ''}`}
                                                                    onClick={() => handleUpdateAttendance(e._id, e.attendance === 'Present' ? 'Pending' : 'Present')}
                                                                    title={e.attendance === 'Present' ? 'Present (Click to unmark)' : 'Mark as Present'}
                                                                >
                                                                    ✓ Present
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className={`attendance-btn absent ${e.attendance === 'Absent' ? 'active' : ''}`}
                                                                    onClick={() => handleUpdateAttendance(e._id, e.attendance === 'Absent' ? 'Pending' : 'Absent')}
                                                                    title={e.attendance === 'Absent' ? 'Absent (Click to unmark)' : 'Mark as Absent'}
                                                                >
                                                                    ✗ Absent
                                                                </button>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                                <button
                                                                    onClick={() => handleSendRecruitmentMail(e._id, e.name, e.email)}
                                                                    disabled={e.mailSent}
                                                                    style={{ background: e.mailSent ? 'rgba(34,197,94,0.18)' : 'rgba(34,197,94,0.08)', border: `1px solid ${e.mailSent ? 'rgba(34,197,94,0.6)' : 'rgba(34,197,94,0.3)'}`, color: '#22c55e', padding: '5px 10px', borderRadius: '4px', cursor: e.mailSent ? 'default' : 'pointer', fontSize: '0.78rem', whiteSpace: 'nowrap', fontFamily: 'Orbitron', fontWeight: 'bold' }}
                                                                    title={e.mailSent ? 'Acknowledgment email already sent' : 'Send acknowledgment email'}
                                                                >
                                                                    {e.mailSent ? '✓ Sent' : '✉ Mail'}
                                                                </button>
                                                                <button onClick={() => handleDeleteRecruitment(e._id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }} title="Delete application">
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
                            <div className={`stat-card ${activeTab === 'core-members' ? 'active' : ''}`}
                                onClick={() => setActiveTab('core-members')}
                                onMouseMove={handleMouseMove}
                                style={activeTab === 'core-members' ? { borderColor: '#f59e0b' } : {}}>
                                <div className="stat-card-scan"></div>
                                <div className="stat-icon-bg"><FaUsers style={{ color: '#f59e0b' }} /></div>
                                <div className="stat-info">
                                    <h3 style={{ color: '#f59e0b' }}>Core Members</h3>
                                    <p className="stat-sub">SSGMCE Council</p>
                                </div>
                                <div className="stat-main">
                                    <div className="stat-number" style={{ color: '#f59e0b' }}>{coreMembers.length} <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>Members</span></div>
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

                                            <div className="search-box-admin">
                                                <input
                                                    type="text"
                                                    placeholder="Search Teams/Leads/UTR..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                            </div>

                                            <div className="revised-filters">
                                                <button
                                                    onClick={() => setRevisedFilter('ALL')}
                                                    className={`revised-filter-btn ${revisedFilter === 'ALL' ? 'active-all' : ''}`}
                                                >
                                                    All Status
                                                </button>
                                                <button
                                                    onClick={() => setRevisedFilter('REVISED')}
                                                    className={`revised-filter-btn ${revisedFilter === 'REVISED' ? 'active-revised' : ''}`}
                                                >
                                                    Revised Only
                                                </button>
                                                <button
                                                    onClick={() => setRevisedFilter('PENDING')}
                                                    className={`revised-filter-btn ${revisedFilter === 'PENDING' ? 'active-pending' : ''}`}
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
                    <div className="management-section animate-fade-in">
                        <div className="management-header">
                            <div>
                                <h1>COMMITTEE MANAGEMENT</h1>
                                <p>Personnel Deployment Registry</p>
                            </div>
                            <button className="management-close-btn" onClick={() => setActiveTab('dashboard')}>CLOSE</button>
                        </div>

                        <div className="management-tabs">
                            {departments.map(dept => (
                                <button
                                    key={dept}
                                    onClick={() => setActiveManagementTab(dept)}
                                    className={`management-dept-btn ${activeManagementTab === dept ? 'active' : ''}`}
                                >{dept}</button>
                            ))}
                        </div>

                        <div className={`management-content-grid ${adminId === 'nihal1512' ? 'has-admin-form' : ''}`}>
                            {adminId === 'nihal1512' && (
                                <div className="add-member-form">
                                    <h3>Add to {activeManagementTab}</h3>
                                    <form onSubmit={handleAddMember}>
                                        <div style={{ marginBottom: '18px' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)' }}>Member Name</label>
                                            <input
                                                type="text"
                                                value={newMember.name}
                                                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                                                placeholder="Enter Full Name"
                                            />
                                        </div>
                                        <div style={{ marginBottom: '24px' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)' }}>Phone Number</label>
                                            <input
                                                type="text"
                                                value={newMember.phone}
                                                onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                                                placeholder="+91 00000 00000"
                                            />
                                        </div>
                                        <button type="submit">ENGAGE RECRUIT</button>
                                    </form>
                                </div>
                            )}

                            <div className="members-list-container">
                                <h3 style={{ marginBottom: '18px', fontFamily: 'Orbitron', fontSize: '1.05rem', color: '#f59e0b' }}>Active Units: {activeManagementTab}</h3>
                                <div className="members-list">
                                    {committeeMembers.filter(m => m.department === activeManagementTab).length === 0 ? (
                                        <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '40px 20px', letterSpacing: '1px', fontSize: '0.85rem' }}>No units deployed in this sector.</p>
                                    ) : (
                                        committeeMembers.filter(m => m.department === activeManagementTab).map(member => (
                                            <div key={member._id} className="member-card-item">
                                                <div>
                                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem' }}>{member.name}</h4>
                                                    <p style={{ margin: 0, color: '#00f3ff', fontSize: '0.85rem', fontFamily: 'Orbitron' }}>{member.phone}</p>
                                                </div>
                                                {adminId === 'nihal1512' && (
                                                    <button onClick={() => handleDeleteMember(member._id)} style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} title="Remove unit">
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
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                <label style={{ color: '#c084fc', fontFamily: 'Orbitron', margin: 0, fontSize: '0.9rem' }}>Message Content</label>
                                                <span style={{ fontSize: '0.72rem', color: '#00f3ff', fontFamily: 'Orbitron' }}>Click tag to insert</span>
                                            </div>
                                            
                                            {/* Interactive Personalization Tag Chips */}
                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                                                {[
                                                    { tag: '{{participantName}}', label: 'Participant' },
                                                    { tag: '{{designation}}', label: 'Designation' },
                                                    { tag: '{{teamName}}', label: 'Team / Dept' },
                                                    { tag: '{{leaderName}}', label: 'Leader' },
                                                    { tag: '{{loginId}}', label: 'Login ID' },
                                                    { tag: '{{password}}', label: 'Password' },
                                                    { tag: '{{sisId}}', label: 'SIS ID' },
                                                    { tag: '{{class}}', label: 'Class' }
                                                ].map(item => (
                                                    <button
                                                        key={item.tag}
                                                        type="button"
                                                        onClick={() => {
                                                            setBroadcastData(prev => ({
                                                                ...prev,
                                                                body: prev.body ? `${prev.body} ${item.tag}` : item.tag
                                                            }));
                                                        }}
                                                        style={{
                                                            background: item.tag.includes('login') || item.tag.includes('pass') ? 'rgba(245, 158, 11, 0.15)' : 'rgba(139, 92, 246, 0.15)',
                                                            border: item.tag.includes('login') || item.tag.includes('pass') ? '1px solid rgba(245, 158, 11, 0.45)' : '1px solid rgba(139, 92, 246, 0.4)',
                                                            color: item.tag.includes('login') || item.tag.includes('pass') ? '#fcd34d' : '#e9d5ff',
                                                            padding: '4px 10px',
                                                            borderRadius: '6px',
                                                            fontSize: '0.75rem',
                                                            cursor: 'pointer',
                                                            fontFamily: 'Inter',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                            transition: '0.2s'
                                                        }}
                                                        title={`Click to insert ${item.tag}`}
                                                    >
                                                        <code style={{ color: item.tag.includes('login') || item.tag.includes('pass') ? '#f59e0b' : '#00f3ff', fontWeight: 'bold' }}>{item.tag}</code>
                                                        <span style={{ opacity: 0.65, fontSize: '0.68rem' }}>({item.label})</span>
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Quick Preset Buttons */}
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setBroadcastData(prev => ({
                                                            ...prev,
                                                            subject: "Exclusive Invitation: Executive Interview Panel | Navonmesh '27",
                                                            body: `📍 VENUE : Mechanical Seminar Hall, SSGMCE\n⏰ TIME  : 11:00 AM Onwards (Tomorrow)\n🎯 AGENDA: Junior Recruits & Aspirants Assessment Drive\n\n───────────────────────────────────────────────────\n\nDear {{participantName}},\n\nGreetings from the Navonmesh '27 Organizing Directorate.\n\nTomorrow, our organizing council has officially scheduled the comprehensive candidate interview drive to assess, evaluate, and induct promising junior cohorts into our distinguished symposium committees.\n\nGiven your proven leadership acumen, organizational proficiency, and discerning judgment, you are formally invited to convene as an esteemed evaluator on the Executive Interview Panel. Your expertise will be pivotal in evaluating talent, assessing technical and creative proficiencies, and curating an elite team destined to orchestrate this grand edition.\n\n📌 Special Advisory Regarding POD.AI Assessment:\nWe are fully cognizant that tomorrow coincides with the POD.AI internship assessment test. All committee members who are free, or who conclude their assessment early, are earnestly requested to report to the venue and assist in conducting the interviews.\n\nLet us collaborate to sculpt the finest organizing cadre for Navonmesh '27.\n\nWith Highest Regard & Respect,\nNavonmesh '27 Organizing Directorate\nShri Sant Gajanan Maharaj College of Engineering (SSGMCE), Shegaon`
                                                        }));
                                                    }}
                                                    style={{
                                                        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.22) 0%, rgba(217, 119, 6, 0.32) 100%)',
                                                        border: '1px solid rgba(245, 158, 11, 0.65)',
                                                        color: '#fef08a',
                                                        padding: '5px 12px',
                                                        borderRadius: '6px',
                                                        fontSize: '0.7rem',
                                                        cursor: 'pointer',
                                                        fontFamily: 'Orbitron',
                                                        letterSpacing: '1px',
                                                        fontWeight: 'bold',
                                                        boxShadow: '0 0 12px rgba(245, 158, 11, 0.18)'
                                                    }}
                                                >
                                                    ★ + INTERVIEW INVITATION
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setBroadcastData(prev => ({
                                                            ...prev,
                                                            subject: prev.subject || "Navonmesh '27 - Core Member Credentials & Briefing",
                                                            body: `Dear {{participantName}},\n\nCongratulations on your appointment as an official Core Committee Member for Navonmesh '27 at Shri Sant Gajanan Maharaj College of Engineering (SSGMCE), Shegaon.\n\nHere are your confidential portal credentials for coordination and committee access:\n\n• Login ID: {{loginId}}\n• Password: {{password}}\n• SIS ID: {{sisId}}\n• Class: {{class}}\n\nPlease keep these credentials secure and do not share them. You can use this ID and password to log in to the administrative portal.\n\nFurther committee briefing and operational duties will be dispatched shortly.\n\nWarm regards,\nNavonmesh '27 Organizing Directorate\nSSGMCE Shegaon`
                                                        }));
                                                    }}
                                                    style={{
                                                        background: 'rgba(245, 158, 11, 0.12)',
                                                        border: '1px solid rgba(245, 158, 11, 0.4)',
                                                        color: '#f59e0b',
                                                        padding: '5px 12px',
                                                        borderRadius: '6px',
                                                        fontSize: '0.7rem',
                                                        cursor: 'pointer',
                                                        fontFamily: 'Orbitron',
                                                        letterSpacing: '1px'
                                                    }}
                                                >
                                                    + CORE CREDENTIALS TEMPLATE
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setBroadcastData(prev => ({
                                                            ...prev,
                                                            subject: prev.subject || "Recruitment Drive - Navonmesh '27",
                                                            body: `You are cordially invited to participate in the prestigious recruitment drive for Navonmesh '27 at Shri Sant Gajanan Maharaj College of Engineering (SSGMCE), Shegaon.\n\nDear {{participantName}},\n\nYour application for the role of {{designation}} has been duly acknowledged by the Navonmesh '27 Organizing Council.\n\nAs one of our foremost technical and cultural symposiums, Navonmesh represents innovation, leadership, and student brilliance. Our organizing council welcomes dedicated student leaders and creators to take part in orchestrating this grand edition.\n\nFurther briefing, interview schedule, and venue details will be communicated to you shortly.`
                                                        }));
                                                    }}
                                                    style={{
                                                        background: 'rgba(0, 243, 255, 0.1)',
                                                        border: '1px solid rgba(0, 243, 255, 0.3)',
                                                        color: '#00f3ff',
                                                        padding: '5px 12px',
                                                        borderRadius: '6px',
                                                        fontSize: '0.7rem',
                                                        cursor: 'pointer',
                                                        fontFamily: 'Orbitron',
                                                        letterSpacing: '1px'
                                                    }}
                                                >
                                                    + RECRUITMENT TEMPLATE
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setBroadcastData(prev => ({
                                                            ...prev,
                                                            subject: prev.subject || "Official Dispatch - Navonmesh '27",
                                                            body: `Greeting, {{leaderName}} of {{teamName}}!\n\nWelcome to Navonmesh '27 at SSGMCE Shegaon. We are pleased to share this official communication regarding your event participation.\n\nPlease review your team mission briefing and stay tuned for further notifications.`
                                                        }));
                                                    }}
                                                    style={{
                                                        background: 'rgba(168, 85, 247, 0.1)',
                                                        border: '1px solid rgba(168, 85, 247, 0.3)',
                                                        color: '#c084fc',
                                                        padding: '5px 12px',
                                                        borderRadius: '6px',
                                                        fontSize: '0.7rem',
                                                        cursor: 'pointer',
                                                        fontFamily: 'Orbitron',
                                                        letterSpacing: '1px'
                                                    }}
                                                >
                                                    + GENERAL TEMPLATE
                                                </button>
                                            </div>

                                            <textarea
                                                rows="8"
                                                placeholder={`Greeting, {{participantName}}! Regarding your role as {{designation}} in Navonmesh '27...`}
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
                                                {broadcasting ? 'TRANSMITTING...' : `INITIATE BROADCAST TO ${selectedRecipientIds.length} ${broadcastData.recipientScope === 'ALL' ? 'TEAMS / RECIPIENTS (ALL MEMBERS)' : 'TEAM LEADERS / RECIPIENTS'}`}
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
                                            {['ALL', 'Srijan (Hackathon)', 'Ankur (Project Expo)', 'Udbhav (Conference)', 'Cultural', 'Accommodation', 'Recruitment', 'Core Members'].map(ev => (
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
                                                    style={ev === 'Core Members' ? { borderColor: 'rgba(245, 158, 11, 0.4)' } : {}}
                                                >
                                                    {ev === 'ALL' ? 'Total' : (ev === 'Core Members' ? 'Core Members' : ev.split(' ')[0])}
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
                                                    {recipient.type === 'Core Member' && recipient.loginId && (
                                                        <div style={{ fontSize: '0.7rem', color: '#f59e0b', fontFamily: 'monospace', marginTop: '2px' }}>
                                                            ID: {recipient.loginId}
                                                        </div>
                                                    )}
                                                </div>
                                                <div 
                                                    className="recipient-type-badge"
                                                    style={
                                                        recipient.type === 'Recruitment'
                                                            ? { background: 'rgba(0, 243, 255, 0.15)', color: '#00f3ff', border: '1px solid rgba(0, 243, 255, 0.3)' }
                                                            : recipient.type === 'Core Member'
                                                            ? { background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.4)' }
                                                            : {}
                                                    }
                                                >
                                                    {recipient.type === 'Recruitment' ? 'REC' : (recipient.type === 'Core Member' ? 'CORE' : recipient.type.charAt(0))}
                                                </div>
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
