import React, { useState, useEffect } from 'react';
import '../Styles/notes.css';
import { FaBookReader, FaMicrochip, FaLaptopCode, FaDatabase, FaCogs, FaBolt, FaGraduationCap } from 'react-icons/fa';

const departments = [
  { id: 'ash', name: 'ASH Department', startSem: 1, endSem: 2, icon: <FaBookReader /> },
  { id: 'extc', name: 'EXTC', startSem: 3, endSem: 8, icon: <FaMicrochip /> },
  { id: 'cse', name: 'CSE', startSem: 3, endSem: 8, icon: <FaLaptopCode /> },
  { id: 'it', name: 'IT', startSem: 3, endSem: 8, icon: <FaDatabase /> },
  { id: 'mech', name: 'Mechanical', startSem: 3, endSem: 8, icon: <FaCogs /> },
  { id: 'elec', name: 'Electrical', startSem: 3, endSem: 8, icon: <FaBolt /> }
];

// Reusable component for both Notes and Papers sections
const DepartmentSection = ({ title, description, driveFolders, hasUnits = false, hasYears = false }) => {
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(1);
  const [selectedYear, setSelectedYear] = useState("2024-2025");
  
  const handleDeptClick = (dept) => {
    setSelectedDept(dept);
    setSelectedSemester(null);
    setSelectedUnit(1);
  };

  useEffect(() => {
    if (selectedDept?.id === 'ash' && selectedYear === "2024-2025") {
      setSelectedYear("2025-2026");
    }
  }, [selectedDept, selectedYear]);

  const handleBackToDepts = () => {
    setSelectedDept(null);
    setSelectedSemester(null);
    setSelectedUnit(1);
    };

  const handleBackToSems = () => {
    setSelectedSemester(null);
    setSelectedUnit(1);
    };

  const currentFolderId = hasUnits
    ? (() => {
        const unitData = driveFolders[selectedDept?.id]?.[selectedSemester]?.[`unit${selectedUnit}`];
        if (hasYears && typeof unitData === 'object' && unitData !== null) {
          return unitData[selectedYear];
        }
        return unitData;
      })()
    : driveFolders[selectedDept?.id]?.[selectedSemester];

  return (
    <div className="section-wrapper" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '60px' }}>
      <div className="notes-header" style={{ position: 'relative', zIndex: 2 }}>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      {!selectedDept ? (
        <div className="departments-grid" style={{ position: 'relative', zIndex: 2 }}>
          {departments.map((dept) => (
            <div key={dept.id} className="dept-card" onClick={() => handleDeptClick(dept)}>
              <div className="dept-icon-wrapper">{dept.icon}</div>
              <h3>{dept.name}</h3>
              <p className="dept-meta">Access academic resources</p>
            </div>
          ))}
        </div>
      ) : !selectedSemester ? (
        <div className="semesters-container" style={{ position: 'relative', zIndex: 2, width: '100%' }}>
          <div style={{ width: '100%', textAlign: 'left', marginBottom: '10px' }}>
            <button className="back-btn" onClick={handleBackToDepts} style={{ margin: 0 }}>
              ← Back to Departments
            </button>
          </div>
          <h2>{selectedDept.name} {selectedDept.id === 'ash' ? 'Groups' : 'Semesters'}</h2>
          <div className="semesters-grid">
            {Array.from({ length: selectedDept.endSem - selectedDept.startSem + 1 }, (_, i) => {
              const semNum = selectedDept.startSem + i;
              return (
                <div key={semNum} className="sem-card" onClick={() => setSelectedSemester(semNum)}>
                  <div className="dept-icon-wrapper"><FaGraduationCap /></div>
                  <h3>{selectedDept.id === 'ash' ? `Group ${semNum === 1 ? 'A' : 'B'}` : `Semester ${semNum}`}</h3>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="drive-container" style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '100%', textAlign: 'left', marginBottom: '25px', display: 'block' }}>
            <button className="back-btn" onClick={handleBackToSems} style={{ margin: 0 }}>
              ← Back to {selectedDept.id === 'ash' ? 'Groups' : 'Semesters'}
            </button>
          </div>
          <h2 style={{ fontSize: '2.2rem', marginTop: '10px', marginBottom: '10px', fontFamily: "'Times New Roman', serif", color: '#e2c073', textShadow: '0 0 15px rgba(226, 192, 115, 0.2)', textTransform: 'uppercase', textAlign: 'center', width: '100%', display: 'block' }}>
            {selectedDept.name} - {selectedDept.id === 'ash' ? `Group ${selectedSemester === 1 ? 'A' : 'B'}` : `Semester ${selectedSemester}`}
          </h2>

          {hasUnits && (
            <div className="unit-tabs-container" style={{ display: 'flex', gap: '20px', marginBottom: '20px', marginTop: '10px' }}>
              <button
                className={`unit-tab ${selectedUnit === 1 ? 'active' : ''}`}
                onClick={() => setSelectedUnit(1)}
              >
                Unit Test 1
              </button>
              <button
                className={`unit-tab ${selectedUnit === 2 ? 'active' : ''}`}
                onClick={() => setSelectedUnit(2)}
              >
                Unit Test 2
              </button>
            </div>
          )}

          {hasYears && hasUnits && (
            <div className="year-tabs-container" style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
              {(selectedDept?.id === 'ash' ? ["2025-2026"] : ["2024-2025", "2025-2026"]).map(year => (
                <button
                  key={year}
                  className={`year-tab ${selectedYear === year ? 'active' : ''}`}
                  onClick={() => setSelectedYear(year)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: selectedYear === year ? 'rgba(226, 192, 115, 0.2)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${selectedYear === year ? '#e2c073' : 'rgba(226, 192, 115, 0.2)'}`,
                    color: selectedYear === year ? '#e2c073' : '#b0b8c0',
                    cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: '500',
                    transition: 'all 0.3s'
                  }}
                >
                  {year}
                </button>
              ))}
            </div>
          )}

          <div className="iframe-wrapper" style={{ width: '100%', height: '600px', borderRadius: '16px', overflow: 'hidden', border: '4px solid #e2c073', boxShadow: '0 0 25px rgba(226, 192, 115, 0.6), inset 0 0 15px rgba(226, 192, 115, 0.3)', background: '#05060f', transition: 'all 0.3s ease' }}>
            {!currentFolderId || currentFolderId.startsWith("YOUR_") ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'linear-gradient(135deg, rgba(15, 20, 35, 0.95) 0%, rgba(5, 10, 15, 0.95) 100%)', color: '#fff', textAlign: 'center', padding: '40px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ padding: '30px', borderRadius: '50%', background: 'rgba(226, 192, 115, 0.05)', border: '1px solid rgba(226, 192, 115, 0.2)', marginBottom: '25px', boxShadow: '0 0 30px rgba(226, 192, 115, 0.1)', position: 'relative', zIndex: 2 }}>
                  <FaBookReader style={{ fontSize: '3.5rem', color: '#e2c073', filter: 'drop-shadow(0 0 10px rgba(226, 192, 115, 0.5))' }} />
                </div>
                <h3 style={{ color: '#e2c073', fontSize: '3rem', marginBottom: '15px', fontFamily: "'Times New Roman', serif", textTransform: 'uppercase', letterSpacing: '3px', textShadow: '0 0 15px rgba(226, 192, 115, 0.4)', position: 'relative', zIndex: 2 }}>Coming Soon</h3>
                <div style={{ width: '60px', height: '3px', background: '#e2c073', marginBottom: '20px', borderRadius: '2px', boxShadow: '0 0 10px rgba(226, 192, 115, 0.5)', position: 'relative', zIndex: 2 }}></div>
                <p style={{ fontSize: '1.3rem', color: '#b0b8c0', maxWidth: '450px', lineHeight: '1.6', fontWeight: '300', position: 'relative', zIndex: 2 }}>
                  We are currently preparing the study materials for this section. Please check back later!
                </p>
              </div>
            ) : (
              <iframe
                src={`https://drive.google.com/embeddedfolderview?id=${currentFolderId}#list`}
                width="100%"
                height="100%"
                frameBorder="0"
                title="Google Drive Folder"
                style={{ filter: 'invert(0.9) hue-rotate(180deg)' }}
              ></iframe>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const securityQuestions = [
  { question: "What is our college fest name?", answer: "culfest" },
  { question: "What is the 1st year boys hostel name?", answer: "sv" },
  { question: "Which city is our college located in?", answer: "shegaon" },
  { question: "What is the short name of our college?", answer: "ssgmce" },
  { question: "What is the name of our national level technical symposium?", answer: "navonmesh" }
];

const Notes = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [randomQuestion, setRandomQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * securityQuestions.length);
    setRandomQuestion(securityQuestions[randomIndex]);
  }, []);

  const handleVerify = (e) => {
    e.preventDefault();
    if (userAnswer.trim().toLowerCase() === randomQuestion.answer.toLowerCase()) {
      setIsVerified(true);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  // 📝 Folders for Academic Notes
  const notesDriveFolders = {
    ash: { 1: "YOUR_NOTES_ASH_SEM1_ID", 2: "YOUR_NOTES_ASH_SEM2_ID" },
    extc: { 3: "YOUR_NOTES_EXTC_SEM3_ID", 4: "YOUR_NOTES_EXTC_SEM4_ID", 5: "YOUR_NOTES_EXTC_SEM5_ID", 6: "YOUR_NOTES_EXTC_SEM6_ID", 7: "YOUR_NOTES_EXTC_SEM7_ID", 8: "YOUR_NOTES_EXTC_SEM8_ID" },
    cse: { 3: "YOUR_NOTES_CSE_SEM3_ID", 4: "YOUR_NOTES_CSE_SEM4_ID", 5: "YOUR_NOTES_CSE_SEM5_ID", 6: "YOUR_NOTES_CSE_SEM6_ID", 7: "YOUR_NOTES_CSE_SEM7_ID", 8: "YOUR_NOTES_CSE_SEM8_ID" },
    it: { 3: "YOUR_NOTES_IT_SEM3_ID", 4: "YOUR_NOTES_IT_SEM4_ID", 5: "YOUR_NOTES_IT_SEM5_ID", 6: "YOUR_NOTES_IT_SEM6_ID", 7: "YOUR_NOTES_IT_SEM7_ID", 8: "YOUR_NOTES_IT_SEM8_ID" },
    mech: { 3: "YOUR_NOTES_MECH_SEM3_ID", 4: "YOUR_NOTES_MECH_SEM4_ID", 5: "YOUR_NOTES_MECH_SEM5_ID", 6: "YOUR_NOTES_MECH_SEM6_ID", 7: "YOUR_NOTES_MECH_SEM7_ID", 8: "YOUR_NOTES_MECH_SEM8_ID" },
    elec: { 3: "YOUR_NOTES_ELEC_SEM3_ID", 4: "YOUR_NOTES_ELEC_SEM4_ID", 5: "YOUR_NOTES_ELEC_SEM5_ID", 6: "YOUR_NOTES_ELEC_SEM6_ID", 7: "YOUR_NOTES_ELEC_SEM7_ID", 8: "YOUR_NOTES_ELEC_SEM8_ID" }
  };

  // 📝 Folders for Past Year Unit Test Papers
  const papersDriveFolders = {
    ash: {
      1: { unit1: "YOUR_PAPERS_ASH_SEM1_UNIT1_ID", unit2: "YOUR_PAPERS_ASH_SEM1_UNIT2_ID" },
      2: { unit1: "1LLW3Ayynq9USixJEXRlnwer7yL6bmaJY", unit2: "1qjN4Dz7U4flWVhlRFF1nhLFH7w-XmJTJ" }
    },
    extc: {
      3: { unit1: "YOUR_PAPERS_EXTC_SEM3_UNIT1_ID", unit2: "YOUR_PAPERS_EXTC_SEM3_UNIT2_ID" },
      4: { unit1: "YOUR_PAPERS_EXTC_SEM4_UNIT1_ID", unit2: "YOUR_PAPERS_EXTC_SEM4_UNIT2_ID" },
      5: { unit1: "YOUR_PAPERS_EXTC_SEM5_UNIT1_ID", unit2: "YOUR_PAPERS_EXTC_SEM5_UNIT2_ID" },
      6: { unit1: "YOUR_PAPERS_EXTC_SEM6_UNIT1_ID", unit2: "YOUR_PAPERS_EXTC_SEM6_UNIT2_ID" },
      7: { unit1: "YOUR_PAPERS_EXTC_SEM7_UNIT1_ID", unit2: "YOUR_PAPERS_EXTC_SEM7_UNIT2_ID" },
      8: { unit1: "YOUR_PAPERS_EXTC_SEM8_UNIT1_ID", unit2: "YOUR_PAPERS_EXTC_SEM8_UNIT2_ID" }
    },
    cse: {
      3: { unit1: "YOUR_PAPERS_CSE_SEM3_UNIT1_ID", unit2: "YOUR_PAPERS_CSE_SEM3_UNIT2_ID" },
      4: { unit1: "1y8o3Om7YXAqlD5II7V_n3o_8v1xI385b", unit2: "YOUR_PAPERS_CSE_SEM4_UNIT2_ID" },
      5: { unit1: "YOUR_PAPERS_CSE_SEM5_UNIT1_ID", unit2: "YOUR_PAPERS_CSE_SEM5_UNIT2_ID" },
      6: { unit1: "YOUR_PAPERS_CSE_SEM6_UNIT1_ID", unit2: "YOUR_PAPERS_CSE_SEM6_UNIT2_ID" },
      7: { unit1: "YOUR_PAPERS_CSE_SEM7_UNIT1_ID", unit2: "YOUR_PAPERS_CSE_SEM7_UNIT2_ID" },
      8: { unit1: "YOUR_PAPERS_CSE_SEM8_UNIT1_ID", unit2: "YOUR_PAPERS_CSE_SEM8_UNIT2_ID" }
    },
    it: {
      3: { unit1: "YOUR_PAPERS_IT_SEM3_UNIT1_ID", unit2: "YOUR_PAPERS_IT_SEM3_UNIT2_ID" },
      4: { unit1: "YOUR_PAPERS_IT_SEM4_UNIT1_ID", unit2: "YOUR_PAPERS_IT_SEM4_UNIT2_ID" },
      5: { unit1: "YOUR_PAPERS_IT_SEM5_UNIT1_ID", unit2: "YOUR_PAPERS_IT_SEM5_UNIT2_ID" },
      6: { unit1: "YOUR_PAPERS_IT_SEM6_UNIT1_ID", unit2: "YOUR_PAPERS_IT_SEM6_UNIT2_ID" },
      7: { unit1: "YOUR_PAPERS_IT_SEM7_UNIT1_ID", unit2: "YOUR_PAPERS_IT_SEM7_UNIT2_ID" },
      8: { unit1: "YOUR_PAPERS_IT_SEM8_UNIT1_ID", unit2: "YOUR_PAPERS_IT_SEM8_UNIT2_ID" }
    },
    mech: {
      3: { unit1: "YOUR_PAPERS_MECH_SEM3_UNIT1_ID", unit2: "YOUR_PAPERS_MECH_SEM3_UNIT2_ID" },
      4: { unit1: "YOUR_PAPERS_MECH_SEM4_UNIT1_ID", unit2: "YOUR_PAPERS_MECH_SEM4_UNIT2_ID" },
      5: { unit1: "YOUR_PAPERS_MECH_SEM5_UNIT1_ID", unit2: "YOUR_PAPERS_MECH_SEM5_UNIT2_ID" },
      6: { unit1: "YOUR_PAPERS_MECH_SEM6_UNIT1_ID", unit2: "YOUR_PAPERS_MECH_SEM6_UNIT2_ID" },
      7: { unit1: "YOUR_PAPERS_MECH_SEM7_UNIT1_ID", unit2: "YOUR_PAPERS_MECH_SEM7_UNIT2_ID" },
      8: { unit1: "YOUR_PAPERS_MECH_SEM8_UNIT1_ID", unit2: "YOUR_PAPERS_MECH_SEM8_UNIT2_ID" }
    },
    elec: {
      3: { unit1: "YOUR_PAPERS_ELEC_SEM3_UNIT1_ID", unit2: "YOUR_PAPERS_ELEC_SEM3_UNIT2_ID" },
      4: { unit1: "1cNI4dudv3MgV9bz5uJYZafRiqiB6nTB_", unit2: "YOUR_PAPERS_ELEC_SEM4_UNIT2_ID" },
      5: { unit1: "YOUR_PAPERS_ELEC_SEM5_UNIT1_ID", unit2: "YOUR_PAPERS_ELEC_SEM5_UNIT2_ID" },
      6: { unit1: "YOUR_PAPERS_ELEC_SEM6_UNIT1_ID", unit2: "YOUR_PAPERS_ELEC_SEM6_UNIT2_ID" },
      7: { unit1: "YOUR_PAPERS_ELEC_SEM7_UNIT1_ID", unit2: "YOUR_PAPERS_ELEC_SEM7_UNIT2_ID" },
      8: { unit1: "YOUR_PAPERS_ELEC_SEM8_UNIT1_ID", unit2: "YOUR_PAPERS_ELEC_SEM8_UNIT2_ID" }
    }
  };

  if (!isVerified && randomQuestion) {
    return (
      <div className="notes-page-container" style={{ justifyContent: 'center', minHeight: '100vh' }}>
        <div className="space-dust"></div>
        <div className="verification-card" style={{
          background: 'linear-gradient(145deg, rgba(15, 20, 35, 0.9), rgba(10, 15, 25, 0.95))',
          padding: '50px 40px',
          borderRadius: '16px',
          border: '1px solid rgba(226, 192, 115, 0.3)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          textAlign: 'center',
          maxWidth: '500px',
          width: '90%',
          position: 'relative',
          zIndex: 10
        }}>
          <h2 style={{ color: '#e2c073', fontFamily: "'Times New Roman', serif", marginBottom: '20px', fontSize: '2.5rem', textTransform: 'uppercase', letterSpacing: '2px' }}>SSGMCE Student Gateway</h2>
          <p style={{ color: '#b0b8c0', marginBottom: '30px', fontSize: '1.1rem', fontStyle: 'italic' }}>Please answer the following question to verify you are a student and access the notes:</p>
          <div style={{ marginBottom: '30px', fontSize: '1.4rem', color: '#f8f9fa', fontWeight: 'bold', fontFamily: "'Times New Roman', serif" }}>
            {randomQuestion.question}
          </div>
          <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your answer here..."
              style={{
                padding: '15px 20px',
                borderRadius: '8px',
                border: `1px solid ${error ? '#ff4d4d' : 'rgba(226, 192, 115, 0.4)'}`,
                background: 'rgba(255,255,255,0.05)',
                color: '#fff',
                fontSize: '1.1rem',
                outline: 'none',
                fontFamily: "'Inter', sans-serif",
                transition: 'border-color 0.3s'
              }}
            />
            {error && <span style={{ color: '#ff4d4d', fontSize: '0.9rem' }}>Incorrect answer. Try again!</span>}
            <button type="submit" style={{
              background: 'rgba(226, 192, 115, 0.1)',
              border: '1px solid #e2c073',
              color: '#e2c073',
              padding: '15px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1.2rem',
              fontFamily: "'Times New Roman', serif",
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              marginTop: '10px'
            }}
              onMouseOver={(e) => { e.target.style.background = 'rgba(226, 192, 115, 0.2)'; e.target.style.boxShadow = '0 0 15px rgba(226, 192, 115, 0.2)'; }}
              onMouseOut={(e) => { e.target.style.background = 'rgba(226, 192, 115, 0.1)'; e.target.style.boxShadow = 'none'; }}
            >
              Verify & Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="notes-page-container">
      {/* Background Elements */}
      <div className="space-dust"></div>

      {/* --- ACADEMIC DISCLAIMER --- */}
      <div className="academic-disclaimer" style={{ position: 'relative', zIndex: 2, maxWidth: '800px', margin: '40px auto', padding: '30px', background: 'rgba(226, 192, 115, 0.03)', border: '1px solid rgba(226, 192, 115, 0.2)', borderRadius: '12px', textAlign: 'center' }}>
        <h4 style={{ color: '#e2c073', fontFamily: "'Times New Roman', serif", fontSize: '1.4rem', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '2px' }}>Academic Contribution Initiative</h4>
        <p style={{ color: '#b0b8c0', fontSize: '1.05rem', lineHeight: '1.7', fontFamily: "'Times New Roman', serif", fontStyle: 'italic' }}>
          "This portal is established solely for the academic assistance of students and is provided entirely free of cost. 
          We believe in the power of collective knowledge. If you wish to contribute to this work by sharing your study materials, 
          notes, or Unit Test paper solutions, please contact the <strong>E-Cell Chairperson</strong>."
        </p>
      </div>

      {/* --- ACADEMIC NOTES SECTION --- */}
      <DepartmentSection
        title="Academic Notes"
        description="Select your department to access study materials"
        driveFolders={notesDriveFolders}
      />

      {/* --- ELEGANT DIVIDER --- */}
      <div style={{ width: '60%', height: '1px', background: 'radial-gradient(circle, rgba(226, 192, 115, 0.5), transparent)', margin: '40px auto 80px', position: 'relative', zIndex: 2 }}></div>

      {/* --- PAST YEAR PAPERS SECTION --- */}
      <DepartmentSection
        title="Past Year Unit Test Papers"
        description="Select your department to access previous examination papers"
        driveFolders={papersDriveFolders}
        hasUnits={true}
        hasYears={true}
      />

    </div>
  );
};

export default Notes;
