// Secure Production API Configuration for Navonmesh Coordinator App
// Hardcoded to official production cloud server for APK builds
// User cannot modify or tamper with server destinations

export const PRODUCTION_API = 'https://navonmesh2026.onrender.com';

export const getApiUrl = () => {
    // 1. Check build environment
    const envUrl = import.meta.env.VITE_API_URL;
    
    // In Capacitor native mobile app (Android), never attempt to connect to phone's own localhost
    const isNative = typeof window !== 'undefined' && (
        window.Capacitor?.isNativePlatform?.() ||
        window.location?.protocol === 'capacitor:' ||
        (window.location?.hostname === 'localhost' && !window.location?.port)
    );

    if (isNative) {
        return PRODUCTION_API;
    }

    if (envUrl && envUrl.trim() && !envUrl.includes('undefined')) {
        return envUrl.trim().replace(/\/+$/, '');
    }

    return PRODUCTION_API;
};
