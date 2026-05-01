const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel } = require('docx');
require('dotenv').config();

const MemberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    college: { type: String }
});

const RegistrationSchema = new mongoose.Schema({
    event: { type: String, required: true },
    teamName: { type: String, required: true },
    leaderName: { type: String, required: true },
    leaderEmail: { type: String, required: true },
    leaderPhone: { type: String, required: true },
    college: { type: String },
    members: [MemberSchema],
    problemStatement: { type: String },
    registrationDate: { type: Date, default: Date.now }
});

const Registration = mongoose.models.Registration || mongoose.model('Registration', RegistrationSchema);

function normalizeCollege(name) {
    if (!name) return 'Unknown';
    const n = name.toLowerCase();
    if (n.includes('pote')) return 'P. R. Pote Patil College of Engineering and Management, Amravati';
    if (n.includes('meghe')) return 'Prof. Ram Meghe Institute of Technology and Research, Badnera';
    if (n.includes('raisoni')) return 'G. H. Raisoni College of Engineering';
    if (n.includes('svkm') || n.includes('vile parle')) return 'SVKM\'s College of Engineering, Shirpur';
    if (n.includes('gajanan') || n.includes('ssgmce')) return 'Shri Sant Gajanan Maharaj College of Engineering, Shegaon';
    if (n.includes('trinity')) return 'Trinity College of Engineering and Research, Pune';
    if (n.includes('jawaharlal darda') || n.includes('jdiet')) return 'Jawaharlal Darda Institute of Engineering and Technology, Yavatmal';
    if (n.includes('r.c. patel') || n.includes('rcpit')) return 'R. C. Patel Institute of Technology, Shirpur';
    if (n.includes('v.v.s.m') || n.includes('vvsm')) return 'VVSM, Akola';
    if (n.includes('anuradha')) return 'Anuradha College of Engineering, Chikhli';
    if (n.includes('sipna')) return 'Sipna College of Engineering and Technology, Amravati';
    if (n.includes('vit pune')) return 'Vishwakarma Institute of Technology (VIT), Pune';
    if (n.includes('d.y. patil') || n.includes('dyp')) return 'D. Y. Patil College of Engineering';
    if (n.includes('government polytechnic amravati') || n.includes('gp amravati')) return 'Government Polytechnic, Amravati';
    if (n.includes('government polytechnic nagpur') || n.includes('gp nagpur')) return 'Government Polytechnic, Nagpur';
    
    // Default: Clean up white space and return original if no match
    return name.trim();
}

async function generateWordReport() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        
        const teams = await Registration.find({ event: /Srijan/i }).sort({ registrationDate: 1 });
        
        const collegeCounts = {};
        const psCounts = {};
        
        teams.forEach(team => {
            const coll = normalizeCollege(team.college);
            collegeCounts[coll] = (collegeCounts[coll] || 0) + 1;
            
            const ps = (team.problemStatement || 'Student Innovation').trim();
            psCounts[ps] = (psCounts[ps] || 0) + 1;
        });
        
        const sortedColleges = Object.entries(collegeCounts).sort((a, b) => b[1] - a[1]);
        const sortedPS = Object.entries(psCounts).sort((a, b) => b[1] - a[1]);

        // --- Create DOCX ---
        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        text: "OFFICIAL REPORT: SRIJAN - 24 HR HACKATHON",
                        heading: HeadingLevel.TITLE,
                        alignment: AlignmentType.CENTER,
                    }),
                    new Paragraph({ text: "" }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "Total Teams Registered: ", bold: true }),
                            new TextRun({ text: `${teams.length}` }),
                        ],
                    }),
                    new Paragraph({ text: "" }),
                    new Paragraph({ text: "PARTICIPATING COLLEGES & TEAM COUNTS", heading: HeadingLevel.HEADING_1 }),
                    
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph({ text: "College Name", bold: true })] }),
                                    new TableCell({ children: [new Paragraph({ text: "Total Teams", bold: true })] }),
                                ],
                            }),
                            ...sortedColleges.map(([name, count]) => (
                                new TableRow({
                                    children: [
                                        new TableCell({ children: [new Paragraph({ text: name })] }),
                                        new TableCell({ children: [new Paragraph({ text: count.toString() })] }),
                                    ],
                                })
                            )),
                        ],
                    }),

                    new Paragraph({ text: "" }),
                    new Paragraph({ text: "PROBLEM STATEMENT DISTRIBUTION", heading: HeadingLevel.HEADING_1 }),
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph({ text: "Problem Statement / Track", bold: true })] }),
                                    new TableCell({ children: [new Paragraph({ text: "Total Teams", bold: true })] }),
                                ],
                            }),
                            ...sortedPS.map(([ps, count]) => (
                                new TableRow({
                                    children: [
                                        new TableCell({ children: [new Paragraph({ text: ps })] }),
                                        new TableCell({ children: [new Paragraph({ text: count.toString() })] }),
                                    ],
                                })
                            )),
                        ],
                    }),

                    new Paragraph({ text: "", pageBreakBefore: true }),
                    new Paragraph({ text: "FACILITIES PROVIDED BY TEAM NAVONMESH", heading: HeadingLevel.HEADING_1 }),
                    ...[
                        "1. High-Speed Connectivity: Dedicated LAN / Ethernet connection available on every single workstation/table.",
                        "2. Wireless Access: High-speed redundant Wi-Fi zone across the entire event premise.",
                        "3. Round-the-Clock Refreshments: 24-hour free Tea and Coffee service to keep the energy high.",
                        "4. On-Demand Documentation: Free printouts of required documents, diagrams, and code snippets.",
                        "5. Medical Support: Essential medicines and first-aid kits available 24/7 on-site.",
                        "6. Participant Kits: Every participant receives a notepad, file, pen, rulebook, and a detailed event flow guide.",
                        "7. Official Recognition: Professional ID Cards provided to all teams and members.",
                        "8. Nutritional Support: Free high-quality food (Lunch & Dinner) and Breakfast, provided with individual meal coupons.",
                        "9. Accommodation: Free on-campus accommodation facilities for outstation participants during the event.",
                        "10. Query Resolve System: High-priority '5-Minute Query Resolve' scanner available on every table for instant technical assistance.",
                        "11. Free Bus Service: Complimentary transportation for participants for local transit.",
                        "12. Entertainment Breaks: Scheduled jamming sessions and vibrant Cultural Programs to destress during the 24-hour grind.",
                        "13. Rewards & Recognition: Prestigious Winner and Runner-up prizes for top-performing teams.",
                        "14. Mentorship: Opportunities for direct interaction with Industry Experts and professional mentors.",
                        "15. Dedicated Support: 24/7 Co-ordinators and volunteer support throughout the hackathon journey."
                    ].map(facility => new Paragraph({ text: facility, bullet: { level: 0 } })),
                ],
            }],
        });

        const buffer = await Packer.toBuffer(doc);
        const fileName = "Srijan_Official_Report_V2.docx";
        const outputPath = path.join(__dirname, fileName);
        fs.writeFileSync(outputPath, buffer);

        console.log(`Word report generated: ${outputPath}`);
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

generateWordReport();
