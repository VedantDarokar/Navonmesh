import React, { useState, useEffect } from "react";
import "../Styles/team.css"; 
// We'll reuse team.css since we want a similar "Sections" feel.
import { FaPhone, FaMapMarkerAlt, FaClock, FaIdBadge } from "react-icons/fa";

const Management = () => {
    const managementData = {
        "Final Year Advisors": [
            { "name": "Vikas Gawade", "class": "4N", "contact": "8999750764" },
            { "name": "Om Deshmukh", "class": "4U1", "contact": "8149471804" },
            { "name": "Shripad Ingle", "class": "4N", "contact": "9876543210" }
        ],
        "Overall Head": [
            { "name": "Nihal Kankal", "class": "3U1", "contact": "8766417815" },
            { "name": "Sanchit Dangra", "class": "3N", "contact": "9309391688" },
            { "name": "Rutuja Deshmukh", "class": "3U1", "contact": "9022886503" },
            { "name": "Vedant Darokar", "class": "3N", "contact": "8208772402" }
        ],
        "Srijan Head": [
            { "name": "Atharv Tayade", "class": "3U2", "contact": "8767968475" }
        ],
        "Management Team": [
            { "name": "Aniket Chavan", "class": "3M", "contact": "7774900204" },
            { "name": "Abhishek Kanherkar", "class": "3M", "contact": "8010324551" },
            { "name": "Sanskruti Kakade", "class": "3U2", "contact": "9423413845" },
            { "name": "Dhanashri Borde", "class": "3U2", "contact": "7387546722" },
            { "name": "Khushi Mal", "class": "3U1", "contact": "7385632533" },
            { "name": "Atharv Sonone", "class": "2R", "contact": "9834428773" },
            { "name": "Amol Gawade", "class": "2N", "contact": "8767926790" },
            { "name": "Pranit Warhade", "class": "2U1", "contact": "9356115794" },
            { "name": "Yash Bari", "class": "2N", "contact": "8767908104" },
            { "name": "Ritik Kale", "class": "2U2", "contact": "9373773626" },
            { "name": "Pranav Dhurde", "class": "2R", "contact": null },
            { "name": "Devendra Kasare", "class": "2U2", "contact": "7798744557" },
            { "name": "Ganesh Patil", "class": "2U1", "contact": "9373122981" },
            { "name": "Vedant Sharma", "class": null, "contact": null },
            { "name": "Sujal Patiya", "class": "2R", "contact": "7888181710" },
            { "name": "Harshada Lokhande", "class": null, "contact": null },
            { "name": "Himanshu Warade", "class": "2M", "contact": "8767407471" },
            { "name": "Sujal Agam", "class": null, "contact": null },
            { "name": "Harshita Dalmiya", "class": "2U2", "contact": "9422922721" },
            { "name": "Achal Dahatonde", "class": null, "contact": null },
            { "name": "Manjiri Raut", "class": "2N", "contact": "9881456393" },
            { "name": "Nidhi Kumkar", "class": null, "contact": null }
        ],
        "Registration Team": [
            { "name": "Mayur Adhao", "class": "3N", "contact": "9011893530" },
            { "name": "Deep Rathod", "class": "3U1", "contact": "9112538683" },
            { "name": "Om Hurpade", "class": "2N", "contact": "7841987201" },
            { "name": "Swaraj Deshmukh", "class": "2U1", "contact": "8983215734" },
            { "name": "Dolly Bhutada", "class": "2R", "contact": "8459701982" },
            { "name": "Krishna Mundada", "class": "2U2", "contact": "879982877" },
            { "name": "Sanchita Gawande", "class": "2R", "contact": "7385159136" },
            { "name": "Gargi Mane", "class": "2R", "contact": "7499564839" },
            { "name": "Sarvesh Warulkar", "class": "2U2", "contact": "7057399102" }
        ],
        "Accommodation Team": [
            { "name": "Ajinkya Surange", "class": "3M", "contact": "9604765998" },
            { "name": "Hanzala Khan", "class": "3M", "contact": "7410799739" },
            { "name": "Prarthana Kale", "class": "3S", "contact": "8421190576" },
            { "name": "Mohita Nimje", "class": "3M", "contact": "7058059107" },
            { "name": "Harshali Bahurupi", "class": null, "contact": null },
            { "name": "Pranali Pande", "class": "3S", "contact": "9850650987" },
            { "name": "Payal Salunke", "class": "2U2", "contact": "8830909198" },
            { "name": "Ashlesha Sultane", "class": "2U2", "contact": "9359761973" },
            { "name": "Gunjan Gandhi", "class": "2U2", "contact": "8888997449" }
        ],
        "Additional Entries": [
            { "name": "Dimpal Rathod", "class": "2N", "contact": "8010167370" },
            { "name": "Akansha Ghate", "class": "1R", "contact": "8080785098" },
            { "name": "Tanisha Mahore", "class": "1U2", "contact": "7489480458" },
            { "name": "Janhvi Kulkarni", "class": "1U1", "contact": "9021159194" },
            { "name": "Rutuja Shelke", "class": "1N", "contact": "7276813522" }
        ]
    };

    const generateDutySlots = () => {
        const slots = [];
        const managementMembers = managementData["Management Team"];
        const accommodationMembers = managementData["Accommodation Team"];
        
        // Start: March 22, 08:00 AM
        // End: March 25, 12:00 PM
        const startDate = new Date(2026, 2, 22, 8, 0, 0);
        const endDate = new Date(2026, 2, 25, 12, 0, 0);

        let currentSlotStart = new Date(startDate);
        let mIdx = 0;
        let aIdx = 0;

        while (currentSlotStart < endDate) {
            const currentSlotEnd = new Date(currentSlotStart.getTime() + 4 * 60 * 60 * 1000);
            
            slots.push({
                start: new Date(currentSlotStart),
                end: new Date(currentSlotEnd),
                management: managementMembers[mIdx % managementMembers.length],
                accommodation: accommodationMembers[aIdx % accommodationMembers.length]
            });

            currentSlotStart = currentSlotEnd;
            mIdx++;
            aIdx++;
        }
        return slots;
    };

    const dutySlots = generateDutySlots();

    return (
        <div className="management-page-container app-layout-container">
            <h1 className="management-main-title">MANAGEMENT HUB</h1>
            <p className="management-subtitle">Operational Coordination & Duty Schedules</p>

            {/* SECTIONS FOR TEAMS */}
            <div className="management-sections-grid">
                {Object.entries(managementData).map(([sectionName, members]) => (
                    <div key={sectionName} className="mgmt-section-card">
                        <div className="mgmt-section-header">
                            <h2>{sectionName}</h2>
                        </div>
                        <div className="mgmt-member-list">
                            {members.map((member, idx) => (
                                <div key={idx} className="mgmt-member-item">
                                    <div className="mgmt-member-info">
                                        <span className="mgmt-name">{member.name}</span>
                                        {member.class && <span className="mgmt-class">{member.class}</span>}
                                    </div>
                                    {member.contact && (
                                        <div className="mgmt-contact">
                                            <FaPhone className="mgmt-icon" />
                                            <a href={`tel:${member.contact}`}>{member.contact}</a>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* DUTY SCHEDULER */}
            <div className="duty-scheduler-container">
                <h2 className="scheduler-title">
                    <FaClock className="header-icon" /> 4-HOUR DUTY SCHEDULE
                </h2>
                <div className="scheduler-table-wrapper">
                    <table className="duty-table">
                        <thead>
                            <tr>
                                <th>TIME SLOT</th>
                                <th>MANAGEMENT TEAM</th>
                                <th>ACCOMMODATION TEAM</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dutySlots.map((slot, idx) => {
                                const isCurrent = new Date() >= slot.start && new Date() < slot.end;
                                return (
                                    <tr key={idx} className={isCurrent ? "current-duty-row" : ""}>
                                        <td className="slot-time">
                                            <div className="date-badge">{slot.start.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</div>
                                            <div className="time-range">
                                                {slot.start.getHours().toString().padStart(2, '0')}:00 - {slot.end.getHours().toString().padStart(2, '0')}:00
                                            </div>
                                            {isCurrent && <span className="live-indicator">LIVE</span>}
                                        </td>
                                        <td className="member-cell">
                                            <div className="member-name">{slot.management.name}</div>
                                            <div className="member-subinfo">{slot.management.class} • {slot.management.contact || "N/A"}</div>
                                        </td>
                                        <td className="member-cell">
                                            <div className="member-name">{slot.accommodation.name}</div>
                                            <div className="member-subinfo">{slot.accommodation.class || "N/A"} • {slot.accommodation.contact || "N/A"}</div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
                .management-page-container {
                    padding: 80px 5% 40px;
                    color: #fff;
                    min-height: 100vh;
                    background: #000;
                    font-family: 'Poppins', sans-serif;
                }
                .management-main-title {
                    font-family: 'Orbitron', sans-serif;
                    text-align: center;
                    font-size: 3rem;
                    background: linear-gradient(45deg, #00e5ff, #007bff);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin-bottom: 5px;
                }
                .management-subtitle {
                    text-align: center;
                    color: #888;
                    margin-bottom: 50px;
                    letter-spacing: 2px;
                    font-size: 0.9rem;
                    text-transform: uppercase;
                }
                .management-sections-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                    gap: 25px;
                    margin-bottom: 60px;
                }
                .mgmt-section-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 15px;
                    overflow: hidden;
                    transition: 0.3s;
                }
                .mgmt-section-card:hover {
                    border-color: rgba(0, 229, 255, 0.3);
                    transform: translateY(-5px);
                }
                .mgmt-section-header {
                    padding: 15px 20px;
                    background: rgba(0, 229, 255, 0.1);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                .mgmt-section-header h2 {
                    margin: 0;
                    font-size: 1.1rem;
                    font-family: 'Orbitron', sans-serif;
                    color: #00e5ff;
                    letter-spacing: 1px;
                }
                .mgmt-member-list {
                    padding: 10px 0;
                }
                .mgmt-member-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.02);
                }
                .mgmt-member-info {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .mgmt-name {
                    font-weight: 500;
                    font-size: 0.95rem;
                }
                .mgmt-class {
                    font-size: 0.75rem;
                    color: #00e5ff;
                    background: rgba(0, 229, 255, 0.1);
                    padding: 2px 6px;
                    border-radius: 4px;
                }
                .mgmt-contact {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    color: #aaa;
                    font-size: 0.85rem;
                }
                .mgmt-contact a {
                    color: inherit;
                    text-decoration: none;
                    transition: 0.2s;
                }
                .mgmt-contact a:hover {
                    color: #00e5ff;
                }
                .mgmt-icon {
                    font-size: 0.75rem;
                    color: #555;
                }

                /* Duty Scheduler */
                .duty-scheduler-container {
                    background: rgba(0, 0, 0, 0.5);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                    padding: 30px;
                    margin-top: 40px;
                }
                .scheduler-title {
                    font-family: 'Orbitron', sans-serif;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    color: #ffcc00;
                    margin-bottom: 30px;
                }
                .header-icon {
                    color: #ffcc00;
                }
                .scheduler-table-wrapper {
                    overflow-x: auto;
                }
                .duty-table {
                    width: 100%;
                    border-collapse: collapse;
                    background: rgba(255, 255, 255, 0.01);
                }
                .duty-table th {
                    text-align: left;
                    padding: 15px;
                    background: rgba(255, 255, 255, 0.05);
                    color: #888;
                    font-size: 0.8rem;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                }
                .duty-table td {
                    padding: 15px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }
                .slot-time {
                    width: 150px;
                }
                .date-badge {
                    font-size: 0.7rem;
                    color: #aaa;
                    margin-bottom: 4px;
                }
                .time-range {
                    font-weight: bold;
                    font-family: 'Orbitron', sans-serif;
                    font-size: 1rem;
                }
                .member-cell {
                    min-width: 250px;
                }
                .member-name {
                    font-weight: 600;
                    font-size: 1rem;
                    color: #fff;
                }
                .member-subinfo {
                    font-size: 0.8rem;
                    color: #666;
                    margin-top: 2px;
                }
                .current-duty-row {
                    background: rgba(0, 229, 255, 0.05);
                    border-left: 4px solid #00e5ff;
                }
                .live-indicator {
                    display: inline-block;
                    margin-top: 4px;
                    padding: 2px 6px;
                    background: #ff0000;
                    color: #fff;
                    font-size: 0.6rem;
                    font-weight: bold;
                    border-radius: 4px;
                    animation: pulse 1.5s infinite;
                }
                @keyframes pulse {
                    0% { opacity: 0.6; }
                    50% { opacity: 1; }
                    100% { opacity: 0.6; }
                }

                @media (max-width: 768px) {
                    .management-main-title { font-size: 2rem; }
                    .mgmt-member-item { flex-direction: column; align-items: flex-start; gap: 5px; }
                    .mgmt-contact { margin-top: 2px; }
                    .duty-table th { font-size: 0.7rem; }
                    .time-range { font-size: 0.85rem; }
                    .member-name { font-size: 0.9rem; }
                }
            `}</style>
        </div>
    );
};

export default Management;
