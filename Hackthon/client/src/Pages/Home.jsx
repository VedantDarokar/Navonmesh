import React, { useEffect, useState } from "react";
import "../Styles/hero.css";
import PursuitName from "../assets/namonvesh-logo.png";
import RocketImg from "../assets/rocket.png";
import StatsStrip from "../Components/StatsStrip";
import SciFiGlobe from "../Components/SciFiGlobe";
import EventShowcase from "../Components/EventShowcase";
import CountdownTimer from "../Components/CountdownTimer";

/* Imported Pages for Single Page Scroll */
import Hackathon from "./Hackathon";
import ProjectExpo from "./ProjectExpo";
import Conference from "./Conference";
import Team from "./Team";
import Gallery from "./Gallery";
import Accommodation from "./Accommodation";

import ProblemStatements from "../Components/ProblemStatements";
import CampusMap from "../Components/CampusMap";
import Podcast from "../Components/Podcast";
import WinnersSection from "../Components/WinnersSection";
import HighlightsSection from "../Components/HighlightsSection";

const Home = () => {
  /* Rocket Launch Logic */
  const [flyAway, setFlyAway] = useState(false);

  useEffect(() => {
    const targetDate = new Date("March 23, 2026 00:00:00").getTime();
    const celebrationEndTest = Date.now() + 5000;
    
    const checkStatus = () => {
      const now = new Date().getTime();
      if (window.scrollY > 50 || now >= targetDate || now < celebrationEndTest) {
        setFlyAway(true);
      } else {
        setFlyAway(false);
      }
    };

    window.addEventListener("scroll", checkStatus);
    const timer = setInterval(checkStatus, 1000); 

    checkStatus(); 

    return () => {
      window.removeEventListener("scroll", checkStatus);
      clearInterval(timer);
    };
  }, []);

  return (
    <>
      <section className="hero" id="home">
        {/* Center Content */}
        <div className="hero-center">
          <p className="hero-subtitle">
            SSGMCE &nbsp;&nbsp;Presents
          </p>

          <img src={PursuitName} alt="Pursuit 2026" className="pursuit-name" />
          <h2 className="marathi-tagline">ज्ञानातून नवोन्मेष, नवोन्मेषातून विकास</h2>
        </div>

        {/* Custom 3D Globe Animation */}
        <div className="spline-container">
          <SciFiGlobe />
        </div>

        <h2 className="hero-tagline particle-text">
          “Ideate. Innovate. Inspire.”
        </h2>

        {/* Countdown Timer */}
        <CountdownTimer />

        {/* Rocket Image */}
        <img
          src={RocketImg}
          alt="Rocket"
          className={`rocket ${flyAway ? "fly-away" : ""}`}
        />
        {/* Smoke Effect */}
        <div className={`rocket-smoke ${flyAway ? "active" : ""}`}></div>
      </section>

      <StatsStrip />

      {/* Events Showcase (Intro to Events) */}
      <div style={{ paddingTop: "60px", paddingBottom: "50px" }} id="events-showcase">
        <div className="section-header-container">
          <div className="section-header-line left-line"></div>
          <h2 className="section-main-title">
            <span className="title-letter">E</span>
            <span className="title-letter">V</span>
            <span className="title-letter">E</span>
            <span className="title-letter">N</span>
            <span className="title-letter">T</span>
            <span className="title-letter">S</span>
          </h2>
          <div className="section-header-line right-line"></div>
        </div>
        <EventShowcase />
      </div>

      {/* ------------------- STACKED SECTIONS ------------------- */}

      {/* Campus Map */}
      <section id="campus-map">
        <CampusMap />
      </section>

      {/* Accommodation */}
      <section id="accommodation">
        <Accommodation />
      </section>

      {/* Podcast Window */}
      <Podcast />

      {/* Gallery */}
      <section id="gallery">
        <Gallery />
      </section>

      {/* Highlights */}
      <HighlightsSection />

      {/* Winners */}
      <WinnersSection />

      {/* Team */}
      <section id="team">
        <Team />
      </section>
    </>
  );
};

export default Home;
