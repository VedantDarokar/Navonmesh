import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUserShield, FaKey, FaEnvelope, FaLock, FaArrowRight, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import '../Styles/team_login.css';

const TeamLogin = () => {
    const navigate = useNavigate();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Forgot Password Flow
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotStep, setForgotStep] = useState(1); // 1: Enter ID/Email, 2: Enter OTP + New Password
    const [forgotId, setForgotId] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotError, setForgotError] = useState('');
    const [forgotSuccess, setForgotSuccess] = useState('');
    const [maskedEmail, setMaskedEmail] = useState('');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        if (!identifier.trim() || !password.trim()) {
            setError('Please enter both Team ID (e.g. SQUAD001) / Email and Password.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/team/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: identifier.trim(), password: password.trim() })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                // Save team session in sessionStorage
                sessionStorage.setItem('teamToken', 'team_active_' + data.team.id);
                sessionStorage.setItem('teamData', JSON.stringify(data.team));
                sessionStorage.setItem('teamId', data.team.teamId);
                navigate('/team-dashboard');
            } else {
                setError(data.error || 'Invalid credentials. Please check your Team ID or Password.');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Server connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Step 1: Send OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setForgotError('');
        if (!forgotId.trim()) {
            setForgotError('Please enter your Team ID (e.g. SQUAD001) or Leader Email.');
            return;
        }

        setForgotLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/team/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: forgotId.trim() })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setMaskedEmail(data.maskedEmail);
                setForgotSuccess(data.message);
                setForgotStep(2);
            } else {
                setForgotError(data.error || 'Failed to send reset OTP.');
            }
        } catch (err) {
            setForgotError('Server connection error.');
        } finally {
            setForgotLoading(false);
        }
    };

    // Step 2: Verify OTP and Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setForgotError('');
        if (!otp.trim() || !newPassword.trim()) {
            setForgotError('Please enter the 6-digit OTP and your new password.');
            return;
        }

        if (newPassword.length < 6) {
            setForgotError('Password must be at least 6 characters long.');
            return;
        }

        setForgotLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/team/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identifier: forgotId.trim(),
                    otp: otp.trim(),
                    newPassword: newPassword.trim()
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                alert('✅ Password reset successfully! You can now login with your new password.');
                setShowForgotModal(false);
                setForgotStep(1);
                setPassword(newPassword);
                setIdentifier(forgotId);
            } else {
                setForgotError(data.error || 'Failed to reset password.');
            }
        } catch (err) {
            setForgotError('Server connection error.');
        } finally {
            setForgotLoading(false);
        }
    };

    return (
        <div className="team-login-container">
            <div className="team-login-card">
                <div className="login-header-icon">
                    <FaUserShield />
                </div>
                <h2>Team Command Portal</h2>
                <p className="login-subtitle">
                    Manage team members, update mobile numbers, change problem statement (single-use), and download QR meal passes.
                </p>

                <form onSubmit={handleLogin} className="team-auth-form">
                    {error && (
                        <div className="auth-error-banner">
                            <FaExclamationTriangle /> {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label>Team Identifier</label>
                        <div className="input-with-icon">
                            <FaKey className="field-icon" />
                            <input
                                type="text"
                                placeholder="Enter Team ID (e.g. SQUAD001) or Leader Email"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="label-row">
                            <label>Password</label>
                            <button
                                type="button"
                                className="forgot-pass-link"
                                onClick={() => { setShowForgotModal(true); setForgotStep(1); setForgotError(''); }}
                            >
                                Forgot Password?
                            </button>
                        </div>
                        <div className="input-with-icon">
                            <FaLock className="field-icon" />
                            <input
                                type="password"
                                placeholder="Enter your team password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button type="submit" className="team-login-btn" disabled={loading}>
                        {loading ? 'AUTHENTICATING...' : (
                            <>LOGIN TO TEAM PORTAL <FaArrowRight /></>
                        )}
                    </button>
                </form>

                <div className="login-footer-info">
                    <p>
                        💡 <strong>Credentials:</strong> Your Team ID (e.g. <code>SQUAD001</code>) and unique password were sent to the registered team leader's Gmail upon registration.
                    </p>
                    <Link to="/register" className="new-reg-link">Need to register a new team? Click here</Link>
                </div>
            </div>

            {/* Forgot Password OTP Modal */}
            {showForgotModal && (
                <div className="forgot-modal-overlay">
                    <div className="forgot-modal-box">
                        <div className="forgot-modal-header">
                            <h3><FaKey /> Reset Team Password</h3>
                            <button className="close-forgot-btn" onClick={() => setShowForgotModal(false)}>✕</button>
                        </div>

                        {forgotError && <div className="auth-error-banner">{forgotError}</div>}
                        {forgotSuccess && <div className="auth-success-banner">{forgotSuccess}</div>}

                        {forgotStep === 1 ? (
                            <form onSubmit={handleSendOtp} className="forgot-form">
                                <p className="forgot-desc">
                                    Enter your Team ID (e.g. <strong>SQUAD001</strong>) or registered Leader Email. We will send a 6-digit OTP to the leader's Gmail.
                                </p>
                                <div className="form-group">
                                    <label>Team ID or Leader Email</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. SQUAD001 or leader@gmail.com"
                                        value={forgotId}
                                        onChange={(e) => setForgotId(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <button type="submit" className="forgot-submit-btn" disabled={forgotLoading}>
                                    {forgotLoading ? 'SENDING OTP...' : 'SEND RESET OTP TO GMAIL'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleResetPassword} className="forgot-form">
                                <p className="forgot-desc">
                                    An OTP was sent to <strong>{maskedEmail}</strong>. Enter the 6-digit code and your new password below.
                                </p>
                                <div className="form-group">
                                    <label>6-Digit OTP</label>
                                    <input
                                        type="text"
                                        maxLength="6"
                                        placeholder="Enter 6-digit OTP (e.g. 482910)"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="otp-input"
                                        autoFocus
                                    />
                                </div>
                                <div className="form-group">
                                    <label>New Password (min. 6 characters)</label>
                                    <input
                                        type="password"
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                </div>
                                <button type="submit" className="forgot-submit-btn" disabled={forgotLoading}>
                                    {forgotLoading ? 'VERIFYING & RESETTING...' : 'SET NEW PASSWORD'}
                                </button>
                                <button
                                    type="button"
                                    className="resend-otp-btn"
                                    onClick={handleSendOtp}
                                    disabled={forgotLoading}
                                >
                                    Didn't get OTP? Resend
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamLogin;
