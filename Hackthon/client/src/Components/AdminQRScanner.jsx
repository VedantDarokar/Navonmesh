import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { FaQrcode, FaCamera, FaTimes, FaCheckCircle, FaExclamationTriangle, FaSync, FaUtensils, FaUserTie } from 'react-icons/fa';
import '../Styles/admin_qr_scanner.css';

const AdminQRScanner = () => {
    const [coordinator, setCoordinator] = useState('Coordinator 1');
    const [customCoordinator, setCustomCoordinator] = useState('');
    const [overrideMealSlot, setOverrideMealSlot] = useState('AUTO'); // 'AUTO' | 'BREAKFAST' | 'LUNCH' | 'DINNER'
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
    const lastScanTimeRef = useRef(0);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

    // Fetch initial status & stats
    const fetchStatusAndStats = async () => {
        try {
            const [statusRes, statsRes] = await Promise.all([
                fetch(`${API_URL}/api/food/status`),
                fetch(`${API_URL}/api/food/stats`)
            ]);
            const sData = await statusRes.json();
            const stData = await statsRes.json();

            if (sData.success) {
                setStatusData(sData);
            }
            if (stData.success) {
                setStats(stData.counts);
                setRecentScans(stData.recentScans || []);
            }
        } catch (err) {
            console.error('Error fetching food data:', err);
        }
    };

    useEffect(() => {
        fetchStatusAndStats();
        const interval = setInterval(fetchStatusAndStats, 8000);
        return () => clearInterval(interval);
    }, []);

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
        const now = Date.now();
        // Prevent rapid repeated fire within 2.5s for same code
        if (now - lastScanTimeRef.current < 2500) return;
        lastScanTimeRef.current = now;

        submitScan(rawText);
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
        submitScan(manualId.trim());
        setManualId('');
    };

    return (
        <div className="admin-qr-scanner-wrapper">
            {/* Header / Active Slot Ribbon */}
            <div className="scanner-control-bar">
                <div className="coordinator-selector-group">
                    <span className="control-label"><FaUserTie /> Active Coordinator:</span>
                    <select
                        value={coordinator}
                        onChange={(e) => setCoordinator(e.target.value)}
                        className="coordinator-select"
                    >
                        {[...Array(10)].map((_, i) => (
                            <option key={i} value={`Coordinator ${i + 1}`}>
                                Coordinator #{i + 1}
                            </option>
                        ))}
                        <option value="Main Mess Head">Main Mess Head</option>
                        <option value="Canteen Incharge">Canteen Incharge</option>
                        <option value="Other">Custom Name...</option>
                    </select>

                    {coordinator === 'Other' && (
                        <input
                            type="text"
                            placeholder="Enter your name"
                            value={customCoordinator}
                            onChange={(e) => setCustomCoordinator(e.target.value)}
                            className="custom-coord-input"
                        />
                    )}
                </div>

                <div className="meal-slot-override-group">
                    <span className="control-label"><FaUtensils /> Meal Slot:</span>
                    <select
                        value={overrideMealSlot}
                        onChange={(e) => setOverrideMealSlot(e.target.value)}
                        className={`meal-slot-select ${overrideMealSlot !== 'AUTO' ? 'manual-override' : ''}`}
                    >
                        <option value="AUTO">AUTO (Clock: {statusData.activeSlotLabel || 'Detecting'})</option>
                        <option value="BREAKFAST">Force: Breakfast (8:00–9:30 AM)</option>
                        <option value="LUNCH">Force: Lunch (11:00 AM–2:00 PM)</option>
                        <option value="DINNER">Force: Dinner (7:00–9:30 PM)</option>
                    </select>
                </div>

                <button className="refresh-stats-btn" onClick={fetchStatusAndStats} title="Refresh Live Data">
                    <FaSync />
                </button>
            </div>

            {/* Live Count KPI Strip */}
            <div className="food-kpi-grid">
                <div className={`food-kpi-card ${statusData.activeSlot === 'BREAKFAST' ? 'active-slot' : ''}`}>
                    <div className="kpi-icon">🌅</div>
                    <div className="kpi-info">
                        <span className="kpi-title">BREAKFAST</span>
                        <span className="kpi-value">{stats.breakfast}</span>
                        <span className="kpi-sub">08:00 AM – 09:30 AM</span>
                    </div>
                </div>

                <div className={`food-kpi-card ${statusData.activeSlot === 'LUNCH' ? 'active-slot' : ''}`}>
                    <div className="kpi-icon">🍛</div>
                    <div className="kpi-info">
                        <span className="kpi-title">LUNCH</span>
                        <span className="kpi-value">{stats.lunch}</span>
                        <span className="kpi-sub">11:00 AM – 02:00 PM</span>
                    </div>
                </div>

                <div className={`food-kpi-card ${statusData.activeSlot === 'DINNER' ? 'active-slot' : ''}`}>
                    <div className="kpi-icon">🌙</div>
                    <div className="kpi-info">
                        <span className="kpi-title">DINNER</span>
                        <span className="kpi-value">{stats.dinner}</span>
                        <span className="kpi-sub">07:00 PM – 09:30 PM</span>
                    </div>
                </div>

                <div className="food-kpi-card total-card">
                    <div className="kpi-icon">🍱</div>
                    <div className="kpi-info">
                        <span className="kpi-title">TOTAL TODAY</span>
                        <span className="kpi-value">{stats.total}</span>
                        <span className="kpi-sub">Meals Distributed</span>
                    </div>
                </div>
            </div>

            {/* Scanner Area & Result Modal */}
            <div className="scanner-main-panel">
                <div className="camera-viewfinder-column">
                    <div className="viewfinder-container">
                        <div id="qr-reader-viewport" className="qr-viewport"></div>

                        {!scanning && (
                            <div className="scanner-start-overlay">
                                <div id="qr-image-scan-helper" style={{ display: 'none' }}></div>
                                <FaQrcode className="big-qr-icon" />
                                <h3>Mess & Canteen QR Scanner</h3>
                                <p>Scan participant's dynamic QR code to verify and claim meal.</p>
                                <button className="start-scan-btn" onClick={startScanner}>
                                    <FaCamera /> START CAMERA SCANNER
                                </button>
                                <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '8px', color: '#94a3b8', fontSize: '0.8rem', background: 'rgba(255, 255, 255, 0.05)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
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
                                <div className="camera-tools">
                                    <button className="cam-tool-btn" onClick={toggleCameraFacing} title="Flip Camera">
                                        Flip Camera ({cameraFacing === 'environment' ? 'Rear' : 'Front'})
                                    </button>
                                    <label className="cam-tool-btn" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                        🖼️ Scan File
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

                    {/* Manual ID Input fallback */}
                    <form className="manual-scan-form" onSubmit={handleManualSubmit}>
                        <input
                            type="text"
                            placeholder="Or enter Participant ID manually (e.g. NAV27-SRJ-102-L)..."
                            value={manualId}
                            onChange={(e) => setManualId(e.target.value)}
                            className="manual-input"
                        />
                        <button type="submit" className="manual-submit-btn" disabled={loading}>
                            {loading ? 'CHECKING...' : 'VERIFY & REDEEM'}
                        </button>
                    </form>
                </div>

                {/* Right Column: Scan Result Card & Recent History */}
                <div className="scanner-result-column">
                    {/* Big Result Display */}
                    {scanResult ? (
                        <div className={`scan-result-card ${scanResult.status.toLowerCase()}`}>
                            <div className="result-header">
                                {scanResult.status === 'APPROVED' ? (
                                    <FaCheckCircle className="result-icon success" />
                                ) : (
                                    <FaExclamationTriangle className="result-icon reject" />
                                )}
                                <h4>{scanResult.title}</h4>
                                <button className="close-result-btn" onClick={() => setScanResult(null)}>
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
                                        <span className="d-label">Role:</span>
                                        <span className="d-val">{scanResult.scanInfo.participantRole}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="d-label">Team:</span>
                                        <span className="d-val">{scanResult.scanInfo.teamName}</span>
                                    </div>
                                    {scanResult.scanInfo.college && (
                                        <div className="detail-row">
                                            <span className="d-label">College:</span>
                                            <span className="d-val">{scanResult.scanInfo.college}</span>
                                        </div>
                                    )}
                                    <div className="detail-row">
                                        <span className="d-label">Meal Slot:</span>
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
                                    <div className="detail-row">
                                        <span className="d-label">Coordinator:</span>
                                        <span className="d-val">{scanResult.scanInfo.scannedBy}</span>
                                    </div>
                                </div>
                            )}

                            {scanResult.status === 'ALREADY_SCANNED' && (
                                <div className="conflict-warning-badge">
                                    ⛔ DO NOT SERVE AGAIN • ALREADY CLAIMED
                                </div>
                            )}

                            {scanResult.status === 'APPROVED' && (
                                <div className="approved-badge">
                                    ✅ VERIFIED • SERVE 1 MEAL PLATE
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="idle-instruction-box">
                            <FaUtensils className="idle-icon" />
                            <h4>Ready to Scan</h4>
                            <p>Point camera at the participant's QR pass or type their ID below to verify eligibility.</p>
                            <div className="timing-bullet-list">
                                <div>🌅 <strong>Breakfast:</strong> 08:00 AM – 09:30 AM (1 scan)</div>
                                <div>🍛 <strong>Lunch:</strong> 11:00 AM – 02:00 PM (1 scan)</div>
                                <div>🌙 <strong>Dinner:</strong> 07:00 PM – 09:30 PM (1 scan)</div>
                            </div>
                        </div>
                    )}

                    {/* Recent Scans Table */}
                    <div className="recent-scans-box">
                        <div className="recent-header">
                            <h5>Recent Scans Today ({recentScans.length})</h5>
                            <button className="sync-sm-btn" onClick={fetchStatusAndStats}><FaSync /></button>
                        </div>

                        <div className="recent-scans-scroll">
                            {recentScans.length === 0 ? (
                                <p className="no-scans-text">No scans recorded yet today.</p>
                            ) : (
                                <table className="mini-scans-table">
                                    <thead>
                                        <tr>
                                            <th>Time</th>
                                            <th>Participant</th>
                                            <th>Team</th>
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
                </div>
            </div>
        </div>
    );
};

export default AdminQRScanner;
