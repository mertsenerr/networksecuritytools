import React from "react";
import { Home, Mail, Phone } from 'lucide-react';
import "../styles/Footer.css";

function Footer() {
  return (
    <footer className="footer visible">
      <div className="footer-container">
        <div className="footer-left">
          <div className="footer-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="logo-text">Network Security Tools</span>
          </div>
          <p className="footer-description">
           Improve yourself in the world of cybersecurity, advance your career and be safer in the digital world.
          </p>
          <div className="social-links">
            <a href="#" className="social-link">
              <svg className="social-icon" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22 5.16c-.82.36-1.7.6-2.62.7.95-.56 1.68-1.45 2.02-2.52-.88.52-1.86.9-2.9 1.1-.83-.88-2-1.43-3.3-1.43-2.5 0-4.55 2.04-4.55 4.54 0 .36.04.7.12 1.04-3.78-.2-7.13-2-9.37-4.75-.4.67-.62 1.45-.62 2.28 0 1.57.8 2.96 2.02 3.78-.75-.02-1.45-.23-2.06-.57v.06c0 2.2 1.57 4.03 3.65 4.44-.38.1-.78.16-1.2.16-.3 0-.58-.03-.86-.08.58 1.8 2.26 3.12 4.25 3.16-1.55 1.22-3.5 1.94-5.62 1.94-.37 0-.73-.02-1.08-.06 2 1.28 4.38 2.02 6.94 2.02 8.3 0 12.85-6.88 12.85-12.85 0-.2 0-.4-.02-.6.88-.64 1.64-1.42 2.25-2.3z"/>
              </svg>
            </a>
            <a href="#" className="social-link">
              <svg className="social-icon" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.109 0-.612.492-1.109 1.1-1.109s1.1.497 1.1 1.109c0 .613-.493 1.109-1.1 1.109zm8 6.891h-1.998v-2.861c0-1.881-2.002-1.722-2.002 0v2.861h-2v-6h2v1.093c.872-1.616 4-1.736 4 1.548v3.359z"/>
              </svg>
            </a>
            <a href="#" className="social-link">
              <svg className="social-icon" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <a href="#" className="social-link">
              <svg className="social-icon" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 10h-2v2h2v6h3v-6h1.82l.18-2h-2v-.833c0-.478.096-.667.558-.667h1.442v-2.5h-2.404c-1.798 0-2.596.792-2.596 2.308v1.692z"/>
              </svg>
            </a>
          </div>
        </div>
        
        <div className="footer-navigation">
          <div className="footer-col">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-menu">
              <li><a href="#" className="footer-link">Home</a></li>
              <li><a href="#" className="footer-link">Wifi Analyzer</a></li>
              <li><a href="#" className="footer-link">Training Module</a></li>
              <li><a href="#" className="footer-link">Speed Test</a></li>
              <li><a href="#" className="footer-link">Quizzes</a></li>
              <li><a href="#" className="footer-link">Profile</a></li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h4 className="footer-heading">Our Training Modules</h4>
            <ul className="footer-menu">
              <li><a href="#" className="footer-link">WireShark</a></li>
              <li><a href="#" className="footer-link">NMAP</a></li>
              <li><a href="#" className="footer-link">Kali Linux</a></li>
              <li><a href="#" className="footer-link">Burp Suite</a></li>
              <li><a href="#" className="footer-link">FireWall</a></li>
              <li><a href="#" className="footer-link">John The Ripper</a></li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h4 className="footer-heading">Communication</h4>
            <ul className="contact-list">
              <li className="contact-item">
                <Home className="contact-icon" size={18} />
                <span className="contact-text">
                   İzmir, Türkiye
                </span>
              </li>
              <li className="contact-item">
                <Mail className="contact-icon" size={18} />
                <span className="contact-text">
                  info@networksecuritytools.com
                </span>
              </li>
              <li className="contact-item">
                <Phone className="contact-icon" size={18} />
                <span className="contact-text">
                  +90 123 456 7890
                </span>
              </li>
            </ul>
            
            <div className="newsletter">
              <h4 className="footer-heading">Subscribe</h4>
              <div className="newsletter-form">
                <input 
                  type="email" 
                  placeholder="E-posta adresiniz" 
                  className="newsletter-input"
                />
                <button className="newsletter-button">
                  <svg className="arrow-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p className="copyright">
          © 2025 Network Security Academy. Tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  );
}

export default Footer;