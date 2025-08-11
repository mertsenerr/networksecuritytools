import React from "react";
import "../styles/WifiAnalyzer.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { motion } from 'framer-motion';
import { 
  Wifi, 
  Shield, 
  Activity, 
  Zap, 
  Eye, 
  Lock, 
  Unlock,
  MapPin,
  BarChart3,
  Signal,
  Radio,
  Clock,
  AlertTriangle,
  CheckCircle,
  Info,
  Smartphone,
  Monitor,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

function WifiAnalyzer() {
  const features = [
    {
      id: 1,
      title: "WiFi Network Scanning",
      description: "Detect all WiFi networks around you",
      icon: <Wifi className="feature-icon" />,
      details: [
        "Automatic network discovery",
        "Real-time scanning",
        "Detects hidden networks",
        "One-tap start"
      ]
    },
    {
      id: 2,
      title: "Signal Strength Analysis",
      description: "Measure and analyze WiFi signal strength",
      icon: <Signal className="feature-icon" />,
      details: [
        "Accurate measurement in dBm",
        "Visual signal bars",
        "Quality assessment",
        "Real-time updates"
      ]
    },
    {
      id: 3,
      title: "Security Analysis",
      description: "Check the security protocols of networks",
      icon: <Shield className="feature-icon" />,
      details: [
        "WPA2/WPA3 detection",
        "Open network alerts",
        "Security level assessment",
        "Risk analysis"
      ]
    },
    {
      id: 4,
      title: "Map View",
      description: "View WiFi networks on the map",
      icon: <MapPin className="feature-icon" />,
      details: [
        "GPS-based location",
        "Signal density map",
        "Save network locations",
        "Regional analysis"
      ]
    }
  ];

  const steps = [
    {
      step: 1,
      title: "Start Screen",
      description: "The main screen you see when you open the app. If you are not connected to any network, the 'No Network' status is shown.",
      image: "First screen - No connection status",
      content: `On the main screen that greets you when you open the app, the information about the network you are connected to is displayed at the top. If you are not connected to any WiFi network yet, a 'No Network' warning appears. From this screen, you can start a network scan and quickly see your current connection status. Thanks to the user-friendly and simple interface, you can easily adapt even on your first use.`
    },
    {
      step: 2,
      title: "Start WiFi Scan",
      description: "When you tap the large scan button, the WiFi scanning process begins. The button starts spinning with an animation.",
      image: "Scan button active",
      content: `When you tap the large 'Start Scan' button on the main screen, the app starts scanning for WiFi networks around you. The animated spinning of the button indicates that the scan is active. Networks are listed in real time during the scan, and you can stop the process at any time.`
    },
    {
      step: 3,
      title: "Network Discovery and Listing",
      description: "The WiFi networks found as a result of the scan are displayed in a list. Detailed information is available for each network.",
      image: "List of found networks",
      content: `When the scan is complete, all WiFi networks around you are listed with technical details such as signal strength, security type, and frequency. You can click on each network to access more information and evaluate the connection quality and security.`
    },
    {
      step: 4,
      title: "Connected Network Details",
      description: "View detailed information about the network you are currently connected to, including signal quality and technical features.",
      image: "Connected to AndroidWifi",
      content: `You can view all technical details of the WiFi network you are connected to, such as BSSID, signal quality, channel width, and security protocol. You can also track your connection status in real time.`
    },
    {
      step: 5,
      title: "Signal Strength History",
      description: "Track the changes in your connected network's signal strength on a graph. Analyze performance over time.",
      image: "Signal strength graph",
      content: `You can visually monitor the changes in the signal strength of your connected network. This allows you to analyze network performance over time and easily see fluctuations and average values.`
    },
    {
      step: 6,
      title: "Map Integration",
      description: "View WiFi networks on Google Maps. Color coding is applied according to signal strength.",
      image: "Google Maps view",
      content: `You can locate WiFi networks around you on the map and analyze them with colored indicators according to signal strength. Thanks to GPS integration, you can also see the physical locations of the networks.`
    },
    {
      step: 7,
      title: "Other Networks Analysis",
      description: "Analyze other WiFi networks around you in detail. Examine their security status and technical features.",
      image: "Details of other networks",
      content: `You can comparatively examine the security levels, frequency bands, and signal qualities of other WiFi networks around you. This way, you can easily choose the most secure and strongest network.`
    }
  ];

  return (
    <div>
      <div className="wifi-analyzer-page">
        {/* Hero Section */}
        <section className="wifi-hero">
          <div className="wifi-container">
            <div className="hero-content">
              <motion.div 
                className="hero-text"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="hero-badge">
                  <Smartphone className="badge-icon" />
                  Mobile App Feature
                </div>
                <h1 className="hero-title">
                  <span className="gradient-text">WiFi Analyzer</span>
                  <br />
                  <span className="subtitle">How to Use?</span>
                </h1>
                <p className="hero-description">
                  Network Security Tool's WiFi Analyzer feature allows you to analyze all WiFi networks around you, measure signal strength, and detect security vulnerabilities. Here's the step-by-step usage guide.
                </p>
              </motion.div>
              
              <motion.div 
                className="hero-visual"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="phone-mockup">
                  <div className="phone-screen">
                    <div className="wifi-animation">
                      <Wifi size={60} className="wifi-icon" />
                      <div className="signal-waves">
                        <div className="wave wave-1"></div>
                        <div className="wave wave-2"></div>
                        <div className="wave wave-3"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Özellikler Section */}
        <section className="features-section">
          <div className="container">
            <motion.div 
              className="section-header"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="section-title">
                <Activity className="section-icon" />
                Key Features
              </h2>
              <p className="section-subtitle" style={{paddingLeft: '14px'}}>
                What can you do with WiFi Analyzer?
              </p>
            </motion.div>

            <div className="features-grid">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  className="feature-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <div className="feature-header">
                    {feature.icon}
                    <h3 className="feature-title">{feature.title}</h3>
                  </div>
                  <p className="feature-description">{feature.description}</p>
                  <ul className="feature-details">
                    {feature.details.map((detail, i) => (
                      <li key={i} className="feature-detail">
                        <CheckCircle size={16} className="check-icon" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Adım Adım Kullanım */}
        <section className="steps-section">
          <div className="container">
            <motion.div 
              className="section-header"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="section-title">
                <Monitor className="section-icon" />
                Step-by-Step Usage Guide
              </h2>
              <p className="section-subtitle" style={{paddingLeft: '14px'}}>
                How to use WiFi Analyzer in our mobile app?
              </p>
            </motion.div>

            <div className="steps-timeline">
              {steps.map((step, index) => (
                <motion.div
                  key={step.step}
                  className={`step-item zigzag-step ${index % 2 === 1 ? 'reverse' : ''}`}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                >
                  <div className="step-image-placeholder">
                    <div className="step-badge">{step.step}</div>
                    <img 
                      src={require(`../../public/${index + 1}.png`)} 
                      alt={step.image} 
                      style={{ width: '220px', maxWidth: '90%', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.18)', objectFit: 'cover', border: '3px solid #23304a' }} 
                    />
                    <span className="image-desc">{step.image}</span>
                  </div>
                  <div className="step-content">
                    <div className="step-header">
                      <h3 className="step-title">{step.title}</h3>
                    </div>
                    <p className="step-description">{step.description}</p>
                    <div className="step-highlights">
                      <p className="step-content-paragraph">{step.content}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="step-connector">
                      <div className="connector-line"></div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Teknik Detaylar */}
        <section className="technical-section">
          <div className="container">
            <motion.div 
              className="section-header"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="section-title">
                <Info className="section-icon" />
                Technical Details
              </h2>
              <p className="section-subtitle" style={{paddingLeft: '14px'}}>
                What information does WiFi Analyzer provide?
              </p>
            </motion.div>

            <div className="technical-grid">
              <motion.div 
                className="technical-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="card-header">
                  <Signal className="card-icon" />
                  <h3>Signal Information</h3>
                </div>
                <ul className="technical-list">
                  <li><strong>Signal Strength:</strong> Accurate measurement in dBm (-30 to -90 dBm)</li>
                  <li><strong>Frequency:</strong> Supports 2.4 GHz and 5 GHz bands</li>
                  <li><strong>Channel Information:</strong> Which channel the network is broadcasting on</li>
                  <li><strong>Channel Width:</strong> Supports 20, 40, 80, 160 MHz</li>
                </ul>
              </motion.div>

              <motion.div 
                className="technical-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="card-header">
                  <Shield className="card-icon" />
                  <h3>Security Analysis</h3>
                </div>
                <ul className="technical-list">
                  <li><strong>WPA2:</strong> Most common security protocol</li>
                  <li><strong>WPA3:</strong> Latest and safest protocol</li>
                  <li><strong>Open Network:</strong> Unencrypted, unsecured networks</li>
                  <li><strong>Risk Assessment:</strong> Security level analysis</li>
                </ul>
              </motion.div>

              <motion.div 
                className="technical-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="card-header">
                  <Radio className="card-icon" />
                  <h3>Network Identification</h3>
                </div>
                <ul className="technical-list">
                  <li><strong>SSID:</strong> Network's visible name</li>
                  <li><strong>BSSID:</strong> Access Point's unique MAC address</li>
                  <li><strong>Vendor:</strong> Device manufacturer information</li>
                  <li><strong>Hidden Networks:</strong> Detect SSID-hidden networks</li>
                </ul>
              </motion.div>

              <motion.div 
                className="technical-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="card-header">
                  <TrendingUp className="card-icon" />
                  <h3>Performance Metrics</h3>
                </div>
                <ul className="technical-list">
                  <li><strong>Signal Quality:</strong> Excellent, Good, Fair, Poor</li>
                  <li><strong>Real-time Tracking:</strong> Instant signal changes</li>
                  <li><strong>Historical Analysis:</strong> Performance over time</li>
                  <li><strong>Comparison:</strong> Performance analysis of different networks</li>
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Güvenlik Uyarıları */}
        <section className="security-warnings">
          <div className="container">
            <motion.div 
              className="warning-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="warning-header">
                <AlertTriangle className="warning-icon" />
                <h3>Security Warnings</h3>
              </div>
              
              <div className="warning-content">
                <div className="warning-item">
                  <Unlock className="item-icon danger" />
                  <div className="item-content">
                    <h4>Beware of Open Networks!</h4>
                    <p>Be careful when connecting to open (unencrypted) networks. Your data is not encrypted and can be seen by third parties on these networks.</p>
                  </div>
                </div>
                
                <div className="warning-item">
                  <Eye className="item-icon warning" />
                  <div className="item-content">
                    <h4>For Analysis Purposes Only</h4>
                    <p>This tool is only for analyzing WiFi networks. Unauthorized access to others' networks is illegal.</p>
                  </div>
                </div>
                
                <div className="warning-item">
                  <Lock className="item-icon success" />
                  <div className="item-content">
                    <h4>Prefer Secure Networks</h4>
                    <p>Prefer networks that use WPA2 or WPA3 security protocols whenever possible.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default WifiAnalyzer;