import { useNavigate } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import "../Styles/eventShowcase.css";
import e1 from "../assets/events/e1.png";
import e2 from "../assets/events/e2.png";
import e3 from "../assets/events/udbhav_event_updated.png";
import e4 from "../assets/events/pursuit.png";

const events = [
  {
    title: "सृजन (HACKATHON)",
    text: "Srujan is a National Level Hackathon aimed at fostering creative problem-solving, innovation, and rapid prototyping among students. It provides a dynamic platform where young minds collaborate, ideate, and develop technology-driven solutions to real-world challenges.",
    image: e1,
    side: "left",
    id: "hackathon", // Use ID for scrolling
    registerParam: "srijan"
  },
  {
    title: "अंकुर (PROJECT COMPETITION)",
    text: "Ankur is a National Level Project Competition that showcases innovative student projects addressing societal, industrial, and technological needs. It acts as a bridge between academic learning and real-world application.",
    image: e2,
    side: "right",
    id: "projectexpo",
    registerParam: "ankur"
  },
  {
    title: "उद्‌भव (STUDENT CONFERENCE)",
    text: "Udbhav is a National Student Conference designed to cultivate research aptitude and academic excellence among students. It offers a formal platform for students to present research papers, case studies, and innovative concepts.",
    image: e3,
    side: "left",
    id: "conference",
    registerParam: "udbhav"
  },
  {
    title: "PURSUIT",
    text: "PURSUIT is the theme-based national level technical symposium. It is a grand stage where innovation meets competition, featuring various technical events and challenges.",
    image: e4,
    side: "right",
    id: "pursuit",
    registerParam: "pursuit"
  }
];

const EventShowcase = () => {
  const navigate = useNavigate();
  const [launchingId, setLaunchingId] = useState(null);

  const handleLaunch = (index, param) => {
    let targetPath = "";
    if (param === "pursuit") {
      targetPath = "/pursuit";
    } else if (param === "srijan") {
      targetPath = "/hackathon";
    } else if (param === "ankur") {
      targetPath = "/projectexpo";
    } else if (param === "udbhav") {
      targetPath = "/conference";
    }

    if (targetPath) {
      setLaunchingId(index);
      setTimeout(() => {
        navigate(targetPath);
        setLaunchingId(null);
      }, 800);
      return;
    }

    setLaunchingId(index);
    // Wait for animation to finish before navigating
    setTimeout(() => {
      navigate(`/register?event=${param}`);
      setLaunchingId(null); // Reset if they come back
    }, 800);
  };

  const itemRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
          } else {
            entry.target.classList.remove("in-view");
          }
        });
      },
      { threshold: 0.2 } // Trigger when 20% of the item is visible
    );

    itemRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const getEventPath = (param) => {
    if (param === "pursuit") return "/pursuit";
    if (param === "srijan") return "/hackathon";
    if (param === "ankur") return "/projectexpo";
    if (param === "udbhav") return "/conference";
    return `/register?event=${param}`;
  };

  return (
    <section className="event-showcase">
      {events.map((ev, i) => (
        <div
          key={i}
          className={`timeline-item ${ev.side}`}
          ref={(el) => (itemRefs.current[i] = el)}
        >
          {/* Image Column */}
          <div className="timeline-img-col">
            <div
              className="img-glow-container"
              onClick={() => navigate(getEventPath(ev.registerParam))}
              style={{ cursor: "pointer" }}
            >
              <img src={ev.image} alt={ev.title} />
            </div>
            <div className="event-title-group">
              <h3 className="event-main-title">
                {ev.title.includes('(') ? (
                  <>
                    <span className="hindi-title">{ev.title.split('(')[0]}</span>
                    <span className="english-title">({ev.title.split('(')[1]}</span>
                  </>
                ) : (
                  <span className="hindi-title">{ev.title}</span>
                )}
              </h3>

              {/* Rocket Register Button */}
              <div
                className={`register-rocket-btn ${launchingId === i ? "launching" : ""} ${(ev.registerParam === 'srijan' || ev.registerParam === 'udbhav') ? 'closed-btn' : ''}`}
                onClick={() => handleLaunch(i, ev.registerParam)}
              >
                <span className="reg-text">
                  {(ev.registerParam === 'srijan' || ev.registerParam === 'udbhav') ? 'Registrations Closed' : 'Register Now'}
                </span>
                <div className="reg-icon-circle">
                  {(ev.registerParam === 'srijan' || ev.registerParam === 'udbhav') ? (
                    <span className="closed-icon" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>!</span>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  )}
                </div>
                <div className="rocket-exhaust"></div>
              </div>

            </div>
          </div>

          {/* Divider Column (with line) */}
          <div className="timeline-divider">
            <div className="dot top-dot"></div>
            <div className="vertical-line"></div>
            <div className="dot bottom-dot"></div>
          </div>

          {/* Text Column */}
          <div className="timeline-text-col">
            <div className="event-glass-card">
              <p className="event-desc">{ev.text}</p>
            </div>

            {/* Scroll Indicator for next item - now inside text col */}
            {i < events.length - 1 && (
              <div className="scroll-next-indicator" onClick={() => {
                const nextItem = itemRefs.current[i + 1];
                if (nextItem) nextItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}>
                <span className="scroll-text">Scroll to next event</span>
                <div className="scroll-arrow-group">
                  <div className="scroll-arrow arrow-1"></div>
                  <div className="scroll-arrow arrow-2"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </section>
  );
};

export default EventShowcase;
