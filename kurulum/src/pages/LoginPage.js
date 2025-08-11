import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  sendEmailVerification, 
  onAuthStateChanged,
  sendPasswordResetEmail
} from "firebase/auth";
import { ref, get, set } from "firebase/database";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/LoginPage.css";

const EmailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <circle cx="12" cy="16" r="1"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const GuestIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const ResetIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
    <path d="M21 3v5h-5"/>
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
    <path d="M3 21v-5h5"/>
  </svg>
);

function LoginPage() {

  // All state variables
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isGuestLogin, setIsGuestLogin] = useState(false);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [waitingForVerification, setWaitingForVerification] = useState(false);

  // navigate and location hooks
  const navigate = useNavigate();
  const location = useLocation();

  // Check URL parameter and show registration form
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const mode = urlParams.get('mode');
    const oobCode = urlParams.get('oobCode');
    
    if (mode === 'register' && !isRegistering) {
      setIsRegistering(true);
    }
    
    if (mode === 'verifyEmail' && oobCode) {
      setMessage("Verifying email...");
     
      navigate('/login', { replace: true });
    }
  }, [location, isRegistering, navigate]);

  // Check email verification status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !user.emailVerified && waitingForVerification) {
       
        setMessage("Please verify your email address.");
      } else if (user && user.emailVerified && waitingForVerification) {
       
        setMessage("Email verified! You can now log in.");
        setWaitingForVerification(false);
        setEmailVerificationSent(false);
      } else if (user && user.emailVerified && !waitingForVerification) {
       
        handleEmailVerificationSuccess(user);
      }
    });

    return () => unsubscribe();
  }, [waitingForVerification]);

  // Add event listener for Enter key
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Enter' && !isLoading) {
        event.preventDefault();
        if (isForgotPassword) {
          handleForgotPassword();
        } else if (isRegistering) {
          handleRegister();
        } else {
          handleLogin();
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isRegistering, isForgotPassword, isLoading, email, password, confirmPassword, fullName]); // Dependencies

  // Functions
  const syncUserData = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = ref(db, `Users/userData/${user.uid}`);
    const snapshot = await get(userRef);
    if (!snapshot.exists()) {
      await set(userRef, {
        name: user.displayName || fullName || "unknown",
        email: user.email,
        createdAt: new Date().toLocaleString("en-US"),
      });
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setMessage("Please fill in all fields!");
      return;
    }

    setIsLoading(true);
    setMessage("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if email is verified
      if (!user.emailVerified) {
        setMessage("Please verify your email address first. Check your verification email.");
        await signOut(auth);
        setIsLoading(false);
        return;
      }
      
      await syncUserData();
      localStorage.setItem("username", user.displayName || email.split("@")[0]);
      setMessage("Login successful!");
      setTimeout(() => {
        navigate("/home");
      }, 1500);
    } catch (err) {
      let errorMessage = '';
      switch (err.code) {
        case 'auth/user-not-found':
          errorMessage = 'No user found with this email address.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Please try again later.';
          break;
        default:
          errorMessage = 'Incorrect email or password!';
      }
      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setMessage("Please fill in all fields!");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters!");
      return;
    }
    
    setIsLoading(true);
    setMessage("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: fullName });
      localStorage.setItem("username", fullName);
      await syncUserData();
      await sendEmailVerification(user, {
        url: window.location.origin + '/login',
        handleCodeInApp: true
      });
      
      setEmailVerificationSent(true);
      setWaitingForVerification(true); 
      setMessage("Registration successful! Please check your email and click the verification link.");
      
    } catch (err) {
      let errorMessage = '';
      switch (err.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email address is already in use!';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Must be at least 6 characters.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        default:
          errorMessage = 'An error occurred during registration!';
      }
      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Password reset function
  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setMessage("Please enter your email address!");
      return;
    }

    setIsLoading(true);
    setMessage("");
    
    try {
      await sendPasswordResetEmail(auth, email, {
        url: window.location.origin + '/login',
        handleCodeInApp: true
      });
      
      setMessage("Password reset email sent! Check your inbox.");
      setTimeout(() => {
        setIsForgotPassword(false);
        setMessage("");
      }, 3000);
      
    } catch (err) {
      let errorMessage = '';
      switch (err.code) {
        case 'auth/user-not-found':
          errorMessage = 'No user found with this email address.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Please try again later.';
          break;
        default:
          errorMessage = 'Error occurred while sending password reset email!';
      }
      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Guest login function
  const handleGuestLogin = async () => {
    setIsLoading(true);
    setMessage("");
    setIsGuestLogin(true);
    
    try {
      // Create unique ID for guest user
      const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const guestName = `Guest User ${Math.floor(Math.random() * 9999)}`;
      
      // Save guest info to localStorage
      localStorage.setItem("isGuest", "true");
      localStorage.setItem("guestId", guestId);
      localStorage.setItem("username", guestName);
      
      setMessage("Logging in as guest...");
      
      setTimeout(() => {
        navigate("/home");
      }, 1500);
      
    } catch (err) {
      console.error("Guest login error:", err);
      setMessage("An error occurred during guest login!");
    } finally {
      setIsLoading(false);
      setIsGuestLogin(false);
    }
  };

  // Form submit handler - for Enter key
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!isLoading) {
      if (isForgotPassword) {
        handleForgotPassword();
      } else if (isRegistering) {
        handleRegister();
      } else {
        handleLogin();
      }
    }
  };

  const toggleMode = () => {
    setIsTransitioning(true);
    setMessage("");
    setEmailVerificationSent(false);
    setWaitingForVerification(false);
    setIsForgotPassword(false);
    setTimeout(() => {
      setIsRegistering(!isRegistering);
      setIsTransitioning(false);
      // Clear mode parameter from URL
      if (location.search.includes('mode=register')) {
        navigate('/login', { replace: true });
      }
    }, 300);
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFullName("");
    setMessage("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setEmailVerificationSent(false);
    setWaitingForVerification(false);
    setIsForgotPassword(false);
  };

  const handleModeSwitch = () => {
    resetForm();
    toggleMode();
  };

  // Auto login when email verification is successful
  const handleEmailVerificationSuccess = async (user) => {
    try {
      await syncUserData();
      localStorage.setItem("username", user.displayName || user.email.split("@")[0]);
      setMessage("Email verified! Auto logging in...");
      setTimeout(() => {
        navigate("/home");
      }, 1500);
    } catch (error) {
      console.error("Auto login error:", error);
      setMessage("Email verified! You can now log in.");
    }
  };

  const resendVerificationEmail = async () => {
    if (!email) {
      setMessage("Please enter your email address.");
      return;
    }
    
    setIsLoading(true);
    try {
      // Temporarily log in
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      if (user.emailVerified) {
        setMessage("Your email address is already verified!");
        await signOut(auth);
        setIsLoading(false);
        return;
      }
      
      await sendEmailVerification(user);
      await signOut(auth);
      setMessage("Verification email sent again!");
      setEmailVerificationSent(true);
    } catch (err) {
      setMessage("Error sending email. Please check your password.");
    } finally {
      setIsLoading(false);
    }
  };

  // Switch to forgot password mode
  const handleForgotPasswordClick = () => {
    setIsForgotPassword(true);
    setMessage("");
    setEmailVerificationSent(false);
    setWaitingForVerification(false);
  };

  // Return to login mode
  const handleBackToLogin = () => {
    setIsForgotPassword(false);
    setMessage("");
  };

  return (
    <div className="modern-login-container">
      {/* Background Grid */}
      <div className="bg-grid"></div>
      
      {/* Main Card */}
      <div className={`login-card-wide ${isTransitioning ? 'transitioning' : ''} ${isRegistering ? 'register-mode' : ''}`}>
        
        {/* Left Side - Image Section */}
        <div className="card-image-section">
          <div className="image-overlay">
            <div className="brand-logo-overlay">
              <img src="/photos/icon.png" alt="Logo" className="logo-icon-overlay" />
              <div className="brand-info-overlay">
                <p className="brand-tagline-overlay">Network Security Tools</p>
              </div>
            </div>
            
            <div className="image-content">
              <h2 className="image-title">
                {isForgotPassword 
                  ? "Reset Your Password"
                  : isRegistering 
                    ? "Join the Secure Network World" 
                    : "Improve Your Cybersecurity Knowledge"
                }
              </h2>
              <p className="image-description">
                {isForgotPassword
                  ? "Enter your email address and receive password reset instructions."
                  : isRegistering 
                    ? "Learn network analysis, port scanning, and threat awareness on a single platform with NST that makes cybersecurity education interactive." 
                    : "Test and improve yourself with simulations, quizzes, and real-time tools."
                }
              </p>
              
              <div className="feature-points">
                <div className="feature-point">
                  <div className="log-reg-feature-icon">✓</div>
                  <span>Interactive Quiz Modules</span>
                </div>
                <div className="feature-point">
                  <div className="log-reg-feature-icon">✓</div>
                  <span>Real-time WiFi and Port Simulations</span>
                </div>
                <div className="feature-point">
                  <div className="log-reg-feature-icon">✓</div>
                  <span>Hands-on Learning with Nmap & Wireshark Training</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative Network Visualization */}
          <div className="network-visualization">
            <div className="network-node node-1"></div>
            <div className="network-node node-2"></div>
            <div className="network-node node-3"></div>
            <div className="network-node node-4"></div>
            <div className="network-connection connection-1"></div>
            <div className="network-connection connection-2"></div>
            <div className="network-connection connection-3"></div>
          </div>
        </div>

        {/* Right Side - Form Section */}
        <div className="card-form-section">
          <div className="form-header">
            <h2 className="form-title">
              {isForgotPassword 
                ? "Forgot Password" 
                : isRegistering 
                  ? "Create Account" 
                  : "Welcome Back"
              }
            </h2>
            <p className="form-subtitle">
              {isForgotPassword 
                ? "Enter your email address to reset your password"
                : isRegistering 
                  ? "Create your secure account" 
                  : "Log in to your account"
              }
            </p>
          </div>

          <div className="form-content">
            {/* Form element added with onSubmit event handler */}
            <form className="login-form" onSubmit={handleFormSubmit}>
              {isRegistering && !isForgotPassword && (
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <div className="input-wrapper">
                    <UserIcon />
                    <input
                      type="text"
                      placeholder="Enter your first and last name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="input-group">
                <label className="input-label">Email</label>
                <div className="input-wrapper">
                  <EmailIcon />
                  <input
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {!isForgotPassword && (
                <div className="input-group">
                  <label className="input-label">Password</label>
                  <div className="input-wrapper">
                    <LockIcon />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>
              )}

              {isRegistering && !isForgotPassword && (
                <div className="input-group">
                  <label className="input-label">Confirm Password</label>
                  <div className="input-wrapper">
                    <LockIcon />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>
              )}

              {/* Forgot Password */}
              {!isRegistering && !isForgotPassword && (
                <div className="forgot-password-link">
                  <button 
                    type="button" 
                    className="forgot-password-btn"
                    onClick={handleForgotPasswordClick}
                  >
                    Forgot Password
                  </button>
                </div>
              )}

              {message && (
                <div className={`message ${message.includes('successful') || message.includes('sent') ? 'success' : 'error'}`}>
                  {message}
                </div>
              )}

              {emailVerificationSent && !isForgotPassword && (
                <div className="verification-notice">
                  <div className="verification-icon">📧</div>
                  <div className="verification-content">
                    <h4>Email Verification Sent</h4>
                    <p>Please check your inbox and click the verification link.</p>
                    <button 
                      type="button" 
                      className="resend-btn"
                      onClick={resendVerificationEmail}
                      disabled={isLoading}
                    >
                      Resend
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className={`submit-btn ${isLoading && !isGuestLogin ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading && !isGuestLogin ? (
                  <div className="loading-content">
                    <div className="loading-spinner"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <span>
                    {isForgotPassword 
                      ? "Send Password Reset Email"
                      : isRegistering 
                        ? "Create Account" 
                        : "Log In"
                    }
                  </span>
                )}
              </button>
            </form>

            {/* Back button in forgot password mode */}
            {isForgotPassword && (
              <button
                type="button"
                className="back-to-login-btn"
                onClick={handleBackToLogin}
              >
                ← Back to Login
              </button>
            )}

            {/* Guest Login Section - Only show when not in forgot password mode */}
            {!isForgotPassword && (
              <div className="guest-login-section">
                <div className="guest-divider">
                  <span>or</span>
                </div>
                
                <button
                  type="button"
                  className={`guest-login-btn ${isGuestLogin ? 'loading' : ''}`}
                  onClick={handleGuestLogin}
                  disabled={isLoading}
                >
                  {isGuestLogin ? (
                    <div className="loading-content">
                      <div className="loading-spinner"></div>
                      <span>Logging in...</span>
                    </div>
                  ) : (
                    <div className="guest-btn-content">
                      <GuestIcon />
                      <span>Continue as Guest</span>
                    </div>
                  )}
                </button>
                
                <p className="guest-note">
                  If you log in as a guest, your quiz results will not be saved.
                </p>
              </div>
            )}

            {/* Mode switch button - Only show when not in forgot password mode */}
            {!isForgotPassword && (
              <>
                <div className="divider">
                  <span>or</span>
                </div>

                <button
                  type="button"
                  className="switch-mode-btn"
                  onClick={handleModeSwitch}
                >
                  {isRegistering ? "Sign in with existing account" : "Create new account"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;