import React, { useState, useEffect } from 'react';
import '../Styles/register.css';
import '../Styles/register_help.css';
import { FaGoogle, FaWhatsapp, FaTimes, FaArrowLeft, FaExpand } from "react-icons/fa";
import { Link, useNavigate, useLocation } from 'react-router-dom';

import PaymentQR from '../assets/payment-qr.png';
import utrStep1 from '../assets/utr_step1.png'; // Placeholders for shared images
import utrStep2 from '../assets/utr_step2.png';

const Register = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const urlEvent = queryParams.get('event');

    const [formData, setFormData] = useState({
        fullName: '', email: '', phone: '', college: '',
        event: urlEvent?.toLowerCase() === 'srijan' ? 'Srijan (Hackathon)' :
            urlEvent?.toLowerCase() === 'ankur' ? 'Ankur (Project Expo)' :
            urlEvent?.toLowerCase() === 'udbhav' ? 'Udbhav (Conference)' :
            urlEvent?.toLowerCase() === 'pursuit' ? 'Pursuit' : 'Udbhav (Conference)',
        teamName: '',
        teamSize: '',
        studentCategory: '',
        problemStatement: '',
        member2Name: '', member2Email: '', member2Phone: '',
        member3Name: '', member3Email: '', member3Phone: '',
        member4Name: '', member4Email: '', member4Phone: '',
        utrNumber: '',
        agreed: false
    });

    const {
        fullName, email, phone, college, event,
        teamName, teamSize,
        member2Name, member2Email, member2Phone,
        member3Name, member3Email, member3Phone,
        member4Name, member4Email, member4Phone,
        utrNumber, studentCategory, problemStatement
    } = formData;

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [counts, setCounts] = useState({ ankur: 0, srijan: 0 });
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showUTRHelp, setShowUTRHelp] = useState(false);
    const [zoomedImage, setZoomedImage] = useState(null);

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const response = await fetch(`${API_URL}/api/register/count`);
                const data = await response.json();
                setCounts(data);
            } catch (err) {
                console.error('Error fetching counts:', err);
            }
        };
        fetchCounts();
    }, []);

    useEffect(() => {
        if (urlEvent === 'udbhav') {
            setFormData(prev => ({ ...prev, teamSize: '1' }));
        }
    }, [urlEvent]);

    // Removed forced individual check for Udbhav to allow team registrations (1-4 members)
    useEffect(() => {
        if (event === 'Udbhav (Conference)') {
            // Optional: You could set default team size here if needed
        }
    }, [event]);

    const onChange = e => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    // --- GOOGLE FORM CONFIGURATION ---
    const FORM_CONFIG = {
        'Srijan (Hackathon)': {
            url: "https://docs.google.com/forms/d/e/1FAIpQLSfMpbvgeNfFKXVrTLL4ug41aUpE7YDneNNQv4_IfmkyPTlQ-Q/formResponse",
            ids: {
                teamName: "entry.2005620554",
                leaderName: "entry.1045781291",
                leaderEmail: "entry.1065046570",
                leaderPhone: "entry.1166974658",
                member2Name: "entry.1446904082",
                member2Email: "entry.282203664",
                member2Phone: "entry.1059585569",
                member3Name: "entry.1158408763",
                member3Email: "entry.194510035",
                member3Phone: "entry.1200228325",
                member4Name: "entry.1710049001",
                member4Email: "entry.921494192",
                member4Phone: "entry.1681717638",
                college: "entry.323039862",
                utrNumber: "entry.624710763"
            },
            hasCollege: true,
            hasMemberPhone: true,
            hasAccommodation: false,
            bundleMembers: false
        },
        'Ankur (Project Expo)': {
            url: "https://docs.google.com/forms/d/e/1FAIpQLScW6ESj4WlOoLnV_cKjIrgnezjpDcX6ocNAu3swKZRG8ru-mg/formResponse",
            ids: {
                teamName: "entry.2005620554",
                studentCategory: "entry.634972688",
                leaderName: "entry.1045781291",
                leaderEmail: "entry.1065046570",
                leaderPhone: "entry.1166974658",
                member2Name: "entry.1446904082",
                member2Email: "entry.282203664",
                member2Phone: "entry.1059585569",
                member3Name: "entry.1158408763",
                member3Email: "entry.194510035",
                member3Phone: "entry.1200228325",
                member4Name: "entry.1253856068",
                member4Email: "entry.441804291",
                member4Phone: "entry.825625028",
                college: "entry.323039862",
                utrNumber: "entry.624710763"
            },
            hasCollege: true,
            hasMemberPhone: true,
            hasAccommodation: false,
            bundleMembers: false,
            hasStudentCategory: true
        },
        'Udbhav (Conference)': {
            url: "https://docs.google.com/forms/d/e/1FAIpQLScNe95Djx06LVuzumpMYxO2uM7jpHvfkSA3XcIAIDoKdMySSQ/formResponse",
            ids: {
                teamName: "entry.40216783",
                leaderName: "entry.2112252009",
                leaderEmail: "entry.376939330",
                leaderPhone: "entry.1651475776",
                member2Name: "entry.1446904082", // Using Ankur's IDs as placeholders/likely mapped same in backend
                member2Email: "entry.282203664",
                member2Phone: "entry.1059585569",
                member3Name: "entry.1158408763",
                member3Email: "entry.194510035",
                member3Phone: "entry.1200228325",
                member4Name: "entry.1710049001",
                member4Email: "entry.921494192",
                member4Phone: "entry.1681717638",
                college: "entry.323039862",
                utrNumber: "entry.624710763"
            },
            hasCollege: true,
            hasMemberPhone: true,
            hasAccommodation: false,
            bundleMembers: false,
            isSingleMember: false // Now allows 1-4
        },
        'Pursuit': {
            url: "https://docs.google.com/forms/d/e/1FAIpQLSej9oZlDfPMX7eQ0JJvcSIrmdqKZuHkDUS0E0L42kxhEfTpyw/formResponse", // Placeholder using Ankur's URL
            ids: {
                teamName: "entry.40216783",
                leaderName: "entry.2112252009",
                leaderEmail: "entry.376939330",
                leaderPhone: "entry.1651475776",
                member2Name: "entry.1886708863",
                member2Email: "entry.303258852",
                member2Phone: "entry.1376236348",
                member3Name: "entry.337717641",
                member3Email: "entry.1923504292",
                member3Phone: "entry.2044577159",
                member4Name: "entry.1150982003",
                member4Email: "entry.1575582295",
                member4Phone: "entry.641202700",
                utrNumber: ""
            },
            hasCollege: false,
            hasMemberPhone: true,
            hasAccommodation: false,
            bundleMembers: false
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        // Strict 12-digit UTR Validation
        const utrRegex = /^\d{12}$/;
        if (!utrRegex.test(formData.utrNumber)) {
            const msg = 'Please enter a valid 12-digit UTR Number.';
            setError(msg);
            alert(msg);
            return;
        }

        setLoading(true);
        setError('');

        const members = [];
        if (formData.member2Name) {
            members.push({
                name: formData.member2Name,
                email: formData.member2Email,
                phone: formData.member2Phone
            });
        }
        if (formData.member3Name && parseInt(formData.teamSize) >= 3) {
            members.push({
                name: formData.member3Name,
                email: formData.member3Email,
                phone: formData.member3Phone
            });
        }
        if (formData.member4Name && parseInt(formData.teamSize) >= 4) {
            members.push({
                name: formData.member4Name,
                email: formData.member4Email,
                phone: formData.member4Phone
            });
        }

        const payload = {
            event: formData.event,
            teamName: formData.teamName,
            studentCategory: formData.studentCategory,
            teamSize: parseInt(formData.teamSize),
            leaderName: formData.fullName,
            leaderEmail: formData.email,
            leaderPhone: formData.phone,
            college: formData.college,
            members: members,
            problemStatement: formData.problemStatement,
            utrNumber: formData.utrNumber,
            agreed: formData.agreed
        };

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const response = await fetch(`${API_URL}/api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setShowSuccessModal(true);
                setLoading(false);

                // Reset fields
                setFormData({
                    fullName: '', email: '', phone: '', college: '',
                    event: urlEvent?.toLowerCase() === 'srijan' ? 'Srijan (Hackathon)' :
                        urlEvent?.toLowerCase() === 'ankur' ? 'Ankur (Project Expo)' :
                            urlEvent?.toLowerCase() === 'udbhav' ? 'Udbhav (Conference)' :
                                urlEvent?.toLowerCase() === 'pursuit' ? 'Pursuit' : 'Udbhav (Conference)',
                    teamName: '', teamSize: '', studentCategory: '',
                    member2Name: '', member2Email: '', member2Phone: '',
                    member3Name: '', member3Email: '', member3Phone: '',
                    member4Name: '', member4Email: '', member4Phone: '',
                    utrNumber: '', agreed: false, problemStatement: ''
                });
            } else {
                const data = await response.json();
                const errorMsg = data.error || 'Submission failed. Please try again.';
                setError(errorMsg);
                alert(errorMsg);
                setLoading(false);
            }
        } catch (err) {
            console.error(err);
            setError('Submission failed. Please check your connection and try again.');
            setLoading(false);
        }
    };

    // --- RENDER HELPERS ---
    const config = FORM_CONFIG[event];
    const isTeamEvent = true; // All events now allow team registrations (1-4)
    const showCollege = config?.hasCollege;

    const closeSuccessModal = () => {
        setShowSuccessModal(false);
        navigate('/'); // Redirect after closing
    };

    return (
        <div className="register-container">
            {/* SUCCESS MODAL */}
            {showSuccessModal && (
                <div className="modal-overlay">
                    <div className="modal-content-wrapper">
                        {/* Close button top right */}
                        <button className="modal-close-btn" onClick={closeSuccessModal}>
                            <FaTimes />
                        </button>

                        <div className="register-content-modal">
                            <h2 className="success-title">Success!</h2>
                            <p className="success-body">
                                You have successfully registered for <span className="success-highlight">{event}</span>.
                            </p>

                            <div className="success-info-box">
                                <div className="info-item">
                                    <span className="info-icon">✔️</span>
                                    <p>Your registration is successful. Data is recorded.</p>
                                </div>
                                <div className="info-item">
                                    <span className="info-icon">📲</span>
                                    <p>Join our WhatsApp group for all future updates and instructions.</p>
                                </div>
                            </div>

                            <div className="accommodation-prompt-section" style={{
                                marginTop: '25px',
                                padding: '20px',
                                background: 'rgba(0, 243, 255, 0.05)',
                                borderRadius: '15px',
                                border: '1px solid rgba(0, 243, 255, 0.2)'
                            }}>
                                <p style={{ color: '#fff', fontSize: '1rem', marginBottom: '15px', fontWeight: '500' }}>
                                    Want to register for <strong>accommodation for free?</strong>
                                </p>
                                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                                    <button
                                        onClick={() => navigate('/accommodation')}
                                        style={{
                                            background: '#00e5ff',
                                            color: '#000',
                                            border: 'none',
                                            padding: '8px 25px',
                                            borderRadius: '8px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            transition: '0.3s'
                                        }}
                                        onMouseOver={(e) => e.target.style.filter = 'brightness(1.1)'}
                                        onMouseOut={(e) => e.target.style.filter = 'brightness(1)'}
                                    >
                                        YES
                                    </button>
                                    <button
                                        onClick={closeSuccessModal}
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            color: '#fff',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            padding: '8px 25px',
                                            borderRadius: '8px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            transition: '0.3s'
                                        }}
                                        onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
                                        onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
                                    >
                                        NO
                                    </button>
                                </div>
                            </div>

                            <a
                                href={
                                    event === 'Srijan (Hackathon)' ? "https://chat.whatsapp.com/K5spryDgbS56emLZP8F30g?mode=gi_t" :
                                        event === 'Ankur (Project Expo)' ? "https://chat.whatsapp.com/B7jQRyBpFjoJTF6uCfyki1?mode=gi_t" :
                                            event === 'Udbhav (Conference)' ? "https://chat.whatsapp.com/ElW7q0gfgc2BAeQW5tasrI?mode=gi_t" :
                                                "https://whatsapp.com/channel/0029VbCVzgbBlHpY1prIRI1m"
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="whatsapp-btn"
                                style={{ marginTop: '20px' }}
                            >
                                <FaWhatsapp className="whatsapp-icon" /> Join WhatsApp Group
                            </a>

                            <div className="success-contact-section">
                                <p className="contact-heading">For any queries, contact:</p>
                                <div className="contact-grid">
                                    {event === 'Srijan (Hackathon)' ? (
                                        <>
                                            <div className="contact-item">
                                                <p className="c-name">Dolly Bhutada</p>
                                                <p className="c-role">(Volunteer Co-head)</p>
                                                <p className="c-num">+91 8459701982</p>
                                            </div>
                                            <div className="contact-item">
                                                <p className="c-name">Atharva Sonone</p>
                                                <p className="c-role">(Volunteer Head)</p>
                                                <p className="c-num">+91 9834428773</p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="contact-item">
                                                <p className="c-name">Nihal Kankal</p>
                                                <p className="c-role">(Overall Head)</p>
                                                <p className="c-num">+91 8766417815</p>
                                            </div>
                                            <div className="contact-item">
                                                <p className="c-name">Prarthna Kale</p>
                                                <p className="c-role">(Overall Head)</p>
                                                <p className="c-num">+91 98765 43210</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* UTR HELP MODAL */}
            {showUTRHelp && (
                <div className="modal-overlay" onClick={() => setShowUTRHelp(false)}>
                    <div className="modal-content-wrapper help-modal" onClick={e => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setShowUTRHelp(false)}>
                            <FaTimes />
                        </button>
                        <h3 className="help-title" style={{ fontSize: '1.4rem' }}>Where to find UTR?</h3>

                        <div className="help-steps">
                            <div className="step-item">
                                <span className="step-num">1</span>
                                <p>Open your payment app (Google Pay, PhonePe, Paytm, etc.)</p>
                            </div>
                            <div className="step-item">
                                <span className="step-num">2</span>
                                <p>Go to <strong>History</strong> and find the payment made to <strong>CHAKRADHAR KESHAV MAHALE</strong>.</p>
                            </div>
                            <div className="step-item">
                                <span className="step-num">3</span>
                                <p>Tap on the transaction to view details.</p>
                            </div>
                            <div className="step-item">
                                <span className="step-num">4</span>
                                <p>Look for <strong>UTR Number</strong> or <strong>UPI Reference ID</strong> (exactly 12 digits).</p>
                            </div>
                        </div>

                        <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '15px' }}>Click images to enlarge:</p>
                        <div className="help-images-grid" style={{ display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'center' }}>
                            <div className="help-img-wrapper" onClick={() => setZoomedImage(utrStep1)} style={{ cursor: 'pointer', position: 'relative' }}>
                                <img src={utrStep1} alt="UTR Step 1" style={{ width: '110px', height: 'auto', maxHeight: '150px', objectFit: 'contain', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#000' }} />
                                <div style={{ position: 'absolute', bottom: '5px', right: '5px', background: 'rgba(0,0,0,0.6)', borderRadius: '50%', padding: '4px', display: 'flex' }}><FaExpand size={10} color="#00e5ff" /></div>
                            </div>
                            <div className="help-img-wrapper" onClick={() => setZoomedImage(utrStep2)} style={{ cursor: 'pointer', position: 'relative' }}>
                                <img src={utrStep2} alt="UTR Step 2" style={{ width: '110px', height: 'auto', maxHeight: '150px', objectFit: 'contain', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#000' }} />
                                <div style={{ position: 'absolute', bottom: '5px', right: '5px', background: 'rgba(0,0,0,0.6)', borderRadius: '50%', padding: '4px', display: 'flex' }}><FaExpand size={10} color="#00e5ff" /></div>
                            </div>
                        </div>

                        <div className="help-note">
                            <strong>Note:</strong> Double check the 12-digit number.
                        </div>
                        <button className="help-close-btn" onClick={() => setShowUTRHelp(false)}>Got it</button>
                    </div>
                </div>
            )}

            {/* ZOOMED IMAGE MODAL */}
            {zoomedImage && (
                <div className="modal-overlay" style={{ zIndex: 3000 }} onClick={() => setZoomedImage(null)}>
                    <div className="zoomed-container" onClick={e => e.stopPropagation()} style={{ position: 'relative', maxWidth: '90vw' }}>
                        <button
                            onClick={() => setZoomedImage(null)}
                            style={{ position: 'absolute', top: '-40px', right: '0', background: 'none', border: 'none', color: '#fff', fontSize: '2rem', cursor: 'pointer' }}
                        >
                            <FaTimes />
                        </button>
                        <img src={zoomedImage} alt="UTR Large" style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} />
                    </div>
                </div>
            )}

            <div className="register-layout">
                <div className="register-content">
                    <button
                        className="back-btn"
                        onClick={() => navigate(-1)}
                    >
                        <FaArrowLeft /> Back
                    </button>


                    <div className="register-header">
                        <p>{event} Registration</p>
                    </div>

                    <div className="register-highlights-grid">
                        <div className="highlight-box">
                            <h4>FACILITIES</h4>
                            <p>Ethernet • WiFi • Extension Boards • Accomodation</p>
                        </div>
                        <div className="highlight-box">
                            <h4>REWARDS</h4>
                            <p>Certificates • Exposure • Networking • Recognition</p>
                        </div>
                    </div>

                    {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

                    {event === 'Srijan (Hackathon)' ? (
                        <div className="closed-container" style={{
                            textAlign: 'center',
                            padding: '60px 20px',
                            background: 'rgba(255, 0, 0, 0.05)',
                            border: '1px solid rgba(255, 0, 0, 0.2)',
                            borderRadius: '20px',
                            marginTop: '20px'
                        }}>
                            <h2 style={{ color: '#ff4b2b', fontSize: '2.5rem', marginBottom: '20px' }}>Registrations Closed!</h2>
                            <p style={{ color: '#fff', fontSize: '1.2rem', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto 30px' }}>
                                Thank you for your overwhelming response! The slots for <strong>Srijan (Hackathon)</strong> are now full and registrations have been officially closed.
                            </p>
                            <div className="closed-info" style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', display: 'inline-block' }}>
                                <p style={{ color: '#ccc', marginBottom: '10px' }}>Registered teams, please stay tuned to the WhatsApp group for further updates.</p>
                                <a
                                    href="https://chat.whatsapp.com/K5spryDgbS56emLZP8F30g?mode=gi_t"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="whatsapp-btn"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                                >
                                    <FaWhatsapp /> Srijan WhatsApp Group
                                </a>
                            </div>
                            <div style={{ marginTop: '40px' }}>
                                <button
                                    onClick={() => navigate('/')}
                                    style={{
                                        background: 'linear-gradient(45deg, #00e5ff, #007bff)',
                                        color: '#fff',
                                        border: 'none',
                                        padding: '12px 40px',
                                        borderRadius: '30px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        fontSize: '1rem',
                                        transition: '0.3s'
                                    }}
                                    onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                                >
                                    Back to Home
                                </button>
                            </div>
                        </div>
                    ) : (event === 'Ankur (Project Expo)' && counts.ankur >= 60) ? (
                        <div className="closed-container" style={{
                            textAlign: 'center',
                            padding: '60px 20px',
                            background: 'rgba(255, 0, 0, 0.05)',
                            border: '1px solid rgba(255, 0, 0, 0.2)',
                            borderRadius: '20px',
                            marginTop: '20px'
                        }}>
                            <h2 style={{ color: '#ff4b2b', fontSize: '2.5rem', marginBottom: '20px' }}>Registrations Closed!</h2>
                            <p style={{ color: '#fff', fontSize: '1.2rem', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto 30px' }}>
                                Thank you for your interest! The slots for <strong>Ankur (Project Expo)</strong> are now full and registrations have been officially closed.
                            </p>
                            <div className="closed-info" style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', display: 'inline-block' }}>
                                <p style={{ color: '#ccc', marginBottom: '10px' }}>Registered teams, please stay tuned to the official channels for further updates.</p>
                                <a
                                    href="https://chat.whatsapp.com/B7jQRyBpFjoJTF6uCfyki1?mode=gi_t"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="whatsapp-btn"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                                >
                                    <FaWhatsapp /> Ankur WhatsApp Group
                                </a>
                            </div>
                            <div style={{ marginTop: '40px' }}>
                                <button
                                    onClick={() => navigate('/')}
                                    style={{
                                        background: 'linear-gradient(45deg, #00e5ff, #007bff)',
                                        color: '#fff',
                                        border: 'none',
                                        padding: '12px 40px',
                                        borderRadius: '30px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        fontSize: '1rem',
                                        transition: '0.3s'
                                    }}
                                    onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                                >
                                    Back to Home
                                </button>
                            </div>
                        </div>
                    ) : event === 'Udbhav (Conference)' ? (
                        <div className="closed-container" style={{
                            textAlign: 'center',
                            padding: '60px 20px',
                            background: 'rgba(255, 0, 0, 0.05)',
                            border: '1px solid rgba(255, 0, 0, 0.2)',
                            borderRadius: '20px',
                            marginTop: '20px'
                        }}>
                            <h2 style={{ color: '#ff4b2b', fontSize: '2.5rem', marginBottom: '20px' }}>Registrations Closed!</h2>
                            <p style={{ color: '#fff', fontSize: '1.2rem', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto 30px' }}>
                                Thank you for the interest! The registrations for <strong>Udbhav (Conference)</strong> have been officially closed.
                            </p>
                            <div className="closed-info" style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', display: 'inline-block' }}>
                                <p style={{ color: '#ccc', marginBottom: '10px' }}>Registered participants, please stay tuned for further updates.</p>
                                <a
                                    href="https://chat.whatsapp.com/ElW7q0gfgc2BAeQW5tasrI?mode=gi_t"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="whatsapp-btn"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                                >
                                    <FaWhatsapp /> Udbhav WhatsApp Group
                                </a>
                            </div>
                            <div style={{ marginTop: '40px' }}>
                                <button
                                    onClick={() => navigate('/')}
                                    style={{
                                        background: 'linear-gradient(45deg, #00e5ff, #007bff)',
                                        color: '#fff',
                                        border: 'none',
                                        padding: '12px 40px',
                                        borderRadius: '30px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        fontSize: '1rem',
                                        transition: '0.3s'
                                    }}
                                    onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                                >
                                    Back to Home
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form className="register-form" onSubmit={onSubmit}>

                            <label>EVENT</label>
                            <select name="event" value={event} onChange={onChange} className="register-select" required disabled>
                                <option value="Ankur (Project Expo)">Ankur (Project Expo)</option>
                                <option value="Udbhav (Conference)">Udbhav (Conference)</option>
                                <option value="Pursuit">Pursuit</option>
                            </select>

                            {event === 'Srijan (Hackathon)' && (
                                <>
                                    <label>PROBLEM STATEMENT</label>
                                    <select name="problemStatement" value={problemStatement} onChange={onChange} className="register-select" required>
                                        <option value="" disabled>Select Problem Statement</option>
                                        <option value="Student Innovation">Student Innovation</option>
                                        <option value="Problem Statement 1">Problem Statement 1</option>
                                        <option value="Problem Statement 2">Problem Statement 2</option>
                                    </select>
                                </>
                            )}

                            <div className="form-section-title">Team Info</div>
                            <label>TEAM NAME</label>
                            <input type="text" placeholder="Enter Team Name (or 'Individual' if solo)" name="teamName" value={teamName} onChange={onChange} required />

                            {event === 'Ankur (Project Expo)' && (
                                <>
                                    <label>STUDENT CATEGORY</label>
                                    <select name="studentCategory" value={studentCategory} onChange={onChange} className="register-select" required>
                                        <option value="" disabled>Select Category</option>
                                        <option value="Diploma Students">Diploma Students</option>
                                    </select>
                                </>
                            )}

                            <label>TEAM SIZE (1-4)</label>
                            <input
                                type="number"
                                min="1"
                                max="4"
                                placeholder="Total Members (1, 2, 3 or 4)"
                                name="teamSize"
                                value={teamSize}
                                onChange={onChange}
                                required
                            />

                            {/* MEMBER DETAILS */}
                            <div className="form-section-title">
                                Team Leader (Member 1) Details
                            </div>
                            <label>FULL NAME</label>
                            <input type="text" placeholder="Leader Name" name="fullName" value={fullName} onChange={onChange} required />

                            <label>EMAIL</label>
                            <input type="email" placeholder="Leader Email" name="email" value={email} onChange={onChange} required />

                            <label>PHONE</label>
                            <input type="tel" placeholder="Leader Phone" name="phone" value={phone} onChange={onChange} required />

                            {showCollege && (
                                <>
                                    <label>COLLEGE</label>
                                    <input type="text" placeholder="College Name" name="college" value={college} onChange={onChange} required />
                                </>
                            )}


                            {/* DYNAMIC MEMBERS (Hidden for Udbhav) */}
                            <>
                                {parseInt(teamSize) >= 2 && (
                                    <>
                                        <div className="form-section-title">Member 2 Details</div>
                                        <label>NAME</label>
                                        <input type="text" placeholder="Member 2 Name" name="member2Name" value={member2Name} onChange={onChange} required />
                                        <label>EMAIL</label>
                                        <input type="email" placeholder="Member 2 Email" name="member2Email" value={member2Email} onChange={onChange} required />
                                        {config?.hasMemberPhone && (
                                            <>
                                                <label>PHONE</label>
                                                <input type="tel" placeholder="Member 2 Phone" name="member2Phone" value={member2Phone} onChange={onChange} required />
                                            </>
                                        )}
                                    </>
                                )}

                                {parseInt(teamSize) >= 3 && (
                                    <>
                                        <div className="form-section-title">Member 3 Details</div>
                                        <label>NAME</label>
                                        <input type="text" placeholder="Member 3 Name" name="member3Name" value={member3Name} onChange={onChange} required />
                                        <label>EMAIL</label>
                                        <input type="email" placeholder="Member 3 Email" name="member3Email" value={member3Email} onChange={onChange} required />
                                        {config?.hasMemberPhone && (
                                            <>
                                                <label>PHONE</label>
                                                <input type="tel" placeholder="Member 3 Phone" name="member3Phone" value={member3Phone} onChange={onChange} required />
                                            </>
                                        )}
                                    </>
                                )}

                                {parseInt(teamSize) >= 4 && (
                                    <>
                                        <div className="form-section-title">Member 4 Details</div>
                                        <label>NAME</label>
                                        <input type="text" placeholder="Member 4 Name" name="member4Name" value={member4Name} onChange={onChange} required />
                                        <label>EMAIL</label>
                                        <input type="email" placeholder="Member 4 Email" name="member4Email" value={member4Email} onChange={onChange} required />
                                        {config?.hasMemberPhone && (
                                            <>
                                                <label>PHONE</label>
                                                <input type="tel" placeholder="Member 4 Phone" name="member4Phone" value={member4Phone} onChange={onChange} required />
                                            </>
                                        )}
                                    </>
                                )}
                            </>

                            {/* PAYMENT SECTION */}
                            <div className="form-section-title">Payment Details</div>
                            <div className="payment-section" style={{ textAlign: "center", marginBottom: "20px" }}>
                                <p style={{ marginBottom: "10px", fontSize: "1.1em" }}>Scan to pay <strong>₹300</strong></p>
                                <img
                                    src={PaymentQR}
                                    alt="Payment QR Code"
                                    style={{ width: "200px", height: "auto", borderRadius: "10px", border: "2px solid #ccc", marginBottom: "15px" }}
                                />
                                <p style={{ fontSize: "0.9em", color: "#666", marginBottom: "15px" }}>
                                    *Please enter the correct 12-digit <strong>UTR Number</strong> to verify your payment.
                                </p>

                                <div className="utr-label-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                    <label style={{ marginBottom: 0 }}>UTR NUMBER (12-DIGIT)</label>
                                    <button
                                        type="button"
                                        className="help-link-btn"
                                        onClick={() => setShowUTRHelp(true)}
                                        style={{ background: 'none', border: 'none', color: '#007bff', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.85em' }}
                                    >
                                        Where to find UTR?
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Enter 12-digit UTR (e.g. 123456789012)"
                                    name="utrNumber"
                                    value={utrNumber}
                                    onChange={onChange}
                                    required
                                    minLength="12"
                                    maxLength="12"
                                    pattern="\d{12}"
                                    title="UTR must be exactly 12 digits"
                                />
                            </div>

                            <div className="terms-container">
                                <input
                                    type="checkbox"
                                    name="agreed"
                                    checked={formData.agreed}
                                    onChange={onChange}
                                    required
                                    className="terms-checkbox"
                                />
                                <div className="terms-text-wrapper">
                                    I agree to the <span className="terms-link">Terms and Conditions</span>
                                </div>
                            </div>



                            <div className="accommodation-notice-box">
                                <p className="notice-text">
                                    <span className="notice-icon">🚀</span>
                                    <strong>NOTICE:</strong> For accommodation, please fill the <Link to="/accommodation" className="notice-link">Accommodation Form</Link> separately on the website.
                                </p>
                            </div>

                            <button type="submit" className="register-btn" disabled={loading || !formData.agreed}>
                                {loading ? 'Submitting...' : 'Register Team'}
                            </button>

                        </form>
                    )}
                </div>
            </div>
        </div >
    );
};

export default Register;
