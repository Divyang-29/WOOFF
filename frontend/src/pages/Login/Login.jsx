import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../api';
import './Login.css';

export default function Login({ initialMode = 'login', isModal = false, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: setAuthUser, isAuthenticated, closeAuthModal } = useAuth();

  // Mode: 'login' | 'signup'
  const [mode, setMode] = useState(
    location.pathname.includes('signup') || location.pathname.includes('register')
      ? 'signup'
      : initialMode
  );

  // Forgot Password View State
  const [isForgotPasswordView, setIsForgotPasswordView] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [childName, setChildName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // UI Feedback State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModal) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModal]);

  // If already authenticated, close modal & redirect
  useEffect(() => {
    if (isAuthenticated) {
      if (isModal) {
        closeAuthModal();
      } else {
        navigate('/account', { replace: true });
      }
    }
  }, [isAuthenticated, isModal, closeAuthModal, navigate]);

  // Handle Close Modal
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      closeAuthModal();
    }
  };

  // Sync mode with prop/route changes
  useEffect(() => {
    setMode(initialMode);
    setErrorMsg('');
    setSuccessMsg('');
    setIsForgotPasswordView(false);
  }, [initialMode]);

  // Email Submit (Login or Signup)
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    if (mode === 'signup' && !agreeTerms) {
      setErrorMsg('Please accept the Terms & Conditions.');
      return;
    }

    setLoading(true);

    try {
      const endpoint = mode === 'signup'
        ? API_ENDPOINTS.AUTH.REGISTER
        : API_ENDPOINTS.AUTH.LOGIN;

      const payload = mode === 'signup'
        ? { email, password, fullName, childName }
        : { email, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed.');
      }

      setAuthUser(data.token, data.user);
      setSuccessMsg(data.message || (mode === 'signup' ? 'Account created successfully!' : 'Welcome back!'));

      setTimeout(() => {
        if (isModal) {
          closeAuthModal();
        } else {
          navigate('/account', { replace: true });
        }
      }, 500);
    } catch (err) {
      console.error('Auth Error:', err);
      setErrorMsg(err.message || 'Unable to authenticate. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password Request
  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const targetEmail = forgotEmail || email;

    if (!targetEmail || !targetEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setForgotSubmitted(true);
      setSuccessMsg(`Password reset instructions sent to ${targetEmail}! Please check your email inbox.`);
    }, 700);
  };

  const cardContent = (
    <div
      className={`auth-card-container ${isModal ? 'is-modal' : ''}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Modal Close Button */}
      {isModal && (
        <button
          type="button"
          className="auth-modal-close-btn"
          onClick={handleClose}
          aria-label="Close Authentication Modal"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}

      {/* Brand Header */}
      <div className="auth-header-block text-center">
        <div className="auth-brand-badge">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/>
          </svg>
          <span>Wooff Kids Dental</span>
        </div>

        <h1 className="auth-title">
          {isForgotPasswordView
            ? 'Reset Password'
            : mode === 'signup'
            ? 'Join the Wooff Family'
            : 'Welcome Back'}
        </h1>

        <p className="auth-subtitle">
          {isForgotPasswordView
            ? "Enter your email address and we'll send you instructions to reset your password"
            : mode === 'signup'
            ? "Create an account for personalized kids' oral care & rewards"
            : "Log in to manage orders, subscriptions & kids' dental profiles"}
        </p>
      </div>

      {/* Main Tab Nav: Log In vs Sign Up (Hidden during Forgot Password view) */}
      {!isForgotPasswordView && (
        <div className="auth-tabs-nav">
          <button
            type="button"
            className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => {
              setMode('login');
              setErrorMsg('');
              setSuccessMsg('');
            }}
          >
            Log In
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => {
              setMode('signup');
              setErrorMsg('');
              setSuccessMsg('');
            }}
          >
            Sign Up
          </button>
        </div>
      )}

      {/* Dynamic Alerts */}
      {errorMsg && (
        <div className="auth-alert auth-alert-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="auth-alert auth-alert-success">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span>{successMsg}</span>
        </div>
      )}

      {/* -------------------------------------------------------------
          FORGOT PASSWORD VIEW
         ------------------------------------------------------------- */}
      {isForgotPasswordView ? (
        <form onSubmit={handleForgotPasswordSubmit}>
          <div className="auth-input-group">
            <label className="auth-input-label">Registered Email Address</label>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </span>
              <input
                type="email"
                className="auth-input-field"
                placeholder="name@example.com"
                value={forgotEmail || email}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading || forgotSubmitted}
          >
            {loading ? 'Sending Link...' : forgotSubmitted ? 'Link Sent ✓' : 'Send Reset Instructions'}
          </button>

          <div className="text-center">
            <button
              type="button"
              className="secondary-back-btn"
              onClick={() => {
                setIsForgotPasswordView(false);
                setForgotSubmitted(false);
                setErrorMsg('');
                setSuccessMsg('');
              }}
            >
              ← Back to Sign In
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleEmailSubmit}>
          {mode === 'signup' && (
            <div className="auth-row-2col">
              <div className="auth-input-group">
                <label className="auth-input-label">Parent's Full Name</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </span>
                  <input
                    type="text"
                    className="auth-input-field"
                    placeholder="e.g. Alex Morgan"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-input-label">Child's Name (Optional 👶)</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">😁</span>
                  <input
                    type="text"
                    className="auth-input-field"
                    placeholder="e.g. Luna"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="auth-input-group">
            <label className="auth-input-label">Email Address</label>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </span>
              <input
                type="email"
                className="auth-input-field"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="auth-input-group">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="auth-input-label mb-0">Password</label>
              {mode === 'login' && (
                <button
                  type="button"
                  className="forgot-password-link"
                  onClick={() => {
                    setIsForgotPasswordView(true);
                    setForgotEmail(email);
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="auth-input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div className="auth-checkbox-group">
              <input
                type="checkbox"
                id="email-terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <label htmlFor="email-terms">
                I agree to Wooff's <Link to="/terms" onClick={isModal ? handleClose : null}>Terms of Service</Link> and{' '}
                <Link to="/privacy" onClick={isModal ? handleClose : null}>Privacy Policy</Link>.
              </label>
            </div>
          )}

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading
              ? 'Processing...'
              : mode === 'signup'
              ? 'Create Account'
              : 'Sign In'}
          </button>
        </form>
      )}

      {/* Footer Toggle Link (Hidden during Forgot Password view) */}
      {!isForgotPasswordView && (
        <div className="text-center mt-3 pt-2 border-top border-light">
          {mode === 'login' ? (
            <p className="small text-muted mb-0">
              Don't have a Wooff account yet?{' '}
              <button
                type="button"
                className="btn btn-link p-0 fw-bold text-decoration-none"
                style={{ color: '#e58b57' }}
                onClick={() => {
                  setMode('signup');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
              >
                Sign Up Now →
              </button>
            </p>
          ) : (
            <p className="small text-muted mb-0">
              Already have an account?{' '}
              <button
                type="button"
                className="btn btn-link p-0 fw-bold text-decoration-none"
                style={{ color: '#e58b57' }}
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
              >
                Log In →
              </button>
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="auth-modal-overlay" onClick={handleClose}>
        {cardContent}
      </div>
    );
  }

  return <div className="auth-page-wrapper">{cardContent}</div>;
}
