import React from 'react';
import '../Styles/registration_chat.css';
import { FaFileAlt, FaComments, FaTimes } from 'react-icons/fa';

const RegistrationChoiceModal = ({ isOpen, onClose, onChooseManual, onChooseChat, eventName = "Srijan 2027 (Hackathon)" }) => {
    if (!isOpen) return null;

    return (
        <div className="reg-choice-modal-overlay" onClick={onClose}>
            <div className="reg-choice-modal-content animate-pop" onClick={e => e.stopPropagation()}>
                <div className="choice-header">
                    <h2>CHOOSE REGISTRATION MODE</h2>
                    <p>Select how you would like to complete your registration for <strong>{eventName}</strong></p>
                </div>

                <div className="choice-cards-grid">
                    {/* Option 1: Manual Form */}
                    <div className="choice-card" onClick={onChooseManual}>
                        <div className="choice-icon">📝</div>
                        <h4>Fill Form Manually</h4>
                        <p>Complete the full registration form directly on the web page in standard format.</p>
                        <button className="choice-action-btn manual-btn">
                            Open Manual Form
                        </button>
                    </div>

                    {/* Option 2: Conversational Bot */}
                    <div className="choice-card highlight-card" onClick={onChooseChat}>
                        <div className="choice-badge">RECOMMENDED</div>
                        <div className="choice-icon">🤖</div>
                        <h4>Register by Chat Bot</h4>
                        <p>Our interactive bot will ask you questions step-by-step in a friendly chat box to fill the form.</p>
                        <button className="choice-action-btn chat-btn">
                            Start Chat Registration ➔
                        </button>
                    </div>
                </div>

                <button className="choice-close-btn" onClick={onClose}>
                    <FaTimes style={{ marginRight: '6px' }} /> Cancel & Dismiss
                </button>
            </div>
        </div>
    );
};

export default RegistrationChoiceModal;
