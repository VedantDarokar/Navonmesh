import React, { useEffect } from "react";
import "../Styles/projectExpo.css";
import { FaRocket, FaTrophy, FaCrosshairs, FaShieldAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import vayuvegaImg from "../assets/events/vayuvega.png";

const Vayuvega = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const tracks = [
        {
            title: "FPV Aerial Race",
            subtitle: "High-Speed Maneuvers",
            desc: "Navigate custom-built obstacle rings and slalom gates with first-person piloting speed.",
            tag: "Speed Challenge"
        },
        {
            title: "Autonomous Navigation",
            subtitle: "Sensor Fusion & Computer Vision",
            desc: "Pre-programmed or onboard AI-guided flight path through waypoints without manual piloting.",
            tag: "Tech Innovation"
        },
        {
            title: "Precision Payload Drop",
            subtitle: "Target Accuracy",
            desc: "Carry, stabilize, and precisely deliver simulated emergency payloads on marked drop zones.",
            tag: "Precision"
        }
    ];

    return (
        <div className="projectexpo-page ankur-voyager-theme">
            {/* Background elements */}
            <div className="voyager-grid-overlay"></div>
            <div className="voyager-vignette"></div>

            {/* Cinematic Hero */}
            <div className="ankur-hero">
                <div className="hero-poster">
                    <div className="poster-frame">
                        <img
                            src={vayuvegaImg}
                            alt="Vayuvega National Drone Competition"
                            className="poster-img"
                        />
                        <div className="poster-tech-stats">
                            <div className="stat-line">AERO_LOAD: [ACTIVE]</div>
                            <div className="stat-line">MISSION_NODE: VAYUVEGA</div>
                        </div>
                    </div>
                </div>

                <div className="ankur-intel">
                    <div className="intel-header">
                        <div className="mission-status-container">
                            <span className="mission-status pulse">● STATUS: REGISTRATION OPENING SOON</span>
                            <span className="mission-status-tech">AERIAL GRID: ONLINE</span>
                        </div>
                        <h1 className="ankur-main-title">वायुवेग</h1>
                        <div className="ankur-intel-subtitle">NATIONAL DRONE COMPETITION</div>
                    </div>

                    <div className="intel-description-box">
                        <span className="box-label">MISSION_OBJECTIVE</span>
                        <p className="ankur-header-desc">
                            Vayuvega is an adrenaline-fueled National Level Drone Competition testing aerodynamics, precision piloting, sensor intelligence, and obstacle agility. Compete with top drone innovators, engineers, and pilots in high-speed aerial arenas.
                        </p>
                        <div className="intel-accents">
                            <div className="accent-bar"></div>
                            <div className="accent-dots"></div>
                        </div>
                    </div>

                    <div className="header-actions">
                        <Link to="/" className="register-rocket-btn animate-float">
                            <span className="reg-text">Back to Home</span>
                            <div className="reg-icon-circle">
                                <FaRocket />
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Drone Specs HUD */}
            <div className="ankur-hud-specs">
                <div className="ankur-spec-item">
                    <div className="hud-label">TEAM_SIZE</div>
                    <div className="hud-value">2 - 4 PILOTS</div>
                    <div className="hud-bar"><div className="fill" style={{ width: '80%' }}></div></div>
                </div>
                <div className="ankur-spec-item">
                    <div className="hud-label">CHALLENGES</div>
                    <div className="hud-value">3 ARENA TRACKS</div>
                    <div className="hud-bar"><div className="fill" style={{ width: '100%' }}></div></div>
                </div>
                <div className="ankur-spec-item">
                    <div className="hud-label">ELIGIBILITY</div>
                    <div className="hud-value">ALL UG / PG / DIPLOMA</div>
                    <div className="hud-bar"><div className="fill" style={{ width: '100%' }}></div></div>
                </div>
                <div className="ankur-spec-item">
                    <div className="hud-label">PRIZE_POOL</div>
                    <div className="hud-value">EXCITING CASH REWARDS</div>
                    <div className="hud-bar"><div className="fill" style={{ width: '95%' }}></div></div>
                </div>
            </div>

            {/* Competition Tracks */}
            <div className="ankur-tracks-section">
                <div className="section-title-wrap">
                    <h2 className="section-title">COMPETITION ARENAS</h2>
                    <p className="section-subtitle">Battle across 3 high-intensity drone disciplines</p>
                </div>

                <div className="tracks-grid">
                    {tracks.map((t, idx) => (
                        <div className="track-card glass-panel" key={idx}>
                            <div className="track-tag">{t.tag}</div>
                            <h3 className="track-name">{t.title}</h3>
                            <div className="track-sub">{t.subtitle}</div>
                            <p className="track-desc">{t.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Vayuvega;
