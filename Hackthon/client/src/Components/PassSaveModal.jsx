import React from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaShareAlt, FaDownload, FaQrcode } from 'react-icons/fa';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import '../Styles/pass_save_modal.css';

const PassSaveModal = ({ isOpen, onClose, passDataUrl, passFile, participantName, fileName }) => {
    if (!isOpen || !passDataUrl) return null;

    const actualFileName = fileName || `Pass_${(participantName || 'Participant').replace(/\s+/g, '_')}.png`;

    const handleShareOrSave = async () => {
        // 1. Android Native APK Environment
        if (Capacitor.isNativePlatform()) {
            try {
                const base64Data = passDataUrl.replace(/^data:image\/[a-z]+;base64,/, '');
                const savedFile = await Filesystem.writeFile({
                    path: actualFileName,
                    data: base64Data,
                    directory: Directory.Cache
                });

                await Share.share({
                    title: `Navonmesh Pass - ${participantName}`,
                    text: `Official Event & Meal Pass for ${participantName}`,
                    url: savedFile.uri,
                    dialogTitle: 'Save Pass to Gallery / Share'
                });
                return;
            } catch (err) {
                console.warn('[PassSaveModal] Native Capacitor share failed:', err);
            }
        }

        // 2. Mobile Browser (Web Share API)
        if (passFile && typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [passFile] })) {
            try {
                await navigator.share({
                    files: [passFile],
                    title: `Pass - ${participantName}`,
                    text: `Official Navonmesh Pass for ${participantName}`
                });
                return;
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.warn('[PassSaveModal] Web Share error:', err);
                }
            }
        }

        // 3. Fallback to direct download
        handleDirectDownload();
    };

    const handleDirectDownload = () => {
        try {
            const a = document.createElement('a');
            a.href = passDataUrl;
            a.download = actualFileName;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
            }, 500);
        } catch (e) {
            console.warn('Direct download failed:', e);
        }
    };

    const modalContent = (
        <div className="pass-save-modal-backdrop" onClick={onClose}>
            <div className="pass-save-modal-card" onClick={(e) => e.stopPropagation()}>
                <button className="pass-save-close-btn" onClick={onClose} title="Close">
                    <FaTimes />
                </button>

                <div className="pass-save-header">
                    <div className="pass-save-badge-pill">
                        <FaQrcode /> OFFICIAL EVENT & MEAL PASS
                    </div>
                    <h3 className="pass-save-title">{participantName || 'Your Pass'}</h3>
                    <p className="pass-save-sub">Pass ready! Save directly to your mobile device gallery.</p>
                </div>

                {/* Full Pass Image Preview */}
                <div className="pass-save-preview-box">
                    <img 
                        src={passDataUrl} 
                        alt={`${participantName} Pass`} 
                        className="pass-save-img"
                    />
                </div>

                {/* Actions */}
                <div className="pass-save-actions">
                    <button className="pass-btn-share-gallery" onClick={handleShareOrSave}>
                        <FaShareAlt />
                        <span>Save to Gallery / Photos</span>
                    </button>

                    <button className="pass-btn-download-direct" onClick={handleDirectDownload}>
                        <FaDownload />
                        <span>Download PNG File</span>
                    </button>
                </div>

                {/* Long-press hint for mobile phones */}
                <div className="pass-save-mobile-tip">
                    📲 <strong>Mobile Tip:</strong> If the file does not appear in your Gallery automatically, simply <strong>press & hold (long press)</strong> on the pass image above and tap <strong>"Save image"</strong> or <strong>"Download image"</strong>!
                </div>
            </div>
        </div>
    );

    if (typeof document !== 'undefined') {
        return createPortal(modalContent, document.body);
    }
    return modalContent;
};

export default PassSaveModal;
