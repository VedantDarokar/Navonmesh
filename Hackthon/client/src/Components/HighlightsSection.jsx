import React, { useState } from 'react';
import '../Styles/highlightsSection.css';
import { IoClose } from 'react-icons/io5';

// Import all 31 event highlight images
import h1 from '../assets/highlights/highlight_1.jpg';
import h2 from '../assets/highlights/highlight_2.jpg';
import h3 from '../assets/highlights/highlight_3.jpg';
import h4 from '../assets/highlights/highlight_4.jpg';
import h5 from '../assets/highlights/highlight_5.jpg';
import h6 from '../assets/highlights/highlight_6.jpg';
import h7 from '../assets/highlights/highlight_7.jpg';
import h8 from '../assets/highlights/highlight_8.jpg';
import h9 from '../assets/highlights/highlight_9.jpg';
import h10 from '../assets/highlights/highlight_10.jpg';
import h11 from '../assets/highlights/highlight_11.jpg';
import h12 from '../assets/highlights/highlight_12.jpg';
import h13 from '../assets/highlights/highlight_13.jpg';
import h14 from '../assets/highlights/highlight_14.jpg';
import h15 from '../assets/highlights/highlight_15.jpg';
import h16 from '../assets/highlights/highlight_16.jpg';
import h17 from '../assets/highlights/highlight_17.jpg';
import h18 from '../assets/highlights/highlight_18.jpg';
import h19 from '../assets/highlights/highlight_19.jpg';
import h20 from '../assets/highlights/highlight_20.jpg';
import h21 from '../assets/highlights/highlight_21.jpg';
import h22 from '../assets/highlights/highlight_22.jpg';
import h23 from '../assets/highlights/highlight_23.jpg';
import h24 from '../assets/highlights/highlight_24.jpg';
import h25 from '../assets/highlights/highlight_25.jpg';
import h26 from '../assets/highlights/highlight_26.jpg';
import h27 from '../assets/highlights/highlight_27.jpg';
import h28 from '../assets/highlights/highlight_28.jpg';
import h29 from '../assets/highlights/highlight_29.jpg';
import h30 from '../assets/highlights/highlight_30.jpg';
import h31 from '../assets/highlights/highlight_31.jpg';

const HighlightsSection = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [largeImageIdx, setLargeImageIdx] = useState(0);

    // Partition the 31 images into 4 rows
    const row1 = [h1, h2, h3, h4, h5, h6, h7, h8];
    const row2 = [h9, h10, h11, h12, h13, h14, h15, h16];
    const row3 = [h17, h18, h19, h20, h21, h22, h23, h24];
    const row4 = [h25, h26, h27, h28, h29, h30, h31];

    const speechImages = [h14, h12, h13];

    React.useEffect(() => {
        const interval = setInterval(() => {
            setLargeImageIdx(prev => (prev + 1) % speechImages.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [speechImages.length]);

    // Double lists to make loops seamless
    const row1Images = [...row1, ...row1];
    const row2Images = [...row2.slice().reverse(), ...row2.slice().reverse()];
    const row3Images = [...row3, ...row3];
    const row4Images = [...row4.slice().reverse(), ...row4.slice().reverse()];

    const handleImageClick = (src) => {
        setSelectedImage(src);
    };

    const handleCloseLightbox = () => {
        setSelectedImage(null);
    };

    return (
        <section className="highlights-section" id="highlights">
            <div className="section-header-container">
                <div className="section-header-line left-line"></div>
                <h2 className="section-main-title">
                    <span className="title-letter">H</span>
                    <span className="title-letter">I</span>
                    <span className="title-letter">G</span>
                    <span className="title-letter">H</span>
                    <span className="title-letter">L</span>
                    <span className="title-letter">I</span>
                    <span className="title-letter">G</span>
                    <span className="title-letter">H</span>
                    <span className="title-letter">T</span>
                    <span className="title-letter">S</span>
                </h2>
                <div className="section-header-line right-line"></div>
            </div>

            <p className="highlights-subtitle">Catch the dynamic moments, innovation sessions, and cultural events of Navonmesh '26</p>

            <div className="highlights-layout">
                {/* Left Side: Large Changing Image */}
                <div className="highlights-left">
                    <img 
                        src={speechImages[largeImageIdx]} 
                        alt="Featured Highlight" 
                        className="highlights-featured-img" 
                        onClick={() => handleImageClick(speechImages[largeImageIdx])}
                    />
                </div>

                {/* Right Side: Scrolling Marquees */}
                <div className="highlights-right">
                    <div className="highlights-marquee-container">
                        {/* Row 1 */}
                        <div className="highlights-row scroll-left">
                            <div className="highlights-track">
                                {row1Images.map((src, idx) => (
                                    <div className="highlight-item" key={`hl-r1-${idx}`} onClick={() => handleImageClick(src)}>
                                        <img src={src} alt="Event Moment" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Row 2 */}
                        <div className="highlights-row scroll-right staggered-1">
                            <div className="highlights-track">
                                {row2Images.map((src, idx) => (
                                    <div className="highlight-item" key={`hl-r2-${idx}`} onClick={() => handleImageClick(src)}>
                                        <img src={src} alt="Event Moment" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Row 3 */}
                        <div className="highlights-row scroll-left-slow staggered-2">
                            <div className="highlights-track">
                                {row3Images.map((src, idx) => (
                                    <div className="highlight-item" key={`hl-r3-${idx}`} onClick={() => handleImageClick(src)}>
                                        <img src={src} alt="Event Moment" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Row 4 */}
                        <div className="highlights-row scroll-right-slow staggered-3">
                            <div className="highlights-track">
                                {row4Images.map((src, idx) => (
                                    <div className="highlight-item" key={`hl-r4-${idx}`} onClick={() => handleImageClick(src)}>
                                        <img src={src} alt="Event Moment" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lightbox Modal overlay */}
            {selectedImage && (
                <div className="lightbox-overlay" onClick={handleCloseLightbox}>
                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <button className="lightbox-close-btn" onClick={handleCloseLightbox} aria-label="Close image">
                            <IoClose />
                        </button>
                        <img src={selectedImage} alt="Expanded Event Moment" className="lightbox-img" />
                    </div>
                </div>
            )}
        </section>
    );
};

export default HighlightsSection;
