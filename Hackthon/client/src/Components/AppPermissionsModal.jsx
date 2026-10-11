import React, { useState } from 'react';
import { FaBell, FaFolderOpen, FaCheckCircle, FaShieldAlt, FaTimes } from 'react-icons/fa';
import '../Styles/app_permissions_modal.css';
import navonmeshLogo from '../assets/navonmesh_official_logo.png';

const AppPermissionsModal = ({ onComplete, theme = 'theme-light' }) => {
    const [requesting, setRequesting] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    const handleGrantAll = async () => {
        setRequesting(true);
        setStatusMessage('Requesting system permissions...');

        // 1. Request Notification Permission
        let notifGranted = false;
        try {
            if ('Notification' in window) {
                const permission = await Notification.requestPermission();
                notifGranted = permission === 'granted';
            }
        } catch (e) {
            console.warn('Notification permission error:', e);
        }

        // 2. Storage / File Save capability check
        let storageGranted = true;
        try {
            if (navigator.storage && navigator.storage.persist) {
                await navigator.storage.persist();
            }
        } catch (e) {
            console.warn('Storage permission error:', e);
        }

        // Save preferences
        localStorage.setItem('navonmesh_permissions_requested', 'true');
        localStorage.setItem('navonmesh_notifications_enabled', notifGranted ? 'true' : 'false');
        localStorage.setItem('navonmesh_storage_enabled', storageGranted ? 'true' : 'false');

        setStatusMessage(notifGranted ? '✅ Permissions Configured!' : '✅ Preferences Saved!');

        setTimeout(() => {
            if (onComplete) onComplete();
        }, 600);
    };

    const handleSkip = () => {
        localStorage.setItem('navonmesh_permissions_requested', 'true');
        if (onComplete) onComplete();
    };

    return (
        <div className={`perm-modal-backdrop ${theme}`}>
            <div className="perm-modal-card">
                <button className="perm-skip-btn" onClick={handleSkip} title="Skip for now">
                    <FaTimes />
                </button>

                {/* Header with App Logo */}
                <div className="perm-header">
                    <div className="perm-logo-circle">
                        <img src={navonmeshLogo} alt="Navonmesh Logo" className="perm-logo-img" />
                    </div>
                    <div className="perm-tag">
                        <FaShieldAlt /> OFFICIAL FEST COMPANION
                    </div>
                    <h3 className="perm-title">Permissions Required</h3>
                    <p className="perm-sub">
                        To give you the smoothest experience during <strong>Navonmesh 2026</strong>, please grant device access for:
                    </p>
                </div>

                {/* Permission Cards */}
                <div className="perm-cards-list">
                    {/* Card 1: Notifications */}
                    <div className="perm-card">
                        <div className="perm-card-icon-box notif">
                            <FaBell />
                        </div>
                        <div className="perm-card-content">
                            <div className="perm-card-title-row">
                                <h4 className="perm-card-title">Push & Duty Alerts</h4>
                                <span className="perm-badge-rec">RECOMMENDED</span>
                            </div>
                            <p className="perm-card-desc">
                                Real-time alerts for meal queues, duty roster shifts, round countdowns, and instant broadcasts from Overall Heads.
                            </p>
                        </div>
                    </div>

                    {/* Card 2: Storage & Downloads */}
                    <div className="perm-card">
                        <div className="perm-card-icon-box storage">
                            <FaFolderOpen />
                        </div>
                        <div className="perm-card-content">
                            <div className="perm-card-title-row">
                                <h4 className="perm-card-title">Storage & Downloads</h4>
                                <span className="perm-badge-req">ESSENTIAL</span>
                            </div>
                            <p className="perm-card-desc">
                                Download and store your official QR event pass, meal coupons, ID badges, and offline fest schedules on your device.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Status indicator if requesting */}
                {statusMessage && (
                    <div className="perm-status-note">
                        <span>{statusMessage}</span>
                    </div>
                )}

                {/* Actions */}
                <div className="perm-actions">
                    <button 
                        className="perm-grant-btn" 
                        onClick={handleGrantAll}
                        disabled={requesting}
                    >
                        <FaCheckCircle />
                        <span>{requesting ? 'Granting Access...' : 'Allow All & Continue'}</span>
                    </button>
                    <button 
                        className="perm-later-btn" 
                        onClick={handleSkip}
                        disabled={requesting}
                    >
                        Ask Me Later
                    </button>
                </div>

                <p className="perm-privacy-footer">
                    🔒 Your privacy is protected. Permissions can be changed anytime in device settings.
                </p>
            </div>
        </div>
    );
};

export default AppPermissionsModal;
