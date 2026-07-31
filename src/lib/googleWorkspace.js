/**
 * Google Workspace (Drive & Sheets) Integration Module
 * Built for "Built to Break" Certificate Registry & Verification System
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut 
} from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase App lazily to prevent duplication
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope("https://www.googleapis.com/auth/drive.file");
provider.addScope("https://www.googleapis.com/auth/spreadsheets");

let cachedAccessToken = null;
let isSigningIn = false;

// Initial pre-populated local verified certificates registry for public verification
const DEMO_CERTIFICATES = [
  {
    certCode: "BTB-8921-X",
    userName: "Neerej S Suresan",
    userState: "Delhi NCR",
    finalScorePercent: 95,
    activeTab: "nbc",
    certDate: "15 Jul 2026",
    status: "VERIFIED & ISSUED",
    idType: "aadhaar",
    idNumber: "9876-5432-1012",
    driveFileId: "1A2B3C4D5E_SAMPLE_DRIVE",
    driveViewUrl: "https://drive.google.com",
    sheetSynced: true
  },
  {
    certCode: "BTB-2026-001",
    userName: "Ananya Sharma",
    userState: "Maharashtra",
    finalScorePercent: 90,
    activeTab: "nbc",
    certDate: "18 Jul 2026",
    status: "VERIFIED & ISSUED",
    idType: "pan",
    idNumber: "ABCDE1234F",
    driveFileId: "2B3C4D5E6F_SAMPLE_DRIVE",
    driveViewUrl: "https://drive.google.com",
    sheetSynced: true
  },
  {
    certCode: "BTB-2026-002-SHOW",
    userName: "Rahul Verma",
    userState: "Karnataka",
    finalScorePercent: 100,
    activeTab: "show",
    certDate: "20 Jul 2026",
    status: "VERIFIED & ISSUED",
    idType: "aadhaar",
    idNumber: "8765-4321-0987",
    driveFileId: "3C4D5E6F7G_SAMPLE_DRIVE",
    driveViewUrl: "https://drive.google.com",
    sheetSynced: true
  }
];

// Initialize local certificate storage if empty
export const getLocalCertRegistry = () => {
  if (typeof window === "undefined") return DEMO_CERTIFICATES;
  try {
    const stored = localStorage.getItem("btb_certificate_registry");
    if (!stored) {
      localStorage.setItem("btb_certificate_registry", JSON.stringify(DEMO_CERTIFICATES));
      return DEMO_CERTIFICATES;
    }
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to read local cert registry", e);
    return DEMO_CERTIFICATES;
  }
};

export const saveLocalCertificate = (certRecord) => {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalCertRegistry();
    // Check if exists
    const existingIdx = current.findIndex(c => c.certCode === certRecord.certCode);
    let updated;
    if (existingIdx >= 0) {
      updated = [...current];
      updated[existingIdx] = { ...updated[existingIdx], ...certRecord };
    } else {
      updated = [certRecord, ...current];
    }
    localStorage.setItem("btb_certificate_registry", JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Failed to save local certificate", e);
  }
};

/**
 * Initialize Firebase Auth listener
 */
export const initAuth = (onAuthSuccess, onAuthFailure) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else if (user && !cachedAccessToken) {
      // User is logged in but token was lost on refresh - trigger prompt or reset
      if (onAuthFailure) onAuthFailure();
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Sign in with Google with Drive and Sheets scopes
 */
export const googleSignIn = async () => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Could not retrieve Google OAuth Access Token.");
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error("Google sign in error:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const googleSignOut = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

export const getAccessToken = () => cachedAccessToken;

/**
 * GOOGLE SHEETS API: Find or create the master certificate spreadsheet
 */
export const getOrCreateCertificateSpreadsheet = async (token) => {
  if (!token) throw new Error("Google authentication required.");

  // 1. Search for existing spreadsheet
  const searchQuery = encodeURIComponent("name = 'Built to Break - Certificate Registry' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false");
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${searchQuery}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!searchRes.ok) {
    const errText = await searchRes.text();
    throw new Error(`Drive search failed: ${errText}`);
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id; // Found existing sheet
  }

  // 2. Create new spreadsheet if not found
  const createRes = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      properties: {
        title: "Built to Break - Certificate Registry"
      },
      sheets: [
        {
          properties: {
            title: "Verified Certificates",
            gridProperties: { rowCount: 1000, columnCount: 13 }
          },
          data: [
            {
              startRow: 0,
              startColumn: 0,
              rowData: [
                {
                  values: [
                    { userEnteredValue: { stringValue: "Certificate ID" } },
                    { userEnteredValue: { stringValue: "Recipient Name" } },
                    { userEnteredValue: { stringValue: "State / Jurisdiction" } },
                    { userEnteredValue: { stringValue: "Score (%)" } },
                    { userEnteredValue: { stringValue: "Certificate Type" } },
                    { userEnteredValue: { stringValue: "Issue Date" } },
                    { userEnteredValue: { stringValue: "Status" } },
                    { userEnteredValue: { stringValue: "Google Drive File ID" } },
                    { userEnteredValue: { stringValue: "Google Drive View Link" } },
                    { userEnteredValue: { stringValue: "Synced Timestamp" } },
                    { userEnteredValue: { stringValue: "ID Type" } },
                    { userEnteredValue: { stringValue: "ID Number" } },
                    { userEnteredValue: { stringValue: "Drive ID View Link" } }
                  ]
                }
              ]
            }
          ]
        }
      ]
    })
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Failed to create Google Sheet: ${errText}`);
  }

  const newSheet = await createRes.json();
  return newSheet.spreadsheetId;
};

/**
 * GOOGLE SHEETS API: Append a certificate record row
 */
export const appendCertificateToSheet = async (token, certRecord) => {
  const spreadsheetId = await getOrCreateCertificateSpreadsheet(token);

  const values = [
    [
      certRecord.certCode || "BTB-0000",
      certRecord.userName || "Examinee",
      certRecord.userState || "Delhi NCR",
      certRecord.finalScorePercent || 100,
      certRecord.activeTab === "nbc" ? "NBC Compliance Forensic" : "Honorary Public Safety Envoy",
      certRecord.certDate || new Date().toLocaleDateString("en-IN"),
      "VERIFIED & ISSUED",
      certRecord.driveFileId || "N/A",
      certRecord.driveViewUrl || "N/A",
      new Date().toISOString(),
      certRecord.idType || "N/A",
      certRecord.idNumber || "N/A",
      certRecord.driveIdViewUrl || "N/A"
    ]
  ];

  const appendRes = await fetch(
    `https://www.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Verified Certificates!A:M:append?valueInputOption=USER_ENTERED`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ values })
    }
  );

  if (!appendRes.ok) {
    const errText = await appendRes.text();
    throw new Error(`Failed to append row to Google Sheet: ${errText}`);
  }

  return { spreadsheetId, success: true };
};

/**
 * GOOGLE SHEETS API: Fetch all certificate records from Sheet for lookup
 */
export const fetchCertificatesFromSheet = async (token) => {
  try {
    const spreadsheetId = await getOrCreateCertificateSpreadsheet(token);
    const res = await fetch(
      `https://www.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Verified Certificates!A2:M1000`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) return [];

    const data = await res.json();
    if (!data.values) return [];

    return data.values.map(row => ({
      certCode: row[0],
      userName: row[1],
      userState: row[2],
      finalScorePercent: parseInt(row[3]) || 100,
      activeTab: row[4]?.includes("NBC") ? "nbc" : "show",
      certDate: row[5],
      status: row[6] || "VERIFIED & ISSUED",
      driveFileId: row[7],
      driveViewUrl: row[8],
      idType: row[10] || null,
      idNumber: row[11] || null,
      driveIdViewUrl: row[12] || null,
      sheetSynced: true
    }));
  } catch (err) {
    console.warn("Could not fetch certificates from Google Sheet", err);
    return [];
  }
};

/**
 * GOOGLE DRIVE API: Get or create "Built to Break Certificates" folder
 */
export const getOrCreateDriveFolder = async (token) => {
  const searchQuery = encodeURIComponent("name = 'Built to Break Certificates' and mimeType = 'application/vnd.google-apps.folder' and trashed = false");
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${searchQuery}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (searchRes.ok) {
    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      return searchData.files[0].id;
    }
  }

  // Create folder
  const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: "Built to Break Certificates",
      mimeType: "application/vnd.google-apps.folder"
    })
  });

  if (!createRes.ok) {
    throw new Error("Failed to create Google Drive folder");
  }

  const folder = await createRes.json();
  return folder.id;
};

/**
 * GOOGLE DRIVE API: Upload certificate PNG image file to Google Drive
 */
export const uploadCertificateToDrive = async (token, base64DataUrl, fileName) => {
  const folderId = await getOrCreateDriveFolder(token);

  // Convert Base64 data URL to Blob
  const base64Data = base64DataUrl.split(",")[1];
  const byteCharacters = atob(base64Data);
  const byteArrays = [];
  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  const fileBlob = new Blob(byteArrays, { type: "image/png" });

  const metadata = {
    name: `${fileName}.png`,
    parents: [folderId],
    mimeType: "image/png"
  };

  const formData = new FormData();
  formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  formData.append("file", fileBlob);

  const uploadRes = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink,webContentLink",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    }
  );

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`Failed to upload to Google Drive: ${errText}`);
  }

  const fileData = await uploadRes.json();

  // Make file publicly viewable with link
  try {
    await fetch(`https://www.googleapis.com/drive/v3/files/${fileData.id}/permissions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ role: "reader", type: "anyone" })
    });
  } catch (e) {
    console.warn("Could not set public permissions on drive file", e);
  }

  return {
    fileId: fileData.id,
    webViewLink: fileData.webViewLink || `https://drive.google.com/file/d/${fileData.id}/view`
  };
};

/**
 * GOOGLE DRIVE API: Find or create a folder named "ID" at the root level of Google Drive
 */
export const getOrCreateDriveIdFolder = async (token) => {
  const searchQuery = encodeURIComponent("name = 'ID' and mimeType = 'application/vnd.google-apps.folder' and trashed = false");
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${searchQuery}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (searchRes.ok) {
    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      return searchData.files[0].id;
    }
  }

  // Create folder
  const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: "ID",
      mimeType: "application/vnd.google-apps.folder"
    })
  });

  if (!createRes.ok) {
    throw new Error("Failed to create 'ID' Google Drive folder");
  }

  const folder = await createRes.json();
  return folder.id;
};

/**
 * GOOGLE DRIVE API: Upload the ID document (image or PDF) to the "ID" folder
 * Filename format: idtype_certCode.extension
 */
export const uploadIdToDrive = async (token, idType, certCode, base64DataUrl) => {
  if (!base64DataUrl) {
    throw new Error("No ID file data provided for upload");
  }

  const folderId = await getOrCreateDriveIdFolder(token);

  // Extract base64 data and mime type
  const match = base64DataUrl.match(/^data:([^;]+);base64,/);
  const mimeType = match ? match[1] : "image/png";
  const base64Data = base64DataUrl.split(",")[1];
  
  // Convert Base64 data to Blob
  const byteCharacters = atob(base64Data);
  const byteArrays = [];
  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  const fileBlob = new Blob(byteArrays, { type: mimeType });

  // Map mimeType to extension
  let extension = "png";
  if (mimeType === "application/pdf") {
    extension = "pdf";
  } else if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
    extension = "jpg";
  } else if (mimeType === "image/webp") {
    extension = "webp";
  }

  // File name format: idtype_certCode.extension
  const fileName = `${idType}_${certCode}.${extension}`;

  const metadata = {
    name: fileName,
    parents: [folderId],
    mimeType: mimeType
  };

  const formData = new FormData();
  formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  formData.append("file", fileBlob);

  const uploadRes = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink,webContentLink",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    }
  );

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`Failed to upload ID file to Google Drive: ${errText}`);
  }

  const fileData = await uploadRes.json();

  // Make the uploaded ID file viewable with link
  try {
    await fetch(`https://www.googleapis.com/drive/v3/files/${fileData.id}/permissions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ role: "reader", type: "anyone" })
    });
  } catch (e) {
    console.warn("Could not set permissions on uploaded ID file", e);
  }

  return {
    fileId: fileData.id,
    webViewLink: fileData.webViewLink || `https://drive.google.com/file/d/${fileData.id}/view`
  };
};

/**
 * Save Certificate to Cloud SQL Database
 */
export const saveCertificateToDb = async (certRecord) => {
  try {
    const currentUser = auth.currentUser;
    const idToken = currentUser ? await currentUser.getIdToken() : null;
    const response = await fetch("/api/certificates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(idToken ? { "Authorization": `Bearer ${idToken}` } : {})
      },
      body: JSON.stringify(certRecord)
    });
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const data = await response.json();
    return data.certificate;
  } catch (error) {
    console.error("Failed to save certificate to SQL database:", error);
    return null;
  }
};

/**
 * Save & Sync Certificate to both local storage AND Google Drive & Sheets
 */
export const syncCertificateRecord = async (token, certRecord, canvasDataUrl) => {
  let driveInfo = { fileId: certRecord.driveFileId || null, webViewLink: certRecord.driveViewUrl || null };
  let driveIdInfo = { fileId: certRecord.driveIdFileId || null, webViewLink: certRecord.driveIdViewUrl || null };

  // 1. Upload Certificate PDF/Image to Drive if canvas available and token present
  if (token && canvasDataUrl) {
    try {
      const fileName = `Certificate_${certRecord.userName.replace(/\s+/g, "_")}_${certRecord.certCode}`;
      driveInfo = await uploadCertificateToDrive(token, canvasDataUrl, fileName);
    } catch (e) {
      console.error("Drive certificate upload failed during sync:", e);
    }
  }

  // 1b. Automatically upload ID photo/PDF to Drive if token, idPhoto, and score >= 85% (Passed) are present
  if (token && certRecord.idPhoto && certRecord.idType && certRecord.finalScorePercent >= 85) {
    try {
      driveIdInfo = await uploadIdToDrive(token, certRecord.idType, certRecord.certCode, certRecord.idPhoto);
      console.log(`[DRIVE ID BACKUP SUCCESS] Stored ID in Google Drive 'ID' folder for cert code ${certRecord.certCode}`);
    } catch (e) {
      console.error("Drive ID photo upload failed during sync:", e);
    }
  }

  const updatedRecord = {
    ...certRecord,
    driveFileId: driveInfo.fileId || certRecord.driveFileId || null,
    driveViewUrl: driveInfo.webViewLink || certRecord.driveViewUrl || null,
    driveIdFileId: driveIdInfo.fileId || certRecord.driveIdFileId || null,
    driveIdViewUrl: driveIdInfo.webViewLink || certRecord.driveIdViewUrl || null,
    status: "VERIFIED & ISSUED",
    sheetSynced: !!token
  };

  // 2. Append row to Google Sheet if token present
  if (token) {
    try {
      await appendCertificateToSheet(token, updatedRecord);
    } catch (e) {
      console.error("Sheet append failed during sync:", e);
    }
  }

  // 3. Save locally
  saveLocalCertificate(updatedRecord);

  // 4. Save to Cloud SQL Database
  await saveCertificateToDb(updatedRecord);

  return updatedRecord;
};

/**
 * Certificate Search & Verification Lookup
 */
export const lookupCertificate = async (certIdInput, token = null) => {
  const cleanId = certIdInput.trim().toUpperCase();
  if (!cleanId) return null;

  // 1. First check local storage
  const localRegistry = getLocalCertRegistry();
  let match = localRegistry.find(
    c => c.certCode?.toUpperCase() === cleanId || 
         c.certCode?.toUpperCase() === `${cleanId}-SHOW` ||
         cleanId.includes(c.certCode?.toUpperCase())
  );

  if (match) {
    // Try to enrich local storage record with live Cloud SQL details (creator name, email, etc.)
    try {
      const sqlRes = await fetch(`/api/certificates/verify/${cleanId}`);
      if (sqlRes.ok) {
        const sqlData = await sqlRes.json();
        if (sqlData.found && sqlData.certificate) {
          return {
            ...match,
            ...sqlData.certificate,
            verifiedSource: "CLOUD_SQL_DATABASE_SECURE"
          };
        }
      }
    } catch (e) {
      console.warn("SQL enrichment failed:", e);
    }
    return { ...match, verifiedSource: "LOCAL_AND_GOOGLE_REGISTRY" };
  }

  // 2. Query Cloud SQL Database (primary verification source for other users)
  try {
    const response = await fetch(`/api/certificates/verify/${cleanId}`);
    if (response.ok) {
      const data = await response.json();
      if (data.found && data.certificate) {
        saveLocalCertificate(data.certificate); // cache locally
        return {
          ...data.certificate,
          verifiedSource: "CLOUD_SQL_DATABASE_SECURE"
        };
      }
    }
  } catch (error) {
    console.error("Cloud SQL certificate lookup failed:", error);
  }

  // 3. If token present, query Google Sheets directly
  if (token) {
    try {
      const sheetRecords = await fetchCertificatesFromSheet(token);
      match = sheetRecords.find(c => c.certCode?.toUpperCase() === cleanId);
      if (match) {
        saveLocalCertificate(match); // cache locally
        return { ...match, verifiedSource: "GOOGLE_SHEETS_LIVE_DATABASE" };
      }
    } catch (e) {
      console.warn("Sheet lookup failed:", e);
    }
  }

  return null;
};
