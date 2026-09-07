import React from 'react';
import '../Styles/popupPoster.css';
import { IoClose } from 'react-icons/io5';
import { FaArrowRight } from 'react-icons/fa';
import recruitmentPoster from '../assets/popup/recruitment_poster.jpg';
import popupBg from '../assets/popup/popup_bg.jpg';

// Import winner images
import winner1 from '../assets/winners/winner_1.jpg';
import winner2 from '../assets/winners/winner_2.jpg';
import winner3 from '../assets/winners/winner_3.jpg';
import winner4 from '../assets/winners/winner_4.jpg';
import winner5 from '../assets/winners/winner_5.jpg';
import winner6 from '../assets/winners/winner_6.jpg';
import winner7 from '../assets/winners/winner_7.jpg';
import winner8 from '../assets/winners/winner_8.jpg';
import winner9 from '../assets/winners/winner_9.jpg';
import winner10 from '../assets/winners/winner_10.jpg';
import winner11 from '../assets/winners/winner_11.jpg';

// Recruitment poster is active until end of September 12, 2026 (12/09/2026 23:59:59)
const POSTER_EXPIRY_DATE = new Date(2026, 8, 12, 23, 59, 59);

const PopupPoster = ({ onClose }) => {
    // Check if current date is within the recruitment period (till 12/09/2026)
    const isRecruitmentActive = new Date() <= POSTER_EXPIRY_DATE;

    const handleApply = () => {
        onClose();
        window.location.hash = '#/join';
    };

    const winners = [
        winner1, winner2, winner3, winner4, winner5,
        winner6, winner7, winner8, winner9, winner10, winner11
    ];

    // Double the winners array for seamless marquee scroll
    const scrollingWinners = [...winners, ...winners];

    const handleExplore = () => {
        onClose();
        setTimeout(() => {
            const element = document.getElementById("highlights");
            if (element) {
                element.scrollIntoView({ behavior: "smooth" });
            }
        }, 150);
    };

    // If within recruitment period (till 12/09/2026), show the uploaded recruitment poster
    if (isRecruitmentActive) {
        return (
            <div className="popup-overlay" onClick={onClose}>
                <div className="popup-poster-card" onClick={(e) => e.stopPropagation()}>
                    {/* Close Button */}
                    <button className="popup-poster-close-btn" onClick={onClose} aria-label="Close Popup">
                        <IoClose />
                    </button>

                    {/* Recruitment Poster Image (Clicking navigates to recruitment registration) */}
                    <div className="popup-poster-img-wrapper" onClick={handleApply} title="Click to Register for Recruitment">
                        <img 
                            src={recruitmentPoster} 
                            alt="Navonmesh'27 Recruitment Poster" 
                            className="popup-poster-img" 
                        />
                    </div>

                    {/* Action Bar */}
                    <div className="popup-poster-action-bar">
                        <button className="popup-poster-cta-btn" onClick={handleApply}>
                            <span>Register for Recruitment</span>
                            <FaArrowRight />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // After 12/09/2026, reverts back to original highlights popup
    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup-container" onClick={(e) => e.stopPropagation()}>
                {/* Close Button */}
                <button className="popup-close-btn" onClick={onClose} aria-label="Close Popup">
                    <IoClose />
                </button>

                <div className="popup-body">
                    {/* The Background Blended Image Container */}
                    <div className="popup-bg-image-wrapper">
                        {/* Layer 1: Fully Grayscale */}
                        <img src={popupBg} alt="Popup Grayscale Background" className="popup-bg-img img-bw" />
                        
                        {/* Layer 2: Colorful with moving gradient mask */}
                        <img src={popupBg} alt="Popup Color Background" className="popup-bg-img img-color" />
                        
                        {/* Text Overlay on top of background */}
                        <div className="popup-text-overlay">
                            <h1 className="popup-title">EXPLORE THE HIGHLIGHTS</h1>
                            <p className="popup-subtitle">Relive the extraordinary moments of innovation & glory</p>
                            <button className="popup-explore-btn" onClick={handleExplore}>
                                Explore Now
                            </button>
                        </div>
                    </div>

                    {/* Winners Scrolling Marquee Row */}
                    <div className="popup-winners-section">
                        <h3 className="popup-winners-title">OUR CHAMPIONS</h3>
                        <div className="popup-winners-marquee">
                            <div className="popup-winners-track">
                                {scrollingWinners.map((imgSrc, idx) => (
                                    <div className="popup-winner-card" key={`p-winner-${idx}`}>
                                        <img src={imgSrc} alt={`Winner ${idx + 1}`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PopupPoster;
