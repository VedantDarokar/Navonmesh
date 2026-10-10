/**
 * Persistent Authentication & Session Storage Utility
 * Prevents automatic logout when closing the mobile app or browser by
 * persisting JWT tokens and credentials in localStorage, while keeping
 * sessionStorage in sync for complete backward compatibility.
 */

const isBrowser = typeof window !== 'undefined';

export const authStorage = {
    // -------------------------------------------------------------
    // Coordinator & Admin Session
    // -------------------------------------------------------------
    setAdminSession: ({ token, adminInfo, adminId }) => {
        if (!isBrowser) return;
        const id = adminId || adminInfo?.id || '';
        const name = adminInfo?.name || '';
        const subRole = adminInfo?.subRole || '';

        // Save in localStorage (survives app closing / process kills)
        if (token) localStorage.setItem('adminToken', token);
        if (name) localStorage.setItem('adminName', name);
        if (subRole) localStorage.setItem('adminSubRole', subRole);
        if (id) localStorage.setItem('adminId', id);

        // Mirror in sessionStorage
        if (token) sessionStorage.setItem('adminToken', token);
        if (name) sessionStorage.setItem('adminName', name);
        if (subRole) sessionStorage.setItem('adminSubRole', subRole);
        if (id) sessionStorage.setItem('adminId', id);
    },

    getAdminSession: () => {
        if (!isBrowser) return null;
        const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
        if (!token) return null;

        const id = localStorage.getItem('adminId') || sessionStorage.getItem('adminId') || '';
        const name = localStorage.getItem('adminName') || sessionStorage.getItem('adminName') || '';
        const subRole = localStorage.getItem('adminSubRole') || sessionStorage.getItem('adminSubRole') || '';

        // Ensure sessionStorage is mirrored when reopening
        if (!sessionStorage.getItem('adminToken')) {
            sessionStorage.setItem('adminToken', token);
            if (id) sessionStorage.setItem('adminId', id);
            if (name) sessionStorage.setItem('adminName', name);
            if (subRole) sessionStorage.setItem('adminSubRole', subRole);
        }

        return { token, id, name, subRole };
    },

    clearAdminSession: () => {
        if (!isBrowser) return;
        ['adminToken', 'adminName', 'adminSubRole', 'adminId'].forEach(key => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
        });
    },

    // -------------------------------------------------------------
    // Participant & Squad Session
    // -------------------------------------------------------------
    setTeamSession: ({ teamToken, teamData, teamId }) => {
        if (!isBrowser) return;
        const token = teamToken || ('team_active_' + (teamData?.id || teamData?._id || teamId));
        const dataStr = typeof teamData === 'string' ? teamData : JSON.stringify(teamData);
        const tId = teamId || teamData?.teamId || '';

        // Save in localStorage (survives app closing)
        if (token) localStorage.setItem('teamToken', token);
        if (dataStr) localStorage.setItem('teamData', dataStr);
        if (tId) localStorage.setItem('teamId', tId);

        // Mirror in sessionStorage
        if (token) sessionStorage.setItem('teamToken', token);
        if (dataStr) sessionStorage.setItem('teamData', dataStr);
        if (tId) sessionStorage.setItem('teamId', tId);
    },

    getTeamSession: () => {
        if (!isBrowser) return null;
        const token = localStorage.getItem('teamToken') || sessionStorage.getItem('teamToken');
        const rawData = localStorage.getItem('teamData') || sessionStorage.getItem('teamData');
        const teamId = localStorage.getItem('teamId') || sessionStorage.getItem('teamId');

        if (!token || !rawData) return null;

        let parsedTeam = null;
        try {
            parsedTeam = JSON.parse(rawData);
        } catch (e) {
            return null;
        }

        // Mirror in sessionStorage when reopening
        if (!sessionStorage.getItem('teamToken')) {
            sessionStorage.setItem('teamToken', token);
            sessionStorage.setItem('teamData', rawData);
            if (teamId) sessionStorage.setItem('teamId', teamId);
        }

        return { teamToken: token, teamData: parsedTeam, teamId };
    },

    clearTeamSession: () => {
        if (!isBrowser) return;
        ['teamToken', 'teamData', 'teamId'].forEach(key => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
        });
    },

    // -------------------------------------------------------------
    // Universal Sync on App Boot
    // -------------------------------------------------------------
    syncSessions: () => {
        if (!isBrowser) return;
        authStorage.getAdminSession();
        authStorage.getTeamSession();
    },

    clearAll: () => {
        authStorage.clearAdminSession();
        authStorage.clearTeamSession();
    }
};

export default authStorage;
