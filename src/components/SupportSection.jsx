import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  LifeBuoy, 
  Send, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  MessageSquare, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Tag, 
  ShieldAlert, 
  RefreshCw, 
  X, 
  ExternalLink,
  ListTodo,
  Sparkles
} from "lucide-react";
import { 
  getAccessToken, 
  sendSupportTicketEmail, 
  createGoogleTaskForAdmin 
} from "../lib/googleWorkspace";

export default function SupportSection({ currentUser, onClose, defaultTab = "log" }) {
  const [activeTab, setActiveTab] = useState(defaultTab); // "log" | "my_tickets" | "track"

  // Form State
  const [formName, setFormName] = useState(currentUser?.displayName || "");
  const [formEmail, setFormEmail] = useState(currentUser?.email || "");
  const [formPhone, setFormPhone] = useState("");
  const [formCategory, setFormCategory] = useState("Technical Issue");
  const [formPriority, setFormPriority] = useState("P3 - Medium");
  const [formSubject, setFormSubject] = useState("");
  const [formDescription, setFormDescription] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // My Tickets State (Signed in)
  const [myTickets, setMyTickets] = useState([]);
  const [isLoadingMyTickets, setIsLoadingMyTickets] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Lookup Code State (Guest or Quick Track)
  const [lookupCode, setLookupCode] = useState("");
  const [trackedTicket, setTrackedTicket] = useState(null);
  const [trackedUpdates, setTrackedUpdates] = useState([]);
  const [isSearchingTrack, setIsSearchingTrack] = useState(false);
  const [trackError, setTrackError] = useState(null);

  // Auto-fill user email & name if logged in
  useEffect(() => {
    if (currentUser) {
      if (!formName && currentUser.displayName) setFormName(currentUser.displayName);
      if (!formEmail && currentUser.email) setFormEmail(currentUser.email);
    }
  }, [currentUser]);

  // Fetch My Tickets if signed in and tab is active
  const fetchMyTickets = async () => {
    if (!currentUser) return;
    setIsLoadingMyTickets(true);
    try {
      const idToken = await currentUser.getIdToken();
      const res = await fetch("/api/support/tickets/my", {
        headers: { "Authorization": `Bearer ${idToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMyTickets(data);
      }
    } catch (err) {
      console.error("Failed to fetch user support tickets:", err);
    } finally {
      setIsLoadingMyTickets(false);
    }
  };

  useEffect(() => {
    if (activeTab === "my_tickets" && currentUser) {
      fetchMyTickets();
    }
  }, [activeTab, currentUser]);

  // Submit Support Ticket
  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!formName.trim() || !formEmail.trim() || !formPhone.trim() || !formSubject.trim() || !formDescription.trim()) {
      setSubmitError("Please fill out all required fields (Name, Email, Phone, Subject, Description).");
      return;
    }

    setIsSubmitting(true);
    try {
      let idToken = null;
      if (currentUser) {
        idToken = await currentUser.getIdToken();
      }

      // 1. Save ticket to Cloud SQL backend
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(idToken ? { "Authorization": `Bearer ${idToken}` } : {})
        },
        body: JSON.stringify({
          name: formName.trim(),
          email: formEmail.trim(),
          phone: formPhone.trim(),
          category: formCategory,
          priority: formPriority,
          subject: formSubject.trim(),
          description: formDescription.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit support ticket.");
      }

      const ticket = data.ticket;

      // 2. Google Workspace Integration: Gmail & Tasks
      const token = getAccessToken();
      let emailSent = false;
      let taskCreatedId = null;

      if (token) {
        try {
          // Send automated confirmation email via Gmail API
          emailSent = await sendSupportTicketEmail(token, ticket);
        } catch (mailErr) {
          console.warn("Gmail API email warning:", mailErr);
        }

        try {
          // Auto-create task for Admin via Google Tasks API
          taskCreatedId = await createGoogleTaskForAdmin(token, ticket);
        } catch (taskErr) {
          console.warn("Google Tasks API task creation warning:", taskErr);
        }
      }

      setSubmitSuccess({
        ticket,
        emailSent,
        taskCreated: !!taskCreatedId
      });

      // Clear form
      setFormSubject("");
      setFormDescription("");

      if (currentUser) {
        fetchMyTickets();
      }
    } catch (err) {
      console.error("Submit ticket error:", err);
      setSubmitError(err.message || "An unexpected error occurred while logging the ticket.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Track Ticket by Code
  const handleTrackByCode = async (e) => {
    if (e) e.preventDefault();
    if (!lookupCode.trim()) return;

    setIsSearchingTrack(true);
    setTrackError(null);
    setTrackedTicket(null);
    setTrackedUpdates([]);

    try {
      const code = lookupCode.trim().toUpperCase();
      const res = await fetch(`/api/support/tickets/track/${code}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setTrackedTicket(data.ticket);
        setTrackedUpdates(data.updates || []);
      } else {
        setTrackError(data.error || "Ticket not found. Check the code and try again.");
      }
    } catch (err) {
      setTrackError("Server network error while searching ticket code.");
    } finally {
      setIsSearchingTrack(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Open":
        return "bg-amber-950/60 text-amber-300 border-amber-600/50";
      case "In Progress":
        return "bg-sky-950/60 text-sky-300 border-sky-600/50";
      case "Pending User Response":
        return "bg-purple-950/60 text-purple-300 border-purple-600/50";
      case "Resolved":
        return "bg-emerald-950/60 text-emerald-300 border-emerald-600/50";
      case "Closed":
        return "bg-zinc-900 text-zinc-400 border-zinc-700";
      default:
        return "bg-zinc-900 text-zinc-300 border-zinc-700";
    }
  };

  const getPriorityBadge = (prio) => {
    if (prio.includes("P1")) return "bg-red-950/70 text-red-400 border-red-600/60";
    if (prio.includes("P2")) return "bg-orange-950/70 text-orange-400 border-orange-600/60";
    if (prio.includes("P3")) return "bg-yellow-950/70 text-yellow-300 border-yellow-600/60";
    return "bg-zinc-900 text-zinc-400 border-zinc-700";
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/98 backdrop-blur-md z-50 overflow-y-auto font-sans text-zinc-100 flex flex-col border-t-2 border-sky-500">
      
      {/* HEADER NAVBAR */}
      <header className="px-6 py-4 bg-[#09090b] border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-950/40 border border-sky-500/40 text-sky-400">
            <LifeBuoy className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-widest text-zinc-100 uppercase font-mono">
                ITSM SUPPORT TERMINAL & HELPDESK
              </h1>
              <span className="px-2 py-0.5 bg-sky-950 text-sky-400 border border-sky-600/40 text-[9px] font-mono font-bold uppercase tracking-wider">
                ADMIN SUPPORT QUEUE
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
              Submit operational & proctoring support tickets • Track status in real-time • Email Notification Sync
            </p>
          </div>
        </div>

        {/* TAB BUTTONS */}
        <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 p-1 font-mono">
          <button
            onClick={() => setActiveTab("log")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "log"
                ? "bg-sky-950 text-sky-300 border border-sky-600/50"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Log Support Ticket
          </button>
          
          {currentUser && (
            <button
              onClick={() => setActiveTab("my_tickets")}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "my_tickets"
                  ? "bg-sky-950 text-sky-300 border border-sky-600/50"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              My Tickets ({myTickets.length})
            </button>
          )}

          <button
            onClick={() => setActiveTab("track")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "track"
                ? "bg-sky-950 text-sky-300 border border-sky-600/50"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Track Code Lookup
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 ml-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* CONTENT MAIN */}
      <main className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-6">

        {/* TAB 1: LOG SUPPORT TICKET */}
        {activeTab === "log" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Form */}
            <div className="lg:col-span-8 bg-[#09090c] border border-zinc-800/80 p-6 shadow-xl space-y-6">
              
              <div className="border-b border-zinc-800/80 pb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-zinc-100 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-400" />
                  CREATE NEW ITSM SUPPORT INCIDENT
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Fill in your email and contact number. Tickets are registered for admin review and real-time status tracking.
                </p>
              </div>

              {submitError && (
                <div className="p-3 bg-red-950/60 border border-red-600/60 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {submitSuccess ? (
                <div className="p-6 bg-sky-950/30 border border-sky-500/40 space-y-4">
                  <div className="flex items-center gap-3 text-emerald-400 font-mono font-bold text-sm">
                    <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-400" />
                    SUPPORT TICKET LOGGED SUCCESSFULLY!
                  </div>
                  
                  <div className="bg-zinc-900 p-4 border border-zinc-800 space-y-2 text-xs font-mono">
                    <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                      <span className="text-zinc-400">TICKET REFERENCE CODE:</span>
                      <span className="text-amber-400 text-sm font-bold">{submitSuccess.ticket.ticketCode}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">ASSIGNED ADMINISTRATOR:</span>
                      <span className="text-zinc-200 font-bold">{submitSuccess.ticket.assignedTo}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">PRIORITY LEVEL:</span>
                      <span className="text-zinc-200">{submitSuccess.ticket.priority}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">AUTOMATED EMAIL CONFIRMATION:</span>
                      <span className={submitSuccess.emailSent ? "text-emerald-400" : "text-zinc-500"}>
                        {submitSuccess.emailSent ? "✓ DISPATCHED VIA EMAIL" : "STANDBY (OVER MAIL)"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">INCIDENT DISPATCH STATUS:</span>
                      <span className={submitSuccess.taskCreated ? "text-emerald-400" : "text-emerald-400"}>
                        {submitSuccess.taskCreated ? "✓ SYNCED TO INCIDENT QUEUE" : "✓ REGISTERED IN QUEUE"}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-300">
                    A copy of this ticket has been dispatched to <strong>{submitSuccess.ticket.email}</strong>. 
                    {currentUser && " You can track real-time admin status updates under the 'My Tickets' tab."}
                  </p>

                  <div className="flex gap-3 pt-2 font-mono">
                    <button
                      onClick={() => setSubmitSuccess(null)}
                      className="px-4 py-2 bg-sky-900/60 hover:bg-sky-800 text-sky-200 text-xs font-bold uppercase tracking-wider border border-sky-600/60 cursor-pointer"
                    >
                      Log Another Ticket
                    </button>
                    {currentUser && (
                      <button
                        onClick={() => setActiveTab("my_tickets")}
                        className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold uppercase tracking-wider border border-zinc-700 cursor-pointer"
                      >
                        View My Support Tickets →
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitTicket} className="space-y-4 font-mono text-xs">
                  
                  {/* Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-zinc-400 mb-1 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-sky-400" />
                        USER FULL NAME *
                      </label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-zinc-100 focus:outline-none focus:border-sky-500"
                        placeholder="e.g. Neerej S Suresan"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-400 mb-1 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-sky-400" />
                        EMAIL ADDRESS (FOR MAIL UPDATES) *
                      </label>
                      <input
                        type="email"
                        required
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-zinc-100 focus:outline-none focus:border-sky-500"
                        placeholder="user@example.com"
                      />
                    </div>
                  </div>

                  {/* Phone & Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-zinc-400 mb-1 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-sky-400" />
                        CONTACT PHONE NUMBER *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-zinc-100 focus:outline-none focus:border-sky-500"
                        placeholder="+91 9876543210"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-400 mb-1 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-sky-400" />
                        SUPPORT CATEGORY *
                      </label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-zinc-100 focus:outline-none focus:border-sky-500"
                      >
                        <option value="Technical Issue">Technical & System Issue</option>
                        <option value="Exam Proctoring Appeal">Exam Proctoring & Disqualification Appeal</option>
                        <option value="Account & Certificate">Certificate Verification & Account</option>
                        <option value="General Support">General Support Inquiry</option>
                      </select>
                    </div>
                  </div>

                  {/* Priority & Subject */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-zinc-400 mb-1 flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-sky-400" />
                        PRIORITY LEVEL *
                      </label>
                      <select
                        value={formPriority}
                        onChange={(e) => setFormPriority(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-zinc-100 focus:outline-none focus:border-sky-500"
                      >
                        <option value="P1 - Critical">P1 - Critical (Exam Blocked)</option>
                        <option value="P2 - High">P2 - High (System Error)</option>
                        <option value="P3 - Medium">P3 - Medium (General Support)</option>
                        <option value="P4 - Low">P4 - Low (Inquiry)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-zinc-400 mb-1">
                        ISSUE SUBJECT / SUMMARY *
                      </label>
                      <input
                        type="text"
                        required
                        value={formSubject}
                        onChange={(e) => setFormSubject(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-zinc-100 focus:outline-none focus:border-sky-500"
                        placeholder="Brief title summarizing the issue"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-zinc-400 mb-1">
                      DETAILED DESCRIPTION & STEPS TO REPRODUCE *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 p-3 text-zinc-100 focus:outline-none focus:border-sky-500 leading-relaxed resize-none"
                      placeholder="Describe what happened, any error messages, and how our support team can assist..."
                    />
                  </div>

                  {/* Support Notice Banner */}
                  <div className="p-3 bg-sky-950/20 border border-sky-800/40 flex items-center justify-between text-[11px] text-sky-300">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>Automated Email Confirmation & Support Incident Desk Dispatch</span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-sky-950/50 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        REGISTERING TICKET & DISPATCHING MAIL...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        SUBMIT SUPPORT TICKET TO ADMIN QUEUE
                      </>
                    )}
                  </button>
                </form>
              )}

            </div>

            {/* Right Column: ITSM Details & Knowledge Info */}
            <div className="lg:col-span-4 space-y-4 font-mono text-xs">
              
              <div className="bg-[#09090c] border border-zinc-800/80 p-5 space-y-3">
                <div className="flex items-center gap-2 text-sky-400 font-bold uppercase tracking-wider text-xs">
                  <ListTodo className="w-4 h-4" />
                  ITSM DISPATCH WORKFLOW
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Every logged incident is assigned a unique incident reference ID (<code>TKT-XXXXXX</code>) and dispatched to the municipal admin desk.
                </p>
                <ul className="space-y-2 text-[11px] text-zinc-300">
                  <li className="flex items-start gap-2">
                    <span className="text-sky-400 font-bold">1.</span>
                    <span>Ticket created & assigned to System Admin.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sky-400 font-bold">2.</span>
                    <span>Automated email confirmation sent to user inbox.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sky-400 font-bold">3.</span>
                    <span>Support incident queued for active administration review.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sky-400 font-bold">4.</span>
                    <span>Updates tracked live in <strong>User Profile</strong> or over email.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-[#09090c] border border-zinc-800/80 p-5 space-y-3">
                <div className="text-amber-400 font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  EXAM DISQUALIFICATION APPEALS
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  If your exam session was disqualified due to tab switching or camera loss, please include your <strong>Exam Session Code</strong> (e.g. <code>SESSION-XXXXXX</code>) in the description for prompt review.
                </p>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: MY TICKETS (FOR SIGNED IN USERS) */}
        {activeTab === "my_tickets" && currentUser && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div>
                <h2 className="text-sm font-bold font-mono text-zinc-100 uppercase tracking-wider">
                  MY SUPPORT TICKETS & RESOLUTION HISTORY
                </h2>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  Logged in as <strong className="text-sky-400">{currentUser.email}</strong>
                </p>
              </div>

              <button
                onClick={fetchMyTickets}
                className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs font-mono flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMyTickets ? "animate-spin" : ""}`} />
                Refresh Tickets
              </button>
            </div>

            {myTickets.length === 0 ? (
              <div className="text-center py-16 bg-[#09090c] border border-zinc-800/80 font-mono space-y-3">
                <LifeBuoy className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400 uppercase tracking-wider">
                  NO SUPPORT TICKETS FOUND FOR YOUR ACCOUNT
                </p>
                <button
                  onClick={() => setActiveTab("log")}
                  className="px-4 py-2 bg-sky-950 border border-sky-600/50 text-sky-300 text-xs font-bold uppercase tracking-wider hover:bg-sky-900 cursor-pointer"
                >
                  Log Your First Support Ticket →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-mono">
                
                {/* Tickets List */}
                <div className="lg:col-span-5 space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {myTickets.map((t) => {
                    const isSelected = selectedTicket?.id === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTicket(t)}
                        className={`p-4 border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-sky-950/40 border-sky-500/80"
                            : "bg-[#09090c] border-zinc-800/80 hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <span className="text-amber-400 font-bold text-xs">{t.ticketCode}</span>
                          <div className="flex gap-1.5">
                            <span className={`px-2 py-0.5 text-[9px] font-bold uppercase border ${getPriorityBadge(t.priority)}`}>
                              {t.priority.split(" - ")[0]}
                            </span>
                            <span className={`px-2 py-0.5 text-[9px] font-bold uppercase border ${getStatusBadge(t.status)}`}>
                              {t.status}
                            </span>
                          </div>
                        </div>

                        <h3 className="text-xs font-bold text-zinc-100 line-clamp-1 mb-1">
                          {t.subject}
                        </h3>

                        <div className="flex justify-between items-center text-[10px] text-zinc-400 pt-2 border-t border-zinc-900">
                          <span>{t.category}</span>
                          <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Ticket Detail / Discussion Thread */}
                <div className="lg:col-span-7 bg-[#09090c] border border-zinc-800/80 p-6 space-y-4">
                  {selectedTicket ? (
                    <div className="space-y-4">
                      
                      {/* Ticket Summary Header */}
                      <div className="border-b border-zinc-800/80 pb-4 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-amber-400 font-bold text-sm">{selectedTicket.ticketCode}</span>
                          <span className={`px-2.5 py-1 text-xs font-bold uppercase border ${getStatusBadge(selectedTicket.status)}`}>
                            {selectedTicket.status}
                          </span>
                        </div>
                        <h2 className="text-base font-bold text-zinc-100">{selectedTicket.subject}</h2>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-zinc-400 bg-zinc-950 p-3 border border-zinc-900">
                          <div><strong>Category:</strong> {selectedTicket.category}</div>
                          <div><strong>Priority:</strong> {selectedTicket.priority}</div>
                          <div><strong>Assigned Admin:</strong> {selectedTicket.assignedTo}</div>
                          <div><strong>Phone:</strong> {selectedTicket.phone}</div>
                          <div><strong>Logged On:</strong> {new Date(selectedTicket.createdAt).toLocaleString()}</div>
                        </div>
                      </div>

                      {/* Original Issue Description */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                          ORIGINAL INCIDENT DESCRIPTION:
                        </span>
                        <div className="p-3 bg-zinc-950 border border-zinc-900 text-xs text-zinc-300 leading-relaxed">
                          {selectedTicket.description}
                        </div>
                      </div>

                      {/* Updates / Responses Timeline */}
                      <div className="space-y-3 pt-2">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                          ADMIN UPDATES & CONVERSATION TIMELINE:
                        </span>

                        {(!selectedTicket.updates || selectedTicket.updates.length === 0) ? (
                          <div className="p-4 bg-zinc-950 border border-zinc-900 text-center text-xs text-zinc-500">
                            Ticket registered in queue. Waiting for admin response.
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            {selectedTicket.updates.map((u, idx) => (
                              <div
                                key={idx}
                                className={`p-3 border text-xs space-y-1 ${
                                  u.author === "Admin"
                                    ? "bg-sky-950/20 border-sky-800/40 text-sky-200"
                                    : "bg-zinc-950 border-zinc-900 text-zinc-300"
                                }`}
                              >
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                  <span className={u.author === "Admin" ? "text-sky-400" : "text-amber-400"}>
                                    {u.author === "Admin" ? "🛡️ ITSM Admin Response" : "👤 User Note"}
                                  </span>
                                  <span className="text-zinc-500">{new Date(u.createdAt).toLocaleString()}</span>
                                </div>
                                <p className="leading-relaxed whitespace-pre-wrap">{u.message}</p>
                                {u.statusChange && (
                                  <div className="text-[10px] text-emerald-400 pt-1 border-t border-zinc-800/60 font-semibold">
                                    Status changed to: {u.statusChange}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  ) : (
                    <div className="text-center py-24 text-xs text-zinc-500 font-mono">
                      Select a ticket from the left column to view updates and admin resolution thread.
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        )}

        {/* TAB 3: TRACK BY TICKET CODE */}
        {activeTab === "track" && (
          <div className="max-w-2xl mx-auto space-y-6 font-mono">
            <div className="bg-[#09090c] border border-zinc-800/80 p-6 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <Search className="w-4 h-4 text-sky-400" />
                LOOKUP SUPPORT TICKET BY CODE
              </h2>
              <p className="text-xs text-zinc-400">
                Enter your reference ticket code (e.g., <code>TKT-928410</code>) to view real-time status and administrator notes.
              </p>

              <form onSubmit={handleTrackByCode} className="flex gap-2 text-xs">
                <input
                  type="text"
                  required
                  value={lookupCode}
                  onChange={(e) => setLookupCode(e.target.value)}
                  placeholder="Enter TKT-XXXXXX"
                  className="flex-1 bg-zinc-950 border border-zinc-800 px-3 py-2 text-zinc-100 uppercase focus:outline-none focus:border-sky-500 font-mono"
                />
                <button
                  type="submit"
                  disabled={isSearchingTrack}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold uppercase tracking-widest text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSearchingTrack ? <RefreshCw className="w-4 h-4 animate-spin" /> : "SEARCH"}
                </button>
              </form>

              {trackError && (
                <div className="p-3 bg-red-950/60 border border-red-600/60 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{trackError}</span>
                </div>
              )}
            </div>

            {trackedTicket && (
              <div className="bg-[#09090c] border border-zinc-800/80 p-6 space-y-4 text-xs">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <div>
                    <span className="text-amber-400 font-bold text-sm">{trackedTicket.ticketCode}</span>
                    <p className="text-zinc-400 text-[11px] mt-0.5">{trackedTicket.subject}</p>
                  </div>
                  <span className={`px-2.5 py-1 font-bold uppercase border ${getStatusBadge(trackedTicket.status)}`}>
                    {trackedTicket.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-zinc-950 p-3 border border-zinc-900 text-zinc-300">
                  <div><strong>Name:</strong> {trackedTicket.name}</div>
                  <div><strong>Email:</strong> {trackedTicket.email}</div>
                  <div><strong>Category:</strong> {trackedTicket.category}</div>
                  <div><strong>Priority:</strong> {trackedTicket.priority}</div>
                  <div><strong>Assigned To:</strong> {trackedTicket.assignedTo}</div>
                  <div><strong>Created:</strong> {new Date(trackedTicket.createdAt).toLocaleString()}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">ISSUE SUMMARY:</span>
                  <div className="p-3 bg-zinc-950 border border-zinc-900 text-zinc-300">
                    {trackedTicket.description}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">ADMIN UPDATES THREAD:</span>
                  {(!trackedUpdates || trackedUpdates.length === 0) ? (
                    <div className="p-3 bg-zinc-950 text-zinc-500 text-center">
                      No updates posted yet. Assigned to admin queue.
                    </div>
                  ) : (
                    trackedUpdates.map((u, idx) => (
                      <div key={idx} className="p-3 bg-sky-950/20 border border-sky-800/40 text-sky-200 space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-sky-400">🛡️ {u.authorName || "ITSM Admin"}</span>
                          <span className="text-zinc-500">{new Date(u.createdAt).toLocaleString()}</span>
                        </div>
                        <p>{u.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
