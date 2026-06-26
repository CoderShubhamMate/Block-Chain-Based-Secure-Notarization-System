
const PptxGenJS = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

const pptx = new PptxGenJS();

// ─── Paths ────────────────────────────────────────────────────────────────────
const BASE = path.join(__dirname, "..", "For PPT Images");
const PROOFS = path.join(BASE, "Working Proofs");
const LOGO = path.join(BASE, "college logo.png");
const OUT = path.join(__dirname, "..", "For PPT Images", "BBSNS_Presentation.pptx");

// ─── Theme ────────────────────────────────────────────────────────────────────
const C = {
  navy:    "0A0F2E",   // deep navy background
  blue:    "1A237E",   // slide header bar
  accent:  "2563EB",   // accent blue
  cyan:    "06B6D4",   // highlight / icons
  gold:    "F59E0B",   // gold accent
  white:   "FFFFFF",
  light:   "E8EDF7",   // light text
  gray:    "94A3B8",
  cardBg:  "0F1740",   // card background
  border:  "1E3A8A",
};

pptx.layout = "LAYOUT_16x9";
pptx.author = "BBSNS Capstone Team";
pptx.title  = "Blockchain Based Secure Notarization System";

// ─── Helper: add decorative corner dots ───────────────────────────────────────
function addCornerAccents(slide) {
  const corners = [
    { x: 0,    y: 0,    w: 0.18, h: 0.18 },
    { x: 9.82, y: 0,    w: 0.18, h: 0.18 },
    { x: 0,    y: 5.32, w: 0.18, h: 0.18 },
    { x: 9.82, y: 5.32, w: 0.18, h: 0.18 },
  ];
  corners.forEach(c => {
    slide.addShape(pptx.ShapeType.rect, {
      x: c.x, y: c.y, w: c.w, h: c.h,
      fill: { color: C.cyan },
      line: { color: C.cyan },
    });
  });
}

// ─── Helper: full-bleed gradient background ───────────────────────────────────
function addBg(slide, color1 = C.navy, color2 = C.blue) {
  slide.background = { color: color1 };
  // Top header band
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 10, h: 0.9,
    fill: { color: color2 },
    line: { color: color2 },
  });
  // Bottom accent line
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 5.32, w: 10, h: 0.18,
    fill: { color: C.cyan },
    line: { color: C.cyan },
  });
  addCornerAccents(slide);
}

// ─── Helper: section header text ─────────────────────────────────────────────
function addHeader(slide, text) {
  slide.addText(text, {
    x: 0.15, y: 0.08, w: 9.7, h: 0.75,
    fontSize: 22, bold: true, color: C.white,
    fontFace: "Calibri",
    align: "left", valign: "middle",
  });
}

// ─── Helper: add logo top-right ───────────────────────────────────────────────
function addLogo(slide) {
  if (fs.existsSync(LOGO)) {
    slide.addImage({ path: LOGO, x: 9.1, y: 0.08, w: 0.72, h: 0.72 });
  }
}

// ─── Helper: screenshot card ─────────────────────────────────────────────────
function addScreenshot(slide, imgFile, x, y, w, h, caption = "") {
  const imgPath = path.join(PROOFS, imgFile);
  if (!fs.existsSync(imgPath)) { console.warn("Missing:", imgPath); return; }
  // card shadow box
  slide.addShape(pptx.ShapeType.rect, {
    x: x - 0.04, y: y - 0.04, w: w + 0.08, h: h + (caption ? 0.38 : 0.08),
    fill: { color: C.cardBg },
    line: { color: C.border, pt: 1.5 },
  });
  slide.addImage({ path: imgPath, x, y, w, h });
  if (caption) {
    slide.addText(caption, {
      x: x - 0.04, y: y + h + 0.02, w: w + 0.08, h: 0.28,
      fontSize: 8.5, color: C.gray, align: "center", fontFace: "Calibri",
    });
  }
}

// ─── Helper: bullet text block ────────────────────────────────────────────────
function addBullets(slide, items, x, y, w, h, startSize = 13) {
  const rows = items.map(item => ({
    text: item.text || item,
    options: {
      bullet: item.bullet !== false ? { type: "bullet", indent: 15 } : false,
      fontSize: item.size || startSize,
      color: item.color || C.light,
      bold: item.bold || false,
      breakLine: true,
    },
  }));
  slide.addText(rows, {
    x, y, w, h,
    fontFace: "Calibri",
    valign: "top",
    margin: 6,
  });
}

// ─── Helper: info card ────────────────────────────────────────────────────────
function addInfoCard(slide, title, bullets, x, y, w, h, accent = C.accent) {
  slide.addShape(pptx.ShapeType.rect, {
    x, y, w, h,
    fill: { color: C.cardBg },
    line: { color: accent, pt: 1.5 },
  });
  // left accent bar
  slide.addShape(pptx.ShapeType.rect, {
    x, y, w: 0.06, h,
    fill: { color: accent },
    line: { color: accent },
  });
  slide.addText(title, {
    x: x + 0.12, y: y + 0.04, w: w - 0.15, h: 0.32,
    fontSize: 12, bold: true, color: accent, fontFace: "Calibri",
  });
  const txt = bullets.map(b => ({
    text: (typeof b === "string" ? b : b.text),
    options: {
      bullet: { type: "bullet", indent: 12 },
      fontSize: typeof b === "object" && b.size ? b.size : 10.5,
      color: C.light,
      breakLine: true,
    },
  }));
  slide.addText(txt, {
    x: x + 0.12, y: y + 0.38, w: w - 0.18, h: h - 0.44,
    fontFace: "Calibri", valign: "top", margin: 2,
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 1 — TITLE SLIDE
// ══════════════════════════════════════════════════════════════════════════════
{
  const sl = pptx.addSlide();
  sl.background = { color: C.navy };

  // Large gradient rectangle
  sl.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 10, h: 5.5,
    fill: { color: C.navy },
    line: { color: C.navy },
  });
  // Decorative left bar
  sl.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 0.35, h: 5.5,
    fill: { color: C.accent },
    line: { color: C.accent },
  });
  // Decorative right bar
  sl.addShape(pptx.ShapeType.rect, {
    x: 9.65, y: 0, w: 0.35, h: 5.5,
    fill: { color: C.cyan },
    line: { color: C.cyan },
  });
  // Bottom accent strip
  sl.addShape(pptx.ShapeType.rect, {
    x: 0, y: 5.0, w: 10, h: 0.5,
    fill: { color: C.blue },
    line: { color: C.blue },
  });

  // College logo
  if (fs.existsSync(LOGO)) {
    sl.addImage({ path: LOGO, x: 0.55, y: 0.12, w: 1.05, h: 1.05 });
  }

  // College name
  sl.addText("Matoshri College of Engineering & Research Centre, Nashik", {
    x: 1.7, y: 0.15, w: 7.5, h: 0.5,
    fontSize: 13, bold: true, color: C.gold,
    fontFace: "Calibri", align: "left",
  });
  sl.addText("Department of Computer Engineering", {
    x: 1.7, y: 0.62, w: 7.5, h: 0.38,
    fontSize: 11, color: C.gray,
    fontFace: "Calibri", align: "left",
  });

  // Horizontal divider
  sl.addShape(pptx.ShapeType.line, {
    x: 0.5, y: 1.18, w: 9, h: 0,
    line: { color: C.accent, pt: 1.5, dashType: "solid" },
  });

  // Project badge
  sl.addShape(pptx.ShapeType.rect, {
    x: 2.5, y: 1.3, w: 5, h: 0.4,
    fill: { color: C.accent },
    line: { color: C.accent },
  });
  sl.addText("FINAL YEAR CAPSTONE PROJECT — 2025–26", {
    x: 2.5, y: 1.3, w: 5, h: 0.4,
    fontSize: 10.5, bold: true, color: C.white,
    fontFace: "Calibri", align: "center", valign: "middle",
  });

  // Main Title
  sl.addText("Block-Chain Based\nSecure Notarization System", {
    x: 0.5, y: 1.8, w: 9, h: 1.5,
    fontSize: 34, bold: true, color: C.white,
    fontFace: "Calibri", align: "center", valign: "middle",
    charSpacing: 1,
  });

  // Subtitle
  sl.addText("BBSNS — A Zero-Trust Platform for Digital Notarization", {
    x: 0.5, y: 3.3, w: 9, h: 0.42,
    fontSize: 14, color: C.cyan, fontFace: "Calibri", align: "center",
    italic: true,
  });

  // Divider
  sl.addShape(pptx.ShapeType.line, {
    x: 1.5, y: 3.78, w: 7, h: 0,
    line: { color: C.accent, pt: 1 },
  });

  // Students
  sl.addText(
    "Adhude Ganesh Sanjay [B400580365]    Mate Shubham Vilas [B400580398]\n" +
    "Shaikh Humera Ibrahim [B400580414]    Shivale Bhakti Bhagwan [B400580419]",
    {
      x: 0.5, y: 3.88, w: 9, h: 0.7,
      fontSize: 11.5, color: C.light, fontFace: "Calibri", align: "center",
    }
  );

  // Guide
  sl.addText("Project Guide: Mrs. Riya B. Shikare", {
    x: 0.5, y: 4.65, w: 9, h: 0.3,
    fontSize: 11, color: C.gold, fontFace: "Calibri", align: "center",
    bold: true,
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 2 — PROJECT OVERVIEW
// ══════════════════════════════════════════════════════════════════════════════
{
  const sl = pptx.addSlide();
  addBg(sl);
  addLogo(sl);
  addHeader(sl, "📋  Project Overview");

  sl.addText("What is BBSNS?", {
    x: 0.3, y: 1.0, w: 9.4, h: 0.38,
    fontSize: 16, bold: true, color: C.cyan, fontFace: "Calibri",
  });

  sl.addText(
    "BBSNS is a full-stack, enterprise-grade decentralized platform that digitizes the traditional notary system. " +
    "It replaces paper-based trust with immutable cryptographic proof by combining biometric identity, " +
    "gasless blockchain signatures, cloud document storage, and multi-signature governance on BNB Smart Chain.",
    {
      x: 0.3, y: 1.42, w: 9.4, h: 0.85,
      fontSize: 12, color: C.light, fontFace: "Calibri", align: "justify",
    }
  );

  // 3 problem-solution cards
  const cards = [
    {
      title: "❌  The Problem",
      points: [
        "Paper-based notarization is slow & fraud-prone",
        "Forged documents are hard to detect",
        "No public verification mechanism",
        "Manual processes lack auditability",
      ],
      color: "#E53935",
    },
    {
      title: "✅  Our Solution",
      points: [
        "SHA-256 document fingerprinting on blockchain",
        "Biometric + wallet identity verification",
        "Public hash-based document verification",
        "Immutable on-chain audit trail",
      ],
      color: C.accent,
    },
    {
      title: "🎯  Key Objective",
      points: [
        "Zero-trust architecture end-to-end",
        "Gasless EIP-712 signatures for non-technical users",
        "Multi-sig governance for system parameters",
        "Self-healing background workers for reliability",
      ],
      color: C.cyan,
    },
  ];

  cards.forEach((c, i) => {
    addInfoCard(sl, c.title, c.points, 0.22 + i * 3.22, 2.38, 3.05, 2.75, c.color.replace("#", ""));
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 3 — TECHNOLOGY STACK
// ══════════════════════════════════════════════════════════════════════════════
{
  const sl = pptx.addSlide();
  addBg(sl);
  addLogo(sl);
  addHeader(sl, "⚙️  Technology Stack");

  const techRows = [
    { layer: "Web Client",      tech: "Next.js 14 / React",           purpose: "Server-side rendered portal for Document Owners" },
    { layer: "Desktop Client",  tech: "Electron",                     purpose: "Isolated, sandboxed Notary console" },
    { layer: "Core API",        tech: "Node.js / Express.js",         purpose: "Asynchronous orchestration & cryptographic relay" },
    { layer: "Smart Contracts", tech: "Solidity / Hardhat",           purpose: "Immutable, decentralized source of truth" },
    { layer: "Blockchain",      tech: "BNB Smart Chain (BSC Testnet)", purpose: "Multi-sig governance & token economy" },
    { layer: "Database",        tech: "PostgreSQL",                   purpose: "Fast relational querying & state caching" },
    { layer: "Blob Storage",    tech: "AWS S3",                       purpose: "Immutable document vaulting with Object Lock" },
    { layer: "Background Jobs", tech: "Custom Node Workers",          purpose: "Self-healing state reconciliation & cleanup" },
  ];

  // Table header
  const colX = [0.25, 2.15, 4.45];
  const colW = [1.85, 2.25, 5.2];

  ["Layer", "Technology", "Purpose"].forEach((h, i) => {
    sl.addShape(pptx.ShapeType.rect, {
      x: colX[i], y: 0.95, w: colW[i], h: 0.38,
      fill: { color: C.accent },
      line: { color: C.border },
    });
    sl.addText(h, {
      x: colX[i] + 0.06, y: 0.95, w: colW[i] - 0.08, h: 0.38,
      fontSize: 11, bold: true, color: C.white, fontFace: "Calibri", valign: "middle",
    });
  });

  techRows.forEach((row, i) => {
    const y = 1.35 + i * 0.49;
    const bg = i % 2 === 0 ? C.cardBg : C.navy;
    [colX, colW].forEach(() => {});
    [0, 1, 2].forEach(ci => {
      sl.addShape(pptx.ShapeType.rect, {
        x: colX[ci], y, w: colW[ci], h: 0.47,
        fill: { color: bg },
        line: { color: C.border },
      });
    });
    const vals = [row.layer, row.tech, row.purpose];
    const clrs = [C.cyan, C.gold, C.light];
    vals.forEach((v, ci) => {
      sl.addText(v, {
        x: colX[ci] + 0.06, y: y + 0.04, w: colW[ci] - 0.1, h: 0.38,
        fontSize: 10, color: clrs[ci], fontFace: "Calibri", valign: "middle",
        bold: ci === 0,
      });
    });
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 4 — SYSTEM ARCHITECTURE
// ══════════════════════════════════════════════════════════════════════════════
{
  const sl = pptx.addSlide();
  addBg(sl);
  addLogo(sl);
  addHeader(sl, "🏗️  System Architecture");

  // Layer boxes
  const layers = [
    { label: "🌐 FRONTEND LAYER",     items: ["Next.js Web Portal (Owner)", "Electron Desktop Console (Notary)"],     color: C.accent,  x: 0.2,  w: 2.6 },
    { label: "☁️ APPLICATION LAYER",  items: ["Core API (Node/Express)", "Background Workers", "AWS S3 Storage"],     color: "0E7490", x: 2.95, w: 2.6 },
    { label: "⛓️ BLOCKCHAIN LAYER",   items: ["NTKR Token Contract", "Registry Contract", "Multi-Sig Governor"],     color: C.cyan,   x: 5.7,  w: 2.6 },
    { label: "🗄️ DATA LAYER",         items: ["PostgreSQL (documents, users)", "Upload Intents Table", "Audit Logs"], color: C.gold,   x: 8.45, w: 1.3 },
  ];

  layers.forEach(layer => {
    sl.addShape(pptx.ShapeType.rect, {
      x: layer.x, y: 1.0, w: layer.w, h: 3.9,
      fill: { color: C.cardBg },
      line: { color: layer.color, pt: 2 },
    });
    sl.addShape(pptx.ShapeType.rect, {
      x: layer.x, y: 1.0, w: layer.w, h: 0.45,
      fill: { color: layer.color },
      line: { color: layer.color },
    });
    sl.addText(layer.label, {
      x: layer.x + 0.05, y: 1.0, w: layer.w - 0.08, h: 0.45,
      fontSize: 9, bold: true, color: C.white, fontFace: "Calibri",
      valign: "middle", align: "center",
    });
    layer.items.forEach((item, ii) => {
      sl.addShape(pptx.ShapeType.rect, {
        x: layer.x + 0.12, y: 1.6 + ii * 0.7, w: layer.w - 0.24, h: 0.54,
        fill: { color: C.navy },
        line: { color: layer.color, pt: 1 },
      });
      sl.addText(item, {
        x: layer.x + 0.15, y: 1.6 + ii * 0.7, w: layer.w - 0.28, h: 0.54,
        fontSize: 9.5, color: C.light, fontFace: "Calibri",
        valign: "middle", align: "center",
      });
    });
  });

  // Arrows between layers
  [[2.8, 3.0], [5.55, 3.0], [8.3, 3.0]].forEach(([x, y]) => {
    sl.addShape(pptx.ShapeType.rightArrow, {
      x, y: 2.65, w: 0.2, h: 0.22,
      fill: { color: C.cyan },
      line: { color: C.cyan },
    });
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 5 — DOCUMENT OWNER FLOW (with screenshots)
// ══════════════════════════════════════════════════════════════════════════════
{
  const sl = pptx.addSlide();
  addBg(sl);
  addLogo(sl);
  addHeader(sl, "👤  Document Owner Flow");

  // Steps list
  const steps = [
    "1️⃣  Register with Email + National ID + MetaMask Wallet",
    "2️⃣  Sign up biometric check (face recognition)",
    "3️⃣  Wallet binding: Cryptographic signature for identity",
    "4️⃣  Log in with 3-factor auth (Email + Password + National ID + Wallet)",
    "5️⃣  Upload document → system hashes it locally (SHA-256)",
    "6️⃣  Buy NTKR tokens → burn tokens to pay notarization fee",
    "7️⃣  Track document status → Receive verifiable PDF certificate",
  ];

  sl.addText(steps.map(s => ({ text: s, options: { bullet: false, breakLine: true, fontSize: 10.5, color: C.light } })), {
    x: 0.25, y: 0.95, w: 4.2, h: 4.3,
    fontFace: "Calibri", valign: "top", margin: 4,
  });

  // Screenshots
  addScreenshot(sl, "Owner Sign Up Completed.png",   4.6,  0.95, 2.65, 1.75, "Sign-up Completed");
  addScreenshot(sl, "Owner Dashboard.png",            4.6,  2.9,  2.65, 1.75, "Owner Dashboard");
  addScreenshot(sl, "Owner Buying NTKR Token.png",   7.4,  0.95, 2.4,  1.75, "Buying NTKR Tokens");
  addScreenshot(sl, "Owners Final Document Verifiable Certificate.png", 7.4, 2.9, 2.4, 1.75, "Notarization Certificate");
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 6 — REGISTRATION & IDENTITY (Screenshots)
// ══════════════════════════════════════════════════════════════════════════════
{
  const sl = pptx.addSlide();
  addBg(sl);
  addLogo(sl);
  addHeader(sl, "🔐  Secure Registration & Identity Verification");

  addScreenshot(sl, "Owner sign up Step 3 Biometric Check .png",     0.2,  0.95, 4.5,  2.25, "Step 3: Biometric Face Check");
  addScreenshot(sl, "Owner Sign up step 4 Wallet binding.png",       4.85, 0.95, 4.9,  2.25, "Step 4: Wallet Binding");
  addScreenshot(sl, "Owner Sign up Step 4 Signature For Confirmation.png", 0.2, 3.32, 4.5, 2.0, "Step 4b: Signature Confirmation");
  addScreenshot(sl, "Owner Sign In Signature.png",                   4.85, 3.32, 4.9,  2.0, "Sign-In: Cryptographic Signature");
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 7 — DOCUMENT UPLOAD & TOKENOMICS
// ══════════════════════════════════════════════════════════════════════════════
{
  const sl = pptx.addSlide();
  addBg(sl);
  addLogo(sl);
  addHeader(sl, "📤  Document Upload & NTKR Token Economy");

  addScreenshot(sl, "Owner Document Upload Process And NTKR BURN.png", 0.2, 0.95, 4.55, 2.35, "Upload + NTKR Burn Process");
  addScreenshot(sl, "Notarize Document And Pay NTK.png",               4.9, 0.95, 4.9,  2.35, "Notarize & Pay NTKR");
  addScreenshot(sl, "Ower NTKR Burn Transaction Confirmed.png",        0.2, 3.42, 4.55, 2.0,  "NTKR Burn Tx Confirmed");
  addScreenshot(sl, "Owner Dashboard Document Status changed to approved.png", 4.9, 3.42, 4.9, 2.0, "Document Status: Approved");
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 8 — NOTARY REGISTRATION & ACTIVATION
// ══════════════════════════════════════════════════════════════════════════════
{
  const sl = pptx.addSlide();
  addBg(sl);
  addLogo(sl);
  addHeader(sl, "📝  Notary Registration & Account Activation");

  addScreenshot(sl, "Notary Register Phase 1.png",          0.2,  0.95, 3.1, 2.1, "Phase 1: Basic Info");
  addScreenshot(sl, "Notary Register Phase 2.png",          3.45, 0.95, 3.1, 2.1, "Phase 2: Document Upload");
  addScreenshot(sl, "Notary Register Phase 3.png",          6.7,  0.95, 3.1, 2.1, "Phase 3: Wallet Binding");
  addScreenshot(sl, "Notary Email For Activation Of Account.png", 0.2, 3.22, 3.1, 2.1, "Activation Email Received");
  addScreenshot(sl, "Notary Wallet Confirmation Before Activation.png", 3.45, 3.22, 3.1, 2.1, "Wallet Confirmation");
  addScreenshot(sl, "Notary Account Activation Confirmed.png", 6.7, 3.22, 3.1, 2.1, "Account Activated");
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 9 — NOTARY LOGIN (Multi-Step)
// ══════════════════════════════════════════════════════════════════════════════
{
  const sl = pptx.addSlide();
  addBg(sl);
  addLogo(sl);
  addHeader(sl, "🔑  Notary Secure Login (Multi-Step Authentication)");

  addScreenshot(sl, "Notary Login Step 1.png",   0.2,  0.95, 4.65, 2.25, "Step 1: Credentials");
  addScreenshot(sl, "Notary Login Step 2.png",   5.05, 0.95, 4.75, 2.25, "Step 2: 2FA");
  addScreenshot(sl, "Notary Login Step 3.1.png", 0.2,  3.32, 4.65, 2.1,  "Step 3.1: Biometric Verify");
  addScreenshot(sl, "Notary Login Step 3.2.png", 5.05, 3.32, 4.75, 2.1,  "Step 3.2: Wallet Signature");
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 10 — NOTARY WORKFLOW
// ══════════════════════════════════════════════════════════════════════════════
{
  const sl = pptx.addSlide();
  addBg(sl);
  addLogo(sl);
  addHeader(sl, "✅  Notary Dashboard & Notarization Workflow");

  addScreenshot(sl, "Notary Pending Work.png",                              0.2,  0.95, 4.65, 2.25, "Pending Documents Queue");
  addScreenshot(sl, "Notary Action View Document for Notarisation.png",    5.05, 0.95, 4.75, 2.25, "Review Document Details");
  addScreenshot(sl, "Notary Process Info about document to approve it.png",0.2,  3.32, 4.65, 2.1,  "Process: Document Approval Info");
  addScreenshot(sl, "Notary Approved View.png",                            5.05, 3.32, 4.75, 2.1,  "Document Approved View");
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 11 — ADMIN PANEL
// ══════════════════════════════════════════════════════════════════════════════
{
  const sl = pptx.addSlide();
  addBg(sl);
  addLogo(sl);
  addHeader(sl, "🛡️  Admin Control Panel — Notary Governance");

  addScreenshot(sl, "Admin Dashboard Notary Application Pending Screen.png", 0.2,  0.95, 4.65, 2.25, "Pending Notary Applications");
  addScreenshot(sl, "Admin Dashboard Notary Application Details.png",        5.05, 0.95, 4.75, 2.25, "Applicant Detail Review");
  addScreenshot(sl, "Admin Finalizing Notary Role Onchain .png",             0.2,  3.32, 4.65, 2.1,  "On-Chain Role Assignment");
  addScreenshot(sl, "Admin Dashboard Notary Role Applied onchain confirmed.png", 5.05, 3.32, 4.75, 2.1, "Role Confirmed On-Chain");
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 12 — BLOCKCHAIN PROOF & VERIFICATION
// ══════════════════════════════════════════════════════════════════════════════
{
  const sl = pptx.addSlide();
  addBg(sl);
  addLogo(sl);
  addHeader(sl, "⛓️  Blockchain Evidence & Public Verification");

  addScreenshot(sl, "6 All Contract and Deployer.png",                          0.2,  0.95, 4.65, 2.25, "Smart Contract Transactions on BscScan");
  addScreenshot(sl, "z BBSNS Verification Of Document Hash For Tempering.png", 5.05, 0.95, 4.75, 2.25, "SHA-256 Hash Public Verification");
  addScreenshot(sl, "Owners Final Document Verifiable Certificate.png",         0.2,  3.32, 4.65, 2.1,  "Verifiable Certificate of Notarization");
  addScreenshot(sl, "Digital Certificate of confirmation .png",                 5.05, 3.32, 4.75, 2.1,  "Digital Certificate Issued");
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 13 — CLOUD INFRASTRUCTURE & DEPLOYMENT
// ══════════════════════════════════════════════════════════════════════════════
{
  const sl = pptx.addSlide();
  addBg(sl);
  addLogo(sl);
  addHeader(sl, "☁️  Cloud Deployment & Infrastructure Proof");

  addScreenshot(sl, "1 Cloud Connection.png",         0.2,  0.95, 4.65, 2.25, "AWS EC2 SSH Connection (Ubuntu 22.04)");
  addScreenshot(sl, "2 Running Processes On Cloud.png", 5.05, 0.95, 4.75, 2.25, "Running Processes (PM2 Cluster)");
  addScreenshot(sl, "3 Backend Runtime Logs.png",     0.2,  3.32, 4.65, 2.1,  "Live Backend Runtime Logs");
  addScreenshot(sl, "4 Api Health check.png",         5.05, 3.32, 4.75, 2.1,  "API Health Check Response");
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 14 — DATABASE & SECURITY
// ══════════════════════════════════════════════════════════════════════════════
{
  const sl = pptx.addSlide();
  addBg(sl);
  addLogo(sl);
  addHeader(sl, "🗄️  Database Schema & Security Architecture");

  // Screenshot left
  addScreenshot(sl, "5 DB List of relations.png", 0.2, 0.95, 4.65, 2.35, "PostgreSQL: Database Relations");

  // Security features right
  const secFeatures = [
    { title: "SHA-256 Document Sealing", pts: ["Documents hashed locally before upload", "Only hash stored on-chain, never the file"] },
    { title: "EIP-712 ECDSA Signatures",  pts: ["Off-chain structured data signing", "Gasless relay to blockchain via API"] },
    { title: "Zero-Trust Middleware",     pts: ["Every API route verified server-side", "wallet_address recovery from signature"] },
    { title: "AWS S3 Object Lock",        pts: ["Immutable document storage", "UUID-based S3 key — no filename exposure"] },
  ];
  secFeatures.forEach((f, i) => {
    addInfoCard(sl, f.title, f.pts, 5.05 + (i % 2) * 2.45, 0.95 + Math.floor(i / 2) * 1.68, 2.35, 1.55, i % 2 === 0 ? C.accent : C.cyan);
  });

  // DB schema notes bottom
  sl.addText(
    "Key Tables: users  •  documents  •  upload_intents  •  notary_applications  •  audit_logs",
    {
      x: 0.2, y: 3.38, w: 9.6, h: 0.42,
      fontSize: 10.5, color: C.gold, fontFace: "Calibri", align: "center",
      bold: true,
    }
  );

  addScreenshot(sl, "Notary Application Created.png", 0.2, 3.88, 4.65, 1.45, "Notary Application in DB");
  addScreenshot(sl, "Notary Approved View.png",       5.05, 3.88, 4.75, 1.45, "Approved Document Record");
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 15 — SECURITY DEEP DIVE
// ══════════════════════════════════════════════════════════════════════════════
{
  const sl = pptx.addSlide();
  addBg(sl);
  addLogo(sl);
  addHeader(sl, "🔒  Security Architecture — Zero-Trust Design");

  const items = [
    { title: "3-Factor Authentication (Owners)", pts: ["Email + Password", "National ID (normalized)", "MetaMask Wallet Signature (EIP-712)"], color: C.accent },
    { title: "Biometric Identity Lock (Notaries)",  pts: ["Face recognition at every login", "Biometric state stored separately", "Cannot login without passing check"], color: "7C3AED" },
    { title: "Immutable Blockchain Evidence",       pts: ["SHA-256 hash sealed on BNB Smart Chain", "Smart contract cannot be altered post-deploy", "BscScan public explorer audit trail"], color: C.cyan },
    { title: "Multi-Sig Governance",               pts: ["3-of-N keys required for role changes", "No single admin has full control", "On-chain Notary role assignment voted"], color: C.gold },
    { title: "Document Storage Security",          pts: ["S3 pre-signed URLs (time-limited)", "UUID-based keys — filenames never exposed", "Object Lock prevents deletion"], color: "0E7490" },
    { title: "Background Worker Integrity",        pts: ["Scavenger worker reconciles DB vs chain", "Promotes intents only on confirmed payment", "No manual intervention required"], color: "BE185D" },
  ];

  items.forEach((item, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    addInfoCard(sl, item.title, item.pts, 0.18 + col * 3.25, 1.0 + row * 2.2, 3.1, 2.05, item.color);
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 16 — COMPLETE WORKFLOW (State Machine)
// ══════════════════════════════════════════════════════════════════════════════
{
  const sl = pptx.addSlide();
  addBg(sl);
  addLogo(sl);
  addHeader(sl, "🔄  End-to-End Document Lifecycle State Machine");

  const states = [
    { label: "Upload\nInitiated",    icon: "📤", color: C.accent },
    { label: "Storage\nSecured",     icon: "☁️",  color: "0E7490" },
    { label: "Payment\nVerified",    icon: "💰",  color: C.gold   },
    { label: "Awaiting\nNotary",     icon: "⏳",  color: "7C3AED" },
    { label: "Signing\nIn Progress", icon: "✍️",  color: "BE185D" },
    { label: "On-Chain\nFinalized",  icon: "⛓️",  color: C.cyan   },
  ];

  const startX = 0.35;
  const boxW   = 1.42;
  const gapX   = 0.22;

  states.forEach((st, i) => {
    const x = startX + i * (boxW + gapX);
    sl.addShape(pptx.ShapeType.rect, {
      x, y: 1.25, w: boxW, h: 1.55,
      fill: { color: C.cardBg },
      line: { color: st.color, pt: 2 },
    });
    sl.addShape(pptx.ShapeType.rect, {
      x, y: 1.25, w: boxW, h: 0.5,
      fill: { color: st.color },
      line: { color: st.color },
    });
    sl.addText(st.icon, {
      x, y: 1.25, w: boxW, h: 0.5,
      fontSize: 18, align: "center", valign: "middle",
    });
    sl.addText(st.label, {
      x: x + 0.05, y: 1.8, w: boxW - 0.1, h: 0.95,
      fontSize: 10.5, bold: true, color: C.light,
      fontFace: "Calibri", align: "center", valign: "middle",
    });
    // Arrow
    if (i < states.length - 1) {
      sl.addShape(pptx.ShapeType.rightArrow, {
        x: x + boxW + 0.03, y: 1.75, w: gapX + 0.06, h: 0.3,
        fill: { color: C.gray },
        line: { color: C.gray },
      });
    }
  });

  // Description below
  const descs = [
    "Owner uploads document. SHA-256 hash generated locally. Upload intent created in DB.",
    "File transferred to AWS S3 via pre-signed URL. UUID-based storage key assigned.",
    "NTKR token payment verified on-chain. Intent locked. Awaiting notary assignment.",
    "Document visible in Notary console. Notary reviews PDF and metadata securely.",
    "Notary signs EIP-712 payload off-chain. Signature relayed to smart contract.",
    "Transaction confirmed on BNB Smart Chain. PDF certificate issued. Record immutable.",
  ];

  states.forEach((st, i) => {
    const x = startX + i * (boxW + gapX);
    sl.addShape(pptx.ShapeType.rect, {
      x, y: 3.0, w: boxW, h: 2.3,
      fill: { color: C.navy },
      line: { color: st.color, pt: 1 },
    });
    sl.addText(descs[i], {
      x: x + 0.06, y: 3.05, w: boxW - 0.1, h: 2.18,
      fontSize: 8.5, color: C.gray, fontFace: "Calibri",
      valign: "top", align: "center",
    });
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 17 — NOTARY APPLICATION FLOW
// ══════════════════════════════════════════════════════════════════════════════
{
  const sl = pptx.addSlide();
  addBg(sl);
  addLogo(sl);
  addHeader(sl, "🧑‍⚖️  Notary Application & On-Chain Role Assignment Flow");

  addScreenshot(sl, "Notary Application Created.png",                                0.2,  0.95, 4.65, 2.2, "Notary Application Submitted");
  addScreenshot(sl, "Admin Dashboard Notary Role Applied onchain confirmed.png",     5.05, 0.95, 4.75, 2.2, "Admin: On-Chain Role Assigned");
  addScreenshot(sl, "Notary Account Activation.png",                                 0.2,  3.28, 4.65, 2.1, "Notary: Account Activation Screen");
  addScreenshot(sl, "Notary Account Activation Confirmed.png",                       5.05, 3.28, 4.75, 2.1, "Notary: Activation Confirmed");
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 18 — AFTER NOTARIZATION EVIDENCE
// ══════════════════════════════════════════════════════════════════════════════
{
  const sl = pptx.addSlide();
  addBg(sl);
  addLogo(sl);
  addHeader(sl, "📜  After Notarization — On-Chain Transaction Evidence");

  const afterDir = path.join(PROOFS, "After Notarisation Processes");
  const afterFiles = [
    "Screenshot 2026-05-23 191231.png",
    "Screenshot 2026-05-23 191251.png",
    "Screenshot 2026-05-23 191332.png",
    "Screenshot 2026-05-23 191423.png",
    "Screenshot 2026-05-23 191911.png",
    "Screenshot 2026-05-23 191937.png",
  ];

  const captions = [
    "On-Chain Tx Hash", "Block Confirmation", "Contract Interaction",
    "Token Transfer Record", "Hash Stored On-Chain", "Finalization Event",
  ];

  afterFiles.forEach((f, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const imgPath = path.join(afterDir, f);
    if (!fs.existsSync(imgPath)) return;
    const x = 0.2 + col * 3.26;
    const y = 0.95 + row * 2.4;
    sl.addShape(pptx.ShapeType.rect, {
      x: x - 0.04, y: y - 0.04, w: 3.1 + 0.08, h: 2.12 + 0.04,
      fill: { color: C.cardBg },
      line: { color: C.border, pt: 1.5 },
    });
    sl.addImage({ path: imgPath, x, y, w: 3.1, h: 1.82 });
    sl.addText(captions[i], {
      x: x - 0.04, y: y + 1.85, w: 3.18, h: 0.28,
      fontSize: 8.5, color: C.gray, align: "center", fontFace: "Calibri",
    });
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 19 — FEATURES SUMMARY
// ══════════════════════════════════════════════════════════════════════════════
{
  const sl = pptx.addSlide();
  addBg(sl);
  addLogo(sl);
  addHeader(sl, "✨  Key Features & Innovation Highlights");

  const features = [
    { icon: "🔑", title: "Zero-Trust Auth",       desc: "3-factor auth with biometric + wallet binding — every actor cryptographically verified" },
    { icon: "⛓️", title: "On-Chain Finality",     desc: "Document hashes permanently sealed on BNB Smart Chain — immutable & publicly auditable" },
    { icon: "💸", title: "Gasless Signing",        desc: "EIP-712 off-chain signatures relayed by API — non-technical users need no ETH for gas" },
    { icon: "☁️", title: "Secure Cloud Vault",    desc: "AWS S3 with Object Lock — UUID-keyed storage, time-limited signed URLs, no filename exposure" },
    { icon: "🤖", title: "Self-Healing Workers",  desc: "Background reconciliation workers auto-sync DB with blockchain — zero manual intervention" },
    { icon: "🏛️", title: "Multi-Sig Governance", desc: "Decentralized admin control — critical role changes require consensus among governance keys" },
    { icon: "📋", title: "Audit Trail",           desc: "Every action generates an immutable forensic log — full compliance-grade accountability" },
    { icon: "📜", title: "Verifiable Certificate",desc: "PDF certificate with QR code — public verification via SHA-256 hash without trusting BBSNS" },
  ];

  features.forEach((f, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = 0.18 + col * 2.45;
    const y = 1.0  + row * 2.15;
    sl.addShape(pptx.ShapeType.rect, {
      x, y, w: 2.35, h: 2.0,
      fill: { color: C.cardBg },
      line: { color: C.accent, pt: 1 },
    });
    sl.addText(f.icon, {
      x, y: y + 0.1, w: 2.35, h: 0.55,
      fontSize: 24, align: "center",
    });
    sl.addText(f.title, {
      x: x + 0.08, y: y + 0.65, w: 2.2, h: 0.36,
      fontSize: 11, bold: true, color: C.cyan, fontFace: "Calibri", align: "center",
    });
    sl.addText(f.desc, {
      x: x + 0.08, y: y + 1.02, w: 2.2, h: 0.9,
      fontSize: 8.5, color: C.light, fontFace: "Calibri", align: "center", valign: "top",
    });
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 20 — CONCLUSION & THANK YOU
// ══════════════════════════════════════════════════════════════════════════════
{
  const sl = pptx.addSlide();
  sl.background = { color: C.navy };

  // Left accent bar
  sl.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.35, h: 5.5, fill: { color: C.accent }, line: { color: C.accent } });
  // Right accent bar
  sl.addShape(pptx.ShapeType.rect, { x: 9.65, y: 0, w: 0.35, h: 5.5, fill: { color: C.cyan }, line: { color: C.cyan } });
  // Bottom strip
  sl.addShape(pptx.ShapeType.rect, { x: 0, y: 5.0, w: 10, h: 0.5, fill: { color: C.blue }, line: { color: C.blue } });

  if (fs.existsSync(LOGO)) {
    sl.addImage({ path: LOGO, x: 4.45, y: 0.15, w: 1.1, h: 1.1 });
  }

  sl.addText("Thank You", {
    x: 0.5, y: 1.35, w: 9, h: 0.85,
    fontSize: 44, bold: true, color: C.white, fontFace: "Calibri", align: "center",
  });

  sl.addShape(pptx.ShapeType.line, {
    x: 1.5, y: 2.28, w: 7, h: 0,
    line: { color: C.cyan, pt: 2 },
  });

  sl.addText("Block-Chain Based Secure Notarization System — BBSNS", {
    x: 0.5, y: 2.38, w: 9, h: 0.42,
    fontSize: 14, color: C.cyan, fontFace: "Calibri", align: "center", bold: true,
  });

  sl.addText(
    "Adhude Ganesh Sanjay [B400580365]  ·  Mate Shubham Vilas [B400580398]\n" +
    "Shaikh Humera Ibrahim [B400580414]  ·  Shivale Bhakti Bhagwan [B400580419]",
    {
      x: 0.5, y: 2.92, w: 9, h: 0.72,
      fontSize: 12, color: C.light, fontFace: "Calibri", align: "center",
    }
  );

  sl.addText("Guide: Mrs. Riya B. Shikare", {
    x: 0.5, y: 3.72, w: 9, h: 0.36,
    fontSize: 12, color: C.gold, bold: true, fontFace: "Calibri", align: "center",
  });

  sl.addText("Matoshri College of Engineering & Research Centre, Nashik  |  Department of Computer Engineering  |  2025–26", {
    x: 0.5, y: 4.18, w: 9, h: 0.35,
    fontSize: 9.5, color: C.gray, fontFace: "Calibri", align: "center",
  });

  sl.addText("app.bbsns.online", {
    x: 0.5, y: 4.6, w: 9, h: 0.3,
    fontSize: 11, color: C.accent, fontFace: "Calibri", align: "center",
    bold: true,
  });
}

// ─── Write file ───────────────────────────────────────────────────────────────
pptx.writeFile({ fileName: OUT })
  .then(() => console.log("✅  PPT saved to:", OUT))
  .catch(err => { console.error("❌  Error:", err); process.exit(1); });
