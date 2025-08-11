import React from "react";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import Quizzes from "./pages/Quizzes"; 
import LoginPage from "./pages/LoginPage";
import WifiAnalyzer from "./pages/WifiAnalyzer";
import TrainingModule from "./pages/TrainingModule";
import Profile from "./components/Profile";
import QuizResults from "./components/QuizResults";
import ScrollToTop from './components/ScrollToTop';

import "./App.css";

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <div className="app-container">
      {/* ScrollToTop'u en üste yerleştir */}
      <ScrollToTop />
      
      {/* Header - login sayfasında gösterme */}
      {!isLoginPage && <Header />}
      
      {/* Main content */}
      <main className="content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/quizzes" element={<Quizzes />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/wifi-analyzer" element={<WifiAnalyzer />} />
          <Route path="/training-module" element={<TrainingModule />} />
          <Route path="/training-module/:moduleId" element={<TrainingModule />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/quiz-results" element={<QuizResults />} />
          
          {/* Tanımsız route'lar için ana sayfaya yönlendir */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      
      {/* Footer - login sayfasında gösterme */}
      {!isLoginPage && <Footer />}
    </div>
  );
}

export default App;