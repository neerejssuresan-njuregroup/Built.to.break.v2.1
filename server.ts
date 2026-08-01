import express from "express";
import path from "path";
import crypto from "crypto";
import { Server as SocketIOServer } from "socket.io";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { db } from "./src/db/index.ts";
import { users, certificates, questions, admins, ongoingSessions } from "./src/db/schema.ts";
import { eq, sql } from "drizzle-orm";
import { adminAuth } from "./src/lib/firebase-admin.ts";
import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";
import { FALLBACK_QUESTIONS } from "./src/questionsData.js";

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Hashing algorithms for ID & Passwords (case-sensitive)
function hashAdminId(adminId: string): string {
  const salt = "NBC_ADMIN_ID_SALT_2026";
  return crypto.createHash("sha256").update(adminId + salt).digest("hex");
}

function hashPassword(password: string): string {
  const salt = "NBC_ADMIN_PASS_SALT_2026";
  return crypto.createHash("sha256").update(password + salt).digest("hex");
}

// Admin Sessions
const adminSessions = new Map<string, { username: string; expiresAt: number }>();

function requireAdmin(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized. Admin session token is missing." });
  }
  const token = authHeader.split("Bearer ")[1];
  const session = adminSessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (session) adminSessions.delete(token); // clean up expired
    return res.status(401).json({ error: "Session expired or invalid. Please log in again." });
  }
  req.admin = session;
  next();
}

let globalSettings = {
  hideGamification: false
};

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(express.json({ limit: "50mb" }));

  app.get("/api/settings", (req, res) => {
    res.json(globalSettings);
  });

  app.post("/api/admin/settings", requireAdmin, (req, res) => {
    if (typeof req.body.hideGamification === "boolean") {
      globalSettings.hideGamification = req.body.hideGamification;
    }
    res.json(globalSettings);
  });

  // Auto-seed admin user if missing
  try {
    const adminIdRaw = "Group30ExamAdmin";
    const adminPassRaw = "NBCExamAdmin0191@#!";
    
    const hashedId = hashAdminId(adminIdRaw);
    const hashedPassword = hashPassword(adminPassRaw);
    
    const existing = await db.select().from(admins).where(eq(admins.username, hashedId)).limit(1);
    if (existing.length === 0) {
      await db.insert(admins).values({
        username: hashedId,
        passwordHash: hashedPassword
      });
      console.log("[DB] Admin user successfully seeded.");
    }
  } catch (err: any) {
    console.error("[DB] Failed to seed admin user:", err);
  }

  // Auto-seed 500 unique questions into DB if question count is low
  try {
    const existingCount = await db.select({ count: sql`count(*)` }).from(questions);
    const countNum = parseInt((existingCount[0] as any)?.count || "0", 10);
    if (countNum < 100) {
      console.log(`[DB] Current question count is ${countNum}. Seeding 500 unique questions from bank...`);
      for (const q of FALLBACK_QUESTIONS) {
        await db.insert(questions).values({
          questionId: q.id,
          title: q.title,
          type: q.type,
          location: q.location || "Custom Location",
          description: q.description,
          difficulty: q.difficulty || "MEDIUM",
          points: q.points || 10,
          options: q.options,
          correctId: q.correctId,
          nbcClauses: q.nbcClauses,
          bnsSection: q.bnsSection,
          hazardLevel: q.hazardLevel || "HIGH",
          fact: q.fact || "",
        }).onConflictDoNothing();
      }
      console.log("[DB] 500 unique questions successfully seeded.");
    }
  } catch (err: any) {
    console.warn("[DB] Question auto-seed note:", err?.message);
  }

  // Body parsers with increased limit for base64 photo uploads
  app.use(express.json({ limit: "20mb" }));
  app.use(express.urlencoded({ limit: "20mb", extended: true }));

  // API Route: Healthcheck
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // API Route: Admin Login
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required." });
      }

      const hashedUsername = hashAdminId(username);
      const hashedPassword = hashPassword(password);

      const match = await db.select()
        .from(admins)
        .where(eq(admins.username, hashedUsername))
        .limit(1);

      if (match.length === 0 || match[0].passwordHash !== hashedPassword) {
        return res.status(401).json({ error: "Invalid admin credentials. Access Denied." });
      }

      // Valid admin login! Generate a session token
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = Date.now() + 2 * 60 * 60 * 1000; // 2 hours
      adminSessions.set(token, { username, expiresAt });

      res.json({ success: true, token, username });
    } catch (error: any) {
      console.error("Admin login error:", error);
      res.status(500).json({ error: "Internal server error during admin login" });
    }
  });

  // API Route: Verify Admin Token
  app.get("/api/admin/verify", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const token = authHeader.split("Bearer ")[1];
    const session = adminSessions.get(token);
    if (!session || session.expiresAt < Date.now()) {
      return res.status(401).json({ error: "Expired" });
    }
    res.json({ valid: true, username: session.username });
  });

  // API Route: Get All Questions (Admin)
  app.get("/api/admin/questions", requireAdmin, async (req, res) => {
    try {
      const allQ = await db.select().from(questions);
      res.json(allQ);
    } catch (error: any) {
      console.error("Admin fetch questions error:", error);
      res.status(500).json({ error: "Failed to fetch questions from database" });
    }
  });

  // API Route: Add Question (Admin)
  app.post("/api/admin/questions", requireAdmin, async (req, res) => {
    try {
      const q = req.body;
      if (!q.title || !q.type || !q.description || !q.options || !q.correctId || !q.nbcClauses || !q.bnsSection) {
        return res.status(400).json({ error: "Missing required fields for creating a question." });
      }

      const questionId = q.questionId || `custom_q_${Date.now()}`;
      const result = await db.insert(questions).values({
        questionId,
        title: q.title,
        type: q.type,
        location: q.location || "Custom Location",
        description: q.description,
        difficulty: q.difficulty || "MEDIUM",
        points: parseInt(q.points, 10) || 10,
        options: q.options,
        correctId: q.correctId,
        nbcClauses: q.nbcClauses,
        bnsSection: q.bnsSection,
        hazardLevel: q.hazardLevel || "HIGH",
        fact: q.fact || "",
      }).returning();

      res.json({ success: true, question: result[0] });
    } catch (error: any) {
      console.error("Admin add question error:", error);
      res.status(500).json({ error: "Failed to add question to database", details: error.message });
    }
  });

  // API Route: Update Question (Admin)
  app.put("/api/admin/questions/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const q = req.body;

      const result = await db.update(questions)
        .set({
          title: q.title,
          type: q.type,
          location: q.location,
          description: q.description,
          difficulty: q.difficulty,
          points: parseInt(q.points, 10) || 10,
          options: q.options,
          correctId: q.correctId,
          nbcClauses: q.nbcClauses,
          bnsSection: q.bnsSection,
          hazardLevel: q.hazardLevel,
          fact: q.fact,
        })
        .where(eq(questions.id, parseInt(id, 10)))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ error: "Question not found" });
      }

      res.json({ success: true, question: result[0] });
    } catch (error: any) {
      console.error("Admin update question error:", error);
      res.status(500).json({ error: "Failed to update question", details: error.message });
    }
  });

  // API Route: Delete Question (Admin)
  app.delete("/api/admin/questions/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.delete(questions)
        .where(eq(questions.id, parseInt(id, 10)))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ error: "Question not found" });
      }

      res.json({ success: true, deleted: result[0] });
    } catch (error: any) {
      console.error("Admin delete question error:", error);
      res.status(500).json({ error: "Failed to delete question", details: error.message });
    }
  });

  // API Route: Search Certificates (Admin)
  app.get("/api/admin/certificates/search", requireAdmin, async (req, res) => {
    try {
      const q = req.query.q as string || "";
      const searchVal = `%${q.trim()}%`;

      const results = await db.select()
        .from(certificates)
        .where(
          sql`LOWER(${certificates.userName}) LIKE LOWER(${searchVal}) OR LOWER(${certificates.userState}) LIKE LOWER(${searchVal}) OR LOWER(${certificates.certCode}) LIKE LOWER(${searchVal})`
        );

      res.json(results);
    } catch (error: any) {
      console.error("Admin certificates search error:", error);
      res.status(500).json({ error: "Search failed", details: error.message });
    }
  });

  // API Route: Candidate Exam Session Sync (Client to Server)
  app.post("/api/sessions/sync", async (req, res) => {
    try {
      const {
        sessionCode,
        userName,
        userState,
        status,
        proctorLogs,
        flags,
        currentQuestionIndex,
        scorePercent,
        userPhoto
      } = req.body;

      if (!sessionCode || !userName) {
        return res.status(400).json({ error: "Missing required session fields." });
      }

      const existing = await db.select().from(ongoingSessions).where(eq(ongoingSessions.sessionCode, sessionCode)).limit(1);

      let serverStatus = "ongoing";
      let serverFlags = 0;
      let serverLogs: any[] = [];
      let prevQuestionIdx = 0;
      let prevScore = 0;
      let prevPhoto = null;

      if (existing.length > 0) {
        serverStatus = existing[0].status;
        serverFlags = existing[0].flags ?? 0;
        serverLogs = (existing[0].proctorLogs as any[]) || [];
        prevQuestionIdx = existing[0].currentQuestionIndex ?? 0;
        prevScore = existing[0].scorePercent ?? 0;
        prevPhoto = existing[0].userPhoto;
      }

      const clientLogs = proctorLogs || [];
      const manualServerLogs = serverLogs.filter((log: any) => log.type === "MANUAL" || log.action === "FLAG" || log.action === "UNFLAG");
      
      const mergedLogs = [...clientLogs];
      for (const mLog of manualServerLogs) {
        const alreadyExists = mergedLogs.some((l: any) => l.message === mLog.message && l.timestamp === mLog.timestamp);
        if (!alreadyExists) {
          mergedLogs.push(mLog);
        }
      }

      // Allow explicit reset if status is ongoing (re-attempt) or if flags is explicitly 0
      const isReattempt = status === "ongoing" && flags === 0;
      const finalStatus = isReattempt ? "ongoing" : ((serverStatus === "disqualified" && status !== "completed") ? "disqualified" : (status || "ongoing"));
      const finalFlags = isReattempt ? 0 : (flags !== undefined ? flags : serverFlags);

      const result = await db.insert(ongoingSessions)
        .values({
          sessionCode,
          userName,
          userState: userState || "Delhi NCR",
          status: finalStatus,
          proctorLogs: mergedLogs,
          flags: finalFlags,
          currentQuestionIndex: currentQuestionIndex ?? prevQuestionIdx,
          scorePercent: scorePercent ?? prevScore,
          userPhoto: userPhoto || prevPhoto || null,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: ongoingSessions.sessionCode,
          set: {
            userName,
            userState: userState || "Delhi NCR",
            status: finalStatus,
            proctorLogs: mergedLogs,
            flags: finalFlags,
            currentQuestionIndex: currentQuestionIndex ?? prevQuestionIdx,
            scorePercent: scorePercent ?? prevScore,
            userPhoto: userPhoto || prevPhoto || null,
            updatedAt: new Date(),
          }
        })
        .returning();

      res.json({ success: true, session: result[0] });
    } catch (error: any) {
      console.error("Session sync error:", error);
      res.status(500).json({ error: "Failed to sync session", details: error.message });
    }
  });

  // API Route: Candidate Session Status Polling
  app.get("/api/sessions/status/:sessionCode", async (req, res) => {
    try {
      const { sessionCode } = req.params;
      const session = await db.select().from(ongoingSessions).where(eq(ongoingSessions.sessionCode, sessionCode)).limit(1);
      if (session.length === 0) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json({ ...session[0], hideGamification: globalSettings.hideGamification });
    } catch (error: any) {
      console.error("Get session status error:", error);
      res.status(500).json({ error: "Server error retrieving status" });
    }
  });

  // API Route: Get All Live/Recent Sessions (Admin)
  app.get("/api/admin/sessions", requireAdmin, async (req, res) => {
    try {
      const sessionsList = await db.select().from(ongoingSessions).orderBy(sql`updated_at desc`);
      res.json(sessionsList);
    } catch (error: any) {
      console.error("Admin fetch live sessions error:", error);
      res.status(500).json({ error: "Failed to fetch live sessions" });
    }
  });

  // API Route: Manually Flag a Session (Admin)
  app.post("/api/admin/sessions/:sessionCode/flag", requireAdmin, async (req, res) => {
    try {
      const { sessionCode } = req.params;
      const { comment } = req.body;

      const existing = await db.select().from(ongoingSessions).where(eq(ongoingSessions.sessionCode, sessionCode)).limit(1);
      if (existing.length === 0) {
        return res.status(404).json({ error: "Session not found" });
      }

      const timestamp = new Date().toLocaleTimeString();
      const newLog = {
        timestamp,
        type: "MANUAL",
        message: `[ADMIN MANUAL FLAG] Added by Proctor. Comment: ${comment}`,
        action: "FLAG",
        comment
      };

      const updatedLogs = [newLog, ...(existing[0].proctorLogs as any[] || [])];
      const newFlags = (existing[0].flags ?? 0) + 1;
      const newStatus = newFlags >= 10 ? "disqualified" : existing[0].status;

      await db.update(ongoingSessions)
        .set({
          flags: newFlags,
          status: newStatus,
          proctorLogs: updatedLogs,
          updatedAt: new Date()
        })
        .where(eq(ongoingSessions.sessionCode, sessionCode));

      res.json({ success: true });
    } catch (error: any) {
      console.error("Admin flag session error:", error);
      res.status(500).json({ error: "Failed to manually flag session", details: error.message });
    }
  });

  // API Route: Revoke a Flag from a Session (Admin)
  app.post("/api/admin/sessions/:sessionCode/revoke", requireAdmin, async (req, res) => {
    try {
      const { sessionCode } = req.params;
      const { comment } = req.body;

      const existing = await db.select().from(ongoingSessions).where(eq(ongoingSessions.sessionCode, sessionCode)).limit(1);
      if (existing.length === 0) {
        return res.status(404).json({ error: "Session not found" });
      }

      const timestamp = new Date().toLocaleTimeString();
      const newLog = {
        timestamp,
        type: "MANUAL",
        message: `[ADMIN REVOKE FLAG] Proctor revoked a flag warning. Comment: ${comment}`,
        action: "UNFLAG",
        comment
      };

      const updatedLogs = [newLog, ...(existing[0].proctorLogs as any[] || [])];
      const newFlags = Math.max(0, (existing[0].flags ?? 0) - 1);
      const newStatus = (newFlags < 10 && existing[0].status === "disqualified") ? "ongoing" : existing[0].status;

      await db.update(ongoingSessions)
        .set({
          flags: newFlags,
          status: newStatus,
          proctorLogs: updatedLogs,
          updatedAt: new Date()
        })
        .where(eq(ongoingSessions.sessionCode, sessionCode));

      res.json({ success: true });
    } catch (error: any) {
      console.error("Admin revoke flag error:", error);
      res.status(500).json({ error: "Failed to revoke flag", details: error.message });
    }
  });

  // API Route: Terminate a Session (Admin)
  app.post("/api/admin/sessions/:sessionCode/terminate", requireAdmin, async (req, res) => {
    try {
      const { sessionCode } = req.params;
      const { comment } = req.body;

      const existing = await db.select().from(ongoingSessions).where(eq(ongoingSessions.sessionCode, sessionCode)).limit(1);
      if (existing.length === 0) {
        return res.status(404).json({ error: "Session not found" });
      }

      const timestamp = new Date().toLocaleTimeString();
      const newLog = {
        timestamp,
        type: "MANUAL",
        message: `[ADMIN TERMINATED EXAM] Proctor manually ended this exam session. Comment: ${comment}`,
        action: "TERMINATE",
        comment
      };

      const updatedLogs = [newLog, ...(existing[0].proctorLogs as any[] || [])];

      await db.update(ongoingSessions)
        .set({
          status: "disqualified",
          proctorLogs: updatedLogs,
          updatedAt: new Date()
        })
        .where(eq(ongoingSessions.sessionCode, sessionCode));

      res.json({ success: true });
    } catch (error: any) {
      console.error("Admin terminate session error:", error);
      res.status(500).json({ error: "Failed to terminate session", details: error.message });
    }
  });

  // API Route: Get 20 Random UNIQUE Questions from Database or Fallback
  app.get("/api/questions", async (req, res) => {
    try {
      let candidatePool: any[] = [];
      try {
        candidatePool = await db.select()
          .from(questions)
          .orderBy(sql`random()`)
          .limit(80);
      } catch (dbError: any) {
        console.warn("[DB] Failed to query questions table, serving fallback question bank:", dbError?.message);
      }

      if (!candidatePool || candidatePool.length === 0) {
        candidatePool = FALLBACK_QUESTIONS;
      }

      // Strict deduplication by title and description
      const uniqueList: any[] = [];
      const seenKeys = new Set<string>();

      // Shuffle candidate pool
      const shuffled = [...candidatePool].sort(() => Math.random() - 0.5);

      for (const q of shuffled) {
        const key = `${q.title || ""}_${q.description || ""}`.trim().toLowerCase();
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          uniqueList.push(q);
        }
        if (uniqueList.length >= 20) break;
      }

      // If needed, top up from FALLBACK_QUESTIONS to guarantee 20 unique questions
      if (uniqueList.length < 20) {
        for (const fq of FALLBACK_QUESTIONS) {
          const key = `${fq.title || ""}_${fq.description || ""}`.trim().toLowerCase();
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            uniqueList.push(fq);
          }
          if (uniqueList.length >= 20) break;
        }
      }

      const mapped = uniqueList.map((q) => ({
        id: q.questionId || q.id,
        title: q.title,
        type: q.type,
        location: q.location,
        description: q.description,
        difficulty: q.difficulty,
        points: q.points,
        options: q.options,
        correctId: q.correctId,
        nbcClauses: q.nbcClauses,
        bnsSection: q.bnsSection,
        hazardLevel: q.hazardLevel,
        fact: q.fact,
      }));

      res.json(mapped);
    } catch (error: any) {
      console.error("Database fetch questions error:", error);
      res.json(FALLBACK_QUESTIONS.slice(0, 20));
    }
  });

  // API Route: Live Proctor Frame & Mic Analysis via Gemini AI
  app.post("/api/proctor/gemini-verify", async (req, res) => {
    try {
      const { image, audioVolume, audioPeak } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.json({
          verified: true,
          faceDetected: true,
          faceFacingForward: true,
          eyesOnScreen: true,
          violationDetected: false,
          violationReason: null,
          note: "Gemini API Key missing; fallback active."
        });
      }

      if (!image) {
        return res.status(400).json({ error: "Missing frame image" });
      }

      const base64Data = image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

      const prompt = `You are a real-time AI Proctor inspecting an examinee taking an official exam.
Analyze this webcam image and audio telemetry:
Audio Volume Level: ${audioVolume ?? 0}, Audio Peak: ${audioPeak ?? 0}.

Evaluation criteria:
1. Is a human face present? (If camera pointed at ceiling, wall, or empty space, faceDetected = false).
2. Is candidate facing forward? (If looking away or turned sideways, faceFacingForward = false).
3. Are candidate's eyes on exam screen? (If looking away or down at phone, eyesOnScreen = false).
4. Is there a mobile phone, unauthorized device, or second person in frame? (If yes, violationDetected = true).
5. Audio Analysis: Is audio volume > 25 or is speech/whispering/background voices detected? (If yes, speechDetected = true).
6. Realtime Audio Comment: Provide a concise 1-sentence Gemini Proctor observation about audio and candidate status (e.g., "Microphone audio clear and quiet", "Background talking or secondary voice detected", "Sustained vocal activity or whispering detected").

Return a JSON object adhering to this schema:
{
  "faceDetected": boolean,
  "faceFacingForward": boolean,
  "eyesOnScreen": boolean,
  "violationDetected": boolean,
  "speechDetected": boolean,
  "violationReason": string or null,
  "audioComment": string
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Data
              }
            },
            {
              text: prompt
            }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              faceDetected: { type: Type.BOOLEAN },
              faceFacingForward: { type: Type.BOOLEAN },
              eyesOnScreen: { type: Type.BOOLEAN },
              violationDetected: { type: Type.BOOLEAN },
              speechDetected: { type: Type.BOOLEAN },
              violationReason: { type: Type.STRING },
              audioComment: { type: Type.STRING }
            },
            required: ["faceDetected", "faceFacingForward", "eyesOnScreen", "violationDetected", "speechDetected", "audioComment"]
          }
        }
      });

      let parsed: any = {};
      try {
        parsed = JSON.parse(response.text?.trim() || "{}");
      } catch (e) {
        console.warn("Gemini proctor JSON parse error:", e);
      }

      res.json({
        verified: parsed.faceDetected && parsed.faceFacingForward && parsed.eyesOnScreen && !parsed.violationDetected && !parsed.speechDetected,
        ...parsed
      });

    } catch (error: any) {
      console.error("Gemini proctor verify error:", error?.message || error);
      res.json({
        verified: true,
        faceDetected: true,
        faceFacingForward: true,
        eyesOnScreen: true,
        violationDetected: false,
        speechDetected: false,
        errorNote: "Proctor verification API transient error."
      });
    }
  });

  // API Route: Register/Save Certificate in Database
  app.post("/api/certificates", async (req, res) => {
    try {
      const {
        certCode,
        userName,
        userState,
        finalScorePercent,
        certDate,
        activeTab,
        driveFileId,
        driveViewUrl,
        status,
        userPhoto,
        idType,
        idNumber,
        idPhoto,
        driveIdFileId,
        driveIdViewUrl
      } = req.body;

      if (!certCode || !userName) {
        return res.status(400).json({ error: "Missing required fields (certCode, userName)" });
      }

      let dbUserId = null;

      // Extract optional authentication to link certificate to logged-in user
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split("Bearer ")[1];
        try {
          const decodedToken = await adminAuth.verifyIdToken(token);
          const uid = decodedToken.uid;
          const email = decodedToken.email || `${uid}@firebase.com`;
          const displayName = decodedToken.name || userName;

          // Upsert the user in PostgreSQL
          const userResult = await db.insert(users)
            .values({ uid, email, displayName })
            .onConflictDoUpdate({
              target: users.uid,
              set: { email, displayName }
            })
            .returning();

          if (userResult && userResult.length > 0) {
            dbUserId = userResult[0].id;
          }
        } catch (authErr) {
          console.warn("Optional Firebase ID token verification failed, saving as guest:", authErr);
        }
      }

      // Upsert certificate in PostgreSQL
      const score = typeof finalScorePercent === "string" ? parseInt(finalScorePercent, 10) : finalScorePercent;
      const result = await db.insert(certificates)
        .values({
          userId: dbUserId,
          certCode,
          userName,
          userState: userState || "Delhi NCR",
          finalScorePercent: isNaN(score) ? 100 : score,
          certDate: certDate || new Date().toLocaleDateString("en-IN"),
          activeTab: activeTab || "nbc",
          driveFileId: driveFileId || null,
          driveViewUrl: driveViewUrl || null,
          status: status || "VERIFIED & ISSUED",
          userPhoto: userPhoto || null,
          idType: idType || null,
          idNumber: idNumber || null,
          idPhoto: idPhoto || null,
          driveIdFileId: driveIdFileId || null,
          driveIdViewUrl: driveIdViewUrl || null
        })
        .onConflictDoUpdate({
          target: certificates.certCode,
          set: {
            userId: dbUserId,
            userName,
            userState: userState || "Delhi NCR",
            finalScorePercent: isNaN(score) ? 100 : score,
            certDate: certDate || new Date().toLocaleDateString("en-IN"),
            activeTab: activeTab || "nbc",
            driveFileId: driveFileId || null,
            driveViewUrl: driveViewUrl || null,
            status: status || "VERIFIED & ISSUED",
            userPhoto: userPhoto || null,
            idType: idType || null,
            idNumber: idNumber || null,
            idPhoto: idPhoto || null,
            driveIdFileId: driveIdFileId || null,
            driveIdViewUrl: driveIdViewUrl || null
          }
        })
        .returning();

      res.json({ success: true, certificate: result[0] });
    } catch (error: any) {
      console.error("Database save certificate error:", error);
      res.status(500).json({ error: "Failed to store certificate in database", details: error.message });
    }
  });

  // API Route: Verify a Certificate by Code (Accessible to any user)
  app.get("/api/certificates/verify/:certCode", async (req, res) => {
    try {
      const { certCode } = req.params;
      const cleanCode = certCode.trim().toUpperCase();

      // Query from certificates table and left join users to get creator's details
      const records = await db.select({
        id: certificates.id,
        certCode: certificates.certCode,
        userName: certificates.userName,
        userState: certificates.userState,
        finalScorePercent: certificates.finalScorePercent,
        certDate: certificates.certDate,
        activeTab: certificates.activeTab,
        driveFileId: certificates.driveFileId,
        driveViewUrl: certificates.driveViewUrl,
        status: certificates.status,
        userPhoto: certificates.userPhoto,
        idType: certificates.idType,
        idNumber: certificates.idNumber,
        idPhoto: certificates.idPhoto,
        driveIdFileId: certificates.driveIdFileId,
        driveIdViewUrl: certificates.driveIdViewUrl,
        createdAt: certificates.createdAt,
        creatorEmail: users.email,
        creatorDisplayName: users.displayName,
        creatorUid: users.uid
      })
      .from(certificates)
      .leftJoin(users, eq(certificates.userId, users.id))
      .where(eq(certificates.certCode, cleanCode))
      .limit(1);

      if (records.length === 0) {
        // Also check if they passed with/without standard suffix
        const altCode = cleanCode.endsWith("-SHOW") ? cleanCode.replace("-SHOW", "") : `${cleanCode}-SHOW`;
        const altRecords = await db.select({
          id: certificates.id,
          certCode: certificates.certCode,
          userName: certificates.userName,
          userState: certificates.userState,
          finalScorePercent: certificates.finalScorePercent,
          certDate: certificates.certDate,
          activeTab: certificates.activeTab,
          driveFileId: certificates.driveFileId,
          driveViewUrl: certificates.driveViewUrl,
          status: certificates.status,
          userPhoto: certificates.userPhoto,
          idType: certificates.idType,
          idNumber: certificates.idNumber,
          idPhoto: certificates.idPhoto,
          driveIdFileId: certificates.driveIdFileId,
          driveIdViewUrl: certificates.driveIdViewUrl,
          createdAt: certificates.createdAt,
          creatorEmail: users.email,
          creatorDisplayName: users.displayName,
          creatorUid: users.uid
        })
        .from(certificates)
        .leftJoin(users, eq(certificates.userId, users.id))
        .where(eq(certificates.certCode, altCode))
        .limit(1);

        if (altRecords.length > 0) {
          return res.json({ found: true, certificate: altRecords[0] });
        }

        return res.status(404).json({ found: false, error: "Certificate code not found in registry" });
      }

      res.json({ found: true, certificate: records[0] });
    } catch (error: any) {
      console.error("Database verify certificate error:", error);
      res.status(500).json({ error: "Verification server error", details: error.message });
    }
  });

  // API Route: Get all certificates for logged-in user
  app.get("/api/certificates/my", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user.uid;
      const dbUser = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
      if (dbUser.length === 0) {
        return res.json([]);
      }

      const userCerts = await db.select().from(certificates).where(eq(certificates.userId, dbUser[0].id));
      res.json(userCerts);
    } catch (error: any) {
      console.error("Database fetch my certificates error:", error);
      res.status(500).json({ error: "Failed to fetch certificates", details: error.message });
    }
  });

  // Vite middleware integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const httpServer = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });

  const io = new SocketIOServer(httpServer, {
    cors: { origin: "*" }
  });

  io.on("connection", (socket) => {
    socket.on("join-session", (sessionCode) => {
      socket.join(sessionCode);
    });

    socket.on("video-frame", (data) => {
      if (data && data.sessionCode) {
        socket.to(data.sessionCode).emit("receive-video-frame", data);
      }
    });
  });
}

startServer();
