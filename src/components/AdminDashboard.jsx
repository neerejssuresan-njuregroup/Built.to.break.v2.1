import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { io } from "socket.io-client";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  X, 
  CheckCircle2, 
  XCircle, 
  Download, 
  Printer, 
  RefreshCw, 
  Award, 
  User, 
  Calendar, 
  MapPin, 
  Lock, 
  Sliders, 
  SlidersHorizontal,
  ChevronRight, 
  ChevronLeft,
  BookOpen, 
  Trash2, 
  Edit, 
  Plus, 
  AlertTriangle,
  Eye,
  Camera,
  Activity,
  FileText,
  UserCheck,
  DownloadCloud,
  LifeBuoy,
  Mail,
  Phone,
  MessageSquare,
  Send
} from "lucide-react";
import { getAccessToken, sendTicketStatusUpdateEmail } from "../lib/googleWorkspace";

export default function AdminDashboard({ onClose }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  const [loginId, setLoginId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active view tab: "proctoring" | "questions" | "certificates"
  const [activeTab, setActiveTab] = useState("proctoring");

  // State for Live Proctoring
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isFetchingSessions, setIsFetchingSessions] = useState(false);
  const [proctorActionComment, setProctorActionComment] = useState("");
  const [proctorActionError, setProctorActionError] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  // State for Question CRUD
  const [questions, setQuestions] = useState([]);
  const [isFetchingQuestions, setIsFetchingQuestions] = useState(false);
  const [questionSearchQuery, setQuestionSearchQuery] = useState("");
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [questionModalMode, setQuestionModalMode] = useState("add"); // "add" | "edit"
  const [questionFormError, setQuestionFormError] = useState(null);

  // Question Form State
  const [questionForm, setQuestionForm] = useState({
    title: "",
    type: "General Code",
    location: "Custom Zone",
    difficulty: "MEDIUM",
    points: 10,
    description: "",
    options: { A: "", B: "", C: "", D: "" },
    correctId: "A",
    nbcClauses: "",
    bnsSection: "",
    hazardLevel: "HIGH",
    fact: ""
  });

  // State for Certificate Search
  const [certSearchQuery, setCertSearchQuery] = useState("");
  const [certResults, setCertResults] = useState([]);
  const [isSearchingCerts, setIsSearchingCerts] = useState(false);

  // State for ITSM Support Tickets
  const [supportTickets, setSupportTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isFetchingTickets, setIsFetchingTickets] = useState(false);
  const [ticketFilterStatus, setTicketFilterStatus] = useState("ALL");
  const [ticketSearchQuery, setTicketSearchQuery] = useState("");
  const [ticketResponseMsg, setTicketResponseMsg] = useState("");
  const [ticketNewStatus, setTicketNewStatus] = useState("");
  const [ticketNewAssignee, setTicketNewAssignee] = useState("");
  const [isUpdatingTicket, setIsUpdatingTicket] = useState(false);
  
  const [liveFrames, setLiveFrames] = useState({});

  // Setup WebSockets for live video streaming
  useEffect(() => {
    if (!isAuthenticated) return;
    const socket = io();
    
    socket.on("receive-video-frame", (data) => {
      if (data && data.sessionCode && data.frame) {
        setLiveFrames(prev => ({ ...prev, [data.sessionCode]: data.frame }));
      }
    });

    if (selectedSession) {
      socket.emit("join-session", selectedSession.sessionCode);
    }

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, selectedSession]);

  // Standard token check on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("adminToken");
    const savedUser = localStorage.getItem("adminUsername");
    if (savedToken && savedUser) {
      verifySavedToken(savedToken, savedUser);
    }
  }, []);

  const verifySavedToken = async (savedToken, savedUser) => {
    try {
      const res = await fetch("/api/admin/verify", {
        headers: { "Authorization": `Bearer ${savedToken}` }
      });
      if (res.ok) {
        setIsAuthenticated(true);
        setToken(savedToken);
        setUsername(savedUser);
      } else {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUsername");
      }
    } catch (e) {
      console.warn("Verify saved token failed:", e);
    }
  };

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginId || !loginPassword) return;
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginId, password: loginPassword })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setToken(data.token);
        setUsername(data.username);
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("adminUsername", data.username);
      } else {
        setLoginError(data.error || "Access Denied. Invalid credentials.");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setLoginError("Failed to connect to the database auth service.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUsername");
    setIsAuthenticated(false);
    setToken("");
    setUsername("");
  };

  // Fetch Live Proctoring Sessions
  const fetchSessions = async () => {
    if (!token) return;
    setIsFetchingSessions(true);
    try {
      const res = await fetch("/api/admin/sessions", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
        // Sync selected session with new data
        if (selectedSession) {
          const updated = data.find(s => s.sessionCode === selectedSession.sessionCode);
          if (updated) setSelectedSession(updated);
        }
      }
    } catch (e) {
      console.warn("Failed to fetch ongoing sessions:", e);
    } finally {
      setIsFetchingSessions(false);
    }
  };

  // Fetch Questions for CRUD
  const fetchQuestions = async () => {
    if (!token) return;
    setIsFetchingQuestions(true);
    try {
      const res = await fetch("/api/admin/questions", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      }
    } catch (e) {
      console.warn("Failed to fetch questions:", e);
    } finally {
      setIsFetchingQuestions(false);
    }
  };

  // Poll live sessions every 4.5 seconds
  useEffect(() => {
    if (isAuthenticated && activeTab === "proctoring") {
      fetchSessions();
      const interval = setInterval(fetchSessions, 4500);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, activeTab, selectedSession?.sessionCode]);

  // Fetch questions when clicking questions tab
  useEffect(() => {
    if (isAuthenticated && activeTab === "questions") {
      fetchQuestions();
    }
  }, [isAuthenticated, activeTab]);

  // Auto-scan certificates when clicking certificates tab
  useEffect(() => {
    if (isAuthenticated && activeTab === "certificates") {
      handleCertSearch();
    }
  }, [isAuthenticated, activeTab]);

  // Fetch Support Tickets
  const fetchSupportTickets = async () => {
    if (!token) return;
    setIsFetchingTickets(true);
    try {
      const res = await fetch("/api/support/admin/tickets", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSupportTickets(data);
        if (selectedTicket) {
          const updatedSelected = data.find(t => t.id === selectedTicket.id);
          if (updatedSelected) setSelectedTicket(updatedSelected);
        }
      }
    } catch (e) {
      console.warn("Failed to fetch admin support tickets:", e);
    } finally {
      setIsFetchingTickets(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && activeTab === "support") {
      fetchSupportTickets();
    }
  }, [isAuthenticated, activeTab]);

  // Update Support Ticket Status & Post Admin Response
  const handleUpdateTicket = async (e) => {
    if (e) e.preventDefault();
    if (!selectedTicket) return;

    setIsUpdatingTicket(true);
    try {
      const res = await fetch(`/api/support/admin/tickets/${selectedTicket.id}/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          status: ticketNewStatus || selectedTicket.status,
          message: ticketResponseMsg.trim() || undefined,
          assignedTo: ticketNewAssignee || selectedTicket.assignedTo
        })
      });

      if (res.ok) {
        const data = await res.json();
        const updatedTicket = data.ticket;

        // Send automated notification via Gmail API if token is already available (without forcing sign-in popups)
        const googleToken = getAccessToken();
        if (googleToken) {
          // Register token with backend so server can send auto-emails if needed
          fetch("/api/support/admin/register-mail-token", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ accessToken: googleToken })
          }).catch(e => console.warn("Register mail token failed:", e));

          if (updatedTicket) {
            try {
              const mailSent = await sendTicketStatusUpdateEmail(
                googleToken,
                updatedTicket,
                ticketResponseMsg.trim() || `Official Status Updated to: ${ticketNewStatus || selectedTicket.status}`,
                ticketNewStatus || selectedTicket.status
              );
              if (mailSent) {
                console.log(`[GMAIL DISPATCH SUCCESS] Status update email sent to user ${updatedTicket.email}`);
              }
            } catch (mErr) {
              console.warn("Gmail notification dispatch failed:", mErr);
            }
          }
        }

        setTicketResponseMsg("");
        await fetchSupportTickets();
      }
    } catch (err) {
      console.error("Admin update ticket failed:", err);
    } finally {
      setIsUpdatingTicket(false);
    }
  };

  // Delete Support Ticket
  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm("Are you sure you want to permanently delete this support ticket from the system?")) return;
    try {
      const res = await fetch(`/api/support/admin/tickets/${ticketId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        if (selectedTicket?.id === ticketId) setSelectedTicket(null);
        await fetchSupportTickets();
      }
    } catch (err) {
      console.error("Delete support ticket error:", err);
    }
  };

  // Handle Search Certificates
  const handleCertSearch = async (e) => {
    if (e) e.preventDefault();
    if (!token) return;
    setIsSearchingCerts(true);
    try {
      const res = await fetch(`/api/admin/certificates/search?q=${encodeURIComponent(certSearchQuery)}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCertResults(data);
      }
    } catch (err) {
      console.error("Certificate search error:", err);
    } finally {
      setIsSearchingCerts(false);
    }
  };

  // Admin Manual Flag
  const handleManualFlag = async () => {
    if (!selectedSession || !proctorActionComment.trim()) {
      setProctorActionError("Please provide a justification comment for this flag action.");
      return;
    }
    setProctorActionError(null);
    try {
      const res = await fetch(`/api/admin/sessions/${selectedSession.sessionCode}/flag`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ comment: proctorActionComment })
      });
      if (res.ok) {
        setProctorActionComment("");
        await fetchSessions();
      } else {
        const d = await res.json();
        setProctorActionError(d.error || "Failed to flag session.");
      }
    } catch (err) {
      setProctorActionError("API response timed out or failed.");
    }
  };

  // Admin Revoke Flag
  const handleRevokeFlag = async () => {
    if (!selectedSession || !proctorActionComment.trim()) {
      setProctorActionError("Please provide an explanatory comment detailing why you are revoking this flag.");
      return;
    }
    if ((selectedSession.flags || 0) <= 0) {
      setProctorActionError("Candidate does not have any active proctor flags to revoke.");
      return;
    }
    setProctorActionError(null);
    try {
      const res = await fetch(`/api/admin/sessions/${selectedSession.sessionCode}/revoke`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ comment: proctorActionComment })
      });
      if (res.ok) {
        setProctorActionComment("");
        await fetchSessions();
      } else {
        const d = await res.json();
        setProctorActionError(d.error || "Failed to revoke flag.");
      }
    } catch (err) {
      setProctorActionError("API response timed out.");
    }
  };

  // Admin Terminate/Disqualify Session
  const handleTerminateSession = async () => {
    if (!selectedSession || !proctorActionComment.trim()) {
      setProctorActionError("A secure proctor comment is required to forcibly disqualify this session.");
      return;
    }
    setProctorActionError(null);
    try {
      const res = await fetch(`/api/admin/sessions/${selectedSession.sessionCode}/terminate`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ comment: proctorActionComment })
      });
      if (res.ok) {
        setProctorActionComment("");
        await fetchSessions();
      } else {
        const d = await res.json();
        setProctorActionError(d.error || "Failed to terminate session.");
      }
    } catch (err) {
      setProctorActionError("API request failed.");
    }
  };

  // Delete Question CRUD
  const handleDeleteQuestion = async (id) => {
    if (!window.confirm("ARE YOU ABSOLUTELY SURE YOU WANT TO PERMANENTLY REMOVE THIS QUESTION FROM THE COMPLIANCE REGISTRY? This is irreversible.")) return;
    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchQuestions();
      } else {
        alert("Failed to delete question from central registry.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Open Edit Question Modal
  const openEditQuestion = (q) => {
    setEditingQuestion(q);
    setQuestionForm({
      title: q.title || "",
      type: q.type || "General Code",
      location: q.location || "Custom Zone",
      difficulty: q.difficulty || "MEDIUM",
      points: q.points || 10,
      description: q.description || "",
      options: { 
        A: q.options?.A || "", 
        B: q.options?.B || "", 
        C: q.options?.C || "", 
        D: q.options?.D || "" 
      },
      correctId: q.correctId || "A",
      nbcClauses: q.nbcClauses || "",
      bnsSection: q.bnsSection || "",
      hazardLevel: q.hazardLevel || "HIGH",
      fact: q.fact || ""
    });
    setQuestionModalMode("edit");
    setQuestionFormError(null);
    setShowQuestionModal(true);
  };

  // Open Add Question Modal
  const openAddQuestion = () => {
    setEditingQuestion(null);
    setQuestionForm({
      title: "",
      type: "General Code",
      location: "Custom Zone",
      difficulty: "MEDIUM",
      points: 10,
      description: "",
      options: { A: "", B: "", C: "", D: "" },
      correctId: "A",
      nbcClauses: "",
      bnsSection: "",
      hazardLevel: "HIGH",
      fact: ""
    });
    setQuestionModalMode("add");
    setQuestionFormError(null);
    setShowQuestionModal(true);
  };

  // Submit Add/Edit Question
  const handleQuestionFormSubmit = async (e) => {
    e.preventDefault();
    setQuestionFormError(null);

    // Basic Validation
    if (!questionForm.title || !questionForm.description || !questionForm.options.A || !questionForm.options.B || !questionForm.options.C || !questionForm.options.D || !questionForm.nbcClauses || !questionForm.bnsSection) {
      setQuestionFormError("All fields including NBC Clauses, BNS Section, and 4 Options are strictly required.");
      return;
    }

    try {
      const url = questionModalMode === "add" 
        ? "/api/admin/questions" 
        : `/api/admin/questions/${editingQuestion.id}`;
      
      const method = questionModalMode === "add" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(questionForm)
      });

      if (res.ok) {
        setShowQuestionModal(false);
        fetchQuestions();
      } else {
        const d = await res.json();
        setQuestionFormError(d.error || "Failed to submit question to database.");
      }
    } catch (err) {
      setQuestionFormError("Central database connection timeout.");
    }
  };

  // Download entire question bank
  const handleDownloadQuestionBank = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(questions, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `NBC_compliance_questionbank_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export filtered questions to CSV (Sheets compatible)
  const handleExportCSV = () => {
    const headers = [
      "Question ID",
      "Title",
      "Category",
      "Hazard Level",
      "NBC Clauses",
      "BNS Section",
      "Points",
      "Description",
      "Option A",
      "Option B",
      "Option C",
      "Option D",
      "Correct Option ID",
      "Fact/Rationale"
    ];

    const rows = filteredQuestions.map(q => [
      q.questionId || q.id || "",
      q.title || "",
      q.type || "",
      q.hazardLevel || "",
      q.nbcClauses || "",
      q.bnsSection || "",
      q.points || 10,
      q.description || "",
      q.options?.A || "",
      q.options?.B || "",
      q.options?.C || "",
      q.options?.D || "",
      q.correctId || "A",
      q.fact || ""
    ]);

    const escapeCSV = (field) => {
      const val = String(field ?? "");
      if (val.includes(",") || val.includes('"') || val.includes("\n") || val.includes("\r")) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(escapeCSV).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `NBC_Questions_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export filtered questions to PDF
  const handleExportPDF = () => {
    const prtWin = window.open("", "_blank");
    if (!prtWin) return;

    prtWin.document.write(`
      <html>
        <head>
          <title>NBC REGULATORY EXAM QUESTION BANK - AUDIT DOSSIER</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; background-color: #fff; color: #000; padding: 40px; }
            .header { text-align: center; border-bottom: 3px double #000; padding-bottom: 20px; margin-bottom: 30px; }
            .meta-info { margin-bottom: 20px; font-size: 11px; text-transform: uppercase; border-bottom: 1px dashed #000; padding-bottom: 10px; }
            .question-block { margin-bottom: 30px; page-break-inside: avoid; border-bottom: 1px solid #ccc; padding-bottom: 15px; }
            .q-title { font-weight: bold; font-size: 14px; margin-bottom: 5px; text-transform: uppercase; }
            .q-meta { font-size: 11px; color: #444; margin-bottom: 10px; }
            .q-desc { font-size: 12px; margin-bottom: 10px; line-height: 1.5; }
            .options { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 11px; margin-bottom: 10px; }
            .correct-ans { font-weight: bold; color: #15803d; }
            .rationale { font-size: 11px; font-style: italic; color: #555; background: #f9f9f9; padding: 8px; border-left: 2px solid #ccc; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>BUILT TO BREAK - SPACIAL COMPLIANCE RESEARCH</h2>
            <h1>CENTRAL REGISTERED COMPLIANCE QUESTION BANK</h1>
            <h3>TOTAL VISIBLE EXAM QUESTIONS: ${filteredQuestions.length}</h3>
          </div>

          <div class="meta-info">
            EXPORT TIMESTAMP: ${new Date().toLocaleString()}<br/>
            STATUS: SECURED MUNICIPAL RECORDS REGISTRY
          </div>

          ${filteredQuestions.map((q, idx) => `
            <div class="question-block">
              <div class="q-title">Q${idx + 1}. [${q.questionId || q.id}] ${q.title}</div>
              <div class="q-meta">
                <strong>CATEGORY:</strong> ${q.type || "General Code"} | 
                <strong>HAZARD LEVEL:</strong> ${q.hazardLevel || "HIGH"} | 
                <strong>NBC CLAUSES:</strong> ${q.nbcClauses || "N/A"} | 
                <strong>BNS SECTION:</strong> ${q.bnsSection || "N/A"} | 
                <strong>POINTS:</strong> ${q.points || 10} pts
              </div>
              <div class="q-desc">${q.description}</div>
              <div class="options">
                <div>A: ${q.options?.A || ""}</div>
                <div>B: ${q.options?.B || ""}</div>
                <div>C: ${q.options?.C || ""}</div>
                <div>D: ${q.options?.D || ""}</div>
              </div>
              <div class="correct-ans">✓ CORRECT ANSWER: OPTION ${q.correctId || "A"}</div>
              ${q.fact ? `<div class="rationale"><strong>RATIONALE:</strong> ${q.fact}</div>` : ""}
            </div>
          `).join("")}

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    prtWin.document.close();
  };

  // Export and print everyone's certificate with Admin Copy Watermark
  const handleDownloadAllCertificatesPDF = () => {
    if (certResults.length === 0) {
      alert("No certificate records available to download. Run a search or refresh first.");
      return;
    }
    const prtWin = window.open("", "_blank");
    if (!prtWin) return;

    prtWin.document.write(`
      <html>
        <head>
          <title>NBC CENTRAL REGISTRY - ALL COMPLIANCE CERTIFICATES (ADMIN COPIES)</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 0;
            }
            body { 
              margin: 0; 
              padding: 0; 
              font-family: 'Courier New', Courier, monospace; 
              background: #fff; 
              color: #000; 
            }
            .cert-page {
              position: relative;
              box-sizing: border-box;
              width: 100%;
              height: 100vh;
              padding: 60px 50px;
              border: 15px double #111;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              page-break-after: always;
            }
            /* Remove page break after last certificate */
            .cert-page:last-child {
              page-break-after: avoid;
            }
            .cert-header {
              text-align: center;
            }
            .cert-header h1 { 
              font-size: 28px; 
              font-weight: 900; 
              margin: 0 0 10px 0; 
              text-transform: uppercase; 
              letter-spacing: 2px;
            }
            .cert-header h3 {
              font-size: 14px;
              font-weight: bold;
              margin: 0;
              letter-spacing: 1px;
            }
            .admin-header-tag {
              background-color: #fee2e2; 
              border: 1px solid #ef4444; 
              color: #b91c1c; 
              font-size: 11px; 
              font-weight: bold; 
              padding: 6px 14px; 
              text-transform: uppercase; 
              margin-bottom: 20px; 
              display: inline-block;
              letter-spacing: 1px;
            }
            .cert-body {
              text-align: center;
              font-size: 14px; 
              line-height: 1.6; 
              margin: 20px auto; 
              max-width: 650px;
            }
            .cert-grid { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 15px; 
              margin: 30px auto; 
              text-align: left; 
              max-width: 550px; 
              border-top: 1px dashed #000;
              border-bottom: 1px dashed #000;
              padding: 20px 0;
              font-size: 13px;
            }
            .cert-footer {
              text-align: center;
              margin-top: auto;
            }
            .cert-code { 
              font-size: 18px; 
              font-weight: bold; 
              border: 1px dashed #000; 
              padding: 8px 15px; 
              display: inline-block; 
              margin-bottom: 20px;
            }
            .watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-30deg);
              font-size: 58px;
              color: rgba(239, 68, 68, 0.12); /* semi-transparent red */
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 10px;
              border: 10px solid rgba(239, 68, 68, 0.12);
              padding: 15px 30px;
              pointer-events: none;
              white-space: nowrap;
              font-family: Arial, Helvetica, sans-serif;
              z-index: 1000;
            }
            .sig-block {
              display: flex;
              justify-content: space-between;
              margin-top: 20px;
              font-size: 9px;
              font-weight: bold;
              text-transform: uppercase;
              color: #444;
            }
            .sig-line {
              border-top: 1px solid #111;
              padding-top: 5px;
              width: 220px;
            }
          </style>
        </head>
        <body>
          ${certResults.map((cert) => `
            <div class="cert-page">
              <div class="watermark">ADMIN COPY</div>
              
              <div class="cert-header">
                <div class="admin-header-tag">⚠️ ADMIN COPY - FOR MUNICIPAL SECURE ARCHIVES</div>
                <h1>NATIONAL COMPLIANCE CREDENTIAL</h1>
                <h3>BUILT TO BREAK MUNICIPAL RESEARCH INITIATIVE</h3>
              </div>
              
              <div class="cert-body">
                <p>This document officially verifies that candidate <strong>${cert.userName}</strong> has undergone exhaustive training and evaluation in the safety guidelines and rules set forth by the National Building Code (NBC) of India and relevant fire provisions.</p>
                
                <div class="cert-grid">
                  <div><strong>JURISDICTION:</strong> ${cert.userState}</div>
                  
                  <div><strong>ISSUE TIMESTAMP:</strong> ${cert.certDate}</div>
                  <div><strong>ID DOCUMENT:</strong> ${cert.idType?.toUpperCase() || "AADHAAR"} (${cert.idNumber || "MAPPED SYSTEM"})</div>
                </div>
              </div>

              <div class="cert-footer">
                <div class="cert-code">SECURITY VERIFICATION CODE: ${cert.certCode}</div>
                
                <div class="sig-block">
                  <div class="sig-line">AI PROCTOR LOGS DIGITALLY CERTIFIED</div>
                  <div class="sig-line">MUNICIPAL DEPUTY COMMISSIONER NOC SIGNATURE</div>
                </div>
              </div>
            </div>
          `).join("")}

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    prtWin.document.close();
  };

  // Print Report Generator
  const printReport = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const auditIntegrityScore = Math.max(0, 100 - (selectedSession.flags || 0) * 10);
    const logsReversed = [...(selectedSession.proctorLogs || [])].reverse();

    printWindow.document.write(`
      <html>
        <head>
          <title>NBC COGNITIVE PROCTORING AUDIT REPORT - ${selectedSession.sessionCode}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; background-color: #fff; color: #000; padding: 40px; }
            .header { text-align: center; border-bottom: 3px double #000; padding-bottom: 20px; margin-bottom: 30px; }
            .section { margin-bottom: 25px; border-bottom: 1px dashed #000; padding-bottom: 15px; }
            .title { font-weight: bold; text-transform: uppercase; font-size: 18px; margin-bottom: 10px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
            .label { font-weight: bold; }
            .terminal { background: #f0f0f0; border: 1px solid #000; padding: 15px; font-size: 11px; white-space: pre-wrap; line-height: 1.4; }
            .flag-high { color: #f00; font-weight: bold; }
            .sig-block { margin-top: 50px; display: grid; grid-template-columns: 1fr 1fr; gap: 50px; }
            .sig-line { border-top: 1px solid #000; margin-top: 40px; text-align: center; font-size: 11px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>BUILT TO BREAK - SPACIAL COMPLIANCE RESEARCH</h2>
            <h1>INTELLIGENT COGNITIVE PROCTORING DOSSIER</h1>
            <h3>UNIQUE REGISTRY ID: ${selectedSession.sessionCode}</h3>
          </div>

          <div class="section">
            <div class="title">I. CANDIDATE IDENTIFICATION PROFILE</div>
            <div class="grid">
              <div><span class="label">CANDIDATE NAME:</span> ${selectedSession.userName}</div>
              <div><span class="label">JURISDICTION (STATE):</span> ${selectedSession.userState}</div>
              <div><span class="label">SESSION STATUS:</span> ${selectedSession.status?.toUpperCase()}</div>
              
            </div>
          </div>

          <div class="section">
            <div class="title">II. AI BIOMETRIC TELEMETRY EVALUATION</div>
            <div class="grid">
              <div><span class="label">TOTAL PROCTOR FLAGS TRIGGERED:</span> ${selectedSession.flags || 0} / 10</div>
              <div><span class="label">SECURITY INTEGRITY INDEX:</span> ${auditIntegrityScore}%</div>
              <div><span class="label">VERDICT STATUS:</span> ${selectedSession.status === "disqualified" ? "DISQUALIFIED / NON-COMPLIANT" : selectedSession.status === "completed" ? "APPROVED FOR CERTIFICATION" : "ACTIVE SESSION / PENDING"}</div>
              <div><span class="label">LAST COMPLIANCE SYNC:</span> ${new Date(selectedSession.updatedAt).toLocaleString()}</div>
            </div>
          </div>

          <div class="section">
            <div class="title">III. DEEP METRIC AUDIT LOGS (CHRONOLOGICAL ORDER)</div>
            <div class="terminal">${
              logsReversed.map((log) => `[${log.timestamp || "TELEMETRY"}] ${log.message || log}`).join("\n")
            }</div>
          </div>

          <div class="section">
            <div class="title">IV. REGULATORY DOCUMENTATION DECLARATION</div>
            <p style="font-size: 11px; text-align: justify; line-height: 1.5;">
              This report represents a comprehensive evaluation generated by the National Building Code (NBC) Intelligent Cognitive Proctor. System flags monitor head alignment, gaze redirection, ambient sound load, and tab suspension in accordance with safety verification guidelines. All manual overrides applied by certified municipal proctors include documented justifications.
            </p>
          </div>

          <div class="sig-block">
            <div>
              <div class="sig-line">AUTOMATED AI COGNITIVE PROCTOR SYSTEM VERIFICATION</div>
            </div>
            <div>
              <div class="sig-line">CERTIFIED MUNICIPAL FIRE PROCTOR SIGNATURE</div>
            </div>
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Filtered Question list
  const filteredQuestions = questions.filter(q => {
    if (!questionSearchQuery) return true;
    const lower = questionSearchQuery.toLowerCase();
    return (
      q.title?.toLowerCase().includes(lower) ||
      q.description?.toLowerCase().includes(lower) ||
      q.type?.toLowerCase().includes(lower) ||
      q.questionId?.toLowerCase().includes(lower)
    );
  });

  return (
    <div className="fixed inset-0 bg-zinc-950/98 backdrop-blur-md z-50 overflow-y-auto font-mono text-zinc-100 flex flex-col border-t-2 border-red-600">
      
      {/* 1. LOGIN SCREEN OVERLAY */}
      <AnimatePresence>
        {!isAuthenticated && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="flex-1 flex items-center justify-center p-6 bg-zinc-950 relative min-h-screen"
          >
            {/* Background cyber lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />
            
            <div className="w-full max-w-md bg-[#08080a] border border-zinc-900 p-8 relative shadow-2xl relative">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-600" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-600" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-600" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-600" />

              <div className="text-center mb-6">
                <div className="inline-flex p-3 bg-red-950/20 border border-red-500/30 text-red-500 mb-3 rounded-none">
                  <Lock className="w-6 h-6 animate-pulse" />
                </div>
                <h1 className="text-lg font-black tracking-widest text-zinc-100 uppercase">
                  NBC ADMIN CONSOLE
                </h1>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">
                  MUNICIPAL COMPLIANCE CONTROL ROOM AUTHENTICATION
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
                    ADMIN IDENTITY CARD ID:
                  </label>
                  <input
                    type="text"
                    required
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-900 px-3 py-2 text-xs font-mono text-zinc-100 focus:outline-none focus:border-red-600"
                    placeholder="e.g. Group30ExamAdmin"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
                    SECURITY ACCESS PASSKEY:
                  </label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-900 px-3 py-2 text-xs font-mono text-zinc-100 focus:outline-none focus:border-red-600"
                    placeholder="Case-Sensitive Passphrase"
                  />
                </div>

                {loginError && (
                  <div className="p-3 bg-red-950/20 border border-red-600/30 text-red-400 text-[10px] uppercase leading-relaxed font-bold">
                    ⚠️ {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-black uppercase tracking-widest cursor-pointer transition-all border border-red-500 disabled:opacity-50"
                >
                  {isLoggingIn ? "DECRYPTING SECURITY KEYWORDS..." : "INITIALIZE SECURE SYSTEM CONSOLE ➔"}
                </button>
              </form>
              
              <button
                onClick={onClose}
                className="w-full mt-4 py-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 text-zinc-500 hover:text-white font-mono text-[10px] uppercase tracking-widest cursor-pointer transition-all"
              >
                ABORT CONSOLE ACCESS
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. AUTHENTICATED SYSTEM CONSOLE VIEWS */}
      {isAuthenticated && (
        <div className="flex-1 flex flex-col h-full">
          
          {/* Dashboard Header */}
          <header className="bg-[#08080b] border-b border-zinc-900 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <div>
                <h1 className="text-sm font-black tracking-widest text-zinc-100 uppercase">
                  NBC COMPLIANCE CONTROL CONSOLE
                </h1>
                <p className="text-[9px] text-zinc-500 uppercase tracking-widest mt-0.5">
                  SYSTEM OPERATOR ID: <strong className="text-zinc-300 font-mono">{username}</strong> (REGIONAL CHIEF CONSOLES)
                </p>
              </div>
            </div>

            {/* View navigation buttons */}
            <div className="flex flex-wrap items-center gap-1 bg-zinc-950 p-1 border border-zinc-900">
              <button
                onClick={() => setActiveTab("proctoring")}
                className={`px-4 py-2 text-[10.5px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "proctoring"
                    ? "bg-red-950/50 text-red-400 border border-red-800/40"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                Live Proctoring ({sessions.length})
              </button>
              <button
                onClick={() => setActiveTab("questions")}
                className={`px-4 py-2 text-[10.5px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "questions"
                    ? "bg-red-950/50 text-red-400 border border-red-800/40"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                Question Bank
              </button>
              <button
                onClick={() => setActiveTab("certificates")}
                className={`px-4 py-2 text-[10.5px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "certificates"
                    ? "bg-red-950/50 text-red-400 border border-red-800/40"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                Certificates Search
              </button>
              <button
                onClick={() => setActiveTab("support")}
                className={`px-4 py-2 text-[10.5px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "support"
                    ? "bg-sky-950/50 text-sky-400 border border-sky-800/40"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                <LifeBuoy className="w-3.5 h-3.5" />
                <span>Support Tickets ({supportTickets.length})</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 text-zinc-400 hover:text-white text-[10px] uppercase font-bold tracking-widest cursor-pointer"
              >
                TERMINATE ACCESS (LOGOUT)
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-red-950/20 border border-red-600/30 text-red-400 hover:text-white hover:bg-red-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </header>

          <main className="flex-1 p-6 space-y-6">

            {/* TAB 1: LIVE PROCTORING SYSTEM */}
            {activeTab === "proctoring" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start">
                
                {/* Left side: Ongoing testing list */}
                <div className="lg:col-span-5 bg-[#08080a] border border-zinc-900 p-4 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                      ACTIVE SESSIONS REGISTRY
                    </span>
                    <button 
                      onClick={fetchSessions}
                      className="p-1 bg-zinc-950 border border-zinc-900 hover:border-zinc-700 hover:text-white cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${isFetchingSessions ? "animate-spin" : ""}`} />
                    </button>
                  </div>

                  {sessions.length === 0 ? (
                    <div className="text-center py-10 font-mono text-[10px] text-zinc-600 uppercase tracking-widest">
                      NO ACTIVE ONGOING EXAM SESSIONS DISCOVERED IN CENTRAL NETWORK...
                    </div>
                  ) : (
                    <div className="space-y-2 overflow-y-auto max-h-[580px] pr-1">
                      {sessions.map((session) => {
                        const isSelected = selectedSession?.sessionCode === session.sessionCode;
                        const statusColor = 
                          session.status === "disqualified" ? "text-red-500 border-red-950 bg-red-950/20" :
                          session.status === "completed" ? "text-emerald-500 border-emerald-950 bg-emerald-950/20" :
                          "text-yellow-500 border-yellow-950 bg-yellow-950/20";
                        return (
                          <div
                            key={session.sessionCode}
                            onClick={() => setSelectedSession(session)}
                            className={`p-3 border transition-all cursor-pointer flex justify-between items-center ${
                              isSelected 
                                ? "bg-red-950/10 border-red-600/50" 
                                : "bg-zinc-950/40 border-zinc-900 hover:border-zinc-800"
                            }`}
                          >
                            <div className="space-y-1.5 min-w-0 pr-2">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-zinc-100 truncate block max-w-[150px]">
                                  {session.userName}
                                </span>
                                <span className={`text-[8.5px] border font-black px-1.5 uppercase ${statusColor}`}>
                                  {session.status}
                                </span>
                              </div>
                              <div className="text-[9.5px] font-mono text-zinc-500 flex items-center gap-1.5">
                                <MapPin className="w-3 h-3 shrink-0" />
                                <span>{session.userState || "Delhi NCR"}</span>
                                <span>•</span>
                                <span className="font-mono text-zinc-400">{session.sessionCode}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[9px] text-zinc-500">
                                <span>Question {session.currentQuestionIndex + 1}/20</span>
                                <span>|</span>
                                <span className="flex items-center gap-1 text-red-400">
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  Flags: {session.flags ?? 0}/10
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0" />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Right side: Detailed monitor & override */}
                <div className="lg:col-span-7 bg-[#08080a] border border-zinc-900 p-5 space-y-5">
                  {!selectedSession ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
                      <Activity className="w-10 h-10 text-zinc-700 animate-pulse" />
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
                        SELECT AN EXAMINEE FROM THE ACTIVE LIST TO DEPLOY REAL-TIME AI BIOMETRIC AND MANUAL INTERVENTION PROTOCOLS
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      
                      {/* Selected Header */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-900 pb-3">
                        <div>
                          <h3 className="text-sm font-black text-zinc-100 uppercase">
                            Examinee: {selectedSession.userName}
                          </h3>
                          <p className="text-[9.5px] text-zinc-500 font-mono mt-0.5">
                            Jurisdiction: <span className="text-zinc-300">{selectedSession.userState}</span> | Session ID: <span className="text-zinc-300 font-bold">{selectedSession.sessionCode}</span>
                          </p>
                        </div>
                        <button
                          onClick={() => setShowReportModal(true)}
                          className="px-3 py-1.5 bg-red-950/30 hover:bg-red-950/60 border border-red-500/30 hover:border-red-500/60 text-red-400 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                        >
                          Telemetry Diagnostics Report
                        </button>
                      </div>

                      {/* Photo & Basic stats */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                        
                        {/* Base64 webcam capture snapshot */}
                        <div className="md:col-span-4 bg-zinc-950 border border-zinc-900 p-2 relative flex flex-col items-center justify-center min-h-[160px]">
                          <div className="absolute top-1 left-2 text-[7.5px] font-black text-red-500 uppercase tracking-widest font-mono z-10">
                            LIVE FEED STREAM
                          </div>
                          {liveFrames[selectedSession.sessionCode] || selectedSession.userPhoto ? (
                            <img
                              src={liveFrames[selectedSession.sessionCode] || selectedSession.userPhoto}
                              alt="Examinee live snapshot"
                              referrerPolicy="no-referrer"
                              className="w-full h-auto object-cover border border-zinc-900"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-zinc-800 py-6">
                              <Camera className="w-8 h-8 text-zinc-800 mb-2" />
                              <span className="text-[8px] uppercase tracking-widest font-black">NO IMAGE SYNCED</span>
                            </div>
                          )}
                        </div>

                        {/* Telemetry diagnostics */}
                        <div className="md:col-span-8 space-y-3 bg-zinc-950/50 p-3 border border-zinc-900/60">
                          <span className="text-[8.5px] font-black text-zinc-500 uppercase tracking-widest block">
                            EXAM DIAGNOSTIC COMPLIANCE
                          </span>
                          <div className="grid grid-cols-2 gap-3 text-[10.5px]">
                            <div>
                              <span className="text-zinc-500 block text-[9px] uppercase">STATUS CODE:</span>
                              <strong className="text-zinc-200">{selectedSession.status?.toUpperCase()}</strong>
                            </div>
                            <div>
                            </div>
                            <div>
                              <span className="text-zinc-500 block text-[9px] uppercase">ACTIVE WARNING FLAGS:</span>
                              <strong className="text-red-400 font-bold">{selectedSession.flags ?? 0} / 10</strong>
                            </div>
                            <div>
                              <span className="text-zinc-500 block text-[9px] uppercase">INTEGRITY COMPLIANCE:</span>
                              <strong className={(selectedSession.flags || 0) >= 8 ? "text-red-500 font-bold" : "text-emerald-400 font-bold"}>
                                {Math.max(0, 100 - (selectedSession.flags || 0) * 10)}%
                              </strong>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-zinc-900 flex items-center gap-2">
                            <span className="text-[9px] text-zinc-500 font-bold">MONITORING TIMELINE:</span>
                            <span className="text-[9px] text-zinc-400 font-mono">
                              {new Date(selectedSession.updatedAt).toLocaleTimeString()} (Latest Sync)
                            </span>
                          </div>
                        </div>

                      </div>

                      {/* Live Terminal Log */}
                      <div className="space-y-2">
                        <span className="text-[9px] font-black text-red-500 uppercase tracking-widest block">
                          AI PROCTOR EVENT INTERNALS
                        </span>
                        <div className="bg-zinc-950 border border-zinc-900 p-3 h-48 overflow-y-auto font-mono text-[10px] space-y-1.5 scrollbar-thin scrollbar-thumb-zinc-800">
                          {(!selectedSession.proctorLogs || selectedSession.proctorLogs.length === 0) ? (
                            <div className="text-zinc-700 uppercase tracking-widest text-center py-10">
                              BIOMETRIC EVENTS IN PROGRESS...
                            </div>
                          ) : (
                            selectedSession.proctorLogs.map((log, index) => {
                              // If log is a string (legacy) or object (new manual override logs)
                              const msg = typeof log === "string" ? log : log.message;
                              const timestamp = log.timestamp || "AUTO";
                              const isManual = log.type === "MANUAL";
                              const isFlag = log.action === "FLAG" || msg.includes("MALPRACTICE FLAG");
                              const isUnflag = log.action === "UNFLAG";

                              let logStyle = "text-zinc-500";
                              if (isManual) {
                                logStyle = "text-amber-400 font-bold border-l-2 border-amber-600 pl-1.5";
                              } else if (isFlag) {
                                logStyle = "text-red-400 border-l-2 border-red-600 pl-1.5";
                              } else if (isUnflag) {
                                logStyle = "text-emerald-400 border-l-2 border-emerald-600 pl-1.5";
                              } else if (msg.includes("SUCCESS")) {
                                logStyle = "text-emerald-500 font-medium";
                              }

                              return (
                                <div key={index} className={`leading-relaxed ${logStyle}`}>
                                  [{timestamp}] {msg}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                      {/* Proctor Manual Intervention Controls */}
                      <div className="space-y-3 pt-3 border-t border-zinc-900">
                        <span className="text-[9.5px] font-black text-zinc-400 uppercase tracking-widest block">
                          PROCTOR COMPLIANCE OVERRIDES & MANUAL AUDITS
                        </span>

                        <div className="space-y-2">
                          <label className="block text-[8.5px] text-zinc-500 uppercase tracking-wider font-mono">
                            PROCTOR COMMENTS & AUDIT DOCUMENTATION (REQUIRED FOR MANUAL INTERVENTIONS):
                          </label>
                          <textarea
                            value={proctorActionComment}
                            onChange={(e) => setProctorActionComment(e.target.value)}
                            rows={2}
                            placeholder="Type documentation/comments here detailing the exact reasons why you are manually flagging, revoking, or terminating this candidate's exam..."
                            className="w-full bg-zinc-950 border border-zinc-900 p-2.5 text-xs text-zinc-100 placeholder-zinc-700 font-mono focus:outline-none focus:border-red-600"
                          />
                        </div>

                        {proctorActionError && (
                          <div className="p-2.5 bg-red-950/20 border border-red-600/30 text-red-400 text-[10px] uppercase font-bold">
                            ⚠️ {proctorActionError}
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                          <button
                            onClick={handleManualFlag}
                            className="py-2.5 bg-yellow-950/30 hover:bg-yellow-950/60 border border-yellow-600/40 text-yellow-500 hover:text-yellow-400 text-[9.5px] font-black uppercase tracking-widest cursor-pointer transition-colors"
                          >
                            ⚠️ APPLY MANUAL FLAG
                          </button>
                          <button
                            onClick={handleRevokeFlag}
                            disabled={(selectedSession.flags || 0) === 0}
                            className="py-2.5 bg-emerald-950/20 hover:bg-emerald-950/50 border border-emerald-600/40 text-emerald-500 hover:text-emerald-400 text-[9.5px] font-black uppercase tracking-widest cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            ✓ REVOKE ACTIVE FLAG
                          </button>
                          <button
                            onClick={handleTerminateSession}
                            className="py-2.5 bg-red-950/40 hover:bg-red-950/70 border border-red-600/40 text-red-500 hover:text-white text-[9.5px] font-black uppercase tracking-widest cursor-pointer transition-colors"
                          >
                            ❌ FORCIBLY TERMINATE EXAM
                          </button>
                        </div>
                      </div>

                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB 2: QUESTIONS CRUD BANK */}
            {activeTab === "questions" && (
              <div className="bg-[#08080a] border border-zinc-900 p-5 space-y-4">
                
                {/* Search & Actions bar */}
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 border-b border-zinc-900 pb-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search questions by code, scenario keywords, or category..."
                      value={questionSearchQuery}
                      onChange={(e) => setQuestionSearchQuery(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-900 pl-9 pr-4 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleDownloadQuestionBank}
                      className="px-3 py-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 text-zinc-300 hover:text-white text-[10.5px] font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
                      title="Export entire database bank to JSON format"
                    >
                      <DownloadCloud className="w-3.5 h-3.5" />
                      <span>EXPORT (.JSON)</span>
                    </button>
                    <button
                      onClick={handleExportCSV}
                      className="px-3 py-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 text-zinc-300 hover:text-white text-[10.5px] font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
                      title="Export filtered questions to a spreadsheet compatible CSV file"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-500" />
                      <span>EXPORT TO SHEETS (.CSV)</span>
                    </button>
                    <button
                      onClick={handleExportPDF}
                      className="px-3 py-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 text-zinc-300 hover:text-white text-[10.5px] font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
                      title="Generate a clean printable HTML document of all questions"
                    >
                      <Printer className="w-3.5 h-3.5 text-red-500" />
                      <span>EXPORT TO PDF</span>
                    </button>
                    <button
                      onClick={openAddQuestion}
                      className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white text-[10.5px] font-black uppercase tracking-wider cursor-pointer transition-all border border-red-500 flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 text-white" />
                      <span>CREATE NEW QUESTION</span>
                    </button>
                  </div>
                </div>

                {/* Questions Table */}
                <div className="overflow-x-auto">
                  {isFetchingQuestions ? (
                    <div className="text-center py-16 uppercase text-zinc-500 text-xs animate-pulse">
                      Retrieving all NBC Question Records from PostgreSQL Database...
                    </div>
                  ) : filteredQuestions.length === 0 ? (
                    <div className="text-center py-16 text-zinc-600 text-xs uppercase">
                      No matching question records found inside registry.
                    </div>
                  ) : (
                    <table className="w-full border-collapse text-left font-mono text-[10.5px]">
                      <thead>
                        <tr className="border-b border-zinc-900 text-zinc-500 uppercase tracking-widest text-[9px]">
                          <th className="py-3 px-2 font-black">CODE ID</th>
                          <th className="py-3 px-2 font-black">HAZARD LEVEL / CATEGORY</th>
                          <th className="py-3 px-2 font-black">SCENARIO TITLE</th>
                          <th className="py-3 px-2 font-black">NBC CLAUSES</th>
                          
                          <th className="py-3 px-2 font-black text-right">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredQuestions.map((q) => {
                          const hazardColor = 
                            q.hazardLevel === "HIGH" ? "text-red-500 bg-red-950/20 border-red-950" :
                            q.hazardLevel === "MEDIUM" ? "text-yellow-500 bg-yellow-950/20 border-yellow-950" :
                            "text-green-500 bg-green-950/20 border-green-950";
                          return (
                            <tr key={q.id} className="border-b border-zinc-900/40 hover:bg-zinc-950/40">
                              <td className="py-3 px-2 font-bold text-zinc-400">{q.questionId}</td>
                              <td className="py-3 px-2">
                                <div className="flex items-center gap-2">
                                  <span className={`text-[8px] font-black px-1 border uppercase ${hazardColor}`}>
                                    {q.hazardLevel || "HIGH"}
                                  </span>
                                  <span className="text-zinc-500">{q.type}</span>
                                </div>
                              </td>
                              <td className="py-3 px-2 font-medium max-w-xs truncate text-zinc-100">{q.title}</td>
                              <td className="py-3 px-2 text-zinc-400 font-bold">{q.nbcClauses || "N/A"}</td>
                              
                              <td className="py-3 px-2 text-right">
                                <div className="inline-flex items-center gap-2">
                                  <button
                                    onClick={() => openEditQuestion(q)}
                                    className="p-1 text-zinc-500 hover:text-white hover:bg-zinc-900 cursor-pointer border border-transparent hover:border-zinc-800"
                                    title="Edit Question details"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteQuestion(q.id)}
                                    className="p-1 text-zinc-500 hover:text-red-500 hover:bg-zinc-900 cursor-pointer border border-transparent hover:border-zinc-800"
                                    title="Permanently Delete Question"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                  <div className="text-center py-4 font-mono text-[10px] text-zinc-500 border-t border-zinc-900/60 mt-2">
                    ✓ SECURE DATAREGISTRY: RETRIEVED AND RENDERING ALL {filteredQuestions.length} REGISTERED QUESTION RECORDS.
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: CERTIFICATES DIRECTORY DIRECT SEARCH */}
            {activeTab === "certificates" && (
              <div className="bg-[#08080a] border border-zinc-900 p-5 space-y-4">
                
                <div className="border-b border-zinc-900 pb-4 space-y-3">
                  <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">
                    MUNICIPAL CERTIFICATE ROSTER SCANNER
                  </h3>
                  <p className="text-[10px] text-zinc-500 max-w-2xl font-light">
                    Search and pull generated certificate records and examinee biometrics securely. Queries search concurrently by Candidate Person Name, Jurisdictional State, or Unique Document Code.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <form onSubmit={handleCertSearch} className="flex gap-2 w-full max-w-2xl">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                        <input
                          type="text"
                          placeholder="Search Candidate Name, Jurisdictional State (e.g. Sikkim), or Unique Certificate ID..."
                          value={certSearchQuery}
                          onChange={(e) => setCertSearchQuery(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-900 pl-9 pr-4 py-2.5 text-xs font-mono text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-red-600"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleCertSearch}
                        disabled={isSearchingCerts}
                        className="px-6 py-2 bg-red-600 hover:bg-red-500 border border-red-500 text-white text-xs font-black uppercase tracking-widest cursor-pointer transition-all disabled:opacity-40"
                      >
                        {isSearchingCerts ? "SCANNING AUDIT LOGS..." : "EXECUTE SEARCH"}
                      </button>
                    </form>

                    {certResults.length > 0 && (
                      <button
                        onClick={handleDownloadAllCertificatesPDF}
                        className="w-full sm:w-auto px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-100 hover:text-white text-xs font-black uppercase tracking-widest cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-lg"
                      >
                        <Printer className="w-4 h-4 text-red-500" />
                        <span>DOWNLOAD EVERYONE'S CERTIFICATE (ADMIN COPIES)</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  {certResults.length === 0 ? (
                    <div className="text-center py-16 text-zinc-600 text-xs uppercase font-mono tracking-widest">
                      ENTER SEARCH FILTER AND TRIGGER QUERY SCANNER...
                    </div>
                  ) : (
                    <table className="w-full border-collapse text-left font-mono text-[10.5px]">
                      <thead>
                        <tr className="border-b border-zinc-900 text-zinc-500 uppercase tracking-widest text-[9px]">
                          <th className="py-3 px-2 font-black">ID TYPE</th>
                          <th className="py-3 px-2 font-black">CANDIDATE NAME</th>
                          <th className="py-3 px-2 font-black">JURISDICTION</th>
                          <th className="py-3 px-2 font-black">SCORE %</th>
                          <th className="py-3 px-2 font-black">CLEARANCE STATUS</th>
                          <th className="py-3 px-2 font-black">ISSUE DATE</th>
                          <th className="py-3 px-2 font-black">DOCUMENT REGISTRY ID</th>
                          <th className="py-3 px-2 font-black text-right">TELEMETRY ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {certResults.map((cert) => {
                          const score = cert.finalScorePercent ?? 0;
                          const passed = score >= 85;
                          return (
                          <tr key={cert.id} className="border-b border-zinc-900/40 hover:bg-zinc-950/40">
                            <td className="py-3 px-2">
                              <span className="text-[8.5px] font-black uppercase px-2 py-0.5 border border-zinc-800 bg-zinc-900 text-zinc-300">
                                {cert.idType?.toUpperCase() || "AADHAAR"}
                              </span>
                            </td>
                            <td className="py-3 px-2 font-bold text-zinc-100">{cert.userName}</td>
                            <td className="py-3 px-2 text-zinc-400">{cert.userState}</td>
                            <td className="py-3 px-2 font-mono font-black">
                              <span className={passed ? "text-emerald-400" : "text-red-500 font-black"}>
                                {score}%
                              </span>
                            </td>
                            <td className="py-3 px-2 font-mono">
                              {passed ? (
                                <span className="text-[8px] font-black px-1.5 py-0.5 border border-emerald-800 bg-emerald-950/40 text-emerald-400">
                                  PASSED (≥85%)
                                </span>
                              ) : (
                                <span className="text-[8px] font-black px-1.5 py-0.5 border border-red-800 bg-red-950/40 text-red-500 animate-pulse">
                                  FAILED (&lt;85%)
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-2 text-zinc-400">{cert.certDate || "N/A"}</td>
                            <td className="py-3 px-2 text-zinc-300 font-bold">{cert.certCode}</td>
                            <td className="py-3 px-2 text-right">
                              <button
                                onClick={async () => {
                                  // Open new print flow window for this cert
                                  const prtWin = window.open("", "_blank");
                                  if (prtWin) {
                                    prtWin.document.write(`
                                      <html>
                                        <head>
                                          <title>VERIFIED COMPLIANCE CERTIFICATE - ${cert.certCode}</title>
                                          <style>
                                            body { 
                                              font-family: 'Courier New', Courier, monospace; 
                                              text-align: center; 
                                              background: #fff; 
                                              color: #000; 
                                              padding: 50px; 
                                              border: 15px double ${passed ? '#111' : '#dc2626'}; 
                                              position: relative;
                                              min-height: 90vh;
                                              box-sizing: border-box;
                                              display: flex;
                                              flex-direction: column;
                                              justify-content: space-between;
                                            }
                                            h1 { font-size: 30px; font-weight: 900; margin: 20px 0 10px; text-transform: uppercase; }
                                            h3 { font-size: 16px; margin: 0; }
                                            p { font-size: 14px; line-height: 1.6; margin: 20px auto; max-width: 600px; }
                                            .code { font-size: 18px; font-weight: bold; margin: 25px auto; color: #000; border: 1px dashed #000; padding: 10px 20px; display: inline-block; }
                                            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 25px auto; text-align: left; max-width: 550px; border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 15px 0; font-size: 13px; }
                                            .watermark {
                                              position: absolute;
                                              top: 50%;
                                              left: 50%;
                                              transform: translate(-50%, -50%) rotate(-30deg);
                                              font-size: 56px;
                                              color: ${passed ? 'rgba(239, 68, 68, 0.12)' : 'rgba(220, 38, 38, 0.28)'};
                                              font-weight: 900;
                                              text-transform: uppercase;
                                              letter-spacing: 8px;
                                              border: 10px solid ${passed ? 'rgba(239, 68, 68, 0.12)' : 'rgba(220, 38, 38, 0.28)'};
                                              padding: 15px 30px;
                                              pointer-events: none;
                                              white-space: nowrap;
                                              font-family: Arial, Helvetica, sans-serif;
                                              z-index: 1000;
                                            }
                                            .admin-header-tag {
                                              background-color: ${passed ? '#ecfdf5' : '#fef2f2'}; 
                                              border: 2px solid ${passed ? '#10b981' : '#ef4444'}; 
                                              color: ${passed ? '#047857' : '#b91c1c'}; 
                                              font-size: 12px; 
                                              font-weight: bold; 
                                              padding: 8px 16px; 
                                              text-transform: uppercase; 
                                              margin-bottom: 15px; 
                                              display: inline-block;
                                              letter-spacing: 1px;
                                            }
                                            .sig-block {
                                              display: flex;
                                              justify-content: space-between;
                                              margin-top: 30px;
                                              font-size: 9px;
                                              font-weight: bold;
                                              text-transform: uppercase;
                                              color: #444;
                                              text-align: left;
                                            }
                                            .sig-line {
                                              border-top: 1px solid #111;
                                              padding-top: 5px;
                                              width: 220px;
                                            }
                                          </style>
                                        </head>
                                        <body>
                                          <div class="watermark">${passed ? "ADMIN COPY" : "EXAM FAILED (<85%)"}</div>
                                          <div>
                                            <div class="admin-header-tag">
                                              ${passed ? `✅ ADMIN COPY - OFFICIAL PASSED RECORD (${score}%)` : `❌ ADMIN COPY - EXAM FAILED (${score}% SCORE < 85% MINIMUM)`}
                                            </div>
                                            <h1>NATIONAL COMPLIANCE CREDENTIAL</h1>
                                            <h3>BUILT TO BREAK MUNICIPAL RESEARCH INITIATIVE</h3>
                                            <p>Candidate <strong>${cert.userName}</strong> scored <strong>${score}%</strong> on the NBC & BNS Compliance Forensic Assessment. Minimum passing mark required: <strong>85%</strong>.</p>
                                            
                                            <div class="grid">
                                              <div><strong>JURISDICTION:</strong> ${cert.userState}</div>
                                              <div><strong>ID NUMBER (MAPPED):</strong> ${cert.idNumber || "Aadhaar System"}</div>
                                              <div><strong>PERCENTAGE SCORE:</strong> <strong style="color: ${passed ? '#047857' : '#b91c1c'}">${score}%</strong></div>
                                              <div><strong>RESULT STATUS:</strong> <strong style="color: ${passed ? '#047857' : '#b91c1c'}">${passed ? 'PASSED (≥85%)' : 'FAILED (<85%) - INVALID'}</strong></div>
                                              <div><strong>ISSUE TIMESTAMP:</strong> ${cert.certDate}</div>
                                              <div><strong>DOCUMENT CODE:</strong> ${cert.certCode}</div>
                                            </div>
                                          </div>

                                          <div>
                                            <div class="code">SECURITY VERIFICATION CODE: ${cert.certCode}</div>
                                            <div class="sig-block">
                                              <div class="sig-line">AI PROCTOR LOGS DIGITALLY CERTIFIED</div>
                                              <div class="sig-line">MUNICIPAL DEPUTY COMMISSIONER NOC SIGNATURE</div>
                                            </div>
                                          </div>
                                          <script>window.onload = function() { window.print(); }</script>
                                        </body>
                                      </html>
                                    `);
                                    prtWin.document.close();
                                  }
                                }}
                                className="px-2.5 py-1.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-700 text-[10px] text-zinc-300 hover:text-white uppercase font-bold cursor-pointer transition-all"
                              >
                                View PDF Printout
                              </button>
                            </td>
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

              </div>
            )}

            {/* TAB 4: ITSM SUPPORT TICKETS MANAGEMENT */}
            {activeTab === "support" && (
              <div className="space-y-6 font-mono text-xs">
                
                {/* Search & Filter Bar */}
                <div className="bg-[#08080a] border border-zinc-900 p-4 flex flex-wrap items-center justify-between gap-4">
                  
                  <div className="flex items-center gap-2 flex-1 min-w-[280px]">
                    <Search className="w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      value={ticketSearchQuery}
                      onChange={(e) => setTicketSearchQuery(e.target.value)}
                      placeholder="Filter by Ticket Code, Email, Phone, or Subject..."
                      className="w-full bg-zinc-950 border border-zinc-900 px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>

                  {/* Filter Pills */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {["ALL", "Open", "In Progress", "Pending User Response", "Resolved", "Closed"].map((st) => (
                      <button
                        key={st}
                        onClick={() => setTicketFilterStatus(st)}
                        className={`px-3 py-1 text-[10px] font-bold uppercase transition-all cursor-pointer border ${
                          ticketFilterStatus === st
                            ? "bg-sky-950 text-sky-300 border-sky-600/60"
                            : "bg-zinc-950 text-zinc-500 border-zinc-900 hover:text-zinc-300"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={fetchSupportTickets}
                    className="p-1.5 bg-zinc-950 border border-zinc-900 hover:border-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isFetchingTickets ? "animate-spin" : ""}`} />
                  </button>
                </div>

                {/* Main Tickets Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column: Tickets List */}
                  <div className="lg:col-span-5 bg-[#08080a] border border-zinc-900 p-4 space-y-3 max-h-[650px] overflow-y-auto">
                    <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-900 pb-2 flex justify-between">
                      <span>INCIDENT QUEUE ({supportTickets.length})</span>
                      <span>SORT: NEWEST</span>
                    </div>

                    {supportTickets.filter(t => {
                      if (ticketFilterStatus !== "ALL" && t.status !== ticketFilterStatus) return false;
                      if (!ticketSearchQuery.trim()) return true;
                      const q = ticketSearchQuery.toLowerCase();
                      return (
                        t.ticketCode?.toLowerCase().includes(q) ||
                        t.email?.toLowerCase().includes(q) ||
                        t.name?.toLowerCase().includes(q) ||
                        t.phone?.toLowerCase().includes(q) ||
                        t.subject?.toLowerCase().includes(q)
                      );
                    }).length === 0 ? (
                      <div className="text-center py-12 text-zinc-600 text-[10px] uppercase">
                        NO TICKETS MATCHING SPECIFIED CRITERIA
                      </div>
                    ) : (
                      supportTickets.filter(t => {
                        if (ticketFilterStatus !== "ALL" && t.status !== ticketFilterStatus) return false;
                        if (!ticketSearchQuery.trim()) return true;
                        const q = ticketSearchQuery.toLowerCase();
                        return (
                          t.ticketCode?.toLowerCase().includes(q) ||
                          t.email?.toLowerCase().includes(q) ||
                          t.name?.toLowerCase().includes(q) ||
                          t.phone?.toLowerCase().includes(q) ||
                          t.subject?.toLowerCase().includes(q)
                        );
                      }).map((t) => {
                        const isSelected = selectedTicket?.id === t.id;
                        return (
                          <div
                            key={t.id}
                            onClick={() => {
                              setSelectedTicket(t);
                              setTicketNewStatus(t.status);
                              setTicketNewAssignee(t.assignedTo || "System Admin");
                            }}
                            className={`p-3.5 border transition-all cursor-pointer space-y-2 ${
                              isSelected
                                ? "bg-sky-950/30 border-sky-500/70"
                                : "bg-zinc-950 border-zinc-900 hover:border-zinc-800"
                            }`}
                          >
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="text-amber-400 font-bold">{t.ticketCode}</span>
                              <span className={`px-2 py-0.5 border text-[9px] font-bold uppercase ${
                                t.status === "Open" ? "bg-amber-950/60 text-amber-300 border-amber-600/50" :
                                t.status === "In Progress" ? "bg-sky-950/60 text-sky-300 border-sky-600/50" :
                                t.status === "Resolved" ? "bg-emerald-950/60 text-emerald-300 border-emerald-600/50" :
                                "bg-zinc-900 text-zinc-400 border-zinc-700"
                              }`}>
                                {t.status}
                              </span>
                            </div>

                            <div className="font-bold text-zinc-100 line-clamp-1">
                              {t.subject}
                            </div>

                            <div className="flex justify-between items-center text-[9.5px] text-zinc-500 pt-1 border-t border-zinc-900">
                              <span>{t.name} ({t.category})</span>
                              <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Right Column: Ticket Inspection & Response Panel */}
                  <div className="lg:col-span-7 bg-[#08080a] border border-zinc-900 p-6 space-y-6">
                    {selectedTicket ? (
                      <div className="space-y-6">
                        
                        {/* Header Details */}
                        <div className="border-b border-zinc-900 pb-4 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-amber-400 font-bold text-base">{selectedTicket.ticketCode}</span>
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 bg-red-950/60 text-red-400 border border-red-600/50 text-[10px] font-bold">
                                {selectedTicket.priority}
                              </span>
                              <span className="px-2.5 py-1 bg-sky-950/60 text-sky-300 border border-sky-600/50 text-[10px] font-bold">
                                {selectedTicket.status}
                              </span>
                              <button
                                onClick={() => handleDeleteTicket(selectedTicket.id)}
                                className="p-1.5 bg-zinc-950 border border-zinc-900 hover:border-red-600 text-zinc-500 hover:text-red-400 cursor-pointer"
                                title="Delete Ticket"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <h2 className="text-sm font-bold text-zinc-100">{selectedTicket.subject}</h2>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] bg-zinc-950 p-3 border border-zinc-900 text-zinc-400">
                            <div><strong className="text-zinc-300">Name:</strong> {selectedTicket.name}</div>
                            <div><strong className="text-zinc-300">Email:</strong> {selectedTicket.email}</div>
                            <div><strong className="text-zinc-300">Phone:</strong> {selectedTicket.phone}</div>
                            <div><strong className="text-zinc-300">Category:</strong> {selectedTicket.category}</div>
                            <div><strong className="text-zinc-300">Assigned To:</strong> {selectedTicket.assignedTo}</div>
                            <div><strong className="text-zinc-300">Created:</strong> {new Date(selectedTicket.createdAt).toLocaleString()}</div>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                            USER DESCRIPTION:
                          </span>
                          <div className="p-3 bg-zinc-950 border border-zinc-900 text-zinc-200 leading-relaxed whitespace-pre-wrap">
                            {selectedTicket.description}
                          </div>
                        </div>

                        {/* Admin Action Form */}
                        <form onSubmit={handleUpdateTicket} className="bg-zinc-950 border border-zinc-900 p-4 space-y-4">
                          <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest block border-b border-zinc-900 pb-1.5 flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5" />
                            POST ADMINISTRATOR RESPONSE & UPDATE STATUS
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[9.5px] text-zinc-500 uppercase mb-1">SET TICKET STATUS:</label>
                              <select
                                value={ticketNewStatus || selectedTicket.status}
                                onChange={(e) => setTicketNewStatus(e.target.value)}
                                className="w-full bg-[#08080a] border border-zinc-800 px-3 py-1.5 text-zinc-100 focus:outline-none focus:border-sky-500 text-xs"
                              >
                                <option value="Open">Open</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Pending User Response">Pending User Response</option>
                                <option value="Resolved">Resolved</option>
                                <option value="Closed">Closed</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[9.5px] text-zinc-500 uppercase mb-1">ASSIGNED ADMIN OPERATOR:</label>
                              <select
                                value={ticketNewAssignee || selectedTicket.assignedTo}
                                onChange={(e) => setTicketNewAssignee(e.target.value)}
                                className="w-full bg-[#08080a] border border-zinc-800 px-3 py-1.5 text-zinc-100 focus:outline-none focus:border-sky-500 text-xs"
                              >
                                <option value="System Admin">System Admin</option>
                                <option value="Proctoring Specialist Admin">Proctoring Specialist Admin</option>
                                <option value="Chief Compliance Officer">Chief Compliance Officer</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[9.5px] text-zinc-500 uppercase mb-1">RESPONSE NOTE / EMAIL MESSAGE TO USER:</label>
                            <textarea
                              rows={3}
                              value={ticketResponseMsg}
                              onChange={(e) => setTicketResponseMsg(e.target.value)}
                              placeholder="Write admin status response or resolution note..."
                              className="w-full bg-[#08080a] border border-zinc-800 p-2 text-zinc-100 focus:outline-none focus:border-sky-500 text-xs resize-none"
                            />
                          </div>

                          <div className="flex justify-between items-center pt-1">
                            <span className="text-[10px] text-zinc-500">
                              * Submitting dispatches notification via Email
                            </span>
                            <button
                              type="submit"
                              disabled={isUpdatingTicket}
                              className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold uppercase tracking-widest text-[10.5px] flex items-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                              {isUpdatingTicket ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                              <span>UPDATE & DISPATCH MAIL</span>
                            </button>
                          </div>
                        </form>

                        {/* History Updates */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">
                            HISTORIC TICKET MESSAGES ({selectedTicket.updates?.length || 0})
                          </span>
                          {(!selectedTicket.updates || selectedTicket.updates.length === 0) ? (
                            <div className="p-3 bg-zinc-950 text-zinc-600 text-center text-[10px]">
                              NO PREVIOUS RESPONSES RECORDED FOR THIS INCIDENT
                            </div>
                          ) : (
                            <div className="space-y-2 max-h-[220px] overflow-y-auto">
                              {selectedTicket.updates.map((u, idx) => (
                                <div key={idx} className="p-3 bg-zinc-950 border border-zinc-900 space-y-1">
                                  <div className="flex justify-between items-center text-[9.5px]">
                                    <span className="text-sky-400 font-bold">{u.authorName || u.author}</span>
                                    <span className="text-zinc-500">{new Date(u.createdAt).toLocaleString()}</span>
                                  </div>
                                  <p className="text-zinc-300 leading-relaxed">{u.message}</p>
                                  {u.statusChange && (
                                    <div className="text-[9px] text-emerald-400 pt-1 border-t border-zinc-900">
                                      Status updated to: <strong>{u.statusChange}</strong>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                      </div>
                    ) : (
                      <div className="text-center py-32 text-zinc-600 font-mono text-[10.5px] uppercase">
                        SELECT A SUPPORT TICKET FROM THE LEFT QUEUE TO REVIEW & RESPOND
                      </div>
                    )}
                  </div>

                </div>

              </div>
            )}

          </main>
        </div>
      )}

      {/* 3. QUESTION ADD/EDIT DIALOG OVERLAY */}
      <AnimatePresence>
        {showQuestionModal && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#08080a] border border-zinc-900 p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto relative scrollbar-thin scrollbar-thumb-zinc-800"
            >
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  onClick={() => setShowQuestionModal(false)}
                  className="p-1.5 bg-zinc-950 border border-zinc-900 hover:border-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h2 className="text-sm font-black text-zinc-100 uppercase tracking-widest border-b border-zinc-900 pb-3 mb-4">
                {questionModalMode === "add" ? "CREATE REGISTERED NBC EXAM QUESTION" : "MODIFY REGISTERED QUESTION DATA"}
              </h2>

              <form onSubmit={handleQuestionFormSubmit} className="space-y-4 font-mono text-[11px]">
                
                {questionFormError && (
                  <div className="p-3 bg-red-950/20 border border-red-600/30 text-red-400 text-[10px] uppercase font-bold leading-relaxed">
                    ⚠️ {questionFormError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                  
                  <div className="md:col-span-8">
                    <label className="block text-zinc-500 uppercase text-[9px] mb-1">Scenario Question Title:</label>
                    <input
                      type="text"
                      required
                      value={questionForm.title}
                      onChange={(e) => setQuestionForm({...questionForm, title: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-900 px-3 py-2 text-zinc-100 focus:outline-none focus:border-red-600"
                      placeholder="e.g. Fire Hydrant Setback Violation in High Rise Zoning"
                    />
                  </div>

                  <div className="md:col-span-4">
                    <label className="block text-zinc-500 uppercase text-[9px] mb-1">Hazard Danger Level:</label>
                    <select
                      value={questionForm.hazardLevel}
                      onChange={(e) => setQuestionForm({...questionForm, hazardLevel: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-900 px-3 py-2 text-zinc-100 focus:outline-none focus:border-red-600"
                    >
                      <option value="LOW">LOW VULNERABILITY</option>
                      <option value="MEDIUM">MEDIUM VULNERABILITY</option>
                      <option value="HIGH">HIGH VULNERABILITY</option>
                    </select>
                  </div>

                  <div className="md:col-span-4">
                    <label className="block text-zinc-500 uppercase text-[9px] mb-1">Category Type:</label>
                    <input
                      type="text"
                      required
                      value={questionForm.type}
                      onChange={(e) => setQuestionForm({...questionForm, type: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-900 px-3 py-2 text-zinc-100 focus:outline-none focus:border-red-600"
                      placeholder="e.g. Egress Capacity"
                    />
                  </div>

                  <div className="md:col-span-4">
                    <label className="block text-zinc-500 uppercase text-[9px] mb-1">State Zone/Location:</label>
                    <input
                      type="text"
                      value={questionForm.location}
                      onChange={(e) => setQuestionForm({...questionForm, location: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-900 px-3 py-2 text-zinc-100 focus:outline-none focus:border-red-600"
                      placeholder="e.g. Sikkim Region"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-zinc-500 uppercase text-[9px] mb-1">Difficulty:</label>
                    <select
                      value={questionForm.difficulty}
                      onChange={(e) => setQuestionForm({...questionForm, difficulty: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-900 px-3 py-2 text-zinc-100 focus:outline-none focus:border-red-600"
                    >
                      <option value="EASY">EASY</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HARD">HARD</option>
                    </select>
                  </div>

                  <div className="md:col-span-6">
                    <label className="block text-zinc-500 uppercase text-[9px] mb-1">NBC Referenced Clauses:</label>
                    <input
                      type="text"
                      required
                      value={questionForm.nbcClauses}
                      onChange={(e) => setQuestionForm({...questionForm, nbcClauses: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-900 px-3 py-2 text-zinc-100 focus:outline-none focus:border-red-600"
                      placeholder="Part 4, Section 3, Clause 4.5.2"
                    />
                  </div>

                  <div className="md:col-span-6">
                    <label className="block text-zinc-500 uppercase text-[9px] mb-1">BNS Fire Ordinance Section:</label>
                    <input
                      type="text"
                      required
                      value={questionForm.bnsSection}
                      onChange={(e) => setQuestionForm({...questionForm, bnsSection: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-900 px-3 py-2 text-zinc-100 focus:outline-none focus:border-red-600"
                      placeholder="Section 285 (Negligence with respect to Fire)"
                    />
                  </div>

                  <div className="md:col-span-12">
                    <label className="block text-zinc-500 uppercase text-[9px] mb-1">Scenario/Case Description:</label>
                    <textarea
                      required
                      value={questionForm.description}
                      onChange={(e) => setQuestionForm({...questionForm, description: e.target.value})}
                      rows={3}
                      className="w-full bg-zinc-950 border border-zinc-900 p-2 text-zinc-100 focus:outline-none focus:border-red-600"
                      placeholder="Describe the physical building layouts, egress widths, and specific violations..."
                    />
                  </div>

                  {/* Four Options */}
                  <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-zinc-500 uppercase text-[9px] mb-1">Option [A] Text:</label>
                      <input
                        type="text"
                        required
                        value={questionForm.options.A}
                        onChange={(e) => setQuestionForm({
                          ...questionForm, 
                          options: { ...questionForm.options, A: e.target.value }
                        })}
                        className="w-full bg-zinc-950 border border-zinc-900 px-3 py-2 text-zinc-100 focus:outline-none focus:border-red-600"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-500 uppercase text-[9px] mb-1">Option [B] Text:</label>
                      <input
                        type="text"
                        required
                        value={questionForm.options.B}
                        onChange={(e) => setQuestionForm({
                          ...questionForm, 
                          options: { ...questionForm.options, B: e.target.value }
                        })}
                        className="w-full bg-zinc-950 border border-zinc-900 px-3 py-2 text-zinc-100 focus:outline-none focus:border-red-600"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-500 uppercase text-[9px] mb-1">Option [C] Text:</label>
                      <input
                        type="text"
                        required
                        value={questionForm.options.C}
                        onChange={(e) => setQuestionForm({
                          ...questionForm, 
                          options: { ...questionForm.options, C: e.target.value }
                        })}
                        className="w-full bg-zinc-950 border border-zinc-900 px-3 py-2 text-zinc-100 focus:outline-none focus:border-red-600"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-500 uppercase text-[9px] mb-1">Option [D] Text:</label>
                      <input
                        type="text"
                        required
                        value={questionForm.options.D}
                        onChange={(e) => setQuestionForm({
                          ...questionForm, 
                          options: { ...questionForm.options, D: e.target.value }
                        })}
                        className="w-full bg-zinc-950 border border-zinc-900 px-3 py-2 text-zinc-100 focus:outline-none focus:border-red-600"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-4">
                    <label className="block text-zinc-500 uppercase text-[9px] mb-1">Correct Option ID:</label>
                    <select
                      value={questionForm.correctId}
                      onChange={(e) => setQuestionForm({...questionForm, correctId: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-900 px-3 py-2 text-zinc-100 focus:outline-none focus:border-red-600"
                    >
                      <option value="A">OPTION [A]</option>
                      <option value="B">OPTION [B]</option>
                      <option value="C">OPTION [C]</option>
                      <option value="D">OPTION [D]</option>
                    </select>
                  </div>

                  <div className="md:col-span-12">
                    <label className="block text-zinc-500 uppercase text-[9px] mb-1">Hazard Compliance Explanation / Fact:</label>
                    <textarea
                      value={questionForm.fact}
                      onChange={(e) => setQuestionForm({...questionForm, fact: e.target.value})}
                      rows={2}
                      className="w-full bg-zinc-950 border border-zinc-900 p-2 text-zinc-100 focus:outline-none focus:border-red-600"
                      placeholder="Provide the rationale, exact legal limits, and correct spatial dimensions referenced in the NBC..."
                    />
                  </div>

                </div>

                <div className="flex gap-2.5 pt-4 border-t border-zinc-900">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-red-600 hover:bg-red-500 border border-red-500 text-white text-[11px] font-black uppercase tracking-widest cursor-pointer transition-colors"
                  >
                    {questionModalMode === "add" ? "REGISTER NEW QUESTION" : "SAVE EDITED CHANGES"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowQuestionModal(false)}
                    className="px-6 py-3 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 text-zinc-400 hover:text-white text-[11px] font-bold uppercase tracking-widest cursor-pointer transition-colors"
                  >
                    CANCEL ABORT
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. COGNITIVE REPORT GENERATION PREVIEW SCREEN */}
      <AnimatePresence>
        {showReportModal && selectedSession && (
          <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0c0d12] border border-red-900/40 p-8 w-full max-w-4xl shadow-2xl relative space-y-6"
            >
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  onClick={printReport}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 border border-red-500 text-white text-[10.5px] font-black uppercase tracking-widest flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-white" />
                  <span>PRINT PORTAL DOSSIER</span>
                </button>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="p-2 bg-zinc-950 border border-zinc-900 hover:border-zinc-700 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Report Header */}
              <div className="text-center border-b-2 border-dashed border-red-950 pb-5">
                <span className="text-[10px] font-mono text-red-500 uppercase tracking-[0.25em] font-black">
                  [SECURITY CLASSIFIED TELEMETRY REPORT]
                </span>
                <h2 className="text-2xl font-black text-zinc-100 uppercase tracking-tight mt-1">
                  COGNITIVE BEHAVIORAL PROCTORING ASSESSMENT
                </h2>
                <div className="text-[9.5px] font-mono text-zinc-500 uppercase mt-1">
                  ISSUED UNDER AUTHORITY OF BUILT TO BREAK AUDIT DIVISION • REGISTRY: {selectedSession.sessionCode}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
                
                {/* Candidate identification Card */}
                <div className="bg-zinc-950/80 p-4 border border-zinc-900 space-y-3.5">
                  <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-black block border-b border-zinc-900 pb-1.5">
                    I. CANDIDATE IDENTITY PROFILE
                  </span>
                  <div className="space-y-2">
                    <div>
                      <span className="text-zinc-600 block text-[9.5px] uppercase">EXAMINEE NAME:</span>
                      <strong className="text-zinc-100 text-sm">{selectedSession.userName}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-600 block text-[9.5px] uppercase">JURISDICTIONAL REGION:</span>
                      <strong className="text-zinc-300">{selectedSession.userState}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-600 block text-[9.5px] uppercase">CURRENT STATUS STATE:</span>
                      <strong className="text-zinc-300 uppercase">{selectedSession.status}</strong>
                    </div>
                    <div>
                    </div>
                  </div>
                </div>

                {/* AI Proctor Assessment */}
                <div className="bg-zinc-950/80 p-4 border border-zinc-900 space-y-3.5">
                  <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-black block border-b border-zinc-900 pb-1.5">
                    II. AUTOMATED TELEMETRY ANALYSIS
                  </span>
                  <div className="space-y-2">
                    <div>
                      <span className="text-zinc-600 block text-[9.5px] uppercase">TOTAL RECORDED FLAG COUNT:</span>
                      <strong className="text-red-400 text-sm font-bold">{selectedSession.flags ?? 0} / 10</strong>
                    </div>
                    <div>
                      <span className="text-zinc-600 block text-[9.5px] uppercase">BEHAVIORAL INTEGRITY CODE:</span>
                      <strong className="text-zinc-100">{Math.max(0, 100 - (selectedSession.flags || 0) * 10)}% COMPLIANT</strong>
                    </div>
                    <div>
                      <span className="text-zinc-600 block text-[9.5px] uppercase">SECURITY SECURITY COMPLIANCE:</span>
                      <strong className={(selectedSession.flags || 0) >= 10 ? "text-red-500 font-bold" : "text-emerald-400 font-bold"}>
                        {(selectedSession.flags || 0) >= 10 || selectedSession.status === "disqualified" ? "DISQUALIFIED / FAILED" : "COMPLIANCE APPROVED"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-zinc-600 block text-[9.5px] uppercase">AUDIT TIMESTAMP SYNC:</span>
                      <strong className="text-zinc-400 font-mono">{new Date(selectedSession.updatedAt).toLocaleString()}</strong>
                    </div>
                  </div>
                </div>

              </div>

              {/* Complete chron log */}
              <div className="space-y-2">
                <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-black block">
                  III. FULL HISTORIC BIOMETRIC TIMELINE LOGS
                </span>
                <div className="bg-zinc-950 border border-zinc-900 p-4 h-48 overflow-y-auto font-mono text-[10px] space-y-1.5 text-zinc-400 scrollbar-thin scrollbar-thumb-zinc-800">
                  {selectedSession.proctorLogs && [...selectedSession.proctorLogs].reverse().map((log, idx) => {
                    const m = typeof log === "string" ? log : log.message;
                    const ts = log.timestamp || "AUTO";
                    return (
                      <div key={idx} className="border-b border-zinc-900/30 pb-1.5">
                        <strong className="text-zinc-600">[{ts}]</strong> {m}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Legal Disclaimer */}
              <div className="p-4 bg-zinc-950 border border-zinc-900 text-[10.5px] leading-relaxed font-light text-zinc-500 text-justify">
                <strong>REGULATORY INQUEST STATEMENT:</strong> The proctoring metrics above represent a secure verification sequence mapped to Google Cloud SQL database storage. Head alignment coordinates, sound frequency spikes, and browser tab blur alerts are logged securely. Municipal officials verify that any override applied conforms entirely to the procedural standards of the National Building Code of India.
              </div>

              <div className="flex justify-end pt-2 border-t border-zinc-900">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-6 py-2.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 text-zinc-400 hover:text-white text-xs font-bold uppercase tracking-widest cursor-pointer"
                >
                  CLOSE PREVIEW
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
