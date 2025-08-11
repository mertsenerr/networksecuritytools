import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "../styles/TrainingModule.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

const TrainingModule = () => {
  const [activeModule, setActiveModule] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { moduleId } = useParams();

  useEffect(() => {
    if (moduleId) {
      setActiveModule(moduleId);
    }
  }, [moduleId]);

  const handleModuleChange = (selectedModuleId) => {
    if (activeModule === selectedModuleId) {
      return
    } else {
      setActiveModule(selectedModuleId);
      navigate(`/training-module/${selectedModuleId}`);
    }
  };

  const SimulatedTerminal = () => {
    const [blocks, setBlocks] = useState([]); 
    const [input, setInput] = useState("");

    const handleCommand = () => {
      const trimmed = input.trim();
      if (!trimmed) return;

      if (trimmed === "clear") {
        setBlocks([]);
        setInput("");
        return;
      }

      const nmapOutputs = {
        "nmap -sV 192.168.1.1": [
          "Starting Nmap 7.91 at 2025-05-08",
          "Nmap scan report for 192.168.1.1",
          "PORT     STATE SERVICE VERSION",
          "22/tcp   open  ssh     OpenSSH 7.9p1",
          "80/tcp   open  http    Apache httpd 2.4.41",
          "443/tcp  open  https   nginx 1.18.0",
          "MAC Address: AA:BB:CC:DD:EE:FF (Vendor Inc.)",
          "Nmap done: 1 IP address (1 host up) scanned in 1.23 seconds"
        ],
        "nmap 192.168.1.1": [
          "Starting Nmap 7.91 at 2025-05-08",
          "Nmap scan report for 192.168.1.1",
          "Host is up (0.00023s latency).",
          "Not shown: 997 closed ports",
          "PORT   STATE SERVICE",
          "22/tcp open  ssh",
          "80/tcp open  http",
          "443/tcp open  https",
          "Nmap done: 1 IP address (1 host up) scanned in 0.45 seconds"
        ],
        "nmap -sS 192.168.1.0/24": [
          "Starting Nmap 7.91 at 2025-05-08",
          "Nmap scan report for 192.168.1.0/24",
          "Host is up (0.00023s latency).",
          "Not shown: 998 closed ports",
          "PORT   STATE SERVICE",
          "22/tcp open  ssh",
          "80/tcp open  http",
          "MAC Address: AA:BB:CC:DD:EE:FF (Vendor Inc.)",
          "Nmap done: 256 IP addresses (1 host up) scanned in 2.45 seconds"
        ],
        "nmap -O 192.168.1.1": [
          "Starting Nmap 7.91 at 2025-05-08",
          "Nmap scan report for 192.168.1.1",
          "Host is up (0.00023s latency).",
          "Not shown: 998 closed ports",
          "PORT   STATE SERVICE",
          "22/tcp open  ssh",
          "80/tcp open  http",
          "MAC Address: AA:BB:CC:DD:EE:FF (Vendor Inc.)",
          "Device type: general purpose",
          "Running: Linux 4.x|5.x",
          "OS CPE: cpe:/o:linux:linux_kernel:4.19",
          "OS details: Linux 4.19 - 5.4",
          "Nmap done: 1 IP address (1 host up) scanned in 1.23 seconds"
        ],
        "nmap -p- 192.168.1.1": [
          "Starting Nmap 7.91 at 2025-05-08",
          "Nmap scan report for 192.168.1.1",
          "Host is up (0.00023s latency).",
          "Not shown: 65532 closed ports",
          "PORT      STATE SERVICE",
          "22/tcp    open  ssh",
          "80/tcp    open  http",
          "443/tcp   open  https",
          "3306/tcp  open  mysql",
          "8080/tcp  open  http-proxy",
          "Nmap done: 1 IP address (1 host up) scanned in 3.45 seconds"
        ]
      };

      if (nmapOutputs[trimmed]) {
        const outputLines = nmapOutputs[trimmed];
        setBlocks(prev => [...prev, { command: trimmed, output: [] }]);
        setInput("");
        outputLines.forEach((line, idx) => {
          setTimeout(() => {
            setBlocks(prev => {
              const newBlocks = [...prev];
              const last = newBlocks[newBlocks.length - 1];
              if (last && last.command === trimmed) {
                last.output = [...last.output, line];
                newBlocks[newBlocks.length - 1] = { ...last };
              }
              return newBlocks;
            });
          }, 500 * (idx + 1));
        });
        return;
      }

      let output = [];
      if (trimmed === "help") {
        output = [
          "Kullanılabilir Nmap Komutları:",
          "nmap 192.168.1.1         : Basic port scan",
          "nmap -sV 192.168.1.1     : Service and version scan",
          "nmap -sS 192.168.1.0/24  : Network scan",
          "nmap -O 192.168.1.1      : OS detection",
          "nmap -p- 192.168.1.1     : Scan all ports",
          "clear                   : Clear Terminal Screen",
          "help                    : Show Command List"
        ];
      } else {
        output = ["Error: Command not recognized. Type 'help' to see available commands."];
      }

      setBlocks([...blocks, { command: trimmed, output }]);
      setInput("");
    };

    return (
      <div style={{
        backgroundColor: "#111827",
        color: "#10B981",
        fontFamily: "monospace",
        padding: "1rem",
        borderRadius: "10px",
        marginTop: "1rem",
        minHeight: "200px",
        maxHeight: "400px",
        overflowY: "auto"
      }}>
        <div style={{ minHeight: "150px", textAlign: "left" }}>
          {blocks.map((block, i) => (
            <div key={i} style={{ marginBottom: "1.5rem", padding: "0.5rem 0.5rem 0.5rem 0.5rem", background: "#181f2a", borderRadius: "8px", textAlign: "left" }}>
              <div style={{ color: "#3b82f6", fontWeight: "bold", textAlign: "left" }}>&gt; {block.command}</div>
              {block.output.map((line, j) => (
                <div key={j} style={{ color: line.startsWith("Hata") ? "#ef4444" : undefined, textAlign: "left" }}>{line}</div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", marginTop: "1rem" }}>
          <span style={{ marginRight: "0.5rem" }}>&gt;</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCommand()}
            style={{
              flex: 1,
              backgroundColor: "transparent",
              color: "#10B981",
              border: "none",
              outline: "none",
              fontFamily: "monospace"
            }}
          />
        </div>
      </div>
    );
  };
  

  const modules = [
    {
      id: 'wireshark',
      title: 'Wireshark',
      description: 'A powerful network protocol analyzer used to analyze network traffic.',
      content: (
        <div className="module-content">
          <h3>What is Wireshark</h3>
          <p>
          Wireshark is one of the most popular and powerful network protocol analyzers that allows you to monitor and analyze network traffic in real time. 
          By analyzing data packets in detail, it is ideal for detecting network problems, performing security analysis, and for educational purposes.
          </p>
          
          <div className="module-image">
            <img src="../photos/wireshark-display.png" alt="Wireshark Main Screen" />
            <p className="image-caption">Wireshark main screen: Network interface selection and live traffic monitoring.</p>
          </div>
          
          <h3>Key Features of Wireshark</h3>
          <ul className="module-features-list">
            <li>Real-time network traffic capture and analysis</li>
            <li>Support for hundreds of protocols and protocol parsing</li>
            <li>Powerful and flexible filtering system</li>
            <li>Detailed examination and visualization of packet contents</li>
            <li>TCP stream tracking and session analysis</li>
            <li>Import/export packet data in various formats</li>
            <li>Cross-platform support (Windows, Linux, macOS)</li>
          </ul>
          
          <h3>What is Wireshark Used For?</h3>
          <ul className="module-usage-list">
            <li><span className="usage-title">Network Troubleshooting</span> <span className="usage-desc">Diagnosing connection issues, delays and network performance problems</span></li>
            <li><span className="usage-title">Security Analysis</span> <span className="usage-desc">Detecting suspicious network traffic, identifying malicious activities</span></li>
            <li><span className="usage-title">Protocol Analysis</span> <span className="usage-desc">Learning and understanding how network protocols work</span></li>
            <li><span className="usage-title">Performance Monitoring</span> <span className="usage-desc">Monitoring network usage and performance, identifying bottlenecks</span></li>
            <li><span className="usage-title">Network Security Testing</span> <span className="usage-desc">Analyzing network traffic in penetration tests</span></li>
            <li><span className="usage-title">Education and Learning</span> <span className="usage-desc">Gaining practical knowledge about network protocols and communication</span></li>
          </ul>
          
          <div className="module-image">
            <img src="../photos/wireshark-packet.png" alt="Wireshark Packet List" />
            <p className="image-caption">Packet list: Detailed view of all data packets passing through the network.</p>
          </div>
          
          <h3>How Wireshark Works</h3>
          <p>
            Wireshark puts your network adapter into a special mode called "promiscuous mode", 
            which allows you to capture not only traffic destined for your computer, but all 
            network traffic that your adapter can access. Each captured packet is parsed according 
            to protocol layers and information in each layer is presented in readable format.
          </p>
          
          <h3>Basic Usage Steps</h3>
          <ul className="module-steps-list">
            <li><span className="step-title">Network Interface Selection</span> <span className="step-desc">Select the network adapter you want to listen on</span></li>
            <li><span className="step-title">Packet Capture</span> <span className="step-desc">Start packet capture by clicking the "Start Capture" button</span></li>
            <li><span className="step-title">Filtering</span> <span className="step-desc">Use Display Filter to filter the packets you want to see</span></li>
            <li><span className="step-title">Packet Inspection</span> <span className="step-desc">Click on packets of interest to examine their details</span></li>
            <li><span className="step-title">Analysis</span> <span className="step-desc">Perform analyses on captured data such as TCP stream tracking, conversation statistics</span></li>
          </ul>
          
          <div className="module-image">
            <img src="../photos/wireshark-filter.png" alt="Wireshark Filter Usage" />
            <p className="image-caption">Filter usage: Filtering to quickly find a specific protocol or packet.</p>
          </div>
          
          <h3>Our Custom Wireshark Application</h3>
          <p>
            Our custom Wireshark application developed as part of our cybersecurity platform 
            includes all the features of standard Wireshark while being enriched with 
            additional cybersecurity-focused functions.
          </p>
          
          <div className="module-image">
            <img src="../photos/nstshark.png" alt="Our Custom Wireshark Application" />
            <p className="image-caption">Interface of our self-developed Wireshark application.</p>
          </div>
          
          <h3>Features of Our Application</h3>
          <ul className="module-features-list">
            <li><strong>Start and Stop Packet Capture:</strong> You can easily control starting or stopping real-time network traffic monitoring.</li>
            <li><strong>Packet Saving:</strong> You can save the packets you examine and store them for later analysis.</li>
            <li><strong>Advanced Filtering:</strong> Thanks to Wireshark-compatible filtering support, you can filter network traffic as you wish.</li>
            <li><strong>Network Interface Selection:</strong> You can see all active network cards on your computer and select the interface you want for analysis.</li>
          </ul>
          
          <h3>Images from Application Interface</h3>
          <div className="module-image">
            <img src="../photos/nstshark.png" alt="NST Shark Main Screen" />
            <p className="image-caption">NST Shark main screen: Packet capture, filtering and network interface selection.</p>
          </div>

          <div className="module-image">
            <img src="../photos/nstshark-interface.png" alt="Network Interface Selection" />
            <p className="image-caption">Network interface selection: You can view and select active network cards.</p>
          </div>

          <div className="module-image">
            <img src="../photos/nstshark-packet.png" alt="Sample Packet Output" />
            <p className="image-caption">Sample packet output: Detailed analysis of captured packets.</p>
          </div>

          <p>
            Our NST Shark application allows you to easily analyze network traffic with its user-friendly interface. Basic functions such as packet capture, filtering, network interface selection and packet saving are gathered on a single screen. As you can see in the images, network interface selection and filtering operations are quite practical. In addition, you can view and analyze the details of captured packets instantly.
            <br /><br />
            <a href="/indir/nstshark.zip" target="_blank" rel="noopener noreferrer" style={{color:'#3b82f6', fontWeight:'bold', textDecoration:'underline'}}>Click here to download and try.</a>
          </p>
          <div style={{marginTop: 40, padding: 24, background: '#181f2a', borderRadius: 8, textAlign: 'left'}}>
            <h3 style={{marginBottom: 12, textAlign: 'left'}}>Mini Quiz: Wireshark</h3>
            <WiresharkMiniQuiz />
          </div>
        </div>
      )
    },
    {
      id: 'nmap',
      title: 'Nmap',
      description: 'An open-source tool used for network discovery and security auditing.',
      content: (
        <div className="module-content">
          <h3>What is Nmap?</h3>
          <p>
            Nmap (Network Mapper) is an open-source tool used for network discovery and security auditing. 
            It is used to discover devices on the network, scan open ports, detect operating systems and 
            identify security vulnerabilities. Developed by Gordon Lyon (Fyodor), Nmap is one of the 
            most popular and powerful tools in the cybersecurity world.
          </p>
          
          <div className="module-image">
            <img src="../photos/nmap.png" alt="Nmap Main Screen" />
            <p className="image-caption">Nmap command line interface and sample scan output.</p>
          </div>
          
          <h3>Key Features of Nmap</h3>
          <ul className="module-features-list">
            <li><strong>Port Scanning:</strong> Detecting open ports via TCP, UDP and other protocols</li>
            <li><strong>Service Detection:</strong> Determining the type and version of running services</li>
            <li><strong>Operating System Detection:</strong> Detecting the target system's operating system and version</li>
            <li><strong>Firewall Detection:</strong> Detecting active firewalls and IDS/IPS systems</li>
            <li><strong>Script Support:</strong> Customizable scanning and detection with NSE (Nmap Scripting Engine)</li>
            <li><strong>Multi-target Support:</strong> Scanning with IP addresses, network ranges and host names</li>
            <li><strong>Cross-platform:</strong> Ability to run on Windows, Linux, macOS and other systems</li>
          </ul>
          
          <h3>What is Nmap Used For?</h3>
          <ul className="module-usage-list">
            <li><span className="usage-title">Network Discovery</span> <span className="usage-desc">Detecting active devices and services on the network, creating network maps</span></li>
            <li><span className="usage-title">Security Auditing</span> <span className="usage-desc">Identifying open ports, security vulnerabilities and misconfigurations</span></li>
            <li><span className="usage-title">System Administration</span> <span className="usage-desc">Creating network inventory, monitoring and managing system status</span></li>
            <li><span className="usage-title">Network Mapping</span> <span className="usage-desc">Visualizing and documenting network topology</span></li>
            <li><span className="usage-title">Security Testing</span> <span className="usage-desc">Analyzing systems and services in penetration tests</span></li>
          </ul>

          <h3>Basic Nmap Commands and Usage</h3>
          <div className="code-block">
            <h4>1. Simple Port Scan</h4>
            <p>nmap 192.168.1.1</p>
            <p>The most basic scan type. Scans the most common 1000 ports on the target system.</p>

            <h4>2. Service and Version Detection</h4>
            <p>nmap -sV 192.168.1.1</p>
            <p>Detects the type and version of services on open ports.</p>

            <h4>3. Operating System Detection</h4>
            <p>nmap -O 192.168.1.1</p>
            <p>Attempts to detect the target system's operating system and version.</p>

            <h4>4. Scan All Ports</h4>
            <p>nmap -p- 192.168.1.1</p>
            <p>Scans all 65535 ports (1-65535).</p>

            <h4>5. Scan Specific Ports</h4>
            <p>nmap -p 80,443,3306 192.168.1.1</p>
            <p>Scans only the specified ports.</p>

            <h4>6. Network Scan</h4>
            <p>nmap -sS 192.168.1.0/24</p>
            <p>Scans all systems in the specified network.</p>

            <h4>7. Fast Scan</h4>
            <p>nmap -F 192.168.1.1</p>
            <p>Quickly scans the most common 100 ports.</p>

            <h4>8. Aggressive Scan</h4>
            <p>nmap -A 192.168.1.1</p>
            <p>Includes OS detection, version detection, script scanning and traceroute.</p>
          </div>

          <h3>Nmap Scan Types</h3>
          <ul className="module-features-list">
            <li><strong>TCP SYN Scan (-sS):</strong> The most common and reliable scan type. Does not establish full TCP connection.</li>
            <li><strong>TCP Connect Scan (-sT):</strong> Establishes full TCP connection. Used when SYN scan cannot be performed.</li>
            <li><strong>UDP Scan (-sU):</strong> Scans UDP ports. Slower than TCP scanning.</li>
            <li><strong>FIN Scan (-sF):</strong> Sends only FIN flag. Can bypass some firewalls.</li>
            <li><strong>XMAS Scan (-sX):</strong> Sends FIN, PSH and URG flags.</li>
            <li><strong>NULL Scan (-sN):</strong> Sends no flags.</li>
            <li><strong>ACK Scan (-sA):</strong> Sends only ACK flag. Tests firewall rules.</li>
          </ul>

          <h3>Nmap Scripting Engine (NSE)</h3>
          <p>
            NSE is one of Nmap's most powerful features. You can customize and extend scans using scripts 
            written in the Lua programming language. NSE scripts are found in these categories:
          </p>
          <ul className="module-features-list">
            <li><strong>auth:</strong> Authentication-related scripts</li>
            <li><strong>default:</strong> Scripts run by default</li>
            <li><strong>discovery:</strong> Network discovery related scripts</li>
            <li><strong>dos:</strong> Denial of service tests</li>
            <li><strong>exploit:</strong> Vulnerability exploitation scripts</li>
            <li><strong>external:</strong> Scripts connecting to external databases</li>
            <li><strong>fuzzer:</strong> Protocol and application fuzzing scripts</li>
            <li><strong>intrusive:</strong> Potentially harmful scripts</li>
            <li><strong>malware:</strong> Malware detection</li>
            <li><strong>safe:</strong> Safe scripts</li>
            <li><strong>version:</strong> Service version detection</li>
            <li><strong>vuln:</strong> Vulnerability scanning scripts</li>
          </ul>

          <h3>Nmap Output Formats</h3>
          <p>Nmap can save scan results in different formats:</p>
          <ul className="module-features-list">
            <li><strong>Normal (-oN):</strong> Human readable format</li>
            <li><strong>XML (-oX):</strong> XML format, suitable for programmatic processing</li>
            <li><strong>Grepable (-oG):</strong> Suitable for grep and other text processing tools</li>
            <li><strong>Script Kiddie (-oS):</strong> Fun, script kiddie style output</li>
          </ul>

          <h3>Terminal Simulation</h3>
          <p>
            You can try basic Nmap commands in the terminal simulation below. 
            You can type 'help' to see available commands.
          </p>
          <SimulatedTerminal />

          <h3>Security and Ethical Use</h3>
          <p>
            Nmap is a powerful tool and can be harmful when used incorrectly. Points to consider when using Nmap:
          </p>
          <ul className="module-features-list">
            <li>Only scan on systems you have permission to</li>
            <li>Avoid aggressive scans on production systems</li>
            <li>Control scan speed and intensity</li>
            <li>Stay within legal and ethical boundaries</li>
            <li>Store scan results securely</li>
          </ul>
          <div style={{marginTop: 40, padding: 24, background: '#181f2a', borderRadius: 8, textAlign: 'left'}}>
            <h3 style={{marginBottom: 12, textAlign: 'left'}}>Mini Quiz: Nmap</h3>
            <NmapMiniQuiz />
          </div>
        </div>
      )
    },
    {
      id: 'kalilinux',
      title: 'Kali Linux',
      description: 'A Linux distribution designed for penetration testing and security auditing.',
      content: (
        <div className="module-content">
          <h3>What is Kali Linux?</h3>
          <p>
            Kali Linux is a Debian-based Linux distribution developed by Offensive Security, designed for penetration testing and security auditing. It contains hundreds of pre-installed security tools and is widely used by cybersecurity professionals.
          </p>
          
          <div className="module-image">
            <img src="../photos/kali-linux.png" alt="Kali Linux Desktop" />
            <p className="image-caption">Kali Linux desktop interface</p>
          </div>
          
          <h3>Key Features</h3>
            <div className="feature-cards">
              <div className="feature-card">
                <div className="feature-card-icon">🛠️</div>
                <h4 className="feature-card-title">600+ penetration testing tools</h4>
                <p className="feature-card-description">Ready tools library for comprehensive security testing</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-card-icon">🔓</div>
                <h4 className="feature-card-title">Open source</h4>
                <p className="feature-card-description">Open source developed and continuously updated by the community</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-card-icon">💻</div>
                <h4 className="feature-card-title">Wide hardware support</h4>
                <p className="feature-card-description">Ability to run smoothly on different hardware platforms</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-card-icon">📱</div>
                <h4 className="feature-card-title">ARMEL and ARMHF support</h4>
                <p className="feature-card-description">Possibility of use on ARM-based devices and embedded systems</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-card-icon">🧩</div>
                <h4 className="feature-card-title">Various development environments</h4>
                <p className="feature-card-description">Support for many programming languages and development tools</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-card-icon">🌐</div>
                <h4 className="feature-card-title">Multi-language support</h4>
                <p className="feature-card-description">Different language options for users worldwide</p>
              </div>
            </div>
          
          <h3>Main Tool Categories</h3>
          <ul className="module-features-list">
            <li><strong>Information Gathering:</strong> Tools for gathering information about networks and systems</li>
            <li><strong>Vulnerability Analysis:</strong> Tools for detecting security vulnerabilities</li>
            <li><strong>Web Applications:</strong> Web security testing tools</li>
            <li><strong>Database Tools:</strong> Database security testing tools</li>
            <li><strong>Password Attacks:</strong> Password cracking and analysis tools</li>
            <li><strong>Wireless Attacks:</strong> Wireless network security testing tools</li>
            <li><strong>Data Recovery:</strong> Tools for recovering deleted data</li>
            <li><strong>Reverse Engineering:</strong> Software analysis tools</li>
          </ul>
          
          <div className="module-image">
            <img src="../photos/kalilinux-tools.png" alt="Kali Linux Tools" />
            <p className="image-caption">Kali Linux tools menu</p>
          </div>
          
          <h3>Advantages of Kali Linux</h3>
          <ul className="module-features-list">
            <li><strong>All Tools in One Place:</strong> Hundreds of security tools come pre-installed</li>
            <li><strong>Regular Updates:</strong> Continuously updated tools and security patches</li>
            <li><strong>Wide Community Support:</strong> Active user community and documentation</li>
            <li><strong>Strong Documentation:</strong> Detailed user guides and training materials</li>
            <li><strong>Adaptable and Customizable:</strong> Can be customized according to your needs</li>
          </ul>
          
          <h3>Popular Kali Linux Tools</h3>
          <ul className="module-features-list">
            <li><strong>Nmap:</strong> Network discovery and security scanning</li>
            <li><strong>Wireshark:</strong> Network traffic analysis</li>
            <li><strong>Metasploit:</strong> Penetration testing framework</li>
            <li><strong>Burp Suite:</strong> Web application security testing</li>
            <li><strong>Aircrack-ng:</strong> Wireless network security testing</li>
            <li><strong>John the Ripper:</strong> Password cracking tool</li>
            <li><strong>Hydra:</strong> Network authentication cracker</li>
            <li><strong>SQLMap:</strong> SQL injection testing</li>
          </ul>
          
          <h3>Security and Ethical Use</h3>
          <p>
            Kali Linux is a powerful tool set and can be harmful when used incorrectly. Points to consider when using Kali Linux:
          </p>
          <ul className="module-features-list">
            <li>Only test on systems you have permission to</li>
            <li>Avoid aggressive tests on production systems</li>
            <li>Store test results securely</li>
            <li>Stay within legal and ethical boundaries</li>
            <li>Report test results and follow corrections</li>
          </ul>
          <div style={{marginTop: 40, padding: 24, background: '#181f2a', borderRadius: 8, textAlign: 'left'}}>
            <h3 style={{marginBottom: 12, textAlign: 'left'}}>Mini Quiz: Kali Linux</h3>
            <KaliLinuxMiniQuiz />
          </div>
        </div>
      )
    },
    {
      id: 'burpsuite',
      title: 'Burp Suite',
      description: 'A comprehensive tool set used for web application security testing.',
      content: (
        <div className="module-content">
          <h3>What is Burp Suite?</h3>
          <p>
            Burp Suite is a comprehensive tool set developed by PortSwigger, used for security testing of web applications. It is used to detect web application security vulnerabilities, simulate attacks and perform security analysis. Burp Suite is one of the most popular and powerful tools in web application security testing.
          </p>
          
          <div className="module-image">
            <img src="../photos/burpsuite.png" alt="Burp Suite Interface" />
            <p className="image-caption">Burp Suite interface</p>
          </div>
          
          <h3>Main Components</h3>
          <ul className="module-features-list">
            <li><strong>Proxy:</strong> Capturing and modifying traffic between web browser and target application</li>
            <li><strong>Spider:</strong> Automatically discovering the structure and content of web applications</li>
            <li><strong>Scanner:</strong> Automatic vulnerability scanning (Pro version)</li>
            <li><strong>Intruder:</strong> Automatic and customizable attacks</li>
            <li><strong>Repeater:</strong> Manually editing and repeating requests</li>
            <li><strong>Decoder:</strong> Data encoding and decoding</li>
            <li><strong>Comparer:</strong> Comparing data</li>
            <li><strong>Sequencer:</strong> Randomness analysis</li>
          </ul>
          
          <h3>Usage Areas</h3>
          <ul className="module-features-list">
            <li><strong>Detecting XSS (Cross-Site Scripting) Vulnerabilities:</strong> Used to detect XSS vulnerabilities in web applications.</li>
            <li><strong>SQL Injection Tests:</strong> SQL injection tests are performed to detect database security vulnerabilities.</li>
            <li><strong>CSRF (Cross-Site Request Forgery) Controls:</strong> Used to detect CSRF vulnerabilities.</li>
            <li><strong>Detecting Authentication and Authorization Problems:</strong> Used to detect user authentication and authorization issues.</li>
            <li><strong>Finding Business Logic Errors:</strong> Used to detect business logic errors in web applications.</li>
            <li><strong>API Security Testing:</strong> Used to detect security vulnerabilities in APIs.</li>
          </ul>
          
          <div className="module-image">
            <img src="../photos/burpsuite-proxy.png" alt="Burp Suite Proxy" />
            <p className="image-caption">Traffic capture with Burp Suite Proxy</p>
          </div>
          
          <h3>Versions</h3>
          <ul className="module-features-list">
            <li><strong>Community Edition:</strong> Free version, has basic features</li>
            <li><strong>Professional:</strong> Full-featured paid version, Scanner and other advanced features</li>
            <li><strong>Enterprise:</strong> Web security vulnerability scanner for enterprise use</li>
          </ul>
          
          <h3>Security and Ethical Use</h3>
          <p>
            Burp Suite is a powerful tool and can be harmful when used incorrectly. Points to consider when using Burp Suite:
          </p>
          <ul className="module-features-list">
            <li>Only test on systems you have permission to</li>
            <li>Avoid aggressive tests on production systems</li>
            <li>Store test results securely</li>
            <li>Stay within legal and ethical boundaries</li>
            <li>Report test results and follow corrections</li>
          </ul>
          <div style={{marginTop: 40, padding: 24, background: '#181f2a', borderRadius: 8, textAlign: 'left'}}>
            <h3 style={{marginBottom: 12, textAlign: 'left'}}>Mini Quiz: Burp Suite</h3>
            <BurpSuiteMiniQuiz />
          </div>
        </div>
      )
    },
    {
      id: 'firewall',
      title: 'Firewall',
      description: 'A fundamental component of network security that protects systems by blocking unwanted traffic.',
      content: (
        <div className="module-content">
          <h3>What is a Firewall?</h3>
          <p>
            A Firewall is an important component in network security. It monitors incoming and outgoing network traffic and decides whether to allow or block traffic according to predetermined security rules. The firewall protects your network from external threats and prevents unauthorized access.
          </p>
          
          <div className="module-image">
            <img src="../photos/firewall.png" alt="Firewall Structure" />
            <p className="image-caption">Basic firewall structure</p>
          </div>
          
          <h3>Firewall Types</h3>
          <ul className="module-features-list">
            <li><strong>Packet Filtering Firewall:</strong> Filters based on basic information such as source and destination IP addresses, port numbers and protocols.</li>
            <li><strong>Stateful Firewall:</strong> Monitors the state of connections and allows packets related to existing connections.</li>
            <li><strong>Application Layer Firewall:</strong> Analyzes traffic at the application level and can detect threats specific to specific applications.</li>
            <li><strong>Next Generation Firewall (NGFW):</strong> Combines traditional firewall features with advanced features such as deep packet inspection, IPS and application control.</li>
          </ul>
          
          <h3>Basic Firewall Functions</h3>
          <ul className="module-features-list">
            <li><strong>Packet Filtering:</strong> Filters incoming and outgoing packets and allows or blocks according to specific rules.</li>
            <li><strong>Network Address Translation (NAT):</strong> Hides the IP addresses of devices in the internal network when going out to the external network.</li>
            <li><strong>Port Forwarding:</strong> Redirects traffic coming to specific ports to another address.</li>
            <li><strong>State Monitoring:</strong> Monitors the state of connections and allows packets related to existing connections.</li>
            <li><strong>Application Control:</strong> Controls and restricts the traffic of specific applications.</li>
            <li><strong>User Authentication:</strong> Authenticates users and prevents unauthorized access.</li>
          </ul>
          
          
          <h3>Common Firewall Software</h3>
          <ul className="module-features-list">
            <li><strong>pfSense:</strong> Open source, powerful and flexible firewall solution</li>
            <li><strong>Cisco ASA:</strong> A firewall that provides enterprise-level security</li>
            <li><strong>Fortinet FortiGate:</strong> A solution offering next-generation firewall features</li>
            <li><strong>Check Point:</strong> A firewall offering comprehensive security features</li>
            <li><strong>Palo Alto Networks:</strong> A firewall offering advanced threat protection</li>
            <li><strong>UFW (for Linux):</strong> A user-friendly firewall configuration tool</li>
            <li><strong>Windows Defender Firewall:</strong> Built-in firewall for Windows operating system</li>
          </ul>
          
          <h3>Security and Ethical Use</h3>
          <p>
            Firewall is a powerful security tool and can be harmful when misconfigured. Points to consider when using a firewall:
          </p>
          <ul className="module-features-list">
            <li>Regularly review and update security rules</li>
            <li>Avoid aggressive rules in production systems</li>
            <li>Store test results securely</li>
            <li>Stay within legal and ethical boundaries</li>
            <li>Report security incidents and follow corrections</li>
          </ul>
          <div style={{marginTop: 40, padding: 24, background: '#181f2a', borderRadius: 8, textAlign: 'left'}}>
            <h3 style={{marginBottom: 12, textAlign: 'left'}}>Mini Quiz: Firewall</h3>
            <FirewallMiniQuiz />
          </div>
        </div>
      )
    },
    {
      id: 'johntheripper',
      title: 'John the Ripper',
      description: 'A powerful and fast tool used for password cracking operations.',
      content: (
        <div className="module-content">
          <h3>What is John the Ripper?</h3>
          <p>
            John the Ripper is an open-source and free tool designed for password cracking operations. 
            Developed by OpenWall, this tool was originally designed to test Unix passwords, 
            but today it can also test passwords of Windows, macOS and various applications. 
            It is widely used by security experts and system administrators to detect weak passwords.
          </p>
          
          <div className="module-image">
            <img src="../photos/johntheripper.png" alt="John the Ripper Running" />
            <p className="image-caption">John the Ripper command line interface</p>
          </div>
          
          <h3>Key Features of John the Ripper</h3>
          <ul className="module-features-list">
            <li><strong>Multi-Platform Operation:</strong> Can run on various operating systems like Linux, Unix, Windows, DOS, BeOS, OpenVMS.</li>
            <li><strong>Automatic Format Detection:</strong> Can automatically detect the format of password hashes.</li>
            <li><strong>Multi-Encryption Algorithm Support:</strong> Supports many encryption algorithms like DES, MD5, Blowfish, SHA-256, SHA-512.</li>
            <li><strong>Different Attack Modes:</strong> Offers various modes like dictionary attack, brute force, rule-based attack.</li>
            <li><strong>Customizable Rules:</strong> You can optimize the password cracking process by creating your own rules.</li>
            <li><strong>Distributed Password Cracking:</strong> You can speed up the password cracking process by using multiple systems.</li>
            <li><strong>Resume from Interruption Point:</strong> Ability to stop the password cracking process and continue from where it left off later.</li>
          </ul>
          
          <h3>Supported Hash Types</h3>
          <ul className="module-features-list">
            <li><strong>Unix Passwords:</strong> Traditional and modern Unix passwords (crypt, MD5, Blowfish, SHA-256, SHA-512)</li>
            <li><strong>Windows Passwords:</strong> LM, NTLM, Domain Cached Credentials</li>
            <li><strong>LDAP, Kerberos, MySQL, Oracle:</strong> Various authentication systems</li>
            <li><strong>Encrypted Files:</strong> Can crack passwords of encrypted files like ZIP, RAR, PDF, MS Office</li>
            <li><strong>Network Protocols:</strong> Network protocols like HTTP Basic Auth, WPA/WPA2 PSK</li>
            <li><strong>Bitcoin and Cryptocurrency Wallets:</strong> Can crack passwords of various cryptocurrency wallets</li>
          </ul>
          
          <h3>John the Ripper Attack Modes</h3>
          <ul className="module-usage-list">
            <li><span className="usage-title">Dictionary Attack</span> <span className="usage-desc">Attempts to crack passwords using pre-prepared word lists</span></li>
            <li><span className="usage-title">Brute Force Attack</span> <span className="usage-desc">Attempts to crack passwords by trying all possible combinations</span></li>
            <li><span className="usage-title">Rule-Based Attack</span> <span className="usage-desc">Attempts to crack passwords by manipulating dictionary words using specific rules</span></li>
            <li><span className="usage-title">Hybrid Attack</span> <span className="usage-desc">Attempts to crack passwords by combining dictionary and brute force methods</span></li>
            <li><span className="usage-title">External Filter Attack</span> <span className="usage-desc">Can develop custom attack logic using external programs</span></li>
          </ul>
          
          <div className="module-image">
            <img src="../photos/johntheripper-results.png" alt="John the Ripper Results" />
            <p className="image-caption">Display of cracked passwords with John the Ripper</p>
          </div>
          
          <h3>Basic Commands and Usage</h3>
          <div className="code-block">
            <h4>1. Simple Password Cracking</h4>
            <p>john passwd.txt</p>
            <p>John tries to automatically detect the format of hashes in "passwd.txt" file and starts the cracking process.</p>
    
            <h4>2. Dictionary Attack</h4>
            <p>john --wordlist=passwords.txt hash.txt</p>
            <p>Attempts to crack hashes in "hash.txt" file using words in "passwords.txt" file.</p>
    
            <h4>3. Cracking by Specifying Format</h4>
            <p>john --format=raw-md5 hash.txt</p>
            <p>Starts the cracking process by specifying the hash format as "raw-md5".</p>
    
            <h4>4. Brute Force Attack</h4>
            <p>john --incremental hash.txt</p>
            <p>Attempts to crack passwords by trying all possible combinations with brute force method.</p>
    
            <h4>5. Rule-Based Attack</h4>
            <p>john --rules --wordlist=passwords.txt hash.txt</p>
            <p>In addition to dictionary attack, performs word manipulations according to specific rules to increase password cracking possibility.</p>
    
            <h4>6. Showing Cracked Passwords</h4>
            <p>john --show hash.txt</p>
            <p>Shows previously cracked passwords.</p>
    
            <h4>7. Cracking a Specific User's Password</h4>
            <p>john --users=admin hash.txt</p>
            <p>Attempts to crack only the "admin" user's password.</p>
    
            <h4>8. Checking Cracking Process Status</h4>
            <p>john --status</p>
            <p>Shows the status of ongoing password cracking process.</p>
          </div>
          
          <h3>Preparing File Formats with John the Ripper</h3>
          <p>
            John the Ripper cannot directly process some hash formats. Therefore, helper programs are used to convert various formats into a format that John the Ripper can understand:
          </p>
          <ul className="module-features-list">
            <li><strong>unshadow:</strong> Combines /etc/passwd and /etc/shadow files</li>
            <li><strong>unafs:</strong> Extracts password hashes from AFS KeyFiles</li>
            <li><strong>unique:</strong> Removes repeated lines from file</li>
            <li><strong>ssh2john:</strong> Converts SSH private key files to John format</li>
            <li><strong>pdf2john:</strong> Extracts password hashes from PDF files</li>
            <li><strong>zip2john:</strong> Extracts password hashes from ZIP archives</li>
            <li><strong>rar2john:</strong> Extracts password hashes from RAR archives</li>
          </ul>

          <h3>Performance Optimization Techniques</h3>
          <ul className="module-features-list">
            <li><strong>John.conf Optimization:</strong> You can increase performance by customizing the configuration file</li>
            <li><strong>OpenMP Support:</strong> Provides parallelization on multi-core processors</li>
            <li><strong>GPU Acceleration:</strong> You can accelerate password cracking operations with NVIDIA and AMD GPUs</li>
            <li><strong>Distributed Cracking:</strong> You can share password cracking operations using multiple computers</li>
            <li><strong>Custom Character Sets:</strong> You can narrow down the probable character sets of target passwords</li>
          </ul>
          
          <h3>John the Ripper Pro and Community Versions</h3>
          <p>
            John the Ripper has two main versions:
          </p>
          <ul className="module-features-list">
            <li><strong>Community Edition:</strong> Open source and free version</li>
            <li><strong>Pro Edition:</strong> Commercial version with more features and optimizations</li>
          </ul>
          <p>
            The Pro version offers more hash format support, advanced optimizations and technical support, 
            but the community version is also sufficient for many security testing scenarios.
          </p>
          
          <h3>Security and Ethical Use</h3>
          <p>
            John the Ripper is a powerful password cracking tool and should only be used for ethical purposes:
          </p>
          <ul className="module-features-list">
            <li>Only use on your own systems or systems you have permission to test</li>
            <li>Use to test password security and detect weak passwords</li>
            <li>Never use to gain unauthorized access to others' systems</li>
            <li>Store cracked passwords securely and do not share with unauthorized persons</li>
            <li>Report password cracking results within ethical rules</li>
          </ul>
          
          <h3>Recommendations for Improving Password Security</h3>
          <p>
            To protect your systems against tools like John the Ripper, you can take the following measures:
          </p>
          <ul className="module-features-list">
            <li>Use strong, complex and long passwords (at least 12 characters)</li>
            <li>Create passwords containing uppercase-lowercase letters, numbers and special characters</li>
            <li>Use different passwords for each service</li>
            <li>Change your passwords regularly</li>
            <li>Use two-factor authentication (2FA)</li>
            <li>Prefer strong encryption algorithms (SHA-256, SHA-512, Argon2, etc.)</li>
            <li>Manage complex passwords using a password manager</li>
          </ul>
          
          <div style={{marginTop: 40, padding: 24, background: '#181f2a', borderRadius: 8, textAlign: 'left'}}>
            <h3 style={{marginBottom: 12, textAlign: 'left'}}>Mini Quiz: John the Ripper</h3>
            <JohnTheRipperMiniQuiz />
          </div>
        </div>
      )
    },
    {
      id: 'metasploit',
      title: 'Metasploit',
      description: 'A comprehensive penetration testing tool used by security professionals.',
      content: (
        <div className="module-content">
          <h3>What is Metasploit?</h3>
          <p>
            Metasploit Framework is an open-source and comprehensive penetration testing platform used by security professionals, penetration testers, and ethical hackers. Developed by Rapid7, this tool is used to detect security vulnerabilities, exploit them, and test what can be done after gaining access to systems. Metasploit is one of the most popular tools that automates, standardizes, and professionalizes security testing.
          </p>
          
          <div className="module-image">
            <img src="../photos/metasploit.png" alt="Metasploit Framework console interface" />
            <p className="image-caption">Metasploit Framework's msfconsole interface</p>
          </div>
          
          <h3>Key Features of Metasploit</h3>
          <ul className="module-features-list">
            <li><strong>Comprehensive Exploit Database:</strong> Contains over 2000 ready-made exploits and modules</li>
            <li><strong>Payload Library:</strong> Various codes to be executed after gaining access</li>
            <li><strong>Modular Structure:</strong> Easily extensible and customizable architecture</li>
            <li><strong>Active Development:</strong> Continuously updated exploits and modules</li>
            <li><strong>Security Scanning:</strong> Ability to detect vulnerabilities in systems</li>
            <li><strong>Post-Exploitation:</strong> Tools to be used after gaining access</li>
            <li><strong>Developer Interfaces:</strong> Console, Web, and API interfaces</li>
            <li><strong>Comprehensive Documentation:</strong> Detailed user guides and training materials</li>
          </ul>
          
          <h3>Metasploit Versions</h3>
          <ul className="module-features-list">
            <li><strong>Metasploit Framework (MSF):</strong> Open-source, free command-line based version</li>
            <li><strong>Metasploit Pro:</strong> Commercial version with advanced features and web interface</li>
            <li><strong>Metasploit Express:</strong> Mid-level commercial version</li>
            <li><strong>Metasploit Community:</strong> Free but limited-feature version</li>
          </ul>
    
          <div className="module-image">
            <img src="../photos/metasploit-architure.png" alt="Metasploit architecture" />
            <p className="image-caption">Metasploit Framework's modular architecture</p>
          </div>
          
          <h3>Core Metasploit Components</h3>
          <ul className="module-usage-list">
            <li><span className="usage-title">msfconsole</span> <span className="usage-desc">Metasploit's main command-line interface, all core functions are accessed from here</span></li>
            <li><span className="usage-title">Exploits</span> <span className="usage-desc">Modules that gain access to target systems by exploiting security vulnerabilities</span></li>
            <li><span className="usage-title">Payloads</span> <span className="usage-desc">Code pieces to be executed on the target system when the exploit is successful</span></li>
            <li><span className="usage-title">Auxiliary</span> <span className="usage-desc">Modules used for scanning, discovery, and information gathering operations</span></li>
            <li><span className="usage-title">Post</span> <span className="usage-desc">Modules used after gaining system access (information gathering, lateral movement)</span></li>
            <li><span className="usage-title">Encoders</span> <span className="usage-desc">Modules that encode payloads to hide them from antivirus software</span></li>
            <li><span className="usage-title">Nops</span> <span className="usage-desc">No Operation codes, used to improve exploit stability</span></li>
            <li><span className="usage-title">Evasion</span> <span className="usage-desc">Modules used to evade security solutions</span></li>
          </ul>
          
          <h3>Basic Commands and Usage</h3>
          <div className="code-block">
            <h4>1. Starting Metasploit</h4>
            <p>msfconsole</p>
            <p>Starts the main Metasploit command-line interface.</p>
    
            <h4>2. Module Search</h4>
            <p>search [keyword]</p>
            <p>Searches for available modules by a specific keyword.</p>
            <p>Example: search apache</p>
    
            <h4>3. Using a Module</h4>
            <p>use [module path]</p>
            <p>Selects the module you want to use.</p>
            <p>Example: use exploit/windows/smb/ms17_010_eternalblue</p>
    
            <h4>4. Displaying Module Information</h4>
            <p>info</p>
            <p>Shows detailed information about the selected module.</p>
    
            <h4>5. Displaying Module Options</h4>
            <p>show options</p>
            <p>Shows the configuration options of the selected module.</p>
    
            <h4>6. Setting Options</h4>
            <p>set [option] [value]</p>
            <p>Assigns a value to a module option.</p>
            <p>Example: set RHOSTS 192.168.1.10</p>
    
            <h4>7. Displaying Payload Options</h4>
            <p>show payloads</p>
            <p>Shows payloads compatible with the selected exploit.</p>
    
            <h4>8. Selecting Payload</h4>
            <p>set PAYLOAD [payload path]</p>
            <p>Selects the payload to be used for the exploit.</p>
            <p>Example: set PAYLOAD windows/meterpreter/reverse_tcp</p>
    
            <h4>9. Running Exploit</h4>
            <p>exploit (or run)</p>
            <p>Runs the selected exploit with configured options.</p>
    
            <h4>10. Listing Sessions</h4>
            <p>sessions -l</p>
            <p>Lists active meterpreter and shell sessions.</p>
    
            <h4>11. Interacting with Session</h4>
            <p>sessions -i [session number]</p>
            <p>Activates the specified session.</p>
            <p>Example: sessions -i 1</p>
    
            <h4>12. Checking Database Status</h4>
            <p>db_status</p>
            <p>Shows the status of PostgreSQL database connection.</p>
    
            <h4>13. Performing Nmap Scan</h4>
            <p>db_nmap [parameters] [target]</p>
            <p>Performs Nmap scan and saves results to Metasploit database.</p>
            <p>Example: db_nmap -sV 192.168.1.0/24</p>
    
            <h4>14. Listing Discovered Hosts</h4>
            <p>hosts</p>
            <p>Shows hosts recorded in the database.</p>
    
            <h4>15. Listing Discovered Services</h4>
            <p>services</p>
            <p>Shows services recorded in the database.</p>
          </div>
          
          
          <h3>Payload Types</h3>
          <ul className="module-features-list">
            <li><strong>Singles:</strong> Independent code pieces that can run on their own</li>
            <li><strong>Stagers:</strong> Structures that first run a small code piece, then download the actual payload (stage)</li>
            <li><strong>Stages:</strong> Larger code pieces downloaded and executed by the stager</li>
            <li><strong>Meterpreter:</strong> Advanced, memory-resident, and extensible payload</li>
          </ul>
          
          <h3>What is Meterpreter?</h3>
          <p>
            Meterpreter is the most powerful and versatile payload of Metasploit Framework. It runs entirely in memory without leaving traces on disk and provides extensive control over the system with many functions. Important Meterpreter commands:
          </p>
          <ul className="module-features-list">
            <li><strong>sysinfo:</strong> Shows system information</li>
            <li><strong>getuid:</strong> Shows current user information</li>
            <li><strong>getsystem:</strong> Attempts to escalate system privileges</li>
            <li><strong>ps:</strong> Lists running processes</li>
            <li><strong>migrate [process id]:</strong> Moves Meterpreter to another process</li>
            <li><strong>download/upload:</strong> File download and upload operations</li>
            <li><strong>shell:</strong> Starts command-line shell</li>
            <li><strong>hashdump:</strong> Collects password hashes</li>
            <li><strong>screenshot:</strong> Takes screenshot</li>
            <li><strong>webcam_snap:</strong> Takes photo from webcam</li>
            <li><strong>keyscan_start/keyscan_dump:</strong> Records keyboard keystrokes</li>
          </ul>
          
          <div className="module-image">
            <img src="../photos/meterpreter-active.png" alt="Meterpreter session" />
            <p className="image-caption">An active Meterpreter session</p>
          </div>
          
          <h3>Metasploit Usage Areas</h3>
          <ul className="module-features-list">
            <li><strong>Penetration Testing:</strong> Detecting and evaluating security vulnerabilities in systems and networks</li>
            <li><strong>Vulnerability Validation:</strong> Verifying whether theoretical security vulnerabilities are actually exploitable</li>
            <li><strong>Social Engineering:</strong> Testing security vulnerabilities based on human factors</li>
            <li><strong>Wireless Network Testing:</strong> Evaluating wireless network security</li>
            <li><strong>Web Application Testing:</strong> Testing security vulnerabilities in web applications</li>
            <li><strong>Internal Network Assessments:</strong> Testing intra-organizational systems</li>
            <li><strong>Intrusion Scenarios:</strong> Creating advanced persistent threat (APT) like scenarios</li>
          </ul>
    
          <h3>Security Testing Process with Metasploit</h3>
          <ol className="module-steps-list">
            <li><span className="step-title">Information Gathering</span> <span className="step-desc">Gathering as much information as possible about the target system (Reconnaissance)</span></li>
            <li><span className="step-title">Vulnerability Scanning</span> <span className="step-desc">Identifying vulnerabilities in the system using auxiliary modules</span></li>
            <li><span className="step-title">Exploit Selection</span> <span className="step-desc">Selecting appropriate exploit module for detected vulnerabilities</span></li>
            <li><span className="step-title">Payload Configuration</span> <span className="step-desc">Selecting and configuring the payload to be used</span></li>
            <li><span className="step-title">Running Exploit</span> <span className="step-desc">Running the prepared exploit on the target system</span></li>
            <li><span className="step-title">Post-Exploitation</span> <span className="step-desc">Privilege escalation, persistence, data collection after gaining access</span></li>
            <li><span className="step-title">Lateral Movement</span> <span className="step-desc">Spreading to other systems within the network</span></li>
            <li><span className="step-title">Cleaning Traces</span> <span className="step-desc">Cleaning traces on the system after testing</span></li>
            <li><span className="step-title">Reporting</span> <span className="step-desc">Preparing detailed reports including found vulnerabilities and recommendations</span></li>
          </ol>
          
          <h3>Advantages of Metasploit</h3>
          <ul className="module-features-list">
            <li><strong>Comprehensive Module Library:</strong> Over 2000 ready-made exploits and auxiliary modules</li>
            <li><strong>Ease of Use:</strong> Interface that simplifies complex security testing</li>
            <li><strong>Modular Structure:</strong> Easily extensible architecture</li>
            <li><strong>Active Development:</strong> Regularly updated exploit database</li>
            <li><strong>Wide Community Support:</strong> Large and active user community</li>
            <li><strong>Integration Capabilities:</strong> Ability to work integrated with other security tools</li>
            <li><strong>Automation:</strong> Automating tests with scripts and resource files</li>
          </ul>
          
          <h3>Metasploit Armitage</h3>
          <p>
            Armitage is a graphical user interface developed for Metasploit Framework. It allows you to perform complex Metasploit commands with simple clicks and creates visual network maps.
          </p>

          <h3>Metasploit Framework Development</h3>
          <p>
            Since Metasploit is an open-source project, you can contribute by developing your own modules. Module development process:
          </p>
          <ul className="module-features-list">
            <li>Learning Ruby programming language</li>
            <li>Studying Metasploit's API documentation</li>
            <li>Understanding the structure by examining existing modules</li>
            <li>Following Metasploit development principles</li>
            <li>Testing and debugging your module</li>
            <li>Sharing your developed module with the community</li>
          </ul>
          
          <h3>Security and Ethical Use</h3>
          <p>
            Metasploit is a powerful penetration testing tool and should only be used for ethical purposes:
          </p>
          <ul className="module-features-list">
            <li>Use only on authorized systems</li>
            <li>Obtain written permission before testing</li>
            <li>Be careful on production systems</li>
            <li>Report discovered security vulnerabilities responsibly</li>
            <li>Stay within legal and ethical boundaries</li>
            <li>Take extra precautions when using on critical infrastructure systems</li>
            <li>Keep test results confidential and store them securely</li>
          </ul>
          
          
          <div style={{marginTop: 40, padding: 24, background: '#181f2a', borderRadius: 8, textAlign: 'left'}}>
            <h3 style={{marginBottom: 12, textAlign: 'left'}}>Mini Quiz: Metasploit</h3>
            <MetasploitMiniQuiz />
          </div>
        </div>
      )
    },
    {
      id: 'nessus',
      title: 'Nessus',
      description: 'A comprehensive and powerful vulnerability scanning tool.',
      content: (
        <div className="module-content">
          <h3>What is Nessus?</h3>
          <p>
            Nessus is a comprehensive and powerful security vulnerability scanning tool developed by Tenable. 
            It is used to detect vulnerabilities in various systems such as network devices, operating systems, databases, web applications and cloud infrastructures. First released as open source in 1998, Nessus became a commercial product in 2005 and is now one of the most widely used vulnerability scanning tools worldwide.
          </p>
          
          <div className="module-image">
            <img src="../photos/nessus.png" alt="Nessus interface" />
            <p className="image-caption">Nessus web interface: Modern and user-friendly dashboard</p>
          </div>
          
          <h3>Key Features of Nessus</h3>
          <ul className="module-features-list">
            <li><strong>Comprehensive Scanning Capabilities:</strong> Scans systems in detail with over 60,000 security vulnerability checks</li>
            <li><strong>Low False Positive Rate:</strong> Provides reliable results thanks to advanced verification mechanisms</li>
            <li><strong>Remote and Credentialed Scans:</strong> Detects internal vulnerabilities by accessing systems both from external networks and with credentials</li>
            <li><strong>Network Device Configuration Auditing:</strong> Performs configuration audits of devices such as routers, switches, and firewalls</li>
            <li><strong>Compliance Audits:</strong> Provides compliance checks for standards such as PCI DSS, HIPAA, NIST, CIS, DISA STIG</li>
            <li><strong>Patch Management:</strong> Detects and prioritizes missing patches in systems</li>
            <li><strong>Web Application Scanning:</strong> Detects web application security vulnerabilities such as SQL Injection, XSS, CSRF</li>
            <li><strong>Cloud Infrastructure Scanning:</strong> Provides security auditing of cloud platforms such as AWS, Azure, Google Cloud</li>
            <li><strong>Mobile Device Scanning:</strong> Identifies security vulnerabilities in corporate mobile devices</li>
            <li><strong>Customizable Scans:</strong> Offers the ability to customize scanning profiles according to needs</li>
          </ul>
          
          <h3>How Nessus Works</h3>
          <p>
            Nessus uses a systematic approach to scan target systems. The scanning process typically consists of these steps:
          </p>
          <ol className="module-steps-list">
            <li><span className="step-title">Target Discovery</span> <span className="step-desc">Detects active devices on the network and performs port scanning</span></li>
            <li><span className="step-title">Service Detection</span> <span className="step-desc">Identifies services and their versions running on open ports</span></li>
            <li><span className="step-title">Vulnerability Check</span> <span className="step-desc">Checks for known security vulnerabilities in detected services</span></li>
            <li><span className="step-title">Verification</span> <span className="step-desc">Verifies vulnerabilities to reduce false positives</span></li>
            <li><span className="step-title">Reporting</span> <span className="step-desc">Presents discovered vulnerabilities in detailed reports</span></li>
          </ol>
   
          
          <h3>Scan Types</h3>
          <ul className="module-usage-list">
            <li><span className="usage-title">Basic Network Scanning</span> <span className="usage-desc">Quick scan, provides an overview using a small number of security checks</span></li>
            <li><span className="usage-title">Advanced Scanning</span> <span className="usage-desc">Comprehensive scan, performs detailed analysis using all available security checks</span></li>
            <li><span className="usage-title">Credentialed Scanning</span> <span className="usage-desc">Logs into systems (SSH, Windows credentials, etc.) to detect internal vulnerabilities</span></li>
            <li><span className="usage-title">Web Application Scanning</span> <span className="usage-desc">Optimized scan to detect specific security vulnerabilities in web applications</span></li>
            <li><span className="usage-title">Compliance Scanning</span> <span className="usage-desc">Configured scan to audit compliance with specific standards and regulations</span></li>
            <li><span className="usage-title">Malware Scanning</span> <span className="usage-desc">Specialized scan that searches for malware indicators in systems</span></li>
            <li><span className="usage-title">Policy Auditing</span> <span className="usage-desc">Scan that checks the compliance of system configurations with specific policies</span></li>
          </ul>

          <h3>Nessus Versions</h3>
          <ul className="module-features-list">
            <li><strong>Nessus Essentials:</strong> Free version, offers limited scanning features up to 16 IPs</li>
            <li><strong>Nessus Professional:</strong> Full-featured commercial version, ideal for individual use and small businesses</li>
            <li><strong>Tenable.io:</strong> Cloud-based solution, suitable for continuous scanning and large-scale environments</li>
            <li><strong>Tenable.sc:</strong> Enterprise management solution, offers multi-scanner management and advanced reporting features</li>
          </ul>
          
          <div className="module-image">
            <img src="../photos/nessus-versions.png" alt="Nessus versions comparison" />
            <p className="image-caption">Nessus versions comparison table</p>
          </div>
          
          <h3>Nessus User Interface</h3>
          <p>
            Nessus has a user-friendly web-based interface. Through this interface:
          </p>
          <ul className="module-features-list">
            <li><strong>Scan Configuration:</strong> Creating and configuring new scans</li>
            <li><strong>Scan Management:</strong> Starting, stopping and scheduling existing scans</li>
            <li><strong>Result Analysis:</strong> Viewing and filtering vulnerability results</li>
            <li><strong>Reporting:</strong> Creating reports in various formats (PDF, HTML, CSV, XML)</li>
            <li><strong>User Management:</strong> Managing user accounts and permissions</li>
            <li><strong>Settings:</strong> Configuring system settings and scanning policies</li>
          </ul>

          
          <h3>Nessus Scan Results and Reporting</h3>
          <p>
            Nessus categorizes vulnerability scan results as follows:
          </p>
          <ul className="module-features-list">
            <li><strong>Critical:</strong> High-risk vulnerabilities that require immediate intervention and are remotely exploitable</li>
            <li><strong>High:</strong> Important security vulnerabilities that need to be addressed in the short term</li>
            <li><strong>Medium:</strong> Medium-risk vulnerabilities that should be resolved within a reasonable time</li>
            <li><strong>Low:</strong> Low-risk vulnerabilities that can be addressed during normal maintenance processes</li>
            <li><strong>Info:</strong> Findings that do not contain risk but are presented for informational purposes</li>
          </ul>
          <p>
            For each vulnerability, the following information is provided:
          </p>
          <ul className="module-features-list">
            <li><strong>Description:</strong> Detailed description of the vulnerability</li>
            <li><strong>Impact:</strong> Potential impact of the vulnerability on systems</li>
            <li><strong>Solution:</strong> Recommended solutions to remediate the vulnerability</li>
            <li><strong>References:</strong> CVE numbers and other technical references</li>
            <li><strong>Evidence:</strong> Technical details showing the existence of the vulnerability</li>
          </ul>

          <h3>Nessus API and Integrations</h3>
          <p>
            Nessus offers REST API support for automation and integration with other security tools. Through this API:
          </p>
          <ul className="module-features-list">
            <li>You can start and manage scans programmatically</li>
            <li>You can automatically retrieve scan results</li>
            <li>You can provide integration with SIEM, GRC and other security platforms</li>
            <li>You can include security scans in CI/CD pipelines</li>
            <li>You can develop custom reporting and analysis solutions</li>
          </ul>
          <p>
            Nessus provides integration with these popular security tools:
          </p>
          <ul className="module-features-list">
            <li>SIEM solutions like Splunk, QRadar, ArcSight</li>
            <li>Job tracking systems like ServiceNow, Jira</li>
            <li>CI/CD tools like Jenkins, GitLab CI</li>
            <li>Penetration testing tools like MetaSploit</li>
            <li>GRC platforms like RSA Archer, IBM OpenPages</li>
          </ul>
          
          <div className="module-image">
            <img src="../photos/nessus-api.png" alt="Nessus API usage" />
            <p className="image-caption">Integration example with Nessus API</p>
          </div>
          
          <h3>Advantages of Nessus</h3>
          <ul className="module-features-list">
            <li><strong>Comprehensive Scanning:</strong> Over 60,000 security vulnerability checks</li>
            <li><strong>Accuracy:</strong> Low false positive rate and reliable results</li>
            <li><strong>Ease of Use:</strong> Intuitive and user-friendly interface</li>
            <li><strong>Scalability:</strong> Scalable from small networks to enterprise environments</li>
            <li><strong>Regular Updates:</strong> Daily updated vulnerability database</li>
            <li><strong>Various Scanning Options:</strong> Customizable scanning profiles for different needs</li>
            <li><strong>Comprehensive Reporting:</strong> Detailed and customizable reports</li>
            <li><strong>Integration Capacity:</strong> Easy integration with other security tools</li>
          </ul>
          
          <h3>Typical Usage Scenarios</h3>
          <ul className="module-usage-list">
            <li><span className="usage-title">Periodic Security Scans</span> <span className="usage-desc">Regularly scanning systems to detect new vulnerabilities</span></li>
            <li><span className="usage-title">New System Auditing</span> <span className="usage-desc">Scanning new systems for security vulnerabilities before putting them into production</span></li>
            <li><span className="usage-title">Compliance Auditing</span> <span className="usage-desc">Checking the compliance of systems with security standards</span></li>
            <li><span className="usage-title">Patch Management</span> <span className="usage-desc">Detecting and prioritizing missing security patches</span></li>
            <li><span className="usage-title">Pre-Penetration Testing</span> <span className="usage-desc">Identifying potential targets before manual penetration tests</span></li>
            <li><span className="usage-title">Configuration Auditing</span> <span className="usage-desc">Checking the compliance of system configurations with security policies</span></li>
            <li><span className="usage-title">Pre-Purchase Security Assessment</span> <span className="usage-desc">Evaluating the security status of newly acquired systems</span></li>
          </ul>
          
          <h3>Nessus Scan Creation Steps</h3>
          <ol className="module-steps-list">
            <li><span className="step-title">Scanning Policy Selection</span> <span className="step-desc">Select the scanning template or policy appropriate for your needs</span></li>
            <li><span className="step-title">Target Definition</span> <span className="step-desc">Specify IP addresses, IP ranges or host names</span></li>
            <li><span className="step-title">Scan Settings</span> <span className="step-desc">Determine port scanning settings, protocol selections and scanning depth</span></li>
            <li><span className="step-title">Credentials</span> <span className="step-desc">Add credentials if needed for more detailed scanning (SSH, Windows, etc.)</span></li>
            <li><span className="step-title">Schedule Setting</span> <span className="step-desc">Plan when and how often the scan will be performed</span></li>
            <li><span className="step-title">Notification Settings</span> <span className="step-desc">Configure notification settings when scan is completed or critical vulnerabilities are found</span></li>
            <li><span className="step-title">Start Scanning</span> <span className="step-desc">Save the scan configuration and start the scan</span></li>
          </ol>
          
          
          <h3>Security and Ethical Use</h3>
          <p>
            Vulnerability scanning tools like Nessus are powerful tools and can be harmful when misused. Points to consider:
          </p>
          <ul className="module-features-list">
            <li>Only scan on systems you have permission to</li>
            <li>Get written permission before scanning</li>
            <li>Perform planned and controlled scans on production systems</li>
            <li>Schedule scans during low-intensity hours</li>
            <li>Test scans in test environments first for sensitive systems</li>
            <li>Store scan results securely and do not share with unauthorized persons</li>
            <li>Report discovered vulnerabilities responsibly and follow up</li>
          </ul>
          
          <h3>Nessus Alternative and Complementary Tools</h3>
          <ul className="module-features-list">
            <li><strong>OpenVAS:</strong> Open source vulnerability scanning solution</li>
            <li><strong>Qualys:</strong> Cloud-based vulnerability management platform</li>
            <li><strong>Rapid7 Nexpose/InsightVM:</strong> Comprehensive vulnerability management solution</li>
            <li><strong>Acunetix:</strong> Web application focused vulnerability scanner</li>
            <li><strong>Burp Suite:</strong> For web application security testing</li>
            <li><strong>Metasploit:</strong> For vulnerability validation and penetration testing</li>
            <li><strong>OWASP ZAP:</strong> Open source web application security scanner</li>
          </ul>
          
          <div style={{marginTop: 40, padding: 24, background: '#181f2a', borderRadius: 8, textAlign: 'left'}}>
            <h3 style={{marginBottom: 12, textAlign: 'left'}}>Mini Quiz: Nessus</h3>
            <NessusMiniQuiz />
          </div>
        </div>
      )
    },
    {
      id: 'snort',
      title: 'Snort',
      description: 'An open-source network monitoring and intrusion detection system.',
      content: (
        <div className="module-content">
          <h3>What is Snort?</h3>
          <p>
            Snort is an open-source, free and lightweight network intrusion detection and prevention system (NIDS/NIPS). 
            Started by Martin Roesch in 1998, Snort is now supported by Cisco and is used by millions of organizations and individuals worldwide. 
            With real-time traffic analysis and packet logging capabilities, it uses a rule-based language to detect potential attacks and security breaches on the network.
          </p>

          
          <h3>Key Features of Snort</h3>
          <div className="feature-cards">
            <div className="feature-card">
              <div className="feature-card-icon">🔍</div>
              <h4 className="feature-card-title">Packet Sniffing</h4>
              <p className="feature-card-description">Real-time monitoring and capturing of network traffic</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-card-icon">🛡️</div>
              <h4 className="feature-card-title">Attack Detection</h4>
              <p className="feature-card-description">Identifying malicious traffic and known attack patterns</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-card-icon">🚫</div>
              <h4 className="feature-card-title">Attack Prevention</h4>
              <p className="feature-card-description">Blocking detected malicious traffic and taking preventive actions</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-card-icon">📝</div>
              <h4 className="feature-card-title">Packet Logging</h4>
              <p className="feature-card-description">Recording network traffic for analysis and forensic investigation</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-card-icon">⚙️</div>
              <h4 className="feature-card-title">Scalability</h4>
              <p className="feature-card-description">Scalable structure from small networks to large enterprise environments</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-card-icon">🔧</div>
              <h4 className="feature-card-title">Customizability</h4>
              <p className="feature-card-description">Adapting to your specific security needs by writing your own rules</p>
            </div>
          </div>
          
          <h3>Snort Operating Modes</h3>
          <ul className="module-usage-list">
            <li><span className="usage-title">Sniffer Mode</span> <span className="usage-desc">Reads network packets in real-time and displays them on screen, allows monitoring traffic flow</span></li>
            <li><span className="usage-title">Packet Logger Mode</span> <span className="usage-desc">Records network traffic to disk, can be used for later examination and analysis</span></li>
            <li><span className="usage-title">NIDS Mode (Network Intrusion Detection System)</span> <span className="usage-desc">Analyzes network traffic and generates alerts according to specific rules, reports security events through passive monitoring</span></li>
            <li><span className="usage-title">NIPS Mode (Network Intrusion Prevention System)</span> <span className="usage-desc">Actively blocks traffic detected as malicious, protects the network in real-time</span></li>
          </ul>
          
          <div className="module-image">
            <img src="../photos/snort-architecture.png" alt="Snort architecture and working principles" />
            <p className="image-caption">Snort's general architecture and relationship between operating modes</p>
          </div>
          
          <h3>Snort Architecture</h3>
          <p>
            Snort has a modular architecture and consists of five main components:
          </p>
          <ol className="module-steps-list">
            <li><span className="step-title">Packet Capture</span> <span className="step-desc">Captures network traffic using libpcap/WinPcap library</span></li>
            <li><span className="step-title">Packet Decoder</span> <span className="step-desc">Decodes captured packets and extracts protocol information</span></li>
            <li><span className="step-title">Preprocessors</span> <span className="step-desc">Normalizes packets, performs various checks and prepares them for the engine</span></li>
            <li><span className="step-title">Detection Engine</span> <span className="step-desc">Compares packets with rule set and determines matches</span></li>
            <li><span className="step-title">Output Plugins</span> <span className="step-desc">Creates logs and alerts of detected events (log, syslog, database, etc.)</span></li>
          </ol>
          
          <h3>Snort Rules</h3>
          <p>
            Snort's power comes with its rich rule set. Rules define specific traffic patterns and specify what should be done for matching packets. A Snort rule typically consists of a rule header and rule options:
          </p>
          
          <div className="code-block">
            <p><span style={{color: "#60a5fa"}}>action protocol src_ip src_port direction dst_ip dst_port</span> (<span style={{color: "#10b981"}}>options</span>)</p>
            <p>Example: alert tcp any any -&gt; 192.168.1.0/24 80 (msg:"HTTP GET Request"; content:"GET"; sid:1000001; rev:1;)</p>
          </div>
          
          <p>
            In this example, an alert is generated for TCP packets coming from the Internet (any) to port 80 in the 192.168.1.0/24 network and containing the word "GET".
          </p>
          
          <h3>Rule Components</h3>
          <ul className="module-features-list">
            <li><strong>Action:</strong> Specifies what to do like "alert", "log", "pass", "drop", "reject"</li>
            <li><strong>Protocol:</strong> Specifies the protocol like "tcp", "udp", "icmp", "ip"</li>
            <li><strong>Source/Destination IP:</strong> Source and destination of the packet</li>
            <li><strong>Source/Destination Port:</strong> Source and destination port numbers</li>
            <li><strong>Direction:</strong> "-&gt;" indicates unidirectional, "&lt;&gt;" indicates bidirectional traffic</li>
            <li><strong>Options:</strong> Additional information such as content matching, protocol features, messages</li>
          </ul>
          
          <h3>Common Rule Options</h3>
          <ul className="module-features-list">
            <li><strong>msg:</strong> Alert or log message</li>
            <li><strong>content:</strong> Data to search for in packet content</li>
            <li><strong>nocase:</strong> Case-insensitive matching</li>
            <li><strong>sid:</strong> Rule ID number (signature id)</li>
            <li><strong>rev:</strong> Rule revision number</li>
            <li><strong>classtype:</strong> Attack class (web-attack, dos, trojan, etc.)</li>
            <li><strong>priority:</strong> Alert priority (1 is highest)</li>
            <li><strong>threshold:</strong> Alert thresholds and limits</li>
            <li><strong>reference:</strong> External references (CVE, bugtraq, etc.)</li>
          </ul>
          
          <div className="module-image">
            <img src="../photos/snort-rule.png" alt="Snort rule structure and example rules" />
            <p className="image-caption">Snort rule structure and example rules collection</p>
          </div>
          
          <h3>Snort Use Cases</h3>
          <ul className="module-usage-list">
            <li><span className="usage-title">Network Security Monitoring</span> <span className="usage-desc">Detecting potential attacks and breaches, monitoring network traffic</span></li>
            <li><span className="usage-title">Compliance Controls</span> <span className="usage-desc">Security monitoring for compliance with regulations like PCI-DSS, HIPAA</span></li>
            <li><span className="usage-title">Forensic Analysis</span> <span className="usage-desc">Investigation and evidence collection after security incidents</span></li>
            <li><span className="usage-title">Network Behavior Analysis</span> <span className="usage-desc">Identifying normal and abnormal network traffic patterns</span></li>
            <li><span className="usage-title">Enterprise Security</span> <span className="usage-desc">Real-time protection and monitoring in large-scale networks</span></li>
            <li><span className="usage-title">Education and Learning</span> <span className="usage-desc">Network security training for security professionals</span></li>
          </ul>
          
          <h3>Snort Installation and Configuration</h3>
          <h4>Basic Installation Steps</h4>
          <div className="code-block">
            <p># Installation on Ubuntu/Debian systems</p>
            <p>sudo apt update</p>
            <p>sudo apt install snort</p>
            <p></p>
            <p># Basic configuration file</p>
            <p>sudo nano /etc/snort/snort.conf</p>
            <p></p>
            <p># Basic rule set</p>
            <p>sudo ls -la /etc/snort/rules/</p>
            <p></p>
            <p># Running Snort in test mode</p>
            <p>sudo snort -T -c /etc/snort/snort.conf</p>
            <p></p>
            <p># Running in sniffer mode</p>
            <p>sudo snort -v -i eth0</p>
            <p></p>
            <p># Monitoring a specific network in IDS mode</p>
            <p>sudo snort -A console -q -c /etc/snort/snort.conf -i eth0</p>
          </div>
          
          <h4>Snort Configuration File</h4>
          <p>
            Snort's main configuration file (usually /etc/snort/snort.conf) contains the following main sections:
          </p>
          <ul className="module-features-list">
            <li><strong>Network Variables:</strong> Network definitions like HOME_NET, EXTERNAL_NET</li>
            <li><strong>Port Variables:</strong> Port definitions like HTTP_PORTS, SQL_PORTS</li>
            <li><strong>Preprocessor Configurations:</strong> Protocol preprocessors like HTTP, FTP, SMTP</li>
            <li><strong>Output Plugins:</strong> Configuration of logging and alert mechanisms</li>
            <li><strong>Rule Inclusion:</strong> List of rule files to be imported</li>
          </ul>
          
          <h3>Snort vs. Other IDS/IPS Systems</h3>
          <div className="feature-cards">
            <div className="feature-card">
              <div className="feature-card-icon">⚡</div>
              <h4 className="feature-card-title">Snort</h4>
              <p className="feature-card-description">Open source, rule-based, lightweight, wide community support, supported by Cisco</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-card-icon">🔒</div>
              <h4 className="feature-card-title">Suricata</h4>
              <p className="feature-card-description">Open source, multi-threaded, high performance, compatible with Snort rules</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-card-icon">🛠️</div>
              <h4 className="feature-card-title">OSSEC</h4>
              <p className="feature-card-description">Host-based IDS, log analysis, file integrity checking, rootkit detection</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-card-icon">💼</div>
              <h4 className="feature-card-title">Cisco Firepower</h4>
              <p className="feature-card-description">Commercial, next-generation firewall and IPS, uses Snort engine</p>
            </div>
          </div>
          
          <h3>Snort Optimization Tips</h3>
          <ul className="module-features-list">
            <li><strong>Rule Optimization:</strong> Enable only the rules you need</li>
            <li><strong>Hardware Requirements:</strong> Increase performance with high memory and CPU power</li>
            <li><strong>Network Card Configuration:</strong> Optimize network card settings, use special packet capture libraries like PF_RING if necessary</li>
            <li><strong>Cache Management:</strong> Increase system performance by adjusting cache sizes</li>
            <li><strong>Thread Configuration:</strong> Optimize thread count on multi-core systems</li>
            <li><strong>Rule Set Division:</strong> Divide rule sets for load balancing</li>
          </ul>
          
          <h3>Snort Integration Options</h3>
          <ul className="module-features-list">
            <li><strong>SIEM Systems:</strong> Integration with Splunk, ELK Stack, QRadar</li>
            <li><strong>BASE/Snorby:</strong> Web-based Snort alert management interfaces</li>
            <li><strong>PulledPork:</strong> Automatic rule update and management</li>
            <li><strong>Barnyard2:</strong> Transferring Unified2 format outputs to databases</li>
            <li><strong>Wazuh:</strong> Security monitoring platform combining OSSEC and Snort</li>
            <li><strong>Security Onion:</strong> Security distribution containing Snort, Suricata, OSSEC and other tools</li>
          </ul>

          
          <h3>Snort 3 Innovations</h3>
          <p>
            Snort 3 (formerly known as Snort++) offers many new features and improvements over classic Snort:
          </p>
          <ul className="module-features-list">
            <li><strong>Multi-threaded Processing:</strong> Architecture that increases performance and scalability</li>
            <li><strong>Dynamic Memory Management:</strong> More efficient memory usage</li>
            <li><strong>Plugin-based Architecture:</strong> Modular and flexible structure</li>
            <li><strong>Rich API:</strong> Easier integration and customization</li>
            <li><strong>New Rule Writing Language:</strong> More powerful and flexible rule writing</li>
            <li><strong>C++17 Standards:</strong> Using modern programming techniques</li>
            <li><strong>Debugging Improvements:</strong> Easier troubleshooting</li>
          </ul>
          
          <h3>Security and Ethical Use</h3>
          <p>
            When using network monitoring and security tools like Snort, the following ethical principles should be observed:
          </p>
          <ul className="module-features-list">
            <li>Use only on your own network or networks you have permission to</li>
            <li>Inform employees and users that network traffic is being monitored</li>
            <li>Implement appropriate data protection policies to protect personal data</li>
            <li>Use in compliance with privacy and security regulations (GDPR, HIPAA, etc.)</li>
            <li>Use collected data only for security purposes</li>
            <li>Report security incidents and findings responsibly</li>
          </ul>
          
          <div style={{marginTop: 40, padding: 24, background: '#181f2a', borderRadius: 8, textAlign: 'left'}}>
            <h3 style={{marginBottom: 12, textAlign: 'left'}}>Mini Quiz: Snort</h3>
            <SnortMiniQuiz />
          </div>
        </div>
      )
    },
    {
      id: 'nikto',
      title: 'Nikto',
      description: 'An open-source tool used to scan web servers for security vulnerabilities.',
      content: (
        <div className="module-content">
          <h3>What is Nikto?</h3>
          <p>
            Nikto is an open-source web server scanner designed to detect security vulnerabilities, misconfigurations, and outdated software in web servers. Developed by CIRT.net (Sullo) and written in Perl programming language, Nikto is widely used by cybersecurity experts, penetration testers, and network administrators to assess the security status of web servers.
          </p>
          
          <div className="module-image">
            <img src="../photos/nikto.png" alt="Nikto scan output" />
            <p className="image-caption">Nikto's scan output shown while running in terminal</p>
          </div>
          
          <h3>Key Features of Nikto</h3>
          <div className="feature-cards">
            <div className="feature-card">
              <div className="feature-card-icon">🔍</div>
              <h4 className="feature-card-title">Comprehensive Database</h4>
              <p className="feature-card-description">6800+ potentially dangerous file and program checks</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-card-icon">🌐</div>
              <h4 className="feature-card-title">Wide Server Support</h4>
              <p className="feature-card-description">Ability to scan 1250+ different web server versions</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-card-icon">🔒</div>
              <h4 className="feature-card-title">SSL/TLS Support</h4>
              <p className="feature-card-description">Ability to scan secure sites over HTTPS</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-card-icon">⚙️</div>
              <h4 className="feature-card-title">Proxy Support</h4>
              <p className="feature-card-description">Ability to scan through proxy and monitoring</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-card-icon">📝</div>
              <h4 className="feature-card-title">Multiple Report Formats</h4>
              <p className="feature-card-description">Automatic reporting in formats like HTML, XML, CSV</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-card-icon">🧩</div>
              <h4 className="feature-card-title">Plugin Architecture</h4>
              <p className="feature-card-description">Plugin support for customizable scans</p>
            </div>
          </div>
          
          <h3>What Can Nikto Detect?</h3>
          <ul className="module-features-list">
            <li><strong>Misconfigurations:</strong> Configurations in server settings that could create security vulnerabilities</li>
            <li><strong>Default Files and Programs:</strong> Default, test, or sample files found on the server</li>
            <li><strong>Insecure Files and Folders:</strong> Exposed, accessible files and directories</li>
            <li><strong>Outdated Software:</strong> Old server software versions containing security vulnerabilities</li>
            <li><strong>XSS, CSRF and Injection Vulnerabilities:</strong> Various web application security vulnerabilities</li>
            <li><strong>Server Information Disclosure:</strong> Issues with excessive information disclosure in HTTP headers</li>
            <li><strong>Host Header Vulnerabilities:</strong> Vulnerabilities based on host header manipulation</li>
            <li><strong>Multiple Index Files:</strong> Directories containing multiple index files</li>
            <li><strong>HTTP Options:</strong> HTTP methods active on the server (PUT, DELETE, etc.)</li>
            <li><strong>Cookie Issues:</strong> Insecure cookie settings and configurations</li>
          </ul>
          
          <div className="module-image">
            <img src="../photos/nikto.png" alt="Nikto scan findings" />
            <p className="image-caption">Various web server vulnerabilities detected by Nikto</p>
          </div>
          
          <h3>Nikto Commands and Usage</h3>
          <div className="code-block">
            <h4>1. Basic Scan</h4>
            <p>nikto -h 192.168.1.1</p>
            <p>The most basic scan command. Scans the target IP address or domain name.</p>
            
            <h4>2. SSL Scan</h4>
            <p>nikto -h 192.168.1.1 -p 443 -ssl</p>
            <p>Scans a secure website over HTTPS.</p>
            
            <h4>3. HTML Report Generation</h4>
            <p>nikto -h 192.168.1.1 -o report.html -Format htm</p>
            <p>Saves scan results in HTML format.</p>
            
            <h4>4. Specific Scan Types</h4>
            <p>nikto -h 192.168.1.1 -Tuning 1,2,3</p>
            <p>Performs specific types of scans (1=File Scan, 2=Misconfiguration, 3=Information Disclosure).</p>
            
            <h4>5. Time-Limited Scan</h4>
            <p>nikto -h 192.168.1.1 -maxtime 60s</p>
            <p>Limits the scan to a specific time (60 seconds).</p>
            
            <h4>6. Automatic Update</h4>
            <p>nikto -update</p>
            <p>Updates Nikto database and plugins.</p>
            
            <h4>7. Proxy Usage</h4>
            <p>nikto -h 192.168.1.1 -useproxy http://proxy:8080</p>
            <p>Performs scan through the specified proxy.</p>
            
            <h4>8. Authentication</h4>
            <p>nikto -h 192.168.1.1 -id admin:password</p>
            <p>Scans sites requiring basic HTTP authentication.</p>
            
            <h4>9. Multiple Host Scan</h4>
            <p>nikto -h hosts.txt</p>
            <p>Scans multiple targets from a file.</p>
            
            <h4>10. Verbosity Level</h4>
            <p>nikto -h 192.168.1.1 -Display V</p>
            <p>Sets the verbosity level during scan (1-4 or V=Verbose).</p>
          </div>
          
          <h3>Nikto Tuning Options</h3>
          <p>
            In Nikto, the -Tuning parameter is used to focus the scan on specific tests. This can increase scan speed and allow you to perform more targeted tests:
          </p>
          <ul className="module-features-list">
            <li><strong>0 - File Upload:</strong> File-based vulnerabilities on web server</li>
            <li><strong>1 - Interesting File / Seen in logs:</strong> Misconfigurations and default files</li>
            <li><strong>2 - Misconfiguration / Default File:</strong> Information leaking elements</li>
            <li><strong>3 - Information Disclosure:</strong> Known vulnerabilities and vulnerability traces</li>
            <li><strong>4 - Injection (XSS/Script/HTML):</strong> Command, SQL, XSS injection points</li>
            <li><strong>5 - Remote File Retrieval - Inside Web Root:</strong> Remote file inclusion or upload vulnerabilities</li>
            <li><strong>6 - Denial of Service:</strong> DoS vulnerabilities</li>
            <li><strong>7 - Remote File Retrieval - Server Wide:</strong> Related web application vulnerabilities</li>
            <li><strong>8 - Command Execution - Remote Shell:</strong> Interesting but usually harmless findings</li>
            <li><strong>9 - SQL Injection:</strong> Firewall evasion techniques</li>
            <li><strong>a - Authentication Bypass:</strong> Bypassing authentication mechanisms</li>
            <li><strong>b - Software Identification:</strong> Software identification</li>
            <li><strong>c - Remote Source Inclusion:</strong> Remote code execution vulnerabilities</li>
            <li><strong>x - Reverse Tuning Options:</strong> Content manipulation vulnerabilities</li>
          </ul>
          
          <h3>Nikto Output Formats</h3>
          <ul className="module-usage-list">
            <li><span className="usage-title">Text (TXT)</span> <span className="usage-desc">Plain text format simple output, readable in terminal</span></li>
            <li><span className="usage-title">HTML</span> <span className="usage-desc">Visually formatted report viewable in browser</span></li>
            <li><span className="usage-title">CSV</span> <span className="usage-desc">Comma-separated values, suitable for tabulation and data processing</span></li>
            <li><span className="usage-title">XML</span> <span className="usage-desc">Machine-readable format for integration with other tools</span></li>
            <li><span className="usage-title">NSR (NetSparker)</span> <span className="usage-desc">Format compatible with NetSparker scanner</span></li>
            <li><span className="usage-title">JSON</span> <span className="usage-desc">JavaScript Object Notation format for integration with web applications and APIs</span></li>
          </ul>
          
          
          <h3>Advantages and Limitations of Nikto</h3>
          <div className="feature-cards" style={{
            display: 'flex', 
            justifyContent: 'center', 
            gap: '16px',
            margin: '24px auto',
            maxWidth: '900px'
          }}>
            <div className="feature-card" style={{flex: 1, maxWidth: '440px'}}>
              <div className="feature-card-icon">✅</div>
              <h4 className="feature-card-title">Advantages</h4>
              <p className="feature-card-description">
                - Fast and comprehensive scanning<br />
                - Easy to use and simple syntax<br />
                - Rich database<br />
                - Active community support<br />
                - Multiple report formats<br />
                - Pre-installed in Kali Linux
              </p>
            </div>
            
            <div className="feature-card" style={{flex: 1, maxWidth: '440px'}}>
              <div className="feature-card-icon">⚠️</div>
              <h4 className="feature-card-title">Limitations</h4>
              <p className="feature-card-description">
                - Can generate noisy traffic<br />
                - Can be easily detected by some WAFs<br />
                - Cannot perform comprehensive application logic tests<br />
                - Perl dependency<br />
                - Performance issues<br />
                - High rate of false positive results
              </p>
            </div>
          </div>
          
          <h3>Nikto Integrations</h3>
          <p>
            Nikto can work integrated with various security tools and platforms:
          </p>
          <ul className="module-features-list">
            <li><strong>Metasploit Framework:</strong> Nikto scans can be run from within Metasploit</li>
            <li><strong>OWASP ZAP:</strong> Nikto scans can be performed through ZAP</li>
            <li><strong>OpenVAS:</strong> Integration can be provided for comprehensive vulnerability scans</li>
            <li><strong>Jenkins:</strong> Security tests can be added to CI/CD pipelines</li>
            <li><strong>Docker:</strong> Can be run in containerized environments</li>
            <li><strong>Web Application Security Platforms:</strong> Can be integrated with various solutions</li>
          </ul>
          
          <h3>Nikto vs. Other Web Security Scanners</h3>
          <ul className="module-usage-list">
            <li><span className="usage-title">Nikto</span> <span className="usage-desc">Command-line based, fast, server-focused scanning, basic web vulnerabilities</span></li>
            <li><span className="usage-title">OWASP ZAP</span> <span className="usage-desc">Comprehensive web application security scanner, proxy-based, GUI interface</span></li>
            <li><span className="usage-title">Burp Suite</span> <span className="usage-desc">Professional tool set for web application security, deep analysis capabilities</span></li>
            <li><span className="usage-title">Nessus</span> <span className="usage-desc">General vulnerability scanner, wide scope including web applications</span></li>
            <li><span className="usage-title">w3af</span> <span className="usage-desc">Python-based web application attack and audit framework</span></li>
            <li><span className="usage-title">Wapiti</span> <span className="usage-desc">Black-box web application vulnerability scanner</span></li>
          </ul>
          
          <h3>Evasion Techniques for Nikto</h3>
          <p>
            Nikto has easily detectable signatures by default. You can use the following options to make your scans less conspicuous:
          </p>
          <ul className="module-features-list">
            <li><strong>Random User-Agent (-useragent):</strong> Detection can be made difficult by changing browser identity</li>
            <li><strong>Speed Setting (-delay):</strong> Abnormal traffic traces can be reduced by waiting between requests</li>
            <li><strong>Task Fragmentation (-mutate):</strong> Makes detection difficult by changing scan patterns</li>
            <li><strong>Proxy Usage (-useproxy):</strong> Scanning can be done through proxy instead of direct connection</li>
            <li><strong>Host Header Manipulation (-vhost):</strong> Can appear as different targets by changing host header</li>
            <li><strong>Random URI Encoding (-evasion):</strong> Can bypass IDS/IPS systems by encoding URIs in requests</li>
          </ul>
          
          <h3>Best Practice Recommendations</h3>
          <ol className="module-steps-list">
            <li><span className="step-title">Get Permission</span> <span className="step-desc">Always get legal permission before scanning, never perform unauthorized scans</span></li>
            <li><span className="step-title">Test in Test Environment</span> <span className="step-desc">Try scanning in test environments before running in production environments</span></li>
            <li><span className="step-title">Pay Attention to Timing</span> <span className="step-desc">Reduce system load by scanning during low traffic hours</span></li>
            <li><span className="step-title">Limit Scan Scope</span> <span className="step-desc">Disable unnecessary tests with tuning options</span></li>
            <li><span className="step-title">Verify Results</span> <span className="step-desc">Manually verify findings to eliminate false positives</span></li>
            <li><span className="step-title">Keep Updated</span> <span className="step-desc">Regularly update Nikto and its database</span></li>
            <li><span className="step-title">Store Outputs Securely</span> <span className="step-desc">Store and protect scan outputs securely</span></li>
          </ol>
          
          <h3>Security and Ethical Use</h3>
          <p>
            When using security scanning tools like Nikto, the following ethical principles should be observed:
          </p>
          <ul className="module-features-list">
            <li>Use only on your own systems or systems you have permission to</li>
            <li>Get written permission before scanning and clearly define the scope</li>
            <li>Take care not to damage systems during the scanning process</li>
            <li>Be careful on production systems and avoid causing service interruptions</li>
            <li>Report detected security vulnerabilities responsibly</li>
            <li>Keep scan results confidential and do not share with unauthorized persons</li>
            <li>Be aware of legal responsibilities and possible consequences</li>
          </ul>
          
          <div style={{marginTop: 40, padding: 24, background: '#181f2a', borderRadius: 8, textAlign: 'left'}}>
            <h3 style={{marginBottom: 12, textAlign: 'left'}}>Mini Quiz: Nikto</h3>
            <NiktoMiniQuiz />
          </div>
        </div>
      )
    },
    {
      id: 'hydra',
      title: 'Hydra',
      description: 'A fast network login cracker capable of performing password cracking attacks against various protocols.',
      content: (
        <div className="module-content">
          <h3>What is Hydra?</h3>
          <p>
            Hydra (THC-Hydra) is a fast and flexible network authentication cracking tool that can perform parallel brute force attacks against various network services. Developed by The Hacker's Choice (THC) group, Hydra supports numerous protocols and uses multi-connection techniques to accelerate password cracking operations. It is widely used by penetration testers and security professionals to test the authentication security of systems.
          </p>
          
          <div className="module-image">
            <img src="../photos/hydra.png" alt="Hydra working example" />
            <p className="image-caption">Hydra working view on terminal</p>
          </div>
          
          <h3>Key Features of Hydra</h3>
          <div className="feature-cards">
            <div className="feature-card">
              <div className="feature-card-icon">⚡</div>
              <h4 className="feature-card-title">Multi-Protocol Support</h4>
              <p className="feature-card-description">Ability to attack against more than 50 protocols</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-card-icon">🔄</div>
              <h4 className="feature-card-title">Parallel Processing</h4>
              <p className="feature-card-description">Fast password cracking with multiple simultaneous connections</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-card-icon">📊</div>
              <h4 className="feature-card-title">Flexible Configuration</h4>
              <p className="feature-card-description">Comprehensive tuning options for complex scanning scenarios</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-card-icon">📱</div>
              <h4 className="feature-card-title">Multi-Platform</h4>
              <p className="feature-card-description">Runs on Windows, Linux, macOS and other platforms</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-card-icon">📝</div>
              <h4 className="feature-card-title">Detailed Reporting</h4>
              <p className="feature-card-description">Recording found credentials and results in various formats</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-card-icon">🔌</div>
              <h4 className="feature-card-title">Modular Structure</h4>
              <p className="feature-card-description">Extensible architecture for new protocols</p>
            </div>
          </div>
          
          <h3>Supported Protocols</h3>
          <p>
            Hydra supports a very wide range of protocols. Some of them include:
          </p>
          <ul className="module-features-list">
            <li><strong>Web Protocols:</strong> HTTP(S), HTTP-FORM-GET, HTTP-FORM-POST, HTTP-PROXY</li>
            <li><strong>File Transfer Protocols:</strong> FTP, FTPS, SFTP, SCP</li>
            <li><strong>Email Protocols:</strong> SMTP, SMTPS, IMAP, IMAPS, POP3, POP3S</li>
            <li><strong>Database Protocols:</strong> MySQL, PostgreSQL, MS-SQL, Oracle, MongoDB</li>
            <li><strong>Remote Access Protocols:</strong> SSH, Telnet, rsh, rlogin, VNC, RDP</li>
            <li><strong>Directory Services:</strong> LDAP, LDAP3, SMB/CIFS</li>
            <li><strong>Instant Messaging and Communication:</strong> IRC, XMPP, SIP, Teamspeak, Cisco auth</li>
            <li><strong>Other Protocols:</strong> Cisco AAA, Cisco enable, CVS, Firebird, SNMP, SOCKS5, Subversion</li>
          </ul>
          
          <h3>Hydra Attack Types</h3>
          <ul className="module-usage-list">
            <li><span className="usage-title">Brute Force Attack</span> <span className="usage-desc">Password cracking by trying all possible character combinations</span></li>
            <li><span className="usage-title">Dictionary Attack</span> <span className="usage-desc">Trying common passwords using ready-made word lists</span></li>
            <li><span className="usage-title">Hybrid Attack</span> <span className="usage-desc">Smart cracking strategy combining dictionary and brute force methods</span></li>
            <li><span className="usage-title">Rule-Based Attack</span> <span className="usage-desc">Transforming and diversifying word lists using custom rules</span></li>
          </ul>
          
          <h3>Basic Hydra Commands</h3>
          <div className="code-block">
            <h4>1. FTP Password Cracking</h4>
            <p>hydra -l username -P passwords.txt ftp://192.168.1.1</p>
            <p>Performs brute force attack on FTP server using a specific username and password list.</p>
            
            <h4>2. SSH Password Cracking</h4>
            <p>hydra -L usernames.txt -P passwords.txt ssh://192.168.1.1</p>
            <p>Attacks SSH server using username list and password list.</p>
            
            <h4>3. Web Form Password Cracking</h4>
            <p>hydra -l admin -P passwords.txt 192.168.1.1 http-post-form "/login.php:username=^USER^&password=^PASS^:Invalid login"</p>
            <p>Authentication cracking via web form using POST method. Failed login is detected with "Invalid login" message.</p>
            
            <h4>4. SMTP Password Cracking</h4>
            <p>hydra -l user@domain.com -P passwords.txt smtp://mail.server.com</p>
            <p>Attempt to crack email authentication credentials on SMTP server.</p>
            
            <h4>5. Save Output to File</h4>
            <p>hydra -l admin -P passwords.txt -o results.txt -t 4 ssh://192.168.1.1</p>
            <p>Saves SSH attack results to a file and uses 4 parallel tasks.</p>
            
            <h4>6. Stop on First Success</h4>
            <p>hydra -l admin -P passwords.txt -f -t 4 ftp://192.168.1.1</p>
            <p>Stops scanning when the first valid credentials are found.</p>
            
            <h4>7. IPv6 Support</h4>
            <p>hydra -l admin -P passwords.txt -6 ssh://[2001:db8::1]</p>
            <p>Performs SSH password cracking over IPv6 address.</p>
            
            <h4>8. HTTPS Form Attack</h4>
            <p>hydra -l admin -P passwords.txt https-post-form "URL:form_data:fail_message" target.com</p>
            <p>Attacks a secure form over HTTPS.</p>
          </div>
          
          <h3>Hydra Command Parameters</h3>
          <ul className="module-features-list">
            <li><strong>-l [login]:</strong> Specifies a single username</li>
            <li><strong>-L [file]:</strong> File containing usernames</li>
            <li><strong>-p [pass]:</strong> Specifies a single password</li>
            <li><strong>-P [file]:</strong> File containing passwords</li>
            <li><strong>-C [file]:</strong> File in username:password format</li>
            <li><strong>-e [nsr]:</strong> "n" tries null password, "s" tries username as password, "r" tries reversed username as password</li>
            <li><strong>-M [file]:</strong> Multiple target list</li>
            <li><strong>-o [file]:</strong> Writes output to specified file</li>
            <li><strong>-f:</strong> Stops when first valid credentials are found</li>
            <li><strong>-t [tasks]:</strong> Number of parallel connections</li>
            <li><strong>-w [time]:</strong> Request timeout duration</li>
            <li><strong>-v/-V:</strong> Verbose mode</li>
            <li><strong>-6:</strong> Uses IPv6 addresses</li>
            <li><strong>-s [port]:</strong> Specifies custom port</li>
            <li><strong>-S:</strong> Uses SSL connection</li>
            <li><strong>-m [OPT]:</strong> Protocol-specific additional options</li>
          </ul>
          
          
          <h3>Web Form Attacks</h3>
          <p>
            Hydra uses special formats for attacks against web forms. Web form attack syntax:
          </p>
          <div className="code-block">
            <p>hydra -l username -P passwords.txt target http[s]-post-form "URL:FORM_DATA:FAILED_MESSAGE"</p>
          </div>
          <p>Where:</p>
          <ul className="module-features-list">
            <li><strong>URL:</strong> Path to the form page (/login.php)</li>
            <li><strong>FORM_DATA:</strong> POST data (username=^USER^&password=^PASS^)</li>
            <li><strong>FAILED_MESSAGE:</strong> Failed login indicator (Invalid login)</li>
          </ul>
          <p>
            Hydra uses ^USER^ and ^PASS^ placeholder variables to configure HTTP form attacks. These variables are replaced with actual usernames and passwords during attempts.
          </p>
          
          <h3>xHydra - Graphical Interface</h3>
          <p>
            xHydra is the graphical user interface (GUI) version of Hydra. It is a more user-friendly option for users who don't want to use the command line or deal with complex parameters.
          </p>
          <p>
            xHydra offers the following features:
          </p>
          <ul className="module-features-list">
            <li>Managing all Hydra parameters in a graphical environment</li>
            <li>Saving and loading scan configurations</li>
            <li>Quick target and protocol selection</li>
            <li>Real-time progress tracking</li>
            <li>Visual presentation and export of results</li>
          </ul>
          
          <h3>Hydra Usage Scenarios</h3>
          <ul className="module-usage-list">
            <li><span className="usage-title">Weak Password Audit</span> <span className="usage-desc">Detecting weak and predictable passwords in organizations</span></li>
            <li><span className="usage-title">Penetration Testing</span> <span className="usage-desc">Evaluating authentication vulnerabilities in professional security audits</span></li>
            <li><span className="usage-title">Password Policy Checks</span> <span className="usage-desc">Verifying the effectiveness and implementation of password policies</span></li>
            <li><span className="usage-title">Forgotten Credential Recovery</span> <span className="usage-desc">Attempts to recover forgotten passwords on your own systems</span></li>
            <li><span className="usage-title">Security Training</span> <span className="usage-desc">Creating security awareness by demonstrating the effects of weak passwords</span></li>
          </ul>
          
          <h3>Security Measures Against Hydra</h3>
          <div className="feature-cards" style={{
            display: 'flex', 
            justifyContent: 'center', 
            gap: '16px',
            margin: '24px auto',
            maxWidth: '900px'
          }}>
            <div className="feature-card" style={{flex: 1, maxWidth: '440px'}}>
              <div className="feature-card-icon">🔒</div>
              <h4 className="feature-card-title">Defense Strategies</h4>
              <p className="feature-card-description">
                - Account Lockout: After a certain number of failed attempts<br />
                - IP Blocking: Blocking suspicious IP addresses<br />
                - Rate Limiting: Login attempts allowed in a certain time<br />
                - Two-Factor Authentication (2FA)<br />
                - CAPTCHA: Preventing automated login attempts<br />
                - Fail2Ban: Automatic attack detection and blocking<br />
                - WAF: Using web application firewalls<br />
              </p>
            </div>
            
            <div className="feature-card" style={{flex: 1, maxWidth: '440px'}}>
              <div className="feature-card-icon">🔑</div>
              <h4 className="feature-card-title">Password Security</h4>
              <p className="feature-card-description">
                - Implementing strong password policies<br />
                - Minimum 12+ character length<br />
                - Complex character combinations<br />
                - Regular password changes<br />
                - Password History: Not reusing old passwords<br />
                - Secure password storage (strong hashes)<br />
                - Using password management systems<br />
              </p>
            </div>
          </div>
          
          <h3>Account Lockout Mechanisms</h3>
          <p>
            One of the most effective defense mechanisms against brute force tools like Hydra is account lockout policies. A typical account lockout strategy includes:
          </p>
          <ul className="module-features-list">
            <li><strong>Progressive Delay:</strong> Gradually increasing the time between consecutive failed attempts</li>
            <li><strong>Temporary Lockout:</strong> Locking the account for a certain period after a specified number of failed attempts</li>
            <li><strong>Permanent Lockout:</strong> Lockout requiring administrator intervention for prolonged or repeated attacks</li>
            <li><strong>IP-Based Lockout:</strong> Blocking specific IP addresses when attack patterns are detected</li>
            <li><strong>Session-Based Lockout:</strong> Tracking failed login attempts per browser session</li>
            <li><strong>Risk Analysis:</strong> Analyzing login attempt risk and applying adaptive measures</li>
          </ul>

          
          <h3>Factors Affecting Performance</h3>
          <p>
            Various factors affect Hydra's password cracking speed:
          </p>
          <ul className="module-features-list">
            <li><strong>Thread Count (-t):</strong> Speed increases with more parallel connections, but puts load on target system</li>
            <li><strong>Network Connection:</strong> Latency and bandwidth are effective in attacks on remote systems</li>
            <li><strong>Protocol Efficiency:</strong> Some protocols can be processed faster than others</li>
            <li><strong>Password List Size:</strong> Large password lists require longer time</li>
            <li><strong>Target System Response Time:</strong> How fast the target system responds to each authentication attempt</li>
            <li><strong>Rate Limiting:</strong> Rate limits and security measures applied by the target system</li>
            <li><strong>Hardware Resources:</strong> CPU, memory, and disk I/O, especially important in large list processing</li>
          </ul>
          
          <h3>Ethical and Legal Considerations</h3>
          <p>
            Important ethical and legal points to consider when using password cracking tools like Hydra:
          </p>
          <ul className="module-features-list">
            <li><strong>Legal Permission:</strong> Use only on your own systems or systems with explicit written permission</li>
            <li><strong>Documentation:</strong> Document the testing process, scope, and results</li>
            <li><strong>System Impact:</strong> Evaluate potential effects of attacks on target systems</li>
            <li><strong>Responsibility:</strong> Handle security test results responsibly</li>
            <li><strong>Data Protection:</strong> Securely store and manage discovered credentials</li>
            <li><strong>Legal Consequences:</strong> Unauthorized use can result in serious legal consequences</li>
            <li><strong>Disclosure:</strong> Appropriately inform relevant parties about discovered security vulnerabilities</li>
          </ul>
          
          <h3>Hydra Alternatives</h3>
          <ul className="module-usage-list">
            <li><span className="usage-title">Medusa</span> <span className="usage-desc">Parallel, modular, comprehensive brute force tool with similar protocol support</span></li>
            <li><span className="usage-title">Ncrack</span> <span className="usage-desc">High-speed network authentication cracker from the makers of Nmap</span></li>
            <li><span className="usage-title">Patator</span> <span className="usage-desc">Python-based multi-purpose brute-forcer offering flexibility and modularity</span></li>
            <li><span className="usage-title">Hashcat</span> <span className="usage-desc">Optimized for cracking password hashes, GPU-supported</span></li>
            <li><span className="usage-title">John the Ripper</span> <span className="usage-desc">Versatile password cracker, but hash-focused rather than network</span></li>
            <li><span className="usage-title">Aircrack-ng</span> <span className="usage-desc">Security tool suite focused on wireless networks</span></li>
          </ul>

          
          <div style={{marginTop: 40, padding: 24, background: '#181f2a', borderRadius: 8, textAlign: 'left'}}>
            <h3 style={{marginBottom: 12, textAlign: 'left'}}>Mini Quiz: Hydra</h3>
            <HydraMiniQuiz />
          </div>
        </div>
      )
    },
    {
      id: 'sqlmap',
      title: 'SQLMap',
      description: 'An open-source testing tool that automatically detects and exploits SQL injection vulnerabilities.',
      content: (
        <div className="module-content">
          <h3>What is SQLMap?</h3>
          <p>
            SQLMap is a powerful, open-source penetration testing tool designed to automatically detect and exploit SQL injection (SQLi) vulnerabilities. Written in Python, SQLMap supports various database management systems (DBMS) and uses advanced detection algorithms to find SQL injection vulnerabilities in web applications and exploit these vulnerabilities to gain control of database systems.
          </p>
          
          <div className="module-image">
            <img src="../photos/sqlmap.png" alt="SQLMap scanning" />
            <p className="image-caption">SQLMap in action: A web application SQL injection scan</p>
          </div>
          
          <h3>Key Features of SQLMap</h3>
          <div className="feature-cards">
            <div className="feature-card">
              <div className="feature-card-icon">🔍</div>
              <h4 className="feature-card-title">Automatic Detection</h4>
              <p className="feature-card-description">Automatically detects various types of SQL injection vulnerabilities</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-card-icon">💾</div>
              <h4 className="feature-card-title">Wide DBMS Support</h4>
              <p className="feature-card-description">Supports many database systems and uses specific attack techniques for each</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-card-icon">🔧</div>
              <h4 className="feature-card-title">Advanced Exploitation</h4>
              <p className="feature-card-description">Can perform various operations like data extraction and command execution from detected vulnerabilities</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-card-icon">🧠</div>
              <h4 className="feature-card-title">Smart Scanning</h4>
              <p className="feature-card-description">Offers different levels of scanning depth and can use previous results</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-card-icon">📊</div>
              <h4 className="feature-card-title">Comprehensive Reporting</h4>
              <p className="feature-card-description">Presents information obtained from scanning in detailed reports</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-card-icon">🔌</div>
              <h4 className="feature-card-title">Different Injection Points</h4>
              <p className="feature-card-description">Supports different injection vectors like GET, POST, Cookies, HTTP Headers</p>
            </div>
          </div>
          
          <h3>Supported Database Systems</h3>
          <ul className="module-features-list">
            <li><strong>MySQL</strong> and MariaDB: Most popular open-source database systems</li>
            <li><strong>Oracle</strong>: Popular database system used at enterprise level</li>
            <li><strong>Microsoft SQL Server</strong>: DBMS commonly used on Windows-based systems</li>
            <li><strong>PostgreSQL</strong>: Advanced open-source database system</li>
            <li><strong>SQLite</strong>: Lightweight, file-based database</li>
            <li><strong>IBM DB2</strong>: Enterprise-level database system</li>
            <li><strong>Microsoft Access</strong>: Simple desktop database solution</li>
            <li><strong>Firebird</strong>: Open-source relational database system</li>
            <li><strong>SAP MaxDB</strong>: Database system for enterprise SAP solutions</li>
            <li><strong>Sybase</strong>: Enterprise-scale database system</li>
            <li><strong>HSQLDB</strong>: Java-based database engine</li>
            <li><strong>Informix</strong>: IBM's high-performance database system</li>
          </ul>
          
          
          <h3>SQL Injection Attack Types</h3>
          <ul className="module-usage-list">
            <li><span className="usage-title">Boolean-based Blind</span> <span className="usage-desc">Information extraction with queries returning TRUE or FALSE results</span></li>
            <li><span className="usage-title">Time-based Blind</span> <span className="usage-desc">Information extraction by analyzing changes in server response time based on query results</span></li>
            <li><span className="usage-title">Error-based</span> <span className="usage-desc">Information leakage using database error messages</span></li>
            <li><span className="usage-title">UNION Query-based</span> <span className="usage-desc">Combining multiple queries using the UNION SQL operator and querying different tables</span></li>
            <li><span className="usage-title">Stacked Queries</span> <span className="usage-desc">Running multiple SQL queries simultaneously by separating them with semicolons</span></li>
            <li><span className="usage-title">Out-of-band</span> <span className="usage-desc">Data extraction techniques through alternative channels (DNS, HTTP)</span></li>
          </ul>
          
          <h3>Basic SQLMap Commands</h3>
          <div className="code-block">
            <h4>1. Basic URL Scanning</h4>
            <p>sqlmap -u "http://example.com/page.php?id=1"</p>
            <p>Scans for SQL injection vulnerabilities on the specified URL.</p>
            
            <h4>2. Database List</h4>
            <p>sqlmap -u "http://example.com/page.php?id=1" --dbs</p>
            <p>Used to list databases on the target system.</p>
            
            <h4>3. Table List</h4>
            <p>sqlmap -u "http://example.com/page.php?id=1" -D database_name --tables</p>
            <p>Lists tables in the specified database.</p>
            
            <h4>4. Column List</h4>
            <p>sqlmap -u "http://example.com/page.php?id=1" -D database_name -T table_name --columns</p>
            <p>Displays columns in the specified table.</p>
            
            <h4>5. Data Extraction</h4>
            <p>sqlmap -u "http://example.com/page.php?id=1" -D database_name -T table_name -C column1,column2 --dump</p>
            <p>Extracts data from specified columns.</p>
            
            <h4>6. Extract Entire Database</h4>
            <p>sqlmap -u "http://example.com/page.php?id=1" --dump-all</p>
            <p>Extracts data from all accessible databases.</p>
            
            <h4>7. Obtaining Operating System Shell</h4>
            <p>sqlmap -u "http://example.com/page.php?id=1" --os-shell</p>
            <p>Attempts to obtain an OS shell to execute commands on the target system.</p>
            
            <h4>8. Scanning with HTTP POST Method</h4>
            <p>sqlmap -u "http://example.com/login.php" --data="username=test&password=test"</p>
            <p>Searches for SQL injection vulnerabilities in POST parameters.</p>
            
            <h4>9. Scanning via Cookies</h4>
            <p>sqlmap -u "http://example.com/page.php" --cookie="PHPSESSID=1234567890abcdef"</p>
            <p>Searches for SQL injection vulnerabilities in cookie values.</p>
            
            <h4>10. Scanning Specific Parameter</h4>
            <p>sqlmap -u "http://example.com/page.php?id=1&page=2" -p id</p>
            <p>Searches for SQL injection vulnerabilities only in the specified parameter (id).</p>
          </div>

          
          <h3>Advanced SQLMap Parameters</h3>
          <ul className="module-features-list">
            <li><strong>--level=N</strong>: Sets the scanning level (1-5, default: 1)</li>
            <li><strong>--risk=N</strong>: Sets the risk level (1-3, default: 1)</li>
            <li><strong>--technique=TECH</strong>: Specifies injection techniques to use (B: Boolean, E: Error, U: Union, S: Stacked, T: Time)</li>
            <li><strong>--batch</strong>: Non-interactive mode, uses default answers to all questions</li>
            <li><strong>--random-agent</strong>: Uses random User-Agent header</li>
            <li><strong>--proxy=PROXY</strong>: Connects using HTTP(S) proxy</li>
            <li><strong>--tor</strong>: Connects through Tor network</li>
            <li><strong>--delay=N</strong>: Sets delay between requests in seconds</li>
            <li><strong>--timeout=N</strong>: Sets request timeout value in seconds</li>
            <li><strong>--threads=N</strong>: Sets number of concurrent HTTP(S) requests</li>
            <li><strong>--dbms=DBMS</strong>: Speeds up scanning by specifying database type</li>
            <li><strong>--tamper=TAMPER</strong>: Uses tamper scripts to modify SQL injection payloads</li>
          </ul>
          
          <h3>Tamper Scripts</h3>
          <p>
            SQLMap uses tamper scripts to bypass WAF (Web Application Firewall) and other security measures. These scripts modify SQL injection payloads to make them harder to detect. Some common tamper scripts:
          </p>
          <ul className="module-features-list">
            <li><strong>space2comment</strong>: Replaces spaces with comment marks</li>
            <li><strong>space2dash</strong>: Replaces spaces with dashes and comment marks</li>
            <li><strong>charencode</strong>: Applies URL encoding</li>
            <li><strong>randomcase</strong>: Uses random upper-lower case in SQL keywords</li>
            <li><strong>versionedmorekeywords</strong>: Adapts SQL keywords for older database versions</li>
            <li><strong>modsecurityversioned</strong>: Makes changes to bypass ModSecurity WAF</li>
            <li><strong>base64encode</strong>: Encodes payloads with Base64</li>
          </ul>
          <p>Multiple scripts can be chained by separating them with commas:</p>
          <div className="code-block">
            <p>sqlmap -u "http://example.com/page.php?id=1" --tamper=space2comment,randomcase,between</p>
          </div>
          
          
          <h3>Injection Vectors</h3>
          <ul className="module-usage-list">
            <li><span className="usage-title">GET Parameters</span> <span className="usage-desc">Parameters in URL (e.g., page.php?id=1)</span></li>
            <li><span className="usage-title">POST Parameters</span> <span className="usage-desc">Parameters sent as form data</span></li>
            <li><span className="usage-title">HTTP Headers</span> <span className="usage-desc">Headers like User-Agent, Referer, X-Forwarded-For</span></li>
            <li><span className="usage-title">Cookie Values</span> <span className="usage-desc">Values stored in cookies</span></li>
            <li><span className="usage-title">HTTP Authentication</span> <span className="usage-desc">Basic and Digest authentication credentials</span></li>
            <li><span className="usage-title">JSON/XML Body</span> <span className="usage-desc">Data sent in JSON or XML format</span></li>
            <li><span className="usage-title">Multipart Forms</span> <span className="usage-desc">File upload forms and multipart/form-data content</span></li>
          </ul>
          
          <h3>SQLMap Features and Usage Scenarios</h3>
          <ul className="module-features-list">
            <li><strong>Automatic Form Detection</strong>: Automatically detects and scans forms on web pages</li>
            <li><strong>Crawler Support</strong>: Automatically crawls the website and detects potential injection points</li>
            <li><strong>Wizard Mode</strong>: Performs SQL injection scanning using simple commands with an interactive wizard</li>
            <li><strong>Data Dictionary Extraction</strong>: Extracts structural information like database schema, users, privileges</li>
            <li><strong>Password Hash Cracking</strong>: Attempts to crack extracted password hashes by sending to online services or using local dictionaries</li>
            <li><strong>File System Access</strong>: Performs file read/write operations using database features</li>
            <li><strong>Windows Registry Access</strong>: Provides access to Windows registry values through MS SQL Server</li>
            <li><strong>Database Takeover</strong>: Attempts to completely control the database management system</li>
          </ul>
          
          <div className="module-image">
            <img src="../photos/sqlmap-schema.png" alt="SQLMap database schema" />
            <p className="image-caption">Example of a database schema extracted with SQLMap</p>
          </div>
          
          <h3>Web-Based Interfaces</h3>
          <p>
            SQLMap is typically used via command line, but various web-based interfaces are also available:
          </p>
          <ul className="module-features-list">
            <li><strong>SQLMap-Web-GUI</strong>: Simple web-based interface</li>
            <li><strong>OWASP ZAP Integration</strong>: Running SQLMap from within ZAP security tool</li>
            <li><strong>ModSecurity Console</strong>: Integration with ModSecurity</li>
            <li><strong>Damn Vulnerable Web App (DVWA)</strong>: SQLMap practice for educational purposes</li>
          </ul>
          
          <h3>Protection Against Threats Created by SQLMap</h3>
          <div className="feature-cards" style={{
            display: 'flex', 
            justifyContent: 'center', 
            gap: '16px',
            margin: '24px auto',
            maxWidth: '900px'
          }}>
            <div className="feature-card" style={{flex: 1, maxWidth: '440px'}}>
              <div className="feature-card-icon">🔒</div>
              <h4 className="feature-card-title">Security Measures</h4>
              <p className="feature-card-description">
                - Use parameterized queries (Prepared Statements)<br />
                - Use ORM (Object-Relational Mapping) systems<br />
                - Validate and sanitize user inputs<br />
                - Give database users minimum required permissions<br />
                - Use WAF (Web Application Firewall)<br />
                - Hide error messages in production environment<br />
                - Perform regular security tests
              </p>
            </div>
            
            <div className="feature-card" style={{flex: 1, maxWidth: '440px'}}>
              <div className="feature-card-icon">📋</div>
              <h4 className="feature-card-title">Detection Methods</h4>
              <p className="feature-card-description">
                - WAF rules that recognize SQLMap signatures<br />
                - Detection of abnormal query patterns<br />
                - Monitoring request frequency and patterns<br />
                - Checking headers like User-Agent, Referer<br />
                - Abnormal database activity detection with SIEM systems<br />
                - IP-based blocking systems<br />
                - Rate limiting (request count restrictions)
              </p>
            </div>
          </div>
          
          <h3>Parameterized Query Example</h3>
          <p>
            One of the most effective defense methods against SQL injection attacks is using parameterized queries. Below are parameterized query examples in different programming languages:
          </p>
          <div className="code-block">
            <h4>PHP (PDO)</h4>
            <p>$stmt = $pdo->prepare("SELECT * FROM users WHERE username = :username");</p>
            <p>$stmt->bindParam(':username', $username);</p>
            <p>$stmt->execute();</p>
            
            <h4>Python (psycopg2)</h4>
            <p>cursor.execute("SELECT * FROM users WHERE username = %s", (username,))</p>
            
            <h4>Java (PreparedStatement)</h4>
            <p>PreparedStatement stmt = conn.prepareStatement("SELECT * FROM users WHERE username = ?");</p>
            <p>stmt.setString(1, username);</p>
            <p>ResultSet rs = stmt.executeQuery();</p>
            
            <h4>C# (.NET)</h4>
            <p>using (SqlCommand cmd = new SqlCommand("SELECT * FROM users WHERE username = @username", conn))</p>
          </div>
          
          <h3>Ethical Use of SQLMap</h3>
          <p>
            SQLMap is a powerful security testing tool and should only be used for ethical purposes:
          </p>
          <ul className="module-features-list">
            <li>Use only on systems you have permission for or on your own systems</li>
            <li>Get written permission before testing and clearly define the scope of testing</li>
            <li>Take care not to damage real data during scanning and testing</li>
            <li>Be careful in production environments and work in test environments when possible</li>
            <li>Avoid illegal activities such as unauthorized data extraction or gaining access to systems</li>
            <li>Report discovered security vulnerabilities responsibly</li>
            <li>Store scanning results and extracted data securely</li>
          </ul>
          
          <h3>SQLMap Alternatives</h3>
          <ul className="module-usage-list">
            <li><span className="usage-title">NoSQLMap</span> <span className="usage-desc">Similar tool that detects injection vulnerabilities in NoSQL databases like MongoDB</span></li>
            <li><span className="usage-title">SQLiX</span> <span className="usage-desc">Perl-based alternative tool that detects SQL injection vulnerabilities</span></li>
            <li><span className="usage-title">jSQL Injection</span> <span className="usage-desc">Java-based SQL injection testing tool</span></li>
            <li><span className="usage-title">SQLninja</span> <span className="usage-desc">Microsoft SQL Server focused injection attack tool</span></li>
            <li><span className="usage-title">Havij</span> <span className="usage-desc">Commercial, user-friendly SQL injection tool (no longer developed)</span></li>
            <li><span className="usage-title">Burp Suite (SQL Injection Scanner)</span> <span className="usage-desc">SQL injection module of comprehensive security testing tool</span></li>
          </ul>
          
          <div style={{marginTop: 40, padding: 24, background: '#181f2a', borderRadius: 8, textAlign: 'left'}}>
            <h3 style={{marginBottom: 12, textAlign: 'left'}}>Mini Quiz: SQLMap</h3>
            <SQLMapMiniQuiz />
          </div>
        </div>
      )
    }
  ];

  return (
    <>
      <Header onTrainingModuleClick={() => {
        setActiveModule(null);
        navigate('/training-module');
      }} />
      <div className="training-module">
        <div className="module-header">
          <h2>Training Module</h2>
          <p>
          Select a topic below to learn about cyber security tools.
          </p>
        </div>

        <div className="module-container">
          <div className="module-sidebar">
            <h3>Training Topics</h3>
            <ul className="module-list">
              {modules.map((module) => (
                <li
                  key={module.id}
                  className={activeModule === module.id ? "active" : ""}
                  onClick={() => handleModuleChange(module.id)}
                >
                  <div className="module-item">
                    <h4>{module.title}</h4>
                    <p>{module.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="module-display">
            {activeModule ? (
              modules.find((m) => m.id === activeModule)?.content
            ) : (
              <div className="module-welcome">
                <h3>Welcome to Cyber Security Training Module</h3>
                <div className="cybersecurity-intro">
                  <div className="intro-card">
                    <div className="intro-icon">🛡️</div>
                    <h4>What is Cybersecurity?</h4>
                    <p>
                      Cybersecurity is the process of protecting computer systems, networks, software, and data against unauthorized access, attacks, damage, or data theft. With the increasing digitalization today, the number and variety of cyber attacks have also increased. Therefore, cybersecurity is of critical importance for individuals, institutions, and governments.
                    </p>
                  </div>
                  
                  <div className="intro-card">
                    <div className="intro-icon">🎯</div>
                    <h4>What is the Purpose of Cybersecurity?</h4>
                    <p>
                      The main purpose of cybersecurity is to protect the confidentiality, integrity, and accessibility of information. Additionally, ensuring business continuity, preventing data loss, and taking quick measures against cyber threats are among the main objectives of cybersecurity.
                    </p>
                  </div>
                  
                  <div className="intro-card">
                    <div className="intro-icon">⚔️</div>
                    <h4>Common Cyber Threats</h4>
                    <p>
                      Modern cyber threats include malware, phishing attacks, ransomware, DDoS attacks, social engineering, and advanced persistent threats (APTs). Understanding these threats is essential for developing effective defense strategies and maintaining robust security postures.
                    </p>
                  </div>
                  
                  <div className="intro-card">
                    <div className="intro-icon">📚</div>
                    <h4>What Can You Find on This Platform?</h4>
                    <p>
                      From the menu on the left, you can access detailed information about tools commonly used in cybersecurity, learn what each tool does, how to use it, and its basic commands. You can develop yourself in the field of cybersecurity by examining the training modules.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

  function SQLMapMiniQuiz() {
    const navigate = useNavigate();
    const [selected, setSelected] = React.useState(null);
    const [showSuccess, setShowSuccess] = React.useState(false);
    const [showModal, setShowModal] = React.useState(false);
    
    const handleSubmit = (e) => {
      e.preventDefault();
      if (selected === "C") {
        setShowSuccess(true);
        setTimeout(() => {
          navigate("/quizzes");
        }, 1000);
      } else {
        setShowModal(true);
        setShowSuccess(false);
      }
    };
    
    return (
      <>
        <form onSubmit={handleSubmit} style={{textAlign: 'left'}}>
          <div style={{marginBottom: 12}}>
            <b>Which parameter is used in SQLMap to list tables in a database?</b>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
            <label style={{textAlign: 'left'}}><input type="radio" name="sqlmapq" value="A" checked={selected==="A"} onChange={()=>setSelected("A")} /> A) --list-tables</label>
            <label style={{textAlign: 'left'}}><input type="radio" name="sqlmapq" value="B" checked={selected==="B"} onChange={()=>setSelected("B")} /> B) --show-tables</label>
            <label style={{textAlign: 'left'}}><input type="radio" name="sqlmapq" value="C" checked={selected==="C"} onChange={()=>setSelected("C")} /> C) --tables</label>
            <label style={{textAlign: 'left'}}><input type="radio" name="sqlmapq" value="D" checked={selected==="D"} onChange={()=>setSelected("D")} /> D) --enum-tables</label>
          </div>
          <button type="submit" style={{marginTop: 16, background: '#10B981', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer'}}>Submit Answer</button>
          {showSuccess && <div style={{color: '#10B981', marginTop: 12}}>Correct! Redirecting to Quiz Page...</div>}
        </form>
        {showModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}>
            <div style={{background: '#181f2a', color: '#fff', padding: 32, borderRadius: 12, minWidth: 320, textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.2)'}}>
              <div style={{fontSize: 18, marginBottom: 16}}>Your answer is incorrect.</div>
              <div style={{marginBottom: 24}}>We recommend reviewing the training material again.</div>
              <button onClick={()=>setShowModal(false)} style={{background: '#10B981', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 24px', fontWeight: 'bold', cursor: 'pointer'}}>Close</button>
            </div>
          </div>
        )}
      </>
    );
  }

  function HydraMiniQuiz() {
    const navigate = useNavigate();
    const [selected, setSelected] = React.useState(null);
    const [showSuccess, setShowSuccess] = React.useState(false);
    const [showModal, setShowModal] = React.useState(false);
    
    const handleSubmit = (e) => {
      e.preventDefault();
      if (selected === "B") {
        setShowSuccess(true);
        setTimeout(() => {
          navigate("/quizzes");
        }, 1000);
      } else {
        setShowModal(true);
        setShowSuccess(false);
      }
    };
    
    return (
      <>
        <form onSubmit={handleSubmit} style={{textAlign: 'left'}}>
          <div style={{marginBottom: 12}}>
            <b>Which parameter is used in Hydra to specify the number of parallel connections?</b>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
            <label style={{textAlign: 'left'}}><input type="radio" name="hydraq" value="A" checked={selected==="A"} onChange={()=>setSelected("A")} /> A) -p</label>
            <label style={{textAlign: 'left'}}><input type="radio" name="hydraq" value="B" checked={selected==="B"} onChange={()=>setSelected("B")} /> B) -t</label>
            <label style={{textAlign: 'left'}}><input type="radio" name="hydraq" value="C" checked={selected==="C"} onChange={()=>setSelected("C")} /> C) -c</label>
            <label style={{textAlign: 'left'}}><input type="radio" name="hydraq" value="D" checked={selected==="D"} onChange={()=>setSelected("D")} /> D) -m</label>
          </div>
          <button type="submit" style={{marginTop: 16, background: '#10B981', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer'}}>Submit Answer</button>
          {showSuccess && <div style={{color: '#10B981', marginTop: 12}}>Correct! Redirecting to Quiz Page...</div>}
        </form>
        {showModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}>
            <div style={{background: '#181f2a', color: '#fff', padding: 32, borderRadius: 12, minWidth: 320, textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.2)'}}>
              <div style={{fontSize: 18, marginBottom: 16}}>Your answer is incorrect.</div>
              <div style={{marginBottom: 24}}>We recommend reviewing the training material again.</div>
              <button onClick={()=>setShowModal(false)} style={{background: '#10B981', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 24px', fontWeight: 'bold', cursor: 'pointer'}}>Close</button>
            </div>
          </div>
        )}
      </>
    );
  }

  function NiktoMiniQuiz() {
    const navigate = useNavigate();
    const [selected, setSelected] = React.useState(null);
    const [showSuccess, setShowSuccess] = React.useState(false);
    const [showModal, setShowModal] = React.useState(false);
    
    const handleSubmit = (e) => {
      e.preventDefault();
      if (selected === "A") {
        setShowSuccess(true);
        setTimeout(() => {
          navigate("/quizzes");
        }, 1000);
      } else {
        setShowModal(true);
        setShowSuccess(false);
      }
    };
    
    return (
      <>
        <form onSubmit={handleSubmit} style={{textAlign: 'left'}}>
          <div style={{marginBottom: 12}}>
            <b>The Nikto tool is primarily designed to perform security scanning on which type of systems?</b>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
            <label style={{textAlign: 'left'}}><input type="radio" name="niktoq" value="A" checked={selected==="A"} onChange={()=>setSelected("A")} /> A) Web servers</label>
            <label style={{textAlign: 'left'}}><input type="radio" name="niktoq" value="B" checked={selected==="B"} onChange={()=>setSelected("B")} /> B) Database servers</label>
            <label style={{textAlign: 'left'}}><input type="radio" name="niktoq" value="C" checked={selected==="C"} onChange={()=>setSelected("C")} /> C) Network devices</label>
            <label style={{textAlign: 'left'}}><input type="radio" name="niktoq" value="D" checked={selected==="D"} onChange={()=>setSelected("D")} /> D) Email servers</label>
          </div>
          <button type="submit" style={{marginTop: 16, background: '#10B981', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer'}}>Submit Answer</button>
          {showSuccess && <div style={{color: '#10B981', marginTop: 12}}>Correct! Redirecting to Quiz Page...</div>}
        </form>
        {showModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}>
            <div style={{background: '#181f2a', color: '#fff', padding: 32, borderRadius: 12, minWidth: 320, textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.2)'}}>
              <div style={{fontSize: 18, marginBottom: 16}}>Your answer is incorrect.</div>
              <div style={{marginBottom: 24}}>We recommend reviewing the training material again.</div>
              <button onClick={()=>setShowModal(false)} style={{background: '#10B981', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 24px', fontWeight: 'bold', cursor: 'pointer'}}>Close</button>
            </div>
          </div>
        )}
      </>
    );
  }


  function SnortMiniQuiz() {
    const navigate = useNavigate();
    const [selected, setSelected] = React.useState(null);
    const [showSuccess, setShowSuccess] = React.useState(false);
    const [showModal, setShowModal] = React.useState(false);
    
    const handleSubmit = (e) => {
      e.preventDefault();
      if (selected === "C") {
        setShowSuccess(true);
        setTimeout(() => {
          navigate("/quizzes");
        }, 1000);
      } else {
        setShowModal(true);
        setShowSuccess(false);
      }
    };
    
    return (
      <>
        <form onSubmit={handleSubmit} style={{textAlign: 'left'}}>
          <div style={{marginBottom: 12}}>
            <b>Which mode of Snort actively blocks traffic that is detected as malicious?</b>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
            <label style={{textAlign: 'left'}}><input type="radio" name="snortq" value="A" checked={selected==="A"} onChange={()=>setSelected("A")} /> A) Sniffer mode</label>
            <label style={{textAlign: 'left'}}><input type="radio" name="snortq" value="B" checked={selected==="B"} onChange={()=>setSelected("B")} /> B) Packet logger mode</label>
            <label style={{textAlign: 'left'}}><input type="radio" name="snortq" value="C" checked={selected==="C"} onChange={()=>setSelected("C")} /> C) NIPS mode</label>
            <label style={{textAlign: 'left'}}><input type="radio" name="snortq" value="D" checked={selected==="D"} onChange={()=>setSelected("D")} /> D) NIDS mode</label>
          </div>
          <button type="submit" style={{marginTop: 16, background: '#10B981', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer'}}>Submit Answer</button>
          {showSuccess && <div style={{color: '#10B981', marginTop: 12}}>Correct! Redirecting to Quiz Page...</div>}
        </form>
        {showModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}>
            <div style={{background: '#181f2a', color: '#fff', padding: 32, borderRadius: 12, minWidth: 320, textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.2)'}}>
              <div style={{fontSize: 18, marginBottom: 16}}>Your answer is incorrect.</div>
              <div style={{marginBottom: 24}}>We recommend reviewing the training material again.</div>
              <button onClick={()=>setShowModal(false)} style={{background: '#10B981', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 24px', fontWeight: 'bold', cursor: 'pointer'}}>Close</button>
            </div>
          </div>
        )}
      </>
    );
  }


  function NessusMiniQuiz() {
    const navigate = useNavigate();
    const [selected, setSelected] = React.useState(null);
    const [showSuccess, setShowSuccess] = React.useState(false);
    const [showModal, setShowModal] = React.useState(false);
    
    const handleSubmit = (e) => {
      e.preventDefault();
      if (selected === "C") {
        setShowSuccess(true);
        setTimeout(() => {
          navigate("/quizzes");
        }, 1000);
      } else {
        setShowModal(true);
        setShowSuccess(false);
      }
    };
    
    return (
      <>
        <form onSubmit={handleSubmit} style={{textAlign: 'left'}}>
          <div style={{marginBottom: 12}}>
            <b>Which risk category indicates the highest priority for vulnerabilities found in Nessus scan results?</b>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
            <label style={{textAlign: 'left'}}><input type="radio" name="nessusq" value="A" checked={selected==="A"} onChange={()=>setSelected("A")} /> A) High</label>
            <label style={{textAlign: 'left'}}><input type="radio" name="nessusq" value="B" checked={selected==="B"} onChange={()=>setSelected("B")} /> B) Severe</label>
            <label style={{textAlign: 'left'}}><input type="radio" name="nessusq" value="C" checked={selected==="C"} onChange={()=>setSelected("C")} /> C) Critical</label>
            <label style={{textAlign: 'left'}}><input type="radio" name="nessusq" value="D" checked={selected==="D"} onChange={()=>setSelected("D")} /> D) Emergency</label>
          </div>
          <button type="submit" style={{marginTop: 16, background: '#10B981', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer'}}>Submit Answer</button>
          {showSuccess && <div style={{color: '#10B981', marginTop: 12}}>Correct! Redirecting to Quiz Page...</div>}
        </form>
        {showModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}>
            <div style={{background: '#181f2a', color: '#fff', padding: 32, borderRadius: 12, minWidth: 320, textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.2)'}}>
              <div style={{fontSize: 18, marginBottom: 16}}>Your answer is incorrect.</div>
              <div style={{marginBottom: 24}}>We recommend reviewing the training material again.</div>
              <button onClick={()=>setShowModal(false)} style={{background: '#10B981', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 24px', fontWeight: 'bold', cursor: 'pointer'}}>Close</button>
            </div>
          </div>
        )}
      </>
    );
  }

  function JohnTheRipperMiniQuiz() {
    const navigate = useNavigate();
    const [selected, setSelected] = React.useState(null);
    const [showSuccess, setShowSuccess] = React.useState(false);
    const [showModal, setShowModal] = React.useState(false);
    
    const handleSubmit = (e) => {
      e.preventDefault();
      if (selected === "C") {
        setShowSuccess(true);
        setTimeout(() => {
          navigate("/quizzes");
        }, 1000);
      } else {
        setShowModal(true);
        setShowSuccess(false);
      }
    };
    
    return (
      <>
        <form onSubmit={handleSubmit} style={{textAlign: 'left'}}>
          <div style={{marginBottom: 12}}>
            <b>Which of John the Ripper's basic password cracking modes attempts to crack passwords using a word list?</b>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
            <label style={{textAlign: 'left'}}><input type="radio" name="johnq" value="A" checked={selected==="A"} onChange={()=>setSelected("A")} /> A) Incremental mode</label>
            <label style={{textAlign: 'left'}}><input type="radio" name="johnq" value="B" checked={selected==="B"} onChange={()=>setSelected("B")} /> B) External mode</label>
            <label style={{textAlign: 'left'}}><input type="radio" name="johnq" value="C" checked={selected==="C"} onChange={()=>setSelected("C")} /> C) Wordlist mode</label>
            <label style={{textAlign: 'left'}}><input type="radio" name="johnq" value="D" checked={selected==="D"} onChange={()=>setSelected("D")} /> D) Single mode</label>
          </div>
          <button type="submit" style={{marginTop: 16, background: '#10B981', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer'}}>Submit Answer</button>
          {showSuccess && <div style={{color: '#10B981', marginTop: 12}}>Correct! Redirecting to Quiz Page...</div>}
        </form>
        {showModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}>
            <div style={{background: '#181f2a', color: '#fff', padding: 32, borderRadius: 12, minWidth: 320, textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.2)'}}>
              <div style={{fontSize: 18, marginBottom: 16}}>Your answer is incorrect.</div>
              <div style={{marginBottom: 24}}>We recommend reviewing the training material again.</div>
              <button onClick={()=>setShowModal(false)} style={{background: '#10B981', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 24px', fontWeight: 'bold', cursor: 'pointer'}}>Close</button>
            </div>
          </div>
        )}
      </>
    );
  }



  function MetasploitMiniQuiz() {
    const navigate = useNavigate();
    const [selected, setSelected] = React.useState(null);
    const [showSuccess, setShowSuccess] = React.useState(false);
    const [showModal, setShowModal] = React.useState(false);
    
    const handleSubmit = (e) => {
      e.preventDefault();
      if (selected === "B") {
        setShowSuccess(true);
        setTimeout(() => {
          navigate("/quizzes");
        }, 1000);
      } else {
        setShowModal(true);
        setShowSuccess(false);
      }
    };
    
    return (
      <>
        <form onSubmit={handleSubmit} style={{textAlign: 'left'}}>
          <div style={{marginBottom: 12}}>
            <b>In Metasploit Framework, what is the name given to the piece of code that runs on the target system after an exploit is executed?</b>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
            <label style={{textAlign: 'left'}}><input type="radio" name="metasploitq" value="A" checked={selected==="A"} onChange={()=>setSelected("A")} /> A) Shellcode</label>
            <label style={{textAlign: 'left'}}><input type="radio" name="metasploitq" value="B" checked={selected==="B"} onChange={()=>setSelected("B")} /> B) Payload</label>
            <label style={{textAlign: 'left'}}><input type="radio" name="metasploitq" value="C" checked={selected==="C"} onChange={()=>setSelected("C")} /> C) Exploit</label>
            <label style={{textAlign: 'left'}}><input type="radio" name="metasploitq" value="D" checked={selected==="D"} onChange={()=>setSelected("D")} /> D) Auxiliary</label>
          </div>
          <button type="submit" style={{marginTop: 16, background: '#10B981', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer'}}>Submit Answer</button>
          {showSuccess && <div style={{color: '#10B981', marginTop: 12}}>Correct! Redirecting to Quiz Page...</div>}
        </form>
        {showModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}>
            <div style={{background: '#181f2a', color: '#fff', padding: 32, borderRadius: 12, minWidth: 320, textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.2)'}}>
              <div style={{fontSize: 18, marginBottom: 16}}>Your answer is incorrect.</div>
              <div style={{marginBottom: 24}}>We recommend reviewing the training material again.</div>
              <button onClick={()=>setShowModal(false)} style={{background: '#10B981', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 24px', fontWeight: 'bold', cursor: 'pointer'}}>Close</button>
            </div>
          </div>
        )}
      </>
    );
  }

  function NmapMiniQuiz() {
    const navigate = useNavigate();
    const [selected, setSelected] = React.useState(null);
    const [showSuccess, setShowSuccess] = React.useState(false);
    const [showModal, setShowModal] = React.useState(false);
    
    const handleSubmit = (e) => {
      e.preventDefault();
      if (selected === "D") {
        setShowSuccess(true);
        setTimeout(() => {
          navigate("/quizzes");
        }, 1000);
      } else {
        setShowModal(true);
        setShowSuccess(false);
      }
    };
    
    return (
      <>
        <form onSubmit={handleSubmit} style={{textAlign: 'left'}}>
          <div style={{marginBottom: 12}}>
            <b>Which command is used with Nmap to detect open ports on a system?</b>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
            <label style={{textAlign: 'left'}}><input type="radio" name="nmapq" value="A" checked={selected==="A"} onChange={()=>setSelected("A")} /> A) nmap -sV</label>
            <label style={{textAlign: 'left'}}><input type="radio" name="nmapq" value="B" checked={selected==="B"} onChange={()=>setSelected("B")} /> B) nmap -O</label>
            <label style={{textAlign: 'left'}}><input type="radio" name="nmapq" value="C" checked={selected==="C"} onChange={()=>setSelected("C")} /> C) nmap -p-</label>
            <label style={{textAlign: 'left'}}><input type="radio" name="nmapq" value="D" checked={selected==="D"} onChange={()=>setSelected("D")} /> D) nmap -sS</label>
          </div>
          <button type="submit" style={{marginTop: 16, background: '#10B981', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer'}}>Submit Answer</button>
          {showSuccess && <div style={{color: '#10B981', marginTop: 12}}>Correct! Redirecting to Quiz Page...</div>}
        </form>
        {showModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}>
            <div style={{background: '#181f2a', color: '#fff', padding: 32, borderRadius: 12, minWidth: 320, textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.2)'}}>
              <div style={{fontSize: 18, marginBottom: 16}}>Your answer is incorrect.</div>
              <div style={{marginBottom: 24}}>We recommend reviewing the training material again.</div>
              <button onClick={()=>setShowModal(false)} style={{background: '#10B981', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 24px', fontWeight: 'bold', cursor: 'pointer'}}>Close</button>
            </div>
          </div>
        )}
      </>
    );
  }

  function WiresharkMiniQuiz() {
    const navigate = useNavigate();
    const [selected, setSelected] = React.useState(null);
    const [showSuccess, setShowSuccess] = React.useState(false);
    const [showModal, setShowModal] = React.useState(false);
    
    const handleSubmit = (e) => {
      e.preventDefault();
      if (selected === "D") {
        setShowSuccess(true);
        setTimeout(() => {
          navigate("/quizzes");
        }, 1000);
      } else {
        setShowModal(true);
        setShowSuccess(false);
      }
    };
    
    return (
      <>
        <form onSubmit={handleSubmit} style={{textAlign: 'left'}}>
          <div style={{marginBottom: 12}}>
            <b>Which mode is used with Wireshark to monitor network traffic in real-time?</b>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
            <label style={{textAlign: 'left'}}><input type="radio" name="wiresharkq" value="A" checked={selected==="A"} onChange={()=>setSelected("A")} /> A) Monitor Mode</label>
            <label style={{textAlign: 'left'}}><input type="radio" name="wiresharkq" value="B" checked={selected==="B"} onChange={()=>setSelected("B")} /> B) Stealth Mode</label>
            <label style={{textAlign: 'left'}}><input type="radio" name="wiresharkq" value="C" checked={selected==="C"} onChange={()=>setSelected("C")} /> C) Capture Mode</label>
            <label style={{textAlign: 'left'}}><input type="radio" name="wiresharkq" value="D" checked={selected==="D"} onChange={()=>setSelected("D")} /> D) Promiscuous Mode</label>
          </div>
          <button type="submit" style={{marginTop: 16, background: '#10B981', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer'}}>Submit Answer</button>
          {showSuccess && <div style={{color: '#10B981', marginTop: 12}}>Correct! Redirecting to Quiz Page...</div>}
        </form>
        {showModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}>
            <div style={{background: '#181f2a', color: '#fff', padding: 32, borderRadius: 12, minWidth: 320, textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.2)'}}>
              <div style={{fontSize: 18, marginBottom: 16}}>Your answer is incorrect.</div>
              <div style={{marginBottom: 24}}>We recommend reviewing the training material again.</div>
              <button onClick={()=>setShowModal(false)} style={{background: '#10B981', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 24px', fontWeight: 'bold', cursor: 'pointer'}}>Close</button>
            </div>
          </div>
        )}
      </>
    );
  }

  function FirewallMiniQuiz() {
    const navigate = useNavigate();
    const [selected, setSelected] = React.useState(null);
    const [showSuccess, setShowSuccess] = React.useState(false);
    const [showModal, setShowModal] = React.useState(false);
    
    const handleSubmit = (e) => {
      e.preventDefault();
      if (selected === "D") {
        setShowSuccess(true);
        setTimeout(() => {
          navigate("/quizzes");
        }, 1000);
      } else {
        setShowModal(true);
        setShowSuccess(false);
      }
    };
    
    return (
      <>
        <form onSubmit={handleSubmit} style={{textAlign: 'left'}}>
          <div style={{marginBottom: 12}}>
            <b>Based on which fundamental principle does a firewall control network traffic?</b>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
            <label style={{textAlign: 'left'}}><input type="radio" name="firewallq" value="A" checked={selected==="A"} onChange={()=>setSelected("A")} /> A) Traffic Speed</label>
            <label style={{textAlign: 'left'}}><input type="radio" name="firewallq" value="B" checked={selected==="B"} onChange={()=>setSelected("B")} /> B) Packet Size</label>
            <label style={{textAlign: 'left'}}><input type="radio" name="firewallq" value="C" checked={selected==="C"} onChange={()=>setSelected("C")} /> C) Protocol Type</label>
            <label style={{textAlign: 'left'}}><input type="radio" name="firewallq" value="D" checked={selected==="D"} onChange={()=>setSelected("D")} /> D) Security Rules</label>
          </div>
          <button type="submit" style={{marginTop: 16, background: '#10B981', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer'}}>Submit Answer</button>
          {showSuccess && <div style={{color: '#10B981', marginTop: 12}}>Correct! Redirecting to Quiz Page...</div>}
        </form>
        {showModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}>
            <div style={{background: '#181f2a', color: '#fff', padding: 32, borderRadius: 12, minWidth: 320, textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.2)'}}>
              <div style={{fontSize: 18, marginBottom: 16}}>Your answer is incorrect.</div>
              <div style={{marginBottom: 24}}>We recommend reviewing the training material again.</div>
              <button onClick={()=>setShowModal(false)} style={{background: '#10B981', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 24px', fontWeight: 'bold', cursor: 'pointer'}}>Close</button>
            </div>
          </div>
        )}
      </>
    );
  }

  function KaliLinuxMiniQuiz() {
    const navigate = useNavigate();
    const [selected, setSelected] = React.useState(null);
    const [showSuccess, setShowSuccess] = React.useState(false);
    const [showModal, setShowModal] = React.useState(false);
    
    const handleSubmit = (e) => {
      e.preventDefault();
      if (selected === "B") {
        setShowSuccess(true);
        setTimeout(() => {
          navigate("/quizzes");
        }, 1000);
      } else {
        setShowModal(true);
        setShowSuccess(false);
      }
    };
    
    return (
      <>
        <form onSubmit={handleSubmit} style={{textAlign: 'left'}}>
          <div style={{marginBottom: 12}}>
            <b>Which Linux distribution is Kali Linux based on?</b>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
            <label style={{textAlign: 'left'}}><input type="radio" name="kalilinuxq" value="A" checked={selected==="A"} onChange={()=>setSelected("A")} /> A) Ubuntu</label>
            <label style={{textAlign: 'left'}}><input type="radio" name="kalilinuxq" value="B" checked={selected==="B"} onChange={()=>setSelected("B")} /> B) Debian</label>
            <label style={{textAlign: 'left'}}><input type="radio" name="kalilinuxq" value="C" checked={selected==="C"} onChange={()=>setSelected("C")} /> C) Arch Linux</label>
            <label style={{textAlign: 'left'}}><input type="radio" name="kalilinuxq" value="D" checked={selected==="D"} onChange={()=>setSelected("D")} /> D) Fedora</label>
          </div>
          <button type="submit" style={{marginTop: 16, background: '#10B981', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer'}}>Submit Answer</button>
          {showSuccess && <div style={{color: '#10B981', marginTop: 12}}>Correct! Redirecting to Quiz Page...</div>}
        </form>
        {showModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}>
            <div style={{background: '#181f2a', color: '#fff', padding: 32, borderRadius: 12, minWidth: 320, textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.2)'}}>
              <div style={{fontSize: 18, marginBottom: 16}}>Your answer is incorrect.</div>
              <div style={{marginBottom: 24}}>We recommend reviewing the training material again.</div>
              <button onClick={()=>setShowModal(false)} style={{background: '#10B981', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 24px', fontWeight: 'bold', cursor: 'pointer'}}>Close</button>
            </div>
          </div>
        )}
      </>
    );
  }

  function BurpSuiteMiniQuiz() {
    const navigate = useNavigate();
    const [selected, setSelected] = React.useState(null);
    const [showSuccess, setShowSuccess] = React.useState(false);
    const [showModal, setShowModal] = React.useState(false);
    
    const handleSubmit = (e) => {
      e.preventDefault();
      if (selected === "C") {
        setShowSuccess(true);
        setTimeout(() => {
          navigate("/quizzes");
        }, 1000);
      } else {
        setShowModal(true);
        setShowSuccess(false);
      }
    };
    
    return (
      <>
        <form onSubmit={handleSubmit} style={{textAlign: 'left'}}>
          <div style={{marginBottom: 12}}>
            <b>What type of security testing is Burp Suite used for?</b>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
            <label style={{textAlign: 'left'}}><input type="radio" name="burpsuiteq" value="A" checked={selected==="A"} onChange={()=>setSelected("A")} /> A) Network Scanning</label>
            <label style={{textAlign: 'left'}}><input type="radio" name="burpsuiteq" value="B" checked={selected==="B"} onChange={()=>setSelected("B")} /> B) Wireless Network Testing</label>
            <label style={{textAlign: 'left'}}><input type="radio" name="burpsuiteq" value="C" checked={selected==="C"} onChange={()=>setSelected("C")} /> C) Web Application</label>
            <label style={{textAlign: 'left'}}><input type="radio" name="burpsuiteq" value="D" checked={selected==="D"} onChange={()=>setSelected("D")} /> D) Database Security</label>
          </div>
          <button type="submit" style={{marginTop: 16, background: '#10B981', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer'}}>Submit Answer</button>
          {showSuccess && <div style={{color: '#10B981', marginTop: 12}}>Correct! Redirecting to Quiz Page...</div>}
        </form>
        {showModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}>
            <div style={{background: '#181f2a', color: '#fff', padding: 32, borderRadius: 12, minWidth: 320, textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.2)'}}>
              <div style={{fontSize: 18, marginBottom: 16}}>Your answer is incorrect.</div>
              <div style={{marginBottom: 24}}>We recommend reviewing the training material again.</div>
              <button onClick={()=>setShowModal(false)} style={{background: '#10B981', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 24px', fontWeight: 'bold', cursor: 'pointer'}}>Close</button>
            </div>
          </div>
        )}
      </>
    );
  }

export default TrainingModule;
