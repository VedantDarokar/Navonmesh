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
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
                height: '100dvh',
                zIndex: 999999,
                backgroundColor: isLight ? '#f8fafc' : '#070b14',
                color: isLight ? '#0f172a' : '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px 16px',
                boxSizing: 'border-box',
                overflow: 'hidden'
            }}
        >
            <div 
                className="nav-splash-content" 
                style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    textAlign: 'center', 
                    width: '100%', 
                    maxWidth: '380px' 
                }}
            >
                {/* Official Logo Emblem Badge */}
                <div 
                    className="nav-splash-emblem-box"
                    style={{
                        width: '130px',
                        maxWidth: '130px',
                        height: '56px',
                        maxHeight: '56px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px 10px',
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                        flexShrink: 0,
                        background: isLight ? '#ffffff' : '#0f172a',
                        borderRadius: '14px',
                        boxShadow: isLight ? '0 4px 16px rgba(0,0,0,0.08)' : '0 0 20px rgba(251,191,36,0.18)',
                        border: isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.15)',
                        marginBottom: '16px'
                    }}
                >
                    <img 
                        src={activeLogo} 
                        alt="Navonmesh Official Emblem" 
                        className="nav-splash-emblem-img" 
                        style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            width: 'auto',
                            height: 'auto',
                            objectFit: 'contain',
                            display: 'block'
                        }}
                    />
                </div>

                {/* Bold Uppercase Wordmark with Black & Blue colors */}
                <div 
                    className="nav-splash-wordmark" 
                    style={{ 
                        display: 'flex', 
                        alignItems: 'baseline', 
                        justifyContent: 'center', 
                        margin: '0 0 8px 0', 
                        lineHeight: 1 
                    }}
                >
                    <h1 
                        className="nav-splash-title"
                        style={{
                            fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif",
                            fontSize: '38px',
                            fontWeight: 900,
                            letterSpacing: '2px',
                            margin: 0,
                            lineHeight: 1,
                            textTransform: 'uppercase'
                        }}
                    >
                        <span 
                            className="nav-splash-text-black" 
                            style={{ 
                                color: isLight ? '#0f172a' : '#ffffff', 
                                WebkitTextFillColor: isLight ? '#0f172a' : '#ffffff' 
                            }}
                        >
                            NAVON
                        </span>
                        <span 
                            className="nav-splash-text-blue" 
                            style={{ 
                                color: isLight ? '#0284c7' : '#38bdf8', 
                                WebkitTextFillColor: isLight ? '#0284c7' : '#38bdf8' 
                            }}
                        >
                            MESH
                        </span>
                    </h1>
                </div>

                {/* Tagline */}
                <p 
                    className="nav-splash-tagline"
                    style={{
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif",
                        fontSize: '16px',
                        fontWeight: 700,
                        letterSpacing: '-0.2px',
                        margin: '8px 0 0 0',
                        color: isLight ? '#334155' : '#cbd5e1',
                        textAlign: 'center'
                    }}
                >
                    Official Technical Fest App
                </p>

                {/* Thin Sleek Divider */}
                <div 
                    className="nav-splash-divider" 
                    style={{
                        width: '200px',
                        maxWidth: '60%',
                        height: '1px',
                        margin: '22px auto 16px auto',
                        background: isLight ? '#cbd5e1' : 'rgba(255,255,255,0.16)'
                    }}
                />

                {/* Sub-footer Attribution */}
                <p 
                    className="nav-splash-footer"
                    style={{
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif",
                        fontSize: '11px',
                        fontWeight: 800,
                        letterSpacing: '2.2px',
                        textTransform: 'uppercase',
                        margin: 0,
                        lineHeight: 1,
                        color: isLight ? '#1f2937' : '#94a3b8'
                    }}
                >
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
