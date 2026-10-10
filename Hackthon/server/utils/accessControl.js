const fs = require('fs');
const path = require('path');

const CONTROL_FILE = path.join(__dirname, '..', 'data', 'access_control.json');

function getAccessConfig() {
    try {
        if (!fs.existsSync(CONTROL_FILE)) {
            const initial = {
                lockdownAllOthers: false,
                blockedLogins: []
            };
            fs.writeFileSync(CONTROL_FILE, JSON.stringify(initial, null, 2), 'utf8');
            return initial;
        }
        const data = fs.readFileSync(CONTROL_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading access_control.json:', err);
        return { lockdownAllOthers: false, blockedLogins: [] };
    }
}

function saveAccessConfig(config) {
    try {
        const dir = path.dirname(CONTROL_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(CONTROL_FILE, JSON.stringify(config, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error('Error saving access_control.json:', err);
        return false;
    }
}

function isLoginBlocked(loginId) {
    const cleanId = (loginId || '').trim().toLowerCase();
    // Master admin can NEVER be blocked
    if (cleanId === 'nihal.navonmesh') {
        return false;
    }

    const config = getAccessConfig();
    if (config.lockdownAllOthers) {
        return true;
    }

    return Array.isArray(config.blockedLogins) && config.blockedLogins.map(id => id.toLowerCase()).includes(cleanId);
}

function toggleLockdown(enabled) {
    const config = getAccessConfig();
    config.lockdownAllOthers = typeof enabled === 'boolean' ? enabled : !config.lockdownAllOthers;
    saveAccessConfig(config);
    return config;
}

function toggleBlockId(targetId, blockStatus) {
    const cleanId = (targetId || '').trim().toLowerCase();
    if (cleanId === 'nihal.navonmesh') {
        return { success: false, message: 'Master Admin (nihal.navonmesh) cannot be blocked.' };
    }

    const config = getAccessConfig();
    if (!Array.isArray(config.blockedLogins)) {
        config.blockedLogins = [];
    }

    const exists = config.blockedLogins.map(id => id.toLowerCase()).includes(cleanId);
    const shouldBlock = typeof blockStatus === 'boolean' ? blockStatus : !exists;

    if (shouldBlock && !exists) {
        config.blockedLogins.push(cleanId);
    } else if (!shouldBlock && exists) {
        config.blockedLogins = config.blockedLogins.filter(id => id.toLowerCase() !== cleanId);
    }

    saveAccessConfig(config);
    return { success: true, config };
}

module.exports = {
    getAccessConfig,
    saveAccessConfig,
    isLoginBlocked,
    toggleLockdown,
    toggleBlockId
};
