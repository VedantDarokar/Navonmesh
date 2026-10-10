import React from "react";
import "../Styles/hero.css";
import EventShowcase from "../Components/EventShowcase";

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

import YuganantarScrollExperience from "../Components/YuganantarScrollExperience";

const Home = () => {
  return (
    <>
      <div id="home">
        <YuganantarScrollExperience />
      </div>

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
