

if (!window.__SMART_LINK_SHIELD__) {

    window.__SMART_LINK_SHIELD__ = true;
    let SMART_SHIELD_THEME = "dark";

    let consoleResults = [];

    window.addEventListener("message", function(event) {

        if (event.source !== window) return;

        if (event.data && event.data.type === "SMART_SHIELD_CONSOLE_RESULT") {
            consoleResults = event.data.findings;
        }

    });
    
    // ================== UTIL ==================
    function sigmoid(z) {
        return 1 / (1 + Math.exp(-z));
    }
    
    function calculateEntropy(str) {
        const map = {};
        for (let char of str) map[char] = (map[char] || 0) + 1;
        let entropy = 0;
        for (let key in map) {
            let p = map[key] / str.length;
            entropy -= p * Math.log2(p);
        }
        return entropy;
    }
    
    // ================== PAGE CONTEXT CONSOLE CHECK ==================
    function injectConsoleCheckScript() {

        const script = document.createElement("script");
        script.src = chrome.runtime.getURL("page-check.js");
        script.onload = function() {
            this.remove();
        };
    
        (document.head || document.documentElement).appendChild(script);
    }
    // ================== FEATURE EXTRACTION ==================
    function extractFeatures(url) {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;
    
        const riskyTLD = ["xyz","tk","top","gq","ru","ml"];
        const keywords = ["login","verify","secure","update","account","bank","password"];
    
        return {
            hasIP: /\d+\.\d+\.\d+\.\d+/.test(hostname),
            https: url.startsWith("https"),
            keywordCount: keywords.filter(k => url.toLowerCase().includes(k)).length,
            riskyTLD: riskyTLD.includes(hostname.split(".").pop()),
            unicode: /[^\u0000-\u007f]/.test(hostname),
            entropy: calculateEntropy(hostname)
        };
    }
    
    // ================== ML MODEL ==================
    function predictProbability(f) {
    
        let z = -3;
    
        z += 2.5 * (f.hasIP ? 1 : 0);
        z += -2.2 * (f.https ? 1 : 0);
        z += 0.9 * f.keywordCount;
        z += 1.5 * (f.riskyTLD ? 1 : 0);
        z += 1.2 * (f.unicode ? 1 : 0);
    
        if (f.entropy > 3.7) z += 1.2;
    
        let prob = sigmoid(z);
    
        return Math.min(Math.max(prob, 0.03), 0.97);
    }
    
    // ================== RISK EXPLANATION ==================
    function generateExplanation(f) {
    
        let risks = [];
        let safety = [];
    
        if (f.hasIP) risks.push("Uses IP address instead of domain name.");
        if (!f.https) risks.push("Connection is not encrypted (HTTP).");
        else safety.push("Uses secure HTTPS encryption.");
    
        if (f.keywordCount > 0)
            risks.push("Contains phishing-related keywords.");
    
        if (f.riskyTLD)
            risks.push("Uses a high-risk top-level domain.");
    
        if (f.unicode)
            risks.push("Contains Unicode characters (possible homograph attack).");
    
        if (f.entropy > 3.7)
            risks.push("Domain appears randomly generated.");
    
        return { risks, safety };
    }
    
    // ================== CONSOLE INTEGRITY MONITOR ==================
    function analyzeConsoleIntegrity() {

        let findings = [];

        function isNative(fn) {
            return typeof fn === "function" &&
                fn.toString().includes("[native code]");
        }

        if (!isNative(window.eval))
            findings.push("eval() function has been modified.");

        if (!isNative(window.Function))
            findings.push("Function constructor has been modified.");

        if (!isNative(window.setTimeout))
            findings.push("setTimeout() has been modified.");

        if (!isNative(console.log))
            findings.push("console.log() appears to be hooked.");

        if (!isNative(console.warn))
            findings.push("console.warn() appears to be hooked.");

        if (!isNative(console.error))
            findings.push("console.error() appears to be hooked.");

        // Suspicious automation globals
        const suspiciousGlobals = ["_phantom","__webdriver","callPhantom","selenium"];

        suspiciousGlobals.forEach(name => {
            if (window[name] !== undefined) {
                findings.push(`Suspicious global detected: ${name}`);
            }
        });

        return findings;
    }

    // ================== SHADOW MODAL ==================
    function createShadowModal(title, bodyHTML) {

        const old = document.getElementById("shield-root");
        if (old) old.remove();
    
        const host = document.createElement("div");
        host.id = "shield-root";
        host.style.position = "fixed";
        host.style.top = "120px";
        host.style.left = "0";
        host.style.right = "0";
        host.style.display = "flex";
        host.style.justifyContent = "center";
        host.style.zIndex = "2147483647";
    
        document.documentElement.appendChild(host);
    
        const shadow = host.attachShadow({ mode: "open" });
    
        const isDark = SMART_SHIELD_THEME === "dark";
    
        const bg = isDark ? "#1f1f1f" : "#ffffff";
        const headerBg = isDark ? "#2c2c2c" : "#f2f2f2";
        const textColor = isDark ? "#ffffff" : "#111111";
        const subText = isDark ? "#cccccc" : "#333333";
        const buttonBg = isDark ? "#444" : "#e0e0e0";
    
        shadow.innerHTML = `
            <style>
                :host {
                    font-family: Arial, sans-serif;
                    font-size: 14px;
                    line-height: 1.6;
                    color: ${textColor};
                }
    
                .modal {
                    width: 520px;
                    background: ${bg};
                    border-radius: 12px;
                    box-shadow: 0 0 30px rgba(0,0,0,0.5);
                }
    
                .header {
                    padding: 14px;
                    background: ${headerBg};
                    border-radius: 12px 12px 0 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-weight: bold;
                }
    
                .body {
                    padding: 20px;
                    max-height: 450px;
                    overflow-y: auto;
                    color: ${subText};
                }
    
                h3 {
                    margin: 16px 0 6px;
                }
    
                p {
                    margin: 6px 0;
                }
    
                button {
                    padding: 6px 12px;
                    border-radius: 6px;
                    border: none;
                    cursor: pointer;
                    background: ${buttonBg};
                    color: ${textColor};
                    margin-left: 8px;
                }
    
                .theme-toggle {
                    cursor: pointer;
                    font-size: 16px;
                }
    
                .bar {
                    height: 18px;
                    background: ${isDark ? "#333" : "#ddd"};
                    border-radius: 8px;
                    margin: 12px 0;
                    overflow: hidden;
                }
    
                .bar-fill {
                    height: 100%;
                }
            </style>
    
            <div class="modal">
                <div class="header">
                    <span>${title}</span>
                    <div>
                        <span id="theme-toggle" class="theme-toggle">
                            ${isDark ? "🌙" : "☀️"}
                        </span>
                        <button id="shield-close">✖</button>
                    </div>
                </div>
                <div class="body">
                    ${bodyHTML}
                </div>
            </div>
        `;
    
        shadow.getElementById("shield-close").onclick = () => host.remove();
    
        shadow.getElementById("theme-toggle").onclick = () => {
            SMART_SHIELD_THEME = SMART_SHIELD_THEME === "dark" ? "light" : "dark";
            createShadowModal(title, bodyHTML);
        };
    }
    
    // ================== CLICK INTERCEPT ==================
    document.addEventListener("click", function(event) {
    
        const link = event.target.closest("a");
        if (!link || !link.href) return;
        if (link.href.startsWith("#")) return;
    
        let finalURL = link.href;
    
        // Fix Google redirect
        try {
            const urlObj = new URL(link.href);
            if (urlObj.hostname.includes("google.") && urlObj.pathname === "/url") {
                const real = urlObj.searchParams.get("q");
                if (real) finalURL = real;
            }
        } catch {}
    
        if (link.dataset.shieldProcessed === "true") return;
    
        event.preventDefault();
    
        const f = extractFeatures(finalURL);
        const score = predictProbability(f);
        const explanation = generateExplanation(f);
    
        const color = score > 0.7 ? "#ff3b3b"
                    : score > 0.4 ? "#ffb300"
                    : "#4CAF50";
    
        const status = score > 0.7 ? "High Risk"
                    : score > 0.4 ? "Suspicious"
                    : "Safe";
    
        let description = status === "High Risk"
            ? "This link contains multiple risk indicators and may lead to a malicious or phishing site."
            : status === "Suspicious"
            ? "This link has some unusual characteristics. Proceed with caution."
            : "No major risk indicators detected. This link appears safe.";
    
        let body = `
            <p><strong>Destination:</strong><br>${finalURL}</p>
    
            <div class="bar">
                <div class="bar-fill" style="width:${score*100}%; background:${color};"></div>
            </div>
    
            <p><strong style="color:${color};">${status}</strong> — ${(score*100).toFixed(0)}%</p>
    
            <p>${description}</p>
        `;
    
        body += `<h3>Risk Factors</h3>`;
        body += explanation.risks.length
            ? explanation.risks.map(r => `<p style="color:#ff6b6b;">• ${r}</p>`).join("")
            : `<p style="color:#66ff99;">No major risk indicators detected.</p>`;
    
        body += `<h3>Safety Indicators</h3>`;
        body += explanation.safety.length
            ? explanation.safety.map(s => `<p style="color:#66ff99;">• ${s}</p>`).join("")
            : `<p>No strong safety signals identified.</p>`;
    
        body += `
            <div style="text-align:right; margin-top:15px;">
                <button id="cancel">Cancel</button>
                <button id="proceed" style="background:${color}; color:white;">Proceed</button>
            </div>
        `;
    
        createShadowModal("🛡 Link Security Analysis", body);
    
        setTimeout(() => {
            const shadow = document.getElementById("shield-root").shadowRoot;
    
            shadow.getElementById("proceed").onclick = () => {
                link.dataset.shieldProcessed = "true";
                window.location.href = finalURL;
            };
    
            shadow.getElementById("cancel").onclick = () => {
                document.getElementById("shield-root").remove();
            };
        }, 0);
    });
    
    // ================== PERMISSION ANALYZER ==================
    async function analyzePermissions() {
    
        const permissions = ["geolocation","notifications","microphone","camera"];
        let results = [];
    
        for (let name of permissions) {
            try {
                if (!navigator.permissions) {
                    results.push({ name, state: "unsupported" });
                    continue;
                }
    
                const status = await navigator.permissions.query({ name });
                results.push({ name, state: status.state });
    
            } catch {
                results.push({ name, state: "restricted" });
            }
        }
    
        return results;
    }
    
    // ================== RUNTIME SCAN ==================
    async function runRuntimeScan() {
    
        let body = "";
    
        if (!window.isSecureContext)
            body += `<p style="color:red;">Page is not running in secure HTTPS context.</p>`;
        else
            body += `<p style="color:lightgreen;">Secure HTTPS context confirmed.</p>`;
    
        const cookies = document.cookie.split(";").filter(c=>c.trim()).length;
        body += `<p>Cookies detected: ${cookies}</p>`;
    
        const storage = Object.keys(localStorage).length;
        body += `<p>LocalStorage entries: ${storage}</p>`;
    
        body += `<h3>Permission Status</h3>`;
    
        const perms = await analyzePermissions();
    
        perms.forEach(p => {
    
            let label = "";
    
            if (p.state === "granted")
                label = "Access Granted";
            else if (p.state === "prompt")
                label = "Not Yet Requested";
            else if (p.state === "denied")
                label = "Access Blocked";
            else if (p.state === "restricted")
                label = "Restricted by Browser";
            else
                label = "Not Supported";
    
            body += `<p>${p.name}: ${label}</p>`;
        });

        // ================= Console Integrity Section =================
        // ================= Console Integrity Section =================
        body += `<h3>Console Integrity Check</h3>`;

        injectConsoleCheckScript();

        // wait briefly for page response
        await new Promise(resolve => setTimeout(resolve, 100));

        if (consoleResults.length === 0) {
            body += `<p style="color:lightgreen;">No console tampering detected.</p>`;
        } else {
            consoleResults.forEach(f => {
                body += `<p style="color:#ff6b6b;">• ${f}</p>`;
            });
        }
    
        createShadowModal("🛡 Runtime Page Security Report", body);
    }
    
    // ================== FLOATING BUTTON ==================
    function injectFloatingButton() {
    
        if (document.getElementById("shield-float-host")) return;
    
        const host = document.createElement("div");
        host.id = "shield-float-host";
        host.style.position = "fixed";
        host.style.bottom = "25px";
        host.style.right = "25px";
        host.style.zIndex = "2147483647";
    
        document.documentElement.appendChild(host);
    
        const shadow = host.attachShadow({ mode: "open" });
    
        shadow.innerHTML = `
            <style>
                .floating {
                    width: 60px;
                    height: 60px;
                    background: #1e88e5;
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 28px;
                    cursor: pointer;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.5);
                }
            </style>
            <div class="floating">🛡</div>
        `;
    
        shadow.querySelector(".floating").onclick = runRuntimeScan;
    }
    
    window.addEventListener("load", ()=>{
        setTimeout(injectFloatingButton, 800);
    });
    
    }