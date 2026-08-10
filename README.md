
# 🚨 Built to Break: Urban Scrollytelling Audit Platform

> **An Interactive Urban Infrastructure Capacity & Fire Risk Vulnerability Audit Platform**
> *Developed as part of the BITS Pilani (BITS ZC229T) Design Project carried out at HCLTech, India.*

![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)
![React](https://img.shields.io/badge/React-19.0.1-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-4.21.2-339933?logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwind-css)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Drizzle_ORM-4169E1?logo=postgresql)
![Google Gemini](https://img.shields.io/badge/AI-Gemini_3.6_Flash-8E75B2?logo=google-gemini)

---

## 📌 Executive Overview

**Built to Break** is a full-stack, data-driven web application and scrollytelling audit engine designed to analyze urban infrastructure deficits, National Building Code (NBC 2016 Part 4) non-compliance, and emergency response bottlenecks across metropolitan India. 

By merging dynamic D3.js telemetry visualizations, Web Audio API acoustic synthesis, spatial mathematical stress simulations, an AI-powered proctoring examination portal (using Google Gemini 2.0 Flash and MediaPipe FaceMesh), and automated Google Workspace ITSM integrations, the platform turns complex architectural codes into an engaging, diagnostic narrative.

---

## ✨ Key Features & Capabilities

* **📜 Interactive Scrollytelling Engine:** Synchronizes continuous scroll progress (`requestAnimationFrame` at 60 FPS) with dynamic D3.js charts rendering 10-year footprint expansion, unauthorized vertical floor height, peak commute routing delays, and cross-metropolitan collapse rankings.
* **🔊 Web Audio Acoustic Tension Generator:** Real-time Web Audio API engine that synthesizes low-frequency rumbles and crackling fire audio buffers, dynamically scaling volume and frequency in response to scroll tension and simulation stress.
* **🧮 Mathematical Spatial Simulator (`RiskSimulator.jsx`):** Computes a composite Urban Hazard Score ($H_{\text{urban}}$) and emergency response delay ($D_{\text{response}}$) based on micro-level spatial variables: lane width clearance, vertical floor counts, commercial trade load, and exit route deficits.
* **🗺️ 2D/3D SVG District Vector Map (`DelhiMap.jsx`):** Vector polygon visualizer mapping 11 administrative Delhi districts with dynamic hazard color coding and CSS matrix isometric 3D perspective toggles.
* **🏛️ NBC Loophole Audit Board (`NbcAuditPanel.jsx`):** Clause-by-clause inquest board dissecting NBC 2016 Part 4 standards against corporate builder compromises, complete with an interactive Builder Capital Saved vs. Human Casualty trade-off calculator.
* **📸 Tiered AI Proctoring Examination Engine (`TestYourKnowledge.jsx`):**
  * **Server-Side Multimodal AI:** Evaluates Base64 webcam frames for posture, eye gaze, secondary devices, and audio decibel telemetry (`audioVolume`, `audioPeak`). Dynamic fallback across vision models (Gemini 3.6 $\rightarrow$ 3.1) and audio models (Gemini 3.0 $\rightarrow$ 2.2) based on API token availability.
  * **Server OpenCV Processing:** Preprocesses, normalizes, and crops facial Regions of Interest (ROI) on the server, saving up to 60% token bandwidth.
  * **Client MediaPipe FaceMesh Fallback:** Offline zero-token WebAssembly (WASM) fallback tracking 468 3D facial landmarks locally if API quotas deplete or network drops occur.
  * **Real-time WebSockets:** Live streaming of candidate violation flags directly to the Admin Oversight Dashboard via Socket.IO.
* **🏅 Canvas Certificate Generator (`certificateGenerator.js`):** Client-side HTML5 Canvas rendering engine drawing curved arc text (`drawArcText`), vector shield icons, and watermarks, exporting A4 Landscape PDFs (`jsPDF`), high-res PNGs, or print records.
* **🎫 Enterprise ITSM & Google Workspace Sync (`SupportSection.jsx`):** User ticket logging (`TKT-XXXX`), automated OAuth Gmail/Nodemailer status dispatches, Google Drive ID uploads, Google Sheets master registry appends, and Google Tasks sync for P1/P2 issues.

---

## 🏗️ System Architecture


┌─────────────────────────────────────────────────────────────────────────┐
│                       CLIENT SIDE (React 19 SPA)                        │
│  ┌───────────────────────┐ ┌───────────────────────┐ ┌─────────────────┐ │
│  │ Scrollytelling Engine │ │ Spatial Risk Simulator│ │ AI Exam Portal  │ │
│  │ (Motion / D3.js)      │ │ (SVG Map / Sliders)   │ │ (Webcam / Mic)  │ │
│  └───────────┬───────────┘ └───────────┬───────────┘ └────────┬────────┘ │
└──────────────│─────────────────────────│──────────────────────│──────────┘
│ HTTP / WS Telemetry     │ Inputs               │ Frame / Audio
┌──────────────▼─────────────────────────▼──────────────────────▼──────────┐
│                     SERVER SIDE (Node.js / Express)                     │
│  ┌──────────────────────────┐ ┌─────────────────────────┐ ┌───────────┐ │
│  │ Socket.IO Websocket Hub  │ │ OpenCV + Gemini AI Hub  │ │ Auth & XSS│ │
│  │ (Live Admin Streaming)   │ │ (Multimodal Proctoring) │ │ Middleware│ │
│  └───────────┬──────────────┘ └───────────┬─────────────┘ └─────┬─────┘ │
└──────────────│────────────────────────────│─────────────────────│───────┘
│ SQL Queries                │ Vision / Audio      │ OAuth
┌──────────────▼────────────────────────────▼─────────────────────▼───────┐
│                     DATABASE & CLOUD INTEGRATIONS                       │
│  ┌──────────────────────────┐ ┌─────────────────────────┐ ┌───────────┐ │
│  │ PostgreSQL DB (Drizzle)  │ │ Firebase Auth Client &  │ │ Google    │ │
│  │ (Users, Certs, Tickets)  │ │ Admin SDK Verification  │ │ Workspace │ │
│  └──────────────────────────┘ └─────────────────────────┘ └───────────┘ │
└─────────────────────────────────────────────────────────────────────────┘

---

## 🧮 Core Mathematical Risk Formulas

### 1. Urban Risk Hazard Score ($H_{\text{urban}}$)
Calculated inside `data.js` and bounded between $5$ and $100$ points:

$$H_{\text{urban}} = \min\left(100, \max\left(5, \text{Round}(H_{\text{lane}} + H_{\text{floor}} + H_{\text{overload}} + H_{\text{exit}})\right)\right)$$

* **Lane Width Hazard:** $H_{\text{lane}} = \max(0, (3.5 - W_{\text{lane}}) \times 12)$
* **Vertical Floor Hazard:** $H_{\text{floor}} = (N_{\text{floors}} - 1) \times 8$
* **Commercial Overload Hazard:** $H_{\text{overload}} = L_{\text{comm}} \times 7.5$
* **Exit Deficit Hazard:** $H_{\text{exit}} = \left(1 - \frac{E_{\text{count}}}{4}\right) \times 15$

### 2. Emergency Response Delay ($D_{\text{response}}$)
$$D_{\text{response}} = 5.0 + \Delta D_{\text{width}} + \Delta D_{\text{congestion}}$$

*When $W_{\text{lane}} < 2.0\text{ meters}$, tenders are blocked, forcing manual hose deployment over distance $S$, adding $\Delta D_{\text{width}} = 8.5 + 0.15 \times S\text{ minutes}$.*

---

## 🛠️ Technology Stack

| Domain | Technology / Package | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite 6.2, Tailwind CSS v4, Motion 12.23 | UI components, ultra-fast bundling, and 60 FPS animations. |
| **Data Viz** | D3.js 7.9, Recharts 3.9 | Dynamic SVG scrollytelling charts and trend graphs. |
| **Backend** | Node.js, Express 4.21, Socket.IO 4.8 | REST API routing, rate limiting, and WebSocket streaming. |
| **Database** | PostgreSQL 8.22, Drizzle ORM 0.45 | Type-safe PostgreSQL ORM schemas and pool caching. |
| **AI Vision/Audio**| `@google/genai` (Gemini SDK), MediaPipe FaceMesh | Multimodal live exam proctoring and offline WASM fallback. |
| **Auth & Security**| Firebase Auth, Helmet 8.3, Express Rate Limit | Token verification, XSS sanitization, and DPDP privacy masking. |
| **Export / Mail** | jsPDF 4.2, html2canvas 1.4, Nodemailer 9.0 | PDF certificate generation and Gmail OAuth/SMTP email dispatch. |

---

## 👥 Project Team & Codebase Ownership

The entire codebase comprises **40 modular files** cleanly divided across the team based on designated domain roles:

| Team Member | Student ID | Corporate Role (HCLTech) | Designated Project Role | Files Owned |
| :--- | :---: | :--- | :--- | :---: |
| **Neerej S Suresan** | `202417BH007` | Identity & Access Management Analyst | Systems Architect & Project Director | **20 Files** |
| **Lena Mathew** | `202417BH070` | Software Testing Specialist (Embedded) | Simulation Mathematician & Physics Engine Dev | **7 Files** |
| **Amisha Rathish** | `202417BH052` | Automation Testing Specialist (Embedded) | Data Telemetry Engineer & QA Tester | **5 Files** |
| **Shraddha Jitendra**| `202417BH071` | Functional Testing Specialist (Embedded) | Typography & Mobile Layout Ergonomist | **4 Files** |
| **Anupam Anand** | `202417BH029` | Functional Testing Specialist (Mobile/Dev) | Atmospheric UI & Visual Designer | **4 Files** |

---

## ⚡ Quick Start & Installation

### Prerequisites
* **Node.js:** `v18.x` or higher
* **PostgreSQL Database:** Running instance
* **Package Manager:** `npm` or `bun`

### 1. Clone the Repository
```bash
git clone [https://github.com/your-org/built-to-break.git](https://github.com/your-org/built-to-break.git)
cd built-to-break

2. Install Dependencies
npm install

3. Environment Configuration
Create a .env file in the root directory based on env.example.txt:
# Gemini AI Configuration
GEMINI_API_KEY="your_gemini_api_key_here"

# Server Configuration
PORT=3000
APP_URL="http://localhost:3000"

# Cloud SQL PostgreSQL Configuration
SQL_HOST="127.0.0.1"
SQL_DB_NAME="built_to_break_db"
SQL_USER="postgres"
SQL_PASSWORD="your_postgres_password"
SQL_ADMIN_USER="postgres"
SQL_ADMIN_PASSWORD="your_postgres_password"

# Automated Support Ticket Mail (SMTP / Nodemailer)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_app_password"
SMTP_FROM="Built to Break Support <support@builttobreak.delhi.gov.in>"

4. Database Schema Migration
Generate and apply Drizzle ORM migrations to PostgreSQL:
npx drizzle-kit generate
npx drizzle-kit push

5. Run Development Server
Start the Express server integrated with Vite middleware (auto-seeds 500 questions on startup):
npm run dev

Open http://localhost:3000 in your browser.
🧪 Production Build & Deployment
To compile client assets with Vite and bundle the Node.js TypeScript server into CJS using esbuild:
# Build production bundle
npm run build

# Start production server
npm start

🛡️ Security & Privacy Compliance
 * DPDP Act (2023) Compliance: Candidate Aadhaar and PAN IDs captured during exam registration are automatically masked (maskSensitiveId()) on both client and server layers.
 * XSS Sanitization: xssSanitizerMiddleware recursively cleans all incoming req.body, req.query, and req.params payload strings.
 * Admin Authentication: Administrative access requires SHA-256 salted password verification (NBC_ADMIN_ID_SALT_2026).
🏛️ Industry Supervision & Mentorship
 * Charanjeet Singh — Senior Software Engineer, PayU Finance, Gurugram, India (Industry Mentor & External Supervisor)
 * Anjali Paul — Associate Consultant, Digital Foundation Services (DFS) Middleware, HCLTech, India (Subject Matter Expert)
 * Birla Institute of Technology & Science (BITS), Pilani — Academic Partner (BITS ZC229T Design Project)
📄 License
Distributed under the Apache License 2.0. See LICENSE for more information.


