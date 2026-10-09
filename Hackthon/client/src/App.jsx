import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import MainLayout from "./Layout/MainLayout";
import Preloader from "./Components/Preloader";
import PopupPoster from "./Components/PopupPoster";

// Website Pages
import Home from "./Pages/Home";
import Hackathon from "./Pages/Hackathon";
import Gallery from "./Pages/Gallery";
import ProjectExpo from "./Pages/ProjectExpo";
import Register from "./Pages/Register";
import ProblemStatement from "./Pages/ProblemStatement";
import Team from "./Pages/Team";
import Management from "./Pages/Management";
import Conference from "./Pages/Conference";
import Accommodation from "./Pages/Accommodation";
import EventJourney from "./Pages/EventJourney";
import CulturalRegister from "./Pages/CulturalRegister";
import Cultural from "./Pages/Cultural";
import Pursuit from "./Pages/Pursuit";
import JoinUs from "./Pages/JoinUs";
import ScrollToTop from "./Components/ScrollToTop";
import SupportQR from "./Pages/SupportQR";
import TeamPass from "./Pages/TeamPass";
import TeamLogin from "./Pages/TeamLogin";
import TeamDashboard from "./Pages/TeamDashboard";

// Dedicated Coordinator Mobile App (Security Hardened & Multi-Theme)
import CoordinatorApp from "./Pages/CoordinatorApp";
import Admin from "./Pages/Admin";
import FoodScannerPage from "./Pages/FoodScannerPage";
import BreakTimer from "./Pages/BreakTimer";
import EventDayAdmin from "./Pages/EventDayAdmin";
import AdminMaintenance from "./Pages/AdminMaintenance";

// Security Protected Guard: Block unauthorized access without valid session token
const ProtectedDutyRoute = ({ children }) => {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('adminToken') : null;
  if (!token) {
    return <Navigate to="/coordinator" replace />;
  }
  return children;
};

function App() {
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);

  // Detect whether running inside the Capacitor Android APK or in Coordinator App mode
  const [isAppMode, setIsAppMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isCapacitorNative = Boolean(window.Capacitor?.isNativePlatform?.());
    const isAppHash = window.location.hash.startsWith('#/coordinator') || window.location.hash.startsWith('#/app');
    return isCapacitorNative || isAppHash;
  });

  const handleLoaded = () => {
    setLoading(false);
  };

  useEffect(() => {
    if (!loading && !isAppMode) {
      setShowPopup(true);
    }
  }, [loading, isAppMode]);

  // Listen for hash changes if user navigates between web and coordinator portal
  useEffect(() => {
    const handleHashChange = () => {
      const isCapacitorNative = Boolean(window.Capacitor?.isNativePlatform?.());
      const isAppHash = window.location.hash.startsWith('#/coordinator') || window.location.hash.startsWith('#/app');
      setIsAppMode(isCapacitorNative || isAppHash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  // If in Native Android APK Mode: serve the Coordinator App exclusively
  if (isAppMode) {
    return (
      <HashRouter>
        <ScrollToTop />
        <CoordinatorApp />
      </HashRouter>
    );
  }

  // Otherwise: serve the full, untouched official Navonmesh Website
  return (
    <>
      {loading && <Preloader onLoaded={handleLoaded} />}
      {showPopup && <PopupPoster onClose={handleClosePopup} />}
      <HashRouter>
        <ScrollToTop />
        <div style={{ display: loading ? 'none' : 'block' }}>
          <Routes>
            {/* PUBLIC WEBSITE (WITH Navbar, Video Background, Footer) */}
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
              <Route path="/join" element={<JoinUs />} />
            </Route>

            {/* Public Standalone Pages */}
            <Route path="/register" element={<Register />} />
            <Route path="/cultural-register" element={<CulturalRegister />} />
            <Route path="/team-pass" element={<TeamPass />} />
            <Route path="/meal-pass" element={<TeamPass />} />
            <Route path="/team-login" element={<TeamLogin />} />
            <Route path="/team/login" element={<TeamLogin />} />
            <Route path="/team-dashboard" element={<TeamDashboard />} />
            <Route path="/team/dashboard" element={<TeamDashboard />} />
            <Route path="/support" element={<SupportQR />} />

            {/* Coordinator Portal Entry */}
            <Route path="/coordinator" element={<CoordinatorApp />} />
            <Route path="/app" element={<CoordinatorApp />} />

            {/* Protected Duty Routes (Redirects to /coordinator if not logged in) */}
            <Route path="/admin" element={<Admin />} />
            <Route path="/food-scanner" element={
              <ProtectedDutyRoute>
                <FoodScannerPage />
              </ProtectedDutyRoute>
            } />
            <Route path="/admin/qr-scanner" element={
              <ProtectedDutyRoute>
                <FoodScannerPage />
              </ProtectedDutyRoute>
            } />
            <Route path="/admin/break-timer" element={
              <ProtectedDutyRoute>
                <BreakTimer />
              </ProtectedDutyRoute>
            } />
            <Route path="/admin/event-day" element={
              <ProtectedDutyRoute>
                <EventDayAdmin />
              </ProtectedDutyRoute>
            } />
            <Route path="/admin/maintenance" element={
              <ProtectedDutyRoute>
                <AdminMaintenance />
              </ProtectedDutyRoute>
            } />
          </Routes>
        </div>
      </HashRouter>
    </>
  );
}

export default App;
