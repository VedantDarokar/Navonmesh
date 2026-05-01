import "../Styles/footer.css";
import { Link } from "react-router-dom";
import { FaInstagram, FaLinkedin, FaYoutube, FaWhatsapp, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";
import namonveshLogo from "../assets/namonvesh-logo.png";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="footer-container">
      <div className="footer-glow"></div>
      <div className="footer-content">
        <div className="footer-grid">
          {/* Brand Section */}
          <div className="footer-section brand-info">
            <div className="footer-logo" onClick={scrollToTop}>
              <img src={namonveshLogo} alt="Navonmesh Logo" />
              <h3>NAVONMESH '26</h3>
            </div>
            <p className="brand-motto">
              Exploring the frontiers of technology and innovation. Join us on a cosmic journey of discovery.
            </p>
            <div className="footer-socials">
              <a href="https://instagram.com" target="_blank" rel="noreferrer"><FaInstagram /></a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer"><FaLinkedin /></a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer"><FaYoutube /></a>
              <a href="https://whatsapp.com" target="_blank" rel="noreferrer"><FaWhatsapp /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4 className="footer-heading">Navigation</h4>
            <ul className="footer-links">
              <li><Link to="/" onClick={scrollToTop}>Home</Link></li>
              <li><Link to="/cosmos" onClick={scrollToTop}>Cosmos</Link></li>
              <li><Link to="/accommodation" onClick={scrollToTop}>Accommodation</Link></li>
              <li><Link to="/cultural" onClick={scrollToTop}>Cultural</Link></li>
              <li><Link to="/gallery" onClick={scrollToTop}>Gallery</Link></li>
              <li><Link to="/management" style={{ textDecoration: "underline double" }} onClick={scrollToTop}>Management Analysis</Link></li>
            </ul>
          </div>

          {/* Events Section */}
          <div className="footer-section">
            <h4 className="footer-heading">Mega Events</h4>
            <ul className="footer-links">
              <li><Link to="/hackathon" onClick={scrollToTop}>Srijan (Hackathon)</Link></li>
              <li><Link to="/projectexpo" onClick={scrollToTop}>Ankur (Project Expo)</Link></li>
              <li><Link to="/conference" onClick={scrollToTop}>Udbhav (Conference)</Link></li>
              <li><Link to="/pursuit" onClick={scrollToTop}>Pursuit</Link></li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="footer-section contact-info">
            <h4 className="footer-heading">Reach Us</h4>
            <ul className="contact-list">
              <li>
                <FaMapMarkerAlt className="c-icon" />
                <span>SSGMCE, Shegaon, MH, MH 444203</span>
              </li>
              <li>
                <FaEnvelope className="c-icon" />
                <a href="mailto:navonmesh@ssgmce.ac.in">navonmesh@ssgmce.ac.in</a>
              </li>
              <li>
                <FaPhoneAlt className="c-icon" />
                <div className="contact-person">
                  <span>Nihal Kankal: </span>
                  <a href="tel:+918766417815">+91 8766417815</a>
                </div>
              </li>
              <li>
                <FaPhoneAlt className="c-icon" />
                <div className="contact-person">
                  <span>Vedant Darokar: </span>
                  <a href="tel:+918208772402">+91 8208772402</a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="divider"></div>
          <div className="bottom-wrapper">
            <p className="copyright">
              © 2026 NAVONMESH. Developed by <a href="#" className="dev-credit">Nihal Kankal</a>.
            </p>
            <div className="legal-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
