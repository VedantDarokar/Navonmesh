import React from "react";
import "../Styles/projectExpo.css";
import { FaPaperclip, FaBookOpen, FaGlobeAmericas } from "react-icons/fa";
import { Link } from "react-router-dom";
import udbhavPoster from "../assets/udbhav_poster_updated.jpeg";

const Conference = () => {
    const [mobileSection, setMobileSection] = React.useState(null);

    const toggleMobileSection = (section) => {
        setMobileSection(prev => prev === section ? null : section);
    };

    const scheduleItems = [
        {
            title: "Check-in & Registration",
            time: "9:00 AM - 10:00 AM",
            desc: "Attendees check in and receive conference kits.",
            tag: "Mandatory",
            location: "Registration Desk"
        },
        {
            title: "Opening Keynote",
            time: "10:00 AM - 11:30 AM",
            desc: "Welcome address and keynote speech by industry leaders.",
            tag: "Key Event",
            location: "Main Auditorium"
        },
        {
            title: "Panel Discussion",
            time: "1:00 PM - 3:00 PM",
            desc: "Expert panel discussing the future of technology and innovation.",
            tag: "Insightful",
            location: "Conference Hall A"
        },
        {
            title: "Closing Ceremony",
            time: "4:00 PM - 5:00 PM",
            desc: "Vote of thanks and networking session.",
            tag: "Networking",
            location: "Main Hall"
        }
    ];

    const [showAll, setShowAll] = React.useState(false);
    const displayedItems = showAll ? scheduleItems : scheduleItems.slice(0, 5);

    return (
        <div className="projectexpo-page ankur-voyager-theme">
            {/* Background elements for depth */}
            <div className="voyager-grid-overlay"></div>
            <div className="voyager-vignette"></div>

            {/* Cinematic Hero Section */}
            <div className="ankur-hero">
                <div className="hero-poster">
                    <div className="poster-frame">
                        <img
                            src={udbhavPoster}
                            alt="Udbhav Poster"
                            className="poster-img"
                        />
                        <div className="poster-tech-stats">
                            <div className="stat-line">PULSE: STABLE</div>
                            <div className="stat-line">FREQ: 5.2 GHz</div>
                        </div>
                    </div>
                </div>

                <div className="ankur-intel">
                    <div className="intel-header">
                        <div className="mission-status-container">
                            <span className="mission-status pulse">● MISSION STATUS: ANALYZING</span>
                            <span className="mission-status-tech">INTEL_NODE STATUS: ACTIVE</span>
                        </div>
                        <h1 className="ankur-main-title">
                            <span className="hindi-title">उद्‌भव</span>
                            <span className="english-title">(STUDENT CONFERENCE)</span>
                        </h1>
                        <div className="ankur-intel-subtitle">NATIONAL STUDENT CONFERENCE</div>
                    </div>

                    <div className="intel-description-box">
                        <span className="box-label">MISSION_DESCRIPTION</span>
                        <p className="ankur-header-desc">
                            UDBHAV 2026 is a National Student Conference designed to cultivate research aptitude and academic excellence. A formal platform for presenting research papers and innovative concepts.
                        </p>
                        <div className="intel-accents">
                            <div className="accent-bar"></div>
                            <div className="accent-dots"></div>
                        </div>
                    </div>

                    <div className="header-actions">
                        <div className="register-rocket-btn registrations-closed-btn" style={{ cursor: 'not-allowed', opacity: 0.8, filter: 'grayscale(1)' }}>
                            <span className="reg-text">REGISTRATIONS CLOSED</span>
                            <div className="reg-icon-circle">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18.36 6.64L5.64 19.36M18.36 19.36L5.64 6.64" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mission Perks (Free Food & Accom) */}
            <div className="mission-perks-highlight conference-specs">
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
            <div className="ankur-hud-specs">
                <div className="ankur-spec-item">
                    <div className="hud-label">ENTRY_FEE</div>
                    <div className="hud-value">₹300 (PER TEAM)</div>
                    <div className="hud-bar"><div className="fill" style={{ width: '100%' }}></div></div>
                </div>
                <div className="ankur-spec-item">
                    <div className="hud-label">TEAM_SIZE</div>
                    <div className="hud-value">1 - 4 UNIT</div>
                    <div className="hud-bar"><div className="fill" style={{ width: '100%' }}></div></div>
                </div>
                <div className="ankur-spec-item">
                    <div className="hud-label">ELIGIBILITY</div>
                    <div className="hud-value">UG & PG STUDENTS</div>
                    <div className="hud-bar"><div className="fill" style={{ width: '100%' }}></div></div>
                </div>
                <div className="ankur-spec-item">
                    <div className="hud-label">RECOGNITION</div>
                    <div className="hud-value">BEST PAPER AWARD</div>
                    <div className="hud-bar"><div className="fill" style={{ width: '95%' }}></div></div>
                </div>
            </div>

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

            {/* Conference Tracks Section */}
            <div className="conference-tracks-section">
                <div className="rewards-header">
                    <span className="mission-status pulse">● AREA OF FOCUS</span>
                    <h2>CONFERENCE TRACKS</h2>
                    <div className="header-line"></div>
                </div>

                <div className="tracks-grid">
                    {[
                        "AI ML & DATA SCIENCE",
                        "RENEWABLE ENERGY AND EV",
                        "INDUSTRY 4.0 AND SMART SYSTEM",
                        "IOT AND COMMUNICATION TECH"
                    ].map((track, index) => (
                        <div key={index} className="track-card">
                            <div className="track-number">{String(index + 1).padStart(2, '0')}</div>
                            <div className="track-content">
                                <h3>{track}</h3>
                                <div className="track-status">
                                    <span className="status-dot"></span>
                                    ACTIVE NODE
                                </div>
                            </div>
                            <div className="track-accents">
                                <div className="corner-tl"></div>
                                <div className="corner-br"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Publication Highlight Section */}
            <div className="publication-highlight-container">
                <div className="publication-card glass-panel">
                    <div className="publication-header">
                        <span className="mission-status pulse">● RESEARCH HUBS</span>
                        <h2 className="publication-title">EVERY PARTICIPANT GETS PUBLICATION!</h2>
                        <p className="publication-subtitle">Permanent Global Recognition for YOUR Paper!</p>
                    </div>

                    <div className="publication-features">
                        <div className="feature-item">
                            <div className="feature-icon-wrapper">
                                <FaBookOpen className="feature-icon" />
                            </div>
                            <div className="feature-info">
                                <span className="feature-label">ISSN / ISBN</span>
                            </div>
                        </div>

                        <div className="feature-divider"></div>

                        <div className="feature-item">
                            <div className="feature-icon-wrapper">
                                <FaGlobeAmericas className="feature-icon" />
                            </div>
                            <div className="feature-info">
                                <span className="feature-label">DOI</span>
                                <span className="feature-sublabel">(Digital Object Identifier)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Udbhav Heads Contacts - Desktop Only */}
                <div className="ankur-heads-contacts desktop-only">
                    <div className="contact-box">
                        <span className="box-title">UDBHAV HEAD</span>
                        <span className="box-name">Tanmay Kurhekar</span>
                        <a href="tel:8605359181" className="box-phone">+91 8605359181</a>
                        <a href="mailto:tanmaykurhekar07@gmail.com" className="box-phone" style={{ fontSize: '0.7rem', textTransform: 'lowercase', marginTop: '4px' }}>tanmaykurhekar07@gmail.com</a>
                    </div>
                </div>
            </div>

            <div className="ankur-grid">
                {/* Left Column: Schedule */}
                <div className={`ankur-card schedule-card mobile-collapsible ${mobileSection === 'schedule' ? 'mobile-open' : ''}`}>
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

                    {scheduleItems.length > 5 && (
                        <div className="show-more-container">
                            <button
                                className="show-more-btn"
                                onClick={() => setShowAll(!showAll)}
                            >
                                {showAll ? "SHOW LESS" : "SHOW MORE"}
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Column: Rules */}
                <div className={`right-column mobile-collapsible ${mobileSection === 'rules' ? 'mobile-open' : ''}`}>
                    <div className="ankur-card rules-card">
                        <div className="card-header">
                            <h2>RULES AND REGULATIONS</h2>
                        </div>
                        <div className="rules-container">
                            <ul className="rules-list">
                                <li data-index="01">Attendees must carry a valid ID card and registration confirmation.</li>
                                <li data-index="02">Please be seated 15 minutes before the sessions begin.</li>
                                <li data-index="03">Mobile phones must be on silent mode during sessions.</li>
                                <li data-index="04">Respect the speakers and other attendees during Q&A sessions.</li>
                                <li data-index="05">Recording of sessions is permitted only with prior approval.</li>
                                <li data-index="06">Keep the venue clean and dispose of trash in designated bins.</li>
                                <li data-index="07">Networking is encouraged during break times.</li>
                                <li data-index="08">Certificates will be provided to all registered attendees.</li>
                                <li data-index="09">Final schedule is subject to change. Check for updates.</li>
                            </ul>

                            <button className="ankur-download-btn">DOWNLOAD SYMPOSIUM BRIEF</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Conference;
