import React from 'react';
import AdminQRScanner from '../Components/AdminQRScanner';
import '../Styles/admin_qr_scanner.css';

const FoodScannerPage = () => {
    return (
        <div style={{
            minHeight: '100vh',
            background: 'radial-gradient(circle at 50% 20%, #0d1933 0%, #050b17 100%)',
            padding: '20px 16px',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            <div style={{
                maxWidth: '1200px',
                width: '100%',
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px'
            }}>
                <div>
                    <h2 style={{
                        fontFamily: 'Orbitron, sans-serif',
                        margin: 0,
                        fontSize: '1.3rem',
                        color: '#10b981',
                        letterSpacing: '1px'
                    }}>
                        🍱 NAVONMESH 2027 • MESS & CANTEEN SCANNER
                    </h2>
                    <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.8rem' }}>
                        Simultaneous multi-coordinator live scanner • Single dynamic QR per participant
                    </p>
                </div>
                <div style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#34d399',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontFamily: 'Orbitron, sans-serif'
                }}>
                    ● LIVE SYNC CONNECTED
                </div>
            </div>

            <div style={{ maxWidth: '1200px', width: '100%' }}>
                <AdminQRScanner />
            </div>
        </div>
    );
};

export default FoodScannerPage;
