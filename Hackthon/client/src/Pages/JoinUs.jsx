import React, { useState } from 'react';
import '../Styles/joinUs.css';
import parchmentBg from '../assets/parchment_bg.jpg';
import hackathonStudents from '../assets/hackathon_students.png';
import navonmeshLogo from '../assets/navonmesh_tricolor.png';
import { 
  FaCheckCircle, 
  FaSpinner, 
  FaChevronDown 
} from 'react-icons/fa';

const JoinUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    contactNo: '',
    email: '',
    year: '2nd year',
    designation: 'Overall Head'
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastSubmittedData, setLastSubmittedData] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleYearSelect = (yr) => {
    setFormData({ ...formData, year: yr });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.contactNo.trim() || !formData.email.trim() || !formData.year) {
      alert('Please fill in all mandatory fields.');
      return;
    }
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/recruitment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLastSubmittedData({ ...formData });
        setSubmitted(true);
      } else {
        alert(data.error || 'Submission failed. Please check your information and try again.');
      }
    } catch (err) {
      alert('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      contactNo: '',
      email: '',
      year: '2nd year',
      designation: 'Overall Head'
    });
    setSubmitted(false);
  };

  const designations = [
    'Overall Head',
    'Srijan Head',
    'Ankur Head',
    'Udbhav Head',
    'Drone Head',
    'Management Co-Head',
    'Publicity Co-Head',
    'Accommodation Co-Head',
    'Logistics Co-Head',
    'Technical Co-Head',
    'Event Co-Head',
    'Discipline Co-Head',
    'Graphics Co-Head',
    'Videography Co-Head',
    'Social Media Co-Head'
  ];

  return (
    <div className="join-ancient-page">
      {/* 📜 ANCIENT PARCHMENT WALLPAPER BACKGROUND */}
      <div 
        className="join-parchment-wallpaper" 
        style={{ backgroundImage: `url(${parchmentBg})` }}
      >
        <div className="join-sepia-overlay" />
        <div className="join-vignette-overlay" />
      </div>

      {/* 🏛️ CORNER STUDENTS HACKATHON RELIEF (TRANSPARENT PNG) */}
      <div className="join-corner-students-container left">
        <img 
          src={hackathonStudents} 
          alt="Hackathon Team Left" 
          className="join-corner-students-img left-img" 
        />
      </div>
      <div className="join-corner-students-container right">
        <img 
          src={hackathonStudents} 
          alt="Hackathon Team Right" 
          className="join-corner-students-img right-img" 
        />
      </div>

      {/* MAIN ONE-SCREEN CONTAINER */}
      <div className="join-ancient-container">
        {/* HERO LOGO & TITLE */}
        <div className="join-ancient-hero">
          <div className="join-logo-emblem">
            <img src={navonmeshLogo} alt="Navonmesh Logo" className="join-ancient-logo" />
          </div>
          <h1 className="join-ancient-title">JOIN THE TEAM</h1>
          <div className="join-ornament-divider">
            <span className="ornament-arrow">❯───</span>
            <span className="ornament-symbol">❖ ✦ ❖</span>
            <span className="ornament-arrow">───❮</span>
          </div>
        </div>

        {/* PARCHMENT FORM SCROLL CARD */}
        <div className="parchment-scroll-card">
          <div className="parchment-inner-frame">
            {submitted ? (
              <div className="parchment-success-state">
                <div className="ancient-success-seal">
                  <FaCheckCircle className="ancient-seal-icon" />
                </div>
                <h2 className="parchment-heading">APPLICATION RECORDED</h2>
                <div className="join-ornament-divider">
                  <span>❯──◆──❮ ❖ ❯──◆──❮</span>
                </div>
                <p className="parchment-subtext">
                  Honorable <strong>{lastSubmittedData?.name}</strong>, your candidacy for{' '}
                  <span className="ancient-highlight">{lastSubmittedData?.designation}</span> has been
                  inscribed into the archives of Navonmesh '27.
                </p>

                <div className="parchment-summary-box">
                  <div className="summary-line">
                    <span className="s-label">CANDIDATE:</span>
                    <span className="s-val">{lastSubmittedData?.name}</span>
                  </div>
                  <div className="summary-line">
                    <span className="s-label">DESIGNATION:</span>
                    <span className="s-val">{lastSubmittedData?.designation}</span>
                  </div>
                  <div className="summary-line">
                    <span className="s-label">YEAR:</span>
                    <span className="s-val">{lastSubmittedData?.year}</span>
                  </div>
                  <div className="summary-line">
                    <span className="s-label">CONTACT:</span>
                    <span className="s-val">{lastSubmittedData?.contactNo}</span>
                  </div>
                  <div className="summary-line">
                    <span className="s-label">EMAIL:</span>
                    <span className="s-val">{lastSubmittedData?.email}</span>
                  </div>
                </div>

                <button type="button" className="ancient-carved-btn" onClick={resetForm}>
                  <span className="btn-bracket-left">[ ⚜</span>
                  <span className="btn-text">SUBMIT ANOTHER ENTRY</span>
                  <span className="btn-bracket-right">⚜ ]</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="parchment-form">
                <div className="parchment-header-group">
                  <h2 className="parchment-heading">HAVE AN ASPIRATION?</h2>
                  <div className="join-ornament-divider mini">
                    <span className="ornament-arrow">❯──</span>
                    <span className="ornament-symbol">❖</span>
                    <span className="ornament-arrow">──❮</span>
                  </div>
                  <p className="parchment-subtext">
                    EVERY GREAT SUMMIT IS DRIVEN BY EXTRAORDINARY MINDS. INSCRIBE YOUR DETAILS BELOW —
                  </p>
                </div>

                <div className="parchment-fields-body">
                  {/* ROW 1: NAME & CONTACT */}
                  <div className="parchment-row-2col">
                    <div className="parchment-field">
                      <label className="parchment-label" htmlFor="anc-name">
                        FULL NAME *
                      </label>
                      <input
                        id="anc-name"
                        type="text"
                        name="name"
                        required
                        placeholder="ENTER YOUR FULL NAME"
                        className="parchment-input"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="parchment-field">
                      <label className="parchment-label" htmlFor="anc-contact">
                        CONTACT NO *
                      </label>
                      <input
                        id="anc-contact"
                        type="tel"
                        name="contactNo"
                        required
                        placeholder="ENTER CONTACT NUMBER"
                        className="parchment-input"
                        value={formData.contactNo}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* ROW 2: EMAIL & DESIGNATION */}
                  <div className="parchment-row-2col">
                    <div className="parchment-field">
                      <label className="parchment-label" htmlFor="anc-email">
                        EMAIL ADDRESS *
                      </label>
                      <input
                        id="anc-email"
                        type="email"
                        name="email"
                        required
                        placeholder="ENTER EMAIL ADDRESS"
                        className="parchment-input"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="parchment-field">
                      <label className="parchment-label" htmlFor="anc-designation">
                        SELECT DESIGNATION *
                      </label>
                      <div className="parchment-select-wrapper">
                        <select
                          id="anc-designation"
                          name="designation"
                          className="parchment-select"
                          value={formData.designation}
                          onChange={handleChange}
                          required
                        >
                          {designations.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                        <FaChevronDown className="parchment-chevron" />
                      </div>
                    </div>
                  </div>

                  {/* ROW 3: YEAR OF STUDY */}
                  <div className="parchment-field">
                    <label className="parchment-label">
                      CURRENT YEAR OF STUDY *
                    </label>
                    <div className="ancient-year-selector">
                      {[
                        { key: '1st year', roman: 'I YEAR', label: '1st Year' },
                        { key: '2nd year', roman: 'II YEAR', label: '2nd Year' },
                        { key: '3rd year', roman: 'III YEAR', label: '3rd Year' }
                      ].map((item) => {
                        const isSelected = formData.year === item.key;
                        return (
                          <button
                            type="button"
                            key={item.key}
                            className={`ancient-year-pill ${isSelected ? 'active' : ''}`}
                            onClick={() => handleYearSelect(item.key)}
                          >
                            <span className="year-pill-roman">{item.roman}</span>
                            <span className="year-pill-label">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <div className="parchment-submit-wrapper">
                    <button
                      type="submit"
                      className="ancient-carved-btn"
                      disabled={loading}
                    >
                      <span className="btn-bracket-left">❲ ❖</span>
                      <span className="btn-text">
                        {loading ? 'SUBMITTING ENTRY...' : 'SUBMIT APPLICATION'}
                      </span>
                      <span className="btn-bracket-right">❖ ❳</span>
                    </button>
                  </div>

                  {/* INSTRUCTION NOTICE */}
                  <div className="parchment-notice-banner">
                    <p className="parchment-notice-text">
                      <span className="notice-bullet">❖</span> Last date of registration is <strong>9 September 2026</strong>. The interview date, time, and venue will be conveyed via mail soon.
                    </p>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinUs;
