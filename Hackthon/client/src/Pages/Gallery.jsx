import React, { useState, useEffect, useRef } from 'react';
import '../Styles/gallery.css';
import gallery1 from '../assets/gallery/gallery_inovo_1.jpg';
import gallery2 from '../assets/gallery/gallery_inovo_2.jpg';
import gallery3 from '../assets/gallery/gallery_inovo_3.jpg';
import gallery4 from '../assets/gallery/gallery_inovo_4.jpg';
import gallery5 from '../assets/gallery/gallery_inovo_5.jpg';
import gallery6 from '../assets/gallery/gallery_inovo_6.jpg';
import gallery7 from '../assets/gallery/gallery_inovo_7.jpg';
import gallery8 from '../assets/gallery/gallery_inovo_8.jpg';
import gallery9 from '../assets/gallery/gallery_inovo_9.jpg';
import gallery10 from '../assets/gallery/gallery_inovo_10.jpg';
import gallery11 from '../assets/gallery/gallery_inovo_11.jpg';
import gallery12 from '../assets/gallery/gallery_inovo_12.jpg';
import gallery13 from '../assets/gallery/gallery_inovo_13.jpg';
import gallery14 from '../assets/gallery/gallery_inovo_14.jpg';
import gallery15 from '../assets/gallery/gallery_inovo_15.jpg';
import gallery16 from '../assets/gallery/gallery_inovo_16.jpg';
import gallery17 from '../assets/gallery/gallery_inovo_17.jpg';
import gallery18 from '../assets/gallery/gallery_inovo_18.jpg';
import gallery19 from '../assets/gallery/gallery_inovo_19.jpg';
import gallery20 from '../assets/gallery/gallery_inovo_20.jpg';
import gallery21 from '../assets/gallery/gallery_inovo_21.jpg';
import gallery22 from '../assets/gallery/gallery_inovo_22.jpg';
import gallery23 from '../assets/gallery/gallery_inovo_23.jpg';
import gallery24 from '../assets/gallery/gallery_inovo_24.jpg';
import gallery25 from '../assets/gallery/gallery_inovo_25.jpg';
import { FaPlay } from 'react-icons/fa';

const Gallery = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [videoEnded, setVideoEnded] = useState(false);
    const galleryRef = useRef(null);
    const playerRef = useRef(null);

    // New optimized gallery images for background scrolling
    const images = [
        gallery1, gallery2, gallery3, gallery4, gallery5,
        gallery6, gallery7, gallery8, gallery9, gallery10,
        gallery11, gallery12, gallery13, gallery14, gallery15,
        gallery16, gallery17, gallery18, gallery19, gallery20,
        gallery21, gallery22, gallery23, gallery24, gallery25
    ];

    // Intersection Observer to detect when gallery is in view
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.3 } // Play when 30% of gallery is visible
        );

        if (galleryRef.current) {
            observer.observe(galleryRef.current);
        }

        return () => {
            if (galleryRef.current) {
                observer.unobserve(galleryRef.current);
            }
        };
    }, []);

    // YouTube IFrame API initialization
    useEffect(() => {
        // Load the API script if not already loaded
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        window.onYouTubeIframeAPIReady = () => {
            createPlayer();
        };

        const createPlayer = () => {
            playerRef.current = new window.YT.Player('gallery-video', {
                events: {
                    'onStateChange': onPlayerStateChange
                }
            });
        };

        const onPlayerStateChange = (event) => {
            // YT.PlayerState.ENDED is 0
            if (event.data === 0) {
                setVideoEnded(true);
            }
        };

        // If API is already loaded, initialize immediately
        if (window.YT && window.YT.Player) {
            createPlayer();
        }
    }, [isVisible]);

    const handlePlayAgain = () => {
        setVideoEnded(false);
        if (playerRef.current && playerRef.current.playVideo) {
            playerRef.current.playVideo();
        }
    };

    // Create unique shuffled orders for each row
    const row1Images = [...images, ...images];
    const row2Images = [...images.slice().reverse(), ...images.slice().reverse()];
    
    // Shuffled version of all 25 images
    const shuffled = [
        gallery12, gallery3, gallery25, gallery7, gallery19,
        gallery2, gallery14, gallery8, gallery21, gallery5,
        gallery17, gallery9, gallery23, gallery11, gallery4,
        gallery16, gallery1, gallery20, gallery13, gallery6,
        gallery18, gallery10, gallery24, gallery15, gallery22
    ];
    const row3Images = [...shuffled, ...shuffled];

    // Video Sources
    // rel=0 stops related videos from other channels (mostly)
    // enablejsapi=1 is required for the YouTube API to control the iframe
    const baseVideoUrl = "https://www.youtube.com/embed/7pBTM8srB-I?rel=0&enablejsapi=1";
    const autoPlayUrl = `${baseVideoUrl}&autoplay=1&mute=1`;

    return (
        <div className="gallery-page" ref={galleryRef}>
            <h1 className="gallery-title">Gallery</h1>

            {/* Row 1 */}
            <div className="gallery-row">
                <div className="marquee-layer">
                    <div className="marquee-track">
                        {row1Images.map((src, index) => (
                            <div className="marquee-item" key={`r1-${index}`}>
                                <img src={src} alt="Gallery Item" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Row 2: Center Overlay */}
            <div className="gallery-row">
                <div className="marquee-layer">
                    <div className="marquee-track reverse">
                        {row2Images.map((src, index) => (
                            <div className="marquee-item" key={`r2-${index}`}>
                                <img src={src} alt="Gallery Item" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stable Overlay - Center */}
                <div className="video-overlay overlay-center">
                    <div className="overlay-video-container">
                        <iframe
                            id="gallery-video"
                            src={isVisible ? autoPlayUrl : baseVideoUrl}
                            title="Gallery Feature Video"
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                        ></iframe>

                        {/* End Screen Overlay */}
                        {videoEnded && (
                            <div className="video-end-screen">
                                <div className="end-screen-content">
                                    <h3>Thank you for watching!</h3>
                                    <button className="play-again-btn" onClick={handlePlayAgain}>
                                        <FaPlay /> Play Again
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Row 3 */}
            <div className="gallery-row">
                <div className="marquee-layer">
                    <div className="marquee-track">
                        {row3Images.map((src, index) => (
                            <div className="marquee-item" key={`r3-${index}`}>
                                <img src={src} alt="Gallery Item" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Gallery;
