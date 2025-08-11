import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, px } from 'framer-motion';
import { 
  Shield, 
  BookOpen, 
  Award, 
  Activity, 
  Video, 
  Users, 
  Coffee,
  ChevronLeft,
  ChevronRight,
  Terminal,
  Play, 
  CheckCircle, 
  Code,
  Database,
  Wifi,
  Server,
  Lock,
  Zap,
  FileText,
  PenTool,
  Clock,
  Eye,
  Globe,
  Bolt,
  ArrowDown,
  ArrowUp
} from 'lucide-react';
import '../styles/HomePage.css';
import Footer from '../components/Footer';
import { db, storage } from "../firebase";
import { ref, get } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL, getMetadata } from "firebase/storage";
import { ref as dbRef, set } from 'firebase/database';
import { useSpring, animated } from 'react-spring';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    
    const articles = [
      {
        title: "Analyze Wireless Networks with Wi-Fi Analyzer",
        excerpt: "The Wi-Fi Analyzer module allows you to scan nearby wireless networks and analyze details such as signal strength, channel usage, and security levels.",
        image: "/photos/mainwifianalyzer.png",
        category: "Wi-Fi",
        href: "/wifi-analyzer"
      },
      {
        title: "Enhance Your Network Security Knowledge with the Training Module",
        excerpt: "The Training Module is an educational system that includes interactive lessons and visuals designed to raise user awareness in network security topics.",
        image: "/photos/maintrainingmodule.png",
        category: "Defense",
        href: "/training"
      },
      {
        title: "Test Your Knowledge with the Quiz Module",
        excerpt: "The Quiz Module offers interactive tests that let you assess your cybersecurity knowledge at varying levels of difficulty.",
        image: "/photos/mainquizmodule.png",
        category: "Quiz Module",
        href: "/quizzes"
      },
      {
        title: "Easily Measure Your Speed with Speed Test",
        excerpt: "The NST Speed Test module lets you analyze your internet connection in seconds. It measures latency, download, and upload speeds to help you monitor your network performance.",
        image: "/photos/mainspeedtest1.png",
        category: "Speed Test",
        href: "/speed-test"
      }
    ];

    const tools = [
      {
        name: "Wireshark",
        icon: <Wifi size={24} className="sec-tool-icon" />,
        color: "#1A73E8",
        description: "Analyze network traffic in real time. Identify network issues and uncover security vulnerabilities through packet capture and inspection.",
        features: ["Packet Analysis", "Network Protocols", "Traffic Monitoring"],
        difficulty: "Intermediate",
        image: "/photos/wireshark.png"
      },
      {
        name: "NMAP",
        icon: <Server size={24} className="sec-tool-icon" />,
        color: "#E53935",
        description: "An open-source tool for network discovery and security auditing. Perform port scanning, service detection, and OS identification.",
        features: ["Port Scanning", "Host Discovery", "Vulnerability Scanning"],
        difficulty: "Beginner",
        image: "/photos/nmap.png"
      },
      {
        name: "Kali Linux",
        icon: <Terminal size={24} className="sec-tool-icon" />,
        color: "#3A86FF",
        description: "A Linux distribution designed for penetration testing and security research. Includes over 600 pre-installed security tools.",
        features: ["Pentest Tools", "Security Testing", "Digital Forensics"],
        difficulty: "Intermediate-Advanced",
        image: "/photos/kalilinux.png"
      },
      {
        name: "Burp Suite",
        icon: <Shield size={24} className="sec-tool-icon" />,
        color: "#FF9E00",
        description: "A security testing tool for web applications. Test web security with features like proxy, browser, scanning, and attack tools.",
        features: ["Web Penetration", "Proxy Server", "Automated Scanning"],
        difficulty: "Intermediate",
        image: "/photos/burpsuite.png"
      },
      {
        name: "John The Ripper",
        icon: <Lock size={24} className="sec-tool-icon" />,
        color: "#8E44AD",
        description: "A powerful password cracking tool used to test password strength and detect weak credentials.",
        features: ["Password Cracking", "Dictionary Attacks", "Brute Force"],
        difficulty: "Advanced",
        image: "/photos/johntheripper.png"
      },
      {
        name: "Firewall",
        icon: <Shield size={24} className="sec-tool-icon" />,
        color: "#2ECC71",
        description: "Advanced firewall configuration to protect your network security. Block unwanted traffic and prevent intrusions.",
        features: ["Traffic Filtering", "Intrusion Detection", "Security Policies"],
        difficulty: "Intermediate",
        image: "/photos/firewall.png"
      },
      {
        name: "SQL Injection",
        icon: <Database size={24} className="sec-tool-icon" />,
        color: "#F39C12",
        description: "Techniques for detecting and preventing database vulnerabilities. Learn how to protect against SQL injection attacks.",
        features: ["Vulnerability Detection", "Code Auditing", "Data Protection"],
        difficulty: "Advanced",
        image: "/photos/sqlinjection.png"
      },
      {
        name: "XSS Attacks",
        icon: <Code size={24} className="sec-tool-icon" />,
        color: "#1ABC9C",
        description: "Understand and prevent Cross-Site Scripting (XSS) attacks. Learn secure coding practices for web applications.",
        features: ["Script Injection", "Prevention Techniques", "Secure Coding"],
        difficulty: "Intermediate-Advanced",
        image: "/photos/xss.png"
      }

    ];

    const [activeTab, setActiveTab] = useState('home');
    const [showVideo, setShowVideo] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [animationComplete, setAnimationComplete] = useState(false);
    const [showFooter, setShowFooter] = useState(true); 
    const [leaderboard, setLeaderboard] = useState([]);
    const [leaderboardLoading, setLeaderboardLoading] = useState(true);
    const [selectedLeaderboardDifficulty, setSelectedLeaderboardDifficulty] = useState('weighted');
    
    // Speed Test states
    const [connectionMode, setConnectionMode] = useState('multi');
    const [showResults, setShowResults] = useState(false);
    const [downloadSpeed, setDownloadSpeed] = useState('0.00');
    const [uploadSpeed, setUploadSpeed] = useState('0.00');
    const [testProgress, setTestProgress] = useState(0);
    const [isTestRunning, setIsTestRunning] = useState(false);
    const [userIP, setUserIP] = useState("");
    const [locationData, setLocationData] = useState({ city: "İzmir", provider: "Türk Telekom" });
    const [animationPhase, setAnimationPhase] = useState("idle"); // idle, preparing, testing, complete
    const [animationProgress, setAnimationProgress] = useState(0);
    
    // Speed Test states for enhanced functionality
    const [ping, setPing] = useState(32); // Default value shown in UI
    const [jitter, setJitter] = useState(0);
    const [downloadLatency, setDownloadLatency] = useState(0);
    const [uploadLatency, setUploadLatency] = useState(0);
    const [testFile, setTestFile] = useState(null);
    const [testFileSize, setTestFileSize] = useState(5 * 1024 * 1024); // Default 5MB
    const [errorMessage, setErrorMessage] = useState("");
    const [downloadNeedleAngle, setDownloadNeedleAngle] = useState(-90);
    const [uploadNeedleAngle, setUploadNeedleAngle] = useState(-90);
    
    // Speed Test phase states
    const [speedTestPhase, setSpeedTestPhase] = useState('start'); 
    const [isDownloadTest, setIsDownloadTest] = useState(true);
    const [currentSpeed, setCurrentSpeed] = useState(0);

    // smooth animation for speed tests
    const [smoothDownloadSpeed, setSmoothDownloadSpeed] = useState(0);
    const [smoothUploadSpeed, setSmoothUploadSpeed] = useState(0);
    const [smoothNeedleAngle, setSmoothNeedleAngle] = useState(-90);
    const [arcProgress, setArcProgress] = useState(0);

    // slider section
    const [activeIndex, setActiveIndex] = useState(0);
    const sliderRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [cardWidth, setCardWidth] = useState(0);
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [startXPos, setStartXPos] = useState(0);
    const [scrollLeftStart, setScrollLeftStart] = useState(0);
    const [momentum, setMomentum] = useState(0);
    const [lastX, setLastX] = useState(0);
    const [lastTime, setLastTime] = useState(0);
    
    // navigate
    const navigate = useNavigate();
    
    // Server and connection info
    const [serverInfo, setServerInfo] = useState({
      name: 'Auto-Selected',
      location: 'Optimal' 
    });
    
    const [connectionInfo, setConnectionInfo] = useState({
      isp: 'Türk Telekom'
    });

    const SPEED_TEST_CONFIG = {
      
      DOWNLOAD_DURATION: 15, 
      UPLOAD_DURATION: 10,   
      PING_COUNT: 8,         
      
    
      DOWNLOAD_SIZES: [
        1 * 1024 * 1024,    
        5 * 1024 * 1024,   
        10 * 1024 * 1024,   
        25 * 1024 * 1024,   
        50 * 1024 * 1024    
      ],
      UPLOAD_SIZE: 2 * 1024 * 1024, 
      
      
      UI_UPDATE_INTERVAL: 100, 
      SPEED_CALCULATION_INTERVAL: 500,
    };

    const smoothTransition = (currentValue, targetValue, factor = 0.15) => {
      return currentValue + (targetValue - currentValue) * factor;
    };  
    
    useEffect(() => {
  let animationFrame;

  const smoothAnimation = () => {
    if (isDownloadTest) {
      setSmoothDownloadSpeed(prev => 
        smoothTransition(prev, parseFloat(downloadSpeed), 0.15)
      );
      
      const targetAngle = -180 + (Math.min(smoothDownloadSpeed, 100) / 100 * 180);
      setSmoothNeedleAngle(prev => smoothTransition(prev, targetAngle, 0.2));
      
    } else {
      setSmoothUploadSpeed(prev => 
        smoothTransition(prev, parseFloat(uploadSpeed), 0.15)
      );
    
      const targetAngle = -180 + (Math.min(smoothUploadSpeed, 20) / 20 * 180);
      setSmoothNeedleAngle(prev => smoothTransition(prev, targetAngle, 0.2));
    }
    
    animationFrame = requestAnimationFrame(smoothAnimation);
  };
  
  animationFrame = requestAnimationFrame(smoothAnimation);
  
  return () => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  };
    }, [downloadSpeed, uploadSpeed, isDownloadTest, smoothDownloadSpeed, smoothUploadSpeed]);

    useEffect(() => {
      const calculateCardWidth = () => {
        if (sliderRef.current) {
          const cards = sliderRef.current.querySelectorAll('.security-tool-card');
          if (cards.length > 0) {
            const cardWidth = cards[0].offsetWidth;
            const gap = 25; 
            setCardWidth(cardWidth + gap);
          }
        }
      };

      calculateCardWidth();
      
      const handleResize = () => {
        calculateCardWidth();
        scrollToIndex(activeIndex);
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, []);

    useEffect(() => {
      const slider = sliderRef.current;
      if (!slider) return;

      const getClientX = (e) => {
        return e.type.includes('touch') ? e.touches[0]?.clientX || e.changedTouches[0]?.clientX : e.clientX;
      };

      const startDrag = (e) => {
        const clientX = getClientX(e);
        setIsMouseDown(true);
        setIsDragging(true);
        setStartXPos(clientX);
        setScrollLeftStart(slider.scrollLeft);
        setLastX(clientX);
        setLastTime(Date.now());
        setMomentum(0);
        
        slider.classList.add('dragging');
        slider.style.scrollBehavior = 'auto';
        slider.style.cursor = 'grabbing';
        slider.style.userSelect = 'none';
        
        e.preventDefault();
      };

      const drag = (e) => {
        if (!isMouseDown) return;
        e.preventDefault();
        
        const currentX = getClientX(e);
        const currentTime = Date.now();
        
        const velocity = (currentX - lastX) / (currentTime - lastTime);
        setMomentum(velocity);
        setLastX(currentX);
        setLastTime(currentTime);
        
        const deltaX = currentX - startXPos;
        const newScrollLeft = scrollLeftStart - deltaX;
        slider.scrollLeft = newScrollLeft;
      
        updateActiveCardFromScroll();
      };

      const endDrag = () => {
        if (!isMouseDown) return;
        
        setIsMouseDown(false);
        setIsDragging(false);
        
        slider.classList.remove('dragging');
        slider.style.cursor = 'grab';
        slider.style.userSelect = 'auto';
        
        if (Math.abs(momentum) > 0.5) {
          applyMomentum();
        } else {
          snapToNearest();
        }
      };

      const applyMomentum = () => {
        const targetScroll = slider.scrollLeft - (momentum * 100);
        const maxScroll = slider.scrollWidth - slider.clientWidth;
        const constrainedScroll = Math.max(0, Math.min(targetScroll, maxScroll));
        
        slider.style.scrollBehavior = 'smooth';
        slider.scrollLeft = constrainedScroll;
        
        setTimeout(() => {
          snapToNearest();
        }, 300);
      };

      const snapToNearest = () => {
        if (cardWidth === 0) return;
        
        const scrollLeft = slider.scrollLeft;
        const cardIndex = Math.round(scrollLeft / cardWidth);
        const targetIndex = Math.max(0, Math.min(cardIndex, tools.length - 1));
        
        goToSlide(targetIndex);
      };

      const updateActiveCardFromScroll = () => {
        if (cardWidth === 0) return;
        
        const scrollLeft = slider.scrollLeft;
        const cardIndex = Math.round(scrollLeft / cardWidth);
        const newIndex = Math.max(0, Math.min(cardIndex, tools.length - 1));
        
        if (newIndex !== activeIndex) {
          setActiveIndex(newIndex);
        }
      };

      slider.addEventListener('mousedown', startDrag);
      slider.addEventListener('mousemove', drag);
      slider.addEventListener('mouseup', endDrag);
      slider.addEventListener('mouseleave', endDrag);
      slider.addEventListener('touchstart', startDrag);
      slider.addEventListener('touchmove', drag);
      slider.addEventListener('touchend', endDrag);

      slider.addEventListener('scroll', updateActiveCardFromScroll);

      slider.addEventListener('contextmenu', (e) => {
        if (isDragging) {
          e.preventDefault();
        }
      });

      slider.style.cursor = 'grab';

      return () => {
        slider.removeEventListener('mousedown', startDrag);
        slider.removeEventListener('mousemove', drag);
        slider.removeEventListener('mouseup', endDrag);
        slider.removeEventListener('mouseleave', endDrag);
        slider.removeEventListener('touchstart', startDrag);
        slider.removeEventListener('touchmove', drag);
        slider.removeEventListener('touchend', endDrag);
        slider.removeEventListener('scroll', updateActiveCardFromScroll);
        slider.removeEventListener('contextmenu', (e) => {
          if (isDragging) {
            e.preventDefault();
          }
        });
      };
    }, [isMouseDown, startXPos, scrollLeftStart, momentum, lastX, lastTime, cardWidth, activeIndex, isDragging, tools.length]);

    useEffect(() => {
      const interval = setInterval(() => {
        if (!isDragging && !isMouseDown) { 
          const newIndex = (activeIndex + 1) % tools.length;
          goToSlide(newIndex);
        }
      }, 5000);
      
      return () => clearInterval(interval);
    }, [activeIndex, tools.length, isDragging, isMouseDown]);

    const navigateSlider = (direction) => {
      let newIndex;
      
      if (direction === 'prev') {
        newIndex = activeIndex === 0 ? tools.length - 1 : activeIndex - 1;
      } else {
        newIndex = (activeIndex + 1) % tools.length;
      }
      
      goToSlide(newIndex);
    };

    const scrollToIndex = (index) => {
      goToSlide(index);
    };

    const handleToolCardClick = (toolName) => {
      console.log('🔧 Tool card clicked:', toolName);
      
      const toolToModuleMap = {
        'WireShark': 'wireshark',
        'NMAP': 'nmap', 
        'Kali Linux': 'kalilinux',
        'Burp Suite': 'burpsuite',
        'John The Ripper': 'johntheripper',
        'FireWall': 'firewall',
        'SQL Injection': 'sqlinjection',
        'XSS Attacks': 'xss'
      };
      
      const moduleId = toolToModuleMap[toolName];
      console.log('🎯 Navigating to module:', moduleId);
      
      if (moduleId) {
      
        navigate(`/training-module/${moduleId}`, { 
          state: { 
            selectedTool: moduleId,
            toolName: toolName 
          } 
        });
      } else {
        
        navigate('/training-module');
      }
     
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }, 100);
    };

    const goToSlide = (index) => {
      if (index < 0 || index >= tools.length || cardWidth === 0) return;
      
      const targetScroll = index * cardWidth;
      
      if (sliderRef.current) {
        sliderRef.current.style.scrollBehavior = 'smooth';
        sliderRef.current.scrollLeft = targetScroll;
      }
      
      setActiveIndex(index);
      
      setTimeout(() => {
        if (sliderRef.current) {
          sliderRef.current.classList.add('snap-enabled');
        }
      }, 100);
    };

    useEffect(() => {
      const timer = setTimeout(() => {
        setAnimationComplete(true);
      }, 3000);

      fetchDifficultyLeaderboard("weighted");
      const loadIPData = async () => {
        try {
          await fetchIPAndLocationData();
        } catch (error) {
          console.error("❌ IP loading failed:", error);
          await getIPAddress();
        }
      };
      
      loadIPData();

      return () => {
        clearTimeout(timer);
      };
    }, []);

    const measureProfessionalPing = async () => {
      const pings = [];
      const pingTargets = [
        'https://www.google.com/generate_204',
        'https://1.1.1.1/cdn-cgi/trace',
        'https://www.msftconnecttest.com/connecttest.txt'
      ];

      console.log("📡 Profesyonel ping ölçümü başlıyor...");

      for (let i = 0; i < SPEED_TEST_CONFIG.PING_COUNT; i++) {
        const target = pingTargets[i % pingTargets.length];
        const startTime = performance.now();

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);
          
          await fetch(target, {
            method: 'HEAD',
            mode: 'no-cors', 
            cache: 'no-store',
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          const endTime = performance.now();
          const pingTime = Math.round(endTime - startTime);
          
          if (pingTime > 0 && pingTime < 1000) {
            pings.push(pingTime);
            console.log(`📡 Ping ${i + 1}: ${pingTime}ms`);
          }
          
          if (pings.length > 0) {
            const avgPing = Math.round(pings.reduce((sum, ping) => sum + ping, 0) / pings.length);
            setPing(avgPing);
          }
          
        } catch (error) {
          console.warn(`Ping ${i + 1} başarısız:`, error.message);
        }

        await new Promise(resolve => setTimeout(resolve, 300));
      }

      if (pings.length > 0) {
        const avgPing = Math.round(pings.reduce((sum, ping) => sum + ping, 0) / pings.length);
        setPing(avgPing);
        
        if (pings.length > 1) {
          let jitterSum = 0;
          for (let i = 1; i < pings.length; i++) {
            jitterSum += Math.abs(pings[i] - pings[i - 1]);
          }
          const avgJitter = Math.round(jitterSum / (pings.length - 1));
          setJitter(Math.min(25, avgJitter));
        }
        
        console.log(`📊 Final ping: ${avgPing}ms, Jitter: ${jitter}ms`);
        return avgPing;
      }

      return 45;
    };

    const measureProfessionalDownloadSpeed = async () => {
    console.log("📥 Profesyonel indirme hızı ölçümü başlıyor...");
    
    const startTime = performance.now();
    const endTime = startTime + (SPEED_TEST_CONFIG.DOWNLOAD_DURATION * 1000);
    let totalBytesDownloaded = 0;
    let currentSpeedMbps = 0;
  
    const speedCalculationInterval = setInterval(() => {
      const currentTime = performance.now();
      const elapsedSeconds = (currentTime - startTime) / 1000;
      
      if (elapsedSeconds > 1) {
        const bitsDownloaded = totalBytesDownloaded * 8;
        currentSpeedMbps = (bitsDownloaded / elapsedSeconds) / 1_000_000;
        
        setDownloadSpeed(currentSpeedMbps.toFixed(2));
        setCurrentSpeed(currentSpeedMbps);
        
        const angle = -180 + (Math.min(currentSpeedMbps, 100) / 100 * 180);
        setDownloadNeedleAngle(angle);
        
        const progress = Math.min(50, (elapsedSeconds / SPEED_TEST_CONFIG.DOWNLOAD_DURATION) * 50);
        setTestProgress(progress);
        
        console.log(`📊 Anlık indirme hızı: ${currentSpeedMbps.toFixed(2)} Mbps (Needle: ${angle}°)`);
      }
    }, SPEED_TEST_CONFIG.SPEED_CALCULATION_INTERVAL);

      const uiUpdateInterval = setInterval(() => {
      const currentTime = performance.now();
      const elapsedSeconds = (currentTime - startTime) / 1000;
      const progress = Math.min(50, (elapsedSeconds / SPEED_TEST_CONFIG.DOWNLOAD_DURATION) * 50);
      setTestProgress(progress);
    }, SPEED_TEST_CONFIG.UI_UPDATE_INTERVAL);

    try {
   
      const downloadPromises = [];
      
      for (let sessionIndex = 0; sessionIndex < 4; sessionIndex++) { 
        const downloadPromise = (async () => {
          let sessionBytes = 0;
          let fileIndex = 0;
          
          while (performance.now() < endTime) {
            try {
             
              const currentSpeed = currentSpeedMbps || 1;
              const fileSizeIndex = Math.min(
                Math.floor(currentSpeed / 20), 
                SPEED_TEST_CONFIG.DOWNLOAD_SIZES.length - 1
              );
              const fileSize = SPEED_TEST_CONFIG.DOWNLOAD_SIZES[fileSizeIndex];
              
              console.log(`📥 Session ${sessionIndex + 1}: ${fileSize / 1024 / 1024}MB dosya indiriliyor...`);      
             
              let downloadUrl;
           
              try {
                const testFileRef = storageRef(storage, 'test_download');
                downloadUrl = await getDownloadURL(testFileRef);
              } catch (firebaseError) {
                downloadUrl = `https://speed.cloudflare.com/__down?bytes=${fileSize}`;
              }
              
              const response = await fetch(downloadUrl, {
                method: 'GET',
                cache: 'no-store',
                mode: 'cors'
              });

              if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
              }

              const reader = response.body.getReader();
              let chunkBytesRead = 0;

              while (true) {
                const { done, value } = await reader.read();
                if (done || performance.now() >= endTime) break;
                
                chunkBytesRead += value.length;
                sessionBytes += value.length;
                totalBytesDownloaded += value.length;
              }
              
              console.log(`✅ Session ${sessionIndex + 1} dosya ${fileIndex + 1} tamamlandı: ${chunkBytesRead} bytes`);
              fileIndex++;
              
            } catch (error) {
              console.warn(`⚠️ Session ${sessionIndex + 1} dosya ${fileIndex + 1} hatası:`, error.message);
              await new Promise(resolve => setTimeout(resolve, 100)); 
            }
          }
          
          return sessionBytes;
        })();
        
        downloadPromises.push(downloadPromise);
      }

      const sessionResults = await Promise.all(downloadPromises);
      const totalSessionBytes = sessionResults.reduce((sum, bytes) => sum + bytes, 0);
      
      console.log(`📊 Tüm session'lar tamamlandı: ${totalSessionBytes} total bytes`);

    } catch (error) {
      console.error("❌ İndirme testi hatası:", error);
    } finally {
      clearInterval(speedCalculationInterval);
      clearInterval(uiUpdateInterval);
    }

    const finalElapsedSeconds = (performance.now() - startTime) / 1000;
    const finalBitsDownloaded = totalBytesDownloaded * 8;
    const finalSpeedMbps = (finalBitsDownloaded / finalElapsedSeconds) / 1_000_000;
    
    setDownloadSpeed(finalSpeedMbps.toFixed(2));
    setCurrentSpeed(finalSpeedMbps);
  
    const finalAngle = -180 + (Math.min(finalSpeedMbps, 100) / 100 * 180);
    setDownloadNeedleAngle(finalAngle);
    
    return finalSpeedMbps.toFixed(2);
    };

    const measureProfessionalUploadSpeed = async () => {  
      console.log("📤 Profesyonel yükleme hızı ölçümü başlıyor...");
      
      const startTime = performance.now();
      const endTime = startTime + (SPEED_TEST_CONFIG.UPLOAD_DURATION * 1000);
      let totalBytesUploaded = 0;
      let currentSpeedMbps = 0;
      let lastUpdateTime = startTime;
      let isTestActive = true; 

      try {
        const testData = new ArrayBuffer(1024);
        const testBlob = new Blob([testData]);
        const testRef = storageRef(storage, `upload_test/permission_check_${Date.now()}`);
        await uploadBytes(testRef, testBlob);
        console.log("✅ Firebase Storage yazma izni var");
      } catch (permissionError) {
        console.error("❌ Firebase Storage izin hatası:", permissionError);
        return await simulateUploadSpeed();
      }
      
      const speedCalculationInterval = setInterval(() => {
        if (!isTestActive) {
          clearInterval(speedCalculationInterval);
          return;
        }
        
        const currentTime = performance.now();
        const elapsedSeconds = (currentTime - startTime) / 1000;
        
        if (elapsedSeconds > 0.5 && totalBytesUploaded > 0) {
          const bitsUploaded = totalBytesUploaded * 8;
          currentSpeedMbps = (bitsUploaded / elapsedSeconds) / 1_000_000;
          
          const remainingTime = (endTime - currentTime) / 1000;
          if (remainingTime > 0) {
            setUploadSpeed(currentSpeedMbps.toFixed(2));
            setCurrentSpeed(currentSpeedMbps);
            
            const angle = calculateNeedleAngle(currentSpeedMbps, 20, false);
            setUploadNeedleAngle(angle);
            
            const progress = 50 + Math.min(50, (elapsedSeconds / SPEED_TEST_CONFIG.UPLOAD_DURATION) * 50);
            setTestProgress(progress);
            
            console.log(`📊 Upload - Hız: ${currentSpeedMbps.toFixed(2)} Mbps, Kalan: ${remainingTime.toFixed(1)}s`);
            lastUpdateTime = currentTime;
          }
        }
      }, 250); 

      const uiUpdateInterval = setInterval(() => {
        if (!isTestActive) {
          clearInterval(uiUpdateInterval);
          return;
        }
        
        const currentTime = performance.now();
        const elapsedSeconds = (currentTime - startTime) / 1000;
        const progress = 50 + Math.min(50, (elapsedSeconds / SPEED_TEST_CONFIG.UPLOAD_DURATION) * 50);
        setTestProgress(progress);
        
        const remainingTime = (endTime - currentTime) / 1000;
        if (remainingTime <= 1 && remainingTime > 0 && totalBytesUploaded > 0) {
          const bitsUploaded = totalBytesUploaded * 8;
          const finalSpeed = (bitsUploaded / elapsedSeconds) / 1_000_000;
          
          setUploadSpeed(finalSpeed.toFixed(2));
          setCurrentSpeed(finalSpeed);
          
          const angle = calculateNeedleAngle(finalSpeed, 20, false);
          setUploadNeedleAngle(angle);
          
          console.log(`🔥 Son saniye - Hız: ${finalSpeed.toFixed(2)} Mbps`);
        }
      }, 100); 

      try {
    
        const uploadPromises = [];
        
        for (let sessionIndex = 0; sessionIndex < 2; sessionIndex++) { 
          const uploadPromise = (async () => {
            let sessionBytes = 0;
            let uploadIndex = 0;
            
            while (performance.now() < endTime && isTestActive) {
              try {
              
                const chunkSize = 300 * 1024; 
                const testData = new ArrayBuffer(chunkSize);
                const dataView = new DataView(testData);
                
                const randomValue = Math.random() * 0xFFFFFFFF;
                for (let i = 0; i < chunkSize; i += 4) {
                  if (i + 4 <= chunkSize) {
                    dataView.setUint32(i, randomValue);
                  }
                }
                
                const blob = new Blob([testData], { type: 'application/octet-stream' });
                
                const uploadRef = storageRef(
                  storage, 
                  `sp_test/${sessionIndex}_${uploadIndex}_${Date.now()}`
                );
                
                const uploadStartTime = performance.now();
                await uploadBytes(uploadRef, blob);
                const uploadEndTime = performance.now();
                
                sessionBytes += chunkSize;
                totalBytesUploaded += chunkSize;
                uploadIndex++;
                
                console.log(`✅ S${sessionIndex + 1} U${uploadIndex}: ${chunkSize}B, ${uploadEndTime - uploadStartTime}ms`);

                await new Promise(resolve => setTimeout(resolve, 10));
                
              } catch (error) {
                console.warn(`⚠️ Upload session ${sessionIndex + 1} chunk ${uploadIndex} error:`, error.message);
            
                await new Promise(resolve => setTimeout(resolve, 50));
              }
            }
            
            console.log(`📊 Session ${sessionIndex + 1} tamamlandı: ${sessionBytes} bytes`);
            return sessionBytes;
          })();
          
          uploadPromises.push(uploadPromise);
        }

        const sessionResults = await Promise.allSettled(uploadPromises);
        const totalSessionBytes = sessionResults
          .filter(result => result.status === 'fulfilled')
          .reduce((sum, result) => sum + result.value, 0);
        
        console.log(`📊 Tüm upload session'ları tamamlandı: ${totalSessionBytes} total bytes`);

      } catch (error) {
        console.error("❌ Upload testi hatası:", error);
      } finally {
        isTestActive = false;
        clearInterval(speedCalculationInterval);
        clearInterval(uiUpdateInterval);
      }

      const finalElapsedSeconds = (performance.now() - startTime) / 1000;
      const finalBitsUploaded = totalBytesUploaded * 8;
      let finalSpeedMbps = 0;
      
      if (finalElapsedSeconds > 0 && totalBytesUploaded > 0) {
        finalSpeedMbps = (finalBitsUploaded / finalElapsedSeconds) / 1_000_000;
      }
      
      const realisticSpeed = Math.max(1.0, finalSpeedMbps);
      
      console.log(`📊 Final upload sonucu: ${realisticSpeed.toFixed(2)} Mbps`);
      console.log(`📏 Toplam yüklenen: ${(totalBytesUploaded / 1024 / 1024).toFixed(2)} MB`);
      console.log(`⏱️ Toplam süre: ${finalElapsedSeconds.toFixed(2)} saniye`);
      
      setUploadSpeed(realisticSpeed.toFixed(2));
      setCurrentSpeed(realisticSpeed);
      
      const finalAngle = calculateNeedleAngle(realisticSpeed, 20, false);
      setUploadNeedleAngle(finalAngle);
      setTestProgress(100);
      
      return realisticSpeed.toFixed(2);
    };

    const simulateUploadSpeed = async () => {
      console.log("📤 Upload simülasyon modu başlıyor...");
      
      const startTime = performance.now();
      const duration = SPEED_TEST_CONFIG.UPLOAD_DURATION * 1000;
      const targetSpeed = 8 + Math.random() * 7; 
      let isSimulationActive = true;
      
      const simulationInterval = setInterval(() => {
        if (!isSimulationActive) {
          clearInterval(simulationInterval);
          return;
        }
        
        const elapsed = (performance.now() - startTime) / 1000;
        const progress = Math.min(1, elapsed / SPEED_TEST_CONFIG.UPLOAD_DURATION);
        
        let currentSpeed;
        if (progress < 0.1) {
          currentSpeed = targetSpeed * 0.2 * (progress / 0.1);
        } else if (progress < 0.9) {
          const speedProgress = (progress - 0.1) / 0.8;
          currentSpeed = targetSpeed * 0.2 + (targetSpeed * 0.8 * speedProgress);
        } else {
          currentSpeed = targetSpeed * (0.95 + Math.random() * 0.1);
        }
        
        setUploadSpeed(currentSpeed.toFixed(2));
        setCurrentSpeed(currentSpeed);
        
        const angle = calculateNeedleAngle(currentSpeed, 20, false);
        setUploadNeedleAngle(angle);
        
        const progressPercent = 50 + (progress * 50);
        setTestProgress(progressPercent);
        
        console.log(`📊 Simüle upload: ${currentSpeed.toFixed(2)} Mbps (${(progress * 100).toFixed(1)}%)`);
        
        if (progress >= 1) {
          isSimulationActive = false;
          clearInterval(simulationInterval);
        }
      }, 150); 
      
      await new Promise(resolve => setTimeout(resolve, duration));
      
      isSimulationActive = false;
      clearInterval(simulationInterval);
      
      const finalSpeed = targetSpeed.toFixed(2);
      setUploadSpeed(finalSpeed);
      setCurrentSpeed(targetSpeed);
      setTestProgress(100);
      
      console.log(`📊 Simülasyon tamamlandı: ${finalSpeed} Mbps`);
      return finalSpeed;
    };

    const checkFirebaseStorageRules = async () => {
      try {
        const testData = new ArrayBuffer(1024);
        const testBlob = new Blob([testData]);
        const testRef = storageRef(storage, `test_uploads/permission_${Date.now()}`);
        
        await uploadBytes(testRef, testBlob);
        console.log("✅ Firebase Storage yazma izni aktif");
        return true;
      } catch (error) {
        console.error("❌ Firebase Storage yazma izni yok:", error);
        console.log("💡 Firebase Console'da Storage Rules kontrol edin:");
        console.log(`
        rules_version = '2';
        service firebase.storage {
          match /b/{bucket}/o {
            match /{allPaths=**} {
              allow read, write: if true; // Geçici test için
            }
          }
        }
        `);
        return false;
      }
    };

    const ArcFillComponent = () => {
    const radius = 85;
    const strokeWidth = 8;
    const centerX = 100;
    const centerY = 100;
    const startAngle = -180; 
    const currentAngle = smoothNeedleAngle; 
    
    if (currentAngle <= startAngle + 2) {
      return (
        <svg 
          className="gauge-arc-overlay"
          width="200" 
          height="200" 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none'
          }}
        >
          <path
            d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </svg>
      );
    }
    
    const startX = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
    const startY = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
    const endX = centerX + radius * Math.cos((currentAngle * Math.PI) / 180);
    const endY = centerY + radius * Math.sin((currentAngle * Math.PI) / 180);
    const sweepAngle = currentAngle - startAngle;
    const largeArcFlag = sweepAngle > 180 ? 1 : 0;
    const pathData = `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
    
    return (
      <svg 
        className="gauge-arc-overlay"
        width="200" 
        height="200" 
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none'
        }}
      >
        <path
          d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <path
          d={pathData}
          fill="none"
          stroke={isDownloadTest ? '#00f2ff' : '#cc00ff'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 6px ${isDownloadTest ? '#00f2ff' : '#cc00ff'})`
          }}
        />
      </svg>
    );
    };

    const GaugeSection = () => {
      const displaySpeed = isDownloadTest ? smoothDownloadSpeed : smoothUploadSpeed;
        
      return (
        <div className={`gauge ${isDownloadTest ? 'gauge-download' : 'gauge-upload'}`}>
          <div className="gauge-background"></div>
          <ArcFillComponent />
          <div className="gauge-center">
            <div className="gauge-value">{displaySpeed.toFixed(2)}</div>
            <div className="gauge-unit">Mbps</div>
          </div>
          <div 
            className="gauge-needle" 
            style={{ 
              transform: `rotate(${smoothNeedleAngle}deg)`,
              background: isDownloadTest ? 
                'linear-gradient(90deg, rgba(255, 255, 255, 0.3), #00f2ff)' : 
                'linear-gradient(90deg, rgba(255, 255, 255, 0.3), #cc00ff)',
              transformOrigin: 'center left', 
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />
        </div>
      );
    };

    const ProgressBarSection = () => (
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className={`progress-fill ${isDownloadTest ? 'progress-download' : 'progress-upload'}`} 
            style={{ 
              width: `${testProgress}%`,
              transition: 'width 0.5s ease-out'
            }}
          />
        </div>
      </div>
    );

    const getTestFileInfo = async () => {
      try {
        const testFileRef = storageRef(storage, 'test_download');
        const downloadUrl = await getDownloadURL(testFileRef);
        const metadata = await getMetadata(testFileRef);
        
        console.log("✅ Firebase test dosyası bulundu:", downloadUrl);
        console.log("✅ Dosya boyutu:", metadata.size);
        
        setTestFile(downloadUrl);
        setTestFileSize(metadata.size || 5 * 1024 * 1024);
        
        return { 
          url: downloadUrl, 
          size: metadata.size || 5 * 1024 * 1024,
          source: 'firebase'
        };
      } catch (error) {
        console.error("❌ Firebase dosyası kullanılamıyor:", error);
        const alternatives = [
          {
            url: 'https://speed.cloudflare.com/__down?bytes=10485760',
            size: 10 * 1024 * 1024,
            source: 'cloudflare'
          },
          {
            url: 'https://httpbin.org/bytes/5242880', 
            size: 5 * 1024 * 1024,
            source: 'httpbin'
          }
        ];

        for (const alt of alternatives) {
          try {
            const testResponse = await fetch(alt.url, { method: 'HEAD' });
            if (testResponse.ok) {
              console.log(`✅ Alternatif test dosyası: ${alt.source}`);
              setTestFile(alt.url);
              setTestFileSize(alt.size);
              return alt;
            }
          } catch (altError) {
            continue;
          }
        }
        
        throw new Error("Hiçbir test dosyası kullanılamıyor");
      }
    };

    const updateGaugeUI = (currentValue, maxSpeed, isDownloadTest) => {
      setCurrentSpeed(parseFloat(currentValue));
      
      const maxDisplayValue = 100; 
      const needleAngle = -180 + (180 * (currentValue / maxDisplayValue));
      
      if (isDownloadTest) {
        setDownloadNeedleAngle(needleAngle);
      } else {
        setUploadNeedleAngle(needleAngle);
      }
      const arcFillElement = document.querySelector('.gauge-arc-fill');
      if (arcFillElement) {

        const startColor = isDownloadTest ? '#00f2ff' : '#cc00ff';
        const endColor = isDownloadTest ? '#0088ff' : '#8800ff';
        const svgSize = 180; 
        const radius = svgSize / 2;
        const center = radius;
        const startAngle = -180;
        const endAngle = needleAngle; 
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;

        let path;

        if (endAngle <= -179.9) {
          path = `M ${center} ${center} L ${center} ${0} A ${0} ${0} 0 0 1 ${center} ${0} Z`;
        } else {

          const largeArcFlag = Math.abs(endAngle - startAngle) >= 180 ? 1 : 0;
          
          const startX = center + radius * Math.cos(startRad);
          const startY = center + radius * Math.sin(startRad);
          
          const endX = center + radius * Math.cos(endRad);
          const endY = center + radius * Math.sin(endRad);
      
          path = `M ${center} ${center} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
        }

        arcFillElement.style.clipPath = `path('${path}')`;
        
        arcFillElement.style.background = `linear-gradient(90deg, ${startColor}, ${endColor})`;
      }
    };

    const updateSpeedTestUI = (speedValue, isDownloadTest, progress) => {
  
      const speed = parseFloat(speedValue);
      setCurrentSpeed(speed);
      
      const maxValue = isDownloadTest ? 100 : 20;
      const angle = -90 + (Math.min(speed, maxValue) / maxValue * 180);
      
     
        if (isDownloadTest) {
          setDownloadNeedleAngle(angle);
        } else {
          setUploadNeedleAngle(angle);
        }
        
        const arcFillAngle = angle + 90;
      
        setTestProgress(progress);
        setAnimationProgress(progress);
    };
  
    const startSpeedTest = async () => {
      if (isTestRunning) return;

      setIsTestRunning(true);
      setErrorMessage("");
      setSpeedTestPhase('testing');

      setDownloadSpeed('0.00');
      setUploadSpeed('0.00');
      setDownloadNeedleAngle(-180); 
      setUploadNeedleAngle(-180);   
      setPing(0);
      setJitter(0);
      setDownloadLatency(0);
      setUploadLatency(0);
      setCurrentSpeed(0);
      setTestProgress(0);
      
      setSmoothDownloadSpeed(0);
      setSmoothUploadSpeed(0);
      setSmoothNeedleAngle(-180); 
      setArcProgress(0);
      
      setAnimationPhase("preparing");
      setAnimationProgress(0);
      setIsDownloadTest(true);
      
      setTimeout(() => {
        setShowResults(true);
        setAnimationPhase("testing");
      }, 800);

      try {
        console.log("🚀 Speed test starting...");
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        await fetchIPAndLocationData();
        updateSpeedTestUI(0, true, 5);
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const fileInfo = await getTestFileInfo();
        if (!fileInfo) {
          throw new Error("Test file couldn't be retrieved");
        }
        
        console.log("📡 Measuring ping...");
        const pingAnimationDuration = 1500; 
        const pingAnimationInterval = 50; 
        const pingAnimationSteps = pingAnimationDuration / pingAnimationInterval;
        let pingStep = 0;
        
        const pingInterval = setInterval(() => {
          pingStep++;
        
          const pingProgress = pingStep / pingAnimationSteps;
          const targetPing = 40 + Math.random() * 20;
          const startPing = 200;
          const currentPing = startPing - (pingProgress * (startPing - targetPing));
          const randomVariation = Math.sin(pingStep) * 15;
          
          const fakePing = Math.round(Math.max(10, Math.min(200, currentPing + randomVariation)));
          setPing(fakePing);
          
          const progress = 5 + (pingStep / pingAnimationSteps * 5);
          updateSpeedTestUI(0, true, progress);
          
          if (pingStep >= pingAnimationSteps) {
            clearInterval(pingInterval);
            
            downloadTestPhase();
          }
        }, pingAnimationInterval);
      } catch (error) {
        console.error("❌ Speed test error:", error);
        setErrorMessage("Error during speed test: " + error.message);
        setIsTestRunning(false);
        setAnimationPhase("idle");
        setSpeedTestPhase('start');
        
        document.querySelector('.speedtest-results')?.classList.remove('test-active');
      }
    };

    const downloadTestPhase = async () => {
      try {
        console.log("📥 Profesyonel indirme testi başlatılıyor...");
        
        await measureProfessionalPing();
        
        document.querySelector('.speedtest-results')?.classList.add('test-active');
        setCurrentSpeed(0);
        setDownloadNeedleAngle(-90);
        setTestProgress(10);
        
        const latencyStartTime = performance.now();
        try {
          const testFileRef = storageRef(storage, 'test_download');
          await getMetadata(testFileRef);
          const latencyEndTime = performance.now();
          setDownloadLatency(Math.round(latencyEndTime - latencyStartTime));
        } catch (error) {
          setDownloadLatency(120); 
        }
        
        const realDownloadSpeed = await measureProfessionalDownloadSpeed();
        
        console.log("✅ Indirme testi tamamlandı:", realDownloadSpeed);
        
        setTimeout(() => {
          setIsDownloadTest(false);
          uploadTestPhase();
        }, 1000);
        
      } catch (error) {
        console.error("❌ İndirme test hatası:", error);
        setErrorMessage("İndirme testi sırasında hata: " + error.message);
        
        setDownloadSpeed('30.00');
        setTestProgress(50);
        
        setTimeout(() => {
          setIsDownloadTest(false);
          uploadTestPhase();
        }, 1000);
      }
    };  

    const calculateNeedleAngle = (speed, maxSpeed, isDownloadTest) => {

      const clampedSpeed = Math.max(0, Math.min(speed, maxSpeed));
      
      const angle = -180 + (clampedSpeed / maxSpeed * 180);
      
      const clampedAngle = Math.max(-180, Math.min(0, angle));
      
      console.log(`${isDownloadTest ? 'Download' : 'Upload'} - Speed: ${speed}, Angle: ${clampedAngle}°`);
      
      return clampedAngle;
    };

    const uploadTestPhase = async () => {
      try {
        console.log("📤 Upload test fazı başlatılıyor...");
        
        document.querySelector('.speedtest-results')?.classList.add('test-active');
        setCurrentSpeed(0);
        setUploadNeedleAngle(-180); 
        setTestProgress(60);
        
        const latencyStartTime = performance.now();
        try {
          const smallTestData = new ArrayBuffer(512); 
          const smallBlob = new Blob([smallTestData]);
          const latencyUploadRef = storageRef(storage, `latency_${Date.now()}`);
          await uploadBytes(latencyUploadRef, smallBlob);
          const latencyEndTime = performance.now();
          setUploadLatency(Math.round(latencyEndTime - latencyStartTime));
        } catch (error) {
          setUploadLatency(120); 
        }
        
        const realUploadSpeed = await measureProfessionalUploadSpeed();
        
        console.log("✅ Upload testi tamamlandı:", realUploadSpeed);
        
        setTimeout(() => {
          finalizeTest();
        }, 500);
        
      } catch (error) {
        console.error("❌ Upload test hatası:", error);
        setErrorMessage("Upload testi sırasında hata: " + error.message);
        
        setUploadSpeed('8.00');
        setTestProgress(100);
        
        setTimeout(() => {
          finalizeTest();
        }, 500);
      }
    };

    const finalizeTest = () => {
      setTestProgress(100);
      setAnimationProgress(100);
      
      document.querySelector('.speedtest-results')?.classList.remove('test-active');
      document.querySelector('.speedtest-results')?.classList.add('test-complete');
      
      console.log("✅ Speed test completed!");
      setAnimationPhase("complete");
      setSpeedTestPhase('results');
      
      setTimeout(() => {
        const gauges = document.querySelectorAll('.gauge');
        gauges.forEach(gauge => {
          gauge.classList.add('pulse-complete');
        });
        
        setTimeout(() => {
          gauges.forEach(gauge => {
            gauge.classList.remove('pulse-complete');
          });
          setIsTestRunning(false);
        }, 1500);
      }, 500);
    };  

    const restartTest = () => {
      setSpeedTestPhase('start');
      setIsDownloadTest(true);
      setCurrentSpeed(0);
      setTestProgress(0);
      setDownloadSpeed('0.00');
      setUploadSpeed('0.00');
      setAnimationPhase("idle");
      setIsTestRunning(false);
      setDownloadNeedleAngle(-90); 
      setUploadNeedleAngle(-90);   
      setPing(0);
      setJitter(0);
      setErrorMessage("");
    
      setSmoothDownloadSpeed(0);
      setSmoothUploadSpeed(0);  
      setSmoothNeedleAngle(-90); 
      setArcProgress(0);
    };

    const restartSpeedTest = restartTest;

    const pulseCompleteStyle = `
    .gauge.pulse-complete {
      animation: pulse-complete 1.5s ease-in-out;
    }

    @keyframes pulse-complete {
      0% { transform: scale(1); }
      50% { transform: scale(1.03); }
      100% { transform: scale(1); }
    }
    `;
  
    const getIPAddress = async () => {
      try {
        const response = await fetch("https://us-central1-networksecurity-866ff.cloudfunctions.net/getClientIP", {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("🌐 IP address:", data.ip);
        setUserIP(data.ip);
        return data.ip;
      } catch (error) {
        console.error("❌ Main IP service failed:", error);
      
        return await getBackupIP();
      }
    };

    const getBackupIP = async () => {
      const services = [
        'https://api.ipify.org?format=json',
        'https://ipapi.co/json/',
        'https://api.myip.com'
      ];

      for (const service of services) {
        try {
          console.log(`🔄 Trying backup service: ${service}`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const response = await fetch(service, {
            signal: controller.signal,
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            }
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          
          const data = await response.json();
          const ip = data.ip || data.query;
          
          // IP formatını doğrula
          const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
          if (ip && ipRegex.test(ip)) {
            console.log(`✅ Backup IP found: ${ip} from ${service}`);
            setUserIP(ip);
            return ip;
          }
          
        } catch (error) {
          console.warn(`❌ ${service} failed:`, error.message);
          continue;
        }
      }
      
      console.error("❌ All IP services failed");
      setUserIP("Unable to detect IP");
      return null;
    };
  
    const changeServer = () => {
      alert('This feature is not implemented yet');
    };
    
    const fetchIPAndLocationData = async () => {
      try {
        const ipResponse = await fetch("https://us-central1-networksecurity-866ff.cloudfunctions.net/getClientIP", {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        });
        
        if (!ipResponse.ok) {
          throw new Error(`HTTP error! Status: ${ipResponse.status}`);
        }
        
        const ipData = await ipResponse.json();
        setUserIP(ipData.ip);
        
        const locationRef = ref(db, `LocationData/${ipData.ip.replace(/\./g, '_')}`);
        const locationSnapshot = await get(locationRef);
        
        if (locationSnapshot.exists()) {
          const data = locationSnapshot.val();
          setLocationData({
            city: data.city || "İzmir",
            provider: data.isp || "Türk Telekom"
          });
          console.log("🌐 Location data loaded from Firebase:", data);
        } else {
          console.log("📍 No location data in Firebase, using defaults");
        }
      } catch (error) {
        console.error("❌ Error fetching location data:", error);
        
        // Ana servis başarısızsa yedek IP servislerini dene
        const backupIP = await getBackupIP();
        
        if (!backupIP) {
          setUserIP("Detecting...");
          setLocationData({
            city: "Unknown",
            provider: "Unknown ISP"
          });
        }
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
        console.log("📋 Kullanıcı verileri alındı, kullanıcı sayısı:", Object.keys(allUserData).length);
        
        const currentUserId = localStorage.getItem('userId');
        if (currentUserId && allUserData[currentUserId]) {
          console.log("✅ Mevcut kullanıcı:", currentUserId, "İsim:", allUserData[currentUserId].name || "İsimsiz");
        } else if (currentUserId) {
          console.log("⚠️ Mevcut kullanıcı ID'si bulunamadı:", currentUserId);
        }
        
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
                  console.log(`✅ ${userId} için gerçek isim bulundu: ${displayName}`);
                } else {
              
                  displayName = `User-${userId.slice(0, 6)}`;
                  console.log(`⚠️ ${userId} için gerçek isim bulunamadı, varsayılan kullanılıyor: ${displayName}`);
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
        
        console.log(`🏆 ${selectedDifficulty} zorluğundaki liderlik tablosu güncellendi: ${topUsers.length} kullanıcı`);
        
        if (topUsers.length > 0) {
          console.log("👤 Kullanıcı İsimleri:", topUsers.map(u => u.name).join(", "));
          if (selectedDifficulty === "weighted") {
            topUsers.forEach(user => {
              console.log(`${user.name}: Basic=${user.basicScore.toFixed(1)}, Midd=${user.middScore.toFixed(1)}, Hard=${user.hardScore.toFixed(1)}, Weighted=${user.weightedAverage.toFixed(1)}`);
            });
          } else {
            const scoreType = selectedDifficulty === "basic" ? "basicScore" : selectedDifficulty === "midd" ? "middScore" : "hardScore";
            topUsers.forEach(user => {
              console.log(`${user.name}: ${selectedDifficulty}=${user[scoreType].toFixed(1)}`);
            });
          }
        }
        
        setLeaderboard(topUsers);
      } catch (err) {
        console.error(`🔥 ${selectedDifficulty} zorluğundaki liderlik tablosu yüklenirken hata:`, err);
      } finally {
        setLeaderboardLoading(false);
      }
    };
    
    return (
    <div className="app-container">
      <header className="hero-section">
        <div className="hero-background">
          <div className="bg-circle-blue"></div>
          <div className="bg-circle-purple"></div>
  
          <svg className="digital-grid">
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(59, 130, 246, 0.1)" strokeWidth="1" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {[...Array(6)].map((_, i) => (
              <motion.circle
                key={i}
                cx={`${Math.random() * 100}%`}
                cy={`${Math.random() * 100}%`}
                r="1"
                fill="#3b82f6"
                initial={{ opacity: 0.05 }}
                animate={{ 
                  opacity: [0.05, 0.2, 0.05],
                  scale: [1, 1.5, 1]
                }}
                transition={{ 
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
          </svg>
        </div>
        
        <div className="container">
          <div className="hero-content-wrapper">
            <div className="hero-content-flex">
              <motion.div 
                className="hero-text-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <motion.div
                  className="hero-badge"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  Stay Safe in the Digital World
                </motion.div> 
                  <motion.h1 
                    className="hero-title"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <span className="title-line">
                      Cybersecurity 
                    </span> 
                    <br />
                    <span className="title-line">Training Platform</span>
                </motion.h1>
                
                <motion.p 
                  className="hero-description"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  Learn to Protect Your Digital Assets with Innovative Technologies. 
                  Cybersecurity courses from expert instructors, 
                  practical tools, and certifications.
                </motion.p>
                
                <motion.div 
                  className="hero-buttons"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                >
                   <button 
                    className="btn-education"
                    onClick={() => navigate('/training-module')}
                  >
                    <BookOpen size={16} />
                    <span>Start Learning</span>
                  </button>
                </motion.div>
              </motion.div>
            
              <motion.div 
                className="hero-image-section"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
              >
                <img 
                  src="/photos/main.png" 
                  alt="Siber Güvenlik Platformu" 
                  className="hero-main-image" 
                />
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      <section className="articles-section">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="homepage-section-title">
              <FileText size={38} className="section-icon" />
              Our Mission
            </h2>
          </motion.div>
          
          <motion.div 
            className="articles-list"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1, delayChildren: 0.1 }
              }
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {articles.map((article, index) => (
              <motion.div 
                key={index}
                className="article-card"
                variants={{
                  hidden: { y: 20, opacity: 0 },
                  visible: {
                    y: 0,
                    opacity: 1,
                    transition: { duration: 0.4 }
                  }
                }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="article-content">
                  <div className="article-image-container">
                    <img src={article.image} alt={article.title} className="article-image" />
                  </div>
                  
                  <div className="article-details">
                    <h3 className="article-title">
                      {article.title}
                    </h3>
                    
                    <p className="article-excerpt">
                      {article.excerpt}
                    </p>
            
                    <a href={article.href} className="read-more-link">
                      {article.title.includes("Speed Test") ? (
                        <>
                          Test Your Internet Speed
                          <ChevronRight size={16} className="icon-small" />
                        </>
                      ) : article.title.includes("Training Module") ? (
                        <>
                          Start Learning
                          <ChevronRight size={16} className="icon-small" />
                        </>
                      ) : article.title.includes("Wi-Fi Analyzer") ? (
                        <>
                          Analyze Your Network
                          <ChevronRight size={16} className="icon-small" />
                        </>
                      ) : (
                        <>
                          Solve the Quizzes
                          <ChevronRight size={16} className="icon-small" />
                        </>
                      )}
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
        <section className="tools-quiz-section">
          <div className="gradient-bg-overlay"></div>

            <div className="container">
              <div className="tools-quiz-grid">
                
                <motion.div 
                  className="quiz-leaderboard-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4 }}
                >
                  <h3 className="card-title">
                    <Award className="card-icon yellow-icon" />
                    Quiz Leaderboard
                  </h3>
                  
                  <p className="leaderboard-subtitle">See the Top Scoring Users</p>
              
                  <div className="home-difficulty-filter">
                    <div className="home-filter-options">
                      <button 
                        className={`home-filter-button ${selectedLeaderboardDifficulty === 'weighted' ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedLeaderboardDifficulty('weighted');
                          fetchDifficultyLeaderboard('weighted');
                        }}
                      >
                        Overall
                      </button>
                      <button 
                        className={`home-filter-button ${selectedLeaderboardDifficulty === 'basic' ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedLeaderboardDifficulty('basic');
                          fetchDifficultyLeaderboard('basic');
                        }}
                      >
                        Basic
                      </button>
                      <button 
                        className={`home-filter-button ${selectedLeaderboardDifficulty === 'midd' ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedLeaderboardDifficulty('midd');
                          fetchDifficultyLeaderboard('midd');
                        }}
                      >
                        Intermediate
                      </button>
                      <button 
                        className={`home-filter-button ${selectedLeaderboardDifficulty === 'hard' ? 'active' : ''}`}
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
                    <div className="home-leaderboard-loading">
                      <div className="loading-spinner small"></div>
                      <p>Loading leaderboard...</p>
                    </div>
                  ) : leaderboard.length === 0 ? (
                    <div className="home-leaderboard-empty">
                      <div className="empty-icon">🏆</div>
                      <h3>No leaderboard data yet</h3>
                      <p>Be the first to complete the quiz and make it to the leaderboard!</p>
                    </div>
                  ) : (
                    <div className="home-leaderboard-list">
                      {leaderboard.slice(0, 3).map((user, index) => (
                        <div key={user.userId} className="home-leaderboard-item">
                          <div className="home-user-rank-and-info">
                            <div className={`home-rank-badge ${
                              index === 0 ? 'home-rank-gold' : 
                              index === 1 ? 'home-rank-silver' : 
                              'home-rank-bronze'
                            }`}>
                              {index + 1}
                            </div>

                            <div className="home-user-info">
                              <div className="home-user-avatar">{user.avatar}</div>
                              <div className="home-user-details">
                                <div className="home-user-name">{user.name}</div>
                                <div className="home-user-badge">
                                  {user.weightedAverage >= 90 ? 'Expert' : 
                                  user.weightedAverage >= 80 ? 'Master' : 
                                  user.weightedAverage >= 70 ? 'Pro' : 'Learner'}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="home-user-score gradient-text">
                            {Math.round(
                              selectedLeaderboardDifficulty === 'weighted' ? user.weightedAverage : 
                              selectedLeaderboardDifficulty === 'basic' ? user.basicScore : 
                              selectedLeaderboardDifficulty === 'midd' ? user.middScore : user.hardScore
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button 
                    className="btn-view-rankings"
                    onClick={() => window.location.href = '/quizzes'}
                  >
                    View Full Ranking
                  </button>
                </motion.div>
              <motion.div 
                className="performance-test-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4 }}
              >            
                <div className="test-header">
                  <Bolt className="test-icon" color="#00f2ff" size={22} />
                  <div className="test-title">Cybersecurity Speed Test</div>
                </div>
                {speedTestPhase === 'start' ? (                
                  <div className="test-start-phase">                
                    <div className="go-button-container">
                      <button 
                        className={`go-button ${connectionMode === 'multi' ? 'go-button-multi' : 'go-button-single'}`} 
                        onClick={startSpeedTest}
                      >
                        GO
                        <div className="pulse-animation"></div>
                      </button>
                    </div>                   
                    <div className="connection-details-container">                
                      <div className="provider-ip-container">
                        <div className="connection-item">
                          <Zap size={16} className="connection-icon" color="rgba(255,255,255,0.7)" />
                          <span className="connection-label">Connection:</span>
                          <span className="connection-value">{connectionInfo.isp}</span>
                        </div>
                        
                        <div className="connection-item">
                          <Eye size={16} className="connection-icon" color="rgba(255,255,255,0.7)" />
                          <span className="connection-label">Your IP Address:</span>
                          <span className="connection-value">
                            {userIP === "Detecting..." || userIP === "Unable to detect IP" ? (
                              <span style={{ opacity: 0.7, fontStyle: 'italic' }}>{userIP}</span>
                            ) : (
                              userIP || 'Loading...'
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="server-container">
                        <div className="connection-item">
                          <Globe size={16} className="connection-icon" color="rgba(255,255,255,0.7)" />
                          <span className="connection-label">Server:</span>
                          <span className="connection-value">{serverInfo.name}</span>
                          <span className="connection-location">({serverInfo.location})</span>
                        </div>                        
                        <a href="#" className="server-change-link" onClick={(e) => { e.preventDefault(); changeServer(); }}>
                          Change the Server
                        </a>
                      </div>
                    </div>             
                    <div className="test-mode-container">
                      <div className="test-mode-title">Connections</div>
                      <div className="test-mode-options">
                        <button 
                          className={`test-mode-option ${connectionMode === 'multi' ? 'active' : ''}`}
                          onClick={() => setConnectionMode('multi')}
                        >
                          Multi
                        </button>
                        <button 
                          className={`test-mode-option ${connectionMode === 'single' ? 'active' : ''}`}
                          onClick={() => setConnectionMode('single')}
                        >
                          Single
                        </button>
                        <div className="indicator" style={{ 
                          transform: connectionMode === 'multi' ? 'translateX(0)' : 'translateX(90px)',
                          background: connectionMode === 'multi' ? 'rgba(0, 242, 255, 0.15)' : 'rgba(255, 107, 0, 0.15)'
                        }}></div>
                      </div>
                    </div>
                  </div>
                ) : speedTestPhase === 'testing' ? (                
                  <div className="test-testing-phase">                  
                    <div className="top-metrics-container">
                      <div className="metric-box download-metric">
                        <div className="metric-label">Download Mbps</div>
                        <div className="metric-value">{downloadSpeed || '0.00'}</div>
                      </div>
                      <div className="metric-box upload-metric">
                        <div className="metric-label">Upload Mbps</div>
                        <div className="metric-value">{uploadSpeed || '0.00'}</div>
                      </div>
                    </div>             
                    <div className="secondary-metrics-container">
                      <div className="secondary-metric ping-metric">
                        <Clock className="metric-icon" size={14} />
                        <div className="secondary-metric-label">Ping</div>
                        <div className="secondary-metric-value">{ping || '0'}<span className="metric-unit">ms</span></div>
                      </div>
                      <div className="secondary-metric download-latency-metric">
                        <ArrowDown className="metric-icon" size={14} />
                        <div className="secondary-metric-label">Download Latency</div>
                        <div className="secondary-metric-value">{downloadLatency || '0'}<span className="metric-unit">ms</span></div>
                      </div>
                      <div className="secondary-metric upload-latency-metric">
                        <ArrowUp className="metric-icon" size={14} />
                        <div className="secondary-metric-label">Upload Latency</div>
                        <div className="secondary-metric-value">{uploadLatency || '0'}<span className="metric-unit">ms</span></div>
                      </div>
                    </div>                                          
                    <div className="gauge-container">  
                      <div className="test-label">
                            {isDownloadTest ? (
                              <span className="download-label">Download Test</span>
                            ) : (
                              <span className="upload-label">Upload Test</span>
                            )}
                          </div>                                             
                          <GaugeSection />                                                
                          <ProgressBarSection />
                    </div>                                
                    <div className="connection-info-footer">                      
                      <div className="connection-info-group">
                        <div className="connection-info-item">
                          <span className="connection-label">Connection:</span>
                          <span className="connection-value">
                            {locationData.provider || connectionInfo.isp || 'Detecting...'}
                          </span>
                        </div>                     
                        <div className="connection-divider"></div>                       
                       <div className="connection-info-item">
                        <span className="connection-label">Your IP Address:</span>
                        <span className="connection-value">
                          {userIP === "Detecting..." || userIP === "Unable to detect IP" ? (
                            <span style={{ opacity: 0.7, fontStyle: 'italic' }}>{userIP}</span>
                          ) : (
                            userIP || 'Loading...'
                          )}
                        </span>
                      </div>
                      </div>                                      
                      <div className="connection-info-group">
                        <div className="connection-info-item">
                          <span className="connection-label">Server:</span>
                          <span className="connection-value">
                            {serverInfo.name || 'Auto-Selected'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  
                  <>
                    <div className="speed-results-panel">
                      <div className="speed-results-header">TEST RESULTS</div>                   
                      <div className="speed-metric-card">
                        <div className="speed-metric-left">
                          <ArrowDown className="speed-icon download-speed-icon" size={14} />
                          Download
                        </div>
                        <div className="speed-metric-right">
                          <span className="download-speed-value">{downloadSpeed}</span>
                          <span className="speed-unit">Mbps</span>
                        </div>
                      </div>                    
                      <div className="speed-metric-card">
                        <div className="speed-metric-left">
                          <ArrowUp className="speed-icon upload-speed-icon" size={14} />
                          Upload
                        </div>
                        <div className="speed-metric-right">
                          <span className="upload-speed-value">{uploadSpeed}</span>
                          <span className="speed-unit">Mbps</span>
                        </div>
                      </div>                     
                      <div className="speed-metric-card">
                        <div className="speed-metric-left">
                          <Clock className="speed-icon ping-speed-icon" size={14} />
                          Ping
                        </div>
                        <div className="speed-metric-right">
                          <span className="ping-speed-value">{ping}</span>
                          <span className="speed-unit">(±{Math.floor(ping * 0.15)}ms)</span>
                          <span className="speed-unit">ms</span>
                        </div>
                      </div>
                      <div className="latency-metrics-grid">
                        <div className="latency-metric-card download-latency-card">
                          <div className="latency-metric-label">Download Latency</div>
                          <div className="latency-metric-value">{downloadLatency}<span className="speed-unit">ms</span></div>
                        </div>
                        <div className="latency-metric-card upload-latency-card">
                          <div className="latency-metric-label">Upload Latency</div>
                          <div className="latency-metric-value">{uploadLatency}<span className="speed-unit">ms</span></div>
                        </div>
                      </div>
                    </div>              
                    <button className="speed-test-restart-btn" onClick={restartSpeedTest}>
                      Re-test
                    </button>
                  </>
                )}
              </motion.div>
           </div>
          </div>
        </section>
         <section className="security-tools-section">
          <div className="security-container">
            <div className="security-section-header">
             <h2 className="security-section-title">
                <Shield size={42} className="security-section-icon" />
                Cyber Security Tools
              </h2>
              <p className="security-section-subtitle">Essential Security Tools You Need to Master</p>
            </div>                 
            <div className="security-slider-controls">
              <button 
                className="security-slider-control prev"
                onClick={() => navigateSlider('prev')}
              >
                <ChevronLeft size={24} />
              </button>              
              <div className="security-slider-indicators">
               
                {tools.map((_, index) => (
                  <div 
                    key={index}
                    className={`security-slider-indicator ${index === activeIndex ? 'active' : ''}`}
                    onClick={() => goToSlide(index)}
                  />
                ))}
              </div>             
              <button 
                className="security-slider-control next"
                onClick={() => navigateSlider('next')}
              >
                <ChevronRight size={24} />
              </button>
            </div>                   
            <div 
              className="security-tools-cards-container" 
              ref={sliderRef}
            >             
              {tools.map((tool, index) => (
                <motion.div 
                  key={index}
                  className={`security-tool-card ${index === activeIndex ? 'active' : ''}`}
                  initial={{ opacity: 0.7, scale: 0.95 }}
                  animate={{ 
                    opacity: index === activeIndex ? 1 : 0.7,
                    scale: index === activeIndex ? 1 : 0.95
                  }}
                  transition={{ duration: 0.3 }}
                  
                  style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                >
                  <div className="security-card-header" style={{ backgroundColor: `${tool.color}10` }}>
                    <div className="security-tool-icon-wrapper" style={{ backgroundColor: tool.color }}>
                      {tool.icon}
                    </div>
                    <h3 className="security-tool-name">{tool.name}</h3>
                    <div className={`security-difficulty-badge security-difficulty-${tool.difficulty.toLowerCase().replace('-', '')}`}>
                      {tool.difficulty}
                    </div>
                  </div>
                  
                  <div className="security-card-body">
                    <div className="security-tool-description">
                      {tool.description}
                    </div>
                    
                    <div className="security-tool-features">
                      {tool.features.map((feature, fIndex) => (
                        <span key={fIndex} className="security-feature-tag">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="security-card-footer">
                    <button 
                      className="security-learn-more-btn" 
                      style={{ backgroundColor: tool.color }}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (!isDragging && !isMouseDown) { 
                          handleToolCardClick(tool.name);
                        }
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation(); 
                      }}
                    >
                      Get More Information
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="security-view-all-container">
              <a href="/training-module" className="security-view-all-link">
                View All Security Tools and Trainings
                <ChevronRight size={16} />
              </a>
            </div>
          </div>
        </section>

      </div>
    );
  };

export default HomePage;