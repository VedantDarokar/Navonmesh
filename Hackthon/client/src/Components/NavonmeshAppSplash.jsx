import React, { useState, useEffect } from 'react';
import '../Styles/navonmesh_splash.css';
import navonmeshBlackLogo from '../assets/navonmesh_black_logo.png';
import navonmeshDarkLogo from '../assets/navonmesh_official_logo.png';

/**
 * NavonmeshAppSplash - Blinkit-style immersive app opening screen
 * Features:
 * - Dynamic theme (Vibrant Golden Yellow in Light, Deep Cosmic in Dark)
 * - Prominent brand wordmark & official logo emblem
 * - Tagline "Official Technical Fest App" & Sub-footer "AN SSGMCE INITIATIVE"
 * - Micro progress line with tap-to-skip support
 */
const NavonmeshAppSplash = ({ theme = 'theme-light', onFinish, duration = 2200 }) => {
    const [isFading, setIsFading] = useState(false);
    const isLight = theme === 'theme-light';
    const activeLogo = isLight ? navonmeshBlackLogo : navonmeshDarkLogo;

    useEffect(() => {
        // Trigger fade out before complete exit
        const fadeTimer = setTimeout(() => {
            setIsFading(true);
        }, Math.max(1000, duration - 450));

        // Complete transition and notify parent
        const finishTimer = setTimeout(() => {
            if (onFinish) onFinish();
        }, duration);

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(finishTimer);
        };
    }, [duration, onFinish]);

    const handleSkip = () => {
        setIsFading(true);
        setTimeout(() => {
            if (onFinish) onFinish();
        }, 200);
    };

    return (
        <aside 
            className={`nav-splash-screen ${theme} ${isFading ? 'splash-fading' : ''}`}
            onClick={handleSkip}
            aria-label="Navonmesh App Splash Screen"
            role="status"
        >
            <div className="nav-splash-content">
                {/* Official Logo Emblem Badge */}
                <div className="nav-splash-emblem-box">
                    <img 
                        src={activeLogo} 
                        alt="Navonmesh Official Emblem" 
                        className="nav-splash-emblem-img" 
                    />
                </div>

                {/* Bold Uppercase Wordmark with Black & Blue colors */}
                <div className="nav-splash-wordmark">
                    <h1 className="nav-splash-title">
                        <span className="nav-splash-text-black">NAVON</span>
                        <span className="nav-splash-text-blue">MESH</span>
                    </h1>
                </div>

                {/* Tagline */}
                <p className="nav-splash-tagline">
                    Official Technical Fest App
                </p>

                {/* Thin Sleek Divider */}
                <div className="nav-splash-divider" />

                {/* Sub-footer Attribution */}
                <p className="nav-splash-footer">
                    AN SSGMCE INITIATIVE
                </p>
            </div>

            {/* Bottom Linear Progress Indicator */}
            <div className="nav-splash-bottom-bar">
                <div className="nav-splash-bottom-fill" />
            </div>
        </aside>
    );
};

export default NavonmeshAppSplash;
