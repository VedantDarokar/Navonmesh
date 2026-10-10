import React, { useEffect, useState } from 'react';
import '../Styles/preloader.css';
import ufoImg from '../assets/ufo_loader.png'; // UFO Image
import bgImg from '../assets/bg.jpeg'; // Website Background
import logoImg from '../assets/namonvesh-logo.png';

const Preloader = ({ onLoaded }) => {
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Minimum time to show loader
        const timer = setTimeout(() => {
            setFadeOut(true);
            setTimeout(() => {
                if (onLoaded) onLoaded();
            }, 800);
        }, 2500);

        return () => clearTimeout(timer);
    }, []);

    if (fadeOut && !onLoaded) return null;

    return (
        <div
            className={`preloader-container ${fadeOut ? 'fade-out' : ''}`}
            style={{
                backgroundImage: `url(${bgImg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            {/* Dark Overlay for contrast */}
            <div className="preloader-overlay"></div>

            <div className="loader-content">
                {/* Orbital Spinner */}
                <div className="orbital-system">
                    <div className="orbit orbit-1"></div>
                    <div className="orbit orbit-2"></div>
                    <div className="planet">
                        <img src={logoImg} alt="Logo" className="pulse-logo" />
                    </div>
                    {/* UFO orbiting */}
                    <div className="rocket-orbit">
                        <img src={ufoImg} alt="UFO" className="ufo-loader" />
                    </div>
                </div>

                <h2 className="loading-text">Launching into the Cosmos...</h2>
                <div className="loading-bar">
                    <div className="loading-progress"></div>
                </div>
            </div>
        </div>
    );
};

export default Preloader;
