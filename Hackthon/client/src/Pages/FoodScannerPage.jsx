import React from 'react';
import AdminQRScanner from '../Components/AdminQRScanner';
import '../Styles/admin_qr_scanner.css';

const FoodScannerPage = () => {
    return (
        <div className="food-scanner-page-container" style={{
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
            overflowX: 'hidden',
            padding: '4px 0'
        }}>
            <AdminQRScanner />
        </div>
    );
};

export default FoodScannerPage;
