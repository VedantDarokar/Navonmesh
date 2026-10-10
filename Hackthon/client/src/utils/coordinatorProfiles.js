import nihalImg from "../assets/nihal_latest.png";
import vedantImg from "../assets/vedant_latest.png";
import abhishekImg from "../assets/abhishek_new.png";
import omImg from "../assets/om_konde_latest.png";
import atharvaImg from "../assets/atharva_tayade.png";
import rutujaImg from "../assets/rutuja_latest_v2.png";
import krushnaImg from "../assets/krushna.png";
import teamPlaceholder from "../assets/team_placeholder.png";

export const COORDINATOR_PROFILES = {
    'nihal.navonmesh': {
        name: 'Nihal Kankal',
        subRole: 'Overall Head & Master Administrator',
        image: nihalImg
    },
    'vedant.navonmesh': {
        name: 'Vedant Darokar',
        subRole: 'Overall Head',
        image: vedantImg
    },
    'abhishek.navonmesh': {
        name: 'Abhishek Kanherkar',
        subRole: 'Publicity Head',
        image: abhishekImg
    },
    'omkonde.navonmesh': {
        name: 'Om Konde',
        subRole: 'Discipline Head',
        image: omImg
    },
    'atharva.navonmesh': {
        name: 'Atharva Tayade',
        subRole: 'HEAD (सृजन)',
        image: atharvaImg
    },
    'rutuja.navonmesh': {
        name: 'Rutuja Deshmukh',
        subRole: 'Overall Head',
        image: rutujaImg
    },
    'krushna.navonmesh': {
        name: 'Krushna Kokate',
        subRole: 'HEAD (अंकुर)',
        image: krushnaImg
    }
};

export const getCoordinatorProfile = (id) => {
    const clean = (id || '').trim().toLowerCase();
    if (COORDINATOR_PROFILES[clean]) {
        return COORDINATOR_PROFILES[clean];
    }
    // Partial match fallback (e.g. 'nihal' matches 'nihal.navonmesh')
    const key = Object.keys(COORDINATOR_PROFILES).find(k => k.startsWith(clean));
    if (key) {
        return COORDINATOR_PROFILES[key];
    }
    return {
        name: 'Coordinator',
        subRole: 'Field Coordinator',
        image: teamPlaceholder
    };
};
