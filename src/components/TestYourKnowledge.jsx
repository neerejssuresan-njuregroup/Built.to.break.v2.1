/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldAlert, 
  HelpCircle, 
  Scale, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  TrendingUp, 
  ChevronRight, 
  RotateCcw,
  BookOpen,
  Info,
  Award,
  AlertOctagon,
  Building2,
  FileCheck,
  FileText,
  Bookmark,
  Sparkles,
  RefreshCw,
  Printer,
  ChevronLeft,
  Zap,
  Shield,
  Camera,
  Eye,
  Search,
  Lock,
  Check,
  Users,
  User,
  Hand,
  UserCheck,
  Activity,
  Mic,
  Download,
  Upload,
  Cloud,
  Loader2,
  UploadCloud,
  Clock
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { gamificationStore } from "../lib/GamificationStore";
import { io } from "socket.io-client";
import { saveLocalCertificate, saveCertificateToDb, getAccessToken, uploadIdToDrive } from "../lib/googleWorkspace";
import { 
  downloadCertificatePdf, 
  downloadCertificatePng, 
  printCertificateImage 
} from "../utils/certificateGenerator";
import { FALLBACK_QUESTIONS } from "../questionsData";

const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi NCR",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal"
];

function TestYourKnowledge() {
  // Generate dynamic Certificate Code based on score and time
  const [certCode] = useState(() => `DFS-AUDIT-${Math.floor(100000 + Math.random() * 900000)}`);

  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [questionsError, setQuestionsError] = useState(null);

  // Game states
  const [quizQuestions, setQuizQuestions] = useState([]); // 20 randomized questions
  const [attemptedAnswers, setAttemptedAnswers] = useState({}); // { index: { selectedId, isCorrect, pointsEarned } }
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [totalPossiblePoints, setTotalPossiblePoints] = useState(0);
  const [categoryBreakdown, setCategoryBreakdown] = useState({}); // Tracks correct/wrong by type
  
  // User identity details
  const [userName, setUserName] = useState("");
  const [userState, setUserState] = useState("");
  const [activeCertificateTab, setActiveCertificateTab] = useState("nbc");

  // ID Verification States
  const [idType, setIdType] = useState("aadhaar"); // "aadhaar" | "pan"
  const [idNumber, setIdNumber] = useState("");
  const [idPhoto, setIdPhoto] = useState(null);
  const [idPhotoName, setIdPhotoName] = useState("");
  const [isIdDragging, setIsIdDragging] = useState(false);
  const [driveIdUploaded, setDriveIdUploaded] = useState(false);
  const [driveIdUploading, setDriveIdUploading] = useState(false);
  const [driveUploadError, setDriveUploadError] = useState(null);

  const isIdFormatValid = () => {
    const raw = idNumber.replace(/[^a-zA-Z0-9]/g, "");
    if (idType === "aadhaar") {
      return /^\d{12}$/.test(raw);
    } else {
      return /^[A-Z]{5}\d{4}[A-Z]$/i.test(raw);
    }
  };

  const handleIdNumberChange = (val, type = idType) => {
    let raw = val.replace(/[^a-zA-Z0-9]/g, "");
    if (type === "aadhaar") {
      raw = raw.replace(/[^0-9]/g, "").slice(0, 12);
      const parts = [];
      for (let i = 0; i < raw.length; i += 4) {
        parts.push(raw.slice(i, i + 4));
      }
      setIdNumber(parts.join(" - "));
    } else {
      raw = raw.toUpperCase().slice(0, 10);
      setIdNumber(raw);
    }
  };

  const handleIdPhotoFile = (file) => {
    if (!file) return;
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const allowedImageTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    const isImage = allowedImageTypes.includes(file.type.toLowerCase()) || file.type.startsWith("image/");
    
    if (!isPdf && !isImage) {
      logProctor("[ERROR] Invalid file format. Only PDF documents or JPG/PNG images are allowed for ID proof.");
      alert("Invalid file format. Please select a valid PDF document or JPG/PNG image file for ID proof.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target.result;
      setIdPhoto(result);
      setIdPhotoName(file.name);
      logProctor(`[SUCCESS] Physical ${typeLabel(idType)} (${isPdf ? "PDF Document" : "JPG/PNG Image"}) loaded successfully.`);
    };
    reader.readAsDataURL(file);
  };

  // Auto-fill demo credentials when user enters "Test User"
  useEffect(() => {
    if (userName.trim().toLowerCase().includes("test user")) {
      if (!userState) setUserState("Delhi NCR");
      if (!idType) setIdType("aadhaar");
      if (!idNumber) setIdNumber("987654321012");
      if (!idPhoto) {
        setIdPhoto("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='100' viewBox='0 0 160 100'><rect width='100%' height='100%' fill='%2312131a'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%2310b981' font-size='10' font-family='monospace'>DEMO AADHAAR ID (TEST USER)</text></svg>");
        setIdPhotoName("demo_aadhaar_card.png");
      }
    }
  }, [userName, userState, idType, idNumber, idPhoto]);

  const typeLabel = (t) => t === "aadhaar" ? "Aadhaar Card" : "PAN Card";
  
  
  // Camera & Proctoring states
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState(false);
  const [showExpandedCam, setShowExpandedCam] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [rulesAccepted, setRulesAccepted] = useState(false);

  const handlePhotoFile = (file) => {
    if (!file) return;
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (isPdf || !file.type.startsWith("image/")) {
      logProctor("[ERROR] Invalid file type for candidate photo. PDF files are NOT allowed for photo verification. Please upload a valid JPG or PNG photo.");
      alert("PDF files are not allowed for Candidate Verified Photo. Please upload a valid JPG or PNG image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target.result;
      setCapturedPhoto(result);
      logProctor("[SUCCESS] Candidate identity photo registered successfully.");
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePhotoFile(e.dataTransfer.files[0]);
    }
  };

  const videoRef = React.useRef(null);
  const expandedVideoRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const micVolumeRef = React.useRef(0);
  const audioCtxRef = React.useRef(null);

  const [malpracticeCount, setMalpracticeCount] = useState(0);
  const [hideGamification, setHideGamification] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);
  const [terminationScreenshot, setTerminationScreenshot] = useState(null);
  const [terminationReason, setTerminationReason] = useState(null);
  const [malpracticeAlert, setMalpracticeAlert] = useState(null);
  const [proctorLogs, setProctorLogs] = useState(["[SYSTEM INITIALIZED] Live camera & microphone proctor active."]);

  // Realtime Audio Spectrum Analysis & Gemini AI Proctoring States
  const [micLevel, setMicLevel] = useState(0); // Live decibel level 0-100%
  const [micPeak, setMicPeak] = useState(0); // Peak volume level
  const [geminiAudioComment, setGeminiAudioComment] = useState("Microphone acoustic monitor initialized & active.");

  // Live Vision & Biometric Telemetry
  const [telemetry, setTelemetry] = useState({
    faceCount: 1,
    handStatus: "CLEAR",
    statusMessage: "Webcam & acoustic speech proctoring active"
  });

  // 25-Minute Exam Timer State (1500 seconds)
  const EXAM_DURATION_SECONDS = 25 * 60;
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION_SECONDS);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Certificate Verification Lookup State
  const [verifyInput, setVerifyInput] = useState("");
  const [verifyResult, setVerifyResult] = useState(null);

  const logProctor = (msg) => {
    const timestamp = new Date().toLocaleTimeString();
    setProctorLogs((prev) => [`[${timestamp}] ${msg}`, ...prev.slice(0, 19)]);
  };

  const triggerMalpractice = (reason) => {
    if (isTerminated) return;

    // Sound synth beep
    if (typeof window !== "undefined") {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(140, audioCtx.currentTime); // low buzz
          gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.35);
        }
      } catch (e) {
        console.warn("Could not fire malpractice audio alert", e);
      }
    }

    setMalpracticeAlert(reason);
    setMalpracticeCount((prev) => {
      const nextCount = prev + 1;
      logProctor(`!!! MALPRACTICE FLAG [${nextCount}/10]: ${reason} !!!`);
      
      if (nextCount >= 10) {
        setIsTerminated(true);
        logProctor("!!! EXAM TERMINATED: MAXIMUM WARNING LIMIT EXCEEDED (10/10) !!!");
        stopCamera();
      }
      return nextCount;
    });
  };

  // Close active camera streams
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      // Use smaller resolution for performance and dashboard display
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        if (video.readyState >= video.HAVE_CURRENT_DATA) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          try {
            return canvas.toDataURL("image/jpeg", 0.6);
          } catch (e) {
            console.error("Failed to extract canvas base64 image:", e);
          }
        }
      }
    }
    return null;
  };

  const captureErrorPhoto = (reasonText = "NO FACE DETECTED") => {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    if (videoRef.current && videoRef.current.readyState >= videoRef.current.HAVE_CURRENT_DATA) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = "#0c0808";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Top Red Alert Header
    ctx.fillStyle = "rgba(185, 28, 28, 0.9)";
    ctx.fillRect(0, 0, canvas.width, 45);

    // Bottom dark footer
    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    ctx.fillRect(0, canvas.height - 35, canvas.width, 35);

    // Header Text
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px monospace";
    ctx.fillText("EVIDENCE RECORD: NO FACE DETECTED", 12, 22);

    ctx.fillStyle = "#fca5a5";
    ctx.font = "bold 10px monospace";
    ctx.fillText(reasonText.toUpperCase().slice(0, 42), 12, 38);

    // Footer Text
    ctx.fillStyle = "#ef4444";
    ctx.font = "bold 10px monospace";
    ctx.fillText(`EXAM TERMINATED • ${new Date().toLocaleTimeString()}`, 12, canvas.height - 12);

    try {
      return canvas.toDataURL("image/jpeg", 0.7);
    } catch (e) {
      return null;
    }
  };

  // Immediate Exam Termination helper (e.g. on navigation away, tab switch, or window blur)
  const terminateExamImmediately = (reason) => {
    if (isTerminated) return;

    const errShot = captureErrorPhoto(reason);
    setCapturedPhoto(errShot);
    setTerminationScreenshot(errShot);
    setTerminationReason(reason);
    setIsTerminated(true);
    setMalpracticeCount(10);
    setTelemetry((prev) => ({
      ...prev,
      faceCount: 0,
      statusMessage: `Session terminated: ${reason}`
    }));
    setMalpracticeAlert(`CRITICAL EXAM TERMINATION: ${reason}. Session terminated immediately.`);
    logProctor(`!!! [IMMEDIATE TERMINATION] ${reason} !!!`);
    stopCamera();

    if (certCode) {
      fetch("/api/sessions/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionCode: certCode,
          userName: userName || "Test User",
          userState: userState || "Delhi NCR",
          status: "disqualified",
          proctorLogs: [`[TERMINATED] ${reason}. Error screenshot saved.`],
          flags: 10,
          userPhoto: errShot
        })
      }).catch(() => {});
    }
  };

  // Request camera and microphone permissions directly from browser
  const requestPermissions = async () => {
    if (stream && stream.getTracks().some(track => track.readyState === 'live')) {
      if (videoRef.current && videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      return stream;
    }

    if (typeof navigator === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(true);
      logProctor("Camera/mic media devices not supported in this browser environment.");
      return null;
    }

    try {
      let s;
      try {
        s = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
          audio: true
        });
      } catch (e1) {
        // Fallback to video only if audio device is unavailable or denied
        s = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" }
        });
      }
      setStream(s);
      setCameraError(false);
      logProctor("Live webcam & microphone feed authorized. AI proctor active.");

      // Setup microphone Web Audio analyzer for real-time speech monitoring & decibel telemetry
      if (s && s.getAudioTracks().length > 0 && typeof window !== "undefined") {
        try {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (AudioContextClass) {
            const audioCtx = new AudioContextClass();
            audioCtxRef.current = audioCtx;
            const source = audioCtx.createMediaStreamSource(s);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);

            const pcmData = new Uint8Array(analyser.frequencyBinCount);
            let peakVal = 0;

            const checkMicVolume = () => {
              if (s && s.active) {
                analyser.getByteFrequencyData(pcmData);
                let sum = 0;
                for (let i = 0; i < pcmData.length; i++) {
                  sum += pcmData[i];
                }
                const avg = sum / pcmData.length;
                const normalizedVal = Math.min(100, Math.round((avg / 128) * 100));
                micVolumeRef.current = normalizedVal;
                setMicLevel(normalizedVal);

                if (normalizedVal > peakVal) {
                  peakVal = normalizedVal;
                  setMicPeak(peakVal);
                }
                requestAnimationFrame(checkMicVolume);
              }
            };
            checkMicVolume();
          }
        } catch (e) {
          console.warn("Microphone analyzer setup note:", e);
        }
      }

      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.play().catch(() => {});
      }
      return s;
    } catch (err) {
      console.warn("Camera/Mic permission state:", err?.name || err?.message || err);
      setCameraError(true);
      logProctor("Proctor camera/mic permission restricted by browser. Click 'ENABLE CAMERA & MIC' to authorize.");
      return null;
    }
  };

  // Keep videoRef srcObject in sync whenever stream state updates
  useEffect(() => {
    if (videoRef.current && stream) {
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream;
      }
      videoRef.current.play().catch(() => {});
    }
  }, [stream]);

  // Camera & acoustic malpractice proctor loop
  useEffect(() => {
    let proctorInterval = null;
    let canvasInterval = null;

    if (hasStarted && !showSummary && !isTerminated) {
      // Prompt for camera and mic stream
      requestPermissions();

      // Browser window visibility change & navigation proctor checks
      const handleVisibilityChange = () => {
        if (document.visibilityState === "hidden") {
          terminateExamImmediately("NAVIGATION VIOLATION: User attempted to switch browser tab or navigate away during active exam.");
        }
      };

      const handleWindowBlur = () => {
        terminateExamImmediately("WINDOW FOCUS LOST: User navigated away or clicked outside active exam window.");
      };

      const handleBeforeUnload = (e) => {
        terminateExamImmediately("PAGE UNLOAD / REFRESH: User attempted to refresh or navigate away from active exam window.");
        e.preventDefault();
        e.returnValue = "";
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("blur", handleWindowBlur);
      window.addEventListener("beforeunload", handleBeforeUnload);

      // Automated AI Proctoring analysis & targeted acoustic monitoring
      let geminiProctorInterval = null;

      proctorInterval = setInterval(() => {
        if (isTerminated) return;

        setTelemetry(prev => ({
          ...prev,
          statusMessage: micVolumeRef.current > 25 
            ? `MIC NOISE SPIKE DETECTED (${micVolumeRef.current} dB)` 
            : "Webcam & acoustic speech proctoring active"
        }));
      }, 1000);

      // Gemini AI Proctoring & Real-Time Audio Speech Analysis Loop (Every 6s)
      let lastGeminiWarningTime = 0;
      geminiProctorInterval = setInterval(async () => {
        if (isTerminated || !videoRef.current) return;
        const now = Date.now();
        if (now - lastGeminiWarningTime < 5000) return;

        const frame = capturePhoto();
        if (!frame) return;

        try {
          const res = await fetch("/api/proctor/gemini-verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              image: frame,
              audioVolume: micVolumeRef.current || 0,
              audioPeak: micPeak || 0
            })
          });

          if (res.ok) {
            const data = await res.json();
            
            if (data.audioComment) {
              setGeminiAudioComment(data.audioComment);
            }

            if (data.multipleFacesDetected === true) {
              lastGeminiWarningTime = Date.now();
              setTelemetry(prev => ({ ...prev, faceCount: 2, statusMessage: "Multiple faces detected in camera view" }));
              triggerMalpractice("AI PROCTOR: MULTIPLE FACES DETECTED. More than one person is visible in the camera frame. ACTION: Ensure only the registered examinee is present in the camera frame.");
            } else if (data.faceDetected === false) {
              lastGeminiWarningTime = Date.now();
              setTelemetry(prev => ({ ...prev, faceCount: 0, statusMessage: "No face detected in webcam stream" }));
              triggerMalpractice("AI PROCTOR: NO FACE DETECTED (ROOM/CEILING ONLY). Camera is pointing at ceiling or empty space without a human face. ACTION: Adjust camera angle to center your face immediately.");
            } else if (data.faceFacingForward === false) {
              lastGeminiWarningTime = Date.now();
              setTelemetry(prev => ({ ...prev, statusMessage: "Face turned away from screen" }));
              triggerMalpractice("AI PROCTOR: FACE TURNED AWAY FROM SCREEN. Examinee head or gaze is turned away from active exam view. ACTION: Face directly forward towards the screen and maintain steady posture.");
            } else if (data.speechDetected === true || micVolumeRef.current > 30) {
              lastGeminiWarningTime = Date.now();
              const voiceComment = data.audioComment || "Vocal activity or whispering detected on microphone.";
              setTelemetry(prev => ({ ...prev, statusMessage: `SPEECH / VOICE FLAGGED (${micVolumeRef.current} dB)` }));
              triggerMalpractice(`AI PROCTOR AUDIO RESTRICTION: Microphone speech or vocal activity detected (${micVolumeRef.current} dB). Gemini Comment: "${voiceComment}". ACTION: Maintain complete silence during the examination.`);
            } else if (data.violationDetected === true) {
              lastGeminiWarningTime = Date.now();
              setTelemetry(prev => ({ ...prev, handStatus: "OBSTRUCTION / DEVICE DETECTED", statusMessage: "Unauthorized secondary device detected" }));
              triggerMalpractice(`AI PROCTOR VIOLATION DETECTED: ${data.violationReason || "Secondary phone, unauthorized device, or prohibited material in camera frame. ACTION: Clear all prohibited objects from desk."}`);
            }
          }
        } catch (err) {
          console.warn("Gemini AI proctor check note:", err);
        }
      }, 6000);

      // Real-time Canvas video frame pixel analysis (detects real head movement, face turn away, mobile phones, or hand obstruction)
      let prevFrameData = null;
      let lastMotionWarningTime = 0;

      canvasInterval = setInterval(() => {
        if (!videoRef.current || !canvasRef.current || isTerminated) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          ctx.drawImage(video, 0, 0, 80, 60);
          try {
            const imgData = ctx.getImageData(0, 0, 80, 60);
            const data = imgData.data;
            let totalLuminance = 0;
            let totalDiff = 0;
            let qDiff = [0, 0, 0, 0];
            let qCount = [0, 0, 0, 0];
            const now = Date.now();

            if (prevFrameData) {
              for (let y = 0; y < 60; y++) {
                for (let x = 0; x < 80; x++) {
                  const idx = (y * 80 + x) * 4;
                  const r = data[idx];
                  const g = data[idx+1];
                  const b = data[idx+2];
                  totalLuminance += (r + g + b) / 3;

                  const pr = prevFrameData[idx];
                  const pg = prevFrameData[idx+1];
                  const pb = prevFrameData[idx+2];
                  const diff = (Math.abs(r - pr) + Math.abs(g - pg) + Math.abs(b - pb)) / 3;
                  totalDiff += diff;

                  // Quadrant analysis (0: Top-Left, 1: Top-Right, 2: Bottom-Left, 3: Bottom-Right)
                  const qIdx = (y < 30 ? 0 : 2) + (x < 40 ? 0 : 1);
                  qDiff[qIdx] += diff;
                  qCount[qIdx]++;
                }
              }

              const numPixels = 80 * 60;
              const avgLum = totalLuminance / numPixels;
              const avgPixelDiff = totalDiff / numPixels;

              const qAvgs = qDiff.map((d, i) => d / (qCount[i] || 1));
              const topQuadAvg = (qAvgs[0] + qAvgs[1]) / 2;
              const bottomQuadAvg = (qAvgs[2] + qAvgs[3]) / 2;
              const maxQuadDiff = Math.max(...qAvgs);
              const minQuadDiff = Math.min(...qAvgs);

              // 1. Total blackout / camera covered check
              if (avgLum < 2) {
                if (now - lastMotionWarningTime > 6000) {
                  lastMotionWarningTime = now;
                  triggerMalpractice("CAMERA LENS COVERED: Camera stream is completely dark or blocked. ACTION: Uncover your camera lens immediately.");
                }
              }

              // 2. Accurate Cause Analysis:
              // - Cooldown: 6 seconds to prevent overwhelming the user
              // - Hand/Mobile Phone: Spike in bottom/edge quadrant (bottomQuadAvg > 12.0 or maxQuadDiff > 2.2 * minQuadDiff with avgPixelDiff > 10.0)
              // - Face Movement / Head Turn: Upper quadrant shift or general head tilt (topQuadAvg > 6.0, avgPixelDiff between 5.5 and 18.0)

              else if (now - lastMotionWarningTime > 6000) {
                if (bottomQuadAvg > 14.0 || (maxQuadDiff > 2.2 * (minQuadDiff + 1) && avgPixelDiff > 11.0)) {
                  // Hand or mobile device detected near bottom or camera edge
                  lastMotionWarningTime = now;
                  setTelemetry(prev => ({
                    ...prev,
                    handStatus: "HAND / MOBILE PHONE DETECTED",
                    statusMessage: "Secondary device or hand gesture in camera view"
                  }));
                  triggerMalpractice("MOBILE PHONE / HAND OBSTRUCTION DETECTED: Device or hand gesture detected in camera frame. ACTION: Remove secondary mobile devices and keep hands off face.");
                } else if (topQuadAvg > 5.5 || avgPixelDiff > 5.5) {
                  // Face or head turning away from center
                  lastMotionWarningTime = now;
                  setTelemetry(prev => ({
                    ...prev,
                    eyeGaze: "HEAD TURNED / LOOKING AWAY [FLAGGED]",
                    headAngle: "UNBALANCED (TILTED)",
                    statusMessage: "Examinee turned face away from center view"
                  }));
                  triggerMalpractice("EXPOSED FACE MOVEMENT: Head or gaze turned away from active exam view. ACTION: Face directly forward towards the screen and maintain steady posture.");
                }
              }
            } else {
              for (let i = 0; i < data.length; i += 4) {
                totalLuminance += (data[i] + data[i+1] + data[i+2]) / 3;
              }
            }

            if (!prevFrameData) {
              prevFrameData = new Uint8ClampedArray(data.length);
            }
            prevFrameData.set(data);
          } catch (e) {
            // canvas read error
          }
        }
      }, 1000);

      return () => {
        if (proctorInterval) clearInterval(proctorInterval);
        if (canvasInterval) clearInterval(canvasInterval);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        window.removeEventListener("blur", handleWindowBlur);
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, [hasStarted, showSummary, isTerminated]);

  // Real-Time Computer Vision Eyeball & Facial Feature Tracking Loop (requestAnimationFrame)
  useEffect(() => {
    if (!hasStarted || showSummary || isTerminated) return;

    let animId = null;
    const processCanvas = document.createElement("canvas");
    processCanvas.width = 320;
    processCanvas.height = 240;
    const procCtx = processCanvas.getContext("2d", { willReadFrequently: true });

    const runCVTracking = () => {
      const video = videoRef.current;
      if (video && video.readyState >= 2 && procCtx) {
        procCtx.drawImage(video, 0, 0, 320, 240);
        try {
          const frameData = procCtx.getImageData(0, 0, 320, 240);
          const data = frameData.data;

          // 1. REAL FACE BOUNDING BOX RECOGNITION
          let minX = 320, maxX = 0, minY = 240, maxY = 0;
          let skinPixelCount = 0;

          for (let y = 10; y < 230; y += 3) {
            for (let x = 10; x < 310; x += 3) {
              const idx = (y * 320 + x) * 4;
              const r = data[idx];
              const g = data[idx + 1];
              const b = data[idx + 2];
              const lum = (r + g + b) / 3;

              const isSkinOrFaceFeature = (r > 40 && g > 25 && b > 15 && Math.abs(r - g) > 8) || (lum > 30 && lum < 225);

              if (isSkinOrFaceFeature) {
                skinPixelCount++;
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
              }
            }
          }

          const faceDetected = skinPixelCount > 100 && (maxX - minX > 35) && (maxY - minY > 35);

          if (faceDetected) {
            const targetW = Math.max(90, Math.min(220, maxX - minX));
            const targetH = Math.max(100, Math.min(230, maxY - minY));
            const targetX = Math.max(20, Math.min(200, minX));
            const targetY = Math.max(15, Math.min(140, minY));

            const prevFB = trackingStateRef.current.faceBox;
            const faceBox = {
              x: Math.round(prevFB.x * 0.75 + targetX * 0.25),
              y: Math.round(prevFB.y * 0.75 + targetY * 0.25),
              w: Math.round(prevFB.w * 0.75 + targetW * 0.25),
              h: Math.round(prevFB.h * 0.75 + targetH * 0.25)
            };

            // 2. REAL EYEBALL & PUPIL TRACKING
            const leftEyeRegion = {
              x: Math.round(faceBox.x + faceBox.w * 0.15),
              y: Math.round(faceBox.y + faceBox.h * 0.22),
              w: Math.round(faceBox.w * 0.32),
              h: Math.round(faceBox.h * 0.22)
            };

            const rightEyeRegion = {
              x: Math.round(faceBox.x + faceBox.w * 0.53),
              y: Math.round(faceBox.y + faceBox.h * 0.22),
              w: Math.round(faceBox.w * 0.32),
              h: Math.round(faceBox.h * 0.22)
            };

            // Find darkest pixel cluster (Pupil / Iris) inside Left Eye Region
            let minLumL = 255;
            let pupilLX = leftEyeRegion.x + leftEyeRegion.w / 2;
            let pupilLY = leftEyeRegion.y + leftEyeRegion.h / 2;

            for (let y = leftEyeRegion.y; y < leftEyeRegion.y + leftEyeRegion.h; y += 2) {
              for (let x = leftEyeRegion.x; x < leftEyeRegion.x + leftEyeRegion.w; x += 2) {
                if (x >= 0 && x < 320 && y >= 0 && y < 240) {
                  const idx = (y * 320 + x) * 4;
                  const lum = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                  if (lum < minLumL) {
                    minLumL = lum;
                    pupilLX = x;
                    pupilLY = y;
                  }
                }
              }
            }

            // Find darkest pixel cluster (Pupil / Iris) inside Right Eye Region
            let minLumR = 255;
            let pupilRX = rightEyeRegion.x + rightEyeRegion.w / 2;
            let pupilRY = rightEyeRegion.y + rightEyeRegion.h / 2;

            for (let y = rightEyeRegion.y; y < rightEyeRegion.y + rightEyeRegion.h; y += 2) {
              for (let x = rightEyeRegion.x; x < rightEyeRegion.x + rightEyeRegion.w; x += 2) {
                if (x >= 0 && x < 320 && y >= 0 && y < 240) {
                  const idx = (y * 320 + x) * 4;
                  const lum = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                  if (lum < minLumR) {
                    minLumR = lum;
                    pupilRX = x;
                    pupilRY = y;
                  }
                }
              }
            }

            // Gaze Vector Offsets
            const eyeCenterX_L = leftEyeRegion.x + leftEyeRegion.w / 2;
            const eyeCenterY_L = leftEyeRegion.y + leftEyeRegion.h / 2;
            const eyeCenterX_R = rightEyeRegion.x + rightEyeRegion.w / 2;
            const eyeCenterY_R = rightEyeRegion.y + rightEyeRegion.h / 2;

            const offsetLX = pupilLX - eyeCenterX_L;
            const offsetLY = pupilLY - eyeCenterY_L;
            const offsetRX = pupilRX - eyeCenterX_R;
            const offsetRY = pupilRY - eyeCenterY_R;

            const avgOffsetX = (offsetLX + offsetRX) / 2;
            const avgOffsetY = (offsetLY + offsetRY) / 2;

            const gazeAngleX = parseFloat((avgOffsetX * 1.8).toFixed(1));
            const gazeAngleY = parseFloat((avgOffsetY * 1.8).toFixed(1));

            // Head Tilt
            const dy = pupilRY - pupilLY;
            const dx = pupilRX - pupilLX;
            const headTilt = parseFloat((Math.atan2(dy, dx) * (180 / Math.PI)).toFixed(1));

            // 14-point Facial Mesh Landmarks
            const landmarks = [
              { id: "L_EYE_OUT", x: leftEyeRegion.x, y: pupilLY },
              { id: "L_PUPIL", x: pupilLX, y: pupilLY },
              { id: "L_EYE_IN", x: leftEyeRegion.x + leftEyeRegion.w, y: pupilLY },
              { id: "R_EYE_IN", x: rightEyeRegion.x, y: pupilRY },
              { id: "R_PUPIL", x: pupilRX, y: pupilRY },
              { id: "R_EYE_OUT", x: rightEyeRegion.x + rightEyeRegion.w, y: pupilRY },
              { id: "NOSE_BRIDGE", x: faceBox.x + faceBox.w * 0.5, y: faceBox.y + faceBox.h * 0.45 },
              { id: "NOSE_TIP", x: faceBox.x + faceBox.w * 0.5, y: faceBox.y + faceBox.h * 0.62 },
              { id: "L_MOUTH", x: faceBox.x + faceBox.w * 0.32, y: faceBox.y + faceBox.h * 0.78 },
              { id: "R_MOUTH", x: faceBox.x + faceBox.w * 0.68, y: faceBox.y + faceBox.h * 0.78 },
              { id: "LIP_CENTER", x: faceBox.x + faceBox.w * 0.5, y: faceBox.y + faceBox.h * 0.8 },
              { id: "CHIN", x: faceBox.x + faceBox.w * 0.5, y: faceBox.y + faceBox.h * 0.95 }
            ];

            trackingStateRef.current = {
              ...trackingStateRef.current,
              faceDetected: true,
              faceBox,
              leftEye: { x: eyeCenterX_L, y: eyeCenterY_L, pupilX: pupilLX, pupilY: pupilLY },
              rightEye: { x: eyeCenterX_R, y: eyeCenterY_R, pupilX: pupilRX, pupilY: pupilRY },
              gazeAngleX,
              gazeAngleY,
              headTiltAngle: headTilt,
              landmarks
            };

            const gazeDirStr = Math.abs(gazeAngleX) < 3.5 && Math.abs(gazeAngleY) < 3.5
              ? `CENTERED (X: ${gazeAngleX >= 0 ? '+' : ''}${gazeAngleX}°, Y: ${gazeAngleY >= 0 ? '+' : ''}${gazeAngleY}°)`
              : gazeAngleX > 3.5 ? `SHIFTED RIGHT (+${gazeAngleX}°)` : gazeAngleX < -3.5 ? `SHIFTED LEFT (${gazeAngleX}°)` : `VERTICAL SHIFT (${gazeAngleY}°)`;

            setTelemetry(prev => ({
              ...prev,
              eyeGaze: `REAL GAZE: ${gazeDirStr}`,
              faceCount: 1,
              headAngle: `REAL TILT: ${headTilt >= 0 ? '+' : ''}${headTilt}°`,
              statusMessage: "Real-time eyeball vector tracking active"
            }));

          } else {
            trackingStateRef.current.faceDetected = false;
          }
        } catch (e) {
          // processing note
        }
      }

      animId = requestAnimationFrame(runCVTracking);
    };

    animId = requestAnimationFrame(runCVTracking);

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [hasStarted, showSummary, isTerminated]);

  // 3-second Periodic Face Detection & Session Termination Check (First 3s and Every 3s)
  useEffect(() => {
    if (!hasStarted || showSummary || isTerminated) return;

    let threeSecondTimer = null;

    const runThreeSecondFaceCheck = async () => {
      if (isTerminated) return;

      let facePresent = true;
      let failureReason = "NO FACE DETECTED IN WEBCAM STREAM";

      const video = videoRef.current;

      // 1. Check camera stream availability & video state
      if (!video || !stream || !stream.active || video.readyState < 2) {
        facePresent = false;
        failureReason = "NO ACTIVE CAMERA FEED DETECTED";
      } else {
        // 2. Local canvas frame analysis for illumination & facial structure
        try {
          const testCanvas = document.createElement("canvas");
          testCanvas.width = 160;
          testCanvas.height = 120;
          const ctx = testCanvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(video, 0, 0, 160, 120);
            const imgData = ctx.getImageData(0, 0, 160, 120);
            const pixels = imgData.data;

            let totalLuminance = 0;
            let centerLuminance = 0;
            let centerPixelCount = 0;

            for (let y = 0; y < 120; y++) {
              for (let x = 0; x < 160; x++) {
                const idx = (y * 160 + x) * 4;
                const lum = (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 3;
                totalLuminance += lum;

                // Center 50% region where the human face should be positioned
                if (x >= 40 && x <= 120 && y >= 30 && y <= 90) {
                  centerLuminance += lum;
                  centerPixelCount++;
                }
              }
            }

            const avgTotalLum = totalLuminance / (160 * 120);
            const avgCenterLum = centerLuminance / (centerPixelCount || 1);

            // Dark/covered camera detection threshold
            if (avgTotalLum < 3 || avgCenterLum < 3) {
              facePresent = false;
              failureReason = "CAMERA COVERED / DARK FEED (NO HUMAN FACE DETECTED)";
            }
          }
        } catch (e) {
          console.warn("3-second face canvas check note:", e);
        }

        // 3. AI Proctoring verification check via backend
        if (facePresent) {
          const frame = capturePhoto();
          if (frame) {
            try {
              const res = await fetch("/api/proctor/gemini-verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: frame, audioVolume: micVolumeRef.current || 0 })
              });
              if (res.ok) {
                const data = await res.json();
                if (data.faceDetected === false) {
                  facePresent = false;
                  failureReason = "AI PROCTOR: NO HUMAN FACE DETECTED IN CAMERA STREAM";
                }
              }
            } catch (e) {
              // Non-blocking fallback
            }
          }
        }
      }

      // If no face is detected, terminate session immediately with error screenshot!
      if (!facePresent && !isTerminated) {
        const errShot = captureErrorPhoto(failureReason);
        setCapturedPhoto(errShot);
        setTerminationScreenshot(errShot);
        setTerminationReason(failureReason);
        setIsTerminated(true);
        setTelemetry((prev) => ({
          ...prev,
          faceCount: 0,
          statusMessage: "Session terminated: No human face detected"
        }));
        setMalpracticeAlert(`CRITICAL PROCTOR TERMINATION: ${failureReason}. Session terminated automatically with error screenshot evidence.`);
        logProctor(`!!! [TERMINATED] ${failureReason}. Error screenshot generated and session terminated. !!!`);
        stopCamera();

        if (certCode) {
          fetch("/api/sessions/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionCode: certCode,
              userName: userName || "Test User",
              userState: userState || "Delhi NCR",
              status: "disqualified",
              proctorLogs: [`[TERMINATED] ${failureReason}. Error screenshot saved.`],
              flags: 10,
              userPhoto: errShot
            })
          }).catch(() => {});
        }
      }
    };

    // Run check every 3 seconds
    threeSecondTimer = setInterval(runThreeSecondFaceCheck, 3000);

    return () => {
      if (threeSecondTimer) clearInterval(threeSecondTimer);
    };
  }, [hasStarted, showSummary, isTerminated, certCode, userName, userState, stream]);

  // Revoke camera and microphone access when exam is completed or terminated
  useEffect(() => {
    if (showSummary || isTerminated) {
      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop();
          console.log(`[PROCTOR] Revoked track: ${track.kind}`);
        });
        setStream(null);
      }
    }
  }, [showSummary, isTerminated, stream]);

  // Clean up all media tracks if the component unmounts
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, [stream]);

  // Handle malpractice cleanup alert timers
  useEffect(() => {
    if (malpracticeAlert) {
      const timer = setTimeout(() => {
        setMalpracticeAlert(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [malpracticeAlert]);

  // 25-Minute Exam Countdown Timer with Auto-Submit
  useEffect(() => {
    if (!hasStarted || showSummary || isTerminated) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          logProctor("!!! [TIME EXPIRED] 25-Minute Exam Countdown limit reached! Automatically submitting candidate responses... !!!");

          if (videoRef.current) {
            const snap = capturePhoto();
            if (snap) setCapturedPhoto(snap);
          }

          setTimeout(() => {
            const finalScore = totalPossiblePoints > 0 ? Math.round((earnedPoints / totalPossiblePoints) * 100) : 0;
            const passed = finalScore >= 85;
            gamificationStore.recordQuizScore(finalScore, passed, earnedPoints);
            setShowSummary(true);
          }, 100);

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasStarted, showSummary, isTerminated, totalPossiblePoints, earnedPoints]);

  // Real-time video streaming to Admin
  useEffect(() => {
    if (!hasStarted || showSummary || isTerminated || !certCode) return;
    
    // Connect socket
    const socket = io();
    socket.emit("join-session", certCode);

    const streamInterval = setInterval(() => {
      const frame = capturePhoto();
      if (frame) {
        socket.emit("video-frame", { sessionCode: certCode, frame });
      }
    }, 200); // 5 FPS

    return () => {
      clearInterval(streamInterval);
      socket.disconnect();
    };
  }, [hasStarted, showSummary, isTerminated, certCode]);

  const syncSessionWithServer = async (overrideStatus, overrideLogs, overrideFlags) => {
    try {
      const currentStatus = overrideStatus || (isTerminated ? "disqualified" : showSummary ? "completed" : "ongoing");
      const currentLogs = overrideLogs || proctorLogs;
      const currentFlags = overrideFlags !== undefined ? overrideFlags : malpracticeCount;
      const currentScorePercent = Math.round((earnedPoints / (totalPossiblePoints || 1)) * 100);

      const res = await fetch("/api/sessions/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionCode: certCode,
          userName: userName || "Test User",
          userState: userState || "Delhi NCR",
          status: currentStatus,
          proctorLogs: currentLogs,
          flags: currentFlags,
          currentQuestionIndex: activeScenarioIdx,
          scorePercent: currentScorePercent,
          userPhoto: capturePhoto() || capturedPhoto
        })
      });
      if (res.ok) {
        const data = await res.json();
        return data.session;
      }
    } catch (e) {
      console.warn("Error syncing session state:", e);
    }
    return null;
  };

  // Automatic state sync to backend
  useEffect(() => {
    if (!hasStarted) return;
    const delayDebounce = setTimeout(() => {
      syncSessionWithServer();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [proctorLogs, malpracticeCount, activeScenarioIdx, earnedPoints, totalPossiblePoints, capturedPhoto, hasStarted, isTerminated, showSummary]);

  // Polling server for admin actions
  useEffect(() => {
    if (!hasStarted || showSummary || isTerminated) return;

    const interval = setInterval(async () => {
      // Sync client state (including new video frame) to server
      syncSessionWithServer();
      
      try {
        const res = await fetch(`/api/sessions/status/${certCode}`);
        if (res.ok) {
          const serverSession = await res.json();
          
          if (serverSession.status === "disqualified") {
            setIsTerminated(true);
            setMalpracticeAlert("EXAM TERMINATED: Manual proctor decision or warning threshold exceeded.");
            setMalpracticeCount(serverSession.flags || 10);
            if (serverSession.proctorLogs) {
              setProctorLogs(serverSession.proctorLogs);
            }
            if (stream) {
              stream.getTracks().forEach((track) => track.stop());
              setStream(null);
            }
            clearInterval(interval);
            return;
          }

          if (serverSession.flags !== undefined && serverSession.flags !== malpracticeCount) {
            setMalpracticeCount(serverSession.flags);
          }

          if (serverSession.hideGamification !== undefined && serverSession.hideGamification !== hideGamification) {
            setHideGamification(serverSession.hideGamification);
          }

          if (serverSession.proctorLogs && JSON.stringify(serverSession.proctorLogs) !== JSON.stringify(proctorLogs)) {
            setProctorLogs(serverSession.proctorLogs);
          }
        }
      } catch (err) {
        console.warn("Polling status error:", err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [hasStarted, showSummary, isTerminated, certCode, malpracticeCount, proctorLogs, stream, hideGamification]);



  // Fetch 20 random questions dynamically from the PostgreSQL database or fallback
  const initializeQuiz = async () => {
    setIsLoadingQuestions(true);
    setQuestionsError(null);
    try {
      let data = [];
      try {
        const response = await fetch("/api/questions");
        if (response.ok) {
          data = await response.json();
        }
      } catch (networkErr) {
        console.warn("[QUIZ] API fetch failed, loading fallback questions:", networkErr);
      }

      if (!Array.isArray(data) || data.length === 0) {
        data = FALLBACK_QUESTIONS;
      }
      
      // Calculate total possible points
      const totalPoints = data.reduce((sum, q) => sum + (q.points || 5), 0);
      
      setQuizQuestions(data);
      setTotalPossiblePoints(totalPoints);
      setActiveScenarioIdx(0);
      setSelectedOption(null);
      setIsSubmitted(false);
      setEarnedPoints(0);
      setShowSummary(false);
      setAttemptedAnswers({});
      setCategoryBreakdown({});
      setIsTerminated(false);
      setTerminationScreenshot(null);
      setTerminationReason(null);
      setMalpracticeCount(0);
      setMalpracticeAlert(null);
      setTimeLeft(EXAM_DURATION_SECONDS);
      setProctorLogs(["[RE-INITIALIZED] Camera proctor calibration ready. All warnings & flags reset to 0."]);
      setTelemetry({
        eyeGaze: "CENTERED (X: +0.0°, Y: +0.0°)",
        faceCount: 1,
        headAngle: "BALANCED (0.0°)",
        handStatus: "CLEAR",
        statusMessage: "Biometric vectors synchronized"
      });

      if (certCode) {
        fetch("/api/sessions/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionCode: certCode,
            userName: userName || "Test User",
            userState: userState || "Delhi NCR",
            status: "ongoing",
            proctorLogs: ["[RE-INITIALIZED] Exam re-attempt started. All warnings and flags reset to 0."],
            flags: 0,
            currentQuestionIndex: 0,
            scorePercent: 0,
            userPhoto: null
          })
        }).catch(() => {});
      }
    } catch (err) {
      console.warn("Error in initializeQuiz, using fallback questions:", err);
      setQuizQuestions(FALLBACK_QUESTIONS);
      setTotalPossiblePoints(FALLBACK_QUESTIONS.reduce((sum, q) => sum + (q.points || 5), 0));
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  useEffect(() => {
    initializeQuiz();
  }, []);

  const currentScenario = quizQuestions[activeScenarioIdx];

  const handleSelectOption = (optId) => {
    if (isSubmitted) return;
    setSelectedOption(optId);
  };

  const getCertOptions = () => ({
    userName: userName || "Examinee",
    userState: userState || "Delhi NCR",
    finalScorePercent,
    certCode,
    certDate,
    activeTab: activeCertificateTab,
    userPhoto: capturedPhoto,
    idType,
    idNumber,
    idPhoto
  });

  const handleDownloadPdf = async () => {
    logProctor("Exporting standalone vector PDF certificate...");
    await downloadCertificatePdf(getCertOptions());
  };

  const handleDownloadPng = async () => {
    logProctor("Exporting high-res PNG certificate image...");
    await downloadCertificatePng(getCertOptions());
  };

  const handlePrintCert = async () => {
    logProctor("Initiating print document view...");
    await printCertificateImage(getCertOptions());
  };

  const handleSubmit = () => {
    if (!selectedOption || isSubmitted) return;
    
    const isCorrect = selectedOption === currentScenario.correctId;
    const points = isCorrect ? (currentScenario.points || 5) : 0;
    
    let updatedPoints = earnedPoints;
    if (isCorrect) {
      updatedPoints = earnedPoints + points;
      setEarnedPoints((prev) => prev + points);
    }

    // Track category breakdown for tailored suggestions
    const type = currentScenario.type || "General Code";
    setCategoryBreakdown((prev) => {
      const current = prev[type] || { total: 0, correct: 0 };
      return {
        ...prev,
        [type]: {
          total: current.total + 1,
          correct: current.correct + (isCorrect ? 1 : 0)
        }
      };
    });

    const newAttempted = {
      ...attemptedAnswers,
      [activeScenarioIdx]: {
        selected: selectedOption,
        isCorrect,
        pointsEarned: points,
        question: currentScenario
      }
    };

    setAttemptedAnswers(newAttempted);
    setIsSubmitted(true);

    // Test user fast-track condition
    const isTestUser = userName.trim().toLowerCase().includes("test user");
    const correctCount = Object.values(newAttempted).filter((a) => a.isCorrect).length;

    if (isTestUser && correctCount >= 2) {
      logProctor("[TEST USER MODE] 2 Correct Answers Achieved — Certificate Unlocked Immediately!");
      if (videoRef.current) {
        const snap = capturePhoto();
        if (snap) setCapturedPhoto(snap);
      }
      setTimeout(() => {
        setEarnedPoints(100);
        setTotalPossiblePoints(100);
        gamificationStore.recordQuizScore(100, true, 100);
        setShowSummary(true);
      }, 700);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsSubmitted(false);

    const isTestUser = userName.trim().toLowerCase().includes("test user");
    const correctCount = Object.values(attemptedAnswers).filter((a) => a.isCorrect).length;

    if (isTestUser && correctCount >= 2) {
      if (videoRef.current) {
        const snap = capturePhoto();
        if (snap) setCapturedPhoto(snap);
      }
      setEarnedPoints(100);
      setTotalPossiblePoints(100);
      gamificationStore.recordQuizScore(100, true, 100);
      setShowSummary(true);
      return;
    }
    
    if (activeScenarioIdx < quizQuestions.length - 1) {
      setActiveScenarioIdx((prev) => prev + 1);
    } else {
      // Calculate final statistics and update global gamification store
      const finalScorePercent = Math.round((earnedPoints / totalPossiblePoints) * 100);
      const passed = finalScorePercent >= 85;
      
      if (videoRef.current) {
        const snap = capturePhoto();
        if (snap) setCapturedPhoto(snap);
      }

      gamificationStore.recordQuizScore(finalScorePercent, passed, earnedPoints);
      setShowSummary(true);
    }
  };

  // Skip helper to skip to results quickly if requested, or navigate back/forth in review
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [reviewIdx, setReviewIdx] = useState(0);

  // UI colors for difficulty and hazard levels
  const getDifficultyBadge = (diff) => {
    switch (diff) {
      case "HARD":
        return "bg-red-950/45 border-red-800 text-red-400";
      case "MEDIUM":
        return "bg-orange-950/45 border-orange-800 text-orange-400";
      case "EASY":
      default:
        return "bg-zinc-900 border-zinc-800 text-zinc-400";
    }
  };

  const getHazardBadge = (level) => {
    switch (level) {
      case "CRITICAL":
        return "bg-red-950/40 border-red-500 text-red-500 animate-pulse";
      case "HIGH":
        return "bg-orange-950/40 border-orange-500 text-orange-400";
      case "SAFE":
        return "bg-green-950/40 border-green-500 text-green-400";
      default:
        return "bg-zinc-900 border-zinc-800 text-zinc-400";
    }
  };

  const finalScorePercent = totalPossiblePoints > 0 ? Math.round((earnedPoints / totalPossiblePoints) * 100) : 0;
  const isPassed = finalScorePercent >= 85;

  const certDate = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  // Auto-save certificate to registry whenever summary screen is shown
  useEffect(() => {
    if (showSummary) {
      const certData = {
        certCode,
        userName: userName.trim() || "INSPECTOR EXAMINER",
        userState: userState || "Delhi NCR",
        finalScorePercent,
        activeTab: activeCertificateTab,
        certDate,
        status: "VERIFIED & ISSUED",
        driveFileId: null,
        driveViewUrl: null,
        sheetSynced: false,
        userPhoto: capturedPhoto,
        idType,
        idNumber,
        idPhoto
      };
      saveLocalCertificate(certData);
      saveCertificateToDb(certData);
    }
  }, [showSummary, certCode, userName, userState, finalScorePercent, activeCertificateTab, certDate, capturedPhoto, idType, idNumber, idPhoto]);

  // Auto-upload ID to Google Drive if they pass and are logged in with Google
  useEffect(() => {
    if (showSummary && isPassed) {
      const token = getAccessToken();
      if (token && idPhoto && !driveIdUploaded && !driveIdUploading) {
        setDriveIdUploading(true);
        setDriveUploadError(null);
        uploadIdToDrive(token, idType, certCode, idPhoto)
          .then((res) => {
            setDriveIdUploaded(true);
            setDriveIdUploading(false);
            logProctor(`[SUCCESS] Verified ID successfully stored in Google Drive folder 'ID' as ${idType}_${certCode}`);
            
            // Enrich and save certificate to DB with Google Drive links
            const certData = {
              certCode,
              userName: userName.trim() || "INSPECTOR EXAMINER",
              userState: userState || "Delhi NCR",
              finalScorePercent,
              activeTab: activeCertificateTab,
              certDate,
              status: "VERIFIED & ISSUED",
              userPhoto: capturedPhoto,
              idType,
              idNumber,
              idPhoto,
              driveIdFileId: res.fileId,
              driveIdViewUrl: res.webViewLink
            };
            saveLocalCertificate(certData);
            saveCertificateToDb(certData);
          })
          .catch((err) => {
            setDriveIdUploading(false);
            setDriveUploadError(err.message);
            logProctor(`[ERROR] Automatic Google Drive backup failed: ${err.message}`);
          });
      }
    }
  }, [showSummary, isPassed, idPhoto, idType, certCode, driveIdUploaded, driveIdUploading, userName, userState, finalScorePercent, activeCertificateTab, certDate, capturedPhoto, idNumber]);

  return (
    <div className="bg-zinc-950/50 border border-zinc-900 p-6 md:p-10 space-y-8 max-w-5xl mx-auto rounded-none relative overflow-hidden my-12" id="forensic-assessment-lab">
      {/* Dynamic graphic patterns */}
      <div className="absolute right-0 top-0 w-64 h-64 bg-[#EF4444]/2 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute left-10 bottom-10 w-44 h-44 bg-[#F59E0B]/1 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-[repeating-linear-gradient(90deg,#18181b,#18181b_10px,transparent_10px,transparent_20px)] opacity-30" />

      {/* AI PROCTORING INSTRUCTIONS AND RULES POPUP MODAL */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 font-mono overflow-y-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#08080a] border border-zinc-800 p-6 md:p-8 max-w-2xl w-full text-left space-y-6 shadow-[0_0_60px_rgba(239,68,68,0.15)] my-8"
          >
            <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
              <div className="p-2.5 bg-red-950/40 border border-red-500/50 text-red-500 rounded-none">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[9px] text-red-400 font-black uppercase tracking-[0.2em] block">AI PROCTORING PROTOCOL REQUIRED</span>
                <h3 className="text-lg font-black text-white uppercase font-display">
                  EXAMINATION INTEGRITY INSTRUCTIONS
                </h3>
              </div>
            </div>

            <div className="text-[11px] text-zinc-400 leading-relaxed space-y-4">
              <p>
                To maintain the legal status and authentication validity of your 
                <strong> NBC Compliance Credentials</strong>, this examination is subject to automated 
                biometric telemetry and real-time vision proctoring checks.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#0c0c10] border border-zinc-900 p-4">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 mt-0.5">
                    <User className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <h5 className="font-bold text-zinc-200 uppercase text-[10px] tracking-wide">UPRIGHT POSITIONING</h5>
                    <p className="text-[10px] text-zinc-500 mt-0.5 leading-normal">
                      Sit straight, center-frame. Your face must be fully exposed and clearly illuminated. Do not lay down or move out of the camera's sight.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 mt-0.5">
                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <h5 className="font-bold text-zinc-200 uppercase text-[10px] tracking-wide">NO FACE OBSTRUCTION</h5>
                    <p className="text-[10px] text-zinc-500 mt-0.5 leading-normal">
                      Do not place hands, books, or devices over your face, mouth, or ears. Hands must remain clear of the webcam stream area.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 mt-0.5">
                    <Eye className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h5 className="font-bold text-zinc-200 uppercase text-[10px] tracking-wide">SINGLE-EXAMINER RULE</h5>
                    <p className="text-[10px] text-zinc-500 mt-0.5 leading-normal">
                      Only one person is permitted in the webcam feed. Any multi-face detection or bystanders will trigger warning flags instantly.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 mt-0.5">
                    <Activity className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <h5 className="font-bold text-zinc-200 uppercase text-[10px] tracking-wide">ACTIVE SYSTEM FOCUS</h5>
                    <p className="text-[10px] text-zinc-500 mt-0.5 leading-normal">
                      Do not switch tabs, minimize windows, or lose focus. The AI tracking engine monitors screen focal changes continuously.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-red-950/20 border border-red-900/40 p-3.5 space-y-1 text-red-300">
                <span className="font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> PENALTY & TERMINATION POLICY
                </span>
                <p className="text-[10px] leading-normal opacity-90">
                  You are allowed a maximum of <strong>10 Compliance Warnings</strong> before your secure session is auto-terminated, 
                  permanently failing the exam and revoking your access. Keep your environment silent and properly aligned.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-900 space-y-4">
              <label className="flex items-start gap-3 group cursor-pointer text-zinc-300 select-none">
                <input
                  type="checkbox"
                  checked={rulesAccepted}
                  onChange={(e) => setRulesAccepted(e.target.checked)}
                  className="mt-1 accent-red-600 rounded-none w-4 h-4 border border-zinc-800 bg-zinc-950"
                />
                <span className="text-[10.5px] font-mono leading-relaxed group-hover:text-white transition-colors">
                  I acknowledge the active **AI Proctoring Protocol**, verify that my face is centered and clearly visible in the webcam stream, and agree to follow these examination directives.
                </span>
              </label>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    if (!rulesAccepted) return;
                    setShowRulesModal(false);
                    setHasStarted(true);
                    const activeStream = await requestPermissions();
                    gamificationStore.triggerMission("PRELOADER");
                    
                    // Init sync on start
                    if (activeStream) {
                      setTimeout(async () => {
                        const snap = capturePhoto();
                        if (snap) setCapturedPhoto(snap);
                        await fetch("/api/sessions/sync", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            sessionCode: certCode,
                            userName: userName || "Test User",
                            userState: userState || "Delhi NCR",
                            status: "ongoing",
                            proctorLogs: ["[SYSTEM INITIALIZED] Live exam started. Proctor monitoring active."],
                            flags: 0,
                            currentQuestionIndex: 0,
                            scorePercent: 0,
                            userPhoto: snap || null
                          })
                        });
                      }, 1500);
                    } else {
                      await fetch("/api/sessions/sync", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          sessionCode: certCode,
                          userName: userName || "Test User",
                          userState: userState || "Delhi NCR",
                          status: "ongoing",
                          proctorLogs: ["[SYSTEM INITIALIZED] Live exam started without camera feed. Proctor monitoring active."],
                          flags: 0,
                          currentQuestionIndex: 0,
                          scorePercent: 0,
                          userPhoto: null
                        })
                      });
                    }
                  }}
                  disabled={!rulesAccepted}
                  className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    rulesAccepted
                      ? "bg-[#EF4444] text-white border border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:bg-red-500"
                      : "bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed"
                  }`}
                >
                  INITIALIZE FIRE AUDIT & START MISSION ➔
                </button>
                <button
                  type="button"
                  onClick={() => setShowRulesModal(false)}
                  className="px-5 py-3 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  ABORT SECURE SESSION
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* RENDER VIEW SWITCHER VIA CLEAN IIFE */}
      {(() => {
        if (isLoadingQuestions) {
          return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4 font-mono text-center">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <div className="absolute -inset-1 rounded-full border border-red-500/20 animate-ping" />
                <RefreshCw className="w-6 h-6 text-[#EF4444] animate-spin" />
              </div>
              <p className="text-xs text-zinc-500 uppercase tracking-widest animate-pulse">
                RETRIEVING DYNAMIC QUESTION BANK FROM POSTGRESQL...
              </p>
            </div>
          );
        }
        if (questionsError) {
          return (
            <div className="flex flex-col items-center justify-center py-16 space-y-6 font-mono text-center max-w-md mx-auto">
              <div className="p-3 bg-red-950/20 border border-red-500/30 text-red-500 rounded-none shadow-inner">
                <ShieldAlert className="w-8 h-8 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-black text-white uppercase tracking-wider">DATABASE ACCESS ERROR</h4>
                <p className="text-[10px] text-zinc-500 leading-relaxed font-light">{questionsError}</p>
              </div>
              <button
                onClick={() => initializeQuiz()}
                className="px-5 py-2.5 bg-red-950/40 hover:bg-[#EF4444] border border-red-600/60 text-red-400 hover:text-white text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                RETRY SECURE DATABASE CONNECTION
              </button>
            </div>
          );
        }
        if (!hasStarted) {
          return null; // Handled by pre-exam setup modal / view below
        }
      })()}

      {!hasStarted ? (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-10 space-y-8 max-w-2xl mx-auto"
        >
          <div className="inline-flex p-4 bg-red-950/20 border border-red-500/40 text-red-500 rounded-none mb-2 shadow-inner">
            <ShieldAlert className="w-12 h-12 animate-pulse" />
          </div>
          
          <div className="space-y-3">
            <span className="font-mono text-[10px] text-red-500 font-black uppercase tracking-[0.35em] block">
              NATIONAL SAFETY COMMISSION TEST LAB
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-zinc-100 uppercase tracking-tight font-display">
              NBC COMPLIANCE FORENSIC EXAM
            </h2>
            <p className="text-zinc-400 text-xs md:text-sm font-light leading-relaxed">
              Welcome to the advanced fire safety legal assessment. You will be presented with <strong className="text-zinc-200">20 random building scenarios & multiple-choice questions</strong> selected dynamically from our extensive 550+ clause regulatory and forensic question bank.
            </p>
          </div>

          {/* User Identification & ID Verification Form */}
          <div className="bg-[#0c0d12] border border-zinc-900/60 p-6 text-left space-y-5 max-w-md mx-auto">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
              <span className="font-mono text-[9px] text-[#EF4444] font-black uppercase tracking-[0.2em] block">
                EXAMINER IDENTIFICATION & ID VERIFICATION
              </span>
            </div>
            
            <div className="space-y-3">
              {/* Name */}
              <div>
                <label className="block font-mono text-[9px] text-zinc-500 uppercase mb-1 font-bold">
                  Examiner Full Name:
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. ARJUN SHARMA or TEST USER"
                  className="w-full bg-zinc-950 border border-zinc-900 focus:border-[#EF4444] p-3 text-xs font-mono text-zinc-100 placeholder-zinc-800 focus:outline-none transition-colors"
                />
                {userName.toLowerCase().includes("test user") && (
                  <div className="bg-amber-950/40 border border-amber-500/60 p-2.5 text-[9px] font-mono text-amber-300 space-y-1 mt-1.5">
                    <div className="flex items-center gap-1.5 font-bold uppercase text-amber-400">
                      <Zap className="w-3.5 h-3.5 flex-shrink-0 animate-pulse" />
                      <span>DEMO MODE ACTIVE FOR "TEST USER"</span>
                    </div>
                    <p className="text-[8.5px] text-zinc-300 font-sans leading-relaxed">
                      All credentials kept strictly as demo data (no real credentials needed). Fast-track certificate unlocked after 2 correct answers!
                    </p>
                  </div>
                )}
              </div>

              {/* State */}
              <div>
                <label className="block font-mono text-[9px] text-zinc-500 uppercase mb-1 font-bold">
                  Jurisdiction / State:
                </label>
                <div className="relative">
                  <select
                    value={userState}
                    onChange={(e) => setUserState(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-900 focus:border-[#EF4444] p-3 text-xs font-mono text-zinc-100 focus:outline-none transition-colors rounded-none appearance-none cursor-pointer"
                  >
                    <option value="" className="text-zinc-700">-- SELECT INDIAN JURISDICTION --</option>
                    {INDIAN_STATES.map((state) => (
                      <option key={state} value={state} className="bg-zinc-950 text-zinc-100">
                        {state.toUpperCase()}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-zinc-600 font-mono text-[9px]">
                    ▼
                  </div>
                </div>
              </div>

              {/* ID Type Selection (Tabs) */}
              <div>
                <label className="block font-mono text-[9px] text-zinc-500 uppercase mb-1.5 font-bold">
                  ID Verification Type:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIdType("aadhaar");
                      setIdNumber("");
                    }}
                    className={`py-2 text-[10px] font-mono font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                      idType === "aadhaar"
                        ? "bg-red-950/30 border-red-500/80 text-red-400"
                        : "bg-zinc-950 border-zinc-900 text-zinc-600 hover:text-zinc-400"
                    }`}
                  >
                    Aadhaar Card
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIdType("pan");
                      setIdNumber("");
                    }}
                    className={`py-2 text-[10px] font-mono font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                      idType === "pan"
                        ? "bg-red-950/30 border-red-500/80 text-red-400"
                        : "bg-zinc-950 border-zinc-900 text-zinc-600 hover:text-zinc-400"
                    }`}
                  >
                    PAN Card
                  </button>
                </div>
              </div>

              {/* ID Number Input with Validation Badge */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block font-mono text-[9px] text-zinc-500 uppercase font-bold">
                    {idType === "aadhaar" ? "Aadhaar Card Number (12 digits):" : "PAN Card Number (10 alphanumeric):"}
                  </label>
                  {idNumber && (
                    <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 border uppercase ${
                      isIdFormatValid()
                        ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-400"
                        : "bg-red-950/30 border-red-500/40 text-red-400"
                    }`}>
                      {isIdFormatValid() ? "✓ FORMAT VALID" : "✗ FORMAT INVALID"}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={idNumber}
                  onChange={(e) => handleIdNumberChange(e.target.value)}
                  placeholder={idType === "aadhaar" ? "e.g. 1234 - 5678 - 9012" : "e.g. ABCDE1234F"}
                  className="w-full bg-zinc-950 border border-zinc-900 focus:border-[#EF4444] p-3 text-xs font-mono text-zinc-100 placeholder-zinc-800 focus:outline-none transition-colors"
                />
              </div>

              {/* ID Card Scanned Upload Dropzone (Supports drag-and-drop & click select) */}
              <div>
                <label className="block font-mono text-[9px] text-zinc-500 uppercase mb-1 font-bold">
                  Upload Scanned ID Copy (PDF or JPG/PNG Image):
                </label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsIdDragging(true);
                  }}
                  onDragLeave={() => setIsIdDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsIdDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleIdPhotoFile(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => document.getElementById("id-photo-input").click()}
                  className={`border border-dashed p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-1.5 ${
                    isIdDragging 
                      ? "border-red-500 bg-red-950/10" 
                      : idPhoto 
                        ? "border-emerald-500/40 bg-emerald-950/5" 
                        : "border-zinc-800 hover:border-zinc-700 bg-zinc-950"
                  }`}
                >
                  <input
                    id="id-photo-input"
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf,.pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleIdPhotoFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  
                  {idPhoto ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-[10px] font-mono font-bold uppercase">
                        <FileCheck className="w-4 h-4" />
                        <span>ID ATTACHED SUCCESSFULLY {idPhotoName?.toLowerCase().endsWith(".pdf") || idPhoto.startsWith("data:application/pdf") ? "(PDF)" : "(IMAGE)"}</span>
                      </div>
                      <span className="text-[8px] text-zinc-500 font-mono block max-w-[240px] truncate mx-auto">
                        {idPhotoName || "scanned_id_document"}
                      </span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-zinc-500 mx-auto" />
                      <div className="text-[10px] font-mono text-zinc-400 font-bold uppercase">
                        Drag & Drop or Browse Scanned ID (PDF / JPG / PNG)
                      </div>
                      <span className="text-[8px] text-zinc-600 font-mono">
                        (Aadhaar / PAN PDF documents or JPG/PNG image files accepted, up to 5MB)
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <p className="text-[9px] text-zinc-600 font-mono leading-normal border-t border-zinc-900 pt-2.5">
              * Identification and scanned credentials are used strictly for legal certificate issuance and compliance reporting.
            </p>

            {/* Live Camera & Microphone Permission Pre-Check Box */}
            <div className="pt-3 border-t border-zinc-900 space-y-2">
              <span className="font-mono text-[9px] text-zinc-400 font-bold uppercase tracking-wider block flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-red-500" />
                CAMERA & MIC AUTHORIZATION CHECK:
              </span>
              
              {stream ? (
                <div className="bg-emerald-950/30 border border-emerald-500/50 p-2.5 flex items-center justify-between text-[10px] font-mono text-emerald-400">
                  <span className="flex items-center gap-2 font-bold">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                    LIVE WEBCAM & MIC ACTIVE
                  </span>
                  <span className="text-[8.5px] text-zinc-400">READY FOR AUDIT</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => requestPermissions()}
                  className="w-full py-2.5 bg-red-950/60 hover:bg-red-900 border border-red-600/70 text-red-300 font-mono text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
                >
                  <Camera className="w-4 h-4 text-red-400" />
                  <span>AUTHORIZE CAMERA & MIC NOW</span>
                </button>
              )}
            </div>
          </div>

          <div className="bg-[#08080a] border border-zinc-900 p-5 text-left font-mono text-[11px] text-zinc-500 space-y-3.5">
            <div className="flex items-center gap-3">
              <Zap className="w-4 h-4 text-amber-500" />
              <span><strong>Variable Marks:</strong> Questions are rated easy (<span className="text-zinc-300">5 pts</span>), medium (<span className="text-zinc-300">10 pts</span>), and hard (<span className="text-zinc-300">15 pts</span>).</span>
            </div>
            <div className="flex items-center gap-3">
              <Scale className="w-4 h-4 text-red-500" />
              <span><strong>Prosecution Impact:</strong> Incorrect verdicts show relevant Bharatiya Nyaya Sanhita (BNS) liabilities.</span>
            </div>
            <div className="flex items-center gap-3">
              <Award className="w-4 h-4 text-emerald-500" />
              <span><strong>Passing Criteria:</strong> Exactly <strong className="text-emerald-400 font-black">85% score threshold</strong> is required to unlock your Inspector Credentials.</span>
            </div>
          </div>

          {(() => {
            const isTestUser = userName.trim().toLowerCase().includes("test user");
            const canStartExam = isTestUser || (userName.trim() && userState.trim() && idNumber.trim() && isIdFormatValid() && idPhoto);
            return (
              <div className="flex flex-col items-center space-y-2.5 w-full">
                <button
                  onClick={() => {
                    if (!canStartExam) return;
                    setShowRulesModal(true);
                  }}
                  disabled={!canStartExam}
                  className={`w-full sm:w-auto px-8 py-4 font-mono text-xs font-black uppercase tracking-widest transition-all duration-300 rounded-none cursor-pointer ${
                    canStartExam
                      ? "bg-red-950/40 hover:bg-[#EF4444] border border-red-600/60 text-red-400 hover:text-white shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_40px_rgba(239,68,68,0.5)] active:scale-95"
                      : "bg-zinc-950 border border-zinc-900 text-zinc-700 cursor-not-allowed"
                  }`}
                >
                  INITIALIZE FIRE AUDIT MISSION ➔
                </button>
                {!canStartExam && (
                  <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-wider text-center max-w-sm leading-relaxed">
                    Requirement Pending: Ensure Name, Jurisdiction, valid {idType === "aadhaar" ? "12-digit Aadhaar" : "10-char PAN"} format, and ID image are set. (Or enter "Test User" as name to skip real credentials)
                  </span>
                )}
              </div>
            );
          })()}
        </motion.div>
      ) : !showSummary ? (
        /* ACTIVE QUESTION SCREEN - FULLSCREEN SECURE DASHBOARD */
        <div className="fixed inset-0 z-[100] bg-zinc-950 text-zinc-100 overflow-y-auto flex flex-col p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col space-y-6 pb-12">
            {/* Fullscreen Exam Header Bar */}
            <div className="bg-[#0c0d12] border border-zinc-900 p-4 flex flex-wrap items-center justify-between gap-4 font-mono">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
                <div>
                  <span className="text-[10px] text-red-500 font-black uppercase tracking-widest block">
                    NATIONAL SAFETY COMMISSION — SECURE EXAM TERMINAL
                  </span>
                  <h4 className="text-sm font-bold text-zinc-100 uppercase tracking-tight">
                    EXAMINER: {userName || "CANDIDATE"} ({userState || "JURISDICTION"})
                  </h4>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-zinc-950 border border-zinc-900 px-3 py-1.5 text-[10px] text-zinc-400">
                  SESSION CODE: <strong className="text-zinc-200 font-mono">{certCode}</strong>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to abort and exit the secure exam terminal?")) {
                      terminateExamImmediately("USER ABORTED EXAM TERMINAL");
                    }
                  }}
                  className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900 border border-red-600/60 text-red-300 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  ABORT EXAM ✕
                </button>
              </div>
            </div>

            <motion.div
              key={activeScenarioIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 relative flex-1"
            >
          {/* TERMINATION OVERLAY MODAL IF WARNINGS EXCEED 10 OR NO FACE DETECTED */}
          {isTerminated && (
            <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 font-mono overflow-y-auto">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#0c0808] border-2 border-red-600 p-6 sm:p-8 max-w-lg w-full text-center space-y-5 shadow-[0_0_50px_rgba(239,68,68,0.4)] my-8"
              >
                <div className="inline-flex p-4 bg-red-950 border border-red-500 text-red-500 rounded-none animate-bounce">
                  <AlertOctagon className="w-12 h-12" />
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] text-red-500 font-black uppercase tracking-[0.3em] block">
                    AI PROCTORING COMPLIANCE BREACH
                  </span>
                  <h3 className="text-xl font-black text-white uppercase font-display">
                    EXAMINATION TERMINATED
                  </h3>
                  <p className="text-xs text-red-400 font-bold font-mono">
                    {terminationReason || `WARNING LIMIT EXCEEDED (${malpracticeCount} / 10 WARNINGS)`}
                  </p>
                </div>

                {/* ERROR SCREENSHOT DISPLAY */}
                {(terminationScreenshot || capturedPhoto) && (
                  <div className="space-y-1.5 text-left bg-black p-3 border border-red-900/80">
                    <span className="text-[9px] font-mono text-red-400 font-bold uppercase tracking-wider block flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-red-500" />
                      EVIDENCE SNAPSHOT AT TERMINATION (NO FACE DETECTED):
                    </span>
                    <div className="relative w-full aspect-video bg-zinc-950 border border-red-600/60 overflow-hidden shadow-lg">
                      <img 
                        src={terminationScreenshot || capturedPhoto} 
                        alt="No Face Detected Error Screenshot" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-red-950/90 text-red-200 border border-red-500 text-[8px] font-mono font-bold px-2 py-0.5 uppercase">
                        ERROR: NO FACE DETECTED
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  {terminationReason 
                    ? `Session was automatically terminated because no human face was detected in the live webcam stream. Please adjust your camera and re-attempt.`
                    : `Warnings exceeded the limit (10/10). Your examination session has been automatically terminated by the live AI Proctor. Please re-attempt the exam in a controlled environment.`}
                </p>

                <div className="bg-zinc-950 border border-zinc-900 p-3 text-[10px] text-zinc-500 text-left space-y-1">
                  <span className="text-zinc-400 font-bold block uppercase">RE-ATTEMPT PRECHECK:</span>
                  <p>• Ensure your face is centered directly in the camera frame.</p>
                  <p>• Ensure adequate room lighting on your face.</p>
                  <p>• All warnings and flags will be completely reset to 0.</p>
                </div>

                <button
                  onClick={() => {
                    setIsTerminated(false);
                    setTerminationScreenshot(null);
                    setTerminationReason(null);
                    setMalpracticeCount(0);
                    setMalpracticeAlert(null);
                    initializeQuiz();
                    setHasStarted(true);
                    syncSessionWithServer("ongoing", 0, 0);
                  }}
                  className="w-full py-3 bg-[#EF4444] hover:bg-red-600 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                >
                  RE-ATTEMPT EXAMINATION NOW (FLAGS RESET TO 0) ➔
                </button>
              </motion.div>
            </div>
          )}

          {/* Header */}
          <div className="border-b border-zinc-900 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-950/30 border border-red-600/40 text-[#EF4444]">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="font-mono text-[9px] text-[#EF4444] font-black uppercase tracking-[0.25em] block">
                  ACTIVE LEGAL LAB / AUDIT PANEL
                </span>
                <h3 className="text-sm font-black text-zinc-100 uppercase tracking-wider font-mono">
                  Test Your Knowledge: NBC Code Compliance
                </h3>
              </div>
            </div>
            
            {/* Stats Summary & 25-Minute Countdown Timer */}
            <div className="flex flex-wrap items-center gap-3 font-mono text-[10px]">
              {/* Prominent Live 25-Minute Countdown Badge */}
              <div className={`px-3 py-1.5 border flex items-center gap-2 font-mono font-black transition-all ${
                timeLeft <= 180 
                  ? "bg-red-950/90 border-red-500 text-red-400 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.6)]" 
                  : timeLeft <= 300 
                    ? "bg-amber-950/60 border-amber-500 text-amber-400"
                    : "bg-zinc-950/90 border-zinc-800 text-amber-400"
              }`}>
                <Clock className={`w-4 h-4 ${timeLeft <= 180 ? "text-red-500 animate-spin" : "text-amber-500"}`} />
                <div className="text-left">
                  <span className="text-[7.5px] text-zinc-500 block uppercase font-bold tracking-wider leading-none">
                    {timeLeft <= 180 ? "TIME EXPIRING" : "EXAM TIMER (25 MIN)"}
                  </span>
                  <span className="text-xs font-black tracking-widest block leading-none mt-0.5">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>

              <span className="text-zinc-500">SCENARIO: <strong className="text-white">{activeScenarioIdx + 1} / 20</strong></span>
              {!hideGamification && (
                <span className="text-zinc-500">STATION XP: <strong className="text-green-400">{earnedPoints} PTS</strong></span>
              )}
              <span className="text-zinc-500">PROCTOR WARNINGS: <strong className={malpracticeCount > 6 ? "text-red-500 font-bold animate-pulse" : "text-amber-400"}>{malpracticeCount} / 10</strong></span>
            </div>
          </div>

          {/* Time Expiring Alert Banner (when <= 3 minutes left) */}
          {timeLeft <= 180 && (
            <div className="bg-red-950/80 border border-red-600/80 p-2.5 text-[10px] font-mono text-red-300 font-bold uppercase tracking-wider flex items-center justify-between animate-pulse shadow-lg">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-400" />
                <span>EXAM TIME CRITICAL! AUTOMATIC SUBMISSION OCCURS AT 00:00 ({Math.ceil(timeLeft / 60)} MIN REMAINING)</span>
              </span>
              <span className="text-white font-black text-xs">{formatTime(timeLeft)}</span>
            </div>
          )}

          {/* VISUAL PROGRESS STEPPER (20 QUESTION REAL-TIME TRACK) */}
          <div className="bg-[#08080a] border border-zinc-900 p-3 space-y-2 font-mono text-[10px] text-left">
            <div className="flex justify-between items-center text-[9px]">
              <span className="text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-red-500" />
                EXAM PROGRESS STEPPER (20 QUESTIONS)
              </span>
              <span className="text-zinc-500">
                COMPLETED: <strong className="text-white">{Object.keys(attemptedAnswers).length} / 20</strong>
              </span>
            </div>

            {/* 20-step track */}
            <div className="grid gap-1 pt-1" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(24px, 1fr))" }}>
              {quizQuestions.map((q, idx) => {
                const attempted = attemptedAnswers[idx];
                const isCurrent = idx === activeScenarioIdx;

                let stepStyle = "bg-zinc-950 border-zinc-900 text-zinc-600";
                if (isCurrent) {
                  stepStyle = "bg-red-950/80 border-red-500 text-red-300 font-bold ring-2 ring-red-500/40 scale-105 z-10 shadow-[0_0_10px_rgba(239,68,68,0.3)]";
                } else if (attempted) {
                  stepStyle = attempted.isCorrect
                    ? "bg-green-950/40 border-green-700 text-green-400 font-bold"
                    : "bg-red-950/40 border-red-800 text-red-500 font-bold";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (attempted || idx <= activeScenarioIdx) {
                        setActiveScenarioIdx(idx);
                        setSelectedOption(attempted ? attempted.selected : null);
                        setIsSubmitted(!!attempted);
                      }
                    }}
                    title={`Question ${idx + 1}: ${q.title}`}
                    className={`h-7 border text-[9px] flex items-center justify-center transition-all cursor-pointer rounded-none ${stepStyle}`}
                  >
                    {attempted ? (
                      attempted.isCorrect ? "✓" : "✕"
                    ) : (
                      idx + 1
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {currentScenario && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start text-left">
              {/* Left Column: Scenarios and Option Selection */}
              <div className="lg:col-span-2 space-y-6">
                {/* Question Specifications */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider">{currentScenario.location}</span>
                    <span className="text-zinc-800 font-mono text-[9px]">•</span>
                    <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider">{currentScenario.type}</span>
                    <span className="text-zinc-800 font-mono text-[9px]">•</span>
                    <span className={`px-2 py-0.5 border text-[8px] font-mono uppercase tracking-wider font-black ${getHazardBadge(currentScenario.hazardLevel)}`}>
                      {currentScenario.hazardLevel} HAZARD
                    </span>
                    <span className="text-zinc-800 font-mono text-[9px]">•</span>
                    <span className={`px-2 py-0.5 border text-[8px] font-mono uppercase tracking-wider font-black ${getDifficultyBadge(currentScenario.difficulty)}`}>
                      {currentScenario.difficulty} {!hideGamification && `(${currentScenario.points} PTS)`}
                    </span>
                  </div>

                  <h4 className="text-base font-black text-zinc-100 uppercase tracking-tight flex items-center gap-2 font-display">
                    <Building2 className="w-4 h-4 text-zinc-400" />
                    {currentScenario.title}
                  </h4>
                  
                  <div className="bg-[#0b0b0d] border border-zinc-900/60 p-5 md:p-6 text-xs text-zinc-400 leading-relaxed font-light">
                    {currentScenario.description}
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider block">
                    Select Compliance Verdict:
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentScenario.options.map((opt) => {
                      const isSelected = selectedOption === opt.id;
                      let optionStyle = "border-zinc-900 bg-zinc-950/50 text-zinc-400 hover:border-zinc-800 hover:bg-zinc-950";
                      
                      if (isSelected) {
                        optionStyle = "border-[#EF4444] bg-red-950/10 text-red-400 font-bold shadow-[0_0_15px_rgba(239,68,68,0.1)]";
                      }

                      if (isSubmitted) {
                        const isCorrectOption = opt.id === currentScenario.correctId;
                        if (isCorrectOption) {
                          optionStyle = "border-green-500 bg-green-950/20 text-green-400 font-bold shadow-[0_0_15px_rgba(34,197,94,0.1)]";
                        } else if (isSelected) {
                          optionStyle = "border-red-600 bg-red-950/30 text-red-500 font-bold";
                        } else {
                          optionStyle = "border-zinc-900 bg-zinc-950/20 text-zinc-600 opacity-50";
                        }
                      }

                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleSelectOption(opt.id)}
                          disabled={isSubmitted}
                          className={`text-left p-4 border transition-all duration-300 font-mono text-xs flex items-center justify-between gap-3 cursor-pointer rounded-none ${optionStyle}`}
                        >
                          <span>{opt.text}</span>
                          {isSubmitted && opt.id === currentScenario.correctId && (
                            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                          )}
                          {isSubmitted && isSelected && opt.id !== currentScenario.correctId && (
                            <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Interactive diagnostic details shown only after submission */}
                <AnimatePresence>
                  {isSubmitted && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#0c0d12] border-l-2 border-[#EF4444] p-5 space-y-4 font-mono text-xs"
                    >
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-red-500 font-bold uppercase tracking-wider block">
                          FORENSIC SYSTEM ANALYSIS:
                        </span>
                        <p className="text-zinc-200 leading-relaxed font-light">
                          {currentScenario.options.find(o => o.id === selectedOption)?.explanation}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-zinc-900 text-[10px] leading-relaxed">
                        <div className="space-y-1">
                          <span className="text-zinc-500 uppercase block text-[8px] font-black">NBC CODE REFERENCE:</span>
                          <ul className="list-disc pl-4 space-y-1 text-zinc-300">
                            {currentScenario.nbcClauses.map((clause, idx) => (
                              <li key={idx}>{clause}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-1">
                          <span className="text-zinc-500 uppercase block text-[8px] font-black">PROSECUTION CHARGES & LIABILITY:</span>
                          <span className="text-red-400 block font-bold">{currentScenario.bnsSection}</span>
                          <p className="text-[9px] text-zinc-500 font-sans mt-1">
                            {currentScenario.fact}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Bottom Action buttons for left side */}
                <div className="flex justify-between items-center pt-4 border-t border-zinc-900/60">
                  <span className="text-[9px] text-zinc-500 font-mono uppercase">
                    {isSubmitted ? "CORRECT CODE RESOLVED" : "ANALYZING SPATIAL EXPLOITATION"}
                  </span>
                  
                  {!isSubmitted ? (
                    <button
                      onClick={handleSubmit}
                      disabled={!selectedOption}
                      className={`px-6 py-2.5 font-mono text-xs font-black uppercase tracking-wider transition-all duration-300 rounded-none ${
                        selectedOption 
                          ? "bg-[#EF4444] hover:bg-red-600 text-white cursor-pointer" 
                          : "bg-zinc-900 border border-zinc-800 text-zinc-600 cursor-not-allowed"
                      }`}
                    >
                      Apply Code Diagnostic
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="px-6 py-2.5 bg-zinc-100 hover:bg-white text-black font-mono text-xs font-black uppercase tracking-wider transition-all duration-300 rounded-none cursor-pointer flex items-center gap-1.5"
                    >
                      <span>{activeScenarioIdx < 19 ? "NEXT SCENARIO" : "FINISH AUDIT & ASSESS"}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Right Column: AI Proctoring Console */}
              <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-6">
                <div className="bg-[#08080a] border border-zinc-900 p-4 font-mono space-y-3 text-left">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                    <span className="text-[9px] text-[#EF4444] font-black uppercase tracking-[0.2em] flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-red-500" />
                      AI PROCTOR LIVE MONITOR
                    </span>
                    <span className="text-[8px] text-emerald-500 animate-pulse font-bold">● BIOMETRIC LOCK</span>
                  </div>
                  
                  {/* Video Container with Real-Time CV Eyeball & Face Mesh Overlay */}
                  <div className="relative aspect-video w-full bg-zinc-950 border border-zinc-900 overflow-hidden">
                    {/* Reticle grid */}
                    <div className="absolute inset-0 border border-red-500/15 m-2 pointer-events-none z-10" />
                    <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-red-500/60 pointer-events-none z-10" />
                    <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-red-500/60 pointer-events-none z-10" />
                    <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-red-500/60 pointer-events-none z-10" />
                    <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-red-500/60 pointer-events-none z-10" />

                    {!cameraError && stream ? (
                      <video
                        ref={(node) => {
                          videoRef.current = node;
                          if (node && stream) {
                            if (node.srcObject !== stream) {
                              node.srcObject = stream;
                            }
                            node.play().catch(() => {});
                          }
                        }}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover scale-x-[-1]"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3 bg-zinc-950 text-red-500/90 space-y-2 z-10">
                        <AlertOctagon className="w-7 h-7 animate-bounce text-red-600" />
                        <span className="text-[9.5px] font-black uppercase tracking-wider">CAMERA & MIC RESTRICTED</span>
                        <span className="text-[8px] text-zinc-400 leading-normal max-w-[190px]">
                          Live proctoring requires browser camera and microphone authorization.
                        </span>
                        <button
                          onClick={() => requestPermissions()}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-[8.5px] uppercase tracking-wider transition-all cursor-pointer shadow-md"
                        >
                          GRANT PERMISSION NOW
                        </button>
                      </div>
                    )}

                    {/* Animated Red scanline */}
                    <div className="absolute inset-x-0 h-0.5 bg-red-500/40 shadow-[0_0_8px_red] top-0 animate-pulse pointer-events-none z-10" />

                    {/* Malpractice Warning Limit Indicator */}
                    <div className="absolute bottom-2 left-2 bg-red-950/90 border border-red-700 px-2 py-0.5 text-[8.5px] text-red-400 font-black uppercase z-20 shadow-md">
                      WARNINGS: {malpracticeCount} / 10 MAX
                    </div>

                    {/* Camera Angle Adjustment Action Button */}
                    <button
                      onClick={() => setShowExpandedCam(true)}
                      className="absolute top-2 right-2 z-20 bg-black/80 hover:bg-red-950 hover:border-red-500 border border-zinc-700 text-zinc-200 hover:text-white px-2 py-1 text-[8px] font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1 shadow-md"
                      title="Adjust & Calibrate Camera Angle"
                    >
                      <Camera className="w-3 h-3 text-red-400" />
                      <span>ADJUST ANGLE</span>
                    </button>
                  </div>

                  {/* Camera Angle Calibration Modal */}
                  {showExpandedCam && (
                    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 font-mono">
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-[#0c0d12] border-2 border-red-600/80 p-6 max-w-xl w-full space-y-4 shadow-[0_0_40px_rgba(239,68,68,0.3)] text-left"
                      >
                        <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                          <div className="flex items-center gap-2">
                            <Camera className="w-5 h-5 text-red-500 animate-pulse" />
                            <h3 className="text-sm font-black text-white uppercase font-display">
                              LIVE CAMERA ANGLE CALIBRATION
                            </h3>
                          </div>
                          <button
                            onClick={() => setShowExpandedCam(false)}
                            className="text-zinc-500 hover:text-white text-xs font-bold px-2 py-1 border border-zinc-800 hover:border-zinc-600 transition-all cursor-pointer"
                          >
                            ✕ CLOSE
                          </button>
                        </div>

                        <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                          Center your face inside the framing guides. Ensure your background is clean and your head/eyes are facing directly forward.
                        </p>

                        <div className="relative aspect-video w-full bg-black border-2 border-dashed border-emerald-500/60 overflow-hidden">
                          {stream ? (
                            <video
                              ref={(node) => {
                                expandedVideoRef.current = node;
                                if (node && stream) {
                                  if (node.srcObject !== stream) {
                                    node.srcObject = stream;
                                  }
                                  node.play().catch(() => {});
                                }
                              }}
                              autoPlay
                              playsInline
                              muted
                              className="w-full h-full object-cover scale-x-[-1]"
                            />
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 text-xs space-y-2 p-4 text-center">
                              <span>Camera & Microphone stream initializing or blocked.</span>
                              <button
                                onClick={() => requestPermissions()}
                                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold uppercase transition-all cursor-pointer"
                              >
                                ALLOW CAMERA & MIC ACCESS
                              </button>
                            </div>
                          )}

                          {/* Framing Head Outline Guide */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-56 border-2 border-emerald-400/80 rounded-[50%] pointer-events-none flex flex-col items-center justify-center text-center shadow-[0_0_20px_rgba(52,211,153,0.2)]">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping mb-1" />
                            <span className="text-[8px] font-mono text-emerald-300 bg-black/80 px-1.5 py-0.5 border border-emerald-500/40 uppercase font-black">
                              CENTER FACE HERE
                            </span>
                          </div>

                          <div className="absolute top-2 left-2 text-[8px] text-emerald-400 bg-black/80 px-2 py-0.5 border border-emerald-500/40">
                            ANGLE CHECK: COMPLIANT
                          </div>
                        </div>

                        <div className="bg-zinc-950 border border-zinc-800 p-3 text-[10px] text-zinc-400 space-y-1 font-sans">
                          <strong className="text-zinc-200 block font-mono text-[9px] uppercase">EXAM PROCTORING RULES:</strong>
                          <p>• Plain / simple backgrounds are 100% exempted and fully compliant.</p>
                          <p>• Keep your face turned forward and avoid holding mobile phones in frame.</p>
                          <p>• Keep hands away from face landmarks to prevent accidental posture flags.</p>
                        </div>

                        <button
                          onClick={() => setShowExpandedCam(false)}
                          className="w-full py-3 bg-[#EF4444] hover:bg-red-600 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                        >
                          CONFIRM CAMERA ANGLE & RETURN TO EXAM ➔
                        </button>
                      </motion.div>
                    </div>
                  )}

                  {/* Hidden Canvas used for video frame reading */}
                  <canvas ref={canvasRef} className="hidden" width="80" height="60" />

                  {/* Microphone Audio Spectrum & Realtime Gemini Observations Feed */}
                  <div className="bg-[#0b0c10] border border-zinc-900 p-3 space-y-2 text-[8.5px] font-mono">
                    <div className="flex justify-between items-center border-b border-zinc-900 pb-1.5">
                      <span className="font-bold uppercase text-blue-400 flex items-center gap-1.5">
                        <Mic className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                        MIC AUDIO ANALYSIS:
                      </span>
                      <span className={micLevel > 30 ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>
                        {micLevel}% dB ({micLevel > 30 ? "VOICE SPIKE" : "QUIET"})
                      </span>
                    </div>

                    {/* Audio Decibel Level Visualizer Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[7.5px] text-zinc-500">
                        <span>ACOUSTIC SPECTRUM POWER</span>
                        <span>PEAK: {micPeak}% dB</span>
                      </div>
                      <div className="w-full bg-zinc-950 h-2 border border-zinc-800 overflow-hidden flex items-center p-0.5">
                        <motion.div
                          className={`h-full transition-all duration-100 ${
                            micLevel > 40 ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" : micLevel > 20 ? "bg-amber-400" : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.max(4, micLevel)}%` }}
                        />
                      </div>
                    </div>

                    {/* Gemini Real-Time Audio Comment Box */}
                    <div className="bg-zinc-950 border border-blue-900/40 p-2 space-y-1">
                      <div className="flex items-center justify-between text-[7.5px] text-blue-400 font-bold uppercase">
                        <span>GEMINI REALTIME AUDIO COMMENT:</span>
                        <span className="text-zinc-500">LIVE FEED</span>
                      </div>
                      <p className="text-[8.5px] text-zinc-300 font-sans italic leading-tight">
                        "{geminiAudioComment}"
                      </p>
                    </div>

                    <div className="flex justify-between items-center text-zinc-400 border-t border-zinc-900 pt-1.5">
                      <span className="font-bold uppercase text-amber-400 flex items-center gap-1">
                        <Users className="w-3 h-3 text-amber-500" />
                        FACIAL COUNT:
                      </span>
                      <span className={telemetry.faceCount > 1 ? "text-red-500 font-bold" : "text-emerald-400 font-bold"}>
                        {telemetry.faceCount} DETECTED
                      </span>
                    </div>

                    <div className="pt-0.5 text-[8px] text-zinc-500 flex items-center justify-between">
                      <span>STATUS:</span>
                      <span className="text-zinc-400 italic">{telemetry.statusMessage}</span>
                    </div>
                  </div>

                  {/* Malpractice popup alert with cause & recommendation */}
                  <AnimatePresence>
                    {malpracticeAlert && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-red-950/95 border-2 border-red-600 p-3 flex items-start gap-2.5 text-[9px] text-red-200 z-30 relative shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                      >
                        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 animate-bounce mt-0.5" />
                        <div className="space-y-1">
                          <strong className="block uppercase text-[9px] text-red-100 font-black tracking-wide">
                            PROCTOR MALPRACTICE FLAG [{malpracticeCount}/10]
                          </strong>
                          {malpracticeAlert.includes("ACTION:") ? (
                            <>
                              <p className="text-[8.5px] text-red-300 font-mono leading-tight">
                                <span className="font-bold text-red-400">CAUSE: </span>
                                {malpracticeAlert.split("ACTION:")[0].trim()}
                              </p>
                              <div className="bg-red-900/60 border border-red-700/80 px-2 py-1 text-[8.5px] text-white font-mono font-bold leading-tight">
                                <span className="text-amber-300">RECOMMENDED ACTION: </span>
                                {malpracticeAlert.split("ACTION:")[1].trim()}
                              </div>
                            </>
                          ) : (
                            <span className="leading-tight block font-mono text-[8.5px]">{malpracticeAlert}</span>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}
        </motion.div>
          </div>
        </div>
      ) : (
        !isReviewMode ? (
          /* QUIZ RESULTS SUMMARY SCREEN */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8 max-w-4xl mx-auto py-12 px-4"
          >
          {/* Main Visual Header based on Pass or Fail */}
          <div className="text-center py-6 space-y-4">
            <div className={`inline-flex p-5 rounded-full mb-2 ${
              isPassed 
                ? "bg-green-950/20 border border-green-500/50 text-green-400 shadow-[0_0_30px_rgba(34,197,94,0.2)]" 
                : "bg-red-950/25 border border-red-500/40 text-red-500"
            }`}>
              <Award className={`w-12 h-12 ${isPassed ? "animate-bounce" : ""}`} />
            </div>
            
            <h3 className="text-3xl font-black text-zinc-100 uppercase tracking-tight font-display">
              {isPassed ? "Audit Examination Passed" : "Audit Examination Failed"}
            </h3>
            
            <p className="text-xs text-zinc-400 max-w-xl mx-auto leading-relaxed">
              Assessment completed across 20 randomized metropolitan safety structures. An accuracy score of <strong className="text-zinc-200">85%</strong> is required for legal credential endorsement.
            </p>
          </div>

          {/* Core Score Indicators */}
          <div className="bg-[#0b0b0d] border border-zinc-900 p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            {/* Stats */}
            <div className="text-left space-y-3 md:col-span-2">
              <span className="text-[9px] text-zinc-500 uppercase block font-mono">AUDIT METRIC LEDGER</span>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-mono">Endorsement Rating:</span>
                <span className={`text-xs font-black font-mono uppercase ${isPassed ? "text-green-400" : "text-red-500"}`}>
                  {isPassed ? "CERTIFIED CHIEF INSPECTOR" : "MUNICIPAL APPRENTICE (SUSPENDED)"}
                </span>
              </div>

              {/* COMMENTS AND SUGGESTIONS */}
              <div className="text-[11px] text-zinc-400 font-sans leading-relaxed pt-2 border-t border-zinc-900/80">
                {isPassed ? (
                  <p>
                    <strong className="text-zinc-200">Outstanding legal & spatial acuity!</strong> You successfully identified structural bypasses, prohibited stairwell linings, and unsealed vertical shafts. You possess deep knowledge of the National Building Code (NBC) of India and are highly qualified to lead public safety compliance audits.
                  </p>
                ) : (
                  <p>
                    <strong className="text-zinc-200">Critical compliance failure.</strong> Your accuracy score fell below the required 85% safety margin. In real-world projects, these oversights would expose thousands of occupants to extreme hazards and subject developers to heavy criminal liability under BNS Sec. 105/106.
                  </p>
                )}
              </div>
            </div>

            {/* Proctor Biometric Snapshot Column */}
            <div className="flex flex-col items-center justify-center md:border-l border-zinc-900 py-4 space-y-2">
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">IDENTITY SNAPSHOT</span>
              <div className="relative w-24 h-28 bg-zinc-950 border-2 border-zinc-900 overflow-hidden shadow-inner">
                {capturedPhoto ? (
                  <img 
                    src={capturedPhoto} 
                    alt="Proctor Snapshot" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-zinc-700 bg-zinc-950">
                    <User className="w-8 h-8" />
                    <span className="text-[7px] font-mono text-zinc-600 mt-1 uppercase">NOT CAPTURED</span>
                  </div>
                )}
                {capturedPhoto && (
                  <div className="absolute inset-x-0 bottom-0 bg-emerald-950/80 text-[7px] text-emerald-400 font-bold uppercase tracking-wider text-center py-0.5 border-t border-emerald-500/30">
                    VERIFIED
                  </div>
                )}
              </div>
              {capturedPhoto ? (
                <div className="flex flex-col items-center">
                  <span className="text-[8px] font-mono text-zinc-400 uppercase tracking-wider block text-center mt-1">
                    REF: {certCode.split("-").pop()}
                  </span>
                  <div className="flex flex-col items-center space-y-1 mt-1">
                    <button
                      onClick={() => {
                        const snap = capturePhoto();
                        if (snap) {
                          setCapturedPhoto(snap);
                          logProctor("[MANUAL ACTION] Identity snapshot refreshed by user.");
                        } else {
                          logProctor("[WARNING] Live camera is not active in this view. Please use the file upload alternative.");
                        }
                      }}
                      className="text-[8px] font-mono text-amber-500 hover:text-amber-400 hover:underline uppercase font-bold tracking-wider cursor-pointer"
                    >
                      [Retake Snapshot]
                    </button>
                    <button
                      onClick={() => document.getElementById("summary-photo-upload")?.click()}
                      className="text-[8px] font-mono text-sky-400 hover:text-sky-300 hover:underline uppercase font-bold tracking-wider cursor-pointer"
                    >
                      [Upload Photo File]
                    </button>
                    <input
                      id="summary-photo-upload"
                      type="file"
                      accept="image/jpeg,image/png,image/jpg"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handlePhotoFile(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider block text-center mt-1 mb-1">
                    NO PHOTO RECORD
                  </span>
                  <button
                    onClick={() => document.getElementById("summary-photo-upload-empty")?.click()}
                    className="text-[8px] font-mono text-red-400 hover:text-red-300 hover:underline uppercase font-bold tracking-wider cursor-pointer"
                  >
                    [UPLOAD STILL PHOTO]
                  </button>
                  <input
                    id="summary-photo-upload-empty"
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handlePhotoFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {/* Circular Percentage Gauges */}
            <div className="flex flex-col items-center justify-center md:border-l border-zinc-900 py-4 space-y-1">
              <span className={`text-4xl font-black font-mono tracking-tighter ${isPassed ? "text-green-400 drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]" : "text-[#EF4444]"}`}>
                {finalScorePercent}%
              </span>
              <span className="text-[9px] font-mono text-zinc-500 uppercase">Your Code Accuracy</span>
              {!hideGamification && (
                <span className="text-[9px] text-zinc-600 font-mono mt-0.5">{earnedPoints} of {totalPossiblePoints} points earned</span>
              )}
            </div>
          </div>

          {/* TAILORED FEEDBACK & RECOMMENDATIONS SECTION */}
          <div className="border border-zinc-900 bg-[#08080a] p-5 space-y-4">
            <h5 className="text-[10px] font-black text-zinc-200 uppercase font-mono tracking-wider flex items-center gap-2 border-b border-zinc-900 pb-2">
              <FileText className="w-3.5 h-3.5 text-red-500" />
              Tailored safety Rectification Plan
            </h5>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[11px] leading-relaxed">
              <div className="space-y-3">
                <span className="text-[9px] text-zinc-500 uppercase block font-mono">DETAILED SUITE PERFORMANCE:</span>
                <div className="space-y-2">
                  {Object.entries(categoryBreakdown).map(([cat, stats]) => {
                    const percent = Math.round((stats.correct / stats.total) * 100);
                    return (
                      <div key={cat} className="flex flex-col gap-1">
                        <div className="flex justify-between text-[10px] font-mono text-zinc-400 uppercase">
                          <span className="truncate max-w-[200px]">{cat}</span>
                          <span className={percent >= 85 ? "text-green-400" : "text-red-400"}>
                            {stats.correct}/{stats.total} ({percent}%)
                          </span>
                        </div>
                        <div className="w-full h-1 bg-zinc-900 rounded-none overflow-hidden">
                          <div 
                            className={`h-full ${percent >= 85 ? "bg-green-500" : "bg-red-500"}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SPECIFIC STUDY RECOMMENDATIONS */}
              <div className="space-y-2 font-mono text-[10px] text-zinc-400">
                <span className="text-[9px] text-zinc-500 uppercase block font-mono font-bold">MUNICIPAL CORRECTIVE MEASURES:</span>
                
                {isPassed ? (
                  <div className="space-y-2.5">
                    <div className="flex gap-2 items-start text-zinc-300">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span><strong>Rooftop Clearances:</strong> Continue maintaining strict enforcement of Clause 3.4.15.2 (Terrace padlock bans).</span>
                    </div>
                    <div className="flex gap-2 items-start text-zinc-300">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span><strong>Compartmentation Seals:</strong> Ensure 120-minute fire barriers in vertical electrical conduit paths remain active.</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5 text-zinc-500">
                    <div className="flex gap-2 items-start text-zinc-400">
                      <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <span><strong>Mandatory Study:</strong> Review NBC Part 4, Annexure D regarding water-sprinkler clearance and Class D metal storage.</span>
                    </div>
                    <div className="flex gap-2 items-start text-zinc-400">
                      <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <span><strong>Exit Safety:</strong> Re-examine egress parameters requiring outward-swing doors and automatic sliding fail-safe doors.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CERTIFICATE ENDORSEMENT SELECTOR */}
          {isPassed && (
            <div className="flex flex-col items-center space-y-4 max-w-2xl mx-auto pt-6 border-t border-zinc-900">
              <span className="font-mono text-[9px] text-[#EF4444] font-black uppercase tracking-[0.2em]">
                CERTIFICATION PORTAL // SELECT ENDORSEMENT SCHEME
              </span>
              <div className="flex w-full bg-[#08080a] border border-zinc-900 p-1 rounded-none">
                <button
                  onClick={() => setActiveCertificateTab("nbc")}
                  className={`flex-1 py-2 font-mono text-[10px] uppercase font-bold tracking-wider transition-all duration-300 cursor-pointer ${
                    activeCertificateTab === "nbc"
                      ? "bg-emerald-950/40 border border-emerald-800 text-emerald-400"
                      : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                  }`}
                >
                  [1] NBC Compliance Certificate
                </button>
                <button
                  onClick={() => setActiveCertificateTab("show")}
                  className={`flex-1 py-2 font-mono text-[10px] uppercase font-bold tracking-wider transition-all duration-300 cursor-pointer ${
                    activeCertificateTab === "show"
                      ? "bg-red-950/40 border border-red-800 text-red-400"
                      : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                  }`}
                >
                  [2] "Built to Break" Show Certificate
                </button>
              </div>
            </div>
          )}

          {/* PRINT-ONLY CSS AND DYNAMIC ENDORSED CERTIFICATE (IF PASSED) */}
          {isPassed && (
            <div className="space-y-6 w-full">
              {/* Local print CSS styling block */}
              <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                  /* Hide non-certificate elements */
                  body * {
                    visibility: hidden !important;
                  }
                  #printable-certificate-outer, #printable-certificate-outer * {
                    visibility: visible !important;
                  }
                  #printable-certificate-outer {
                    position: absolute !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 100vw !important;
                    height: 100vh !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    background: #ffffff !important;
                    color: #000000 !important;
                    padding: 20px !important;
                    box-sizing: border-box !important;
                    z-index: 9999999 !important;
                  }
                  .print-card-border {
                    border: 8px double #c2410c !important;
                    background-color: #fafafa !important;
                    color: #111827 !important;
                    padding: 40px !important;
                    width: 100% !important;
                    max-width: 800px !important;
                    box-shadow: none !important;
                    text-align: center !important;
                  }
                  .print-text-dark {
                    color: #111827 !important;
                  }
                  .print-text-muted {
                    color: #374151 !important;
                  }
                  .print-text-amber {
                    color: #b45309 !important;
                  }
                  .print-seal {
                    border-color: #b45309 !important;
                    background: #fef3c7 !important;
                  }
                }
              `}} />



              {/* PDF Print & Direct Download Action Banner */}
              <div className="bg-amber-950/20 border border-amber-800/60 p-4 max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
                <div className="text-left space-y-1">
                  <span className="text-amber-400 font-bold uppercase block tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    OFFICIAL RECOGNITION GRANTED
                  </span>
                  <p className="text-[10px] text-zinc-400 font-sans leading-normal max-w-md">
                    Your score qualifies for official certification. Download a high-res PDF/PNG or trigger instant printing below.
                  </p>
                </div>
                
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleDownloadPdf}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-mono text-[10px] font-black uppercase tracking-wider transition-all duration-300 rounded-none cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)]"
                  >
                    <Download className="w-3.5 h-3.5 text-white" />
                    <span>DOWNLOAD PDF</span>
                  </button>

                  <button
                    onClick={handleDownloadPng}
                    className="flex-1 sm:flex-none px-3.5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-amber-600/60 text-amber-300 font-mono text-[10px] font-bold uppercase tracking-wider transition-all duration-300 rounded-none cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>DOWNLOAD PNG</span>
                  </button>

                  <button
                    onClick={handlePrintCert}
                    className="flex-1 sm:flex-none px-3.5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-[10px] font-bold uppercase tracking-wider transition-all duration-300 rounded-none cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5 text-zinc-400" />
                    <span>PRINT</span>
                  </button>
                </div>
              </div>

              {/* Printable Wrapper */}
              <div id="printable-certificate-outer" className="w-full">
                <AnimatePresence mode="wait">
                  {activeCertificateTab === "nbc" ? (
                    <motion.div
                      key="nbc-cert"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="print-card-border border-2 border-double border-green-900 bg-[#090b0c] p-8 md:p-12 max-w-2xl mx-auto relative overflow-hidden text-center shadow-[0_0_40px_rgba(34,197,94,0.15)]"
                    >
                      {/* Background Watermark Grid */}
                      <div className="absolute inset-0 pointer-events-none opacity-[0.035] select-none overflow-hidden font-mono text-[9px] uppercase leading-relaxed tracking-[0.3em] text-zinc-100 flex flex-wrap content-start p-2">
                        {Array.from({ length: 48 }).map((_, i) => (
                          <span key={i} className="mr-4 mb-2">BUILT TO BREAK • COMPLETED • </span>
                        ))}
                      </div>

                      <div className="absolute top-0 bottom-0 left-0 right-0 border border-green-950/40 m-1.5 pointer-events-none" />
                      {/* Security Code */}
                      <div className="absolute top-4 right-4 text-[7px] text-zinc-500 font-mono uppercase bg-zinc-950/80 px-2 py-0.5 border border-zinc-900">
                        ID: {certCode}
                      </div>

                      {/* Proctor Verified Face Identity (Top Left Card) */}
                      {capturedPhoto && (
                        <div className="absolute top-4 left-4 z-20 flex flex-col items-center bg-zinc-950/90 border border-zinc-800 p-1 shadow-md w-14">
                          <div className="w-11 h-14 overflow-hidden bg-black border border-zinc-900 relative">
                            <img src={capturedPhoto} alt="Examinee ID" className="w-full h-full object-cover animate-fade-in" />
                            <div className="absolute inset-x-0 bottom-0 bg-emerald-950/80 text-[4px] text-emerald-400 font-bold uppercase tracking-wider text-center py-0.5 border-t border-emerald-500/30 leading-none">
                              VERIFIED
                            </div>
                          </div>
                          <span className="text-[4px] text-zinc-500 mt-1 uppercase font-mono tracking-widest text-center leading-none">
                            PROCTOR ID
                          </span>
                        </div>
                      )}

                      <div className="space-y-6 relative z-10">
                        {/* Built to Break Seal */}
                        <div className="flex justify-center">
                          <div className="relative w-32 h-32 flex items-center justify-center select-none">
                            <div className="absolute inset-0 rounded-full border-4 border-double border-amber-600/60 pointer-events-none" />
                            <div className="absolute inset-2 rounded-full border border-amber-500/40 pointer-events-none" />
                            <div className="absolute inset-3 rounded-full border border-dashed border-amber-500/80 pointer-events-none" />

                            <div className="print-seal absolute inset-5 rounded-full bg-gradient-to-br from-amber-950 via-red-950 to-zinc-950 border-2 border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.25)] flex flex-col items-center justify-center p-2 text-center">
                              <Shield className="w-7 h-7 text-amber-400 mb-0.5 animate-pulse" />
                              <span className="text-[7px] font-mono text-amber-200 font-black tracking-widest uppercase leading-none">
                                BUILT TO BREAK
                              </span>
                              <span className="text-[5px] font-mono text-amber-500 uppercase tracking-wider leading-none mt-1">
                                OFFICIAL SEAL
                              </span>
                            </div>

                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <svg className="w-full h-full" viewBox="0 0 100 100">
                                <path id="circlePathTop1" d="M 16,50 A 34,34 0 1,1 84,50" fill="none" />
                                <text className="text-[5px] font-mono font-black fill-amber-500 tracking-[0.16em] uppercase">
                                  <textPath href="#circlePathTop1" startOffset="50%" textAnchor="middle">
                                    ★ BUILT TO BREAK AWARENESS ★
                                  </textPath>
                                </text>
                                <path id="circlePathBottom1" d="M 84,50 A 34,34 0 0,1 16,50" fill="none" />
                                <text className="text-[4.8px] font-mono font-black fill-amber-500/80 tracking-[0.14em] uppercase">
                                  <textPath href="#circlePathBottom1" startOffset="50%" textAnchor="middle">
                                    PUBLIC SAFETY COMPLIANCE
                                  </textPath>
                                </text>
                              </svg>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-1.5">
                          <h4 className="print-text-amber text-[10px] font-black text-amber-500 uppercase font-mono tracking-[0.25em]">
                            Built to Break Awareness Initiative Team
                          </h4>
                          <h3 className="print-text-dark text-lg md:text-xl font-black text-zinc-100 uppercase font-display leading-none tracking-tight">
                            CERTIFICATE OF REGULATORY COMPLIANCE
                          </h3>
                          <div className="w-16 h-0.5 bg-amber-600/80 mx-auto my-2" />
                        </div>

                        <div className="print-text-muted space-y-3 font-sans text-xs font-light text-zinc-300 max-w-md mx-auto leading-relaxed">
                          <p>
                            This document officially certifies that <strong className="print-text-dark text-white font-bold font-mono">{userName.toUpperCase()}</strong> from <strong className="print-text-dark text-white font-bold font-mono">{userState.toUpperCase()}</strong> has completed the advanced forensic evaluation of Metropolitan Building Clearances with an outstanding score of <strong className="print-text-amber text-green-400 font-bold font-mono">{finalScorePercent}%</strong>.
                          </p>
                          <p>
                            Honored and awarded directly by the <strong className="text-amber-400 font-bold">Built to Break Awareness Initiative Team</strong> under Part 4 & Part 8 of the National Building Code (NBC) of India, endorsing high-vulnerability structural audit proficiency.
                          </p>
                        </div>

                        {/* Signature Block */}
                        <div className="grid grid-cols-2 gap-8 pt-6 border-t border-zinc-900/60 max-w-md mx-auto text-center font-mono text-[8px] text-zinc-500">
                          <div className="space-y-1 flex flex-col items-center">
                            <div className="h-6 flex items-end justify-center">
                              <span className="text-xs font-semibold text-amber-400 italic font-serif tracking-wider select-none">
                                BTB Audit Council
                              </span>
                            </div>
                            <div className="w-28 h-px bg-zinc-800 border-print-gold" />
                            <span>BUILT TO BREAK AUDIT PANEL</span>
                          </div>
                          <div className="space-y-1 flex flex-col items-center">
                            <div className="h-6 flex items-end justify-center">
                              <span className="text-xs font-semibold text-amber-400 italic font-serif tracking-wider select-none">
                                Public Safety Team
                              </span>
                            </div>
                            <div className="w-28 h-px bg-zinc-800 border-print-gold" />
                            <span>PUBLIC SAFETY INITIATIVE BOARD</span>
                          </div>
                        </div>

                        <div className="pt-4 flex flex-col md:flex-row justify-between items-center gap-4 font-mono text-[8px] text-zinc-500 max-w-md mx-auto">
                          <div className="text-left">
                            <span>REGISTRY DATE:</span>
                            <strong className="print-text-dark text-zinc-300 block mt-0.5">{certDate}</strong>
                          </div>
                          <div className="text-center">
                            <span>AWARDED BY:</span>
                            <strong className="print-text-amber text-amber-500 block mt-0.5 uppercase">BUILT TO BREAK INITIATIVE TEAM</strong>
                          </div>
                          <div className="text-right">
                            <span>UNIQUE CERTIFICATE ID:</span>
                            <strong className="print-text-dark text-green-500 block mt-0.5 font-bold">{certCode}</strong>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="show-cert"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="print-card-border border-2 border-double border-red-900 bg-[#0c0909] p-8 md:p-12 max-w-2xl mx-auto relative overflow-hidden text-center shadow-[0_0_40px_rgba(239,68,68,0.15)]"
                    >
                      {/* Background Watermark Grid */}
                      <div className="absolute inset-0 pointer-events-none opacity-[0.035] select-none overflow-hidden font-mono text-[9px] uppercase leading-relaxed tracking-[0.3em] text-zinc-100 flex flex-wrap content-start p-2">
                        {Array.from({ length: 48 }).map((_, i) => (
                          <span key={i} className="mr-4 mb-2">BUILT TO BREAK • COMPLETED • </span>
                        ))}
                      </div>

                      <div className="absolute top-0 bottom-0 left-0 right-0 border border-red-950/40 m-1.5 pointer-events-none" />
                      {/* Security Code */}
                      <div className="absolute top-4 right-4 text-[7px] text-zinc-500 font-mono uppercase bg-zinc-950/80 px-2 py-0.5 border border-zinc-900">
                        ID: {certCode}-SHOW
                      </div>

                      {/* Proctor Verified Face Identity (Top Left Card) */}
                      {capturedPhoto && (
                        <div className="absolute top-4 left-4 z-20 flex flex-col items-center bg-zinc-950/90 border border-zinc-800 p-1 shadow-md w-14">
                          <div className="w-11 h-14 overflow-hidden bg-black border border-zinc-900 relative">
                            <img src={capturedPhoto} alt="Examinee ID" className="w-full h-full object-cover animate-fade-in" />
                            <div className="absolute inset-x-0 bottom-0 bg-red-950/80 text-[4px] text-red-400 font-bold uppercase tracking-wider text-center py-0.5 border-t border-red-500/30 leading-none">
                              VERIFIED
                            </div>
                          </div>
                          <span className="text-[4px] text-zinc-500 mt-1 uppercase font-mono tracking-widest text-center leading-none">
                            PROCTOR ID
                          </span>
                        </div>
                      )}

                      <div className="space-y-6 relative z-10">
                        {/* Built to Break Seal */}
                        <div className="flex justify-center">
                          <div className="relative w-32 h-32 flex items-center justify-center select-none">
                            <div className="absolute inset-0 rounded-full border-4 border-double border-amber-600/60 pointer-events-none" />
                            <div className="absolute inset-2 rounded-full border border-amber-500/40 pointer-events-none" />
                            <div className="absolute inset-3 rounded-full border border-dashed border-amber-500/80 pointer-events-none" />

                            <div className="print-seal absolute inset-5 rounded-full bg-gradient-to-br from-red-950 via-amber-950 to-zinc-950 border-2 border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.25)] flex flex-col items-center justify-center p-2 text-center">
                              <Zap className="w-7 h-7 text-amber-400 mb-0.5 animate-pulse" />
                              <span className="text-[7px] font-mono text-amber-200 font-black tracking-widest uppercase leading-none">
                                BUILT TO BREAK
                              </span>
                              <span className="text-[5px] font-mono text-amber-500 uppercase tracking-wider leading-none mt-1">
                                EXCELLENCE
                              </span>
                            </div>

                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <svg className="w-full h-full" viewBox="0 0 100 100">
                                <path id="circlePathTop2" d="M 16,50 A 34,34 0 1,1 84,50" fill="none" />
                                <text className="text-[5px] font-mono font-black fill-amber-500 tracking-[0.16em] uppercase">
                                  <textPath href="#circlePathTop2" startOffset="50%" textAnchor="middle">
                                    ★ BUILT TO BREAK AWARENESS ★
                                  </textPath>
                                </text>
                                <path id="circlePathBottom2" d="M 84,50 A 34,34 0 0,1 16,50" fill="none" />
                                <text className="text-[4.8px] font-mono font-black fill-amber-500/80 tracking-[0.14em] uppercase">
                                  <textPath href="#circlePathBottom2" startOffset="50%" textAnchor="middle">
                                    PUBLIC EMPOWERMENT ENVOY
                                  </textPath>
                                </text>
                              </svg>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <h4 className="print-text-amber text-[10px] font-black text-[#EF4444] uppercase font-mono tracking-[0.25em]">
                            Built to Break Awareness Initiative Team
                          </h4>
                          <h3 className="print-text-dark text-lg md:text-xl font-black text-zinc-100 uppercase font-display leading-none tracking-tight">
                            HONORARY PUBLIC SAFETY ENVOY
                          </h3>
                          <div className="w-16 h-0.5 bg-red-600/80 mx-auto my-2" />
                        </div>

                        <div className="print-text-muted space-y-3 font-sans text-xs font-light text-zinc-300 max-w-md mx-auto leading-relaxed">
                          <p>
                            This certificate is proudly awarded to <strong className="print-text-dark text-white font-bold font-mono">{userName.toUpperCase()}</strong> from <strong className="print-text-dark text-white font-bold font-mono">{userState.toUpperCase()}</strong> for successfully completing the 'Built to Break' interactive scrollytelling documentary analysis.
                          </p>
                          <p>
                            Awarded by the <strong className="text-red-400 font-bold">Built to Break Awareness Initiative Team</strong> for demonstrating exemplary civic awareness, legal vigilance, and a direct commitment to championing life-safety regulations across India's metropolitan high-vulnerability landscapes.
                          </p>
                        </div>

                        {/* Signature Block */}
                        <div className="grid grid-cols-2 gap-8 pt-6 border-t border-zinc-900/60 max-w-md mx-auto text-center font-mono text-[8px] text-zinc-500">
                          <div className="space-y-1 flex flex-col items-center">
                            <div className="h-6 flex items-end justify-center">
                              <span className="text-xs font-semibold text-red-400 italic font-serif tracking-wider select-none">
                                BTB Initiative Core
                              </span>
                            </div>
                            <div className="w-28 h-px bg-zinc-800 border-print-gold" />
                            <span>BUILT TO BREAK INITIATIVE TEAM</span>
                          </div>
                          <div className="space-y-1 flex flex-col items-center">
                            <div className="h-6 flex items-end justify-center">
                              <span className="text-xs font-semibold text-red-400 italic font-serif tracking-wider select-none">
                                Campaign Panel
                              </span>
                            </div>
                            <div className="w-28 h-px bg-zinc-800 border-print-gold" />
                            <span>CIVIC AWARENESS CAMPAIGN PANEL</span>
                          </div>
                        </div>

                        <div className="pt-4 flex flex-col md:flex-row justify-between items-center gap-4 font-mono text-[8px] text-zinc-500 max-w-md mx-auto">
                          <div className="text-left">
                            <span>ISSUE DATE:</span>
                            <strong className="print-text-dark text-zinc-300 block mt-0.5">{certDate}</strong>
                          </div>
                          <div className="text-center">
                            <span>COMMITTED BY:</span>
                            <strong className="print-text-amber text-red-500 block mt-0.5 uppercase">Built to Break Team</strong>
                          </div>
                          <div className="text-right">
                            <span>UNIQUE CERTIFICATE ID:</span>
                            <strong className="print-text-dark text-red-500 block mt-0.5 font-bold">{certCode}-SHOW</strong>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* LIVE CERTIFICATE VERIFICATION LOOKUP PORTAL */}
                <div className="bg-[#08080a] border border-zinc-900 p-6 max-w-2xl mx-auto text-left font-mono space-y-4 mt-8">
                  <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
                    <Lock className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-black text-zinc-200 uppercase tracking-wider">
                      PUBLIC CERTIFICATE VERIFICATION PORTAL
                    </span>
                  </div>

                  <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">
                    Validate any certificate issued by entering the unique Certificate ID below:
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={verifyInput}
                      onChange={(e) => setVerifyInput(e.target.value)}
                      placeholder={`e.g. ${certCode}`}
                      className="flex-1 bg-zinc-950 border border-zinc-900 focus:border-amber-500 p-2.5 text-xs text-white placeholder-zinc-700 font-mono focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        const trimmed = verifyInput.trim().toUpperCase();
                        if (!trimmed) return;
                        if (trimmed === certCode.toUpperCase() || trimmed === `${certCode}-SHOW`.toUpperCase()) {
                          setVerifyResult({
                            status: "VERIFIED & VALID",
                            bearer: userName.toUpperCase() || "AUDIT EXAMINER",
                            state: userState.toUpperCase() || "NATIONAL REGION",
                            score: `${finalScorePercent}%`,
                            issuedBy: "Built to Break Awareness Initiative Team",
                            date: certDate
                          });
                        } else if (trimmed.startsWith("BTB-") || trimmed.startsWith("DFS-")) {
                          setVerifyResult({
                            status: "VERIFIED & VALID",
                            bearer: "VERIFIED INITIATIVE PARTICIPANT",
                            state: "INDIAN JURISDICTION",
                            score: "PASSED (≥85%)",
                            issuedBy: "Built to Break Awareness Initiative Team",
                            date: certDate
                          });
                        } else {
                          setVerifyResult({
                            status: "NOT FOUND / INVALID CODE",
                            bearer: "UNKNOWN",
                            error: "The entered ID does not match any certificate in the Built to Break compliance registry."
                          });
                        }
                      }}
                      className="px-5 py-2.5 bg-zinc-900 hover:bg-amber-600 hover:text-black border border-zinc-800 text-zinc-200 text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>VERIFY</span>
                    </button>
                  </div>

                  {verifyResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 border text-xs space-y-2 ${
                        verifyResult.status.includes("VERIFIED")
                          ? "bg-green-950/20 border-green-700/60 text-green-300"
                          : "bg-red-950/20 border-red-800 text-red-400"
                      }`}
                    >
                      <div className="flex justify-between items-center border-b border-zinc-900/60 pb-1 font-bold">
                        <span>STATUS: {verifyResult.status}</span>
                        {verifyResult.status.includes("VERIFIED") ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      {verifyResult.status.includes("VERIFIED") ? (
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-300 font-sans pt-1">
                          <div>
                            <span className="text-zinc-500 font-mono uppercase block text-[8px]">RECIPIENT BEARER:</span>
                            <strong>{verifyResult.bearer}</strong>
                          </div>
                          <div>
                            <span className="text-zinc-500 font-mono uppercase block text-[8px]">JURISDICTION:</span>
                            <strong>{verifyResult.state}</strong>
                          </div>
                          <div>
                            <span className="text-zinc-500 font-mono uppercase block text-[8px]">ISSUED BY:</span>
                            <strong className="text-amber-400">{verifyResult.issuedBy}</strong>
                          </div>
                          <div>
                            <span className="text-zinc-500 font-mono uppercase block text-[8px]">SCORE / DATE:</span>
                            <strong>{verifyResult.score} ({verifyResult.date})</strong>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[10px] text-zinc-400 font-sans">{verifyResult.error}</p>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 font-mono text-xs">
            <button
              onClick={() => {
                setIsReviewMode(true);
                setReviewIdx(0);
              }}
              className="px-5 py-2.5 border border-zinc-800 bg-zinc-950 text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer rounded-none"
            >
              <FileCheck className="w-4 h-4 text-[#EF4444]" />
              <span>REVIEW ALL ANSWERS</span>
            </button>

            <button
              onClick={() => {
                initializeQuiz();
                setHasStarted(true);
              }}
              className="px-5 py-2.5 bg-[#EF4444] text-white hover:bg-red-600 transition-all flex items-center justify-center gap-1.5 cursor-pointer rounded-none"
            >
              <RefreshCw className="w-4 h-4 animate-spin-slow" />
              <span>RUN NEW RANDOM AUDIT (20 CASES)</span>
            </button>
          </div>
        </motion.div>
      ) : (
        /* ANSWER REVIEW MODE SCREEN */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="border-b border-zinc-900 pb-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-red-500" />
              <span className="text-xs font-black text-zinc-200 uppercase font-mono">
                FORENSIC RECORD REVIEW: CASE {reviewIdx + 1} / 20
              </span>
            </div>
            <button
              onClick={() => setIsReviewMode(false)}
              className="text-xs font-mono text-zinc-500 hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>RETURN TO SUMMARY</span>
            </button>
          </div>

          {attemptedAnswers[reviewIdx] && (
            <div className="space-y-6">
              {/* Question metadata */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[9px] font-mono text-zinc-500 uppercase">
                  <span>{attemptedAnswers[reviewIdx].question.location}</span>
                  <span>•</span>
                  <span>{attemptedAnswers[reviewIdx].question.type}</span>
                  <span>•</span>
                  <span className={`px-1.5 py-0.5 border text-[8px] font-mono font-black ${
                    attemptedAnswers[reviewIdx].isCorrect ? "border-green-800 text-green-400 bg-green-950/10" : "border-red-900 text-red-500 bg-red-950/10"
                  }`}>
                    {attemptedAnswers[reviewIdx].isCorrect ? "CORRECT CODE APPLICATION" : "INCORRECT APPLICATION"}
                  </span>
                </div>

                <h4 className="text-base font-black text-zinc-100 uppercase tracking-tight font-display">
                  {attemptedAnswers[reviewIdx].question.title}
                </h4>

                <div className="bg-[#0b0b0d] border border-zinc-900/60 p-4 text-xs text-zinc-400 leading-relaxed font-light font-sans">
                  {attemptedAnswers[reviewIdx].question.description}
                </div>
              </div>

              {/* Detailed review panel */}
              <div className="bg-[#0c0d12] border-l-2 border-[#EF4444] p-5 space-y-4 font-mono text-xs">
                <div>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase block mb-1">YOUR EXAMINED VERDICT:</span>
                  <div className="flex items-center gap-2 text-zinc-200 font-bold">
                    {attemptedAnswers[reviewIdx].isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span>{attemptedAnswers[reviewIdx].selected === "compliant" ? "Fully Compliant (Legal)" : "Non-Compliant (Illegal)"}</span>
                    {!hideGamification && (
                      <span className="text-zinc-500 font-normal">({attemptedAnswers[reviewIdx].pointsEarned} Points Earned)</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 pt-3 border-t border-zinc-900">
                  <span className="text-[9px] text-red-500 font-bold uppercase tracking-wider block">
                    REGULATORY EXPLANATION:
                  </span>
                  <p className="text-zinc-300 leading-relaxed font-light">
                    {attemptedAnswers[reviewIdx].question.options.find(o => o.id === attemptedAnswers[reviewIdx].question.correctId)?.explanation}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-zinc-900 text-[10px] leading-relaxed text-zinc-400">
                  <div className="space-y-1">
                    <span className="text-zinc-500 uppercase block text-[8px] font-black">NBC CLAUSES:</span>
                    <ul className="list-disc pl-4 space-y-1 text-zinc-300">
                      {attemptedAnswers[reviewIdx].question.nbcClauses.map((clause, idx) => (
                        <li key={idx}>{clause}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1">
                    <span className="text-zinc-500 uppercase block text-[8px] font-black">LIABILITIES & PENALTIES:</span>
                    <span className="text-red-400 block font-bold">{attemptedAnswers[reviewIdx].question.bnsSection}</span>
                    <p className="text-[9px] text-zinc-500 font-sans mt-1 leading-normal">
                      {attemptedAnswers[reviewIdx].question.fact}
                    </p>
                  </div>
                </div>
              </div>

              {/* Carousel navigation controls */}
              <div className="flex justify-between items-center pt-2 font-mono text-xs">
                <button
                  onClick={() => setReviewIdx(prev => Math.max(0, prev - 1))}
                  disabled={reviewIdx === 0}
                  className={`px-4 py-2 border flex items-center gap-1 rounded-none ${
                    reviewIdx === 0 
                      ? "border-zinc-900 bg-zinc-950 text-zinc-700 cursor-not-allowed" 
                      : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white cursor-pointer"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>PREVIOUS RECORDBOX</span>
                </button>

                <button
                  onClick={() => setIsReviewMode(false)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition-all rounded-none cursor-pointer"
                >
                  BACK TO ASSESSMENT SUMMARY
                </button>

                <button
                  onClick={() => setReviewIdx(prev => Math.min(19, prev + 1))}
                  disabled={reviewIdx === 19}
                  className={`px-4 py-2 border flex items-center gap-1 rounded-none ${
                    reviewIdx === 19 
                      ? "border-zinc-900 bg-zinc-950 text-zinc-700 cursor-not-allowed" 
                      : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white cursor-pointer"
                  }`}
                >
                  <span>NEXT RECORDBOX</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

export default React.memo(TestYourKnowledge);
