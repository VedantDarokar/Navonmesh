import React, { useState } from "react";
import "../Styles/team.css";
import { FaInstagram, FaLinkedin, FaPhone, FaEnvelope } from "react-icons/fa";
import { Link } from "react-router-dom";
import { FaXTwitter } from "react-icons/fa6";
import ashishImg from "../assets/ashishIngle.png";
import teamPlaceholder from "../assets/team_placeholder.png";
import nihalImg from "../assets/nihal_latest.png";
import divineImg from "../assets/divine_blessings.png";
import sanchitImg from "../assets/sanchit_new.png";
import tanmayImg from "../assets/tanmay.png";
import krushnaImg from "../assets/krushna.png";
import omImg from "../assets/om_konde_latest.png";
import principalImg from "../assets/principal.png";
import jadhaoImg from "../assets/jadhao.png";
import wahileImg from "../assets/ganesh_wahile.png";
import shrinitImg from "../assets/shrinit_latest.png";
import EcellLogo from "../assets/ecell-logo.png";
import shripadImg from "../assets/shripad_new.png";
import vedantImg from "../assets/vedant_latest.png";
import abhishekImg from "../assets/abhishek_new.png";
import prarthnaImg from "../assets/prarthna.jpeg";
import rutujaImg from "../assets/rutuja_latest_v2.png";
import ajinkyaImg from "../assets/ajinkya.png";
import chakradharImg from "../assets/chakradhar.png";
import vikasGawadeImg from "../assets/vikas_gawade.png";
import omDeshmukhImg from "../assets/om_deshmukh.png";
import atharvaSononeImg from "../assets/atharva_sonone.png";
import atharvaTayadeImg from "../assets/atharva_tayade.png";
import vikasMoreImg from "../assets/vikas_more.png";
import sushantAkhareImg from "../assets/sushant_akhare.png";
import manjiriImg from "../assets/manjiri_new.png";
import dollyImg from "../assets/dolly_bhutada.png";
import sakshiImg from "../assets/sakshi_kamble.png";
import siddhiImg from "../assets/siddhi_kulkarni.png";
import hanzalaImg from "../assets/hanzala_khan.png";
import satyajeetImg from "../assets/satyajeet.png";
import thuteImg from "../assets/thute.png";
import kankaleImg from "../assets/kankale.png";
import zamareImg from "../assets/zamare.png";
import dharmaleImg from "../assets/dharmale.png";
import buteImg from "../assets/bute.png";
import gawandeImg from "../assets/gawande.png";
import mishraImg from "../assets/mishra.png";
import shrutiMankarImg from "../assets/shruti_mankar.png";
import dhanashriImg from "../assets/dhanashri_borde.png"
import omTaleImg from "../assets/om_tale.png";
import bannerImg from "../assets/coordinating_team_banner.png";
import PursuitLogo from "../assets/pursuitlogo.png";
import imgPranita from "../assets/pranita.png";
import NavonmeshLogo from "../assets/namonvesh-logo.png";
import webionLogo from "../assets/webion-logo.png";
import tcsLogo from "../assets/tcs-logo.png";
// Placeholder imports for sponsors - User will add these files
import sponsor1 from "../assets/sponsor1.png";
import sponsor2 from "../assets/sponsor2.png";
import sponsor3 from "../assets/sponsor3.png";
import sponsor4 from "../assets/sponsor4.jpeg";
import sponsor5 from "../assets/sponsor5.png";
import sponsor6 from "../assets/sponsor6.jpeg";
// import sponsor7 from "../assets/sponsor7.png";
import mainSponsor from "../assets/mainsponsor.png";


// HOD Images
import taleImg from "../assets/anand tale .jpeg";
import patilImg from "../assets/JMPatil.jpeg";
import paraskarImg from "../assets/paraskar.jpeg";
import nawgageImg from "../assets/navgage .jpeg";
import padiyaImg from "../assets/padiya .jpeg";
import trikalImg from "../assets/trikal.jpeg";
import kucharImg from "../assets/pawan kuchar.jpeg";


const topMentors = [
    {
        id: 1,
        name: "Dr. S. B. Somani",
        role: "Principal",
        image: principalImg,
        description: "Visionary leader guiding the institute towards academic excellence and innovation."
    },
    {
        id: 2,
        name: "Dr. S. S. Jadhao",
        role: "Convener",
        image: jadhaoImg,
        description: "Dedicated mentor fostering technical growth and student development."
    }
];

const hods = [
    {
        id: 103,
        name: "Dr. S. R. Paraskar",
        role: "Head, Dept. of Electrical Engineering (Electronics & Power)",
        image: paraskarImg,
        description: "Excellence in electrical power systems and electronics."
    },
    {
        id: 106,
        name: "Dr. S. P. Trikal",
        role: "Head, Department of Mechanical Engineering",
        image: trikalImg,
        description: "Advancing mechanical systems and manufacturing excellence."
    },
    {
        id: 102,
        name: "Dr. J. M. Patil",
        role: "Head, Department of Computer Science & Engineering",
        image: patilImg,
        description: "Leading innovation in computer science and software engineering."
    },
    {
        id: 104,
        name: "Dr. D. D. Nawgaje",
        role: "Associate Professor & Head, Dept. of Electronics and Telecommunication Engineering",
        image: nawgageImg,
        description: "Shaping the future of communication technologies."
    },
    {
        id: 105,
        name: "Dr. S. D. Padiya",
        role: "Head, Dept. of Information Technology",
        image: padiyaImg,
        description: "Driving digital transformation through information technology."
    },
    {
        id: 107,
        name: "Dr. P. M. Kuchar",
        role: "Head, Dept. of Business Administration and Research (MBA)",
        image: kucharImg,
        description: "Nurturing the next generation of business leaders."
    },
    {
        id: 101,
        name: "Dr. A. S. Tale",
        role: "Head, Dept. of Applied Sciences and Humanities",
        image: taleImg,
        description: "Leadership in fundamental sciences and humanities education."
    }
];

const facultyAdvisors = [
    {
        id: 4,
        name: "Dr. V. K. Thute",
        role: "Faculty Advisor",
        image: thuteImg,
        description: "Dedicated faculty member supporting the Navonmesh mission."
    },
    {
        id: 5,
        name: "Dr. R. S. Kankale",
        role: "Faculty Advisor",
        image: kankaleImg,
        description: "Dedicated faculty member supporting the Navonmesh mission."
    },
    {
        id: 6,
        name: "Dr. R. A. Zamare",
        role: "Faculty Advisor",
        image: zamareImg,
        description: "Dedicated faculty member supporting the Navonmesh mission."
    },
    {
        id: 7,
        name: "Dr. N. S. Dharmale",
        role: "Faculty Advisor",
        image: dharmaleImg,
        description: "Dedicated faculty member supporting the Navonmesh mission."
    },
    {
        id: 8,
        name: "Miss P. P. Bute",
        role: "Faculty Advisor",
        image: buteImg,
        description: "Dedicated faculty member supporting the Navonmesh mission."
    },
    {
        id: 9,
        name: "Dr. J. S. Gawande",
        role: "Faculty Advisor",
        image: gawandeImg,
        description: "Dedicated faculty member supporting the Navonmesh mission."
    },
    {
        id: 10,
        name: "Dr. S. M. Mishra",
        role: "Faculty Advisor",
        image: mishraImg,
        description: "Dedicated faculty member supporting the Navonmesh mission."
    },
    {
        id: 3,
        name: "Mr. Ganesh Wahile",
        role: "E-Cell Faculty Advisor",
        image: wahileImg,
        description: "Expert coordinator facilitating seamless execution of technical events."
    }
];

const teamMembers = [
    {
        id: 20,
        name: "Vikas Gawade",
        role: "Core Team Member",
        subRole: "Final Year Advisor",
        phone: "+91 8010324551",
        email: "vikas@example.com",
        image: vikasGawadeImg,
    },
    {
        id: 21,
        name: "Om Deshmukh",
        role: "Core Team Member",
        subRole: "Final Year Advisor",
        phone: "+91 98765 43210",
        email: "om@example.com",
        instagram: "#",
        linkedin: "#",
        image: omDeshmukhImg,
    },
    {
        id: 22,
        name: "Shripad Ingle",
        role: "Core Team Member",
        subRole: "Final Year Advisor",
        phone: "+91 98765 43210",
        email: "shripad@example.com",
        instagram: "#",
        linkedin: "#",
        image: shripadImg,
    },
    {
        id: 1,
        name: "Rutuja Deshmukh",
        role: "Core Team Member",
        subRole: "Overall Head",
        phone: "+91 9022886503",
        email: "rutujadeshmukh1512@gmail.com",
        instagram: "https://www.instagram.com/rutujadeshmukh157?igsh=MXQwd2dwY21lazg5eA==",
        linkedin: "https://www.linkedin.com/in/rutuja-deshmukh-3aa0a03aa?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
        image: rutujaImg,
    },
    {
        id: 2,
        name: "Nihal Kankal",
        role: "Core Team Member",
        subRole: "Overall Head",
        phone: "+91 8766417815",
        email: "nihalk9876@gmail.com",
        instagram: "https://www.instagram.com/nihal.kankal/",
        linkedin: "#",
        image: nihalImg,
    },
    {
        id: 15,
        name: "Vedant Darokar",
        role: "Core Team Member",
        subRole: "Overall Head",
        phone: "+91 8208772402",
        email: "vedantdarokar7@gmail.com",
        instagram: "https://www.instagram.com/vedant_darokar_15/",
        linkedin: "https://www.linkedin.com/in/vedant-darokar-3241a3286/",
        image: vedantImg,
    },
    {
        id: 3,
        name: "Sanchit Dangra",
        role: "Core Team Member",
        subRole: "Overall Head",
        phone: "+91 98765 43210",
        email: "sanchitdangra@gmail.com",
        instagram: "https://www.instagram.com/dangrasanchit?igsh=MmU1eGg5ajFlenNv&utm_source=qr",
        linkedin: "https://www.linkedin.com/in/sanchit-dangra-874abb273?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
        image: sanchitImg,
    },

    {
        id: 26,
        name: "Atharva Tayade",
        role: "Core Team Member",
        subRole: "HEAD(सृजन)",
        phone: "+91 8767968475",
        email: "tayadeatharva12@gmail.com",
        instagram: "https://www.instagram.com/atharva_tayade_?igsh=dWFnaW43NDE0MTMx",
        linkedin: "https://www.linkedin.com/in/atharva-tayade-b63449294?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
        image: atharvaTayadeImg,
    },
    {
        id: 13,
        name: "Krushna Kokate",
        role: "Core Team Member",
        subRole: "HEAD (अंकुर)",
        phone: "+91 8261905585",
        email: "krushnakokate829@gmail.com",
        instagram: "https://www.instagram.com/krushna_kokate25?igsh=MTNwbGtpeml0aGJlNA==",
        linkedin: "https://www.linkedin.com/in/krushna-kokate-591009329?utm_source=share_via&utm_content=profile&utm_medium=member_android",
        image: krushnaImg,
    },
    {
        id: 5,
        name: "Tanmay Kurhekar",
        role: "Core Team Member",
        subRole: "HEAD (उद्‌भव)",
        phone: "+91 8605359181",
        email: "tanmaykurhekar07@gmail.com",
        image: tanmayImg,
    },
    {
        id: 16,
        name: "Ajinkya Surange",
        role: "Core Team Member",
        subRole: "Accommodation and Logistics Head",
        phone: "+91 9604765998",
        email: "surangeajinkya9@gmail.com",
        instagram: "https://www.instagram.com/ajinkyasurange?igsh=MW80am1ycXF4bGE4dg==",
        linkedin: "https://www.linkedin.com/in/ajinkya-surange-8797593ab?utm_source=share_via&utm_content=profile&utm_medium=member_android",
        image: ajinkyaImg,
    },
    {
        id: 14,
        name: "Prarthna Kale",
        role: "Core Team Member",
        subRole: "Event Co-head",
        phone: "+91 98765 43210",
        email: "prarthanarkale30@gmail.com",
        instagram: "https://www.instagram.com/prarthana_kale30?igsh=MWthZzM2NXljdmcz",
        linkedin: "https://www.linkedin.com/in/prarthana-kale-868979294?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
        image: prarthnaImg,
    },
    {
        id: 6,
        name: "Chakradhar Mahale",
        role: "Core Team Member",
        subRole: "Treasurer",
        phone: "+91 7350976698",
        email: "chakradharmahale7@gmail.com",
        instagram: "https://www.instagram.com/chakradharmahale01",
        linkedin: "#",
        image: chakradharImg,
    },
    {
        id: 29,
        name: "Hanzala Khan",
        role: "Core Team Member",
        subRole: "Graphics Head",
        phone: "+91 7410799739",
        email: "hanzalakhan004az@gmail.com",
        instagram: "https://www.instagram.com/hanzala_khan_0004",
        linkedin: "https://www.linkedin.com/in/hanzala-khan-068885294",
        image: hanzalaImg,
    },
    {
        id: 7,
        name: "Abhishek Kanherkar",
        role: "Core Team Member",
        subRole: "Publicity Head",
        phone: "+91 8010324551",
        email: "abhishek.kanherkar3@gmail.com",
        instagram: "https://www.instagram.com/abhishekkanherkar03?igsh=MXM2bTZlaXd3OWw0Zw==",
        linkedin: "https://www.linkedin.com/in/abhishek-kanherkar-2124083ab?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
        image: abhishekImg,
    },
    {
        id: 40,
        name: "Ashish Ingle",
        role: "Core Team Member",
        subRole: "Technical Head",
        phone: "+91 7218522510",
        email: "ashishingle369@gmail.com",
        instagram: "https://www.instagram.com/ashishingle369?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
        linkedin: "https://www.linkedin.com/in/ashish-ingle-1aba5437b/",
        image: ashishImg,
    },

    {
        id: 18,
        name: "Om Konde",
        role: "Core Team Member",
        subRole: "Discipline Head",
        phone: "+91 8669873156",
        email: "kondeom970@gmail.com",
        instagram: "https://www.instagram.com/om_3105_?igsh=ZHBxYmZoaWtmZm8x",
        linkedin: "https://www.linkedin.com/in/om-konde-bb48b2290?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
        image: omImg,
    },
    {
        id: 19,
        name: "Shrinit Chavan",
        role: "Core Team Member",
        subRole: "Management Head",
        phone: "+91 7774900204",
        email: "chavanshrinit@gmail.com",
        instagram: "https://www.instagram.com/_aniket_patil__0?igsh=azZ6ZGw0Ymtxemow",
        linkedin: "https://www.linkedin.com/in/shrinit-chavan-106224295?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
        image: shrinitImg,
    },



    {
        id: 23,
        name: "Sushant Akhare",
        role: "Core Team Member",
        subRole: "Cultural Head",
        phone: "+91 8767872382",
        email: "sushant.akhare@gmail.com",
        instagram: "https://www.instagram.com/sushant.akhare?igsh=MWV5dGwyNjF5dGcwZA==",
        linkedin: "https://www.linkedin.com/in/sushant-akhare-0505ba31b?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
        image: sushantAkhareImg,
    },
];


const Team = () => {
    const [showAllCoreTeam, setShowAllCoreTeam] = useState(false);

    return (
        <div className="team-container">


            <div className="divine-section" style={{ marginTop: "60px" }}>
                <h2 className="divine-text">By the divine blessings of</h2>
                <div className="divine-img-container">
                    <img src={divineImg} alt="Divine Blessing" />
                </div>
                <h3 className="marathi-text">
                    <span className="left-symbol">॥</span>
                    श्री संत गजानन महाराज,शेगाव
                    <Link to="/admin" className="symbol-link">॥</Link>
                </h3>
            </div>

            <h1 className="team-title" style={{ marginTop: "40px" }}>MENTORS</h1>

            {/* Principal & Convener */}
            <div className="team-grid desktop-mentors" style={{ marginBottom: "40px" }}>
                {topMentors.map((mentor) => (
                    <div key={mentor.id} className="team-card mentor-card">
                        <div className="member-img">
                            <img src={mentor.image} alt={mentor.name} />
                            <div className="mentor-overlay">
                                <p className="mentor-description">{mentor.description}</p>
                            </div>
                        </div>
                        <div className="member-info">
                            <h3>{mentor.name}</h3>
                            <p className="member-role">{mentor.role}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* HODs - First row of 4 */}
            <div className="team-grid desktop-mentors" style={{ marginBottom: "40px" }}>
                {hods.slice(0, 4).map((mentor) => (
                    <div key={mentor.id} className="team-card mentor-card">
                        <div className="member-img">
                            <img src={mentor.image} alt={mentor.name} />
                            <div className="mentor-overlay">
                                <p className="mentor-description">{mentor.description}</p>
                            </div>
                        </div>
                        <div className="member-info">
                            <h3 style={{ fontSize: "1rem" }}>{mentor.name}</h3>
                            <p className="member-role" style={{ fontSize: "0.75rem" }}>{mentor.role}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* HODs - Second row of 3 */}
            <div className="team-grid desktop-mentors" style={{ marginBottom: "60px" }}>
                {hods.slice(4).map((mentor) => (
                    <div key={mentor.id} className="team-card mentor-card">
                        <div className="member-img">
                            <img src={mentor.image} alt={mentor.name} />
                            <div className="mentor-overlay">
                                <p className="mentor-description">{mentor.description}</p>
                            </div>
                        </div>
                        <div className="member-info">
                            <h3 style={{ fontSize: "1rem" }}>{mentor.name}</h3>
                            <p className="member-role" style={{ fontSize: "0.75rem" }}>{mentor.role}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Faculty Advisors */}
            <div className="team-grid desktop-mentors" style={{ marginBottom: "60px" }}>
                {facultyAdvisors.map((mentor) => (
                    <div key={mentor.id} className="team-card mentor-card">
                        <div className="member-img">
                            <img src={mentor.image} alt={mentor.name} />
                            <div className="mentor-overlay">
                                <p className="mentor-description">{mentor.description}</p>
                            </div>
                        </div>
                        <div className="member-info">
                            <h3>{mentor.name}</h3>
                            <p className="member-role">{mentor.role}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Mobile Mentors Continuous Scroll */}
            <div className="mobile-mentor-scroll">
                <div className="mentor-track">
                    {/* Concatenate large list for seamless loop */}
                    {[...topMentors, ...hods, ...facultyAdvisors, ...topMentors, ...hods, ...facultyAdvisors].map((mentor, index) => (
                        <div key={`${mentor.id}-${index}`} className="team-card mentor-card">
                            <div className="member-img">
                                <img src={mentor.image} alt={mentor.name} />
                            </div>
                            <div className="member-info">
                                <h3>{mentor.name}</h3>
                                <p className="member-role">{mentor.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="coordinating-section" style={{ marginBottom: "80px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <h2 className="section-title">Coordinating Team</h2>
                <div className="logo-container logos-row">
                    <img src={EcellLogo} alt="E-Cell Logo" className="team-logo ecell-logo-img" />
                    <img src={NavonmeshLogo} alt="Navonmesh Logo" className="team-logo navonmesh-logo-img" />
                    <img src={PursuitLogo} alt="Pursuit Logo" className="team-logo pursuit-logo-img" />
                </div>
            </div>

            {/* Event Sponsor Section */}
            <div id="sponsors" className="partners-section premium-partners-area">
                <div className="section-glow-orb"></div>

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
            </div>

            {/* Event Sponsor Section */}
            <div className="sponsors-section premium-partners-area">
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


            <h1 className="team-title">CORE TEAM</h1>
            <p className="team-subtitle">
                The dedicated minds behind Navonvesh 2026.
            </p>

            {/* Core Team Grid - Top 3 Fixed Sequence */}
            <div className="team-grid core-team-top-grid" style={{ marginBottom: "20px" }}>
                {teamMembers.slice(0, 3).map((member) => (
                    <div key={member.id} className="team-card overall-head-card">
                        <div className="member-img">
                            <img src={member.image} alt={member.name} />
                        </div>
                        <div className="member-info">
                            <h3>{member.name}</h3>

                            {member.subRole && (
                                <p className="head-role">
                                    {member.subRole}
                                </p>
                            )}

                            {member.subRole2 && (
                                <p className="head-role secondary">
                                    {member.subRole2}
                                </p>
                            )}

                            <div className="contact-details">
                                <p>
                                    <FaPhone className="icon" /> {member.phone}
                                </p>
                                <p>
                                    <FaEnvelope className="icon" /> {member.email}
                                </p>
                            </div>

                            <div className="social-links">
                                <a href={member.instagram || "#"} target="_blank" rel="noopener noreferrer" className="social-icon">
                                    <FaInstagram />
                                </a>
                                <a href={member.linkedin || "#"} target="_blank" rel="noopener noreferrer" className="social-icon">
                                    <FaLinkedin />
                                </a>
                                <a href="#" className="social-icon">
                                    <FaXTwitter />
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Core Team Grid - Next 4 Fixed Sequence */}
            <div className="team-grid core-team-top-grid" style={{ marginBottom: "40px" }}>
                {teamMembers.slice(3, 7).map((member) => (
                    <div key={member.id} className="team-card overall-head-card">
                        <div className="member-img">
                            <img src={member.image} alt={member.name} />
                        </div>
                        <div className="member-info">
                            <h3>{member.name}</h3>

                            {member.subRole && (
                                <p className="head-role">
                                    {member.subRole}
                                </p>
                            )}

                            {member.subRole2 && (
                                <p className="head-role secondary">
                                    {member.subRole2}
                                </p>
                            )}

                            <div className="contact-details">
                                <p>
                                    <FaPhone className="icon" /> {member.phone}
                                </p>
                                <p>
                                    <FaEnvelope className="icon" /> {member.email}
                                </p>
                            </div>

                            <div className="social-links">
                                <a href={member.instagram || "#"} target="_blank" rel="noopener noreferrer" className="social-icon">
                                    <FaInstagram />
                                </a>
                                <a href={member.linkedin || "#"} target="_blank" rel="noopener noreferrer" className="social-icon">
                                    <FaLinkedin />
                                </a>
                                <a href="#" className="social-icon">
                                    <FaXTwitter />
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {!showAllCoreTeam && (
                <div className="view-more-container">
                    <button
                        className="view-core-btn interstellar-btn"
                        onClick={() => setShowAllCoreTeam(true)}
                    >
                        <span>View Core Team</span>
                        <div className="star-particles"></div>
                    </button>
                    <p className="core-team-slogan">
                        Beyond the horizon, navigating the frontiers of innovation.
                    </p>
                </div>
            )}

            {showAllCoreTeam && (
                <div className="team-grid heads-grid">
                    {teamMembers.slice(7).map((member) => (
                        <div key={member.id} className="team-card">
                            <div className="member-img">
                                <img src={member.image} alt={member.name} />
                            </div>
                            <div className="member-info">
                                <h3>{member.name}</h3>

                                {member.subRole && (
                                    <p style={{ color: "#00f3ff", fontSize: "0.82rem", marginTop: "2px", marginBottom: "4px", fontWeight: "bold", lineHeight: "1.1" }}>
                                        {member.subRole}
                                    </p>
                                )}

                                {member.subRole2 && (
                                    <p style={{ color: "#00f3ff", fontSize: "0.72rem", marginTop: "0px", marginBottom: "8px", fontWeight: "bold", opacity: 0.9, lineHeight: "1.1" }}>
                                        {member.subRole2}
                                    </p>
                                )}

                                <div className="contact-details">
                                    <p>
                                        <FaPhone className="icon" /> {member.phone}
                                    </p>
                                    <p>
                                        <FaEnvelope className="icon" /> {member.email}
                                    </p>
                                </div>

                                <div className="social-links">
                                    <a href={member.instagram || "#"} target="_blank" rel="noopener noreferrer" className="social-icon">
                                        <FaInstagram />
                                    </a>
                                    <a href={member.linkedin || "#"} target="_blank" rel="noopener noreferrer" className="social-icon">
                                        <FaLinkedin />
                                    </a>
                                    <a href="#" className="social-icon">
                                        <FaXTwitter />
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Team;
