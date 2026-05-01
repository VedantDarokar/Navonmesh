import { useState } from "react";
import "../Styles/navbar.css";
import namonveshfont from "../assets/namonvesh-logo.png";
import ecellLogo from "../assets/ecell-logo.png";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { FaChevronDown, FaBars, FaTimes } from "react-icons/fa"; // Import Icon

const Navbar = ({ onRegisterClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Mobile menu state
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const scrollToSection = (id) => {
    setIsMenuOpen(false); // Close menu on click

    if (location.pathname === "/") {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

    } else {
      // If not on home page, navigate to home.
      // The path "/" is the home route in HashRouter (#/)
      navigate("/");

      // If it's a specific section (not just top home), we can try to scroll after a short delay
      if (id !== "home") {
        setTimeout(() => {
          const element = document.getElementById(id);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 100); // Short delay to allow route change reflection
      } else {
        window.scrollTo(0, 0);
      }
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-logo" onClick={() => scrollToSection("home")} style={{ cursor: 'pointer' }}>
        <img src={namonveshfont} alt="Navonmesh Logo" />
      </div>

      <ul className={isMenuOpen ? "nav-links active" : "nav-links"}>
        <li>
          <span onClick={() => scrollToSection("home")}>Home</span>
        </li>
        <li className="dropdown-container">
          <span className="dropdown-trigger">
            Events <FaChevronDown className="dropdown-arrow" />
          </span>
          <ul className="dropdown-menu">
            <li>
              <NavLink to="/hackathon" className="nav-item-dropdown" style={{ textDecoration: 'none', color: 'inherit' }} onClick={() => setIsMenuOpen(false)}>
                Srijan (Hackathon)
              </NavLink>
            </li>
            <li>
              <NavLink to="/projectexpo" className="nav-item-dropdown" style={{ textDecoration: 'none', color: 'inherit' }} onClick={() => setIsMenuOpen(false)}>
                Ankur (Project Expo)
              </NavLink>
            </li>
            <li>
              <NavLink to="/conference" className="nav-item-dropdown" style={{ textDecoration: 'none', color: 'inherit' }} onClick={() => setIsMenuOpen(false)}>
                Udbhav (Conference)
              </NavLink>
            </li>
            <li>
              <NavLink to="/pursuit" className="nav-item-dropdown" style={{ textDecoration: 'none', color: 'inherit' }} onClick={() => setIsMenuOpen(false)}>
                Pursuit
              </NavLink>
            </li>
          </ul>
        </li>
        <li>
          <span onClick={() => scrollToSection("accommodation")}>Accommodation</span>
        </li>
        <li>
          <NavLink to="/cultural" className="nav-item" style={{ textDecoration: 'none', color: 'inherit' }} onClick={() => setIsMenuOpen(false)}>
            Cultural
          </NavLink>
        </li>
        <li>
          <span onClick={() => scrollToSection("gallery")}>Gallery</span>
        </li>
        <li>
          <span onClick={() => scrollToSection("team")}>Team</span>
        </li>

        <li>
          <span onClick={() => scrollToSection("sponsors")}>Sponsors</span>
        </li>
        <li>
          <NavLink to="/cosmos" className="nav-item" style={{ textDecoration: 'none', color: 'inherit' }} onClick={() => setIsMenuOpen(false)}>
            Cosmos 🚀
          </NavLink>
        </li>
        <li>
          <NavLink to="/notes" className="nav-item" style={{ textDecoration: 'none', color: 'inherit' }} onClick={() => setIsMenuOpen(false)}>
            Notes
          </NavLink>
        </li>
      </ul>

      {/* 🚀 FAR RIGHT: ACTION HUBS */}
      <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <a
          href="https://ecellssgmce.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="navbar-ecell-btn"
          style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', gap: '8px' }}
        >
          <img src={ecellLogo} alt="E-Cell Logo" style={{ height: '35px', width: 'auto' }} />
          <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px', whiteSpace: 'nowrap' }}>E-Cell Website</span>
        </a>
        <a
          href="https://drive.google.com/file/d/1Xy_Jz-NlAByWw2A-z3rW4e8BvQ_rU7yJ/view?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
          className="navbar-brochure-btn"
        >
          <span>Brochure</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
        </a>
      </div>

      {/* Hamburger Icon */}
      <div className="menu-icon" onClick={toggleMenu}>
        {isMenuOpen ? <FaTimes /> : <FaBars />}
      </div>
    </nav>
  );
};

export default Navbar;
