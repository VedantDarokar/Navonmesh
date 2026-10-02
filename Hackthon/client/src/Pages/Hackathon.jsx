import React, { useState } from "react";
import "../Styles/hackathon.css";
import { FaPaperclip, FaDownload } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import registerBtnImg from "../assets/register-btn.png";
import ProblemStatements from "../Components/ProblemStatements";
import RegistrationChoiceModal from "../Components/RegistrationChoiceModal";
import RegistrationChatModal from "../Components/RegistrationChatModal";
import srijanPoster from "../assets/HACKATHON.jpeg";
import webionLogo from "../assets/webion-logo.png";
import tcsLogo from "../assets/tcs-logo.png";
import sponsor1 from "../assets/sponsor1.png";
import sponsor2 from "../assets/sponsor2.png";
import sponsor3 from "../assets/sponsor3.png";
import sponsor4 from "../assets/sponsor4.jpeg";
import sponsor5 from "../assets/sponsor5.png";
import sponsor6 from "../assets/sponsor6.jpeg";
// import sponsor7 from "../assets/sponsor7.png";
import mainSponsor from "../assets/mainsponsor.png";


const Hackathon = () => {
    const navigate = useNavigate();
    const [showAll, setShowAll] = useState(false);
    const [mobileSection, setMobileSection] = useState(null);
    const [showRegChoiceModal, setShowRegChoiceModal] = useState(false);
    const [showChatModal, setShowChatModal] = useState(false);
    const [activePS, setActivePS] = useState(null);

    // Lock body scroll when modal is open
    React.useEffect(() => {
        if (activePS || showRegChoiceModal || showChatModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [activePS, showRegChoiceModal, showChatModal]);

    const toggleMobileSection = (section) => {
        setMobileSection(prev => prev === section ? null : section);
    };

    const scheduleItems = [
        {
            title: "Registration & Check-in",
            time: "March 23, 7:00 AM - 1:00 PM",
            desc: "On-site registration and kit distribution (Ongoing simultaneously).",
            tag: "Mandatory",
            tagColor: "purple",
            location: "Registration Desk",
            dotColor: "pink"
        },
        {
            title: "Inauguration & Keynotes",
            time: "March 23, 11:30 AM - 12:15 PM",
            desc: "Formal opening with chief guests and initial mission briefing.",
            tag: "Key Event",
            tagColor: "purple",
            location: "Main Hall",
            dotColor: "purple"
        },
        {
            title: "Buffer & Final Setup",
            time: "March 23, 12:15 PM - 12:30 PM",
            desc: "Stations ready. Final technical checks and team synchronization.",
            tag: "Protocol",
            tagColor: "blue",
            location: "All Venues",
            dotColor: "purple"
        },
        {
            title: "Hackathon Commences",
            time: "March 23, 12:30 PM",
            desc: "The clock starts! 24 hours of continuous innovation begins.",
            tag: "Critical",
            tagColor: "blue",
            location: "Mission Control",
            dotColor: "purple"
        },
        {
            title: "Jury Round 1",
            time: "March 23, 2:30 PM - 3:30 PM",
            desc: "Initial feasibility check and architecture review for all squads.",
            tag: "Jury Round",
            tagColor: "blue",
            location: "Team Stations",
            dotColor: "purple"
        },
        {
            title: "Core Development Phase",
            time: "March 23, 3:30 PM Onwards",
            desc: "Intensive team work and feature implementation.",
            tag: "In Progress",
            tagColor: "blue",
            location: "All Venues",
            dotColor: "purple"
        },
        {
            title: "Cultural Kalaspandhan",
            time: "March 23, 6:00 PM - 8:00 PM",
            desc: "A brief mental recharge with evening cultural performances.",
            tag: "Refreshment",
            tagColor: "blue",
            location: "Main Stage",
            dotColor: "purple"
        },
        {
            title: "Dinner Break",
            time: "March 23, 8:00 PM - 9:00 PM",
            desc: "Evening rations served for all registered tactical units.",
            tag: "Break",
            tagColor: "blue",
            location: "Food Court",
            dotColor: "purple"
        },
        {
            title: "Overnight Work Block",
            time: "March 23, 9:00 PM - 9:00 AM",
            desc: "12 hours of uninterrupted development. Fuel up, stay alert.",
            tag: "Intensive",
            tagColor: "purple",
            location: "All Venues",
            dotColor: "pink"
        },
        {
            title: "Ongoing Breakfast",
            time: "March 24, 7:00 AM - 9:00 AM",
            desc: "Breakfast service active while the mission clock continues.",
            tag: "Support",
            tagColor: "blue",
            location: "Food Court",
            dotColor: "purple"
        },
        {
            title: "Jury Round 2",
            time: "March 24, 9:00 AM - 10:30 AM",
            desc: "Mid-way implementation review and technical hurdle assessment.",
            tag: "Jury Round",
            tagColor: "blue",
            location: "Main Hall",
            dotColor: "purple"
        },
        {
            title: "Lunch & Rest Break",
            time: "March 24, 11:00 AM - 12:30 PM",
            desc: "Midday reset before the final development sprint.",
            tag: "Break",
            tagColor: "blue",
            location: "Food Court",
            dotColor: "purple"
        },
        {
            title: "Final Tweak & Refine",
            time: "March 24, 12:30 PM - 3:30 PM",
            desc: "Last 3 hours for debugging and presentation polishing.",
            tag: "Final Phase",
            tagColor: "blue",
            location: "All Venues",
            dotColor: "purple"
        },
        {
            title: "Final Jury Round (Round 3)",
            time: "March 24, 3:30 PM - 4:30 PM",
            desc: "Final defense of the project. Winners decided across all rounds.",
            tag: "Mandatory",
            tagColor: "purple",
            location: "Main Hall",
            dotColor: "purple"
        },
        {
            title: "Hackathon Concludes",
            time: "March 24, 4:30 PM",
            desc: "The clock stops. All code must be pushed and finalized.",
            tag: "Success",
            tagColor: "purple",
            location: "Mission Control",
            dotColor: "pink"
        },
        {
            title: "Closing & Prize Ceremony",
            time: "March 24, 5:45 PM - 7:00 PM",
            desc: "Mission debriefing and recognition of top tactical units.",
            tag: "Mandatory",
            tagColor: "purple",
            location: "Auditorium",
            dotColor: "pink"
        }
    ];

    const displayedItems = showAll ? scheduleItems : scheduleItems.slice(0, 5);

    return (
        <div className="hackathon-page voyager-theme">
            {/* Background elements for depth */}
            <div className="voyager-grid-overlay"></div>
            <div className="voyager-vignette"></div>

            {/* Top HUD Bar */}
            <div className="voyager-hud-top">
                <div className="hud-left">COMM_LINK: ESTABLISHED [NAVONMESH_S26]</div>
                <div className="hud-center">MISSION: SRIJAN-X10</div>
                <div className="hud-right">COORD: 19.9975° N, 73.7898° E</div>
            </div>

            {/* Cinematic Hero Section */}
            <div className="hackathon-hero">
                <div className="hero-poster">
                    <div className="poster-frame">
                        <img
                            src={srijanPoster}
                            alt="Srijan Poster"
                            className="poster-img"
                        />
                        <div className="poster-tech-stats">
                            <div className="stat-line">SYSTEM_CHECK: 100%</div>
                            <div className="stat-line">UNIT_ACTIVE: ALPHA</div>
                        </div>
                    </div>
                </div>

                <div className="hero-intel">
                    <div className="intel-header">
                        <div className="mission-status-container">
                            <span className="mission-status pulse">● MISSION STATUS: ACTIVE</span>
                            <span className="mission-status-tech">SEED_LOG STATUS: EVOLVING</span>
                        </div>
                        <h1 className="hackathon-main-title">
                            <span className="hindi-title">सृजन</span>
                            <span className="english-title">(HACKATHON)</span>
                        </h1>
                        <div className="hackathon-intel-subtitle">NATIONAL LEVEL 24 HR HACKATHON</div>
                    </div>

                    <div className="intel-description-box">
                        <span className="box-label">MISSION_DESCRIPTION</span>
                        <p className="hackathon-header-desc">
                            SRIJAN 2027 is a National Level Hackathon aimed at fostering creative problem-solving, innovation, and rapid prototyping. Join the mission to develop technology-driven solutions for real-world challenges.
                        </p>
                        <div className="intel-accents">
                            <div className="accent-bar"></div>
                            <div className="accent-dots"></div>
                        </div>
                    </div>

                    <div className="header-actions">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                setShowRegChoiceModal(true);
                            }}
                            className="register-rocket-btn animate-float"
                            style={{ cursor: 'pointer', border: 'none', appearance: 'none' }}
                        >
                            <span className="reg-text">REGISTER FOR SRIJAN</span>
                            <div className="reg-icon-circle">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                            </div>
                            <div className="rocket-exhaust"></div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mission Perks (Free Food & Accom) */}
            <div className="mission-perks-highlight">
                <div className="perk-box food-highlight">
                    <span className="perk-label">MISSION_RATION</span>
                    <span className="perk-title">COMPLIMENTARY FOOD</span>
                    <div className="perk-glow"></div>
                </div>
                <div className="perk-box lodging-highlight">
                    <span className="perk-label">STATION_SLEEP</span>
                    <span className="perk-title">FREE ACCOMMODATION</span>
                    <div className="perk-glow"></div>
                </div>
            </div>

            {/* Mission Specifications (HUD STYLE) */}
            <div className="mission-hud-specs">
                <div className="hud-spec-item">
                    <div className="hud-label">ENTRY_FEE</div>
                    <div className="hud-value">₹500 (PER TEAM)</div>
                    <div className="hud-bar"><div className="fill" style={{ width: '100%' }}></div></div>
                </div>
                <div className="hud-spec-item">
                    <div className="hud-label">TEAM_SIZE</div>
                    <div className="hud-value">2 - 4 UNIT</div>
                    <div className="hud-bar"><div className="fill" style={{ width: '75%' }}></div></div>
                </div>
                <div className="hud-spec-item">
                    <div className="hud-label">ELIGIBILITY</div>
                    <div className="hud-value">UG, PG, ENG, TECH</div>
                    <div className="hud-bar"><div className="fill" style={{ width: '100%' }}></div></div>
                </div>
                <div className="hud-spec-item">
                    <div className="hud-label">REWARDS_POOL</div>
                    <div className="hud-value">₹75,000+</div>
                    <div className="hud-bar"><div className="fill" style={{ width: '90%' }}></div></div>
                </div>
            </div>

            {/* Premium Prize Pool Section */}
            <div className="prizes-container">
                <div className="rewards-header">
                    <h2>MISSION REWARDS</h2>
                    <p className="subtitle">CREDITS ALLOCATED FOR TOP TIER OPERATIVES</p>
                </div>

                <div className="prizes-grid">
                    {[
                        {
                            id: 'innovation',
                            title: "PROBLEM STATEMENT: STUDENT INNOVATION",
                            subtitle: "If you choose 'Student Innovation' (proposing your own problem statement), please ensure your project aligns with the domains listed below.",
                            screeningNote: "For Student Innovation, there will be a screening round.",
                            isAvailable: false
                        },
                        {
                            id: 'ps1',
                            title: "PROBLEM STATEMENT 1",
                            category: "COMING SOON",
                            subtitle: "Problem statement 1 will be announced soon. Stay tuned!",
                            tag: "COMING SOON",
                            isAvailable: false
                        },
                        {
                            id: 'ps2',
                            title: "PROBLEM STATEMENT 2",
                            category: "COMING SOON",
                            subtitle: "Problem statement 2 will be announced soon. Stay tuned!",
                            tag: "COMING SOON",
                            isAvailable: false
                        }
                    ].map((item, index) => (
                        <div
                            className={`reward-card ${item.isAvailable ? 'ps-available' : ''}`}
                            key={index}
                            onClick={() => item.fullIntel && setActivePS(item.fullIntel)}
                            style={{ cursor: item.fullIntel ? 'pointer' : 'default' }}
                        >
                            <div className="reward-card-header" style={{ position: 'relative' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <span className="label">TARGET_SPEC: 0{index + 1}</span>
                                    {item.tag && (
                                        <span className="new-intel-badge" style={{
                                            background: '#ef4444',
                                            color: '#fff',
                                            fontSize: '0.65rem',
                                            padding: '4px 10px',
                                            borderRadius: '4px',
                                            fontWeight: '900',
                                            fontFamily: 'Orbitron, sans-serif',
                                            boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)',
                                            animation: 'tag-pulse 2s infinite'
                                        }}>
                                            {item.tag}
                                        </span>
                                    )}
                                </div>
                                <h3 className="title">{item.title}</h3>
                                {item.category && (
                                    <div className="ps-category-hero" style={{
                                        color: '#fff',
                                        fontSize: '1.4rem',
                                        marginTop: '15px',
                                        fontWeight: '900',
                                        fontFamily: 'Orbitron, sans-serif',
                                        background: 'linear-gradient(to right, #2dd4bf, #fff)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        letterSpacing: '2px',
                                        textTransform: 'uppercase'
                                    }}>
                                        {item.category}
                                    </div>
                                )}

                                {item.knowledgePartner && (
                                    <div className="knowledge-partner-badge">
                                        <span className="partner-label">PROBLEM STATEMENT PARTNERS:</span>
                                        <img src={item.knowledgePartner} alt="Partner" className="partner-logo" />
                                    </div>
                                )}

                                {item.subtitle && <div className="card-instruction ps-summary-box" style={{
                                    fontSize: '1rem',
                                    marginTop: '20px',
                                    color: '#e2e8f0',
                                    lineHeight: '1.6',
                                    background: 'rgba(45, 212, 191, 0.1)',
                                    border: '1px solid rgba(45, 212, 191, 0.3)',
                                    textTransform: 'none'
                                }}>
                                    {item.subtitle}
                                </div>}

                                {item.screeningNote && (
                                    <div style={{
                                        marginTop: '15px',
                                        padding: '10px 14px',
                                        background: 'rgba(245, 158, 11, 0.15)',
                                        border: '1px solid rgba(245, 158, 11, 0.4)',
                                        borderRadius: '6px',
                                        color: '#fcd34d',
                                        fontSize: '0.9rem',
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        <span>📢</span>
                                        <span>NOTE: {item.screeningNote}</span>
                                    </div>
                                )}
                                {item.isAvailable && item.id !== 'innovation' && (
                                    <div className="view-details-btn-accent" style={{
                                        marginTop: '25px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '10px 20px',
                                        background: 'rgba(45, 212, 191, 0.15)',
                                        border: '1px solid #2dd4bf',
                                        borderRadius: '4px',
                                        color: '#fff',
                                        fontSize: '0.8rem',
                                        fontFamily: 'Orbitron, sans-serif',
                                        fontWeight: 'bold',
                                        letterSpacing: '2px',
                                        transition: '0.3s'
                                    }}>
                                        📡 VIEW FULL DESCRIPTION
                                    </div>
                                )}
                            </div>
                            <div className="reward-card-body">
                                <div className="reward-tier">
                                    <span className="rank-icon">🏆</span>
                                    <div className="rank-text">
                                        <span className="rank-label">Primary Objective</span>
                                        <span className="rank-value">₹15,000</span>
                                    </div>
                                </div>
                                <div className="reward-tier">
                                    <span className="rank-icon">🥈</span>
                                    <div className="rank-text">
                                        <span className="rank-label">Secondary Objective</span>
                                        <span className="rank-value">₹11,000</span>
                                    </div>
                                </div>
                            </div>
                            <div className="reward-card-footer">
                                <div className="status-indicator">ALLOCATION: SUCCESS</div>
                                <div className="card-tech-dots">...</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mission-update-bar">
                    <span className="update-icon">🚀</span>
                    <p className="update-text">
                        <strong>MISSION UPDATE:</strong> Choose your problem statement, but it must be related to the domains shown below.
                        The prizes for all problem statements are identical.
                    </p>
                </div>

                {/* Srijan Heads Contacts - Desktop Only */}
                <div className="srijan-heads-contacts desktop-only">
                    <div className="contact-box">
                        <span className="box-title">OVERALL HEAD</span>
                        <span className="box-name">Nihal Kankal</span>
                        <a href="tel:8766417815" className="box-phone">8766417815</a>
                    </div>
                    <div className="contact-box">
                        <span className="box-title">OVERALL HEAD</span>
                        <span className="box-name">Vedant Darokar</span>
                        <a href="tel:8208772402" className="box-phone">8208772402</a>
                    </div>
                    <div className="contact-box">
                        <span className="box-title">OVERALL HEAD</span>
                        <span className="box-name">Sanchit Dangra</span>
                        <a href="tel:9876543210" className="box-phone">9876543210</a>
                    </div>
                    <div className="contact-box">
                        <span className="box-title">SRIJAN HEAD</span>
                        <span className="box-name">Atharva Tayade</span>
                        <a href="tel:8767968475" className="box-phone">8767968475</a>
                    </div>
                </div>
            </div>

            {/* Problem Statements / Domains */}
            <ProblemStatements />

            {/* Mobile Toggle Buttons */}
            <div className="mobile-section-toggles">
                <button
                    className={`mobile-toggle-btn ${mobileSection === 'schedule' ? 'active' : ''}`}
                    onClick={() => toggleMobileSection('schedule')}
                >
                    📡 SCHEDULE
                </button>
                <button
                    className={`mobile-toggle-btn ${mobileSection === 'rules' ? 'active' : ''}`}
                    onClick={() => toggleMobileSection('rules')}
                >
                    📋 RULES & REGULATIONS
                </button>
            </div>

            <div className="hackathon-grid">
                {/* Left Column: Schedule */}
                <div className={`hackathon-card schedule-card mobile-collapsible ${mobileSection === 'schedule' ? 'mobile-open' : ''}`}>
                    <div className="card-header">
                        <h2>MISSION SCHEDULE</h2>
                        <span className="header-tag">FLIGHT_LOG.EXE</span>
                    </div>

                    <div className="timeline-container">
                        <div className="timeline">
                            {displayedItems.map((item, index) => (
                                <div className="timeline-item" key={index}>
                                    <div className="timeline-dot"></div>
                                    <div className="timeline-content">
                                        <div className="timeline-top">
                                            <h3>{item.title}</h3>
                                            <span className="time">{item.time}</span>
                                        </div>
                                        <div className="timeline-desc">
                                            {item.desc}
                                            <span className="tag">{item.tag}</span>
                                        </div>
                                        <div className="timeline-link">
                                            <FaPaperclip /> {item.location}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="show-more-container">
                        <button
                            className="show-more-btn"
                            onClick={() => setShowAll(!showAll)}
                        >
                            {showAll ? "SHOW LESS" : "SHOW MORE"}
                        </button>
                    </div>
                </div>

                {/* Right Column: Rules */}
                <div className={`right-column mobile-collapsible ${mobileSection === 'rules' ? 'mobile-open' : ''}`}>
                    <div className="hackathon-card rules-card">
                        <div className="card-header">
                            <h2>RULES AND REGULATIONS</h2>
                        </div>

                        <div className="rules-container">
                            <ul className="rules-list">
                                <li data-index="01">Participants must treat all other team members, competitors, judges, coaches, volunteers, etc., with respect and courtesy.</li>
                                <li data-index="02">The complete team must be present at the venue on the first day (23/03/2026).</li>
                                <li data-index="03">The complete team must be present at the venue on the second day (24/03/2026).</li>
                                <li data-index="04">Team size must be a maximum of 2-4 participants.</li>
                                <li data-index="05">Problem statements will be provided by NAVONMESH SSGMCE'26.</li>
                                <li data-index="06">Each team must carry a laptop and a power extension.</li>
                                <li data-index="07">Each team member must carry their Aadhar card and College ID.</li>
                                <li data-index="08">Accommodation will be provided for limited rest periods.</li>
                                <li data-index="09">Prizes will be given for the complete hackathon performance.</li>
                                <li data-index="10">Participating teams must exclusively consist of external students.</li>
                                <li data-index="11">Hackathon phases are strictly scheduled and monitored.</li>
                                <li data-index="12">Registration time is between 9:00 AM to 11:00 AM.</li>
                            </ul>

                            <div className="download-btn-container">
                                <button className="download-btn">DOWNLOAD ENCRYPTED PDF</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Partners & Sponsors Section */}
            <div id="sponsors" className="partners-section premium-partners-area">
                <div className="section-glow-orb"></div>

                {/* Main Event Sponsor */}
                <h2 className="premium-section-title">
                    <span className="tech-bracket">[</span>
                    EVENT SPONSOR
                    <span className="tech-bracket">]</span>
                </h2>
                <div className="premium-logo-grid partnership-logos" style={{ marginBottom: '80px' }}>
                    <div className="premium-logo-card">
                        <div className="card-scanner"></div>
                        <img src={mainSponsor} alt="Event Sponsor" className="team-logo partner-logo-img" />
                    </div>
                </div>

                <h2 className="premium-section-title">
                    <span className="tech-bracket">[</span>
                    PROBLEM STATEMENT PARTNERS
                    <span className="tech-bracket">]</span>
                </h2>
                <div className="premium-logo-grid partnership-logos">
                    <div className="premium-logo-card">
                        <div className="card-scanner"></div>
                        <img src={tcsLogo} alt="TCS Logo" className="team-logo partner-logo-img" />
                    </div>
                    <div className="premium-logo-card">
                        <div className="card-scanner"></div>
                        <img src={webionLogo} alt="Webion Logo" className="team-logo partner-logo-img" />
                    </div>
                </div>

                <div className="sponsors-section premium-partners-area" style={{ marginTop: '80px' }}>
                    <div className="section-glow-orb secondary"></div>
                    <h2 className="premium-section-title">
                        <span className="tech-bracket">[</span>
                        INDUSTRY COLLABORATORS & SPONSORS
                        <span className="tech-bracket">]</span>
                    </h2>
                    <div className="premium-logo-grid sponsor-logos">
                        <div className="premium-logo-card">
                            <div className="card-scanner"></div>
                            <img src={sponsor1} alt="Bharat Soft Solutions" className="team-logo sponsor-logo-img" />
                        </div>
                        <div className="premium-logo-card">
                            <div className="card-scanner"></div>
                            <img src={sponsor2} alt="Krish Products" className="team-logo sponsor-logo-img" />
                        </div>
                        <div className="premium-logo-card">
                            <div className="card-scanner"></div>
                            <img src={sponsor3} alt="Base Logo" className="team-logo sponsor-logo-img base-logo" />
                        </div>
                        <div className="premium-logo-card">
                            <div className="card-scanner"></div>
                            <img src={webionLogo} alt="Webion Logo" className="team-logo sponsor-logo-img" />
                        </div>
                        <div className="premium-logo-card">
                            <div className="card-scanner"></div>
                            <img src={sponsor4} alt="Sponsor 4" className="team-logo sponsor-logo-img" />
                        </div>
                        <div className="premium-logo-card">
                            <div className="card-scanner"></div>
                            <img src={sponsor5} alt="Sponsor 5" className="team-logo sponsor-logo-img" />
                        </div>
                        <div className="premium-logo-card">
                            <div className="card-scanner"></div>
                            <img src={sponsor6} alt="Sponsor 6" className="team-logo sponsor-logo-img" />
                        </div>
                        {/* 
                        <div className="premium-logo-card">
                            <div className="card-scanner"></div>
                            <img src={sponsor7} alt="Sponsor 7" className="team-logo sponsor-logo-img" />
                        </div>
                        */}
                    </div>
                </div>
            </div>

            {/* PROBLEM STATEMENT INTEL MODAL */}
            {activePS && (
                <div className="voyager-modal-overlay ps-modal-fix" onClick={() => setActivePS(null)} style={{ zIndex: 9999999, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh' }}>
                    <div className="voyager-modal-content ps-intel-modal animate-pop" onClick={e => e.stopPropagation()} style={{ maxWidth: '900px', width: '95%', padding: '50px 40px', zIndex: 10000000 }}>
                        <div className="modal-bracket bracket-top-left"></div>
                        <div className="modal-bracket bracket-top-right"></div>
                        <div className="modal-bracket bracket-bottom-left"></div>
                        <div className="modal-bracket bracket-bottom-right"></div>

                        <div className="modal-header" style={{ marginBottom: '40px' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                                <span className="status-badge" style={{
                                    background: '#2dd4bf',
                                    color: '#000',
                                    fontWeight: '900',
                                    fontSize: '0.8rem',
                                    padding: '6px 15px',
                                    borderRadius: '2px',
                                    letterSpacing: '2px'
                                }}>
                                    {activePS.mainTitle || 'MISSION_INTEL'}
                                </span>
                            </div>
                            <h2 style={{
                                fontSize: '2.2rem',
                                color: '#fff',
                                textShadow: '0 0 20px rgba(45, 212, 191, 0.3)',
                                lineHeight: '1.2',
                                fontFamily: 'Orbitron, sans-serif'
                            }}>
                                {activePS.title}
                            </h2>
                        </div>

                        <div className="modal-body ps-intel-body" style={{ maxHeight: '55vh', overflowY: 'auto', textAlign: 'left', paddingRight: '20px', marginBottom: '30px' }}>
                            <div className="intel-segment">
                                <h4 style={{ color: '#2dd4bf', borderLeft: '4px solid #2dd4bf', paddingLeft: '15px', marginBottom: '15px', fontSize: '1.1rem', fontWeight: '900' }}>1. PROBLEM BACKGROUND</h4>
                                <p style={{ fontSize: '1rem', lineHeight: '1.8', color: '#cbd5e1', whiteSpace: 'pre-line' }}>{activePS.background}</p>
                            </div>

                            <div className="intel-segment" style={{ marginTop: '40px' }}>
                                <h4 style={{ color: '#2dd4bf', borderLeft: '4px solid #2dd4bf', paddingLeft: '15px', marginBottom: '15px', fontSize: '1.1rem', fontWeight: '900' }}>2. PROBLEM STATEMENT</h4>
                                <p style={{ fontSize: '1rem', lineHeight: '1.8', color: '#cbd5e1', whiteSpace: 'pre-line' }}>{activePS.statement}</p>
                            </div>

                            <div className="intel-segment" style={{ marginTop: '40px' }}>
                                <h4 style={{ color: '#2dd4bf', borderLeft: '4px solid #2dd4bf', paddingLeft: '15px', marginBottom: '15px', fontSize: '1.1rem', fontWeight: '900' }}>3. OBJECTIVES</h4>
                                <ul style={{ fontSize: '1rem', color: '#cbd5e1', paddingLeft: '25px' }}>
                                    {activePS.objectives.map((obj, i) => <li key={i} style={{ marginBottom: '12px' }}>{obj}</li>)}
                                </ul>
                            </div>

                            <div className="intel-segment" style={{ marginTop: '40px' }}>
                                <h4 style={{ color: '#2dd4bf', borderLeft: '4px solid #2dd4bf', paddingLeft: '15px', marginBottom: '15px', fontSize: '1.1rem', fontWeight: '900' }}>4. EXPECTED SOLUTION</h4>
                                <ul style={{ fontSize: '1rem', color: '#cbd5e1', paddingLeft: '25px' }}>
                                    {activePS.solution.map((sol, i) => <li key={i} style={{ marginBottom: '12px' }}>{sol}</li>)}
                                </ul>
                            </div>

                            <div className="intel-segment" style={{ marginTop: '40px' }}>
                                <h4 style={{ color: '#2dd4bf', borderLeft: '4px solid #2dd4bf', paddingLeft: '15px', marginBottom: '15px', fontSize: '1.1rem', fontWeight: '900' }}>5. EXPECTED DELIVERABLES</h4>
                                <ul style={{ fontSize: '1rem', color: '#cbd5e1', paddingLeft: '25px' }}>
                                    {Array.isArray(activePS.deliverables) ? (
                                        activePS.deliverables.map((del, i) => <li key={i} style={{ marginBottom: '12px' }}>{del}</li>)
                                    ) : (
                                        <li style={{ marginBottom: '12px' }}>{activePS.deliverables}</li>
                                    )}
                                </ul>
                            </div>
                        </div>

                        <div className="modal-footer" style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '20px' }}>
                            {activePS.downloadPath && (
                                <a
                                    href={activePS.downloadPath}
                                    download
                                    className="modal-dismiss-btn"
                                    style={{
                                        background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                                        color: '#fff',
                                        textDecoration: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        flex: '1',
                                        justifyContent: 'center',
                                        border: 'none',
                                        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                                    }}
                                >
                                    <FaDownload /> DOWNLOAD DOCX
                                </a>
                            )}
                            <button className="modal-dismiss-btn" onClick={() => setActivePS(null)} style={{ flex: '1', border: '1px solid rgba(45, 212, 191, 0.4)' }}>
                                CLOSE INTEL
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* REGISTRATION CHOICE MODAL (Manual vs Chat) */}
            <RegistrationChoiceModal
                isOpen={showRegChoiceModal}
                onClose={() => setShowRegChoiceModal(false)}
                onChooseManual={() => {
                    setShowRegChoiceModal(false);
                    navigate('/register?event=srijan');
                }}
                onChooseChat={() => {
                    setShowRegChoiceModal(false);
                    setShowChatModal(true);
                }}
                eventName="Srijan 2027 (Hackathon)"
            />

            {/* CONVERSATIONAL CHAT REGISTRATION MODAL */}
            <RegistrationChatModal
                isOpen={showChatModal}
                onClose={() => setShowChatModal(false)}
                initialEvent="srijan"
                onSwitchToManual={(ev) => {
                    setShowChatModal(false);
                    navigate(`/register?event=${ev || 'srijan'}`);
                }}
            />
        </div>
    );
};

export default Hackathon;
