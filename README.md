# Hackwack3
# 🛡 LinkShield

 LinkShield is a real-time browser security extension that acts as a protective barrier between users and potentially malicious links.

It combines lightweight machine learning, heuristic analysis, runtime monitoring, and console integrity checks to enhance browsing security.

---

## 🚀 Features

### 🔒 1. Pre-Click Link Protection (ML-Based)
Before any external link is opened, Smart Link Shield:

- Calculates a dynamic threat score
- Displays a visual risk meter
- Classifies link as:
  - Safe
  - Suspicious
  - High Risk
- Explains **why** the link is considered risky
- Fixes Google redirect links (e.g., `/url?q=` issue)
- Allows safe user-controlled navigation

---

### 🧠 2. Threat Detection Model

The extension analyzes:

- IP-based URLs
- HTTPS usage
- Phishing-related keywords
- Risky TLDs (.xyz, .tk, etc.)
- Unicode homograph attempts
- Domain entropy (random-looking domains)

A logistic-style scoring model produces a probability-based risk score.

---

### 🛡 3. Runtime Page Security Scanner

Accessible via floating shield button.

It analyzes:

- HTTPS secure context
- Cookie count
- LocalStorage entries
- Permission status:
  - Geolocation
  - Notifications
  - Microphone
  - Camera
- Console tampering detection

---

### 🔍 4. Console Integrity Monitor

Detects if core JavaScript functions are modified:

- `console.log`
- `eval`
- `Function`
- `setTimeout`

Helps identify potential script injection or tampering.

---

### 🎨 5. Dark / Light Theme Toggle

- Fully isolated UI using Shadow DOM
- Toggle between dark and light themes
- Does not interfere with page styling

---

## 🧱 Architecture


User Click
↓
Feature Extraction
↓
Threat Scoring Model
↓
Risk Explanation
↓
User Decision (Proceed / Cancel)


Runtime Monitoring operates independently through floating UI.

---

## 📦 Installation (Development Mode)

1. Download or clone this repository.
2. Open Chrome.
3. Go to:

chrome://extensions

4. Enable **Developer Mode** (top right).
5. Click **Load Unpacked**.
6. Select the project folder.

The extension is now active.

---

## 📂 Project Structure


smart-link-shield/
│
├── manifest.json
├── content.js
└── page-check.js


---

## 🔐 Security Model

Smart Link Shield operates in two layers:

### Layer 1 – Pre-Navigation Firewall
Prevents accidental navigation to risky URLs.

### Layer 2 – Runtime Behavioral Monitoring
Scans permissions, storage, and script integrity.

---

## ⚠ Limitations

- Cannot block browser DevTools.
- Cannot prevent manual console execution.
- Detects tampering but does not prevent it (browser security design).

---

## 🧪 Testing Console Detection

Open DevTools and run:

```javascript
console.log = function(){ alert("Hooked"); }