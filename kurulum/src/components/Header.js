import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebase";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase"; 
import { Menu, Shield } from "lucide-react";
import "../styles/Header.css";

function Header({ onTrainingModuleClick }) {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1300);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Logs debug messages with a custom prefix
  const debugLog = (message, data) => {
    console.log(`[Header Debug] ${message}:`, data);
  };

  // Handles navigation when Training Module is clicked
  const handleTrainingModuleClick = (e) => {
    if (onTrainingModuleClick) {
      onTrainingModuleClick();
    }
    setIsMenuOpen(false);
  };

  // Navigates to home or reloads if already on home
  const onHomeClick = () => {
    if (location.pathname === "/") {
      window.location.reload();
    } else {
      navigate("/");
    }
  };

  // Handles home click event and closes mobile menu
  const handleHomeClick = (e) => {
    onHomeClick();
    setIsMenuOpen(false);
  };

  // Detects screen resizing to toggle mobile layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1300);
      if (window.innerWidth >= 1300) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch user information from Firestore
  const fetchUserData = async (userId) => {
    try {
      debugLog("Fetching user data from Firestore", userId);
      const userDoc = await getDoc(doc(db, "users", userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        debugLog("User data found in Firestore", userData);
        
        let displayName = '';
        
        if (userData.name) {
          displayName = userData.name;
        } else if (userData.firstName && userData.lastName) {
          displayName = `${userData.firstName} ${userData.lastName}`;
        } else if (userData.firstName) {
          displayName = userData.firstName;
        } else if (userData.username) {
          displayName = userData.username;
        } else if (userData.email) {
          displayName = userData.email.split('@')[0];
        } else {
          displayName = 'User';
        }
        
        debugLog("Display name determined", displayName);
        return displayName;
      } else {
        debugLog("No user document found in Firestore", userId);
        return null;
      }
    } catch (error) {
      console.error("Firestore'dan kullanıcı verisi çekme hatası:", error);
      return null;
    }
  };

  // Checks and updates user authentication status
  const checkAuthStatus = async () => {
    setLoading(true);
    
    const isGuest = localStorage.getItem('isGuest') === 'true';
    const savedUsername = localStorage.getItem("username");
    const savedUserId = localStorage.getItem("userId");
    const firebaseAuth = getAuth();
    const currentUser = firebaseAuth.currentUser;
    
    const allLocalStorage = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      allLocalStorage[key] = localStorage.getItem(key);
    }
    
    debugLog("=== FULL AUTH STATUS CHECK ===");
    debugLog("Auth Status Check", {
      isGuest,
      savedUsername,
      savedUserId,
      currentUser: currentUser?.email || 'null',
      currentUserUid: currentUser?.uid || 'null',
      allLocalStorage
    });

    if (isGuest) {
      debugLog("🚫 Guest user detected - showing login buttons");
      debugLog("📋 Guest check details", {
        isGuestValue: localStorage.getItem('isGuest'),
        isGuestType: typeof localStorage.getItem('isGuest'),
        shouldBeGuest: localStorage.getItem('isGuest') === 'true'
      });
      
      if (currentUser) {
        debugLog("🔄 Firebase user exists but marked as guest - clearing guest status");
        localStorage.removeItem('isGuest');
        localStorage.removeItem('guestId');
      
        setTimeout(() => checkAuthStatus(), 100);
        return;
      }
      
      setIsLoggedIn(false);
      setUser(null);
      setLoading(false);
      return;
    }

    if (currentUser) {
      debugLog("✅ Firebase user found", currentUser.email);
      debugLog("Current user UID", currentUser.uid);
      
      try {

        const displayName = await fetchUserData(currentUser.uid);
        
        if (displayName) {
          debugLog("✅ Setting user from Firestore", displayName);
          setUser(displayName);
          setIsLoggedIn(true);
          
          localStorage.setItem("username", displayName);
          localStorage.setItem("userId", currentUser.uid);
          debugLog("✅ User data saved to localStorage");
        } else {

          const fallbackName = currentUser.displayName || currentUser.email.split('@')[0];
          debugLog("⚠️ Using fallback name", fallbackName);
          setUser(fallbackName);
          setIsLoggedIn(true);
          localStorage.setItem("username", fallbackName);
          localStorage.setItem("userId", currentUser.uid);
        }
        setLoading(false);
        debugLog("✅ Firebase auth setup completed - isLoggedIn:", true);
        return;
      } catch (error) {
        debugLog("❌ Error in Firebase user setup", error);
        setLoading(false);
        return;
      }
    }

    if (savedUserId && !isGuest) {
      debugLog("📁 SavedUserId found, fetching from Firestore", savedUserId);
      
      try {
        const displayName = await fetchUserData(savedUserId);
        
        if (displayName) {
          debugLog("✅ Setting user from saved userId", displayName);
          setUser(displayName);
          setIsLoggedIn(true);
          setLoading(false);
          debugLog("✅ localStorage userId setup completed - isLoggedIn:", true);
          return;
        } else {
          debugLog("❌ Failed to fetch user data with savedUserId, removing from localStorage");
          localStorage.removeItem("userId");
        }
      } catch (error) {
        debugLog("❌ Error fetching user data with savedUserId", error);
        localStorage.removeItem("userId");
      }
    }

    if (savedUsername && !isGuest) {
      debugLog("📁 SavedUsername found in localStorage", savedUsername);
      setIsLoggedIn(true);
      setUser(savedUsername);
      setLoading(false);
      debugLog("✅ localStorage username setup completed - isLoggedIn:", true);
      return;
    }

    debugLog("❌ No user found - showing login buttons");
    setIsLoggedIn(false);
    setUser(null);
    setLoading(false);
    debugLog("=== AUTH CHECK COMPLETED ===");
  };

  // Run on component mount - setup listeners
  useEffect(() => {
    debugLog("Component mounted", "Setting up auth listeners");
    
    // İlk kontrol
    checkAuthStatus();

    // Firebase Auth değişikliklerini dinle
    const firebaseAuth = getAuth();
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (currentUser) => {
      debugLog("Firebase Auth State Changed", currentUser?.email || 'null');
      
      // Auth durumu değiştiğinde yeniden kontrol et
      await checkAuthStatus();
    });

    return () => {
      debugLog("Unsubscribing auth listener");
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleStorageChange = async (e) => {
      if (e.key === 'username' || e.key === 'isGuest' || e.key === 'userId') {
        debugLog("LocalStorage changed", { key: e.key, newValue: e.newValue });
        await checkAuthStatus();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    debugLog("Location changed", location.pathname);
    checkAuthStatus();
  }, [location.pathname]);

  // Logout function
  const handleLogout = async () => {
    try {
      debugLog("Logout initiated");
      const isGuest = localStorage.getItem('isGuest') === 'true';
      
      // Tüm kullanıcı verilerini temizle
      localStorage.removeItem('username');
      localStorage.removeItem('isGuest');
      localStorage.removeItem('guestId');
      localStorage.removeItem('userId');
      
      if (!isGuest) {
        const firebaseAuth = getAuth();
        await signOut(firebaseAuth);
      }
      
      // State'leri sıfırla
      setUser(null);
      setIsLoggedIn(false);
      setIsOpen(false);
      
      debugLog("Logout completed", "Redirecting to login");
      navigate("/login");
    } catch (error) {
      console.error("Çıkış yapma hatası:", error);
      // Hata durumunda da tüm verileri temizle
      localStorage.clear();
      setUser(null);
      setIsLoggedIn(false);
      navigate("/login");
    }
  };
  
  // Close the dropdown menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.user-menu')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (loading) {
    return (
      <header>
        <div className="header">
          <div className="left-header">
            {/* Logo and title together */}
            <div className="logo-container">
              <Shield className="logo-icon" size={32} />
              <h2>Network Security Tools</h2>
            </div>
          </div>
          <nav className={`center-nav ${isMobile ? "hidden" : ""}`}>
            <Link to="/">Home</Link>
            <Link to="/wifi-analyzer">Wifi Analyzer</Link>
            <Link to="/training-module" onClick={handleTrainingModuleClick}>Training Module</Link>
            <Link to="/quizzes">Quizzes</Link>
          </nav>
          <div className="right-header">
            <div>Yükleniyor...</div>
          </div>
        </div>
      </header>
    );
  }

  debugLog("🎨 RENDERING HEADER", { 
    isLoggedIn, 
    user, 
    loading,
    "Will show": isLoggedIn && user ? "USER MENU" : "LOGIN BUTTONS",
    isGuest: localStorage.getItem('isGuest'),
    savedUsername: localStorage.getItem('username'),
    savedUserId: localStorage.getItem('userId')
  });

  return (
    <header>
      <div className="header">
        {/* Logo and Title on the left */}
        <div className="left-header">
          <div className="logo-container">
            <img src="/photos/icon.png" alt="Logo" className="logo-icon" style={{ width: '65px', height: '65px' }} />
          </div>
        </div>

        <nav className={`center-nav ${isMobile ? "hidden" : ""}`}>
          <Link to="/" onClick={handleHomeClick}>Home</Link>
          <Link to="/wifi-analyzer" onClick={e => {
            if (location.pathname === "/wifi-analyzer") {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "auto" });
              window.location.reload();
            }
          }}>Wifi Analyzer</Link>
          <Link to="/training-module" onClick={handleTrainingModuleClick}>Training Module</Link>
          <Link to="/quizzes" onClick={e => {
            if (location.pathname === "/quizzes") {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "auto" });
              window.location.reload();
            }
          }}>Quizzes</Link>
        </nav>

        {/* Username and Hamburger Menu on the right */}
        <div className="right-header">
          
          {isLoggedIn && user ? (
            <div className="user-menu">
              <span className="header-user-name" onClick={() => setIsOpen(!isOpen)}>
                {user}
              </span>

              {/* Dropdown Menu */}
              {isOpen && (
                <div className="dropdown-menu">
                  <Link to="/profile" onClick={() => setIsOpen(false)}>Profile</Link>
                  <Link to="/quiz-results" onClick={() => setIsOpen(false)}>My Quiz Results</Link>
                  <span onClick={handleLogout}>Logout</span>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="auth-link login">Login</Link>
              <Link to="/login?mode=register" className="auth-link register">Register</Link>
            </div>
          )}

          {isMobile && (
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="menu-btn">
              <Menu size={28} />
            </button>
          )}
        </div>
      </div>

      {isMobile && isMenuOpen && (
        <div className="mobile-menu">
          <Link to="/" onClick={() => setIsMenuOpen(false)}>Anasayfa</Link>
          <Link to="/wifi-analyzer" onClick={e => {
            setIsMenuOpen(false);
            if (location.pathname === "/wifi-analyzer") {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "auto" });
              window.location.reload();
            }
          }}>Wifi Analyzer</Link>
          <Link to="/training-module" onClick={handleTrainingModuleClick}>Training Module</Link>
          <Link to="/quizzes" onClick={e => {
            setIsMenuOpen(false);
            if (location.pathname === "/quizzes") {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "auto" });
              window.location.reload();
            }
          }}>Quizzes</Link>
        </div>
      )}
    </header>
  );
}

export default Header;