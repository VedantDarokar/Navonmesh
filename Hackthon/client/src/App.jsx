import { HashRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react"; // Added hook imports

import MainLayout from "./Layout/MainLayout";
import Preloader from "./Components/Preloader"; // Import Preloader
import PopupPoster from "./Components/PopupPoster"; // Import PopupPoster

import Home from "./Pages/Home";
import Hackathon from "./Pages/Hackathon";
import Gallery from "./Pages/Gallery";
import ProjectExpo from "./Pages/ProjectExpo";
// ... imports
import Register from "./Pages/Register";
import ProblemStatement from "./Pages/ProblemStatement";
import Team from "./Pages/Team";
import Management from "./Pages/Management";
import Conference from "./Pages/Conference";
import Accommodation from "./Pages/Accommodation";
import EventJourney from "./Pages/EventJourney";
import CulturalRegister from "./Pages/CulturalRegister";
import Cultural from "./Pages/Cultural";
import Cosmos from "./Pages/Cosmos";
import Pursuit from "./Pages/Pursuit";
import ScrollToTop from "./Components/ScrollToTop";
import Admin from "./Pages/Admin";
import Notes from "./Pages/Notes";
import SupportQR from "./Pages/SupportQR";
import AdminMaintenance from "./Pages/AdminMaintenance";
import EventDayAdmin from "./Pages/EventDayAdmin";
import BreakTimer from "./Pages/BreakTimer"; // Import BreakTimer

function App() {

  const [loading, setLoading] = useState(true);

  const handleLoaded = () => {
    setLoading(false);
  };

  return (
    <>
      {loading && <Preloader onLoaded={handleLoaded} />}
      <HashRouter>
        <ScrollToTop />
        <div style={{ display: loading ? 'none' : 'block' }}> {/* Hide app content while loading to prevent flash */}
          <Routes>
            {/* Pages WITH Navbar, Sidebar, Footer */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/hackathon" element={<Hackathon />} />
              <Route path="/problem-statement" element={<ProblemStatement />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/projectexpo" element={<ProjectExpo />} />
              <Route path="/conference" element={<Conference />} />
              <Route path="/pursuit" element={<Pursuit />} />
              <Route path="/accommodation" element={<Accommodation />} />
              <Route path="/team" element={<Team />} />
              <Route path="/management" element={<Management />} />
              <Route path="/event-journey" element={<EventJourney />} />
              <Route path="/cultural" element={<Cultural />} />
              <Route path="/cosmos" element={<Cosmos />} />
              <Route path="/notes" element={<Notes />} />
            </Route>

            {/* Pages WITHOUT Navbar / Sidebar / Footer */}
            <Route path="/register" element={<Register />} />
            <Route path="/cultural-register" element={<CulturalRegister />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/support" element={<SupportQR />} />
            <Route path="/admin/maintenance" element={<AdminMaintenance />} />
            <Route path="/admin/event-day" element={<EventDayAdmin />} />
            <Route path="/admin/break-timer" element={<BreakTimer />} />
          </Routes>

        </div>
      </HashRouter>
    </>
  );
}

export default App;
