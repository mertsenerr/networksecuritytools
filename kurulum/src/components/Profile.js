import React, { useState, useEffect } from "react";
import { db, auth, storage } from "../firebase";
import { ref, get, update } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [profileData, setProfileData] = useState({
    name: "Kullanıcı",
    bio: "Write something about yourself...",
    profilePic: "",
    email: "",
    joinDate: "",
    totalQuizzes: 0,
    averageScore: 0
  });

  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const isGuestUser = localStorage.getItem("isGuest") === "true";
      
      if (isGuestUser) {
        setProfileData({
          name: localStorage.getItem("username") || "Misafir Kullanıcı",
          bio: "Misafir kullanıcı - Quiz sonuçları kaydedilmez",
          profilePic: "",
          email: "guest@example.com",
          joinDate: "Misafir",
          totalQuizzes: 0,
          averageScore: 0
        });
        setQuizResults([]); 
        setLoading(false);
        return;
      }

      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (!user) {
          navigate("/login");
          return;
        }

        const userId = user.uid;
        try {
          const userDataRef = ref(db, `Users/userData/${userId}`);
          const userDataSnap = await get(userDataRef);

          let userData = {};
          if (userDataSnap.exists()) {
            userData = userDataSnap.val();
            console.log("✅ Kullanıcı verileri alındı:", userData);
          } else {
            const oldProfileRef = ref(db, `Users/${userId}`);
            const oldProfileSnap = await get(oldProfileRef);
            if (oldProfileSnap.exists()) {
              userData = oldProfileSnap.val();
              console.log("⚠️ Eski yoldan kullanıcı verileri alındı:", userData);
            }
          }

          setProfileData({
            name: userData.name || "Kullanıcı",
            bio: userData.bio || "Write something about yourself...",
            profilePic: userData.profilePic || "",
            email: user.email || "",
            joinDate: userData.joinDate || "2024",
            totalQuizzes: 0,
            averageScore: 0
          });

          const allQuizResults = [];
          const difficulties = ["basic", "midd", "hard"];
          
          for (const difficulty of difficulties) {
            try {
              const resultsRef = ref(db, `Users/userResults/generalResults/${difficulty}`);
              const resultsSnap = await get(resultsRef);
              
              if (resultsSnap.exists()) {
                const difficultyResults = resultsSnap.val();
                
                Object.entries(difficultyResults).forEach(([quizId, quizUsers]) => {
                  if (quizUsers[userId]) {
                    const result = quizUsers[userId];
                    
                    const formattedResult = {
                      quizName: quizId.replace(/_/g, " ").toUpperCase(),
                      difficulty: difficulty,
                      score: Math.round((result.score / result.total) * 100),
                      correct: result.score,
                      wrong: result.wrong || (result.total - result.score),
                      total: result.total,
                      timeUsed: result.timeUsed || 0,
                      date: result.timestamp ? new Date(result.timestamp).toLocaleDateString() : "Bilinmiyor",
                      timestamp: result.timestamp || Date.now()
                    };
                    
                    allQuizResults.push(formattedResult);
                  }
                });
              }
            } catch (error) {
              console.log(`⚠️ ${difficulty} zorluğundaki sonuçlar alınamadı:`, error);
            }
          }

          allQuizResults.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          setQuizResults(allQuizResults);
          
          const totalQuizzes = allQuizResults.length;
          const averageScore = totalQuizzes > 0 
            ? Math.round(allQuizResults.reduce((sum, result) => sum + result.score, 0) / totalQuizzes)
            : 0;
          
          setProfileData(prev => ({
            ...prev,
            totalQuizzes,
            averageScore
          }));

          console.log(`📊 Toplam ${totalQuizzes} quiz sonucu bulundu, ortalama skor: %${averageScore}`);
          
        } catch (error) {
          console.error("Veri çekilirken hata oluştu:", error);
        } finally {
          setLoading(false);
        }
      });

      return unsubscribe;
    };

    const unsubscribe = fetchUserData();
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [navigate]);

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const isGuestUser = localStorage.getItem("isGuest") === "true";
    if (isGuestUser) {
      alert("Misafir kullanıcı olarak profil bilgilerini değiştiremezsiniz.");
      return;
    }

    setSaving(true);
    const user = auth.currentUser;
    if (!user) return;

    const userId = user.uid;
    try {
      const profileRef = ref(db, `Users/userData/${userId}`);
      await update(profileRef, {
        name: profileData.name,
        bio: profileData.bio,
        profilePic: profileData.profilePic
      });
      setEditMode(false);
      
      const successEl = document.createElement('div');
      successEl.className = 'success-toast';
      successEl.innerHTML = `
        <div class="success-content">
          <span class="success-icon">✓</span>
          <span>Profil başarıyla güncellendi!</span>
        </div>
      `;
      document.body.appendChild(successEl);
      
      setTimeout(() => {
        if (document.body.contains(successEl)) {
          document.body.removeChild(successEl);
        }
      }, 3000);
      
    } catch (error) {
      console.error("Profil güncellenirken hata oluştu:", error);
      alert("Profil güncellenirken bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isGuestUser = localStorage.getItem("isGuest") === "true";
    if (isGuestUser) {
      alert("Misafir kullanıcı olarak profil fotoğrafı değiştiremezsiniz.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert("Giriş yapılmamış.");
      return;
    }

    const userId = user.uid;
    const imageRef = storageRef(storage, `profile_pictures/${userId}`);

    setUploading(true);

    try {
      await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(imageRef);

      const updatedData = { ...profileData, profilePic: downloadURL };
      const profileRef = ref(db, `Users/userData/${userId}`);
      await update(profileRef, updatedData);
      setProfileData(updatedData);

      const successEl = document.createElement('div');
      successEl.className = 'success-toast';
      successEl.innerHTML = `
        <div class="success-content">
          <span class="success-icon">📷</span>
          <span>Profil fotoğrafı güncellendi!</span>
        </div>
      `;
      document.body.appendChild(successEl);
      
      setTimeout(() => {
        if (document.body.contains(successEl)) {
          document.body.removeChild(successEl);
        }
      }, 3000);

    } catch (err) {
      console.error("Fotoğraf yükleme hatası:", err);
      alert("Fotoğraf yüklenemedi!");
    } finally {
      setUploading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "#10b981";
    if (score >= 60) return "#f59e0b";
    return "#ef4444";
  };

  const getPerformanceLevel = (score) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Very Good";
    if (score >= 70) return "Good";
    if (score >= 60) return "Average";
    return "Needs Improvement";
  };

  const isGuestUser = localStorage.getItem("isGuest") === "true";

  if (loading) {
    return (
      <div className="loading-container" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999
      }}>
        <div className="loading-animation" style={{
          position: 'relative',
          display: 'flex',
          gap: '10px',
          marginBottom: '30px'
        }}>
          <div className="loading-circle" style={{
            width: '20px',
            height: '20px',
            background: 'white',
            borderRadius: '50%',
            animation: 'bounce 1.4s ease-in-out infinite both',
            animationDelay: '0s'
          }}></div>
          <div className="loading-circle" style={{
            width: '20px',
            height: '20px',
            background: 'white',
            borderRadius: '50%',
            animation: 'bounce 1.4s ease-in-out infinite both',
            animationDelay: '0.16s'
          }}></div>
          <div className="loading-circle" style={{
            width: '20px',
            height: '20px',
            background: 'white',
            borderRadius: '50%',
            animation: 'bounce 1.4s ease-in-out infinite both',
            animationDelay: '0.32s'
          }}></div>
        </div>
        <h3 style={{
          color: 'white',
          fontSize: '24px',
          marginBottom: '10px',
          fontWeight: '600'
        }}>Fetching your profile information...</h3>
        <p style={{
          color: 'rgba(255,255,255,0.8)',
          fontSize: '16px',
          margin: 0
        }}>Getting your data ready...</p>
        
        <style>{`
          @keyframes bounce {
            0%, 80%, 100% {
              transform: scale(0);
            }
            40% {
              transform: scale(1);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`profile-container ${mounted ? 'mounted' : ''}`}>
      <div className="profile-header animate-slide-up">
        <div className="profile-banner">
          <div className="banner-overlay"></div>
          <div className="banner-pattern"></div>
        </div>
        
        <div className="profile-info-header">
          <div className="profile-avatar-section animate-scale-up">
            <div className="profile-avatar-container">
              <label htmlFor="profilePicInput" className="avatar-upload-label">
                {uploading ? (
                  <div className="upload-progress">
                    <div className="upload-spinner"></div>
                    <div className="upload-progress-text">Loading...</div>
                  </div>
                ) : (
                  <img 
                    src={profileData.profilePic || "/default-avatar.png"} 
                    alt="Profil Fotoğrafı"
                    className="profile-avatar"
                  />
                )}
                <div className="avatar-ring"></div>
                <div className="avatar-status-dot"></div>
              </label>
              {!isGuestUser && (
                <input
                  type="file"
                  id="profilePicInput"
                  accept="image/*"
                  onChange={handleProfilePicChange}
                  style={{ display: "none" }}
                />
              )}
            </div>
          </div>
          
          <div className="profile-basic-info animate-slide-right">
            <h1 className="profile-name">{profileData.name}</h1>
            <p className="profile-email">{profileData.email}</p>
            <div className="profile-badges">
              {isGuestUser ? (
                <span className="badge guest">👤 Guest User</span>
              ) : (
                <>
                  <span className="badge premium">Premium User</span>
                  <span className="badge verified">✓ Verified</span>
                </>
              )}
            </div>
            <p className="profile-join-date">
              <span className="join-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </span>
              Join Date: {profileData.joinDate}
            </p>
          </div>

          <div className="profile-stats animate-slide-left">
            <div className="stat-item" style={{"--delay": "0.1s"}}>
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12l2 2 4-4"/>
                  <path d="M21 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"/>
                  <path d="M3 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"/>
                  <path d="M12 21c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"/>
                  <path d="M12 3c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"/>
                </svg>
              </div>
              <span className="stat-number">{profileData.totalQuizzes}</span>
              <span className="stat-label">Completed Quiz</span>
              <div className="stat-progress">
                <div className="stat-progress-fill" style={{width: `${Math.min(profileData.totalQuizzes * 10, 100)}%`}}></div>
              </div>
            </div>
            
            <div className="stat-item" style={{"--delay": "0.2s"}}>
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
                </svg>
              </div>
              <span className="stat-number" style={{ color: getScoreColor(profileData.averageScore) }}>
                {profileData.averageScore}%
              </span>
              <span className="stat-label">Average Score</span>
              <div className="stat-progress">
                <div className="stat-progress-fill" style={{
                  width: `${profileData.averageScore}%`,
                  background: getScoreColor(profileData.averageScore)
                }}></div>
              </div>
            </div>
            
            <div className="stat-item" style={{"--delay": "0.3s"}}>
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                  <path d="M4 22h16"/>
                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
                </svg>
              </div>
              <span className="stat-number">{getPerformanceLevel(profileData.averageScore)}</span>
              <span className="stat-label">Performance</span>
              <div className="stat-progress">
                <div className="stat-progress-fill performance" style={{width: `${profileData.averageScore}%`}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-content animate-fade-up">
        {isGuestUser && (
          <div className="guest-info-banner" style={{
            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
            color: 'white',
            padding: '15px 20px',
            borderRadius: '10px',
            margin: '20px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '16px',
            fontWeight: '500'
          }}>
            <span className="guest-icon">👤</span>
            <span>You are logged in as a guest. Profile changes are not allowed.</span>
          </div>
        )}

        <div className="tabs-container">
          <button 
            className={`tab-button ${activeTab === "profile" ? "active" : ""}`} 
            onClick={() => setActiveTab("profile")}
          >
            <span className="tab-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </span>
            <span className="tab-text">Profile Details</span>
            <div className="tab-indicator"></div>
          </button>
          <button 
            className={`tab-button ${activeTab === "quizResults" ? "active" : ""}`} 
            onClick={() => setActiveTab("quizResults")}
          >
            <span className="tab-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
            </span>
            <span className="tab-text">Quiz Results</span>
            <div className="tab-indicator"></div>
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "profile" && (
            <div className="profile-edit-section animate-content">
              <div className="profile-section-header">
                <div className="header-content">
                  <h2>Profile Details</h2>
                  <p className="section-subtitle">Manage your personal info</p>
                </div>
                {!isGuestUser && (
                  <button 
                    className={`edit-button ${editMode ? 'cancel' : 'edit'}`}
                    onClick={() => setEditMode(!editMode)}
                  >
                    <span className="button-icon">
                      {editMode ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      )}
                    </span>
                    <span className="button-text">{editMode ? "Cancel" : "Edit"}</span>
                    <div className="button-shine"></div>
                  </button>
                )}
              </div>

              <div className="profile-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>
                      <span className="label-icon">👤</span>
                      Name Surname
                    </label>
                    {editMode && !isGuestUser ? (
                      <input
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Adınız ve Soyadınız"
                      />
                    ) : (
                      <div className="form-display">
                        <span className="display-value">{profileData.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>
                      <span className="label-icon">📧</span>
                      Email
                    </label>
                    <div className="form-display readonly">
                      <span className="display-value">{profileData.email}</span>
                      <span className="readonly-badge">Read-Only</span>
                    </div>
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>
                    <span className="label-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10,9 9,9 8,9"/>
                      </svg>
                    </span>
                    About Me
                  </label>
                  {editMode && !isGuestUser ? (
                    <textarea
                      name="bio"
                      value={profileData.bio}
                      onChange={handleChange}
                      className="form-textarea"
                      placeholder="Kendiniz hakkında birkaç cümle yazın..."
                      rows="4"
                    />
                  ) : (
                    <div className="form-display bio">
                      <span className="display-value bio-text">{profileData.bio}</span>
                    </div>
                  )}
                </div>

                {editMode && !isGuestUser && (
                  <div className="form-actions">
                    <button 
                      onClick={handleSave} 
                      disabled={saving}
                      className="save-button"
                    >
                      <span className="button-icon">
                        {saving ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="2" x2="12" y2="6"/>
                            <line x1="12" y1="18" x2="12" y2="22"/>
                            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
                            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
                            <line x1="2" y1="12" x2="6" y2="12"/>
                            <line x1="18" y1="12" x2="22" y2="12"/>
                            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
                            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                            <polyline points="17,21 17,13 7,13 7,21"/>
                            <polyline points="7,3 7,8 15,8"/>
                          </svg>
                        )}
                      </span>
                      <span className="button-text">{saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}</span>
                      <div className="button-ripple"></div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "quizResults" && (
            <div className="quiz-results-section animate-content">
              <div className="section-header">
                <div className="header-content">
                  <h2>My Quiz Results</h2>
                  <p className="section-subtitle">Detailed results of the quizzes you’ve completed</p>
                </div>
                <div className="results-summary">
                  <span className="summary-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
                    </svg>
                  </span>
                  <span>Total {quizResults.length} quizzes completed</span>
                </div>
              </div>

              {quizResults.length > 0 ? (
                <div className="quiz-results-grid">
                  {quizResults.map((result, index) => (
                    <div key={index} className="quiz-result-card" style={{"--index": index}}>
                      <div className="quiz-card-header">
                        <div className="quiz-info">
                          <h3 className="quiz-name">{result.quizName}</h3>
                          <div className="quiz-difficulty">
                            <span className={`difficulty-badge ${result.difficulty}`}>
                              {result.difficulty === 'basic' ? 'Basic' : 
                               result.difficulty === 'midd' ? 'Intermadiate' : 'Hard'}
                            </span>
                          </div>
                        </div>
                        <div className="quiz-score-circle">
                          <svg className="score-ring" viewBox="0 0 36 36">
                            <path className="score-ring-bg"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path className="score-ring-fill"
                              strokeDasharray={`${result.score}, 100`}
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              style={{stroke: getScoreColor(result.score)}}
                            />
                          </svg>
                          <div className="score-text">{result.score}%</div>
                        </div>
                      </div>
                      
                      <div className="quiz-card-content">
                        <div className="quiz-details">
                          <div className="detail-item correct">
                            <span className="detail-icon">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20,6 9,17 4,12"/>
                              </svg>
                            </span>
                            <span className="detail-text">
                              <strong>{result.correct}</strong> True
                            </span>
                          </div>
                          <div className="detail-item wrong">
                            <span className="detail-icon">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                              </svg>
                            </span>
                            <span className="detail-text">
                              <strong>{result.wrong}</strong> False
                            </span>
                          </div>
                          <div className="detail-item total">
                            <span className="detail-icon">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14,2 14,8 20,8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                                <polyline points="10,9 9,9 8,9"/>
                              </svg>
                            </span>
                            <span className="detail-text">
                              <strong>{result.total}</strong> Question
                            </span>
                          </div>
                          {result.timeUsed > 0 && (
                            <div className="detail-item time">
                              <span className="detail-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="10"/>
                                  <polyline points="12,6 12,12 16,14"/>
                                </svg>
                              </span>
                              <span className="detail-text">
                                <strong>{Math.floor(result.timeUsed / 60)}:{(result.timeUsed % 60).toString().padStart(2, '0')}</strong>
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="quiz-card-footer">
                          <span className="quiz-date">
                            <span className="date-icon">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                              </svg>
                            </span>
                            {result.date}
                          </span>
                          <span className="performance-badge" style={{ 
                            background: `linear-gradient(135deg, ${getScoreColor(result.score)}, ${getScoreColor(result.score)}dd)`
                          }}>
                            {getPerformanceLevel(result.score)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="card-glow"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-animation">
                    <div className="empty-icon">
                      <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10,9 9,9 8,9"/>
                      </svg>
                    </div>
                    <div className="empty-particles">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className={`empty-particle particle-${i}`}></div>
                      ))}
                    </div>
                  </div>
                  <h3>You haven't taken any quizzes yet</h3>
                  <p>Start taking quizzes and track your progress!</p>
                  <button 
                    className="cta-button"
                    onClick={() => navigate("/quizzes")}
                  >
                    <span className="button-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/>
                      </svg>
                    </span>
                    <span className="button-text">Start Quiz</span>
                    <div className="button-shine"></div>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;