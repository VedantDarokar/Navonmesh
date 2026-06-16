import React from 'react';
import '../Styles/winnersSection.css';

import w1 from '../assets/winners/winner_1.jpg';
import w2 from '../assets/winners/winner_2.jpg';
import w3 from '../assets/winners/winner_3.jpg';
import w4 from '../assets/winners/winner_4.jpg';
import w5 from '../assets/winners/winner_5.jpg';
import w6 from '../assets/winners/winner_6.jpg';
import w7 from '../assets/winners/winner_7.jpg';
import w8 from '../assets/winners/winner_8.jpg';
import w9 from '../assets/winners/winner_9.jpg';
import w10 from '../assets/winners/winner_10.jpg';
import w11 from '../assets/winners/winner_11.jpg';

const WinnersSection = () => {
    const winners = [
        { img: w1, title: "Grand Champions", category: "Srijan Hackathon" },
        { img: w2, title: "1st Runner Ups", category: "Srijan Hackathon" },
        { img: w3, title: "2nd Runner Ups", category: "Srijan Hackathon" },
        { img: w4, title: "Winners", category: "Ankur Project Expo" },
        { img: w5, title: "Runner Ups", category: "Ankur Project Expo" },
        { img: w6, title: "Best Innovator", category: "Ankur Project Expo" },
        { img: w7, title: "Winners", category: "Udbhav Conference" },
        { img: w8, title: "Runner Ups", category: "Udbhav Conference" },
        { img: w9, title: "Winners", category: "Pursuit" },
        { img: w10, title: "Runner Ups", category: "Pursuit" },
        { img: w11, title: "Special Recognition", category: "Navonmesh '26" }
    ];

    return (
        <section className="winners-section" id="winners">
            <div className="section-header-container">
                <div className="section-header-line left-line"></div>
                <h2 className="section-main-title">
                    <span className="title-letter">W</span>
                    <span className="title-letter">I</span>
                    <span className="title-letter">N</span>
                    <span className="title-letter">N</span>
                    <span className="title-letter">E</span>
                    <span className="title-letter">R</span>
                    <span className="title-letter">S</span>
                    <span className="title-letter">&nbsp;</span>
                    <span className="title-letter">&amp;</span>
                    <span className="title-letter">&nbsp;</span>
                    <span className="title-letter">R</span>
                    <span className="title-letter">U</span>
                    <span className="title-letter">N</span>
                    <span className="title-letter">N</span>
                    <span className="title-letter">E</span>
                    <span className="title-letter">R</span>
                    <span className="title-letter">&nbsp;</span>
                    <span className="title-letter">U</span>
                    <span className="title-letter">P</span>
                    <span className="title-letter">S</span>
                </h2>
                <div className="section-header-line right-line"></div>
            </div>

            <p className="winners-subtitle">Celebrating the pioneers of technology, leadership, and innovation</p>

            <div className="winners-grid">
                {winners.map((winner, idx) => (
                    <div className="winner-card" key={`winner-${idx}`}>
                        <div className="winner-card-inner">
                            <div className="winner-img-container">
                                <img src={winner.img} alt={`Winner & Runner Up ${idx + 1}`} />
                                <div className="winner-img-glow"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default WinnersSection;
