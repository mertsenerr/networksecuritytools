import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Quizzes.css";
import { db } from "../firebase";
import { ref, get, set, child, push, query, orderByChild, limitToLast } from "firebase/database";
import Footer from "../components/Footer";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const Quizzes = () => {

  // Main States
  const [quizCategories, setQuizCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState(null);
  
  // Quiz status states
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(300); // 5 dakika
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timer, setTimer] = useState(null);
  const [score, setScore] = useState(0);
  
  // User states
  const [userId, setUserId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Leaderboard States
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [selectedLeaderboardDifficulty, setSelectedLeaderboardDifficulty] = useState('weighted');
  
  // Quiz Lock States
  const [userQuizProgress, setUserQuizProgress] = useState({});
  const [unlockedQuizzes, setUnlockedQuizzes] = useState({});

  const [showIncompleteModal, setShowIncompleteModal] = useState(false);
  const [incompleteQuestions, setIncompleteQuestions] = useState([]);
  
  // Other States
  const [showFooter, setShowFooter] = useState(false);
  const navigate = useNavigate();
  
  const quizCategoryInfo = {
    basic: {
      title: "Basic",
      description: "Learn the foundations of networking concepts and protocols.",
      longDescription: "Master fundamental networking concepts including IP addressing, subnets, DNS, and basic network security principles.",
      difficulty: "Basic",
      icon: "📊",
      iconImage: "/path/to/icon.svg",
      color: "#4a6cfa",
      duration: "15-20 min"
    },
    middle: {
      title: "Middle",
      description: "Understand firewall setup and detect network intrusions.",
      longDescription: "Learn to configure firewalls, detect common attacks, and implement essential security measures to protect networks.",
      difficulty: "Intermediate",
      icon: "🛡️",
      iconImage: "/path/to/icon.svg",
      color: "#ff9500",
      duration: "20-25 min"
    },
    hard: {
      title: "Hard",
      description: "Master ethical hacking techniques and penetration strategies.",
      longDescription: "Explore advanced penetration testing methodologies, vulnerability assessment, and ethical hacking practices.",
      difficulty: "Advanced",
      icon: "⚡",
      iconImage: "/path/to/icon.svg",
      color: "#ff3b30",
      duration: "25-30 min"
    }
  };
  
  // Function that loads user's quiz progress
  const loadUserQuizProgress = async (categoriesData) => {
    try {
      const progressData = {};
      const unlockedData = {};
      
      console.log("🔍 loadUserQuizProgress başlatıldı, userId:", userId);
      
      if (!userId) {
        console.log("⚠️ UserId yok, progress yüklenemez");
        return;
      }
      
      for (const category of categoriesData) {
        if (!category.quizzes || category.quizzes.length === 0) continue;
        
        const categoryId = category.id;
        progressData[categoryId] = {};
        unlockedData[categoryId] = {};
        
        console.log(`📂 ${categoryId} kategorisi işleniyor, quiz sayısı:`, category.quizzes.length);
        
        // ✅ İlk quiz default açık
        const firstQuizId = category.quizzes[0].id;
        unlockedData[categoryId][firstQuizId] = true;
        
        const completedQuizIndices = [];
        
        // ✅ ÖNCE TÜM QUİZLERİ KONTROL ET
        for (let i = 0; i < category.quizzes.length; i++) {
          const quiz = category.quizzes[i];
          
          try {
            // Firebase'den quiz sonucunu kontrol et
            const resultRef = ref(db, `Users/userResults/generalResults/${categoryId}/${quiz.id}/${userId}`);
            const resultSnapshot = await get(resultRef);
            
            // EKSTRA: Mobil versiyonda farklı path olabilir, onu da kontrol et
            let mobileResult = null;
            if (!resultSnapshot.exists()) {
              const mobileResultRef = ref(db, `Users/userResults/quizResults/${userId}/${categoryId}_${quiz.id}`);
              const mobileSnapshot = await get(mobileResultRef);
              if (mobileSnapshot.exists()) {
                mobileResult = mobileSnapshot.val();
              }
            }
            
            const result = resultSnapshot.exists() ? resultSnapshot.val() : mobileResult;
            
            if (result && typeof result === 'object' && (result.completed === true || result.score !== undefined)) {
              console.log(`✅ Quiz ${quiz.id} TAMAMLANMIş:`, result);
              
              // Mobil'den gelen veriyi web formatına çevir
              const score = result.score || 0;
              const total = result.total || (result.questionsCount || 5); // Mobilde total yerine questionsCount olabilir
              
              progressData[categoryId][quiz.id] = {
                completed: true,
                score: score,
                total: total,
                percentage: total > 0 ? Math.round((score / total) * 100) : 0,
                locked: true,
                completedAt: result.completedAt || result.timestamp || result.date
              };
              
              completedQuizIndices.push(i);
              
              // EĞER MOBİLDEN GELİYORSA WEB FORMATINDA DA KAYDET
              if (mobileResult && !resultSnapshot.exists()) {
                console.log(`📱➡️🌐 Mobil verisi web formatında kaydediliyor: ${quiz.id}`);
                const webFormatData = {
                  score: score,
                  total: total,
                  wrong: total - score,
                  timeUsed: result.timeUsed || 0,
                  timestamp: result.timestamp || result.date || Date.now(),
                  device: "Mobile-Sync",
                  completed: true,
                  completedAt: result.completedAt || result.timestamp || new Date().toISOString(),
                  userId: userId,
                  quizId: quiz.id,
                  difficulty: categoryId,
                  sessionId: Date.now() + "_sync",
                  locked: true,
                  syncedFromMobile: true
                };
                
                try {
                  await set(ref(db, `Users/userResults/generalResults/${categoryId}/${quiz.id}/${userId}`), webFormatData);
                  console.log(`✅ Mobil veri web formatında kaydedildi: ${quiz.id}`);
                } catch (syncError) {
                  console.error(`❌ Mobil veri senkronizasyon hatası: ${quiz.id}`, syncError);
                }
              }
              
            } else {
              // Tamamlanmamış
              console.log(`❌ Quiz ${quiz.id} tamamlanmamış`);
              progressData[categoryId][quiz.id] = {
                completed: false,
                score: 0,
                total: 0,
                percentage: 0,
                locked: false
              };
            }
          } catch (error) {
            console.error(`❌ Quiz ${quiz.id} kontrol hatası:`, error);
            progressData[categoryId][quiz.id] = {
              completed: false,
              score: 0,
              total: 0,
              percentage: 0,
              locked: false
            };
          }
        }
        
        // ✅ Unlock logic - SIRALI unlock mantığı
        console.log(`📊 ${categoryId} tamamlanan quizler:`, completedQuizIndices);
        
        if (completedQuizIndices.length > 0) {
          // En büyük tamamlanan indeksi bul
          const maxCompletedIndex = Math.max(...completedQuizIndices);
          
          // Tamamlanan quiz'lerin ardışık olup olmadığını kontrol et
          let consecutiveCompleted = 0;
          for (let i = 0; i < category.quizzes.length; i++) {
            if (completedQuizIndices.includes(i)) {
              consecutiveCompleted = i + 1;
            } else {
              break; // İlk eksik quiz'de dur
            }
          }
          
          // Ardışık tamamlanan quiz'den sonraki quiz'i aç
          if (consecutiveCompleted < category.quizzes.length) {
            const nextQuizId = category.quizzes[consecutiveCompleted].id;
            unlockedData[categoryId][nextQuizId] = true;
            console.log(`🔓 Ardışık mantık: Sonraki quiz açıldı: ${nextQuizId} (index: ${consecutiveCompleted})`);
          }
          
          // EKSTRA: Eğer tüm quiz'ler tamamlanmışsa hiçbirini unlock etme
          if (consecutiveCompleted === category.quizzes.length) {
            console.log(`🏆 ${categoryId}: Tüm quiz'ler tamamlanmış!`);
          }
        }
        
        console.log(`📊 ${categoryId}: ${completedQuizIndices.length} quiz tamamlanmış, ${Object.keys(unlockedData[categoryId]).length} quiz açık`);
      }
      
      console.log("📊 Final progressData:", progressData);
      console.log("🔓 Final unlockedData:", unlockedData);
      
      setUserQuizProgress(progressData);
      setUnlockedQuizzes(unlockedData);
      
      console.log("✅ Quiz progress başarıyla yüklendi");
      
    } catch (error) {
      console.error("❌ Quiz progress yüklenirken hata:", error);
    }
  };

  // Function for quiz selection control
  const isQuizUnlocked = (categoryId, quizId) => {
    console.log(`🔍 isQuizUnlocked kontrol: ${categoryId}/${quizId}`);
    
    // ✅ İlk önce progress kontrol et
    const quizProgress = userQuizProgress[categoryId]?.[quizId];
    
    // Tamamlanan quiz'ler KİLİTLİ
    if (quizProgress?.completed === true) {
      console.log(`🔒 Quiz tamamlanmış, kilitli: ${quizId}`);
      return false;
    }
    
    // İlk quiz her zaman açık (tamamlanmamışsa)
    const category = quizCategories.find(cat => cat.id === categoryId);
    if (category && category.quizzes && category.quizzes.length > 0) {
      const firstQuizId = category.quizzes[0].id;
      if (quizId === firstQuizId && !quizProgress?.completed) {
        console.log(`✅ İlk quiz açık: ${quizId}`);
        return true;
      }
    }
    
    // Unlocked state kontrolü
    const isUnlockedInState = unlockedQuizzes[categoryId]?.[quizId] === true;
    console.log(`🔍 Unlock state: ${categoryId}/${quizId} = ${isUnlockedInState}`);
    
    return isUnlockedInState && !quizProgress?.completed;
  };

  // Unlock function after quiz completion
  const unlockNextQuiz = async (categoryId, currentQuizId) => {
  const category = quizCategories.find(cat => cat.id === categoryId);
  if (!category || !category.quizzes) return;
  
  const currentIndex = category.quizzes.findIndex(quiz => quiz.id === currentQuizId);
  if (currentIndex >= 0 && currentIndex < category.quizzes.length - 1) {
    const nextQuizId = category.quizzes[currentIndex + 1].id;
    
    console.log(`🔓 Sonraki quiz açılıyor: ${nextQuizId} (index: ${currentIndex + 1})`);
    
    // ✅ State'i güncelle
    setUnlockedQuizzes(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [nextQuizId]: true
      }
    }));
    
    console.log(`🔓 Sonraki quiz açıldı: ${nextQuizId}`);
    
    // ✅ Progress'i yenile (gecikme ile)
    setTimeout(async () => {
      if (quizCategories.length > 0) {
        console.log("🔄 Progress yenileniyor...");
        await loadUserQuizProgress(quizCategories);
      }
    }, 1000); // 1 saniye gecikme
  } else if (currentIndex === category.quizzes.length - 1) {
    console.log(`🏆 ${categoryId}: Son quiz tamamlandı!`);
  }
  };

  // Helper function for synchronizing mobile data
  const syncMobileDataToWeb = async () => {
  if (!userId) return;
  
  console.log("📱➡️🌐 Mobil veriler web formatına senkronize ediliyor...");
  
  try {
    // Mobil quiz sonuçlarını kontrol et
    const mobileResultsRef = ref(db, `Users/userResults/quizResults/${userId}`);
    const mobileSnapshot = await get(mobileResultsRef);
    
    if (!mobileSnapshot.exists()) {
      console.log("📱 Mobil veri bulunamadı");
      return;
    }
    
    const mobileResults = mobileSnapshot.val();
    console.log("📱 Mobil veriler bulundu:", Object.keys(mobileResults));
    
    for (const [key, result] of Object.entries(mobileResults)) {
      // key format: "basic_quiz1" veya "midd_quiz2" gibi
      const [difficulty, quizId] = key.split('_');
      
      if (result && result.score !== undefined) {
        // Web formatında aynı veri var mı kontrol et
        const webResultRef = ref(db, `Users/userResults/generalResults/${difficulty}/${quizId}/${userId}`);
        const webSnapshot = await get(webResultRef);
        
        if (!webSnapshot.exists()) {
          console.log(`📱➡️🌐 Senkronize ediliyor: ${difficulty}/${quizId}`);
          
          const webFormatData = {
            score: result.score || 0,
            total: result.total || result.questionsCount || 5,
            wrong: (result.total || result.questionsCount || 5) - (result.score || 0),
            timeUsed: result.timeUsed || 0,
            timestamp: result.timestamp || result.date || Date.now(),
            device: "Mobile-Sync",
            completed: true,
            completedAt: result.completedAt || result.timestamp || new Date().toISOString(),
            userId: userId,
            quizId: quizId,
            difficulty: difficulty,
            sessionId: Date.now() + "_mobile_sync",
            locked: true,
            syncedFromMobile: true
          };
          
          await set(webResultRef, webFormatData);
          console.log(`✅ Senkronize edildi: ${difficulty}/${quizId}`);
        }
      }
    }
    
    console.log("✅ Mobil-Web senkronizasyonu tamamlandı");
    
  } catch (error) {
    console.error("❌ Mobil-Web senkronizasyon hatası:", error);
  }
  };
  
  // Function that loads quizzes
  const loadQuizzes = async () => {
    try {
      console.log("📊 loadQuizzes başlatıldı, userId:", userId);
      
      // ✅ ÖNCE MOBİL VERİLERİ SENKRONİZE ET
      if (userId) {
        await syncMobileDataToWeb();
      }
      
      const quizzesRef = ref(db, "Quizzes");
      const snapshot = await get(quizzesRef);

      if (snapshot.exists()) {
        const quizzesData = snapshot.val();

        const quizzesByCategory = {
          basic: [],
          middle: [],
          hard: []
        };

        // ✅ Firebase'deki kategoriler "middle" yerine "midd" olabilir
        const categoryMappings = {
          basic: 'basic',
          middle: 'midd', // Firebase'de "midd" olarak saklanıyor olabilir
          midd: 'midd',
          hard: 'hard'
        };

        Object.keys(quizzesByCategory).forEach(localCategory => {
          const firebaseCategory = categoryMappings[localCategory] || localCategory;
          
          if (quizzesData[firebaseCategory]) {
            Object.entries(quizzesData[firebaseCategory]).forEach(([quizId, quizData]) => {
              quizzesByCategory[localCategory].push({
                id: quizId,
                title: quizId.replace(/_/g, " ").toUpperCase(),
                questionsCount: Object.keys(quizData).filter(key => key.startsWith('Q')).length,
                completionRate: Math.floor(Math.random() * 40) + 60
              });
            });
          }
          
          // Eğer "middle" kategorisi yoksa "midd" kategorisini dene
          if (localCategory === 'middle' && !quizzesData[firebaseCategory] && quizzesData['midd']) {
            Object.entries(quizzesData['midd']).forEach(([quizId, quizData]) => {
              quizzesByCategory[localCategory].push({
                id: quizId,
                title: quizId.replace(/_/g, " ").toUpperCase(),
                questionsCount: Object.keys(quizData).filter(key => key.startsWith('Q')).length,
                completionRate: Math.floor(Math.random() * 40) + 60
              });
            });
          }
        });

        // Quiz sıralaması (önemli: ID'ye göre sıralama)
        Object.keys(quizzesByCategory).forEach(difficulty => {
          quizzesByCategory[difficulty].sort((a, b) => {
            const aNum = parseInt(a.id.replace(/\D/g, '')) || 0;
            const bNum = parseInt(b.id.replace(/\D/g, '')) || 0;
            return aNum - bNum;
          });
        });

        // ✅ Kategori mapping'i düzelt
        const categoriesData = Object.entries(quizCategoryInfo).map(([categoryId, categoryInfo]) => {
          let mappedCategory = categoryId;
          if (categoryId === 'middle') mappedCategory = 'basic'; // Geçici düzeltme
          
          return {
            id: categoryId === 'middle' ? 'midd' : categoryId, // middle -> midd
            originalId: categoryId,
            ...categoryInfo,
            quizzes: quizzesByCategory[mappedCategory] || quizzesByCategory[categoryId] || []
          };
        });

        setQuizCategories(categoriesData);
        
        // ✅ KRITIK: userId varsa MUTLAKA progress yükle ve bekle
        if (userId) {
          console.log("🔄 Progress yükleniyor ve bekleniliyor...");
          await loadUserQuizProgress(categoriesData);
          console.log("✅ Progress yükleme tamamlandı");
        } else {
          console.log("⚠️ userId yok, progress yüklenmiyor");
        }
        
      } else {
        console.log("⚠️ Veritabanında quiz bulunamadı");
        const categoriesData = Object.entries(quizCategoryInfo).map(([categoryId, categoryInfo]) => ({
          id: categoryId === 'middle' ? 'midd' : categoryId,
          originalId: categoryId,
          ...categoryInfo,
          quizzes: []
        }));

        setQuizCategories(categoriesData);
        
        if (userId) {
          await loadUserQuizProgress(categoriesData);
        }
      }
    } catch (error) {
      console.error("❌ loadQuizzes hatası:", error);
    }
  };

  // Data loading function for guest users
  const loadGuestData = async () => {
    try {
      const categoriesData = Object.entries(quizCategoryInfo).map(([categoryId, categoryInfo]) => ({
        id: categoryId,
        ...categoryInfo,
        quizzes: []
      }));

      setQuizCategories(categoriesData);
      setLeaderboard([]);
      setLeaderboardLoading(false);
      
      console.log("👤 Misafir kullanıcı için temel veriler yüklendi");
    } catch (err) {
      console.error("❌ Misafir veri yükleme hatası:", err);
    }
  };
  
  const showIncompleteQuizModal = (unansweredQuestions) => {
    setIncompleteQuestions(unansweredQuestions);
    setShowIncompleteModal(true);
  };

  const renderIncompleteQuizModal = () => (
      <div className="incomplete-modal-overlay" onClick={() => setShowIncompleteModal(false)}>
        <div className="incomplete-modal" onClick={(e) => e.stopPropagation()}>
          <div className="incomplete-modal-header">
            <div className="incomplete-modal-icon">
              {/* ✅ YENİ SAAT İKONU */}
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
            </div>
            <h3>Quiz Not Completed</h3>
            <button 
              className="incomplete-modal-close"
              onClick={() => setShowIncompleteModal(false)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div className="incomplete-modal-content">
            <p className="incomplete-modal-message">
              You have to answer all the questions before finishing Quiz.
            </p>
            
            <div className="incomplete-questions-list">
              <h4>Unanswered Questions</h4>
              <div className="question-numbers">
                {incompleteQuestions.map((questionNum, index) => (
                  <button
                    key={questionNum} 
                    className="question-number-badge"
                    onClick={() => {
                      setCurrentQuestion(questionNum - 1);
                      setShowIncompleteModal(false);
                    }}
                  >
                    Question {questionNum}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="incomplete-modal-tip">
              <div className="tip-icon">💡</div>
              <span>You can click on a question number to jump directly to that question.</span>
            </div>
          </div>
          
          <div className="incomplete-modal-actions">
            <button 
              className="incomplete-modal-btn primary"
              onClick={() => {
                if (incompleteQuestions.length > 0) {
                  setCurrentQuestion(incompleteQuestions[0] - 1);
                }
                setShowIncompleteModal(false);
              }}
            >
              Go to First Unanswered Question
            </button>
            <button 
              className="incomplete-modal-btn secondary"
              onClick={() => setShowIncompleteModal(false)}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
  );


  const fetchLeaderboard = async () => {
    try {
      setLeaderboardLoading(true);
      console.log("📊 Tüm zorluk seviyelerindeki liderlik tablosu yükleniyor...");
      
      const userDataRef = ref(db, "Users/userData");
      const userDataSnapshot = await get(userDataRef);
      
      if (!userDataSnapshot.exists()) {
        console.log("⚠️ Kullanıcı verileri bulunamadı");
        setLeaderboard([]);
        setLeaderboardLoading(false);
        return;
      }
      
      const allUserData = userDataSnapshot.val();
      console.log("📋 Kullanıcı verileri alındı, kullanıcı sayısı:", Object.keys(allUserData).length);
      
      const userAggregate = {};
      const difficulties = ["basic", "midd", "hard"];
      
      for (const difficulty of difficulties) {
        console.log(`🔍 "${difficulty}" zorluğundaki sonuçlar kontrol ediliyor...`);
        
        const resultsRef = ref(db, `Users/userResults/generalResults/${difficulty}`);
        const resultsSnapshot = await get(resultsRef);
        
        if (!resultsSnapshot.exists()) {
          console.log(`⚠️ "${difficulty}" zorluğunda hiç quiz sonucu bulunamadı.`);
          continue;
        }
        
        const quizResults = resultsSnapshot.val();
        console.log(`📝 ${difficulty} zorluğunda ${Object.keys(quizResults).length} quiz bulundu`);
        
        Object.keys(quizResults).forEach(quizId => {
          const usersInQuiz = quizResults[quizId];
          
          Object.entries(usersInQuiz).forEach(([userId, result]) => {
            if (!result || typeof result !== 'object' || !result.score || !result.total) {
              return;
            }
            
            const percent = (result.score / result.total) * 100;
            
            if (!userAggregate[userId]) {
              const userInfo = allUserData[userId];
              
              let displayName;
              if (userInfo && userInfo.name) {
                displayName = userInfo.name;
              } else {
                displayName = `User-${userId.slice(0, 6)}`;
              }
              
              userAggregate[userId] = {
                userId: userId,
                name: displayName,
                avatar: generateInitials(displayName),
                totalScore: 0,
                bestScore: 0,
                correctAnswers: 0,
                quizzesTaken: 0,
                lastActive: 0,
                difficultyScores: {
                  basic: { total: 0, count: 0 },
                  midd: { total: 0, count: 0 },
                  hard: { total: 0, count: 0 }
                }
              };
            }
            
            const user = userAggregate[userId];
            user.totalScore += percent;
            user.correctAnswers += result.score;
            user.quizzesTaken += 1;
            user.bestScore = Math.max(user.bestScore, percent);
            user.lastActive = Math.max(user.lastActive, result.timestamp || 0);
            
            user.difficultyScores[difficulty].total += percent;
            user.difficultyScores[difficulty].count += 1;
          });
        });
      }
      
      const leaderboardArray = Object.values(userAggregate)
        .filter(user => user.quizzesTaken > 0)
        .map((user) => {
          const basicAvg = user.difficultyScores.basic.count > 0 
            ? user.difficultyScores.basic.total / user.difficultyScores.basic.count 
            : 0;
            
          const middAvg = user.difficultyScores.midd.count > 0 
            ? user.difficultyScores.midd.total / user.difficultyScores.midd.count 
            : 0;
            
          const hardAvg = user.difficultyScores.hard.count > 0 
            ? user.difficultyScores.hard.total / user.difficultyScores.hard.count 
            : 0;
          
          const weightedTotal = 
            (basicAvg * 1 * user.difficultyScores.basic.count) + 
            (middAvg * 1.5 * user.difficultyScores.midd.count) + 
            (hardAvg * 2 * user.difficultyScores.hard.count);
            
          const totalWeight = 
            (1 * user.difficultyScores.basic.count) + 
            (1.5 * user.difficultyScores.midd.count) + 
            (2 * user.difficultyScores.hard.count);
            
          const weightedAverage = totalWeight > 0 ? weightedTotal / totalWeight : 0;
          
          return {
            ...user,
            averageScore: user.totalScore / user.quizzesTaken,
            basicScore: basicAvg,
            middScore: middAvg,
            hardScore: hardAvg,
            weightedAverage: weightedAverage,
          };
        });
      
      leaderboardArray.sort((a, b) => b.weightedAverage - a.weightedAverage);
      
      const topUsers = leaderboardArray.slice(0, 10).map((user, index) => ({
        ...user,
        rank: index + 1,
      }));
      
      setLeaderboard(topUsers);
    
    } catch (err) {
      console.error("🔥 Liderlik tablosu yüklenirken hata:", err);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const fetchDifficultyLeaderboard = async (selectedDifficulty = "weighted") => {
    try {
      setLeaderboardLoading(true);
      console.log(`📊 "${selectedDifficulty}" zorluğu için liderlik tablosu yükleniyor...`);
      
      const userDataRef = ref(db, "Users/userData");
      const userDataSnapshot = await get(userDataRef);
      
      if (!userDataSnapshot.exists()) {
        console.log("⚠️ Kullanıcı verileri bulunamadı");
        setLeaderboard([]);
        setLeaderboardLoading(false);
        return;
      }
      
      const allUserData = userDataSnapshot.val();
      const userAggregate = {};
      const difficulties = ["basic", "midd", "hard"];
      
      for (const difficulty of difficulties) {
        const resultsRef = ref(db, `Users/userResults/generalResults/${difficulty}`);
        const resultsSnapshot = await get(resultsRef);
        
        if (!resultsSnapshot.exists()) {
          continue;
        }
        
        const quizResults = resultsSnapshot.val();
        
        Object.keys(quizResults).forEach(quizId => {
          const usersInQuiz = quizResults[quizId];
          
          Object.entries(usersInQuiz).forEach(([userId, result]) => {
            if (!result || typeof result !== 'object' || !result.score || !result.total) {
              return;
            }
            
            const percent = (result.score / result.total) * 100;
            
            if (!userAggregate[userId]) {
              const userInfo = allUserData[userId];
              
              let displayName;
              if (userInfo && userInfo.name) {
                displayName = userInfo.name;
              } else {
                displayName = `User-${userId.slice(0, 6)}`;
              }
              
              userAggregate[userId] = {
                userId: userId,
                name: displayName,
                avatar: generateInitials(displayName),
                totalScore: 0,
                bestScore: 0,
                correctAnswers: 0,
                quizzesTaken: 0,
                lastActive: 0,
                difficultyScores: {
                  basic: { total: 0, count: 0 },
                  midd: { total: 0, count: 0 },
                  hard: { total: 0, count: 0 }
                }
              };
            }
            
            const user = userAggregate[userId];
            user.totalScore += percent;
            user.correctAnswers += result.score;
            user.quizzesTaken += 1;
            user.bestScore = Math.max(user.bestScore, percent);
            user.lastActive = Math.max(user.lastActive, result.timestamp || 0);
            
            user.difficultyScores[difficulty].total += percent;
            user.difficultyScores[difficulty].count += 1;
          });
        });
      }
      
      const leaderboardArray = Object.values(userAggregate)
        .filter(user => {
          if (selectedDifficulty !== "weighted" && user.difficultyScores[selectedDifficulty].count === 0) {
            return false;
          }
          return user.quizzesTaken > 0;
        })
        .map((user) => {
          const basicAvg = user.difficultyScores.basic.count > 0 
            ? user.difficultyScores.basic.total / user.difficultyScores.basic.count 
            : 0;
            
          const middAvg = user.difficultyScores.midd.count > 0 
            ? user.difficultyScores.midd.total / user.difficultyScores.midd.count 
            : 0;
            
          const hardAvg = user.difficultyScores.hard.count > 0 
            ? user.difficultyScores.hard.total / user.difficultyScores.hard.count 
            : 0;
          
          const weightedTotal = 
            (basicAvg * 1 * user.difficultyScores.basic.count) + 
            (middAvg * 1.5 * user.difficultyScores.midd.count) + 
            (hardAvg * 2 * user.difficultyScores.hard.count);
            
          const totalWeight = 
            (1 * user.difficultyScores.basic.count) + 
            (1.5 * user.difficultyScores.midd.count) + 
            (2 * user.difficultyScores.hard.count);
            
          const weightedAverage = totalWeight > 0 ? weightedTotal / totalWeight : 0;
          
          return {
            ...user,
            averageScore: user.totalScore / user.quizzesTaken,
            basicScore: basicAvg,
            middScore: middAvg,
            hardScore: hardAvg,
            weightedAverage: weightedAverage,
          };
        });
      
      if (selectedDifficulty === "weighted") {
        leaderboardArray.sort((a, b) => b.weightedAverage - a.weightedAverage);
      } else if (selectedDifficulty === "basic") {
        leaderboardArray.sort((a, b) => b.basicScore - a.basicScore);
      } else if (selectedDifficulty === "midd") {
        leaderboardArray.sort((a, b) => b.middScore - a.middScore);
      } else if (selectedDifficulty === "hard") {
        leaderboardArray.sort((a, b) => b.hardScore - a.hardScore);
      }
      
      const topUsers = leaderboardArray.slice(0, 10).map((user, index) => ({
        ...user,
        rank: index + 1,
      }));
      
      setLeaderboard(topUsers);
    
    } catch (err) {
      console.error(`🔥 ${selectedDifficulty} zorluğundaki liderlik tablosu yüklenirken hata:`, err);
    } finally {
      setLeaderboardLoading(false);
    }
  };
  
  const generateInitials = (name) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };
  
  const formatLastActive = (timestamp) => {
    if (!timestamp) return "N/A";
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleDifficultySelect = async (difficultyId) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    
    console.log("🎯 Kategori seçildi:", difficultyId);
    
    setSelectedDifficulty(difficultyId);
    setSelectedQuiz(null);
    setQuizStarted(false);
    setQuizCompleted(false);
    
    // ✅ Progress henüz yüklenmemişse yükle
    if (userId && quizCategories.length > 0 && (!userQuizProgress || Object.keys(userQuizProgress).length === 0)) {
      console.log("🔄 Progress henüz yüklenmemiş, yükleniyor...");
      await loadUserQuizProgress(quizCategories);
    }
    
    await fetchLeaderboard(difficultyId);
  };

  const handleQuizSelect = async (quiz) => {
  try {
    console.log("🎯 Quiz seçme girişimi:", quiz.id, "Kategori:", selectedDifficulty);
    
    // ✅ ÖNCE: Progress state'i kontrol et
    const currentProgress = userQuizProgress[selectedDifficulty]?.[quiz.id];
    console.log("📊 Mevcut progress:", currentProgress);
    
    // ✅ İKİNCİ: Firebase'den KAPSAMLI kontrol et (hem web hem mobil path)
    const webResultRef = ref(db, `Users/userResults/generalResults/${selectedDifficulty}/${quiz.id}/${userId}`);
    const mobileResultRef = ref(db, `Users/userResults/quizResults/${userId}/${selectedDifficulty}_${quiz.id}`);
    
    // Her iki path'i de kontrol et
    const [webSnapshot, mobileSnapshot] = await Promise.all([
      get(webResultRef),
      get(mobileResultRef)
    ]);
    
    let isCompletedInFirebase = false;
    let firebaseResult = null;
    
    if (webSnapshot.exists()) {
      firebaseResult = webSnapshot.val();
      console.log("🌐 WEB Firebase: Quiz tamamlanmış bulundu:", firebaseResult);
      isCompletedInFirebase = firebaseResult.completed === true;
    } else if (mobileSnapshot.exists()) {
      firebaseResult = mobileSnapshot.val();
      console.log("📱 MOBİL Firebase: Quiz tamamlanmış bulundu:", firebaseResult);
      isCompletedInFirebase = firebaseResult.completed === true || firebaseResult.score !== undefined;
    }
    
    // ✅ Eğer Firebase'de tamamlanmış varsa, state'i güncelle ve engelle
    if (isCompletedInFirebase && firebaseResult) {
      console.log("🔥 FIREBASE: Quiz tamamlanmış, state güncelleniyor ve erişim engelleniyor");
      
      const score = firebaseResult.score || 0;
      const total = firebaseResult.total || firebaseResult.questionsCount || 5;
      
      // State'i hemen güncelle
      setUserQuizProgress(prev => ({
        ...prev,
        [selectedDifficulty]: {
          ...prev[selectedDifficulty],
          [quiz.id]: {
            completed: true,
            score: score,
            total: total,
            percentage: total > 0 ? Math.round((score / total) * 100) : 0,
            locked: true,
            completedAt: firebaseResult.completedAt || firebaseResult.timestamp || firebaseResult.date
          }
        }
      }));
      
      // SONRAKI QUİZ'İ UNLOCK ET
      await unlockNextQuiz(selectedDifficulty, quiz.id);
      
      // Progress'i yeniden yükle
      setTimeout(async () => {
        if (quizCategories.length > 0) {
          await loadUserQuizProgress(quizCategories);
        }
      }, 500);
      
      alert("Bu quiz'i zaten tamamladınız! Quiz sistemi güncellendi.");
      return;
    }
    
    // ✅ ÜÇÜNCÜ: State'te tamamlanmış görünüyorsa RED ET
    if (currentProgress?.completed === true) {
      console.log("🚫 STATE: Quiz zaten tamamlanmış, erişim engellendi");
      alert("Bu quiz'i zaten tamamladınız! Her quiz sadece bir kez çözülebilir.");
      return;
    }
    
    // ✅ DÖRDÜNCÜ: Unlock kontrolü
    const isUnlocked = isQuizUnlocked(selectedDifficulty, quiz.id);
    if (!isUnlocked) {
      console.log("🔒 Quiz kilitli:", quiz.id);
      alert("Bu quiz henüz kilitli. Önceki quiz'i tamamlayın.");
      return;
    }

    console.log("✅ Quiz seçimi onaylandı:", quiz.id);

    // Quiz verilerini yükle
    const quizRef = ref(db, `Quizzes/${selectedDifficulty}/${quiz.id}`);
    const snapshot = await get(quizRef);

    if (!snapshot.exists()) {
      console.error("Quiz bulunamadı:", `Quizzes/${selectedDifficulty}/${quiz.id}`);
      throw new Error("Quiz bulunamadı");
    }

    const quizData = snapshot.val();
    processQuizData(quizData, quiz);

  } catch (err) {
    console.error("Quiz alma hatası:", err);
    setError(`Quiz yüklenirken hata oluştu: ${err.message}`);
  }
  };

  const processQuizData = (quizData, quiz) => {
  console.log("Quiz verisi:", quizData);
  
  let questionsArray = [];
  
  // ✅ Firebase'den gelen soru anahtarlarını sayısal olarak sırala
  const questionKeys = Object.keys(quizData)
    .filter(key => key.startsWith('Q'))
    .sort((a, b) => {
      // Q1, Q2, Q10 gibi anahtarları sayısal olarak sırala
      const numA = parseInt(a.substring(1)); // "Q1" -> 1
      const numB = parseInt(b.substring(1)); // "Q10" -> 10
      return numA - numB; // Sayısal sıralama
    });
  
  console.log("✅ Düzeltilmiş soru sırası:", questionKeys);
  
  if (questionKeys.length === 0) {
    throw new Error("Bu quiz için soru bulunamadı");
  }
  
  questionKeys.forEach(qKey => {
    const questionData = quizData[qKey];
    
    if (questionData && questionData.question && questionData.options) {
      const optionsArray = Array.isArray(questionData.options) 
        ? questionData.options 
        : Object.values(questionData.options);
      
      let correctAnswerIndex = 0;
      
      if (typeof questionData.correctAnswer === 'string') {
        const matchIndex = optionsArray.findIndex(
          opt => opt === questionData.correctAnswer
        );
        
        correctAnswerIndex = matchIndex !== -1 ? matchIndex : 0;
        console.log(`Doğru cevap indeksi (${questionData.correctAnswer}): ${correctAnswerIndex}`);
      }
      
      questionsArray.push({
        id: qKey,
        question: questionData.question,
        options: optionsArray,
        correctAnswer: correctAnswerIndex
      });
    }
  });
  
  if (questionsArray.length === 0) {
    throw new Error("Sorular uygun formatta değil");
  }
  
  console.log("📝 Sıralanmış sorular:", questionsArray.map(q => q.id));
  
  setSelectedQuiz({
    quiz_id: quiz.id,
    title: quiz.title || "Quiz",
    difficulty: selectedDifficulty,
    questions: questionsArray
  });
  
  setQuizQuestions(questionsArray);
  setCurrentQuestion(0);
  setUserAnswers({});
  setQuizCompleted(false);
  };
  
  const handleStartQuiz = () => {
    setQuizStarted(true);
    setTimeLeft(300);
    setCurrentQuestion(0);
    setUserAnswers({});
    setQuizCompleted(false);
  };

  const handleAnswerSelect = (questionId, optionIndex) => {
    setUserAnswers({
      ...userAnswers,
      [questionId]: optionIndex
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestion < selectedQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleFinishQuiz = async () => {
  // ✅ ÖNCE: Tüm soruların cevaplandığını kontrol et
  const totalQuestions = selectedQuiz.questions.length;
  const answeredQuestions = Object.keys(userAnswers).length;
  
  console.log(`📊 Quiz Kontrolü: ${answeredQuestions}/${totalQuestions} soru cevaplandı`);
  
  // Cevaplanmamış soruları bul
  const unansweredQuestions = [];
  selectedQuiz.questions.forEach((question, index) => {
    if (userAnswers[question.id] === undefined) {
      unansweredQuestions.push(index + 1);
    }
  });
  
  // ✅ Eğer cevaplanmamış sorular varsa uyarı göster
  if (unansweredQuestions.length > 0) {
    showIncompleteQuizModal(unansweredQuestions);
    return;
  }
  
  // ✅ Tüm sorular cevaplandıysa quiz'i bitir
  if (timer) clearInterval(timer);

  let correctCount = 0;
  selectedQuiz.questions.forEach((q) => {
    if (userAnswers[q.id] === q.correctAnswer) {
      correctCount++;
    }
  });

  setScore(correctCount);
  setQuizCompleted(true);

  if (!userId) {
    console.error("❌ Kullanıcı kimliği alınamadı, veri kaydedilemez!");
    setError("Oturum bilginiz bulunamadı. Sonuçlar kaydedilemedi.");
    return;
  }

  console.log("📝 Quiz sonuçları kaydediliyor... Kullanıcı ID:", userId);

  try {
    const checkRef = ref(db, `Users/userResults/generalResults/${selectedQuiz.difficulty}/${selectedQuiz.quiz_id}/${userId}`);
    const checkSnapshot = await get(checkRef);
    
    if (checkSnapshot.exists()) {
      console.log("⚠️ UYARI: Bu quiz zaten tamamlanmış! Kayıt işlemi durduruldu.");
      alert("Bu quiz zaten tamamlanmış! Sistem hatası önlendi.");
      return;
    }

    const formattedAnswers = {};
    selectedQuiz.questions.forEach((q, index) => {
      const key = `Q${index + 1}`;
      const selectedIndex = userAnswers[q.id];
      const selectedText = selectedIndex !== undefined ? q.options[selectedIndex] : "No Answer";
      formattedAnswers[key] = selectedText;
    });

    const resultData = {
      score: correctCount,
      total: selectedQuiz.questions.length,
      wrong: selectedQuiz.questions.length - correctCount,
      timeUsed: 300 - timeLeft,
      timestamp: Date.now(),
      device: navigator.userAgent.includes("Android") ? "Android" : "Web",
      userAnswers: formattedAnswers,
      completed: true,
      completedAt: new Date().toISOString(),
      userId: userId,
      quizId: selectedQuiz.quiz_id,
      difficulty: selectedQuiz.difficulty,
      sessionId: Date.now() + "_" + Math.random().toString(36).substr(2, 9),
      locked: true
    };

    const generalResultsPath = `Users/userResults/generalResults/${selectedQuiz.difficulty}/${selectedQuiz.quiz_id}/${userId}`;
    console.log("💾 Sonuç kaydediliyor:", generalResultsPath);
    await set(ref(db, generalResultsPath), resultData);
    console.log("✅ Genel sonuç kaydedildi");

    const quizResultsPath = `Users/userResults/quizResults/${userId}/${selectedQuiz.difficulty}_${selectedQuiz.quiz_id}`;
    await set(ref(db, quizResultsPath), resultData);
    console.log("✅ Kişisel sonuç kaydedildi");

    setUserQuizProgress(prev => ({
      ...prev,
      [selectedQuiz.difficulty]: {
        ...prev[selectedQuiz.difficulty],
        [selectedQuiz.quiz_id]: {
          completed: true,
          score: correctCount,
          total: selectedQuiz.questions.length,
          percentage: Math.round((correctCount / selectedQuiz.questions.length) * 100),
          locked: true,
          completedAt: new Date().toISOString()
        }
      }
    }));

    await unlockNextQuiz(selectedQuiz.difficulty, selectedQuiz.quiz_id);

    console.log("✅ Quiz tamamlama işlemi başarılı!");

  } catch (err) {
    console.error("🔥 Firebase'e sonuç kaydedilirken hata:", err);
    setError("Quiz sonuçları kaydedilirken bir hata oluştu.");
  }
  };

  const renderModernLoading = () => (
    <div className="page-loading-container">
      <div className="loading-content">
        <div className="loading-dots">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
        
        <h2 className="loading-title">Loading your quiz...</h2>
        <p className="loading-subtitle">Getting your questions ready...</p>
      </div>
    </div>
  );

  const renderAuthModal = () => (
    <div className="auth-modal-overlay" onClick={() => setShowAuthModal(false)}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <div className="auth-modal-icon">
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <circle cx="12" cy="16" r="1"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h3>Login Required</h3>
          <button 
            className="auth-modal-close"
            onClick={() => setShowAuthModal(false)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="auth-modal-content">
          <p className="auth-modal-message">
          To access quiz features and track your progress, please log in.
          </p>
          
          <div className="auth-modal-features">
            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <span>Save your quiz results</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🏆</div>
              <span>Appear on the leaderboard</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📈</div>
              <span>Track your progress</span>
            </div>
          </div>
        </div>
        
        <div className="auth-modal-actions">
          <button 
            className="auth-modal-btn primary"
            onClick={() => {
              setShowAuthModal(false);
              navigate('/login');
            }}
          >
            Log In
          </button>
          <button 
            className="auth-modal-btn secondary"
            onClick={() => setShowAuthModal(false)}
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );

  const renderLoading = () => {
    return renderModernLoading();
  };

  const renderCategorySelection = () => (
    <div className="quizzes-wrapper">
      <div className="header-section">
        <h1>Network Security <span className="highlight">Quizzes</span></h1>
        <p>Test your knowledge with our interactive quizzes across different difficulty levels</p>
        {!isAuthenticated && (
          <div className="auth-notice">
            <div className="notice-icon info"></div>
            <span>Sign in to access quizzes and track your progress</span>
          </div>
        )}
      </div>

      {!isAuthenticated && (
        <div className="guest-warning">
          <div className="guest-warning-content">
            <h3>Quiz Access Restricted</h3>
            <p>You need to sign in to access quizzes and view your progress on the leaderboard.</p>
            <div className="guest-warning-buttons">
              <button 
                className="signin-button primary"
                onClick={() => navigate('/login')}
              >
                Sign In
              </button>
              <button 
                className="signup-button secondary"
                onClick={() => navigate('/login')}
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="category-cards-container">
        {quizCategories.map((category) => 
          isAuthenticated ? (
            <div key={category.id} className="category-card" style={{"--category-color": category.color}}>
              <div className="category-header">
                <div className="category-icon">{category.icon}</div>
                <div className="category-badge">{category.difficulty}</div>
              </div>
              <div className="category-content">
                <h2>{category.title}</h2>
                <p>{category.longDescription}</p>
                
                <div className="category-meta">
                  <div className="meta-item">
                    <span className="meta-icon">⏱️</span>
                    <span>{category.duration}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-icon">📚</span>
                    <span>{category.quizzes.length} quizzes</span>
                  </div>
                </div>
                
                <button 
                  className="explore-button"
                  onClick={() => handleDifficultySelect(category.id)}
                  style={{"--button-color": category.color}}
                >
                  Explore Quizzes
                </button>
              </div>
            </div>
          ) : (
            <div key={category.id} className="category-card guest-restricted" style={{"--category-color": category.color}}>
              <div className="category-header">
                <div className="category-icon">{category.icon}</div>
                <div className="category-badge">{category.difficulty}</div>
                <div className="lock-overlay">
                  <div className="lock-icon"></div>
                </div>
              </div>
              <div className="category-content">
                <h2>{category.title}</h2>
                <p>{category.longDescription}</p>
                
                <div className="category-meta">
                  <div className="meta-item">
                    <span className="meta-icon">⏱️</span>
                    <span>{category.duration}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-icon">📚</span>
                    <span>Sign in to view quizzes</span>
                  </div>
                </div>
                
                <button 
                  className="explore-button disabled"
                  onClick={() => setShowAuthModal(true)}
                  disabled
                >
                  🔒 Sign In Required
                </button>
              </div>
            </div>
          )
        )}
      </div>
      
      <div className="leaderboard-section">
        <h2 className="leaderboard-title">Top Performers</h2>
        <p className="leaderboard-subtitle">See how your scores compare to other security enthusiasts</p>
        
        {!isAuthenticated ? (
          <div className="leaderboard-guest-message">
            <div className="guest-message-content">
              <div className="guest-icon"></div>
              <h3>Join the Competition!</h3>
              <p>Sign in to see the leaderboard and compete with other users</p>
              <button 
                className="signin-prompt-button"
                onClick={() => navigate('/login')}
              >
                Sign In to View Leaderboard
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="difficulty-filter">
              <div className="filter-options">
                <button 
                  className={`filter-button ${selectedLeaderboardDifficulty === 'weighted' ? 'active' : ''}`}
                  data-difficulty="weighted"
                  onClick={() => {
                    setSelectedLeaderboardDifficulty('weighted');
                    fetchDifficultyLeaderboard('weighted');
                  }}
                >
                  Overall
                </button>
                <button 
                  className={`filter-button ${selectedLeaderboardDifficulty === 'basic' ? 'active' : ''}`}
                  data-difficulty="basic"
                  onClick={() => {
                    setSelectedLeaderboardDifficulty('basic');
                    fetchDifficultyLeaderboard('basic');
                  }}
                >
                  Basic
                </button>
                <button 
                  className={`filter-button ${selectedLeaderboardDifficulty === 'midd' ? 'active' : ''}`}
                  data-difficulty="midd"
                  onClick={() => {
                    setSelectedLeaderboardDifficulty('midd');
                    fetchDifficultyLeaderboard('midd');
                  }}
                >
                  Intermediate
                </button>
                <button 
                  className={`filter-button ${selectedLeaderboardDifficulty === 'hard' ? 'active' : ''}`}
                  data-difficulty="hard"
                  onClick={() => {
                    setSelectedLeaderboardDifficulty('hard');
                    fetchDifficultyLeaderboard('hard');
                  }}
                >
                  Hard
                </button>
              </div>
            </div>
            
            {leaderboardLoading ? (
              <div className="leaderboard-loading">
                <div className="loading-spinner small"></div>
                <p>Loading leaderboard data...</p>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="leaderboard-empty">
                <div className="empty-icon">🏆</div>
                <h3>No Rankings Yet</h3>
                <p>Be the first to complete a quiz and claim your spot on the leaderboard!</p>
              </div>
            ) : (
              <div className="leaderboard-table-container">
                <table className="leaderboard-table">
                  <thead>
                    <tr>
                      <th className="rank-column">Rank</th>
                      <th className="user-column">User</th>
                      <th className={`score-column ${selectedLeaderboardDifficulty !== 'weighted' ? 'specific-difficulty' : ''}`}>
                        {selectedLeaderboardDifficulty === 'weighted' ? 'Avg. Score' : 
                        selectedLeaderboardDifficulty === 'basic' ? 'Basic Score' : 
                        selectedLeaderboardDifficulty === 'midd' ? 'Interm. Score' : 'Hard Score'}
                      </th>
                      <th className="quizzes-column">Quizzes</th>
                      <th className="correct-column">Correct Answers</th>
                      <th className="active-column">Last Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((user) => (
                      <tr key={user.userId} className={user.rank <= 3 ? 'top-rank' : ''}>
                        <td className="rank-column">
                          {user.rank <= 3 ? (
                            <div className={`rank-badge rank-${user.rank}`}>{user.rank}</div>
                          ) : (
                            <span className="rank-number">{user.rank}</span>
                          )}
                        </td>
                        <td className="user-column">
                          <div className="user-info">
                            <div className="user-avatar">{user.avatar}</div>
                            <span className="user-name">{user.name}</span>
                          </div>
                        </td>
                        <td className="score-column">
                          <div className="score-display-small">
                            <div className="score-percentage">
                              {Math.round(
                                selectedLeaderboardDifficulty === 'weighted' ? user.weightedAverage : 
                                selectedLeaderboardDifficulty === 'basic' ? user.basicScore : 
                                selectedLeaderboardDifficulty === 'midd' ? user.middScore : user.hardScore
                              )}%
                            </div>
                            <div className="score-bar">
                              <div 
                                className="score-fill" 
                                style={{
                                  width: `${Math.round(
                                    selectedLeaderboardDifficulty === 'weighted' ? user.weightedAverage : 
                                    selectedLeaderboardDifficulty === 'basic' ? user.basicScore : 
                                    selectedLeaderboardDifficulty === 'midd' ? user.middScore : user.hardScore
                                  )}%`
                                }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="quizzes-column">
                          {selectedLeaderboardDifficulty === 'weighted' ? user.quizzesTaken : 
                          user.difficultyScores[selectedLeaderboardDifficulty].count}
                        </td>
                        <td className="correct-column">
                          {selectedLeaderboardDifficulty === 'weighted' ? user.correctAnswers : 
                          Math.round(user.difficultyScores[selectedLeaderboardDifficulty].total * 
                                    user.difficultyScores[selectedLeaderboardDifficulty].count / 100)}
                        </td>
                        <td className="active-column">{formatLastActive(user.lastActive)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  const renderQuizSelection = () => {
    const selectedCategory = quizCategories.find(cat => cat.id === selectedDifficulty);

    // ✅ Progress henüz yüklenmemişse loading göster
    if (!userQuizProgress || Object.keys(userQuizProgress).length === 0) {
      return (
        <div className="quizzes-wrapper">
          <div className="category-header-bar" style={{"--category-color": selectedCategory?.color}}>
            <button className="back-button" onClick={() => setSelectedDifficulty(null)}>
              <span className="back-icon">←</span>
              <span>Back</span>
            </button>
            <h1>
              <span className="category-icon-small">{selectedCategory?.icon}</span>
              {selectedCategory?.title}
            </h1>
            <div className="category-badge-small">{selectedCategory?.difficulty}</div>
          </div>
          
          <div className="leaderboard-loading">
            <div className="loading-spinner small"></div>
            <p>Loading quiz progress...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="quizzes-wrapper">
        <div className="category-header-bar" style={{"--category-color": selectedCategory.color}}>
          <button className="back-button" onClick={() => setSelectedDifficulty(null)}>
            <span className="back-icon">←</span>
            <span>Back</span>
          </button>
          <h1>
            <span className="category-icon-small">{selectedCategory.icon}</span>
            {selectedCategory.title}
          </h1>
          <div className="category-badge-small">{selectedCategory.difficulty}</div>
        </div>
        
        <div className="category-description">
          <p>{selectedCategory.longDescription}</p>
        </div>
        
        <div className="quiz-list">
          {selectedCategory && selectedCategory.quizzes && selectedCategory.quizzes.length > 0 ? (
            selectedCategory.quizzes.map((quiz, index) => {
              // ✅ Progress kontrolü
              const quizProgress = userQuizProgress[selectedDifficulty]?.[quiz.id];
              const isCompleted = quizProgress?.completed === true;
              const isUnlocked = !isCompleted && isQuizUnlocked(selectedDifficulty, quiz.id);
              
              console.log(`🔍 Quiz ${quiz.id} render durumu:`, {
                isCompleted,
                isUnlocked,
                quizProgress,
                progressExists: !!quizProgress
              });
              
              // Quiz durumunu belirle
              let quizStatus = 'locked';
              let buttonStatus = 'disabled';
              let statusIndicator = null;
              let statusTag = null;
              
              if (isCompleted) {
                quizStatus = 'completed';
                buttonStatus = 'completed';
                statusIndicator = (
                  <span className="completion-indicator">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4"/>
                      <circle cx="12" cy="12" r="10"/>
                    </svg>
                  </span>
                );
              } else if (isUnlocked) {
                quizStatus = 'available';
                buttonStatus = 'available';
                statusIndicator = (
                  <span className="available-indicator">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 6v6l4 2"/>
                    </svg>
                  </span>
                );
              } else {
                quizStatus = 'locked';
                buttonStatus = 'disabled';
                statusIndicator = (
                  <span className="lock-indicator">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <circle cx="12" cy="16" r="1"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                );
                statusTag = (
                  <div className="meta-tag locked">
                    <span className="meta-icon">🔒</span>
                    <span>Complete previous quiz</span>
                  </div>
                );
              }
              
              return (
                <div 
                  key={quiz.id} 
                  className={`quiz-list-item quiz-${quizStatus}`}
                  style={{"--delay": `${index * 0.1}s`}}
                >
                  <div className="quiz-list-content">
                    <div className="quiz-header-content">
                      <h3>
                        {quiz.title}
                        {statusIndicator}
                      </h3>
                      
                      {/* Score display sadece tamamlanan quizlerde */}
                      {isCompleted && quizProgress && (
                        <div className="quiz-score-display">
                          <span className="score-percentage">{quizProgress.percentage}%</span>
                          <span className="score-fraction">({quizProgress.score}/{quizProgress.total})</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="quiz-metadata">
                      <div className="meta-tag">
                        <span className="meta-icon">❓</span>
                        <span>{quiz.questionsCount || 5} Questions</span>
                      </div>
                      <div className="meta-tag">
                        <span className="meta-icon">⏱️</span>
                        <span>5 min</span>
                      </div>
                      {quiz.completionRate && isUnlocked && (
                        <div className="meta-tag">
                          <span className="meta-icon">📊</span>
                          <span>{quiz.completionRate}% Completion</span>
                        </div>
                      )}
                      {statusTag}
                    </div>
                  </div>
                  
                  <button 
                    className={`start-quiz-button ${buttonStatus}`}
                    onClick={() => {
                      if (isCompleted) {
                        alert("Bu quiz'i zaten tamamladınız! Her quiz sadece bir kez çözülebilir.");
                        return;
                      }
                      if (isUnlocked) {
                        handleQuizSelect(quiz);
                      } else {
                        alert("Bu quiz kilitli! Önceki quiz'i tamamlayın.");
                      }
                    }}
                    disabled={!isUnlocked}
                    style={{"--button-color": selectedCategory?.color || "#4285f4"}}
                  >
                    {isCompleted ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 12l2 2 4-4"/>
                          <circle cx="12" cy="12" r="10"/>
                        </svg>
                        Completed 
                      </>
                    ) : !isUnlocked ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                          <circle cx="12" cy="16" r="1"/>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        Locked
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="5,3 19,12 5,21"/>
                        </svg>
                        Start
                      </>
                    )}
                  </button>
                </div>
              );
            })
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>No quizzes available yet</h3>
              <p>We're working on adding quizzes to this category. Check back soon!</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderQuizInterface = () => {
    if (!selectedQuiz.questions || selectedQuiz.questions.length === 0) {
      return (
        <div className="quiz-interface">
          <div className="error-state">
            <h3>Bu quizde henüz soru bulunmuyor</h3>
            <p>Lütfen başka bir quiz seçin veya daha sonra tekrar deneyin.</p>
            <button 
              className="primary-button"
              onClick={() => setSelectedDifficulty(null)}
            >
              Quiz Listesine Dön
            </button>
          </div>
        </div>
      );
    }

    const currentQ = selectedQuiz.questions[currentQuestion];
    const categoryData = quizCategoryInfo[selectedQuiz.difficulty] || quizCategoryInfo.basic;
    
    if (!currentQ || !currentQ.question || !currentQ.options) {
      console.error("Soru verisi eksik:", currentQ);
      return (
        <div className="quiz-interface">
          <div className="error-state">
            <h3>Soru yüklenirken hata oluştu</h3>
            <button 
              className="primary-button"
              onClick={() => setSelectedDifficulty(null)}
            >
              Quiz Listesine Dön
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="quiz-container">
        <div className="quiz-interface" style={{"--quiz-color": categoryData.color}}>
          <div className="quiz-header">
            <h2>
              <span className="quiz-icon">{categoryData.icon}</span>
              {selectedQuiz.title}
            </h2>
            
            <div className="quiz-progress-bar">
              <div className="quiz-timer">
                <div className="timer-icon">⏱</div>
                <div className="timer-text">{formatTime(timeLeft)}</div>
              </div>
              
              <div className="progress-track">
                <div 
                  className="progress-fill" 
                  style={{width: `${((currentQuestion + 1) / selectedQuiz.questions.length) * 100}%`}}
                ></div>
              </div>
              
              <div className="progress-fraction">
                {currentQuestion + 1}/{selectedQuiz.questions.length}
              </div>
            </div>
          </div>
          
          {!quizStarted ? (
            <div className="quiz-start-screen">
              <div className="start-icon">{categoryData.icon}</div>
              <h3>Ready to begin?</h3>
              <p>You're about to start <strong>{selectedQuiz.title}</strong>. You'll have 5 minutes to complete {selectedQuiz.questions.length} questions.</p>
              
              <div className="quiz-instructions">
                <div className="instruction-item">
                  <div className="instruction-icon">✓</div>
                  <div className="instruction-text">Select the best answer for each question</div>
                </div>
                <div className="instruction-item">
                  <div className="instruction-icon">⏱️</div>
                  <div className="instruction-text">Watch the timer and pace yourself</div>
                </div>
                <div className="instruction-item">
                  <div className="instruction-icon">↩️</div>
                  <div className="instruction-text">You can go back and review your answers</div>
                </div>
              </div>
              
              <button 
                className="start-quiz-button large" 
                onClick={handleStartQuiz}
                style={{"--button-color": categoryData.color}}
              >
                Start Quiz
              </button>
            </div>
          ) : (
            <>
              <div className="question-container">
                <h3 className="question-number">Question {currentQuestion + 1}</h3>
                <p className="question-text">{currentQ.question}</p>
                
                <div className="options-container">
                  {currentQ.options.map((option, index) => (
                    <div 
                      key={index}
                      className={`option ${userAnswers[currentQ.id] === index ? 'selected' : ''}`}
                      onClick={() => handleAnswerSelect(currentQ.id, index)}
                    >
                      <div className="option-marker">{String.fromCharCode(65 + index)}</div>
                      <div className="option-text">{option}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="quiz-navigation">
                <button 
                  className="nav-button" 
                  onClick={handlePrevQuestion}
                  disabled={currentQuestion === 0}
                >
                  Previous
                </button>
                
                <div className="question-dots">
                  {selectedQuiz.questions.map((_, index) => (
                    <div 
                      key={index} 
                      className={`
                        question-dot 
                        ${index === currentQuestion ? 'active' : ''} 
                        ${userAnswers[selectedQuiz.questions[index].id] !== undefined ? 'answered' : ''}
                      `}
                      onClick={() => setCurrentQuestion(index)}
                    ></div>
                  ))}
                </div>
                
                {currentQuestion < selectedQuiz.questions.length - 1 ? (
                  <button 
                    className="nav-button next" 
                    onClick={handleNextQuestion}
                    style={{"--button-color": categoryData.color}}
                  >
                    Next
                  </button>
                ) : (
                  <button 
                    className="finish-button" 
                    onClick={handleFinishQuiz}
                    style={{"--button-color": categoryData.color}}
                  >
                    Finish Quiz
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {showIncompleteModal && renderIncompleteQuizModal()}
      </div>
    );
  };

  const renderQuizResults = () => {
    const categoryData = quizCategoryInfo[selectedQuiz.difficulty] || quizCategoryInfo.basic;
    const percentage = Math.round((score / selectedQuiz.questions.length) * 100);
    
    let resultMessage = "";
    let showAchievementBadge = false;
    let badgeText = "";
  
    if (percentage >= 90) {
      resultMessage = "Outstanding! You've mastered this topic!";
      showAchievementBadge = true;
      badgeText = "Quiz Master";
    } else if (percentage >= 80) {
      resultMessage = "Excellent job! You have great knowledge in this area.";
      showAchievementBadge = true;
      badgeText = "Expert";
    } else if (percentage >= 60) {
      resultMessage = "Good work! You have a solid understanding.";
    } else {
      resultMessage = "Keep practicing! You're on your way to mastery.";
    }
  
    const renderConfetti = (percentage >= 80);
    const confettiElements = [];
  
    if (renderConfetti) {
      for (let i = 0; i < 50; i++) {
        const left = Math.random() * 100;
        const animationDelay = Math.random() * 3;
        
        confettiElements.push(
          <div 
            key={`confetti-${i}`}
            className="confetti" 
            style={{
              left: `${left}%`,
              animationDelay: `${animationDelay}s`,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          />
        );
      }
    }
  
    return (
      <div className="quiz-container" style={{ 
        width: '100%', 
        maxWidth: '100%', 
        padding: 0, 
        margin: 0,
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}>
        <div className="quiz-results" style={{
          "--quiz-color": categoryData.color,
          width: '100%',
          maxWidth: '1800px',
          margin: '0 auto'
        }}>
          {renderConfetti && (
            <div className="confetti-container">
              {confettiElements}
            </div>
          )}
          
          {showAchievementBadge && (
            <div className="achievement-badge">
              <span role="img" aria-label="trophy">🏆</span> {badgeText}
            </div>
          )}
          
          <div className="results-header">
            <div className="results-icon">{categoryData.icon}</div>
            <h2>Quiz Results</h2>
            <h3>{selectedQuiz.title}</h3>
          </div>
          
          <div className="score-display">
            <div className="score-circle">
              <svg viewBox="0 0 36 36" className="circular-chart">
                <path className="circle-bg"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path className="circle"
                  strokeDasharray={`${percentage}, 100`}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="score-text">
                <div className="score-number">{score}</div>
                <div className="score-total">out of {selectedQuiz.questions.length}</div>
              </div>
            </div>
            
            <div className="result-message">{resultMessage}</div>
            
            <div className="result-stats">
              <div className="stat-item">
                <div className="stat-value">{percentage}%</div>
                <div className="stat-label">Score</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{selectedQuiz.questions.length - score}</div>
                <div className="stat-label">Incorrect</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{formatTime(300 - timeLeft)}</div>
                <div className="stat-label">Time Taken</div>
              </div>
            </div>
          </div>
          
          <div className="results-details">
            <h3>Question Review</h3>
            
            {selectedQuiz.questions.map((q, index) => {
              const isCorrect = userAnswers[q.id] === q.correctAnswer;
              
              return (
                <div 
                  key={q.id} 
                  className={`result-item ${isCorrect ? 'correct' : 'incorrect'}`}
                  style={{"--index": index}}
                >
                  <div className="result-question">
                    <span className="result-marker">{isCorrect ? '✓' : '✗'}</span>
                    <span className="question-number">{index + 1}.</span>
                    <span className="question-text">{q.question}</span>
                  </div>
                  
                  <div className="result-answer">
                    <div className="your-answer">
                      <span className="answer-label">Your answer:</span>
                      <span className="answer-text">
                        {userAnswers[q.id] !== undefined ? q.options[userAnswers[q.id]] : 'No answer'}
                      </span>
                    </div>
                    
                    {!isCorrect && (
                      <div className="correct-answer">
                        <span className="answer-label">Correct answer:</span>
                        <span className="answer-text">{q.options[q.correctAnswer]}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="results-actions">
            <button 
              className="action-button primary" 
              onClick={() => {
                setSelectedQuiz(null);
                setQuizStarted(false);
                setQuizCompleted(false);
                setSelectedDifficulty(null); // Ana sayfaya dön
              }}
              style={{"--button-color": categoryData.color}}
            >
              <i className="fas fa-arrow-left"></i> Back to Categories
            </button>
            
            <button 
              className="action-button secondary"
              onClick={() => {
                setSelectedQuiz(null);
                setQuizStarted(false);
                setQuizCompleted(false);
                // Quiz listesine dön
              }}
            >
              <i className="fas fa-list"></i> Choose Another Quiz
            </button>
          </div>
        </div>
      </div>
    );
  };

    const debugFullQuizState = () => {
    console.log("🔍 FULL DEBUG: Quiz System State");
    console.log("👤 userId:", userId);
    console.log("🔐 isAuthenticated:", isAuthenticated);
    console.log("📊 userQuizProgress:", userQuizProgress);
    console.log("🔓 unlockedQuizzes:", unlockedQuizzes);
    console.log("📋 quizCategories:", quizCategories);
    
    // Firebase kontrol
    console.log("\n🔥 Firebase Kontrol:");
    if (userId) {
      Object.keys(userQuizProgress).forEach(async (categoryId) => {
        console.log(`\n📂 Kategori: ${categoryId}`);
        const category = quizCategories.find(cat => cat.id === categoryId);
        if (category) {
          for (const quiz of category.quizzes) {
            const resultRef = ref(db, `Users/userResults/generalResults/${categoryId}/${quiz.id}/${userId}`);
            const snapshot = await get(resultRef);
            console.log(`  ${quiz.id}: Firebase=${snapshot.exists()}, State=${userQuizProgress[categoryId][quiz.id]?.completed}`);
          }
        }
      });
    }
  };

  window.debugFullQuizState = debugFullQuizState;

  // Authentication and data loading
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        setAuthChecking(true);
        setLoading(true);
        
        const auth = getAuth();
        
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            const uid = user.uid;
            console.log("✅ Giriş yapmış kullanıcı bulundu:", uid);
            
            const userRef = ref(db, `Users/userData/${uid}`);
            const snapshot = await get(userRef);
            
            if (snapshot.exists()) {
              const userData = snapshot.val();
              console.log("👤 Kullanıcı adı:", userData.name || "İsimsiz");
              
              setUserId(uid);
              setIsAuthenticated(true);
              localStorage.setItem('userId', uid);
              
              // ✅ Quizleri yükle ve SONRA progress yükle
              await loadQuizzes();
              await fetchDifficultyLeaderboard("weighted");
              setSelectedLeaderboardDifficulty('weighted');
            } else {
              setIsAuthenticated(false);
              setShowAuthModal(true);
            }
          } else {
            const storedUserId = localStorage.getItem('userId');
            const isGuest = localStorage.getItem('isGuest') === 'true';
            
            if (storedUserId && !isGuest) {
              const userRef = ref(db, `Users/userData/${storedUserId}`);
              const snapshot = await get(userRef);
              
              if (snapshot.exists()) {
                const userData = snapshot.val();
                console.log("✅ localStorage'dan kullanıcı doğrulandı:", userData.name || "İsimsiz");
                
                setUserId(storedUserId);
                setIsAuthenticated(true);
                
                await loadQuizzes();   
                await fetchLeaderboard("basic");
              } else {
                localStorage.removeItem('userId');
                setIsAuthenticated(false);
                setShowAuthModal(true);
              }
            } else {
              console.log("👤 Misafir kullanıcı tespit edildi");
              setIsAuthenticated(false);
              setShowAuthModal(true);
              await loadGuestData();
            }
          }
          
          setAuthChecking(false);
          setLoading(false);
        });
        
        return () => unsubscribe();
        
      } catch (err) {
        console.error("❌ Kimlik doğrulama hatası:", err);
        setIsAuthenticated(false);
        setShowAuthModal(true);
        setAuthChecking(false);
        setLoading(false);
      }
    };
    
    checkAuthentication();
  }, []);

  // Refresh progress when userId changes
  useEffect(() => {
    const reloadProgressWhenUserChanges = async () => {
      if (userId && quizCategories.length > 0) {
        console.log("🔄 UserId değişti, progress yeniden yükleniyor...", userId);
        await loadUserQuizProgress(quizCategories);
      }
    };
    
    reloadProgressWhenUserChanges();
  }, [userId]);

  // Quiz duration tracking
  useEffect(() => {
    if (quizStarted && timeLeft > 0 && !quizCompleted) {
      const intervalId = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
      
      setTimer(intervalId);
      
      return () => clearInterval(intervalId);
    } else if (timeLeft === 0 && quizStarted) {
      handleFinishQuiz();
    }
  }, [quizStarted, timeLeft, quizCompleted]);

  // Main rendering function
  if (authChecking || loading) return renderLoading();
  
  if (!selectedDifficulty) return (
    <>
      {renderCategorySelection()}
      {showAuthModal && renderAuthModal()}
    </>
  );

  // Block guest user from accessing quiz sections
  if (!isAuthenticated && (selectedDifficulty || selectedQuiz)) {
    setShowAuthModal(true);
    setSelectedDifficulty(null);
    setSelectedQuiz(null);
    return (
      <>
        {renderCategorySelection()}
        {showAuthModal && renderAuthModal()}
      </>
    );
  }

  if (selectedDifficulty && !selectedQuiz) return (
    <>
      {renderQuizSelection()}
      {showAuthModal && renderAuthModal()}
    </>
  );

  if (selectedQuiz && !quizCompleted) return (
    <>
      {renderQuizInterface()}
      {showAuthModal && renderAuthModal()}
    </>
  );

  if (quizCompleted) return (
    <>
      {renderQuizResults()}
      {showAuthModal && renderAuthModal()}
    </>
  );

  return (
    <>
      {renderCategorySelection()}
      {showAuthModal && renderAuthModal()}
    </>
  );
};

export default Quizzes;