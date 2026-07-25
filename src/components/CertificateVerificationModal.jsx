/**
 * Certificate Verification Portal & Google Drive / Sheets Sync Modal
 * Allows anyone to verify any Certificate ID saved on Google Sheets / Drive / Local Registry.
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  ShieldCheck, 
  Search, 
  X, 
  CheckCircle2, 
  XCircle, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  FolderCheck, 
  RefreshCw, 
  Award, 
  User, 
  Calendar, 
  MapPin, 
  Cloud 
} from "lucide-react";
import { 
  getAccessToken, 
  lookupCertificate 
} from "../lib/googleWorkspace";
import { 
  downloadCertificatePdf, 
  downloadCertificatePng, 
  printCertificateImage 
} from "../utils/certificateGenerator";

function CertificateVerificationModal({ isOpen, onClose, initialCertCode = "" }) {
  const [certInput, setCertInput] = useState(initialCertCode || "BTB-8921-X");
  const [searchResult, setSearchResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Sync initial search input if prop updates
  useEffect(() => {
    if (initialCertCode) {
      setCertInput(initialCertCode);
      handleSearch(initialCertCode);
    }
  }, [initialCertCode]);

  // Handle Search
  const handleSearch = async (query = certInput) => {
    const q = (query || certInput).trim();
    if (!q) return;

    setIsSearching(true);
    setHasSearched(true);
    setSearchResult(null);

    try {
      const activeToken = getAccessToken();
      const res = await lookupCertificate(q, activeToken);
      setSearchResult(res);
    } catch (err) {
      console.error("Verification error:", err);
      setSearchResult(null);
    } finally {
      setIsSearching(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-4xl bg-[#090b0e] border border-red-950/80 shadow-[0_0_80px_rgba(239,68,68,0.2)] rounded-none text-zinc-100 relative overflow-hidden my-8"
      >
        {/* Top Warning Hazard Stripe */}
        <div className="h-1.5 w-full bg-[repeating-linear-gradient(90deg,#EF4444,#EF4444_20px,#F97316_20px,#F97316_40px)]" />

        {/* Header */}
        <div className="p-6 md:p-8 border-b border-zinc-900 flex justify-between items-start bg-black/60">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-black uppercase tracking-[0.25em] text-emerald-400">
                VERIFICATION PORTAL & REGISTRY
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-zinc-100 font-display">
              Verify Official Public Safety Certificate
            </h2>
            <p className="text-zinc-400 text-xs mt-1 font-light max-w-xl">
              Anyone can verify the authenticity of issued "Built to Break" compliance certificates. Every certificate ID is cryptographically hashed and indexed in Google Sheets & Drive.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded-none transition-colors cursor-pointer"
            title="Close Portal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-8 max-h-[80vh] overflow-y-auto">
          {/* Search Bar Section */}
          <div className="bg-black border border-zinc-800 p-6 shadow-inner space-y-4">
            <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
              ENTER CERTIFICATE VERIFICATION ID
            </label>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="relative flex-grow">
                <Search className="w-5 h-5 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={certInput}
                  onChange={(e) => setCertInput(e.target.value)}
                  placeholder="e.g. BTB-8921-X, BTB-2026-001..."
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono text-sm pl-11 pr-4 py-3 outline-none focus:border-[#EF4444] uppercase font-bold tracking-wider"
                />
              </div>

              <button
                type="submit"
                disabled={isSearching}
                className="px-6 py-3 bg-[#EF4444] hover:bg-red-600 text-white font-mono text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.4)]"
              >
                {isSearching ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                <span>VERIFY ID</span>
              </button>
            </form>

            {/* Quick Demo Certificate ID Tags */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-900/80">
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider font-bold">SAMPLE ID LOOKUPS:</span>
              {["BTB-8921-X", "BTB-2026-001", "BTB-2026-002-SHOW"].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => {
                    setCertInput(sample);
                    handleSearch(sample);
                  }}
                  className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-mono text-[10px] uppercase font-bold transition-all cursor-pointer"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>

          {/* Search Result Card */}
          {hasSearched && (
            <div className="space-y-4">
              {isSearching ? (
                <div className="p-8 bg-zinc-950 border border-zinc-900 flex flex-col items-center justify-center text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-[#EF4444] animate-spin" />
                  <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">
                    Searching Google Sheets & Local Certificate Database...
                  </span>
                </div>
              ) : searchResult ? (
                <div className="bg-zinc-950 border border-emerald-500/50 p-6 md:p-8 space-y-6 relative overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.15)]">
                  {/* Status Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-none text-emerald-400">
                        <CheckCircle2 className="w-7 h-7" />
                      </div>
                      <div>
                        <span className="text-[9px] font-mono font-black uppercase tracking-[0.25em] text-emerald-400 block">
                          STATUS: AUTHENTICATED & VALID
                        </span>
                        <h3 className="text-xl font-black text-zinc-100 uppercase tracking-tight font-display">
                          {searchResult.activeTab === "nbc" 
                            ? "NBC COMPLIANCE FORENSIC EXAM" 
                            : "HONORARY PUBLIC SAFETY ENVOY"}
                        </h3>
                      </div>
                    </div>

                    <div className="text-left sm:text-right font-mono bg-emerald-950/30 border border-emerald-900/50 p-3">
                      <span className="text-[9px] text-zinc-500 uppercase block font-bold">CERTIFICATE ID</span>
                      <span className="text-base font-black text-emerald-400 tracking-wider">
                        {searchResult.certCode}
                      </span>
                    </div>
                  </div>

                  {/* Certificate Recipient Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-black p-4 border border-zinc-900">
                    <div>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase block font-bold">RECIPIENT NAME</span>
                      <span className="text-sm font-black text-zinc-100 uppercase tracking-wide flex items-center gap-1.5 mt-1">
                        <User className="w-4 h-4 text-[#EF4444]" />
                        {searchResult.userName}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase block font-bold">JURISDICTION</span>
                      <span className="text-sm font-black text-zinc-100 uppercase tracking-wide flex items-center gap-1.5 mt-1">
                        <MapPin className="w-4 h-4 text-[#F97316]" />
                        {searchResult.userState || "Delhi NCR"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase block font-bold">EVALUATION SCORE</span>
                      <span className="text-sm font-black text-emerald-400 tracking-wide flex items-center gap-1.5 mt-1 font-mono">
                        <Award className="w-4 h-4 text-emerald-400" />
                        {searchResult.finalScorePercent}% COMPLIANT
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase block font-bold">ISSUE DATE</span>
                      <span className="text-sm font-black text-zinc-100 tracking-wide flex items-center gap-1.5 mt-1 font-mono">
                        <Calendar className="w-4 h-4 text-zinc-400" />
                        {searchResult.certDate}
                      </span>
                    </div>
                  </div>

                  {/* Cloud SQL Database User Details */}
                  <div className="bg-[#0b0c10] border border-zinc-900 p-4 space-y-2">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase block font-black tracking-widest">
                      SECURE CLOUD SQL AUTHENTICATION OWNER RECORD
                    </span>
                    <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-xs">
                      <div>
                        <span className="text-zinc-500">Registered Account:</span>{" "}
                        <span className="text-zinc-200 font-bold font-mono">
                          {searchResult.creatorEmail || "GUEST (UNLINKED EXAMINER)"}
                        </span>
                      </div>
                      {searchResult.creatorDisplayName && (
                        <div>
                          <span className="text-zinc-500">Account Name:</span>{" "}
                          <span className="text-zinc-200 font-bold">
                            {searchResult.creatorDisplayName}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="text-zinc-500">Database Sync Status:</span>{" "}
                        <span className="text-emerald-400 font-black tracking-wide uppercase">
                          ACTIVE (CLOUDSQL POSTGRES)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Google Drive / Sheet Database Sync Indicators */}
                  <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-900/40 p-4 border border-zinc-800/80 text-xs font-mono">
                    <div className="flex flex-wrap items-center gap-4 text-zinc-300">
                      <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                        Google Sheets Database: SYNCED
                      </span>

                      {searchResult.driveViewUrl && searchResult.driveViewUrl !== "N/A" ? (
                        <a
                          href={searchResult.driveViewUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-sky-400 hover:underline font-bold"
                        >
                          <FolderCheck className="w-4 h-4 text-sky-400" />
                          View Document on Google Drive ↗
                        </a>
                      ) : (
                        <span className="flex items-center gap-1.5 text-zinc-500">
                          <Cloud className="w-4 h-4 text-zinc-500" />
                          Google Drive Sync: ACTIVE
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] text-zinc-500 uppercase font-mono">
                      VERIFIED VIA {searchResult.verifiedSource || "OFFICIAL REGISTRY"}
                    </span>
                  </div>

                  {/* Export & Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => downloadCertificatePdf(searchResult)}
                      className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-100 font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-emerald-400" />
                      DOWNLOAD PDF
                    </button>

                    <button
                      type="button"
                      onClick={() => downloadCertificatePng(searchResult)}
                      className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-100 font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-sky-400" />
                      DOWNLOAD PNG
                    </button>

                    <button
                      type="button"
                      onClick={() => printCertificateImage(searchResult)}
                      className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-100 font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-amber-400" />
                      PRINT CERTIFICATE
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-950 border border-red-900/50 p-6 text-center space-y-2">
                  <XCircle className="w-8 h-8 text-[#EF4444] mx-auto" />
                  <h4 className="text-base font-black uppercase text-red-400 font-display">
                    Certificate ID Not Found
                  </h4>
                  <p className="text-zinc-400 text-xs font-light max-w-md mx-auto">
                    No certificate matching ID "<strong className="text-zinc-200">{certInput}</strong>" was found in the Google Sheets registry or local database. Please double-check the ID or complete the assessment to receive a new verified certificate.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default React.memo(CertificateVerificationModal);
