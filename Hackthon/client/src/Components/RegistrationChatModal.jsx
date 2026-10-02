import React, { useState, useEffect, useRef } from 'react';
import '../Styles/registration_chat.css';
import { FaRobot, FaTimes, FaPaperPlane, FaCheckCircle, FaUndo, FaWhatsapp, FaInfoCircle, FaShieldAlt } from 'react-icons/fa';
import PaymentQR from '../assets/payment-qr.png';
import confetti from 'canvas-confetti';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const INITIAL_EVENT_OPTIONS = [
    { label: 'Srijan 2027 (Hackathon)', value: 'srijan' },
    { label: 'Ankur (Project Expo)', value: 'ankur' },
    { label: 'Udbhav (Conference)', value: 'udbhav' },
    { label: 'आरोहण (Workshops)', value: 'pursuit' }
];

const PROBLEM_STATEMENTS = [
    { label: 'Student Innovation (Screening round applies)', value: 'Student Innovation' },
    { label: 'Problem Statement 1 (Coming Soon)', value: 'Problem Statement 1' },
    { label: 'Problem Statement 2 (Coming Soon)', value: 'Problem Statement 2' }
];

const RegistrationChatModal = ({ isOpen, onClose, initialEvent = 'srijan', onSwitchToManual }) => {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [step, setStep] = useState('EVENT_SELECT');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionSuccess, setSubmissionSuccess] = useState(false);
    const [registeredData, setRegisteredData] = useState(null);

    // Form data state
    const [formData, setFormData] = useState({
        event: 'Srijan 2027 (Hackathon)',
        teamName: '',
        problemStatement: '',
        teamSize: 2,
        fullName: '',
        email: '',
        phone: '',
        college: '',
        member2Name: '',
        member2Email: '',
        member2Phone: '',
        member3Name: '',
        member3Email: '',
        member3Phone: '',
        member4Name: '',
        member4Email: '',
        member4Phone: '',
        utrNumber: '',
        agreed: true
    });

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Initialize conversation when modal opens
    useEffect(() => {
        if (isOpen) {
            initChat();
        }
    }, [isOpen]);

    const addBotMessage = (text, options = null, extra = {}) => {
        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
            setMessages(prev => [...prev, {
                id: Date.now(),
                sender: 'bot',
                text,
                options,
                ...extra
            }]);
        }, 350);
    };

    const addUserMessage = (text) => {
        setMessages(prev => [...prev, {
            id: Date.now(),
            sender: 'user',
            text
        }]);
    };

    const initChat = () => {
        setSubmissionSuccess(false);
        setRegisteredData(null);
        setIsSubmitting(false);
        setInputText('');
        setFormData({
            event: 'Srijan 2027 (Hackathon)',
            teamName: '',
            problemStatement: '',
            teamSize: 2,
            fullName: '',
            email: '',
            phone: '',
            college: '',
            member2Name: '',
            member2Email: '',
            member2Phone: '',
            member3Name: '',
            member3Email: '',
            member3Phone: '',
            member4Name: '',
            member4Email: '',
            member4Phone: '',
            utrNumber: '',
            agreed: true
        });

        setMessages([
            {
                id: 1,
                sender: 'bot',
                text: "Hello! 👋 I am your Navonmesh Interactive Registration Assistant.\n\nFor which event do you want to register?",
                options: INITIAL_EVENT_OPTIONS
            }
        ]);
        setStep('EVENT_SELECT');
    };

    const handleOptionSelect = (option) => {
        addUserMessage(option.label || option);
        processUserInput(option.value !== undefined ? option.value : option.label || option);
    };

    const handleSendInput = (e) => {
        e?.preventDefault();
        const trimmed = inputText.trim();
        if (!trimmed) return;

        addUserMessage(trimmed);
        setInputText('');
        processUserInput(trimmed);
    };

    const processUserInput = (val) => {
        switch (step) {
            case 'EVENT_SELECT': {
                const selected = typeof val === 'string' ? val.toLowerCase() : '';
                if (selected.includes('srijan')) {
                    setFormData(prev => ({ ...prev, event: 'Srijan 2027 (Hackathon)' }));
                    setStep('CONFIRM_SRIJAN');
                    addBotMessage(
                        "Do you want to register the team for Srijan?",
                        [
                            { label: 'Yes', value: 'yes' },
                            { label: 'No', value: 'no' }
                        ]
                    );
                } else if (selected.includes('ankur')) {
                    addBotMessage("Ankur (Project Expo) registrations can also be filled via the standard form. Would you like to proceed with Ankur or Srijan?", [
                        { label: 'Register for Srijan 2027', value: 'srijan' },
                        { label: 'Fill Ankur Manual Form', value: 'manual_ankur' }
                    ]);
                } else if (selected.includes('manual_ankur')) {
                    if (onSwitchToManual) onSwitchToManual('ankur');
                } else {
                    addBotMessage("Currently, interactive bot registration is fully optimized for Srijan 2027 (Hackathon). Would you like to register for Srijan?", [
                        { label: 'Yes, Register for Srijan', value: 'srijan' },
                        { label: 'Switch to Manual Form', value: 'manual_general' }
                    ]);
                }
                break;
            }

            case 'CONFIRM_SRIJAN': {
                const answer = typeof val === 'string' ? val.toLowerCase() : '';
                if (answer === 'yes' || answer === 'y') {
                    setStep('TEAM_NAME');
                    addBotMessage(
                        "Awesome! Let's get your team registered for Srijan 2027 🚀\n\n1. Enter your team name:"
                    );
                } else {
                    setStep('EVENT_SELECT');
                    addBotMessage(
                        "No problem! Which event would you like to explore instead?",
                        INITIAL_EVENT_OPTIONS
                    );
                }
                break;
            }

            case 'TEAM_NAME': {
                if (!val || val.length < 2) {
                    addBotMessage("⚠️ Team name must be at least 2 characters. Please enter a valid team name:");
                    return;
                }
                setFormData(prev => ({ ...prev, teamName: val }));
                setStep('PROBLEM_STATEMENT');
                addBotMessage(
                    "2. Select your Problem Statement:\n\n📢 Note: For Student Innovation, there will be a screening round.",
                    PROBLEM_STATEMENTS
                );
                break;
            }

            case 'PROBLEM_STATEMENT': {
                let chosenPS = val;
                if (val.includes('Student Innovation')) chosenPS = 'Student Innovation';
                else if (val.includes('Statement 1')) chosenPS = 'Problem Statement 1';
                else if (val.includes('Statement 2')) chosenPS = 'Problem Statement 2';

                setFormData(prev => ({ ...prev, problemStatement: chosenPS }));
                setStep('TEAM_SIZE');
                addBotMessage(
                    "3. Enter your Team Size (Srijan teams must be 2 to 4 members):",
                    [
                        { label: '2 Members', value: 2 },
                        { label: '3 Members', value: 3 },
                        { label: '4 Members', value: 4 }
                    ]
                );
                break;
            }

            case 'TEAM_SIZE': {
                const size = parseInt(val, 10);
                if (isNaN(size) || size < 2 || size > 4) {
                    addBotMessage("⚠️ Srijan requires 2 to 4 members per team. Please select 2, 3, or 4 members:", [
                        { label: '2 Members', value: 2 },
                        { label: '3 Members', value: 3 },
                        { label: '4 Members', value: 4 }
                    ]);
                    return;
                }
                setFormData(prev => ({ ...prev, teamSize: size }));
                setStep('LEADER_NAME');
                addBotMessage("Team Leader (Member 1) Details:\n\n4. Enter Team Leader's Full Name:");
                break;
            }

            case 'LEADER_NAME': {
                if (!val || val.length < 2) {
                    addBotMessage("⚠️ Please enter a valid full name for the Team Leader:");
                    return;
                }
                setFormData(prev => ({ ...prev, fullName: val }));
                setStep('LEADER_EMAIL');
                addBotMessage("5. Enter Team Leader's Email Address:");
                break;
            }

            case 'LEADER_EMAIL': {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(val)) {
                    addBotMessage("⚠️ Please enter a valid email address (e.g. name@domain.com):");
                    return;
                }
                setFormData(prev => ({ ...prev, email: val }));
                setStep('LEADER_PHONE');
                addBotMessage("6. Enter Team Leader's WhatsApp / Phone Number (10 digits):");
                break;
            }

            case 'LEADER_PHONE': {
                const digits = val.replace(/\D/g, '');
                if (digits.length < 10) {
                    addBotMessage("⚠️ Please enter a valid 10-digit mobile number:");
                    return;
                }
                setFormData(prev => ({ ...prev, phone: digits.slice(-10) }));
                setStep('COLLEGE');
                addBotMessage("7. Enter College / Institute Name:");
                break;
            }

            case 'COLLEGE': {
                if (!val || val.length < 2) {
                    addBotMessage("⚠️ Please enter your College / Institute name:");
                    return;
                }
                setFormData(prev => ({ ...prev, college: val }));

                // Move to dynamic members
                setStep('MEMBER_2_NAME');
                addBotMessage("Member 2 Details:\n\n8. Enter Member 2's Full Name:");
                break;
            }

            case 'MEMBER_2_NAME': {
                if (!val || val.length < 2) {
                    addBotMessage("⚠️ Please enter Member 2's full name:");
                    return;
                }
                setFormData(prev => ({ ...prev, member2Name: val }));
                setStep('MEMBER_2_EMAIL');
                addBotMessage("9. Enter Member 2's Email Address:");
                break;
            }

            case 'MEMBER_2_EMAIL': {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(val)) {
                    addBotMessage("⚠️ Please enter a valid email for Member 2:");
                    return;
                }
                setFormData(prev => ({ ...prev, member2Email: val }));
                setStep('MEMBER_2_PHONE');
                addBotMessage("10. Enter Member 2's Phone Number (10 digits):");
                break;
            }

            case 'MEMBER_2_PHONE': {
                const digits = val.replace(/\D/g, '');
                if (digits.length < 10) {
                    addBotMessage("⚠️ Please enter a valid 10-digit phone number for Member 2:");
                    return;
                }
                setFormData(prev => ({ ...prev, member2Phone: digits.slice(-10) }));

                if (formData.teamSize >= 3) {
                    setStep('MEMBER_3_NAME');
                    addBotMessage("Member 3 Details:\n\n11. Enter Member 3's Full Name:");
                } else {
                    goToPaymentStep();
                }
                break;
            }

            case 'MEMBER_3_NAME': {
                if (!val || val.length < 2) {
                    addBotMessage("⚠️ Please enter Member 3's full name:");
                    return;
                }
                setFormData(prev => ({ ...prev, member3Name: val }));
                setStep('MEMBER_3_EMAIL');
                addBotMessage("12. Enter Member 3's Email Address:");
                break;
            }

            case 'MEMBER_3_EMAIL': {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(val)) {
                    addBotMessage("⚠️ Please enter a valid email for Member 3:");
                    return;
                }
                setFormData(prev => ({ ...prev, member3Email: val }));
                setStep('MEMBER_3_PHONE');
                addBotMessage("13. Enter Member 3's Phone Number (10 digits):");
                break;
            }

            case 'MEMBER_3_PHONE': {
                const digits = val.replace(/\D/g, '');
                if (digits.length < 10) {
                    addBotMessage("⚠️ Please enter a valid 10-digit phone number for Member 3:");
                    return;
                }
                setFormData(prev => ({ ...prev, member3Phone: digits.slice(-10) }));

                if (formData.teamSize >= 4) {
                    setStep('MEMBER_4_NAME');
                    addBotMessage("Member 4 Details:\n\n14. Enter Member 4's Full Name:");
                } else {
                    goToPaymentStep();
                }
                break;
            }

            case 'MEMBER_4_NAME': {
                if (!val || val.length < 2) {
                    addBotMessage("⚠️ Please enter Member 4's full name:");
                    return;
                }
                setFormData(prev => ({ ...prev, member4Name: val }));
                setStep('MEMBER_4_EMAIL');
                addBotMessage("15. Enter Member 4's Email Address:");
                break;
            }

            case 'MEMBER_4_EMAIL': {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(val)) {
                    addBotMessage("⚠️ Please enter a valid email for Member 4:");
                    return;
                }
                setFormData(prev => ({ ...prev, member4Email: val }));
                setStep('MEMBER_4_PHONE');
                addBotMessage("16. Enter Member 4's Phone Number (10 digits):");
                break;
            }

            case 'MEMBER_4_PHONE': {
                const digits = val.replace(/\D/g, '');
                if (digits.length < 10) {
                    addBotMessage("⚠️ Please enter a valid 10-digit phone number for Member 4:");
                    return;
                }
                setFormData(prev => ({ ...prev, member4Phone: digits.slice(-10) }));
                goToPaymentStep();
                break;
            }

            case 'UTR_NUMBER': {
                const utrClean = val.replace(/\s+/g, '');
                const utrRegex = /^\d{12}$/;
                if (!utrRegex.test(utrClean)) {
                    addBotMessage("⚠️ The UTR Number must be exactly 12 digits (e.g. 509212345678). Please check your payment app and re-enter:");
                    return;
                }
                setFormData(prev => ({ ...prev, utrNumber: utrClean }));
                setStep('REVIEW_CONFIRM');

                // Compute question index
                showReviewStep(utrClean);
                break;
            }

            case 'REVIEW_CONFIRM': {
                if (val === 'confirm' || val.toLowerCase().includes('confirm') || val.toLowerCase() === 'yes') {
                    submitRegistration();
                } else if (val === 'restart') {
                    initChat();
                }
                break;
            }

            default:
                break;
        }
    };

    const goToPaymentStep = () => {
        setStep('UTR_NUMBER');
        addBotMessage(
            "💳 Payment Step:\n\n• Entry Fee: ₹500 (Per Team)\n• UPI Recipient: CHAKRADHAR KESHAV MAHALE\n\nPlease scan the QR code below to complete your payment, then enter your 12-digit UTR number.",
            null,
            { isPaymentQR: true }
        );
    };

    const showReviewStep = (currentUtr) => {
        addBotMessage(
            "📋 Please review your registration summary before final submission:",
            [
                { label: '✅ Confirm & Submit Registration', value: 'confirm' },
                { label: '🔄 Start Over', value: 'restart' }
            ],
            { isReviewCard: true, tempUtr: currentUtr }
        );
    };

    const submitRegistration = async () => {
        setIsSubmitting(true);
        addBotMessage("⏳ Submitting your registration to Navonmesh Mission Control...");

        const members = [];
        if (formData.member2Name) {
            members.push({
                name: formData.member2Name,
                email: formData.member2Email,
                phone: formData.member2Phone
            });
        }
        if (formData.member3Name && formData.teamSize >= 3) {
            members.push({
                name: formData.member3Name,
                email: formData.member3Email,
                phone: formData.member3Phone
            });
        }
        if (formData.member4Name && formData.teamSize >= 4) {
            members.push({
                name: formData.member4Name,
                email: formData.member4Email,
                phone: formData.member4Phone
            });
        }

        const payload = {
            event: formData.event,
            teamName: formData.teamName,
            problemStatement: formData.problemStatement,
            teamSize: parseInt(formData.teamSize, 10),
            leaderName: formData.fullName,
            leaderEmail: formData.email,
            leaderPhone: formData.phone,
            college: formData.college,
            members: members,
            utrNumber: formData.utrNumber,
            agreed: true
        };

        try {
            const response = await fetch(`${API_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                setIsSubmitting(false);
                setSubmissionSuccess(true);
                setRegisteredData(data.data || payload);

                // Confetti blast!
                confetti({
                    particleCount: 120,
                    spread: 80,
                    origin: { y: 0.6 }
                });

                addBotMessage(
                    `🎉 CONGRATULATIONS! Your team "${formData.teamName}" has been successfully registered for ${formData.event}!`,
                    null,
                    { isSuccessCard: true }
                );
            } else {
                setIsSubmitting(false);
                addBotMessage(
                    `❌ Registration Error: ${data.error || 'Submission failed.'}\n\nPlease enter a corrected 12-digit UTR number or click below to retry:`,
                    [
                        { label: 'Re-enter UTR Number', value: 'retry_utr' },
                        { label: 'Switch to Manual Form', value: 'manual_general' }
                    ]
                );
                setStep('UTR_NUMBER');
            }
        } catch (err) {
            console.error('Chat registration error:', err);
            setIsSubmitting(false);
            addBotMessage(
                "❌ Connection error. Please check your internet or retry submission.",
                [
                    { label: 'Retry Submission', value: 'confirm' },
                    { label: 'Switch to Manual Form', value: 'manual_general' }
                ]
            );
        }
    };

    if (!isOpen) return null;

    return (
        <div className="chat-modal-overlay" onClick={onClose}>
            <div className="chat-modal-window" onClick={e => e.stopPropagation()}>
                {/* Modern Cyberpunk Header */}
                <div className="chat-modal-header">
                    <div className="header-bot-info">
                        <div className="bot-avatar-pulse">
                            <FaRobot className="bot-icon" />
                            <span className="online-dot"></span>
                        </div>
                        <div className="header-titles">
                            <h3>Navonmesh Registration Assistant</h3>
                            <span className="header-status">
                                {isSubmitting ? 'PROCESSING SUBMISSION...' : 'ONLINE • READY TO REGISTER'}
                            </span>
                        </div>
                    </div>
                    <div className="header-actions">
                        <button
                            className="header-icon-btn reset-btn"
                            title="Restart Chat"
                            onClick={initChat}
                        >
                            <FaUndo />
                        </button>
                        <button
                            className="header-icon-btn close-btn"
                            title="Close Chat"
                            onClick={onClose}
                        >
                            <FaTimes />
                        </button>
                    </div>
                </div>

                {/* Event Tag Banner */}
                <div className="chat-event-badge-bar">
                    <span className="event-badge">SRIJAN 2027 • ₹500 PER TEAM</span>
                    <button
                        className="switch-manual-link"
                        onClick={() => {
                            onClose();
                            if (onSwitchToManual) onSwitchToManual('srijan');
                        }}
                    >
                        Switch to Manual Form ➔
                    </button>
                </div>

                {/* Messages Body */}
                <div className="chat-messages-container">
                    {messages.map(msg => (
                        <div key={msg.id} className={`chat-message-row ${msg.sender}`}>
                            {msg.sender === 'bot' && (
                                <div className="msg-bot-avatar">
                                    <FaRobot />
                                </div>
                            )}

                            <div className="msg-bubble-wrapper">
                                <div className={`msg-bubble ${msg.sender}`}>
                                    <p className="msg-text">{msg.text}</p>

                                    {/* Embedded Payment QR */}
                                    {msg.isPaymentQR && (
                                        <div className="chat-payment-card">
                                            <div className="qr-img-wrapper">
                                                <img src={PaymentQR} alt="Payment QR Code" className="chat-qr-image" />
                                            </div>
                                            <div className="payment-details-mini">
                                                <p className="pay-amount">Amount: <strong>₹500</strong></p>
                                                <p className="pay-name">A/C: CHAKRADHAR KESHAV MAHALE</p>
                                                <p className="pay-note">*Save the 12-digit UTR from receipt to enter below.</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Embedded Review Card */}
                                    {msg.isReviewCard && (
                                        <div className="chat-review-card">
                                            <div className="review-title">Summary of Details</div>
                                            <div className="review-item"><span>Event:</span> <strong>{formData.event}</strong></div>
                                            <div className="review-item"><span>Team Name:</span> <strong>{formData.teamName}</strong></div>
                                            <div className="review-item"><span>Problem Track:</span> <strong>{formData.problemStatement}</strong></div>
                                            <div className="review-item"><span>Team Size:</span> <strong>{formData.teamSize} Members</strong></div>
                                            <div className="review-item"><span>Leader:</span> <strong>{formData.fullName} ({formData.phone})</strong></div>
                                            <div className="review-item"><span>Leader Email:</span> <strong>{formData.email}</strong></div>
                                            <div className="review-item"><span>College:</span> <strong>{formData.college}</strong></div>
                                            {formData.member2Name && (
                                                <div className="review-item"><span>Member 2:</span> <strong>{formData.member2Name} ({formData.member2Phone})</strong></div>
                                            )}
                                            {formData.member3Name && formData.teamSize >= 3 && (
                                                <div className="review-item"><span>Member 3:</span> <strong>{formData.member3Name} ({formData.member3Phone})</strong></div>
                                            )}
                                            {formData.member4Name && formData.teamSize >= 4 && (
                                                <div className="review-item"><span>Member 4:</span> <strong>{formData.member4Name} ({formData.member4Phone})</strong></div>
                                            )}
                                            <div className="review-item highlight"><span>Entry Fee:</span> <strong>₹500</strong></div>
                                            <div className="review-item highlight"><span>UTR Number:</span> <strong>{formData.utrNumber || msg.tempUtr}</strong></div>
                                        </div>
                                    )}

                                    {/* Embedded Success Card */}
                                    {msg.isSuccessCard && (
                                        <div className="chat-success-card">
                                            <div className="success-badge"><FaCheckCircle /> REGISTERED</div>
                                            <p className="success-notice">Your entry is securely recorded in the Navonmesh system.</p>
                                            <div className="success-actions">
                                                <a
                                                    href="https://chat.whatsapp.com/K5spryDgbS56emLZP8F30g?mode=gi_t"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="chat-whatsapp-btn"
                                                >
                                                    <FaWhatsapp /> Join Srijan WhatsApp Group
                                                </a>
                                                <Link
                                                    to="/accommodation"
                                                    className="chat-accom-btn"
                                                    onClick={onClose}
                                                >
                                                    🏠 Register for Free Accommodation
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Options Buttons */}
                                {msg.options && (
                                    <div className="msg-options-grid">
                                        {msg.options.map((opt, i) => (
                                            <button
                                                key={i}
                                                className="msg-option-btn"
                                                disabled={isSubmitting}
                                                onClick={() => handleOptionSelect(opt)}
                                            >
                                                {opt.label || opt}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Typing indicator */}
                    {isTyping && (
                        <div className="chat-message-row bot typing-row">
                            <div className="msg-bot-avatar">
                                <FaRobot />
                            </div>
                            <div className="msg-bubble bot typing-bubble">
                                <div className="typing-dots">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Bar */}
                <form className="chat-input-area" onSubmit={handleSendInput}>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder={submissionSuccess ? "Registration complete! You may close this chat." : "Type your answer and press Enter..."}
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                        disabled={isSubmitting || submissionSuccess}
                        className="chat-text-input"
                    />
                    <button
                        type="submit"
                        className="chat-send-btn"
                        disabled={!inputText.trim() || isSubmitting || submissionSuccess}
                    >
                        <FaPaperPlane />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegistrationChatModal;
