import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { db, auth } from "../firebase";
import { ref, get } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import "../styles/QuizResults.css";

const getScoreColor = (percentage) => {
  if (percentage >= 80) return "#10b981";
  if (percentage >= 60) return "#f59e0b"; 
  return "#ef4444";
};

const quizCategoryInfo = {
  basic: {
    title: "Basic",
    description: "Learn the foundations of networking concepts and protocols.",
    difficulty: "Basic",
    icon: "📊",
    color: "#4a6cfa"
  },
  midd: {  
    title: "Middle", 
    description: "Understand firewall setup and detect network intrusions.",
    difficulty: "Intermediate",
    icon: "🛡️",
    color: "#ff9500"
  },
  hard: {
    title: "Hard",
    description: "Master ethical hacking techniques and penetration strategies.", 
    difficulty: "Advanced",
    icon: "⚡",
    color: "#ff3b30"
  }
};

const QuizResults = () => {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [quizResults, setQuizResults] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userId, setUserId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  // User authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        fetchResults(user.uid);
      } else {
        setLoading(false);
        setQuizResults([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchResults = async (currentUserId) => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userId = currentUserId || auth.currentUser?.uid;
      const path = `Users/userResults/quizResults/${userId}`;
      
      console.log("📊 Loading quiz results:", path);
      
      const resultsRef = ref(db, path);
      const snapshot = await get(resultsRef);

      if (snapshot.exists()) {
        const resultsObj = snapshot.val();
        const resultsArray = [];

        for (const [key, value] of Object.entries(resultsObj)) {
          console.log("📋 Processing quiz result:", { key, value });
          
          let categoryKey = "basic";
          let quizId = "";
        
          const keyParts = key.split('_');
          if (keyParts.length >= 2) {
            categoryKey = keyParts[0];
            quizId = keyParts[1];
          } else {
            if (value.difficulty) {
              categoryKey = value.difficulty.toLowerCase();
            } else if (value.category) {
              categoryKey = value.category.toLowerCase();
            }
            
            if (value.quizId) {
              quizId = value.quizId;
            }
          }

          console.log(`🔍 Extracted - Category: ${categoryKey}, Quiz ID: ${quizId}`);

          let firebaseCategoryKey = categoryKey;
          if (categoryKey === "middle" || categoryKey === "midd") {
            firebaseCategoryKey = "midd"; 
          }

          let correctAnswersMap = {};
          let questionOptionsMap = {};
          
          if (firebaseCategoryKey && quizId) {
            try {
              console.log(`🔍 Firebase path: Quizzes/${firebaseCategoryKey}/${quizId}`);
              const quizRef = ref(db, `Quizzes/${firebaseCategoryKey}/${quizId}`);
              const quizSnapshot = await get(quizRef);
              
              if (quizSnapshot.exists()) {
                const quizData = quizSnapshot.val();
                console.log("📚 Quiz data loaded:", Object.keys(quizData));
                
                const questionKeys = Object.keys(quizData)
                  .filter(key => key.startsWith('Q'))
                  .sort((a, b) => {
                    const numA = parseInt(a.substring(1));
                    const numB = parseInt(b.substring(1));
                    return numA - numB;
                  });

                console.log("📝 Sorted questions:", questionKeys);

                questionKeys.forEach(qKey => {
                  const questionData = quizData[qKey];
                  if (questionData) {
                    console.log(`📝 Question ${qKey}:`, questionData);
                    
                    let options = [];
                    if (Array.isArray(questionData.options)) {
                      options = questionData.options;
                    } else if (typeof questionData.options === 'object') {
                      options = Object.values(questionData.options);
                    }
                    
                    questionOptionsMap[qKey] = options;
                    
                    if (questionData.correctAnswer) {
                      if (typeof questionData.correctAnswer === 'string') {
                        correctAnswersMap[qKey] = questionData.correctAnswer;
                      } else if (typeof questionData.correctAnswer === 'number') {
                        const correctIndex = questionData.correctAnswer;
                        correctAnswersMap[qKey] = options[correctIndex] || 'Unknown';
                      }
                    }
                    
                    console.log(`✅ ${qKey}: Correct = ${correctAnswersMap[qKey]}, Options =`, options);
                  }
                });
                
                console.log(`✅ Correct answers loaded for ${quizId}:`, correctAnswersMap);
              } else {
                console.log(`⚠️ Quiz data not found: Quizzes/${firebaseCategoryKey}/${quizId}`);
              }
            } catch (error) {
              console.error(`❌ Error loading quiz data for ${quizId}:`, error);
            }
          }

          const userAnswers = value.userAnswers || {};
          let correctCount = 0;
          let wrongCount = 0;
          
          Object.entries(userAnswers).forEach(([questionKey, userAnswer]) => {
            const correctAnswer = correctAnswersMap[questionKey];
            if (correctAnswer && userAnswer === correctAnswer) {
              correctCount++;
            } else {
              wrongCount++;
            }
          });

          console.log(`📊 Score calculation: ${correctCount} correct, ${wrongCount} wrong`);

          const totalQuestions = Object.keys(userAnswers).length;
          const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
          
          let formattedQuizName = "Unknown Quiz";
          if (value.quizName) {
            formattedQuizName = value.quizName.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
          } else if (quizId) {
            formattedQuizName = quizId.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
          }

          if (categoryKey === "intermediate" || categoryKey === "middle") {
            categoryKey = "midd";
          } else if (categoryKey === "advanced") {
            categoryKey = "hard";
          }

          const categoryInfo = quizCategoryInfo[categoryKey] || quizCategoryInfo.basic;

          resultsArray.push({
            id: key,
            quizName: formattedQuizName,
            category: categoryKey,
            categoryTitle: categoryInfo.title,
            categoryIcon: categoryInfo.icon,
            categoryColor: categoryInfo.color,
            score: scorePercentage,
            correct: correctCount, 
            wrong: wrongCount, 
            total: totalQuestions,
            timeUsed: value.timeUsed || 0,
            date: value.date || new Date(value.timestamp).toLocaleString("en-US"),
            timestamp: value.timestamp || Date.now(),
            device: value.device || "Web",
            userAnswers: userAnswers,
            correctAnswers: correctAnswersMap, 
            questionOptions: questionOptionsMap, 
            rawData: value
          });
        }

        resultsArray.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setQuizResults(resultsArray);
        
        console.log("✅ Quiz results loaded with correct answers:", resultsArray.length);
        console.log("📊 Sample result:", resultsArray[0]);
      } else {
        console.log("⚠️ No quiz results found for this user");
        setQuizResults([]);
      }
    } catch (err) {
      console.error("❌ Error loading quiz results:", err);
      setQuizResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Bring the leaderboard
  const fetchLeaderboard = async () => {
    try {
      console.log("🏆 Loading leaderboard...");
    
      const userDataRef = ref(db, "Users/userData");
      const userDataSnapshot = await get(userDataRef);
      
      if (!userDataSnapshot.exists()) {
        console.log("⚠️ User data not found");
        setLeaderboardData([]);
        return;
      }
      
      const allUserData = userDataSnapshot.val();
      const userAggregate = {};
      const difficulties = ["basic", "midd", "hard"];
      
      for (const difficulty of difficulties) {
        const resultsRef = ref(db, `Users/userResults/generalResults/${difficulty}`);
        const resultsSnapshot = await get(resultsRef);
        
        if (!resultsSnapshot.exists()) continue;
        
        const quizResults = resultsSnapshot.val();
        
        Object.keys(quizResults).forEach(quizId => {
          const usersInQuiz = quizResults[quizId];
          
          Object.entries(usersInQuiz).forEach(([userId, result]) => {
            if (!result || typeof result !== 'object' || !result.score || !result.total) {
              return;
            }
            
            const percentage = Math.round((result.score / result.total) * 100);
            
            if (!userAggregate[userId]) {
              const userInfo = allUserData[userId];
              
              userAggregate[userId] = {
                userId: userId,
                name: userInfo?.name || `User-${userId.slice(0, 6)}`,
                avatar: generateInitials(userInfo?.name || "User"),
                totalScore: 0,
                bestScore: 0,
                correctAnswers: 0,
                quizzesTaken: 0,
                lastActive: 0
              };
            }
            
            const user = userAggregate[userId];
            user.totalScore += percentage;
            user.correctAnswers += result.score;
            user.quizzesTaken += 1;
            user.bestScore = Math.max(user.bestScore, percentage);
            user.lastActive = Math.max(user.lastActive, result.timestamp || 0);
          });
        });
      }
      
      // Create the leaderboard
      const leaderboardArray = Object.values(userAggregate)
        .filter(user => user.quizzesTaken > 0)
        .map((user) => ({
          ...user,
          averageScore: Math.round(user.totalScore / user.quizzesTaken)
        }))
        .sort((a, b) => b.averageScore - a.averageScore)
        .slice(0, 10)
        .map((user, index) => ({
          ...user,
          rank: index + 1
        }));
      
      setLeaderboardData(leaderboardArray);
      console.log("✅ Leaderboard loaded:", leaderboardArray.length, "users");
      
    } catch (err) {
      console.error("❌ Error loading leaderboard:", err);
      setLeaderboardData([]);
    }
  };

  // Auxiliary functions
  const generateInitials = (name) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Filtering and sorting 
  const filteredResults = quizResults
    .filter(result => {
      const matchesSearch = result.quizName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || result.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "score":
          return b.score - a.score;
        case "category":
          return a.category.localeCompare(b.category);
        case "date":
        default:
          return new Date(b.timestamp) - new Date(a.timestamp);
      }
    });

  // Statistics
    const averageScore = filteredResults.length
    ? Math.round(filteredResults.reduce((acc, cur) => acc + cur.score, 0) / filteredResults.length)
    : 0;

    const highestScore = filteredResults.length 
    ? Math.max(...filteredResults.map(r => r.score))
    : 0;
    
    const totalQuizzes = filteredResults.length;
    const chartData = filteredResults.slice(0, 8).map(result => {
    let displayName = result.quizName || "Unknown Quiz";
    
    if (displayName === "Unknown Quiz") {
      if (result.id) {
        displayName = result.id
          .replace(/_/g, " ")
          .toLowerCase()
          .replace(/\b\w/g, l => l.toUpperCase());
      }
    }
    
    return {
      name: displayName.length > 15 ? displayName.substring(0, 12) + "..." : displayName,
      fullName: displayName, 
      score: result.score,
      fill: getScoreColor(result.score)
    };
  });

  // Category based statistics
  const categoryStats = Object.keys(quizCategoryInfo).map(categoryKey => {
    const categoryResults = quizResults.filter(r => r.category === categoryKey);
    const avgScore = categoryResults.length 
      ? Math.round(categoryResults.reduce((acc, cur) => acc + cur.score, 0) / categoryResults.length)
      : 0;
      
    console.log(`Category ${categoryKey}: ${categoryResults.length} quizzes, avg: ${avgScore}%`);
      
    return {
      category: categoryKey,
      ...quizCategoryInfo[categoryKey],
      count: categoryResults.length,
      averageScore: avgScore
    };
  });

  // Loading status
  if (loading) {
    return (
      <>
        <Header />
        <div className="quiz-results-container">
          <div className="quiz-results-wrapper light">
            <div className="quiz-results-page">
              <div className="qr-loading-section">
                <div className="qr-loading-spinner">
                  <div className="qr-spinner"></div>
                </div>
                <h3>Loading quiz results...</h3>
                <p>Getting your data, please wait.</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Required input
  if (!userId) {
    return (
      <>
        <Header />
        <div className="quiz-results-container">
          <div className="quiz-results-wrapper light">
            <div className="quiz-results-page">
              <div className="qr-auth-section">
                <div className="qr-auth-icon">🔐</div>
                <h2>Login Required</h2>
                <p>Please log in to view your quiz results and track your progress.</p>
                <button 
                  className="qr-auth-button"
                  onClick={() => window.location.href = '/login'}
                >
                  <span>🚀</span>
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="quiz-results-container">
        <div className="quiz-results-wrapper light">
          <div className="quiz-results-page">
            
            {/* Hero Section */}
            <div className="qr-hero-section">
              <div className="qr-hero-content">
                <h1 className="qr-main-title">
                  My Quiz Results
                 
                </h1>
                <p className="qr-hero-subtitle">
                  Track all your quiz performances in one place and observe your progress
                </p>
              </div>
              
              {/* Stats Overview */}
              <div className="qr-stats-overview">
                <div className="qr-stat-item">
                  <div className="qr-stat-icon">🎯</div>
                  <div className="qr-stat-content">
                    <span className="qr-stat-value">{averageScore}%</span>
                    <span className="qr-stat-label">Average Score</span>
                  </div>
                </div>
                
                <div className="qr-stat-item">
                  <div className="qr-stat-icon">🏆</div>
                  <div className="qr-stat-content">
                    <span className="qr-stat-value">{highestScore}%</span>
                    <span className="qr-stat-label">Highest Score</span>
                  </div>
                </div>
                
                <div className="qr-stat-item">
                  <div className="qr-stat-icon">📚</div>
                  <div className="qr-stat-content">
                    <span className="qr-stat-value">{totalQuizzes}</span>
                    <span className="qr-stat-label">Total Quizzes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="qr-action-bar">
              <div className="qr-action-group">
                <button 
                  onClick={() => {
                    setShowLeaderboard(!showLeaderboard);
                    if (!showLeaderboard) fetchLeaderboard();
                  }} 
                  className={`qr-action-btn ${showLeaderboard ? 'active' : ''}`}
                >
                  🏆 Leaderboard
                </button>
              </div>
            </div>

            {/* Leaderboard right after action bar */}
            {showLeaderboard && (
              <div className="qr-leaderboard-section">
                <h2 className="qr-section-title">
                  <span className="qr-section-icon">🏆</span>
                  Leaderboard
                </h2>
                
                {leaderboardData.length === 0 ? (
                  <div className="qr-leaderboard-empty">
                    <div className="qr-empty-icon">🏆</div>
                    <h3>No leaderboard data yet</h3>
                    <p>Leaderboard will appear here when the first quiz results arrive.</p>
                  </div>
                ) : (
                  <div className="qr-leaderboard-container">
                    <div className="qr-leaderboard-header">
                      <span className="qr-leaderboard-subtitle">
                        Top {leaderboardData.length} most successful users
                      </span>
                    </div>
                    
                    <div className="qr-leaderboard-list">
                      {leaderboardData.map((user, index) => (
                        <div 
                          key={user.userId} 
                          className={`qr-leaderboard-item ${index < 3 ? 'qr-top-three' : ''}`}
                          style={{ "--delay": `${index * 0.1}s` }}
                        >
                          <div className="qr-rank-section">
                            <div className={`qr-rank-badge qr-rank-${index + 1}`}>
                              {index === 0 && '🥇'}
                              {index === 1 && '🥈'}  
                              {index === 2 && '🥉'}
                              {index > 2 && (index + 1)}
                            </div>
                          </div>
                          
                          <div className="qr-user-section">
                            <div className="qr-user-avatar">{user.avatar}</div>
                            <div className="qr-user-info">
                              <span className="qr-user-name">{user.name}</span>
                              <span className="qr-user-stats">
                                {user.quizzesTaken} quizzes • {user.correctAnswers} correct
                              </span>
                            </div>
                          </div>
                          
                          <div className="qr-score-section">
                            <div className="qr-score-main">
                              <span className="qr-score-percent">{user.averageScore}%</span>
                              <span className="qr-score-label">Average</span>
                            </div>
                            <div className="qr-best-score">
                              Best: {user.bestScore}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Category Performance */}
            <div className="qr-category-performance">
              <h2 className="qr-section-title">
                <span className="qr-section-icon">📈</span>
                Category Performance
              </h2>
              
              <div className="qr-category-grid">
                {categoryStats.map(stat => (
                  <div 
                    key={stat.category} 
                    className="qr-category-card" 
                    style={{ "--category-color": stat.color }}
                  >
                    <div className="qr-category-header">
                      <div className="qr-category-icon">{stat.icon}</div>
                      <div className="qr-category-info">
                        <h3>{stat.title}</h3>
                        <span className="qr-category-difficulty">{stat.difficulty}</span>
                      </div>
                    </div>
                    
                    <div className="qr-category-stats">
                      <div className="qr-category-stat">
                        <span className="qr-stat-number">{stat.count}</span>
                        <span className="qr-stat-text">Quizzes Solved</span>
                      </div>
                      <div className="qr-category-stat">
                        <span className="qr-stat-number">{stat.averageScore}%</span>
                        <span className="qr-stat-text">Average Score</span>
                      </div>
                    </div>
                    
                    <div className="qr-category-progress">
                      <div 
                        className="qr-progress-fill" 
                        style={{ width: `${stat.averageScore}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Filters Section */}
            <div className="qr-filters-section">
              <h2 className="qr-section-title">
                <span className="qr-section-icon">🔍</span>
                Filter Results
              </h2>
              
              <div className="qr-filters-container">
                <div className="qr-search-container">
                  <input
                    type="text"
                    placeholder="Search by quiz name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="qr-search-input"
                  />
                  <div className="qr-search-icon">🔍</div>
                </div>

                <div className="qr-filter-controls">
                  <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="qr-filter-select"
                  >
                    <option value="all">🎯 All Categories</option>
                    <option value="basic">📊 Basic</option>
                    <option value="midd">🛡️ Middle</option>  
                    <option value="hard">⚡ Hard</option>
                  </select>

                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="qr-filter-select"
                  >
                    <option value="date">📅 By Date</option>
                    <option value="score">📊 By Score</option>
                    <option value="category">📂 By Category</option>
                  </select>
                </div>
              </div>
            </div>

            {filteredResults.length === 0 ? (
              <div className="qr-empty-state">
                <div className="qr-empty-illustration">
                  <div className="qr-empty-icon">📝</div>
                  <div className="qr-empty-shapes">
                    <div className="qr-shape qr-shape-1"></div>
                    <div className="qr-shape qr-shape-2"></div>
                    <div className="qr-shape qr-shape-3"></div>
                  </div>
                </div>
                <h3>You don't have any quiz results yet</h3>
                <p>Start solving quizzes and all your results will be displayed here!</p>
                <button 
                  className="qr-cta-button"
                  onClick={() => window.location.href = '/quizzes'}
                >
                  <span>🚀</span>
                  Start Solving Quizzes
                </button>
              </div>
            ) : (
              <>

                {chartData.length > 0 && (
                  <div className="qr-chart-section">
                    <h2 className="qr-section-title">
                      <span className="qr-section-icon">📊</span>
                      Performance Analysis
                    </h2>
                    
                    <div className="qr-chart-container">
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--qr-divider-light)" opacity={0.3} />
                          <XAxis 
                            dataKey="name" 
                            angle={-45}
                            textAnchor="end"
                            height={100}
                            interval={0}
                            tick={{ fontSize: 12, fill: 'var(--qr-text-secondary-light)' }}
                          />
                          <YAxis 
                            domain={[0, 100]} 
                            tick={{ fill: 'var(--qr-text-secondary-light)' }}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: 'var(--qr-card-light)',
                              border: 'none',
                              borderRadius: '16px',
                              boxShadow: 'var(--qr-shadow-xl)',
                              color: '#000000'
                            }}
                            formatter={(value, name, props) => [`${value}%`, 'Score']}
                            labelFormatter={(label, payload) => {
                              const data = payload?.[0]?.payload;
                              return data?.fullName || label;
                            }}
                            cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                          />
                          <Bar 
                            dataKey="score" 
                            radius={[8, 8, 0, 0]}
                            fill="url(#colorGradient)"
                          />
                          <defs>
                            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#6366f1" />
                              <stop offset="100%" stopColor="#8b5cf6" />
                            </linearGradient>
                          </defs>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                <div className="qr-results-section">
                  <h2 className="qr-section-title">
                    <span className="qr-section-icon">📋</span>
                    Quiz Results ({filteredResults.length})
                  </h2>
                  
                  <div className="qr-results-grid">
                    {filteredResults.map((result, index) => {
                      const scorePercent = result.score;
                      const barColor = getScoreColor(scorePercent);
                      return (
                        <div key={result.id} className="qr-result-card" style={{ "--delay": `${index * 0.1}s` }}>
                          <div className="qr-card-header">
                            <div className="qr-quiz-info">
                              <div 
                                className="qr-category-badge" 
                                style={{ "--badge-color": result.categoryColor }}
                              >
                                <span className="qr-badge-icon">{result.categoryIcon}</span>
                                <span className="qr-badge-text">{result.categoryTitle}</span>
                              </div>
                              <h3 className="qr-quiz-title">{result.quizName}</h3>
                            </div>
                          </div>
                          
                          <div className="qr-score-display">
                            <div className="qr-score-circle">
                              <svg viewBox="0 0 36 36" className="qr-circular-chart">
                                <path 
                                  className="qr-circle-bg"
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path 
                                  className="qr-circle"
                                  strokeDasharray={`${scorePercent}, 100`}
                                  stroke={barColor}
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                              </svg>
                              <div className="qr-score-text">
                                <span className="qr-score-value" style={{ color: barColor }}>
                                  {scorePercent}%
                                </span>
                                <span className="qr-score-fraction">
                                  {result.correct}/{result.total}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="qr-result-details">
                            <div className="qr-detail-row">
                              <div className="qr-detail-item">
                                <span className="qr-detail-icon">✅</span>
                                <span className="qr-detail-label">Correct</span>
                                <span className="qr-detail-value">{result.correct}</span>
                              </div>
                              <div className="qr-detail-item">
                                <span className="qr-detail-icon">❌</span>
                                <span className="qr-detail-label">Wrong</span>
                                <span className="qr-detail-value">{result.wrong}</span>
                              </div>
                            </div>
                            
                            <div className="qr-detail-row">
                              <div className="qr-detail-item">
                                <span className="qr-detail-icon">⏱️</span>
                                <span className="qr-detail-label">Time</span>
                                <span className="qr-detail-value">{formatTime(result.timeUsed)}</span>
                              </div>
                              <div className="qr-detail-item">
                                <span className="qr-detail-icon">💻</span>
                                <span className="qr-detail-label">Device</span>
                                <span className="qr-detail-value">{result.device}</span>
                              </div>
                            </div>
                            
                            <div className="qr-detail-date">
                              <span className="qr-detail-icon">📅</span>
                              <span className="qr-detail-label">Date:</span>
                              <span className="qr-detail-value">{result.date}</span>
                            </div>
                          </div>

                          {Object.keys(result.userAnswers).length > 0 && (
                            <details className="qr-answer-details">
                              <summary className="qr-answer-summary">
                                <span>📋 Detailed Results ({Object.keys(result.userAnswers).length} Questions)</span>
                                <span className="qr-summary-icon">▼</span>
                              </summary>
                              <div className="qr-answers-content">
                                {(() => {
                                  const sortedAnswers = Object.entries(result.userAnswers).sort(([a], [b]) => {
                                    const numA = parseInt(a.replace(/\D/g, '')) || 0;
                                    const numB = parseInt(b.replace(/\D/g, '')) || 0;
                                    return numA - numB;
                                  });

                                  return sortedAnswers.map(([questionKey, userAnswer], index) => {
                                    const questionNumber = index + 1;
                                
                                    const correctAnswer = result.correctAnswers?.[questionKey] || 'Data not available';
                                    const isCorrect = userAnswer === correctAnswer;
                                    
                                    console.log(`🔍 Q${questionNumber}: User="${userAnswer}", Correct="${correctAnswer}", isCorrect=${isCorrect}`);
                                    
                                    return (
                                      <div 
                                        key={questionKey} 
                                        className={`qr-answer-item ${isCorrect ? 'correct' : 'incorrect'}`}
                                        style={{ '--index': index }}
                                      >
                                        <div className="qr-question-header">
                                          <span className="qr-question-number">Q{questionNumber}</span>
                                          <div className={`qr-answer-status ${isCorrect ? 'correct' : 'incorrect'}`}>
                                            {isCorrect ? (
                                              <>
                                                <span className="qr-status-icon">✅</span>
                                                <span className="qr-status-text">Correct</span>
                                              </>
                                            ) : (
                                              <>
                                                <span className="qr-status-icon">❌</span>
                                                <span className="qr-status-text">Wrong</span>
                                              </>
                                            )}
                                          </div>
                                        </div>
                                        
                                        <div className="qr-answer-content">
                                          <div className="qr-user-answer">
                                            <span className="qr-answer-label">Your Answer:</span>
                                            <span className={`qr-answer-value ${isCorrect ? 'correct' : 'incorrect'}`}>
                                              {userAnswer || 'No answer provided'}
                                            </span>
                                          </div>
                                          <div className="qr-correct-answer">
                                            <span className="qr-answer-label">Correct Answer:</span>
                                            <span className="qr-answer-value correct">
                                              {correctAnswer}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  });
                                })()}
                              </div>
                            </details>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default QuizResults;