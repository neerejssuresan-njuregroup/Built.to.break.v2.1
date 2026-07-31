import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db } from "./src/db/index.ts";
import { users, certificates, questions } from "./src/db/schema.ts";
import { eq, sql } from "drizzle-orm";
import { adminAuth } from "./src/lib/firebase-admin.ts";
import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsers with increased limit for base64 photo uploads
  app.use(express.json({ limit: "20mb" }));
  app.use(express.urlencoded({ limit: "20mb", extended: true }));

  // API Route: Healthcheck
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // API Route: Get 20 Random Questions from Database
  app.get("/api/questions", async (req, res) => {
    try {
      const randomQuestions = await db.select()
        .from(questions)
        .orderBy(sql`random()`)
        .limit(20);

      const mapped = randomQuestions.map((q) => ({
        id: q.questionId, // map questionId to id for frontend compatibility
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
      res.status(500).json({ error: "Failed to fetch questions from database", details: error.message });
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
