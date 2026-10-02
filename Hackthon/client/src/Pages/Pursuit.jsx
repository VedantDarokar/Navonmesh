import React, { useEffect, useState } from "react";
import "../Styles/pursuit.css";
import {
    FaMicrochip, FaUsers, FaArrowRight, FaClock, FaCheckCircle,
    FaProjectDiagram, FaFileAlt, FaCertificate, FaGithub, FaLayerGroup,
    FaFire, FaBuilding, FaRocket, FaGraduationCap, FaTools, FaFilter
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import RegistrationChoiceModal from "../Components/RegistrationChoiceModal";
import RegistrationChatModal from "../Components/RegistrationChatModal";

// Assets
import pursuitLogo from "../assets/events/pursuit.png";
import pursuitPoster from "../assets/PURSUIT POSTER.jpeg";

// Speaker Images
import yogeshImg from "../assets/yogesh.jpg";
import nakulImg from "../assets/nakul.png";
import amitImg from "../assets/amit.jpg";
import riyaImg from "../assets/riya.jpg";
import pranavImg from "../assets/pranav.jpg";
import chetanImg from "../assets/chetan.png";
import mahamuneImg from "../assets/mahamune.jpg";

const Pursuit = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('long-term');
    const [committeeFilter, setCommitteeFilter] = useState('all');
    const [showChoiceModal, setShowChoiceModal] = useState(false);
    const [showChatModal, setShowChatModal] = useState(false);
    const [selectedWorkshop, setSelectedWorkshop] = useState(null);

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (showChoiceModal || showChatModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [showChoiceModal, showChatModal]);

    const handleOpenRegister = (workshop = null) => {
        setSelectedWorkshop(workshop);
        setShowChoiceModal(true);
    };

    const handleChooseManual = () => {
        setShowChoiceModal(false);
        navigate('/register?event=pursuit');
    };

    const handleChooseChat = () => {
        setShowChoiceModal(false);
        setShowChatModal(true);
    };

    // 🌟 TYPE 1: LONG TERM WORKSHOPS (15+ Days)
    const longTermWorkshops = [
        {
            id: "fullstack",
            title: "Full Stack Web & Cloud Development",
            marathiTitle: "फुल स्टॅक वेब व क्लाउड डेव्हलपमेंट",
            category: "Software & Web Engineering",
            duration: "15+ Days Immersive",
            fee: "₹250 - ₹300",
            seats: "Limited Seats (Strict 40 Cap)",
            desc: "Comprehensive masterclass taking you from modern JavaScript & React fundamentals to building scalable backend APIs, database management with MongoDB/PostgreSQL, and zero-downtime cloud deployment.",
            tools: ["React.js", "Node.js", "Express", "MongoDB", "REST APIs", "Git & GitHub", "Cloud Deploy"],
            projects: [
                "Production E-Commerce Platform with Cart & Payment Flow",
                "Realtime Collaborative Chat & Task Management Engine",
                "Role-Based Authentication (RBAC) & OAuth Security Portal",
                "High-Performance SaaS Analytics & Metrics Dashboard",
                "Full-Featured RESTful Microservice & Documentation API"
            ],
            image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800"
        },
        {
            id: "pcb",
            title: "PCB Designing & Hardware Prototyping",
            subtitle: "Altium Designer & KiCad Masterclass",
            marathiTitle: "पीसीबी डिझायनिंग (Altium & KiCad)",
            category: "Electronics & Embedded Systems",
            duration: "15+ Days Immersive",
            fee: "₹250 - ₹300",
            seats: "Limited Seats (Hands-on Lab Cap)",
            desc: "Master industry-standard EDA tools (Altium Designer & KiCad). Learn schematic capture, component footprint creation, high-speed multi-layer board routing, Design Rule Checks (DRC), and fabrication Gerber file generation.",
            tools: ["Altium Designer", "KiCad", "Schematic Capture", "Multi-Layer Routing", "DRC", "Gerber Generation"],
            projects: [
                "Regulated Dual-Rail Adjustable Bench Power Supply Board",
                "Custom 32-Bit Microcontroller Development Board",
                "Multi-Sensor Smart IoT Environmental Shield",
                "High-Speed Controlled Impedance RF Transmitter Layout",
                "Industrial Relay & Optoisolated Driver Board"
            ],
            image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800"
        },
        {
            id: "autocad",
            title: "AutoCAD & 3D Parametric Design",
            subtitle: "Mechanical Drafting, GD&T & Assembly Modeling",
            marathiTitle: "ऑटोकॅड मेकॅनिकल डिझाइन",
            category: "Mechanical & Manufacturing",
            duration: "15+ Days Immersive",
            fee: "₹250 - ₹300",
            seats: "Limited Seats (CAD Workstation Cap)",
            desc: "Complete industrial mechanical drafting & modeling training. Covers 2D engineering blueprints, Geometric Dimensioning & Tolerancing (GD&T), 3D solid & parametric part design, and multi-component assembly simulation.",
            tools: ["AutoCAD 2D/3D", "Parametric Modeling", "GD&T Standards", "Assembly Drafting", "BOM Generation"],
            projects: [
                "Internal Combustion Engine Piston & Connecting Rod Assembly",
                "Two-Stage Industrial Speed Reducer Gearbox with Casing",
                "Precision Hydraulic Valve Body & Manifold Block",
                "Automotive Tubular Spaceframe Chassis Blueprint",
                "Industrial Plant Piping & Instrumentation Isometric Diagram"
            ],
            image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800"
        },
        {
            id: "electrical",
            title: "Electrical Systems, Power Electronics & Automation",
            subtitle: "Simulation, Smart Grids, Drives & Circuit Design",
            marathiTitle: "इलेक्ट्रिकल इंजिनिअरिंग व स्मार्ट सिस्टीम्स",
            category: "Electrical & Energy Systems",
            duration: "15+ Days Immersive",
            fee: "₹250 - ₹300",
            seats: "Limited Seats (Simulation Node Cap)",
            desc: "Hands-on electrical engineering workshop covering industrial power system simulation, MATLAB/Simulink power electronics, industrial motor drive control, switchgear protection, and smart grid automation.",
            tools: ["MATLAB / Simulink", "PowerWorld", "AutoCAD Electrical", "Motor Drives", "Smart Grids", "Protection Relays"],
            projects: [
                "Solar PV System with MPPT Inverter Simulation in Simulink",
                "Closed-Loop Speed Controller for Industrial Induction Motor",
                "Comprehensive 33kV/11kV Substation Single Line Diagram (SLD)",
                "EV Lithium-Ion Battery Pack with BMS Balancing Simulation",
                "Automated Industrial Panel Wiring & PLC Logic Circuit Design"
            ],
            image: "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&q=80&w=800"
        }
    ];

    // ⚡ TYPE 2: SHORT TERM WORKSHOPS (College Committees)
    const shortTermWorkshops = [
        {
            title: "Startup Ideation, Business Modeling & Pitching",
            marathiTitle: "स्टार्टअप आयडिएशन व बिझनेस मॉडेलिंग",
            committee: "E-Cell (Entrepreneurship Cell)",
            committeeTag: "ecell",
            fee: "₹50",
            duration: "1-2 Days Fast-Track",
            desc: "Learn how to turn raw ideas into viable startups. Covers Lean Business Canvas, MVP testing, customer discovery, unit economics, and winning pitch decks.",
            highlights: "Business Canvas • MVP Validation • Investor Pitching • Unit Economics",
            image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800"
        },
        {
            title: "Embedded IoT & Edge Sensor Interfacing",
            marathiTitle: "इंटरनेट ऑफ थिंग्स (IoT) व सेन्सर्स",
            committee: "IEEE Student Branch",
            committeeTag: "ieee",
            fee: "₹100",
            duration: "1-2 Days Fast-Track",
            desc: "Hands-on sensor telemetry with ESP32 microcontrollers, MQTT publish/subscribe protocols, cloud IoT dashboarding, and edge automation.",
            highlights: "ESP32 • MQTT Protocols • Cloud Dashboards • Sensor Interfacing",
            image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800"
        },
        {
            title: "Cloud Computing & Linux Terminal Mastery",
            marathiTitle: "क्लाउड कॉम्प्युटिंग व लिनक्स मास्टरी",
            committee: "ISTE Chapter",
            committeeTag: "iste",
            fee: "₹50",
            duration: "1-2 Days Fast-Track",
            desc: "Essential terminal workflows, Linux shell scripting, server administration, Docker containerization basics, and cloud deployment principles.",
            highlights: "Linux Shell • Bash Scripting • Docker Basics • Cloud Instances",
            image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800"
        },
        {
            title: "Autonomous Mobile Robotics & Navigation",
            marathiTitle: "ऑटोनॉमस रोबोटिक्स व नेव्हिगेशन",
            committee: "Robotics & Automation Club",
            committeeTag: "robotics",
            fee: "₹100",
            duration: "1-2 Days Fast-Track",
            desc: "Hands-on robotics hardware sprint: differential drive kinematics, ultrasonic/LiDAR obstacle avoidance, motor drivers, and sensor fusion.",
            highlights: "Mobile Robotics • Sensor Fusion • Motor Drivers • Obstacle Avoidance",
            image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800"
        },
        {
            title: "Cybersecurity & Ethical Hacking Crash Course",
            marathiTitle: "सायबर सिक्युरिटी व एथिकल हॅकिंग",
            committee: "Cyber Security Cell",
            committeeTag: "cyber",
            fee: "₹50",
            duration: "1-2 Days Fast-Track",
            desc: "Understand vulnerability assessment, penetration testing fundamentals, packet sniffing with Wireshark, and defensive hardening.",
            highlights: "OWASP Top 10 • Wireshark • Network Recon • Defensive Security",
            image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800"
        },
        {
            title: "Introduction to VLSI & Chip Architecture",
            marathiTitle: "व्ही एल एस आय (VLSI) डिझाइन",
            committee: "IETE Student Forum",
            committeeTag: "iete",
            fee: "₹100",
            duration: "1-2 Days Fast-Track",
            desc: "The journey from logic gates to semiconductor chips. Covers Verilog HDL modeling, FPGA digital design flow, and CMOS layout concepts.",
            highlights: "Verilog HDL • FPGA Basics • CMOS Inverter • RTL Synthesis",
            image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800"
        },
        {
            title: "EV Battery Tech & Powertrain Fundamentals",
            marathiTitle: "इलेक्ट्रिक व्हेईकल (EV) तंत्रज्ञान",
            committee: "SAE Collegiate Club",
            committeeTag: "sae",
            fee: "₹100",
            duration: "1-2 Days Fast-Track",
            desc: "Comprehensive sprint on modern Electric Vehicles: Lithium battery cell sizing, Battery Management Systems (BMS), motor selection, and regenerative braking.",
            highlights: "EV Powertrains • Battery Sizing • BMS Safety • Motor Selection",
            image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800"
        },
        {
            title: "Agentic AI & Prompt Engineering Workflows",
            marathiTitle: "एजंटिक ए आय (Agentic AI) वर्कफ्लो",
            committee: "Navonmesh AI Wing",
            committeeTag: "ai",
            fee: "₹100",
            duration: "1-2 Days Fast-Track",
            desc: "Learn to build multi-agent AI systems, automated tool-calling workflows, vector databases, and autonomous decision-making loops.",
            highlights: "Agent Frameworks • Tool Calling • Vector Databases • Prompt Chains",
            image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800"
        }
    ];

    const filteredShortTerm = committeeFilter === 'all'
        ? shortTermWorkshops
        : shortTermWorkshops.filter(ws => ws.committeeTag === committeeFilter);

    // Speakers list
    const speakers = [
        {
            name: "Mr. Yogesh P Murumkar",
            role: "CEO & Corporate Trainer",
            org: "Bharat Software Solutions",
            image: yogeshImg
        },
        {
            name: "Mr. Nakul Deshmukh",
            role: "Founder & CEO",
            org: "Electrosoft LLP",
            image: nakulImg
        },
        {
            name: "Mr. Amit Molke",
            role: "SDR Associate",
            org: "Briskcone",
            image: amitImg
        },
        {
            name: "Miss Riya Dangra",
            role: "Software Engineer",
            org: "Apexon",
            image: riyaImg
        },
        {
            name: "Mr. Pranav Khedkar",
            role: "Alumni & Tech Lead",
            org: "SSGMCE",
            image: pranavImg
        },
        {
            name: "Mr. Chetan Tajane",
            role: "Founder",
            org: "CRITS Innovation",
            image: chetanImg
        },
        {
            name: "Dr. R.S. Mahamune",
            role: "Faculty & Domain Specialist",
            org: "SSGMCE",
            image: mahamuneImg
        }
    ];

    return (
        <div className="pursuit-page pursuit-voyager-theme">
            {/* Background elements for depth */}
            <div className="voyager-grid-overlay"></div>
            <div className="voyager-vignette"></div>

            {/* Top HUD Bar */}
            <div className="voyager-hud-top" style={{ width: '90%', maxWidth: '1300px', margin: '0 auto 20px' }}>
                <div className="hud-left">SECTOR: AAROHAN_WORKSHOPS</div>
                <div className="hud-center">SYMPOSIUM: NAVONMESH 2026</div>
                <div className="hud-right">TIERS: LONG-TERM & SHORT-TERM</div>
            </div>

            {/* Cinematic Hero Section */}
            <div className="pursuit-hero-section">
                <div className="hero-poster">
                    <div className="poster-frame">
                        <img
                            src={pursuitPoster}
                            alt="Aarohan Workshops Poster"
                            className="poster-img"
                        />
                        <div className="poster-tech-stats">
                            <div className="stat-line">WORKSHOPS: 2 TIERS ACTIVE</div>
                            <div className="stat-line">LONG-TERM: 15+ DAYS</div>
                            <div className="stat-line">SHORT-TERM: COMMITTEES</div>
                        </div>
                    </div>
                </div>

                <div className="pursuit-intel">
                    <div className="intel-header">
                        <div className="mission-status-container">
                            <span className="mission-status pulse">● WORKSHOP MISSION: ACTIVE & OPEN</span>
                            <span className="mission-status-tech">SKILL_ENGINE: MAXIMUM CAPACITY</span>
                        </div>

                        {/* Title with authentic Marathi font */}
                        <h1 className="pursuit-main-title">
                            <span className="hindi-title marathi-aarohan-title">आरोहण</span>
                            <span className="english-title">(AAROHAN WORKSHOPS)</span>
                        </h1>
                        <div className="marathi-tagline-aarohan">
                            ज्ञानातून कौशल्य • कौशल्यातून भरारी
                        </div>
                        <div className="pursuit-intel-subtitle">NATIONAL LEVEL TECHNICAL SYMPOSIUM & MASTERCLASSES</div>
                    </div>

                    <div className="intel-description-box">
                        <span className="box-label">MISSION_BLUEPRINT</span>
                        <p className="pursuit-header-desc">
                            <strong>AAROHAN (आरोहण)</strong> is the flagship technical skill-building vertical under Navonmesh. Designed to elevate engineering students to industry readiness, Aarohan features two specialized learning tiers: intensive <strong>15+ Days Long-Term Industry Masterclasses</strong> with 5 capstone projects & certifications, alongside <strong>Fast-Track Short-Term Workshops</strong> organized directly by prestigious college committees like E-Cell, ISTE, IEEE, and more.
                        </p>
                        <div className="intel-accents">
                            <div className="accent-bar"></div>
                            <div className="accent-dots"></div>
                        </div>
                    </div>

                    <div className="header-actions" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '20px' }}>
                        <button
                            onClick={() => handleOpenRegister()}
                            className="register-rocket-btn animate-float"
                            style={{ cursor: 'pointer', border: 'none' }}
                        >
                            <span className="reg-text">REGISTER FOR AAROHAN</span>
                            <div className="reg-icon-circle">
                                <FaRocket />
                            </div>
                            <div className="rocket-exhaust"></div>
                        </button>

                        <a
                            href="https://www.pursuitssgmce.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="external-portal-link"
                        >
                            <span>EXPLORE PORTAL</span>
                            <FaArrowRight />
                        </a>
                    </div>
                </div>
            </div>

            {/* Mission Specifications (HUD STYLE) */}
            <div className="pursuit-hud-specs">
                <div className="pursuit-spec-item highlight-cyan">
                    <div className="hud-label">LONG-TERM FEE (15+ DAYS)</div>
                    <div className="hud-value">₹250 - ₹300</div>
                    <div className="hud-sub">4 Major Specialized Modules</div>
                    <div className="hud-bar"><div className="fill" style={{ width: '100%' }}></div></div>
                </div>
                <div className="pursuit-spec-item highlight-purple">
                    <div className="hud-label">SHORT-TERM FEE (COMMITTEES)</div>
                    <div className="hud-value">₹50 - ₹100</div>
                    <div className="hud-sub">E-Cell, ISTE, IEEE & More</div>
                    <div className="hud-bar"><div className="fill" style={{ width: '85%' }}></div></div>
                </div>
                <div className="pursuit-spec-item highlight-gold">
                    <div className="hud-label">MAJOR DELIVERABLES</div>
                    <div className="hud-value">5 PROJECTS + CERT</div>
                    <div className="hud-sub">Resume & Git Portfolio Mentoring</div>
                    <div className="hud-bar"><div className="fill" style={{ width: '100%' }}></div></div>
                </div>
                <div className="pursuit-spec-item highlight-red">
                    <div className="hud-label">ADMISSION STATUS</div>
                    <div className="hud-value">LIMITED SEATS</div>
                    <div className="hud-sub">Batch-Capped for 1-on-1 Mentorship</div>
                    <div className="hud-bar"><div className="fill" style={{ width: '95%' }}></div></div>
                </div>
            </div>

            {/* 🎁 PROMINENT DELIVERABLES HUD BANNER */}
            <div className="aarohan-deliverables-banner">
                <div className="banner-glow-effect"></div>
                <div className="banner-header">
                    <span className="banner-tag">🌟 FLAGSHIP DELIVERABLES (फायदे व प्रोजेक्ट्स)</span>
                    <h2 className="banner-title">What You Receive in Aarohan Long-Term Workshops</h2>
                    <p className="banner-desc">Every participant in our 15+ Days Long-Term tracks unlocks an industry-ready career launchpad:</p>
                </div>

                <div className="deliverables-grid">
                    <div className="deliverable-card">
                        <div className="deliverable-icon-wrap project-icon">
                            <FaProjectDiagram />
                        </div>
                        <div className="deliverable-text">
                            <h3>5 Real-World Projects</h3>
                            <p>Build 5 industry-caliber capstone projects during and after the workshop to showcase on your portfolio.</p>
                        </div>
                    </div>

                    <div className="deliverable-card">
                        <div className="deliverable-icon-wrap resume-icon">
                            <FaFileAlt />
                        </div>
                        <div className="deliverable-text">
                            <h3>Resume Building Guidance</h3>
                            <p>1-on-1 mentor guidance to craft an ATS-optimized, high-impact resume highlighting your workshop skills.</p>
                        </div>
                    </div>

                    <div className="deliverable-card">
                        <div className="deliverable-icon-wrap cert-icon">
                            <FaCertificate />
                        </div>
                        <div className="deliverable-text">
                            <h3>Official Verified Certificate</h3>
                            <p>Accredited certificate of completion with unique verification credential recognized by academia and industry.</p>
                        </div>
                    </div>

                    <div className="deliverable-card">
                        <div className="deliverable-icon-wrap git-icon">
                            <FaGithub />
                        </div>
                        <div className="deliverable-text">
                            <h3>Git & GitHub Profile Building</h3>
                            <p>Structured repository setups, clean commit workflows, README documentation, and standout developer profile.</p>
                        </div>
                    </div>

                    <div className="deliverable-card">
                        <div className="deliverable-icon-wrap mentorship-icon">
                            <FaGraduationCap />
                        </div>
                        <div className="deliverable-text">
                            <h3>Expert Mentorship & Doubts</h3>
                            <p>Continuous doubt-clearing sessions, live code/design reviews, and interactive guidance by domain specialists.</p>
                        </div>
                    </div>

                    <div className="deliverable-card">
                        <div className="deliverable-icon-wrap seats-icon">
                            <FaFire />
                        </div>
                        <div className="deliverable-text">
                            <h3>Strictly Limited Seats</h3>
                            <p>Enforced small batch sizes (₹250-₹300 fee) ensuring personalized attention for each enrolled student.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="pursuit-tabs">
                <button
                    className={`pursuit-tab-btn ${activeTab === 'long-term' ? 'active' : ''}`}
                    onClick={() => setActiveTab('long-term')}
                >
                    <FaFire /> 1) LONG TERM WORKSHOPS (15+ DAYS)
                </button>
                <button
                    className={`pursuit-tab-btn ${activeTab === 'short-term' ? 'active' : ''}`}
                    onClick={() => setActiveTab('short-term')}
                >
                    <FaBuilding /> 2) SHORT TERM WORKSHOPS (COMMITTEES)
                </button>
                <button
                    className={`pursuit-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    <FaLayerGroup /> ALL MODULES
                </button>
                <button
                    className={`pursuit-tab-btn ${activeTab === 'speakers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('speakers')}
                >
                    <FaUsers /> MENTORS & COMMANDERS
                </button>
            </div>

            {/* ============================================================== */}
            {/* 🚀 TAB 1 / ALL: LONG TERM WORKSHOPS (15+ Days) */}
            {/* ============================================================== */}
            {(activeTab === 'long-term' || activeTab === 'all') && (
                <div className="pursuit-section fade-in">
                    <div className="tier-section-header">
                        <div className="tier-badge-pill long-badge">
                            <FaFire /> TIER 1: 15+ DAYS IMMERSIVE INDUSTRY MASTERCLASSES
                        </div>
                        <h2 className="tier-heading">
                            दीर्घकालीन कार्यशाळा (Long Term Workshops)
                        </h2>
                        <p className="tier-desc">
                            4 major intensive workshops crafted for students who want deep domain mastery, 5 portfolio projects, resume guidance, official certification, and GitHub profile elevation.
                            <span className="tier-price-tag">Entry Fee: ₹250 - ₹300 • Limited Seats</span>
                        </p>
                    </div>

                    <div className="long-workshops-grid">
                        {longTermWorkshops.map((ws, i) => (
                            <div key={ws.id} className="long-workshop-card">
                                <div className="card-top-image">
                                    <img src={ws.image} alt={ws.title} className="card-hero-img" />
                                    <div className="card-overlay-gradient"></div>
                                    <div className="card-duration-badge">
                                        <FaClock /> {ws.duration}
                                    </div>
                                    <div className="card-fee-badge gold-fee">
                                        {ws.fee}
                                    </div>
                                </div>

                                <div className="card-body">
                                    <div className="card-category-row">
                                        <span className="card-category">{ws.category}</span>
                                        <span className="card-limited-seats-tag">
                                            <FaFire /> {ws.seats}
                                        </span>
                                    </div>

                                    <h3 className="card-title">{ws.title}</h3>
                                    <h4 className="card-marathi-title">{ws.marathiTitle}</h4>
                                    {ws.subtitle && <p className="card-sub">{ws.subtitle}</p>}
                                    <p className="card-description">{ws.desc}</p>

                                    {/* Tools & Tech Chips */}
                                    <div className="card-tools-wrap">
                                        <span className="tools-label"><FaTools /> KEY TOOLS & TECH:</span>
                                        <div className="tools-chips">
                                            {ws.tools.map((tool, idx) => (
                                                <span key={idx} className="tool-chip">{tool}</span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 5 Real Projects Showcase */}
                                    <div className="card-projects-box">
                                        <span className="projects-box-title">
                                            <FaProjectDiagram /> 5 DELIVERABLE CAPSTONE PROJECTS:
                                        </span>
                                        <ul className="projects-list">
                                            {ws.projects.map((proj, pIdx) => (
                                                <li key={pIdx}>
                                                    <span className="proj-num">0{pIdx + 1}</span>
                                                    <span className="proj-text">{proj}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Deliverables mini tags */}
                                    <div className="deliverable-mini-pills">
                                        <span className="d-pill"><FaCheckCircle /> 5 Projects</span>
                                        <span className="d-pill"><FaCheckCircle /> Resume Guidance</span>
                                        <span className="d-pill"><FaCheckCircle /> Certificate</span>
                                        <span className="d-pill"><FaCheckCircle /> Git Profile</span>
                                    </div>

                                    {/* Card CTA */}
                                    <div className="card-action-footer">
                                        <button
                                            className="card-register-btn"
                                            onClick={() => handleOpenRegister(ws.title)}
                                        >
                                            ENROLL IN THIS WORKSHOP <FaArrowRight />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ============================================================== */}
            {/* ⚡ TAB 2 / ALL: SHORT TERM WORKSHOPS (College Committees) */}
            {/* ============================================================== */}
            {(activeTab === 'short-term' || activeTab === 'all') && (
                <div className="pursuit-section fade-in" style={{ marginTop: activeTab === 'all' ? '80px' : '40px' }}>
                    <div className="tier-section-header">
                        <div className="tier-badge-pill short-badge">
                            <FaBuilding /> TIER 2: FAST-TRACK COMMITTEE WORKSHOPS
                        </div>
                        <h2 className="tier-heading">
                            अल्पकालीन कार्यशाळा (Short Term Workshops)
                        </h2>
                        <p className="tier-desc">
                            Conducted by esteemed college committees under Navonmesh: <strong>E-Cell, IEEE, ISTE, Robotics Club, Cyber Cell, IETE, SAE</strong> & more.
                            Gain rapid hands-on proficiency in cutting-edge domains.
                            <span className="tier-price-tag short-price-tag">Entry Fee: ₹50 - ₹100 • Fast-Track 1-2 Days</span>
                        </p>
                    </div>

                    {/* Committee Filter Pills */}
                    <div className="committee-filter-bar">
                        <span className="filter-label"><FaFilter /> FILTER BY COMMITTEE:</span>
                        <div className="filter-buttons">
                            <button
                                className={`filter-btn ${committeeFilter === 'all' ? 'active' : ''}`}
                                onClick={() => setCommitteeFilter('all')}
                            >
                                All Committees
                            </button>
                            <button
                                className={`filter-btn ${committeeFilter === 'ecell' ? 'active' : ''}`}
                                onClick={() => setCommitteeFilter('ecell')}
                            >
                                E-Cell
                            </button>
                            <button
                                className={`filter-btn ${committeeFilter === 'ieee' ? 'active' : ''}`}
                                onClick={() => setCommitteeFilter('ieee')}
                            >
                                IEEE
                            </button>
                            <button
                                className={`filter-btn ${committeeFilter === 'iste' ? 'active' : ''}`}
                                onClick={() => setCommitteeFilter('iste')}
                            >
                                ISTE
                            </button>
                            <button
                                className={`filter-btn ${committeeFilter === 'robotics' ? 'active' : ''}`}
                                onClick={() => setCommitteeFilter('robotics')}
                            >
                                Robotics
                            </button>
                            <button
                                className={`filter-btn ${committeeFilter === 'cyber' ? 'active' : ''}`}
                                onClick={() => setCommitteeFilter('cyber')}
                            >
                                Cyber Cell
                            </button>
                            <button
                                className={`filter-btn ${committeeFilter === 'iete' ? 'active' : ''}`}
                                onClick={() => setCommitteeFilter('iete')}
                            >
                                IETE
                            </button>
                            <button
                                className={`filter-btn ${committeeFilter === 'sae' ? 'active' : ''}`}
                                onClick={() => setCommitteeFilter('sae')}
                            >
                                SAE
                            </button>
                        </div>
                    </div>

                    <div className="short-workshops-grid">
                        {filteredShortTerm.map((ws, idx) => (
                            <div
                                key={idx}
                                className="short-workshop-card"
                                onClick={() => handleOpenRegister(ws.title)}
                            >
                                <div className="short-img-box">
                                    <img src={ws.image} alt={ws.title} className="short-card-img" />
                                    <div className="short-committee-badge">
                                        <FaBuilding style={{ marginRight: '6px' }} /> {ws.committee}
                                    </div>
                                    <div className="short-fee-badge">{ws.fee}</div>
                                </div>

                                <div className="short-card-content">
                                    <span className="short-duration-tag">
                                        <FaClock style={{ marginRight: '5px' }} /> {ws.duration}
                                    </span>
                                    <h3 className="short-card-title">{ws.title}</h3>
                                    <h4 className="short-card-marathi">{ws.marathiTitle}</h4>
                                    <p className="short-card-desc">{ws.desc}</p>
                                    <div className="short-card-highlights">
                                        {ws.highlights}
                                    </div>

                                    <div className="short-card-footer">
                                        <span className="short-enroll-link">
                                            Register for {ws.fee} <FaArrowRight />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ============================================================== */}
            {/* 🎙️ TAB 4: MENTORS & SPEAKERS */}
            {/* ============================================================== */}
            {activeTab === 'speakers' && (
                <div className="pursuit-section fade-in">
                    <h2 className="section-heading">
                        <FaUsers /> GUEST COMMANDERS & MENTORS
                    </h2>
                    <p style={{ color: '#94a3b8', marginBottom: '30px', fontFamily: 'Orbitron, sans-serif', fontSize: '0.9rem' }}>
                        Learn directly from distinguished corporate leaders, startup founders, and veteran academic minds.
                    </p>
                    <div className="speakers-grid">
                        {speakers.map((speaker, idx) => (
                            <div key={idx} className="speaker-card">
                                <div className="speaker-img-wrapper">
                                    <img src={speaker.image} alt={speaker.name} className="speaker-img" />
                                </div>
                                <h3 className="speaker-name">{speaker.name}</h3>
                                <p className="speaker-role">{speaker.role}</p>
                                <p className="speaker-org">{speaker.org}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 📞 Mission Support Section */}
            <div className="pursuit-section">
                <div className="support-card">
                    <h2 className="support-title">AAROHAN WORKSHOP MISSION SUPPORT</h2>
                    <p className="support-subtitle">Strategic assistance & student coordination for symposium workshops</p>
                    <div className="support-contacts">
                        <div className="contact-item">
                            <span className="contact-label">Overall Head & Aarohan Head</span>
                            <span className="contact-name">Vedant Darokar</span>
                            <a href="tel:9307736340" className="contact-phone">9307736340</a>
                        </div>
                        <div className="contact-item">
                            <span className="contact-label">Overall Head & Aarohan Head</span>
                            <span className="contact-name">Nihal Kankal</span>
                            <a href="tel:8766417815" className="contact-phone">8766417815</a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Call to Action */}
            <div className="pursuit-cta-container">
                <button
                    className="pursuit-visit-btn"
                    onClick={() => handleOpenRegister()}
                >
                    ENROLL IN AAROHAN WORKSHOPS NOW <FaRocket style={{ marginLeft: "10px" }} />
                </button>
            </div>

            {/* Interactive Registration Choice Modal */}
            <RegistrationChoiceModal
                isOpen={showChoiceModal}
                onClose={() => setShowChoiceModal(false)}
                onChooseManual={handleChooseManual}
                onChooseChat={handleChooseChat}
                eventName={selectedWorkshop ? `Aarohan: ${selectedWorkshop}` : "आरोहण (Aarohan Workshops)"}
            />

            {/* Interactive Registration Chat Modal */}
            <RegistrationChatModal
                isOpen={showChatModal}
                onClose={() => setShowChatModal(false)}
                initialEvent="pursuit"
                onSwitchToManual={() => {
                    setShowChatModal(false);
                    navigate('/register?event=pursuit');
                }}
            />
        </div>
    );
};

export default Pursuit;
