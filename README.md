# 🏙️ Built to Break: Urban Scrollytelling

**Built to Break: Urban Scrollytelling** is an interactive, high-fidelity web application designed to analyze, audit, and visualize urban infrastructure capacity and risk across Indian metropolitan areas. Combining immersive narrative data storytelling with real-time AI-assisted compliance auditing, the platform turns complex urban risk metrics into actionable visual insights.

---

## ✨ Core Features

* **📜 Urban Risk Scrollytelling:** Interactive narrative interface that walks users through dynamic spatial and structural risk analysis in Indian cities.
* **🏛️ NBC Compliance Audit (`TestYourKnowledge.jsx`):** A specialized testing and audit module to evaluate structural adherence to the **National Building Code (NBC)**.
* **🤖 AI-Powered Proctoring:** Real-time biometric monitoring and session proctoring driven by the **Gemini API** to guarantee audit integrity and prevent unauthorized activity during compliance tests.
* **📊 Data Visualizations:** High-density, interactive data graphics powered by **D3.js** and **Recharts**.
* **⚡ Real-Time Streaming:** High-frequency, low-latency video and data streaming using **Socket.io**.
* **🔐 Robust Persistence Layer:** **Firebase Authentication** paired with **Drizzle ORM** and **PostgreSQL** for type-safe, structured data management.

---

## 🛠️ Tech Stack

### **Frontend**
* **Framework:** React 19
* **Data Visualization:** D3.js, Recharts
* **Styling & UI:** Tailwind CSS (or your preferred styling solution)

### **Backend & Real-Time**
* **Server:** Node.js / Express
* **WebSockets:** Socket.io (real-time video and state synchronization)
* **AI Engine:** Google Gemini API (biometric proctoring & compliance auditing)

### **Database & Authentication**
* **Auth & Config:** Firebase Auth
* **ORM:** Drizzle ORM
* **Database:** PostgreSQL

---

## 🏗️ System Architecture Overview


┌──────────────────────────────────────────────────────────────┐
│                      React 19 Frontend                       │
│  ┌───────────────────────┐      ┌─────────────────────────┐  │
│  │  Scrollytelling Engine│      │  NBC Audit Module       │  │
│  │  (D3.js & Recharts)   │      │  (TestYourKnowledge)    │  │
│  └───────────────────────┘      └────────────┬────────────┘  │
└────────────────────────┬─────────────────────┼───────────────┘
│                     │
HTTP / WebSocket           Biometric
Requests               Webcam Stream
│                     │
┌────────────────────────▼─────────────────────▼───────────────┐
│                      Express Backend                         │
│  ┌────────────────────────┐      ┌────────────────────────┐  │
│  │ Socket.io Server       │      │ Gemini AI Proctoring   │  │
│  └───────────┬────────────┘      └────────────────────────┘  │
└──────────────┼───────────────────────────────────────────────┘
│
┌──────────────▼───────────────────────────────────────────────┐
│                      Database & Storage                      │
│  ┌────────────────────────┐      ┌────────────────────────┐  │
│  │ Drizzle ORM + Postgres │      │ Firebase Auth          │  │
│  └────────────────────────┘      └────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your local development machine:
* [Node.js](https://nodejs.org/) (v18.x or higher)
* [PostgreSQL](https://www.postgresql.org/) database server
* A [Firebase Project](https://console.firebase.google.com/) setup
* A [Google Gemini API Key](https://aistudio.google.com/)

---

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/built-to-break.git](https://github.com/your-username/built-to-break.git)
   cd built-to-break

 * Install dependencies:
   npm install

 * Configure Environment Variables:
   Create a .env file in the root directory and add the following keys:
   # Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/built_to_break

# Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

 * Run Database Migrations:
   npm run db:push

 * Start the Development Server:
   npm run dev

🧪 Modules Overview
1. TestYourKnowledge.jsx
Located in the core audit directory, this module serves as the primary portal for assessing NBC structural compliance. It tracks user input, interfaces with the camera via WebSockets, and continuously evaluates session integrity using Gemini AI vision models.
2. Scrollytelling Engine
Renders dynamic spatial maps and timeline indicators as the user scrolls. Integrates D3.js force layouts and Recharts bar/line projections to depict structural vulnerability trends across metropolitan zones.
📄 License
Distributed under the MIT License.

