const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'navonmesh_jwt_secret_key_2026';

/**
 * Validates admin Authorization header
 * Accepts both newly issued long-lived JWTs and legacy static tokens
 */
const isValidAdminAuth = (authHeader) => {
    if (!authHeader) return false;
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();
    if (token === 'admin_secret_token_navonmesh') return true;
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return Boolean(decoded);
    } catch (e) {
        return false;
    }
};

/**
 * Signs persistent 365-day JWT token for Coordinators & Admins
 */
const signCoordinatorToken = (adminUser) => {
    return jwt.sign(
        {
            id: adminUser.id,
            name: adminUser.name,
            subRole: adminUser.subRole,
            avatarKey: adminUser.avatarKey || 'default',
            role: 'coordinator'
        },
        JWT_SECRET,
        { expiresIn: '365d' }
    );
};

/**
 * Signs persistent 365-day JWT token for Squad Teams & Participants
 */
const signTeamToken = (team) => {
    return jwt.sign(
        {
            id: team._id || team.id,
            teamId: team.teamId,
            teamName: team.teamName,
            leaderEmail: team.leaderEmail,
            role: 'participant'
        },
        JWT_SECRET,
        { expiresIn: '365d' }
    );
};

module.exports = {
    JWT_SECRET,
    isValidAdminAuth,
    signCoordinatorToken,
    signTeamToken
};
