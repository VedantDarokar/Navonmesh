import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { 
    FaQrcode, FaCamera, FaTimes, FaCheckCircle, FaExclamationTriangle, 
    FaSync, FaUtensils, FaUserTie, FaChevronDown, FaChevronUp, FaCheck, FaUser,
    FaCalendarAlt, FaChevronLeft, FaChevronRight 
} from 'react-icons/fa';
import '../Styles/admin_qr_scanner.css';

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const getTodayDateStr = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const formatDisplayDate = (dateStr) => {
    if (!dateStr) return 'Select Date';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        return `${parts[2]} - ${parts[1]} - ${parts[0]}`;
    }
    return dateStr;
};

const COORDINATOR_LIST = [
    { id: 'mess_head', name: 'Main Mess Head', role: 'Catering Incharge', image: null },
    { id: 'canteen_head', name: 'Canteen Incharge', role: 'Food Station Duty', image: null },
    { id: 'other', name: 'Custom Name...', role: 'Field Operative', image: null }
];

const AdminQRScanner = () => {
    const [coordinator, setCoordinator] = useState('Main Mess Head');
    const [customCoordinator, setCustomCoordinator] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [overrideMealSlot, setOverrideMealSlot] = useState('AUTO'); // 'AUTO' | 'BREAKFAST' | 'LUNCH' | 'DINNER'
    const [selectedDate, setSelectedDate] = useState(getTodayDateStr());
    const [dateHistory, setDateHistory] = useState([]);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [isLockedForNext, setIsLockedForNext] = useState(false);

    // Custom Cyberpunk Themed Calendar State
    const [calendarOpen, setCalendarOpen] = useState(false);
    const calendarRef = useRef(null);
    const todayStr = getTodayDateStr();
    const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear());
    const [calendarMonth, setCalendarMonth] = useState(() => new Date().getMonth());

    const [statusData, setStatusData] = useState({
        activeSlot: null,
        activeSlotLabel: 'Checking...',
        currentTime: ''
    });
    const [stats, setStats] = useState({
        breakfast: 0,
        lunch: 0,
        dinner: 0,
        total: 0
    });
    const [recentScans, setRecentScans] = useState([]);
    const [scanResult, setScanResult] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [manualId, setManualId] = useState('');
    const [loading, setLoading] = useState(false);
    const [cameraFacing, setCameraFacing] = useState('environment'); // 'environment' or 'user'

    const html5QrCodeRef = useRef(null);
    const isScanningRef = useRef(false);
    const isLockedRef = useRef(false);
    const lastScannedQrRef = useRef('');
    const lastScanTimeRef = useRef(0);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // Click outside listener to close custom coordinator dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        if (dropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [dropdownOpen]);

    // Click outside listener for custom calendar popover
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                setCalendarOpen(false);
            }
        };
        if (calendarOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [calendarOpen]);

    const toggleCalendar = () => {
        if (!calendarOpen && selectedDate) {
            const parts = selectedDate.split('-');
            if (parts.length === 3) {
                const y = parseInt(parts[0], 10);
                const m = parseInt(parts[1], 10) - 1;
                if (!isNaN(y) && !isNaN(m)) {
                    setCalendarYear(y);
                    setCalendarMonth(m);
                }
            }
        }
        setCalendarOpen(prev => !prev);
    };

    const handlePrevMonth = () => {
        if (calendarMonth === 0) {
            setCalendarMonth(11);
            setCalendarYear(prev => prev - 1);
        } else {
            setCalendarMonth(prev => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (calendarMonth === 11) {
            setCalendarMonth(0);
            setCalendarYear(prev => prev + 1);
        } else {
            setCalendarMonth(prev => prev + 1);
        }
    };

    const handleSelectDate = (dateStr) => {
        setSelectedDate(dateStr);
        fetchStatusAndStats(dateStr);
        setCalendarOpen(false);
    };

    const handleSelectPrevMonthDay = (day) => {
        const prevYear = calendarMonth === 0 ? calendarYear - 1 : calendarYear;
        const prevMonth = calendarMonth === 0 ? 11 : calendarMonth - 1;
        const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setCalendarYear(prevYear);
        setCalendarMonth(prevMonth);
        handleSelectDate(dateStr);
    };

    const handleSelectNextMonthDay = (day) => {
        const nextYear = calendarMonth === 11 ? calendarYear + 1 : calendarYear;
        const nextMonth = calendarMonth === 11 ? 0 : calendarMonth + 1;
        const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setCalendarYear(nextYear);
        setCalendarMonth(nextMonth);
        handleSelectDate(dateStr);
    };

    const handleGoToday = () => {
        const today = getTodayDateStr();
        setSelectedDate(today);
        fetchStatusAndStats(today);
        const now = new Date();
        setCalendarYear(now.getFullYear());
        setCalendarMonth(now.getMonth());
        setCalendarOpen(false);
    };

    // Calculate calendar days grid
    const daysInCurrentMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay(); // 0 for Sunday
    const daysInPrevMonth = new Date(calendarYear, calendarMonth, 0).getDate();

    const prevMonthDays = [];
    for (let i = firstDayIndex - 1; i >= 0; i--) {
        prevMonthDays.push({ day: daysInPrevMonth - i });
    }

    const currentMonthDays = [];
    for (let d = 1; d <= daysInCurrentMonth; d++) {
        const mStr = String(calendarMonth + 1).padStart(2, '0');
        const dStr = String(d).padStart(2, '0');
        currentMonthDays.push({
            day: d,
            dateStr: `${calendarYear}-${mStr}-${dStr}`
        });
    }

    const totalSlots = Math.ceil((prevMonthDays.length + currentMonthDays.length) / 7) * 7;
    const remainingSlots = totalSlots - (prevMonthDays.length + currentMonthDays.length);
    const nextMonthDays = [];
    for (let d = 1; d <= remainingSlots; d++) {
        nextMonthDays.push({ day: d });
    }

    const selectedCoordObj = COORDINATOR_LIST.find(c => c.name === coordinator) || {
        name: coordinator === 'Other' ? (customCoordinator || 'Custom Name...') : coordinator,
        role: 'Field Operative',
        image: null
    };

    // Play Web Audio Sound (No external asset dependency)
    const playSound = (type = 'success') => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            if (type === 'success') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
                osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
                gain.gain.setValueAtTime(0.3, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.35);
            } else {
                // Warning / Reject buzz
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, ctx.currentTime);
                gain.gain.setValueAtTime(0.4, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.45);
            }
        } catch (e) {
            // Audio context not allowed or failed
        }
    };

    // Fetch initial status & stats (supports any selected date)
    const fetchStatusAndStats = async (dateToFetch = selectedDate) => {
        try {
            const [statusRes, statsRes, histRes] = await Promise.all([
                fetch(`${API_URL}/api/food/status`),
                fetch(`${API_URL}/api/food/stats?date=${dateToFetch}`),
                fetch(`${API_URL}/api/food/stats/history`)
            ]);
            const sData = await statusRes.json();
            const stData = await statsRes.json();
            const hData = await histRes.json();

            if (sData.success) {
                setStatusData(sData);
            }
            if (stData.success) {
                setStats(stData.counts);
                setRecentScans(stData.recentScans || []);
            }
            if (hData.success) {
                setDateHistory(hData.history || []);
            }
        } catch (err) {
            console.error('Error fetching food data:', err);
        }
    };

    useEffect(() => {
        fetchStatusAndStats(selectedDate);
        const interval = setInterval(() => fetchStatusAndStats(selectedDate), 8000);
        return () => clearInterval(interval);
    }, [selectedDate]);

    // Start QR Camera Scanner with hardware acceleration and wide scan area
    const startScanner = async () => {
        if (isScanningRef.current) return;
        try {
            // Clean up previous scanner if exists
            if (html5QrCodeRef.current) {
                try {
                    await html5QrCodeRef.current.stop();
                    await html5QrCodeRef.current.clear();
                } catch (e) {}
            }

            const qrScanner = new Html5Qrcode('qr-reader-viewport', {
                formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
                verbose: false
            });
            html5QrCodeRef.current = qrScanner;

            await qrScanner.start(
                { facingMode: cameraFacing },
                {
                    fps: 20,
                    qrbox: (viewfinderWidth, viewfinderHeight) => {
                        const edge = Math.min(viewfinderWidth, viewfinderHeight);
                        const dim = Math.max(200, Math.floor(edge * 0.85));
                        return { width: dim, height: dim };
                    },
                    aspectRatio: 1.0,
                    disableFlip: false
                },
                (decodedText) => {
                    handleDecodedQR(decodedText);
                },
                () => {
                    // Ignore transient frame scan errors
                }
            );
            isScanningRef.current = true;
            setScanning(true);
        } catch (err) {
            console.error('Camera start error:', err);
            alert('Unable to open camera: ' + (err.message || 'Check camera permissions.'));
            setScanning(false);
            isScanningRef.current = false;
        }
    };

    // Stop QR Camera Scanner
    const stopScanner = async () => {
        if (html5QrCodeRef.current && isScanningRef.current) {
            try {
                await html5QrCodeRef.current.stop();
                await html5QrCodeRef.current.clear();
            } catch (err) {
                console.error('Error stopping scanner:', err);
            }
            isScanningRef.current = false;
            setScanning(false);
        }
    };

    // Toggle Camera (front / back)
    const toggleCameraFacing = async () => {
        const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
        setCameraFacing(nextFacing);
        if (scanning) {
            await stopScanner();
            setTimeout(() => {
                startScanner();
            }, 300);
        }
    };

    // Handle Image file upload scan
    const handleImageUpload = async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        try {
            const html5QrCode = new Html5Qrcode('qr-image-scan-helper');
            const decodedText = await html5QrCode.scanFile(file, false);
            html5QrCode.clear();
            handleDecodedQR(decodedText);
        } catch (err) {
            alert('Could not decode QR from image. Ensure the QR is clear and try again.');
        }
    };

    useEffect(() => {
        return () => {
            if (html5QrCodeRef.current && isScanningRef.current) {
                html5QrCodeRef.current.stop().catch(() => {});
            }
        };
    }, []);

    // Handle scanned string
    const handleDecodedQR = (rawText) => {
        // 1. If scanner is currently paused for reviewing previous scan, block immediately
        if (isLockedRef.current) return;

        // 2. Prevent camera from immediately detecting the exact same QR again
        if (lastScannedQrRef.current === rawText) return;

        const now = Date.now();
        if (now - lastScanTimeRef.current < 1500) return;
        lastScanTimeRef.current = now;

        // Freeze camera scanning so subsequent frames do not re-scan
        isLockedRef.current = true;
        setIsLockedForNext(true);
        lastScannedQrRef.current = rawText;

        submitScan(rawText);
    };

    // Unlock scanner to proceed to the next participant QR
    const handleGoForNextQr = () => {
        setScanResult(null);
        setIsLockedForNext(false);
        isLockedRef.current = false;
        // Keep a short cooldown on the previous QR code so camera does not re-detect same phone if still held
        setTimeout(() => {
            lastScannedQrRef.current = '';
        }, 3000);
    };

    // Submit Scan to API
    const submitScan = async (qrPayload) => {
        setLoading(true);
        const activeCoordinator = coordinator === 'Other' ? (customCoordinator || 'Coordinator') : coordinator;

        try {
            const res = await fetch(`${API_URL}/api/food/scan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    qrData: qrPayload,
                    coordinatorName: activeCoordinator,
                    overrideMealSlot: overrideMealSlot
                })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                playSound('success');
                setScanResult({
                    status: 'APPROVED',
                    title: 'MEAL APPROVED! ✅',
                    message: data.message,
                    scanInfo: data.scanInfo
                });
            } else if (data.status === 'ALREADY_SCANNED') {
                playSound('reject');
                setScanResult({
                    status: 'ALREADY_SCANNED',
                    title: 'ALREADY REDEEMED! ❌',
                    message: data.message,
                    scanInfo: data.scanInfo
                });
            } else if (data.status === 'OUTSIDE_HOURS') {
                playSound('reject');
                setScanResult({
                    status: 'OUTSIDE_HOURS',
                    title: 'OUTSIDE MEAL HOURS ⚠️',
                    message: data.message,
                    participantName: data.participantName
                });
            } else {
                playSound('reject');
                setScanResult({
                    status: 'INVALID',
                    title: 'SCAN REJECTED ❌',
                    message: data.message || 'Invalid or unrecognized QR Code'
                });
            }

            fetchStatusAndStats();
        } catch (err) {
            console.error('Scan error:', err);
            playSound('reject');
            setScanResult({
                status: 'ERROR',
                title: 'COMMUNICATION ERROR ⚠️',
                message: 'Failed to communicate with scanner server. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (!manualId.trim()) return;
        isLockedRef.current = true;
        setIsLockedForNext(true);
        lastScannedQrRef.current = manualId.trim();
        submitScan(manualId.trim());
        setManualId('');
    };

    const activeScannerTheme = typeof window !== 'undefined' ? (localStorage.getItem('coor_theme') || 'theme-light') : 'theme-light';

    return (
        <div className={`admin-qr-scanner-wrapper ${activeScannerTheme}`}>
            {/* Header / Active Slot Ribbon */}
            <div className="scanner-control-bar">
                <div className="coordinator-selector-group">
                    <span className="control-label">
                        <FaUserTie className="control-label-icon" /> Active Coordinator:
                    </span>

                    <div className="custom-coord-dropdown-container" ref={dropdownRef}>
                        <button
                            type="button"
                            className={`custom-coord-trigger ${dropdownOpen ? 'open' : ''}`}
                            onClick={() => setDropdownOpen(prev => !prev)}
                            aria-haspopup="listbox"
                            aria-expanded={dropdownOpen}
                        >
                            <div className="coord-trigger-content">
                                {selectedCoordObj?.image ? (
                                    <img src={selectedCoordObj.image} alt={coordinator} className="coord-trigger-avatar" />
                                ) : (
                                    <span className="coord-trigger-icon-badge"><FaUser /></span>
                                )}
                                <span className="coord-trigger-name">
                                    {coordinator === 'Other' ? (customCoordinator || 'Custom Name...') : coordinator}
                                </span>
                            </div>
                            <span className="coord-trigger-chevron">
                                {dropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
                            </span>
                        </button>

                        {dropdownOpen && (
                            <div className="custom-coord-dropdown-menu" role="listbox">
                                <div className="custom-coord-dropdown-header">
                                    <span>SELECT ACTIVE COORDINATOR</span>
                                </div>
                                <div className="custom-coord-dropdown-list">
                                    {COORDINATOR_LIST.map((c) => {
                                        const isSelected = c.name === coordinator || (c.id === 'other' && coordinator === 'Other');
                                        return (
                                            <button
                                                key={c.id}
                                                type="button"
                                                className={`coord-dropdown-item ${isSelected ? 'selected' : ''}`}
                                                onClick={() => {
                                                    if (c.id === 'other') {
                                                        setCoordinator('Other');
                                                    } else {
                                                        setCoordinator(c.name);
                                                    }
                                                    setDropdownOpen(false);
                                                }}
                                            >
                                                <div className="coord-item-left">
                                                    {c.image ? (
                                                        <img src={c.image} alt={c.name} className="coord-item-avatar" />
                                                    ) : (
                                                        <div className="coord-item-avatar-placeholder">
                                                            <FaUser />
                                                        </div>
                                                    )}
                                                    <div className="coord-item-text">
                                                        <div className="coord-item-name">{c.name}</div>
                                                        <div className="coord-item-role">{c.role}</div>
                                                    </div>
                                                </div>
                                                {isSelected && <FaCheck className="coord-item-check" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {coordinator === 'Other' && (
                        <input
                            type="text"
                            placeholder="Enter custom coordinator name..."
                            value={customCoordinator}
                            onChange={(e) => setCustomCoordinator(e.target.value)}
                            className="custom-coord-input"
                            autoFocus
                        />
                    )}
                </div>
            </div>

            {/* 🍱 Meal Slot Selector Pills (Matching Image 4 Mockup) */}
            <div className="meal-slot-pill-bar">
                <span className="meal-slot-bar-label">Meal Slot Selector</span>
                <div className="meal-slot-pill-group">
                    <button
                        type="button"
                        className={`meal-slot-pill ${overrideMealSlot === 'BREAKFAST' || (overrideMealSlot === 'AUTO' && statusData.activeSlot === 'BREAKFAST') ? 'active breakfast' : ''}`}
                        onClick={() => setOverrideMealSlot('BREAKFAST')}
                    >
                        <span>🌅</span> Breakfast
                    </button>
                    <button
                        type="button"
                        className={`meal-slot-pill ${overrideMealSlot === 'LUNCH' || (overrideMealSlot === 'AUTO' && statusData.activeSlot === 'LUNCH') ? 'active lunch' : ''}`}
                        onClick={() => setOverrideMealSlot('LUNCH')}
                    >
                        <span>🍛</span> Lunch
                    </button>
                    <button
                        type="button"
                        className={`meal-slot-pill ${overrideMealSlot === 'DINNER' || (overrideMealSlot === 'AUTO' && statusData.activeSlot === 'DINNER') ? 'active dinner' : ''}`}
                        onClick={() => setOverrideMealSlot('DINNER')}
                    >
                        <span>🌙</span> Dinner
                    </button>
                    {overrideMealSlot !== 'AUTO' && (
                        <button
                            type="button"
                            className="meal-slot-pill auto-reset"
                            onClick={() => setOverrideMealSlot('AUTO')}
                            title="Reset to Clock Auto-Detect"
                        >
                            ↺ Auto ({statusData.activeSlotLabel || 'Clock'})
                        </button>
                    )}
                </div>
            </div>

            {/* 📷 Central Camera Viewfinder with Futuristic Corner Brackets (Matching Image 4) */}
            <div className="viewfinder-main-wrapper">
                <div className="viewfinder-container">
                    <div 
                        id="qr-reader-viewport" 
                        className="qr-viewport"
                        style={{ display: scanning ? 'flex' : 'none' }}
                    ></div>

                    {/* Futuristic Corner Brackets */}
                    <div className="vf-corner top-left"></div>
                    <div className="vf-corner top-right"></div>
                    <div className="vf-corner bottom-left"></div>
                    <div className="vf-corner bottom-right"></div>

                    {!scanning && (
                        <div className="scanner-start-overlay">
                            <div id="qr-image-scan-helper" style={{ display: 'none' }}></div>
                            <FaQrcode className="big-qr-icon" />
                            <h3>Mess & Canteen QR Scanner</h3>
                            <p>Scan participant's dynamic QR code to verify and claim meal.</p>
                            <button className="start-scan-btn" onClick={startScanner}>
                                <FaCamera /> START CAMERA SCANNER
                            </button>
                            <label className="btn-pick-qr-file">
                                🖼️ Or Pick QR from Image/Gallery
                                <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleImageUpload}
                                />
                            </label>
                        </div>
                    )}

                    {scanning && (
                        <div className="scanner-active-overlay">
                            <div id="qr-image-scan-helper" style={{ display: 'none' }}></div>
                            <div className="laser-scan-line"></div>

                            {/* When scan result is awaiting review, overlay pause banner */}
                            {isLockedForNext && (
                                <div className="scanner-locked-indicator">
                                    <div className="locked-pill">
                                        <span>⏸️ Scanner Paused for Verification</span>
                                        <button className="btn-locked-next" onClick={handleGoForNextQr}>
                                            Scan Next QR ➔
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="camera-tools">
                                <button className="cam-tool-btn" onClick={toggleCameraFacing} title="Flip Camera">
                                    Flip ({cameraFacing === 'environment' ? 'Rear' : 'Front'})
                                </button>
                                <label className="cam-tool-btn" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                    🖼️ File
                                    <input
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={handleImageUpload}
                                    />
                                </label>
                                <button className="cam-tool-btn stop-btn" onClick={stopScanner}>
                                    <FaTimes /> Stop
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 📋 Scan Result Card - Immediately below Viewfinder (Matching Image 4) */}
            {scanResult && (
                <div className={`scan-result-card ${scanResult.status.toLowerCase()}`}>
                    <div className="result-header">
                        <div className="result-status-title">
                            {scanResult.status === 'APPROVED' ? (
                                <>
                                    <FaCheckCircle className="result-icon success" />
                                    <span className="status-text approved">VALID MEAL PASS</span>
                                </>
                            ) : (
                                <>
                                    <FaExclamationTriangle className="result-icon reject" />
                                    <span className="status-text reject">
                                        {scanResult.status === 'ALREADY_SCANNED' ? 'ALREADY CLAIMED' : 'INVALID PASS'}
                                    </span>
                                </>
                            )}
                        </div>
                        <button className="close-result-btn" onClick={handleGoForNextQr} title="Dismiss and Scan Next">
                            <FaTimes />
                        </button>
                    </div>

                    <p className="result-message">{scanResult.message}</p>

                    {scanResult.scanInfo && (
                        <div className="result-details-box">
                            <div className="detail-row">
                                <span className="d-label">Participant:</span>
                                <span className="d-val strong">{scanResult.scanInfo.participantName}</span>
                            </div>
                            <div className="detail-row">
                                <span className="d-label">Squad ID:</span>
                                <span className="d-val squad-id-val">{scanResult.scanInfo.teamName}</span>
                            </div>
                            <div className="detail-row">
                                <span className="d-label">Meal:</span>
                                <span className="d-val meal-tag">{scanResult.scanInfo.mealType}</span>
                            </div>
                            <div className="detail-row">
                                <span className="d-label">Scanned At:</span>
                                <span className="d-val time-tag">
                                    {new Date(scanResult.scanInfo.scannedAt).toLocaleTimeString('en-IN', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit'
                                    })}
                                </span>
                            </div>
                        </div>
                    )}

                    {scanResult.status === 'ALREADY_SCANNED' && (
                        <div className="conflict-warning-badge">
                            ⛔ DO NOT SERVE AGAIN • ALREADY CLAIMED
                        </div>
                    )}

                    {/* ➡️ PROMINENT "GO FOR NEXT QR" ACTION (Matching Image 4) */}
                    <div className="next-qr-action-box">
                        <div className="next-qr-callout">
                            <span className="next-qr-english">➔ GO FOR NEXT QR</span>
                            <span className="next-qr-marathi">(पुढील QR स्कॅन करा)</span>
                        </div>
                        <button className="btn-scan-next-qr" onClick={handleGoForNextQr}>
                            <FaQrcode style={{ marginRight: '8px' }} /> Scan Next
                        </button>
                        <p className="next-qr-hint">
                            Scanner locked so the same QR is not detected twice. Tap above to scan the next participant.
                        </p>
                    </div>
                </div>
            )}

            {/* 📊 Compact Stats Strip (Matching Image 4: "Today: 10 Oct 2026 | Stats: Breakfast: 320 | Lunch: 450 | Dinner: 180") */}
            <div className="scanner-status-strip">
                <span className="strip-date">📅 Today: {selectedDate}</span>
                <span className="strip-separator">|</span>
                <span className="strip-stat bf">Stats: Breakfast: <strong>{stats.breakfast}</strong></span>
                <span className="strip-separator">|</span>
                <span className="strip-stat ln">Lunch: <strong>{stats.lunch}</strong></span>
                <span className="strip-separator">|</span>
                <span className="strip-stat dn">Dinner: <strong>{stats.dinner}</strong></span>
                <button className="strip-sync-btn" onClick={() => fetchStatusAndStats(selectedDate)} title="Refresh Live Data">
                    <FaSync />
                </button>
            </div>

            {/* 📅 Date Filter & Historical Logs Bar (On Scroll) */}
            <div className="date-meal-filter-bar">
                <div className="date-filter-left">
                    <span className="control-label">📅 Date Logs:</span>
                    <div className="cyber-date-picker-wrap" ref={calendarRef}>
                        <button
                            type="button"
                            className={`cyber-date-trigger-btn ${calendarOpen ? 'open' : ''}`}
                            onClick={toggleCalendar}
                            aria-haspopup="dialog"
                            aria-expanded={calendarOpen}
                        >
                            <span className="cyber-date-display">{formatDisplayDate(selectedDate)}</span>
                            <span className="cyber-date-chevron">{calendarOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
                        </button>

                        {calendarOpen && (
                            <div className="cyber-calendar-popover" role="dialog" aria-label="Select Date">
                                <div className="cyber-cal-header">
                                    <button
                                        type="button"
                                        className="cyber-cal-nav-btn"
                                        onClick={handlePrevMonth}
                                        title="Previous Month"
                                    >
                                        <FaChevronLeft />
                                    </button>
                                    <div className="cyber-cal-title">
                                        <span className="cyber-cal-month">{MONTH_NAMES[calendarMonth]}</span>
                                        <span className="cyber-cal-year">{calendarYear}</span>
                                    </div>
                                    <button
                                        type="button"
                                        className="cyber-cal-nav-btn"
                                        onClick={handleNextMonth}
                                        title="Next Month"
                                    >
                                        <FaChevronRight />
                                    </button>
                                </div>

                                <div className="cyber-cal-weekdays">
                                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                                        <span key={d} className="cyber-cal-weekday">{d}</span>
                                    ))}
                                </div>

                                <div className="cyber-cal-days-grid">
                                    {prevMonthDays.map((p, idx) => (
                                        <button
                                            key={`prev-${idx}`}
                                            type="button"
                                            className="cyber-cal-day-cell outside-month"
                                            onClick={() => handleSelectPrevMonthDay(p.day)}
                                        >
                                            {p.day}
                                        </button>
                                    ))}

                                    {currentMonthDays.map((item) => {
                                        const isSelected = item.dateStr === selectedDate;
                                        const isToday = item.dateStr === todayStr;
                                        return (
                                            <button
                                                key={item.dateStr}
                                                type="button"
                                                className={`cyber-cal-day-cell ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                                                onClick={() => handleSelectDate(item.dateStr)}
                                            >
                                                <span>{item.day}</span>
                                                {isToday && !isSelected && <span className="today-dot"></span>}
                                            </button>
                                        );
                                    })}

                                    {nextMonthDays.map((n, idx) => (
                                        <button
                                            key={`next-${idx}`}
                                            type="button"
                                            className="cyber-cal-day-cell outside-month"
                                            onClick={() => handleSelectNextMonthDay(n.day)}
                                        >
                                            {n.day}
                                        </button>
                                    ))}
                                </div>

                                <div className="cyber-cal-footer">
                                    <button
                                        type="button"
                                        className="cyber-cal-foot-btn close-btn"
                                        onClick={() => setCalendarOpen(false)}
                                    >
                                        Close
                                    </button>
                                    <button
                                        type="button"
                                        className="cyber-cal-foot-btn today-btn"
                                        onClick={handleGoToday}
                                    >
                                        Today
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        className={`btn-date-today ${selectedDate === getTodayDateStr() ? 'active' : ''}`}
                        onClick={() => {
                            const today = getTodayDateStr();
                            setSelectedDate(today);
                            fetchStatusAndStats(today);
                        }}
                    >
                        Today
                    </button>
                </div>

                <button
                    className="btn-open-history"
                    onClick={() => setShowHistoryModal(true)}
                >
                    📊 All Dates History ({dateHistory.length} Days)
                </button>
            </div>

            {/* Manual ID Input fallback */}
            <form className="manual-scan-form" onSubmit={handleManualSubmit}>
                <input
                    type="text"
                    placeholder="Or enter Participant ID manually (e.g. NM-P-1024)..."
                    value={manualId}
                    onChange={(e) => setManualId(e.target.value)}
                    className="manual-input"
                />
                <button type="submit" className="manual-submit-btn" disabled={loading}>
                    {loading ? 'CHECKING...' : 'VERIFY & REDEEM'}
                </button>
            </form>

            {/* Recent Scans Table */}
            <div className="recent-scans-box">
                <div className="recent-header">
                    <h5>Recent Scans ({selectedDate}) • {recentScans.length}</h5>
                    <button className="sync-sm-btn" onClick={() => fetchStatusAndStats(selectedDate)}><FaSync /></button>
                </div>

                <div className="recent-scans-scroll">
                    {recentScans.length === 0 ? (
                        <p className="no-scans-text">No scans recorded for {selectedDate}.</p>
                    ) : (
                        <table className="mini-scans-table">
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Participant</th>
                                    <th>Squad</th>
                                    <th>Meal</th>
                                    <th>Coordinator</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentScans.map((s, idx) => (
                                    <tr key={s._id || idx}>
                                        <td className="time-td">
                                            {new Date(s.scannedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="strong">{s.participantName}</td>
                                        <td>{s.teamName}</td>
                                        <td><span className={`mini-meal-tag ${s.mealType.toLowerCase()}`}>{s.mealType}</span></td>
                                        <td>{s.scannedBy}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* 📊 ALL-DATES BREAKDOWN MODAL */}
            {showHistoryModal && (
                <div className="meal-history-modal-overlay" onClick={() => setShowHistoryModal(false)}>
                    <div className="meal-history-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="history-modal-header">
                            <div>
                                <h4 style={{ margin: 0, fontFamily: 'Orbitron, sans-serif', color: '#10b981' }}>
                                    📅 Date-wise Participant Meal Count History
                                </h4>
                                <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.8rem' }}>
                                    How many participants took breakfast, lunch, and dinner on each date
                                </p>
                            </div>
                            <button className="history-close-btn" onClick={() => setShowHistoryModal(false)}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="history-table-container">
                            {dateHistory.length === 0 ? (
                                <p style={{ color: '#94a3b8', textAlign: 'center', padding: '30px' }}>
                                    No meal records found in database yet.
                                </p>
                            ) : (
                                <table className="date-history-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>🌅 Breakfast</th>
                                            <th>🍛 Lunch</th>
                                            <th>🌙 Dinner</th>
                                            <th>🍱 Total Meals</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dateHistory.map((item, idx) => (
                                            <tr key={idx} className={item.dateStr === selectedDate ? 'selected-date-row' : ''}>
                                                <td className="date-col">
                                                    <strong>{item.dateStr}</strong>
                                                    {item.dateStr === getTodayDateStr() && <span className="today-chip">TODAY</span>}
                                                </td>
                                                <td><span className="meal-pill breakfast">{item.breakfast}</span></td>
                                                <td><span className="meal-pill lunch">{item.lunch}</span></td>
                                                <td><span className="meal-pill dinner">{item.dinner}</span></td>
                                                <td><span className="meal-pill total">{item.total}</span></td>
                                                <td>
                                                    <button
                                                        className="btn-select-history-date"
                                                        onClick={() => {
                                                            setSelectedDate(item.dateStr);
                                                            fetchStatusAndStats(item.dateStr);
                                                            setShowHistoryModal(false);
                                                        }}
                                                    >
                                                        {item.dateStr === selectedDate ? 'Viewing ✓' : 'View Logs'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminQRScanner;
