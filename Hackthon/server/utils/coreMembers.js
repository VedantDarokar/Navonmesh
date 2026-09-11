const fs = require('fs');
const path = require('path');

const CSV_FILE = path.join(__dirname, '..', 'core_members.csv');
const JSON_FILE = path.join(__dirname, '..', 'data', 'core_members.json');

function generateCredentials(name, dob) {
    const rawFirst = (name || '').trim().split(/\s+/)[0] || 'member';
    const firstName = rawFirst.toLowerCase().replace(/[^a-z0-9]/g, '');
    const loginId = `${firstName}.ssgmce`;

    let ddmm = '0101';
    if (dob) {
        const cleaned = String(dob).trim();
        // Match numbers
        const parts = cleaned.split(/[\/\-\.\s]+/);
        if (parts.length >= 2) {
            if (parts[0].length === 4) {
                // YYYY-MM-DD
                const mm = parts[1].padStart(2, '0').slice(-2);
                const dd = (parts[2] || '01').padStart(2, '0').slice(-2);
                ddmm = `${dd}${mm}`;
            } else {
                // DD-MM-YYYY or DD/MM/YYYY
                const dd = parts[0].padStart(2, '0').slice(-2);
                const mm = parts[1].padStart(2, '0').slice(-2);
                ddmm = `${dd}${mm}`;
            }
        }
    }
    const password = `${firstName}${ddmm}`;
    return { loginId, password };
}

function parseCSV(content) {
    const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return [];

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
    
    // Map column names flexibly
    const findIndex = (keywords) => headers.findIndex(h => keywords.some(k => h.includes(k)));

    const nameIdx = findIndex(['name']);
    const contactIdx = findIndex(['contact', 'phone', 'mobile', 'cell']);
    const emailIdx = findIndex(['email', 'mail']);
    const dobIdx = findIndex(['dob', 'birth', 'dateofbirth']);
    const sisIdx = findIndex(['sis', 'sisid', 'enroll', 'reg', 'roll']);
    const classIdx = findIndex(['class', 'sec', 'dept', 'branch']);
    const yearIdx = findIndex(['year', 'yr']);

    const results = [];

    for (let i = 1; i < lines.length; i++) {
        // Handle comma separated with possible quotes
        const row = [];
        let inQuote = false;
        let cell = '';
        for (let char of lines[i]) {
            if (char === '"') {
                inQuote = !inQuote;
            } else if (char === ',' && !inQuote) {
                row.push(cell.trim());
                cell = '';
            } else {
                cell += char;
            }
        }
        row.push(cell.trim());

        const name = (nameIdx >= 0 ? row[nameIdx] : row[0]) || '';
        if (!name) continue;

        const contactNo = (contactIdx >= 0 ? row[contactIdx] : row[1]) || '';
        const email = (emailIdx >= 0 ? row[emailIdx] : row[2]) || '';
        const dob = (dobIdx >= 0 ? row[dobIdx] : row[3]) || '';
        const sisId = (sisIdx >= 0 ? row[sisIdx] : row[4]) || '';
        const className = (classIdx >= 0 ? row[classIdx] : row[5]) || '';
        const year = (yearIdx >= 0 ? row[yearIdx] : row[6]) || '';

        const creds = generateCredentials(name, dob);

        results.push({
            id: sisId || `core_${i}`,
            name,
            contactNo,
            email,
            dob,
            sisId,
            class: className,
            year,
            loginId: creds.loginId,
            password: creds.password
        });
    }

    return results;
}

function getCoreMembers() {
    try {
        // Priority 1: core_members.csv in server root
        if (fs.existsSync(CSV_FILE)) {
            const content = fs.readFileSync(CSV_FILE, 'utf8');
            const parsed = parseCSV(content);
            if (parsed.length > 0) return parsed;
        }

        // Priority 2: JSON file in data/
        if (fs.existsSync(JSON_FILE)) {
            const raw = fs.readFileSync(JSON_FILE, 'utf8');
            const data = JSON.parse(raw);
            if (Array.isArray(data)) return data;
        }
    } catch (e) {
        console.error('Error reading core members:', e);
    }
    return [];
}

function saveCoreMembers(members) {
    try {
        const dir = path.dirname(JSON_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(JSON_FILE, JSON.stringify(members, null, 2), 'utf8');
        return true;
    } catch (e) {
        console.error('Error saving core members:', e);
        return false;
    }
}

module.exports = {
    generateCredentials,
    getCoreMembers,
    saveCoreMembers,
    parseCSV
};
