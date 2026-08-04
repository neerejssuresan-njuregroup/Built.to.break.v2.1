import express, { Request, Response, NextFunction } from "express";

/**
 * Escapes common HTML special characters to mitigate Reflected and Stored XSS.
 */
export function sanitizeString(input: string | null | undefined): string {
  if (!input || typeof input !== "string") return "";
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Recursively sanitizes strings in an object or array.
 */
export function sanitizeObject<T>(obj: T): T {
  if (typeof obj === "string") {
    return sanitizeString(obj) as unknown as T;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item)) as unknown as T;
  }
  if (obj !== null && typeof obj === "object") {
    const sanitizedObj: any = {};
    for (const key of Object.keys(obj as any)) {
      sanitizedObj[key] = sanitizeObject((obj as any)[key]);
    }
    return sanitizedObj;
  }
  return obj;
}

/**
 * Express middleware to sanitize req.body, req.query, and req.params against XSS.
 */
export function xssSanitizerMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === "object") {
    req.query = sanitizeObject(req.query);
  }
  if (req.params && typeof req.params === "object") {
    req.params = sanitizeObject(req.params);
  }
  next();
}

/**
 * Aadhaar / PAN masking helper for DPDP / privacy compliance.
 */
export function maskSensitiveId(idNumber: string | null | undefined, idType: string | null | undefined): string {
  if (!idNumber) return "N/A";
  const clean = idNumber.trim();
  if (clean.length <= 4) return "****";
  
  // Aadhaar format (12 digits) or PAN (10 chars)
  const lastFour = clean.slice(-4);
  const maskedLength = clean.length - 4;
  return "*".repeat(maskedLength) + lastFour;
}
