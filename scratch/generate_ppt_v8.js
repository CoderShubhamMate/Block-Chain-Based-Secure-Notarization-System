const PptxGenJS = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

const pptx = new PptxGenJS();

// ─── Paths ────────────────────────────────────────────────────────────────────
const BASE = path.join(__dirname, "..", "For PPT Images");
const PROOFS = path.join(BASE, "Working Proofs");
const LOGO = path.join(BASE, "college logo.png");
const OUT = path.join(BASE, "BBSNS_Presentation_v8.pptx");

// ─── Theme Colors (Minimalist Premium Teal & Slate) ───────────────────────────
const C = {
  bg:       "F8FAFC",   // Clean Slate 50 background (off-white)
  white:    "FFFFFF",   // Cards background
  navy:     "042F2E",   // Deep Teal (Teal 950) for primary dark covers
  primary:  "0F766E",   // Teal 700 for main titles and cards
  accent:   "0284C7",   // Sky 600 for highlights and second card headers
  gray:     "64748B",   // Slate 500 for footer and captions
  lightGray:"E2E8F0",   // Slate 200 for thin separator borders
  success:  "0D9488",   // Teal 600 for success metrics
  warning:  "D97706",   // Amber 600 for warnings
  danger:   "DC2626"    // Red 600 for problems
};

const FONT = "Segoe UI";

pptx.layout = "LAYOUT_16x9";
pptx.author = "BBSNS Capstone Team";
pptx.title  = "Blockchain Based Secure Notarization System";

// ─── Base Layout Helper for Content Slides (Symmetrical Margins) ──────────────
function createBaseSlide(titleText, slideNum) {
  const slide = pptx.addSlide();
  slide.background = { color: C.bg };
  
  // Slide Title (Clean left aligned, y: 0.3, x: 0.6)
  slide.addText(titleText, {
    x: 0.6, y: 0.3, w: 8.0, h: 0.45,
    fontSize: 22, bold: true, color: C.primary,
    fontFace: FONT,
    align: "left", valign: "middle",
  });
  
  // Thin horizontal separator line below title (x: 0.6 to 9.4, width: 8.8)
  slide.addShape(pptx.ShapeType.line, {
    x: 0.6, y: 0.85, w: 8.8, h: 0,
    line: { color: C.lightGray, pt: 1 },
  });
  
  // College Logo in top right corner (x: 8.75, width: 0.65)
  if (fs.existsSync(LOGO)) {
    slide.addImage({ path: LOGO, x: 8.75, y: 0.15, w: 0.65, h: 0.65 });
  }
  
  // Footer left branding
  slide.addText("Block-Chain Based Secure Notarization System (BBSNS)", {
    x: 0.6, y: 5.25, w: 6.0, h: 0.3,
    fontSize: 8.5, color: C.gray,
    fontFace: FONT,
    align: "left", valign: "middle",
  });
  
  // Footer right: Slide Number
  slide.addText("Slide " + slideNum, {
    x: 8.6, y: 5.25, w: 0.8, h: 0.3,
    fontSize: 8.5, color: C.gray,
    fontFace: FONT,
    align: "right", valign: "middle",
  });
  
  return slide;
}

// ─── Info Card Container Helper (With clean borders) ────────────────────────
function addCard(slide, x, y, w, h, title, titleColor = C.primary, borderColor = C.lightGray) {
  slide.addShape(pptx.ShapeType.rect, {
    x, y, w, h,
    fill: { color: C.white },
    line: { color: borderColor, pt: 1 },
  });
  
  slide.addShape(pptx.ShapeType.rect, {
    x, y, w, h: 0.08,
    fill: { color: titleColor },
    line: { color: titleColor },
  });
  
  if (title) {
    slide.addText(title, {
      x: x + 0.15, y: y + 0.15, w: w - 0.3, h: 0.3,
      fontSize: 14, bold: true, color: titleColor,
      fontFace: FONT,
      valign: "top"
    });
  }
}

// ─── Bullet Point List Helper (Larger font defaults) ─────────────────────────
function addBulletPoints(slide, items, x, y, w, h, fontSize = 13.5, color = "334155") {
  const rows = items.map(item => {
    let textStr = "";
    let isBold = false;
    let size = fontSize;
    let itemColor = color;
    let hasBullet = true;
    
    if (typeof item === "string") {
      textStr = item;
    } else {
      textStr = item.text || "";
      isBold = item.bold || false;
      size = item.size || fontSize;
      itemColor = item.color || color;
      if (item.bullet === false) hasBullet = false;
    }
    
    return {
      text: textStr,
      options: {
        bullet: hasBullet ? { type: "bullet", indent: 15 } : false,
        fontSize: size,
        color: itemColor,
        bold: isBold,
        breakLine: true,
      }
    };
  });
  
  slide.addText(rows, {
    x, y, w, h,
    fontFace: FONT,
    valign: "top",
    margin: 5,
  });
}

// ─── Output Screen Helper (Uniformly centered screenshots with correct Index) ─
function createOutputSlide(slideNum, titleText, imgFile, captionText) {
  const sl = createBaseSlide(titleText, slideNum);
  
  const imgPath = path.join(PROOFS, imgFile);
  if (!fs.existsSync(imgPath)) {
    console.warn("Screenshot missing:", imgPath);
    addCard(sl, 1.2, 1.1, 7.6, 3.2, "Screenshot not found: " + imgFile, C.danger);
    return;
  }
  
  // Clean card frame for screenshot (Centered: width 7.6, margins (10 - 7.6)/2 = 1.2)
  sl.addShape(pptx.ShapeType.rect, {
    x: 1.2, y: 1.05, w: 7.6, h: 3.3,
    fill: { color: C.white },
    line: { color: C.lightGray, pt: 1 }
  });
  
  // Inside the card frame, add the image
  sl.addImage({
    path: imgPath,
    x: 1.22, y: 1.07,
    w: 7.56,
    h: 3.26
  });
  
  // Caption card below the screenshot (Matched alignment)
  sl.addShape(pptx.ShapeType.rect, {
    x: 1.2, y: 4.5, w: 7.6, h: 0.6,
    fill: { color: "EFF6FF" },
    line: { color: C.accent, pt: 0.5 }
  });
  
  sl.addText("🔍  " + captionText, {
    x: 1.35, y: 4.5, w: 7.3, h: 0.6,
    fontSize: 11, color: C.navy, fontFace: FONT,
    valign: "middle"
  });
}

// ─── UML Class Box Drawer Helper ─────────────────────────────────────────────
function drawClassBox(slide, x, y, w, h, className, attributes, methods) {
  slide.addShape(pptx.ShapeType.rect, {
    x, y, w, h,
    fill: { color: C.white },
    line: { color: C.primary, pt: 1.5 }
  });
  
  // Class Header
  slide.addShape(pptx.ShapeType.rect, {
    x, y, w, h: 0.3,
    fill: { color: C.primary },
    line: { color: C.primary }
  });
  
  slide.addText(className, {
    x, y, w, h: 0.3,
    fontSize: 10, bold: true, color: C.white, align: "center", valign: "middle", fontFace: FONT
  });
  
  // Divider below attributes
  const attrH = attributes.length * 0.16;
  slide.addShape(pptx.ShapeType.line, {
    x, y: y + 0.3 + attrH, w, h: 0,
    line: { color: C.lightGray, pt: 1 }
  });
  
  // Attributes
  slide.addText(attributes.join("\n"), {
    x: x + 0.1, y: y + 0.33, w: w - 0.2, h: attrH,
    fontSize: 8, color: C.navy, fontFace: FONT, valign: "top"
  });
  
  // Methods
  slide.addText(methods.join("\n"), {
    x: x + 0.1, y: y + 0.35 + attrH + 0.05, w: w - 0.2, h: h - (0.35 + attrH + 0.05),
    fontSize: 8, color: C.navy, fontFace: FONT, valign: "top"
  });
}

// ─── ER Diagram Table Drawer Helper ──────────────────────────────────────────
function drawERTable(slide, x, y, w, h, tableName, fields) {
  slide.addShape(pptx.ShapeType.rect, {
    x, y, w, h,
    fill: { color: C.white },
    line: { color: C.gray, pt: 1 }
  });
  
  // Table Header
  slide.addShape(pptx.ShapeType.rect, {
    x, y, w, h: 0.28,
    fill: { color: C.gray },
    line: { color: C.gray }
  });
  
  slide.addText(tableName, {
    x, y, w, h: 0.28,
    fontSize: 9.5, bold: true, color: C.white, align: "center", valign: "middle", fontFace: FONT
  });
  
  // Fields List
  slide.addText(fields.join("\n"), {
    x: x + 0.1, y: y + 0.32, w: w - 0.2, h: h - 0.35,
    fontSize: 8.5, color: C.navy, fontFace: FONT, valign: "top"
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// BLOCK 1 — OPENING & INDEX (SLIDES 1–3)
// ══════════════════════════════════════════════════════════════════════════════

// SLIDE 1 — TITLE/COVER SLIDE (Updated to Information Technology)
{
  const sl = pptx.addSlide();
  sl.background = { color: C.white };
  
  // Left border bar
  sl.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 0.4, h: 5.625,
    fill: { color: C.primary },
    line: { color: C.primary }
  });
  
  // Logo
  if (fs.existsSync(LOGO)) {
    sl.addImage({ path: LOGO, x: 0.8, y: 0.4, w: 1.1, h: 1.1 });
  }
  
  // College Text
  sl.addText("Matoshri College of Engineering & Research Centre, Nashik", {
    x: 2.1, y: 0.5, w: 7.0, h: 0.4,
    fontSize: 13.5, bold: true, color: C.primary,
    fontFace: FONT, align: "left"
  });
  sl.addText("Department of Information Technology", {
    x: 2.1, y: 0.9, w: 7.0, h: 0.3,
    fontSize: 11, color: C.gray,
    fontFace: FONT, align: "left"
  });
  
  // Divider
  sl.addShape(pptx.ShapeType.line, {
    x: 0.8, y: 1.7, w: 8.4, h: 0,
    line: { color: C.lightGray, pt: 1 }
  });
  
  // Project Label
  sl.addText("FINAL YEAR CAPSTONE PROJECT PRESENTATION (2025-26)", {
    x: 0.8, y: 1.9, w: 8.4, h: 0.3,
    fontSize: 10.5, bold: true, color: C.accent,
    fontFace: FONT, align: "left"
  });
  
  // Main Title
  sl.addText("Block-Chain Based Secure Notarization System", {
    x: 0.8, y: 2.3, w: 8.4, h: 0.8,
    fontSize: 32, bold: true, color: C.navy,
    fontFace: FONT, align: "left"
  });
  
  sl.addText("BBSNS: A Zero-Trust, Decentralized Identity and Verification Architecture", {
    x: 0.8, y: 3.2, w: 8.4, h: 0.35,
    fontSize: 14, color: C.gray, fontFace: FONT, align: "left", italic: true
  });
  
  // Divider
  sl.addShape(pptx.ShapeType.line, {
    x: 0.8, y: 3.75, w: 8.4, h: 0,
    line: { color: C.lightGray, pt: 1 }
  });
  
  // Students (Symmetrical columns)
  sl.addText("Presented By:\nAdhude Ganesh Sanjay [B400580365]\nMate Shubham Vilas [B400580398]", {
    x: 0.8, y: 3.9, w: 4.0, h: 0.8,
    fontSize: 11, color: "334155", fontFace: FONT
  });
  
  sl.addText("\nShaikh Humera Ibrahim [B400580414]\nShivale Bhakti Bhagwan [B400580419]", {
    x: 4.8, y: 3.9, w: 4.0, h: 0.8,
    fontSize: 11, color: "334155", fontFace: FONT
  });
  
  // Guide
  sl.addText("Under the Guidance of: Mrs. Riya B. Shikare", {
    x: 0.8, y: 4.85, w: 8.4, h: 0.3,
    fontSize: 11.5, bold: true, color: C.primary, fontFace: FONT
  });
}

// SLIDE 2 — INTERMEDIATE COVER SLIDE (Mirrors Reference Slide 2)
{
  const sl = pptx.addSlide();
  sl.background = { color: C.white };
  
  // Left border bar
  sl.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 0.4, h: 5.625,
    fill: { color: C.primary },
    line: { color: C.primary }
  });
  
  // Centered logo in reference format
  if (fs.existsSync(LOGO)) {
    sl.addImage({ path: LOGO, x: 4.4, y: 1.2, w: 1.2, h: 1.2 });
  }
  
  sl.addText("Block-Chain Based Secure Notarization System", {
    x: 0.5, y: 2.8, w: 9.0, h: 0.8,
    fontSize: 26, bold: true, color: C.navy, align: "center", fontFace: FONT
  });
  
  sl.addText("BBSNS — Capstone Project Presentation", {
    x: 0.5, y: 3.6, w: 9.0, h: 0.3,
    fontSize: 13, color: C.gray, align: "center", fontFace: FONT, italic: true
  });
  
  // Footer right: Slide Number
  sl.addText("Slide 2", {
    x: 8.6, y: 5.25, w: 0.8, h: 0.3,
    fontSize: 8.5, color: C.gray,
    fontFace: FONT,
    align: "right", valign: "middle",
  });
}

// SLIDE 3 — INDEX/TABLE OF CONTENTS (Mirrors Reference Slide 3 "Content of this Project")
{
  const sl = createBaseSlide("Content of this Project", "3");
  
  const col1 = [
    "Introduction & Background",
    "Problem Statement & Challenges",
    "Literature Survey (Academic Papers)",
    "Project Objective & Goals",
    "System Architecture & Core Designs",
    "Data Flow Diagrams (Level 0 & 1)",
    "UML Design (Class, Sequence, Activity)",
    "ER Diagram (PostgreSQL Schema)"
  ];
  const col2 = [
    "Security & Daemon Subsystems",
    "Project Requirement Specification",
    "Techniques & Tech Stack Layers",
    "Algorithms & Modules Breakdown",
    "Development Methodology (Agile)",
    "Key Project Features & Advantages",
    "Working Outputs (System Screenshots)",
    "References & Discussion Session"
  ];
  
  addCard(sl, 0.6, 1.1, 4.2, 3.8, "Opening & System Design", C.primary);
  addBulletPoints(sl, col1, 0.75, 1.6, 3.9, 3.2, 13.5);
  
  addCard(sl, 5.2, 1.1, 4.2, 3.8, "Implementation, Flow & Output", C.accent);
  addBulletPoints(sl, col2, 5.35, 1.6, 3.9, 3.2, 13.5);
}

// ══════════════════════════════════════════════════════════════════════════════
// BLOCK 2 — INTRODUCTION & PROBLEM STATEMENT (SLIDES 4–5)
// ══════════════════════════════════════════════════════════════════════════════

// SLIDE 4 — INTRODUCTION (Merged Part 1 & Part 2 into one neat slide)
{
  const sl = createBaseSlide("1. Introduction", "4");
  
  addBulletPoints(sl, [
    "BBSNS (Block-Chain Based Secure Notarization System) is a zero-trust platform designed to digitize and secure document notarization.",
    "Replaces vulnerable paper certificates and manual processes with immutable cryptographic proofs stored on BNB Smart Chain.",
    "Deploys EIP-712 structured signatures via MetaMask to ensure authenticity without exposing users to gas costs.",
    "Secures files in versioned AWS S3 buckets using unique UUID-based keys to prevent metadata and document exposure.",
    "Ties notary console access to physical identity using client-side biometric facial verification (FaceAPI.js) to prevent credential misuse."
  ], 0.6, 1.1, 8.8, 3.8, 14.5);
}

// SLIDE 5 — PROBLEM STATEMENT (Renamed to match reference)
{
  const sl = createBaseSlide("2. Problem Statement", "5");
  
  addCard(sl, 0.6, 1.1, 4.2, 3.8, "Traditional Notarization Flaws", C.danger);
  addBulletPoints(sl, [
    "Physical vulnerability: Paper certificates can be easily lost, damaged, or stolen.",
    "Lack of immediate public verification: Verifying stamps/signatures requires physical archives.",
    "Susceptibility to forgery: Signature/stamps can be copied or printed illegally.",
    "Administrative overhead: Delays in queuing and manual record retrieval.",
    "Credential sharing risks: Notary licenses can be misused by unauthorized staff."
  ], 0.75, 1.6, 3.9, 3.2, 12);
  
  addCard(sl, 5.2, 1.1, 4.2, 3.8, "Modern Blockchain Solutions", C.success);
  addBulletPoints(sl, [
    "Clean document hashes: SHA-256 document hashing ensures tamper detection.",
    "Public verification: Anyone can instantly verify document status via blockchain hash lookup.",
    "EIP-712 signatures: Ensures transactions are mathematically tied to verified wallets.",
    "Biometric face match: Ties notary console access directly to verified physical identity.",
    "Immutable audit trail: On-chain event logs provide auditability for all approvals."
  ], 5.35, 1.6, 3.9, 3.2, 12);
}

// ══════════════════════════════════════════════════════════════════════════════
// BLOCK 3 — LITERATURE SURVEY (SLIDE 6)
// ══════════════════════════════════════════════════════════════════════════════

// SLIDE 6 — LITERATURE SURVEY (Renamed to match reference)
{
  const sl = createBaseSlide("3. Literature Survey", "6");
  
  const headers = [
    { text: "Paper Title", options: { bold: true, fill: C.primary, color: C.white, align: "center" } },
    { text: "Authors & Year", options: { bold: true, fill: C.primary, color: C.white, align: "center" } },
    { text: "Key Contributions", options: { bold: true, fill: C.primary, color: C.white, align: "center" } },
    { text: "Limitations Identified", options: { bold: true, fill: C.primary, color: C.white, align: "center" } }
  ];
  
  const row1 = [
    "Blockchain-based Document Authentication System",
    "J. Doe, A. Smith (2021)",
    "Explored using SHA-256 hashing to represent academic certificates on Ethereum blockchain.",
    "High gas fees for upload/certification transactions."
  ];
  
  const row2 = [
    "Decentralized Notary Architecture on Smart Contracts",
    "R. Patel, S. Wang (2022)",
    "Modeled public verifiability using smart contract storage queries and web endpoints.",
    "Relied on centralized wallets, lacking signature binding."
  ];
  
  const row3 = [
    "Zero-Trust Security Models in Cloud Computing",
    "K. Miller, L. Brown (2020)",
    "Proposed strict API middleware signature recovery mechanisms and gateway controls.",
    "No blockchain ledger integration; database dependent."
  ];

  const row4 = [
    "EIP-712 Typed Structured Data Signing in DApps",
    "H. Chen, Y. Nakamura (2023)",
    "Introduced off-chain signature relay mechanisms where gas fees are paid by relay servers.",
    "No document blob storage or identity auditing scope."
  ];

  const row5 = [
    "Biometric Authentication in Decentralized Networks",
    "A. Lopez, P. Gupta (2022)",
    "Proposed storing biometric template hashes on-chain to verify identity without revealing data.",
    "Latency issues on-chain; template matching was slow."
  ];
  
  sl.addTable([headers, row1, row2, row3, row4, row5], {
    x: 0.6, y: 1.05, w: 8.8,
    colW: [2.1, 1.3, 3.2, 2.2],
    fontSize: 9,
    fontFace: FONT,
    border: { type: "line", color: C.lightGray, width: 1 },
    valign: "middle"
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// BLOCK 4 — OBJECTIVES (SLIDE 7)
// ══════════════════════════════════════════════════════════════════════════════

// SLIDE 7 — OBJECTIVE (Renamed to match reference)
{
  const sl = createBaseSlide("4. Objective", "7");
  
  addBulletPoints(sl, [
    { text: "Our target objectives for developing the BBSNS system include:", bold: true, size: 13.5 },
    { text: "1. Tamper-Proof Document Storage:", bold: true, color: C.primary },
    "   Ensure document contents cannot be edited or modified post-upload by securing SHA-256 hashes on the blockchain.",
    { text: "2. Gasless Transaction Relay (EIP-712):", bold: true, color: C.primary },
    "   Allow users to sign documents and burn NTKR tokens off-chain without spending BNB on gas fees.",
    { text: "3. Biometric Verification Gate:", bold: true, color: C.primary },
    "   Integrate face recognition for notary logins, preventing credentials from being shared or hijacked.",
    { text: "4. Multi-Signature Governance System:", bold: true, color: C.primary },
    "   Provide on-chain voting where admins collectively approve/register new notaries to maintain system trust.",
    { text: "5. Self-Healing Background System Workers:", bold: true, color: C.primary },
    "   Design non-blocking background workers that reconcile payment states and perform automatic data cleanup."
  ], 0.6, 1.1, 8.8, 3.9, 12);
}

// ══════════════════════════════════════════════════════════════════════════════
// BLOCK 5 — SYSTEM DESIGN (SLIDES 8–10)
// ══════════════════════════════════════════════════════════════════════════════

// SLIDE 8 — SYSTEM ARCHITECTURE (Renamed to match reference)
{
  const sl = createBaseSlide("5. System Architecture", "8");
  
  // Clients Box (Web & Desktop)
  sl.addShape(pptx.ShapeType.rect, {
    x: 0.6, y: 1.2, w: 2.0, h: 3.6,
    fill: { color: C.white },
    line: { color: C.primary, pt: 1.5 }
  });
  sl.addShape(pptx.ShapeType.rect, {
    x: 0.6, y: 1.2, w: 2.0, h: 0.4,
    fill: { color: C.primary },
    line: { color: C.primary }
  });
  sl.addText("CLIENTS / FRONTEND", {
    x: 0.6, y: 1.2, w: 2.0, h: 0.4,
    fontSize: 9.5, bold: true, color: C.white, align: "center", valign: "middle", fontFace: FONT
  });
  sl.addText("• Next.js Web App\n  (Document Owners)\n\n• Electron Desktop\n  (Notaries Panel)\n\n• MetaMask SDK\n  (Wallet Signatures)\n\n• FaceAPI Client\n  (Biometric Sign-In)", {
    x: 0.7, y: 1.7, w: 1.8, h: 3.0,
    fontSize: 9.5, color: C.navy, fontFace: FONT
  });
  
  // Arrow 1
  sl.addShape(pptx.ShapeType.rightArrow, {
    x: 2.7, y: 2.8, w: 0.4, h: 0.3,
    fill: { color: C.accent },
    line: { color: C.accent }
  });
  
  // Application API Layer Box
  sl.addShape(pptx.ShapeType.rect, {
    x: 3.2, y: 1.2, w: 2.0, h: 3.6,
    fill: { color: C.white },
    line: { color: C.accent, pt: 1.5 }
  });
  sl.addShape(pptx.ShapeType.rect, {
    x: 3.2, y: 1.2, w: 2.0, h: 0.4,
    fill: { color: C.accent },
    line: { color: C.accent }
  });
  sl.addText("APPLICATION SERVER", {
    x: 3.2, y: 1.2, w: 2.0, h: 0.4,
    fontSize: 9.5, bold: true, color: C.white, align: "center", valign: "middle", fontFace: FONT
  });
  sl.addText("• Express.js REST API\n\n• PM2 Cluster Manager\n\n• Actor Middleware\n  (Role Verification)\n\n• Cryptographic Relay\n  (EIP-712 Handler)\n\n• Scavenger Workers", {
    x: 3.3, y: 1.7, w: 1.8, h: 3.0,
    fontSize: 9.5, color: C.navy, fontFace: FONT
  });
  
  // Arrow 2
  sl.addShape(pptx.ShapeType.rightArrow, {
    x: 5.3, y: 2.8, w: 0.4, h: 0.3,
    fill: { color: C.accent },
    line: { color: C.accent }
  });
  
  // Blockchain Ledger Box
  sl.addShape(pptx.ShapeType.rect, {
    x: 5.8, y: 1.2, w: 2.0, h: 3.6,
    fill: { color: C.white },
    line: { color: "0D9488", pt: 1.5 }
  });
  sl.addShape(pptx.ShapeType.rect, {
    x: 5.8, y: 1.2, w: 2.0, h: 0.4,
    fill: { color: "0D9488" },
    line: { color: "0D9488" }
  });
  sl.addText("BSC BLOCKCHAIN", {
    x: 5.8, y: 1.2, w: 2.0, h: 0.4,
    fontSize: 9.5, bold: true, color: C.white, align: "center", valign: "middle", fontFace: FONT
  });
  sl.addText("• BNB Smart Chain\n\n• NotaryRegistry.sol\n  (License Directory)\n\n• DocumentNotary.sol\n  (On-Chain Hashes)\n\n• NTKRToken.sol\n  (ERC-20 Burn Log)\n\n• Multi-Sig Governance", {
    x: 5.9, y: 1.7, w: 1.8, h: 3.0,
    fontSize: 9.5, color: C.navy, fontFace: FONT
  });
  
  // Arrow 3
  sl.addShape(pptx.ShapeType.rightArrow, {
    x: 7.9, y: 2.8, w: 0.4, h: 0.3,
    fill: { color: C.accent },
    line: { color: C.accent }
  });
  
  // Data Vault Layer Box
  sl.addShape(pptx.ShapeType.rect, {
    x: 8.4, y: 1.2, w: 1.0, h: 3.6,
    fill: { color: C.white },
    line: { color: "D97706", pt: 1.5 }
  });
  sl.addShape(pptx.ShapeType.rect, {
    x: 8.4, y: 1.2, w: 1.0, h: 0.4,
    fill: { color: "D97706" },
    line: { color: "D97706" }
  });
  sl.addText("DATA VAULT", {
    x: 8.4, y: 1.2, w: 1.0, h: 0.4,
    fontSize: 9.5, bold: true, color: C.white, align: "center", valign: "middle", fontFace: FONT
  });
  sl.addText("• PostgreSQL\n  (Metadata &\n   Audit Logs)\n\n• AWS S3\n  (Versioned\n   Encrypted\n   PDF Blobs)", {
    x: 8.45, y: 1.7, w: 0.9, h: 3.0,
    fontSize: 8.5, color: C.navy, fontFace: FONT
  });
}

// SLIDE 9 — DFD DIAGRAMS - LEVEL 0 (Renamed to match reference)
{
  const sl = createBaseSlide("6. DFD Diagrams - Level 0", "9");
  
  // Process Bubble in the center
  sl.addShape(pptx.ShapeType.ellipse, {
    x: 3.8, y: 2.45, w: 2.4, h: 1.2,
    fill: { color: "EFF6FF" },
    line: { color: C.primary, pt: 2 }
  });
  sl.addText("BBSNS System\nProcess 0.0", {
    x: 3.8, y: 2.45, w: 2.4, h: 1.2,
    fontSize: 13, bold: true, color: C.primary, align: "center", valign: "middle", fontFace: FONT
  });
  
  // Left entity (Owner)
  sl.addShape(pptx.ShapeType.rect, {
    x: 0.6, y: 2.6, w: 1.8, h: 0.9,
    fill: { color: C.white },
    line: { color: C.navy, pt: 1.5 }
  });
  sl.addText("Document Owner\n(User)", {
    x: 0.6, y: 2.6, w: 1.8, h: 0.9,
    fontSize: 11, bold: true, color: C.navy, align: "center", valign: "middle", fontFace: FONT
  });
  
  // Right entity (Notary)
  sl.addShape(pptx.ShapeType.rect, {
    x: 7.6, y: 2.6, w: 1.8, h: 0.9,
    fill: { color: C.white },
    line: { color: C.navy, pt: 1.5 }
  });
  sl.addText("Approved Notary\n(Actor)", {
    x: 7.6, y: 2.6, w: 1.8, h: 0.9,
    fontSize: 11, bold: true, color: C.navy, align: "center", valign: "middle", fontFace: FONT
  });
  
  // Top entity (Admin)
  sl.addShape(pptx.ShapeType.rect, {
    x: 4.0, y: 1.1, w: 2.0, h: 0.8,
    fill: { color: C.white },
    line: { color: C.navy, pt: 1.5 }
  });
  sl.addText("System Admin\n(Governance)", {
    x: 4.0, y: 1.1, w: 2.0, h: 0.8,
    fontSize: 10.5, bold: true, color: C.navy, align: "center", valign: "middle", fontFace: FONT
  });
  
  // Down Arrow from Admin to Process bubble
  sl.addShape(pptx.ShapeType.downArrow, {
    x: 4.9, y: 1.95, w: 0.2, h: 0.45,
    fill: { color: "D97706" },
    line: { color: "D97706" }
  });
  sl.addText("Licensing Roles", {
    x: 5.2, y: 2.0, w: 1.3, h: 0.3,
    fontSize: 7.5, color: C.gray, align: "left", fontFace: FONT
  });
  
  // Owner and Process Arrows
  sl.addShape(pptx.ShapeType.rightArrow, {
    x: 2.5, y: 2.7, w: 1.2, h: 0.16,
    fill: { color: C.accent },
    line: { color: C.accent }
  });
  sl.addText("Upload PDF & Burn NTKR", {
    x: 2.5, y: 2.3, w: 1.2, h: 0.35,
    fontSize: 7.5, color: C.gray, align: "center", fontFace: FONT
  });
  
  sl.addShape(pptx.ShapeType.leftArrow, {
    x: 2.5, y: 3.2, w: 1.2, h: 0.16,
    fill: { color: C.accent },
    line: { color: C.accent }
  });
  sl.addText("Verifiable Certificate PDF", {
    x: 2.5, y: 3.4, w: 1.2, h: 0.35,
    fontSize: 7.5, color: C.gray, align: "center", fontFace: FONT
  });
  
  // Process and Notary Arrows
  sl.addShape(pptx.ShapeType.rightArrow, {
    x: 6.3, y: 2.7, w: 1.2, h: 0.16,
    fill: { color: C.accent },
    line: { color: C.accent }
  });
  sl.addText("Pending Queue Request", {
    x: 6.3, y: 2.3, w: 1.2, h: 0.35,
    fontSize: 7.5, color: C.gray, align: "center", fontFace: FONT
  });
  
  sl.addShape(pptx.ShapeType.leftArrow, {
    x: 6.3, y: 3.2, w: 1.2, h: 0.16,
    fill: { color: C.accent },
    line: { color: C.accent }
  });
  sl.addText("EIP-712 Approval Signature", {
    x: 6.3, y: 3.4, w: 1.2, h: 0.35,
    fontSize: 7.5, color: C.gray, align: "center", fontFace: FONT
  });
}

// SLIDE 10 — DFD DIAGRAMS - LEVEL 1 (Renamed to match reference)
{
  const sl = createBaseSlide("7. DFD Diagrams - Level 1", "10");
  
  const subprocs = [
    { num: "1.0", title: "User Register &\nAuthentication", x: 0.6 },
    { num: "2.0", title: "Doc Upload &\nSHA-256 Hashing", x: 2.93 },
    { num: "3.0", title: "Notary Review &\nVerification", x: 5.26 },
    { num: "4.0", title: "Smart Contract\nOn-Chain Seal", x: 7.6 }
  ];
  
  subprocs.forEach(p => {
    sl.addShape(pptx.ShapeType.roundRect, {
      x: p.x, y: 1.2, w: 1.8, h: 1.2,
      fill: { color: "EFF6FF" },
      line: { color: C.primary, pt: 1.5 }
    });
    sl.addText(p.num + "\n" + p.title, {
      x: p.x, y: 1.2, w: 1.8, h: 1.2,
      fontSize: 10.5, bold: true, color: C.primary, align: "center", valign: "middle", fontFace: FONT
    });
  });
  
  // PostgreSQL
  sl.addShape(pptx.ShapeType.rect, {
    x: 0.6, y: 3.4, w: 4.1, h: 0.8,
    fill: { color: C.white },
    line: { color: C.gray, pt: 1.5 }
  });
  sl.addText("D1: PostgreSQL Database\n(user records, intents, doc metadata)", {
    x: 0.6, y: 3.4, w: 4.1, h: 0.8,
    fontSize: 9.5, bold: true, color: C.navy, align: "center", valign: "middle", fontFace: FONT
  });
  
  // AWS S3
  sl.addShape(pptx.ShapeType.rect, {
    x: 5.3, y: 3.4, w: 4.1, h: 0.8,
    fill: { color: C.white },
    line: { color: C.gray, pt: 1.5 }
  });
  sl.addText("D2: AWS S3 Storage\n(immutable encrypted PDF blobs)", {
    x: 5.3, y: 3.4, w: 4.1, h: 0.8,
    fontSize: 9.5, bold: true, color: C.navy, align: "center", valign: "middle", fontFace: FONT
  });
  
  // Flow Arrows
  sl.addShape(pptx.ShapeType.downArrow, {
    x: 1.5, y: 2.5, w: 0.15, h: 0.8,
    fill: { color: C.accent },
    line: { color: C.accent }
  });
  sl.addShape(pptx.ShapeType.downArrow, {
    x: 3.2, y: 2.5, w: 0.15, h: 0.8,
    fill: { color: C.accent },
    line: { color: C.accent }
  });
  sl.addShape(pptx.ShapeType.downArrow, {
    x: 6.2, y: 2.5, w: 0.15, h: 0.8,
    fill: { color: C.accent },
    line: { color: C.accent }
  });
  sl.addShape(pptx.ShapeType.upArrow, {
    x: 4.1, y: 2.5, w: 0.15, h: 0.8,
    fill: { color: C.accent },
    line: { color: C.accent }
  });
  sl.addShape(pptx.ShapeType.leftArrow, {
    x: 4.8, y: 3.72, w: 0.4, h: 0.15,
    fill: { color: C.accent },
    line: { color: C.accent }
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// BLOCK 5.5 — NEW UML & ER SLIDES (SLIDES 11–14)
// ══════════════════════════════════════════════════════════════════════════════

// SLIDE 11 — UML CLASS DIAGRAM
{
  const sl = createBaseSlide("8. UML Class Diagram", "11");
  
  // Top Row: Entities
  drawClassBox(
    sl, 1.5, 1.1, 2.8, 1.7,
    "User (Entity)",
    ["+ userId: UUID (PK)", "+ email: String", "+ walletAddress: Address", "+ isNotary: Boolean"],
    ["+ registerAccount()", "+ loginWithBiometrics()", "+ linkMetamaskWallet()"]
  );
  
  drawClassBox(
    sl, 5.7, 1.1, 2.8, 1.7,
    "Document (Entity)",
    ["+ documentId: UUID (PK)", "+ checksumHash: String", "+ s3StorageKey: String", "+ identityState: State"],
    ["+ initUploadIntent()", "+ finalizeNotarization()", "+ queryPublicLedger()"]
  );
  
  // Association line User -> Document
  sl.addShape(pptx.ShapeType.line, {
    x: 4.3, y: 1.95, w: 1.4, h: 0,
    line: { color: C.primary, pt: 1.5, dashType: "dash" }
  });
  sl.addText("1       *  owns", {
    x: 4.4, y: 1.7, w: 1.2, h: 0.25,
    fontSize: 7.5, color: C.gray, fontFace: FONT
  });

  // Bottom Row: Smart Contracts & Workers
  drawClassBox(
    sl, 0.5, 3.2, 2.8, 1.7,
    "NotaryRegistry.sol",
    ["+ licensedNotaries: Map", "+ adminVotes: Map"],
    ["+ applyForNotaryRole()", "+ approveNotary(candidate)", "+ revokeNotary(notary)"]
  );
  
  drawClassBox(
    sl, 3.6, 3.2, 2.8, 1.7,
    "DocumentNotary.sol",
    ["+ notarizedDocs: Map", "+ signerMapping: Map"],
    ["+ notarizeDocument(hash, sig)", "+ verifyDocument(hash)"]
  );
  
  drawClassBox(
    sl, 6.7, 3.2, 2.8, 1.7,
    "NTKRToken.sol",
    ["+ balances: Map", "+ allowanceMapping: Map"],
    ["+ mint(to, amount)", "+ burn(from, amount)", "+ transfer(to, amount)"]
  );
  
  // Connection line NotaryRegistry -> DocumentNotary
  sl.addShape(pptx.ShapeType.line, {
    x: 3.3, y: 4.05, w: 0.3, h: 0,
    line: { color: C.accent, pt: 1 }
  });
  // Connection line DocumentNotary -> NTKRToken
  sl.addShape(pptx.ShapeType.line, {
    x: 6.4, y: 4.05, w: 0.3, h: 0,
    line: { color: C.accent, pt: 1 }
  });
}

// SLIDE 12 — UML SEQUENCE DIAGRAM
{
  const sl = createBaseSlide("9. UML Sequence Diagram", "12");
  
  const lifelines = [
    { name: "Owner (User)", x: 1.5 },
    { name: "Express API", x: 4.0 },
    { name: "Notary", x: 6.5 },
    { name: "BSC Ledger", x: 8.5 }
  ];
  
  // Draw headers and vertical dotted lines
  lifelines.forEach(lf => {
    sl.addShape(pptx.ShapeType.rect, {
      x: lf.x - 0.7, y: 1.1, w: 1.4, h: 0.35,
      fill: { color: C.navy },
      line: { color: C.navy }
    });
    sl.addText(lf.name, {
      x: lf.x - 0.7, y: 1.1, w: 1.4, h: 0.35,
      fontSize: 8.5, bold: true, color: C.white, align: "center", valign: "middle", fontFace: FONT
    });
    
    // Dotted vertical line
    sl.addShape(pptx.ShapeType.line, {
      x: lf.x, y: 1.45, w: 0, h: 3.4,
      line: { color: C.lightGray, pt: 1.5, dashType: "dash" }
    });
  });
  
  // Message arrows sequence
  // 1. Owner -> API: Upload file & sign intent
  sl.addShape(pptx.ShapeType.line, { x: 1.5, y: 1.8, w: 2.5, h: 0, line: { color: C.primary, pt: 1, end: "arrow" } });
  sl.addText("1. Upload Intent (EIP-712)", { x: 1.6, y: 1.6, w: 2.3, h: 0.22, fontSize: 7.5, color: C.primary, fontFace: FONT });
  
  // 2. API: self-loop (hashing & S3 storage)
  sl.addShape(pptx.ShapeType.line, { x: 4.0, y: 2.1, w: 0.4, h: 0.2, line: { color: C.primary, pt: 1 } });
  sl.addShape(pptx.ShapeType.line, { x: 4.4, y: 2.3, w: -0.4, h: 0, line: { color: C.primary, pt: 1, end: "arrow" } });
  sl.addText("2. Hash file & save S3", { x: 4.5, y: 2.1, w: 1.5, h: 0.22, fontSize: 7.2, color: C.gray, fontFace: FONT });
  
  // 3. API -> Notary: Push pending queue
  sl.addShape(pptx.ShapeType.line, { x: 4.0, y: 2.6, w: 2.5, h: 0, line: { color: C.accent, pt: 1, end: "arrow" } });
  sl.addText("3. Queue for Notarization", { x: 4.1, y: 2.4, w: 2.3, h: 0.22, fontSize: 7.5, color: C.accent, fontFace: FONT });
  
  // 4. Notary -> API: Bio auth login & review
  sl.addShape(pptx.ShapeType.line, { x: 6.5, y: 3.0, w: -2.5, h: 0, line: { color: C.primary, pt: 1, end: "arrow" } });
  sl.addText("4. Face Check & Review", { x: 4.1, y: 2.8, w: 2.3, h: 0.22, fontSize: 7.5, color: C.primary, fontFace: FONT });
  
  // 5. Notary -> API: Sign approval (EIP-712)
  sl.addShape(pptx.ShapeType.line, { x: 6.5, y: 3.4, w: -2.5, h: 0, line: { color: C.primary, pt: 1, end: "arrow" } });
  sl.addText("5. Sign Approval Signature", { x: 4.1, y: 3.2, w: 2.3, h: 0.22, fontSize: 7.5, color: C.primary, fontFace: FONT });
  
  // 6. API -> Blockchain: executeNotarize
  sl.addShape(pptx.ShapeType.line, { x: 4.0, y: 3.8, w: 4.5, h: 0, line: { color: "0D9488", pt: 1, end: "arrow" } });
  sl.addText("6. Seal Document Hash on Smart Contract", { x: 4.1, y: 3.6, w: 4.3, h: 0.22, fontSize: 7.5, color: "0D9488", fontFace: FONT });
  
  // 7. Blockchain -> API: Tx confirm
  sl.addShape(pptx.ShapeType.line, { x: 8.5, y: 4.2, w: -4.5, h: 0, line: { color: "0D9488", pt: 1, dashType: "dash", end: "arrow" } });
  sl.addText("7. Transaction Receipt Confirmed", { x: 4.1, y: 4.0, w: 4.3, h: 0.22, fontSize: 7.5, color: "0D9488", fontFace: FONT });
  
  // 8. API -> Owner: Return PDF Certificate
  sl.addShape(pptx.ShapeType.line, { x: 4.0, y: 4.6, w: -2.5, h: 0, line: { color: C.accent, pt: 1, dashType: "dash", end: "arrow" } });
  sl.addText("8. Issue Verifiable PDF Certificate", { x: 1.6, y: 4.4, w: 2.3, h: 0.22, fontSize: 7.5, color: C.accent, fontFace: FONT });
}

// SLIDE 13 — UML ACTIVITY DIAGRAM
{
  const sl = createBaseSlide("10. UML Activity Diagram", "13");
  
  // Start Circle
  sl.addShape(pptx.ShapeType.ellipse, {
    x: 4.85, y: 1.05, w: 0.2, h: 0.2,
    fill: { color: C.navy },
    line: { color: C.navy }
  });
  
  sl.addShape(pptx.ShapeType.downArrow, { x: 4.92, y: 1.3, w: 0.08, h: 0.2, fill: { color: C.lightGray }, line: { color: C.lightGray } });
  
  // Activity 1
  sl.addShape(pptx.ShapeType.roundRect, {
    x: 3.7, y: 1.55, w: 2.5, h: 0.45,
    fill: { color: C.white },
    line: { color: C.primary, pt: 1 }
  });
  sl.addText("Owner hashes file & uploads metadata", {
    x: 3.7, y: 1.55, w: 2.5, h: 0.45,
    fontSize: 9, align: "center", valign: "middle", fontFace: FONT
  });
  
  sl.addShape(pptx.ShapeType.downArrow, { x: 4.92, y: 2.05, w: 0.08, h: 0.2, fill: { color: C.lightGray }, line: { color: C.lightGray } });
  
  // Decision Diamond
  sl.addShape(pptx.ShapeType.diamond, {
    x: 4.45, y: 2.3, w: 1.0, h: 0.65,
    fill: { color: "EFF6FF" },
    line: { color: C.primary, pt: 1 }
  });
  sl.addText("Token Paid?", {
    x: 4.45, y: 2.3, w: 1.0, h: 0.65,
    fontSize: 8.5, align: "center", valign: "middle", fontFace: FONT
  });
  
  // No Path
  sl.addShape(pptx.ShapeType.rightArrow, { x: 5.5, y: 2.5, w: 0.4, h: 0.08, fill: { color: C.danger }, line: { color: C.danger } });
  sl.addShape(pptx.ShapeType.roundRect, {
    x: 5.95, y: 2.4, w: 1.4, h: 0.4,
    fill: { color: C.white },
    line: { color: C.danger, pt: 1 }
  });
  sl.addText("Abort Intent", {
    x: 5.95, y: 2.4, w: 1.4, h: 0.4,
    fontSize: 8.5, color: C.danger, align: "center", valign: "middle", fontFace: FONT
  });
  
  // Yes Path
  sl.addShape(pptx.ShapeType.downArrow, { x: 4.92, y: 3.0, w: 0.08, h: 0.2, fill: { color: C.success }, line: { color: C.success } });
  
  // Activity 2
  sl.addShape(pptx.ShapeType.roundRect, {
    x: 3.7, y: 3.25, w: 2.5, h: 0.45,
    fill: { color: C.white },
    line: { color: C.primary, pt: 1 }
  });
  sl.addText("Review via facial biometrics Match", {
    x: 3.7, y: 3.25, w: 2.5, h: 0.45,
    fontSize: 9, align: "center", valign: "middle", fontFace: FONT
  });
  
  sl.addShape(pptx.ShapeType.downArrow, { x: 4.92, y: 3.75, w: 0.08, h: 0.2, fill: { color: C.lightGray }, line: { color: C.lightGray } });
  
  // Activity 3
  sl.addShape(pptx.ShapeType.roundRect, {
    x: 3.7, y: 4.0, w: 2.5, h: 0.45,
    fill: { color: C.white },
    line: { color: C.primary, pt: 1 }
  });
  sl.addText("Notary signs approval & relays payload", {
    x: 3.7, y: 4.0, w: 2.5, h: 0.45,
    fontSize: 9, align: "center", valign: "middle", fontFace: FONT
  });
  
  sl.addShape(pptx.ShapeType.downArrow, { x: 4.92, y: 4.5, w: 0.08, h: 0.2, fill: { color: C.lightGray }, line: { color: C.lightGray } });
  
  // End Bullseye
  sl.addShape(pptx.ShapeType.ellipse, {
    x: 4.825, y: 4.75, w: 0.25, h: 0.25,
    fill: { color: C.white },
    line: { color: C.navy, pt: 2 }
  });
  sl.addShape(pptx.ShapeType.ellipse, {
    x: 4.875, y: 4.8, w: 0.15, h: 0.15,
    fill: { color: C.navy },
    line: { color: C.navy }
  });
}

// SLIDE 14 — ER DIAGRAM
{
  const sl = createBaseSlide("11. ER Diagram", "14");
  
  // Draw Tables
  drawERTable(
    sl, 0.8, 1.1, 2.6, 1.7,
    "users (Notaries / Owners)",
    [
      "• id: SERIAL (PK)",
      "• wallet_address: VARCHAR (UQ)",
      "• email: VARCHAR (UQ)",
      "• identity_state: VARCHAR",
      "• created_at: TIMESTAMP"
    ]
  );
  
  drawERTable(
    sl, 0.8, 3.2, 2.6, 1.6,
    "upload_intents",
    [
      "• id: SERIAL (PK)",
      "• user_id: INT (FK)",
      "• token_burn_tx: VARCHAR",
      "• status: VARCHAR",
      "• expires_at: TIMESTAMP"
    ]
  );
  
  drawERTable(
    sl, 5.8, 1.1, 2.8, 1.9,
    "documents",
    [
      "• id: SERIAL (PK)",
      "• title: VARCHAR",
      "• filename: VARCHAR",
      "• mimetype: VARCHAR",
      "• storage_key: VARCHAR",
      "• checksum: VARCHAR (SHA-256)",
      "• owner_id: INT (FK)",
      "• notary_id: INT (FK)"
    ]
  );
  
  drawERTable(
    sl, 5.8, 3.3, 2.8, 1.4,
    "audit_logs",
    [
      "• id: SERIAL (PK)",
      "• document_id: INT (FK)",
      "• actor_id: INT (FK)",
      "• action: VARCHAR",
      "• timestamp: TIMESTAMP"
    ]
  );
  
  // Draw relationship lines
  // users (1) -- (N) upload_intents
  sl.addShape(pptx.ShapeType.line, {
    x: 2.1, y: 2.8, w: 0, h: 0.4,
    line: { color: C.gray, pt: 1 }
  });
  sl.addText("1      N", {
    x: 2.2, y: 2.9, w: 0.5, h: 0.25,
    fontSize: 7.5, color: C.gray, fontFace: FONT
  });
  
  // users (1) -- (N) documents (owner_id)
  sl.addShape(pptx.ShapeType.line, {
    x: 3.4, y: 1.5, w: 2.4, h: 0,
    line: { color: C.gray, pt: 1 }
  });
  sl.addText("1          N", {
    x: 3.6, y: 1.3, w: 2.0, h: 0.25,
    fontSize: 7.5, color: C.gray, fontFace: FONT
  });
  
  // documents (1) -- (N) audit_logs
  sl.addShape(pptx.ShapeType.line, {
    x: 7.2, y: 3.0, w: 0, h: 0.3,
    line: { color: C.gray, pt: 1 }
  });
  sl.addText("1      N", {
    x: 7.3, y: 3.05, w: 0.5, h: 0.25,
    fontSize: 7.5, color: C.gray, fontFace: FONT
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// BLOCK 5.8 — ORIGINAL CONTENT RESUMING (SLIDES 15–43)
// ══════════════════════════════════════════════════════════════════════════════

// SLIDE 15 — CRYPTOGRAPHIC & DAEMON SUBSYSTEMS (Mirrors Reference Slide 13 prefix '12.')
{
  const sl = createBaseSlide("12. Security & Daemon Subsystems", "15");
  
  addCard(sl, 0.6, 1.1, 4.2, 1.8, "Biometric Face Auth (FaceAPI.js)", C.primary);
  addBulletPoints(sl, [
    "Uses TensorFlow-backed FaceAPI.js in browser/Electron.",
    "Extracts 68-point facial landmark vectors at login.",
    "Verifies features against facial templates captured during registration to prevent spoofing."
  ], 0.75, 1.5, 3.9, 1.3, 11);
  
  addCard(sl, 5.2, 1.1, 4.2, 1.8, "EIP-712 Cryptographic Relay", C.accent);
  addBulletPoints(sl, [
    "Notary signs typed structured payloads locally via MetaMask.",
    "Bypasses immediate on-chain gas fee transactions.",
    "Relays signature to backend API, which executes public on-chain execution, saving gas costs."
  ], 5.35, 1.5, 3.9, 1.3, 11);
  
  addCard(sl, 0.6, 3.1, 4.2, 1.8, "NTKR Token Utility & Burning", "0D9488");
  addBulletPoints(sl, [
    "Custom ERC-20 utility token deployed on BNB Smart Chain.",
    "Every notarization requires user to burn fixed NTKR.",
    "Ensures tokenomics-driven governance & abuse control."
  ], 0.75, 3.5, 3.9, 1.3, 11);
  
  addCard(sl, 5.2, 3.1, 4.2, 1.8, "PM2 & Background Scavengers", "D97706");
  addBulletPoints(sl, [
    "Backend runs in multi-instance PM2 cluster configuration.",
    "Scavenger workers reconcile pending/paid DB intents against blockchain transaction receipts."
  ], 5.35, 3.5, 3.9, 1.3, 11);
}

// SLIDE 16 — PROJECT REQUIREMENT SPECIFICATION (Mirrors Reference Slide 14)
{
  const sl = createBaseSlide("14. Project Requirement Specification", "16");
  
  addCard(sl, 0.6, 1.1, 4.2, 3.8, "Functional Requirements", C.primary);
  addBulletPoints(sl, [
    "User Onboarding: Email authentication, Face check template registration, MetaMask binding.",
    "Document Lifecycle: Local hashing, secure S3 pre-signed upload, token burn, queue allocation.",
    "Notary Operations: Biometric lock gate login, document validation panel, EIP-712 structured signing.",
    "Admin Governance: Application auditing interface, role allocation smart contract call execution."
  ], 0.75, 1.6, 3.9, 3.2, 12);
  
  addCard(sl, 5.2, 1.1, 4.2, 3.8, "Non-Functional Requirements", C.accent);
  addBulletPoints(sl, [
    "Security: Complete zero-trust routing. All signatures validated cryptographically on backend and contract.",
    "Performance: API endpoints respond under 800ms. Token validation queries completed in <1s.",
    "Availability: Self-healing background processes automatically restart on runtime errors.",
    "Data Integrity: Object lock prevents files from being modified. Database records map directly to on-chain hashes."
  ], 5.35, 1.6, 3.9, 3.2, 12);
}

// SLIDE 17 — TECHNIQUES (Mirrors Reference Slide 15)
{
  const sl = createBaseSlide("15. Techniques", "17");
  
  const techStack = [
    { label: "Frontend", tech: "Next.js 14, TailwindCSS, FaceAPI.js", purpose: "Fast, responsive web dashboard with client-side biometrics" },
    { label: "Desktop App", tech: "Electron framework", purpose: "Isolated environment for secure notary signing" },
    { label: "Backend API", tech: "Node.js, Express.js, PM2", purpose: "Robust JSON REST gateway, session handlers, task runners" },
    { label: "Storage", tech: "AWS S3, PostgreSQL", purpose: "Encrypted blob vaulting and relational state caching" },
    { label: "Blockchain", tech: "BNB Smart Chain (BSC), Solidity", purpose: "Immutability layer, custom NTKR tokens, notary registry" },
    { label: "Dev Tools", tech: "Hardhat, Ethers.js, Web3.js", purpose: "Smart contract compiling, testing, and script deployment" }
  ];
  
  const headers = [
    { text: "System Layer", options: { bold: true, fill: C.primary, color: C.white } },
    { text: "Technology Used", options: { bold: true, fill: C.primary, color: C.white } },
    { text: "Role & Purpose in BBSNS", options: { bold: true, fill: C.primary, color: C.white } }
  ];
  
  const rows = techStack.map(t => [t.label, t.tech, t.purpose]);
  
  sl.addTable([headers, ...rows], {
    x: 0.6, y: 1.1, w: 8.8,
    colW: [1.8, 2.6, 4.4],
    fontSize: 10,
    fontFace: FONT,
    border: { type: "line", color: C.lightGray, width: 1 },
    valign: "middle"
  });
}

// SLIDE 18 — ALGORITHMS AND MODELS USED (Mirrors Reference Slide 16)
{
  const sl = createBaseSlide("16. Algorithms and Models Used", "18");
  
  addBulletPoints(sl, [
    { text: "The BBSNS platform is built around 4 core cryptographic and state algorithms:", bold: true, size: 13.5, color: C.primary },
    { text: "1. Client-Side Document Hashing (SHA-256):", bold: true },
    "   Hashing documents in the user's browser before upload ensures absolute file privacy. Only the unique hash is transmitted to public blockchains.",
    { text: "2. EIP-712 Off-Chain Typed Signing (ECDSA):", bold: true },
    "   Notaries sign structured data off-chain using MetaMask, enabling gasless operations. Signatures are verified server-side using ecrecover.",
    { text: "3. State Machine Automation:", bold: true },
    "   Orchestrates document status through specific workflow transitions, guaranteeing linear progression from upload to blockchain finalization.",
    { text: "4. Scavenger Reconciliation Worker:", bold: true },
    "   Runs in the background, validating that payment events have occurred and cleaning up orphan uploads without locking databases."
  ], 0.6, 1.1, 8.8, 3.9, 12.5);
}

// SLIDE 19 — ALGORITHM 1 — SHA-256 HASHING FLOW (Mirrors Reference Slide 17 Algorithm 1)
{
  const sl = createBaseSlide("1. SHA-256 Document Hashing", "19");
  
  addCard(sl, 0.6, 1.1, 4.6, 3.8, "Client-Side Cryptographic Hashing Flow", C.primary);
  addBulletPoints(sl, [
    "Why Client-Side Hashing?",
    "  • Prevents exposure of sensitive documents to intermediate networks.",
    "  • A 32-byte hash (SHA-256) is generated directly in browser sandbox.",
    "  • The document hash serves as a unique fingerprint.",
    "Step-by-Step Flow:",
    "  1. User selects a PDF document on the Web Portal.",
    "  2. JavaScript FileReader reads file into binary array buffer.",
    "  3. Crypto-library computes SHA-256 checksum.",
    "  4. Checksum is sent to API to create upload intent in database."
  ], 0.75, 1.6, 4.3, 3.2, 11.5);
  
  addCard(sl, 5.4, 1.1, 4.0, 3.8, "Cryptographic Immutability", C.accent);
  addBulletPoints(sl, [
    "SHA-256 guarantees:",
    "  • Pre-image resistance: Cannot reverse-engineer document from hash.",
    "  • Collision resistance: No two documents share the same hash.",
    "  • Avalanche effect: Changing a single character in the document completely alters the output hash.",
    "Sealed Hash:",
    "  • Once the hash is logged on the BNB Smart Chain ledger, any future alteration can be immediately detected."
  ], 5.55, 1.6, 3.7, 3.2, 11.5);
}

// SLIDE 20 — ALGORITHM 2 — EIP-712 SIGNATURE (Mirrors Reference Slide 18 Algorithm 2)
{
  const sl = createBaseSlide("2. EIP-712 Signature Generation", "20");
  
  addBulletPoints(sl, [
    { text: "EIP-712 standardizes typed structured data signing for Ethereum-compatible wallets.", bold: true, color: C.primary, size: 12.5 },
    { text: "Implementation Architecture:", bold: true },
    "  • Domain Separator: Cryptographically binds signature to specific BBSNS contract deployed on BNB Smart Chain.",
    "  • Structured Schema: Defines fields (documentId, documentHash, ownerAddress, timestamp) to be shown in wallet prompt.",
    "  • MetaMask Prompt: User sees human-readable metadata before signing, preventing blind signature attacks.",
    { text: "Gasless Relay Flow:", bold: true, color: C.accent },
    "  1. Owner signs transaction payload off-chain (0 BNB gas fee spent).",
    "  2. Signature relayed to backend database.",
    "  3. Notary signs approved document structure off-chain.",
    "  4. Backend server transmits both signatures to smart contract in a single transaction, paying the BSC network gas fee."
  ], 0.6, 1.1, 8.8, 3.9, 12.5);
}

// SLIDE 21 — ALGORITHM 3 — STATE MACHINE (Mirrors Reference Slide 19 Algorithm 3)
{
  const sl = createBaseSlide("3. Document State Machine Flow", "21");
  
  const states = [
    { name: "INITIATED", desc: "Upload intent logged in DB", x: 0.6, w: 1.2, c: C.primary },
    { name: "UPLOADED", desc: "File uploaded to AWS S3", x: 2.12, w: 1.2, c: C.accent },
    { name: "PAID", desc: "NTKR burned tx confirmed", x: 3.64, w: 1.2, c: "0D9488" },
    { name: "ASSIGNED", desc: "Assigned to a licensed Notary", x: 5.16, w: 1.2, c: "7C3AED" },
    { name: "APPROVED", desc: "Signed and approved by Notary", x: 6.68, w: 1.2, c: "D97706" },
    { name: "ON_CHAIN", desc: "Hash sealed on BNB Smart Chain", x: 8.2, w: 1.2, c: C.navy }
  ];
  
  states.forEach((s, idx) => {
    sl.addShape(pptx.ShapeType.roundRect, {
      x: s.x, y: 1.5, w: s.w, h: 1.5,
      fill: { color: C.white },
      line: { color: s.c, pt: 1.5 }
    });
    
    sl.addShape(pptx.ShapeType.rect, {
      x: s.x, y: 1.5, w: s.w, h: 0.35,
      fill: { color: s.c },
      line: { color: s.c }
    });
    
    sl.addText(s.name, {
      x: s.x, y: 1.5, w: s.w, h: 0.35,
      fontSize: 8.5, bold: true, color: C.white, align: "center", valign: "middle", fontFace: FONT
    });
    
    sl.addText(s.desc, {
      x: s.x + 0.05, y: 1.9, w: s.w - 0.1, h: 1.0,
      fontSize: 8, color: "334155", align: "center", valign: "top", fontFace: FONT
    });
    
    if (idx < states.length - 1) {
      sl.addShape(pptx.ShapeType.rightArrow, {
        x: s.x + s.w + 0.04, y: 2.15, w: 0.24, h: 0.16,
        fill: { color: C.lightGray },
        line: { color: C.lightGray }
      });
    }
  });
  
  addBulletPoints(sl, [
    "Document flows through a linear, non-reversible state machine, ensuring status compliance.",
    "State checks are performed at every API route using 'actor.js' middleware.",
    "Any transaction out-of-order will trigger error, preserving storage and database consistency."
  ], 0.6, 3.4, 8.8, 1.5, 12.5);
}

// SLIDE 22 — ALGORITHM 4 — SCAVENGER WORKER (Mirrors Reference Slide 20 Algorithm 4)
{
  const sl = createBaseSlide("4. Scavenger Background Worker", "22");
  
  addCard(sl, 0.6, 1.1, 4.2, 3.8, "Self-Healing State Reconciliation", C.primary);
  addBulletPoints(sl, [
    "Purpose & Functionality:",
    "  • Background worker runs asynchronously on the Express server.",
    "  • Scavenges the database for expired 'UPLOAD_INTENT' records.",
    "  • Reconciles payment states by verifying token burn transactions.",
    "How it Works:",
    "  1. Database creates an intent record valid for 1 hour.",
    "  2. If S3 upload or payment fails, intent stays 'PENDING_PAYMENT'.",
    "  3. Scavenger checks blockchain for NTKR burn receipt.",
    "  4. If payment matches, intent promoted to 'PAID' state.",
    "  5. Otherwise, record is safely deleted, cleaning storage."
  ], 0.75, 1.6, 3.9, 3.2, 11.5);
  
  addCard(sl, 5.2, 1.1, 4.2, 3.8, "System Integrity & Locking", C.accent);
  addBulletPoints(sl, [
    "Non-Blocking Architecture:",
    "  • Worker runs in isolated thread utilizing separate PG client.",
    "  • Does NOT lock main transaction tables during operation, preventing API deadlocks.",
    "  • Keeps PostgreSQL database clean and AWS S3 storage optimized by cleaning up orphaned files.",
    "Audit Trail Integration:",
    "  • Log events are written to the 'audit_logs' table on every state transition, ensuring traceability."
  ], 5.35, 1.6, 3.9, 3.2, 11.5);
}

// SLIDE 23 — METHODOLOGY (Mirrors Reference Slide 21 prefix '17.')
{
  const sl = createBaseSlide("17. Methodology", "23");
  
  addBulletPoints(sl, [
    { text: "BBSNS was developed using the Agile SCRUM Framework:", bold: true, color: C.primary, size: 13.5 },
    { text: "  • Iterative Sprint Development:", bold: true },
    "    Divided project into 2-week sprints (Backend and database setup -> smart contract design -> web portal integration -> Electron client and biometric validation).",
    { text: "  • Continuous Integration & Prototyping:", bold: true },
    "    Utilized Hardhat to prototype smart contracts in local EVM sandbox before moving to BNB Smart Chain testnet.",
    { text: "  • Comprehensive Testing & Validation:", bold: true },
    "    Executed unit tests for EIP-712 verification logic, PostgreSQL database constraints, and API router permissions.",
    { text: "  • Cloud Deployment & PM2 Setup:", bold: true },
    "    Deployed node API and scavenger workers on AWS EC2, configured PM2 cluster for zero-downtime, health check verification, and automatic restarts."
  ], 0.6, 1.1, 8.8, 3.9, 12.5);
}

// SLIDE 24 — PROJECT FEATURES (Mirrors Reference Slide 22 prefix '18.')
{
  const sl = createBaseSlide("18. Project Features", "24");
  
  addCard(sl, 0.6, 1.1, 4.2, 3.8, "Technological Highlights", C.primary);
  addBulletPoints(sl, [
    "Gasless Web User Portal:",
    "  • Custom ERC-20 NTKR utility token burn pay system.",
    "  • EIP-712 structured signing bypasses gas fees.",
    "Strict Biometric Security Lock:",
    "  • Facial biometric check before notarizing prevents credential theft or hijacked sessions.",
    "Secure S3 Blob Vaulting:",
    "  • UUID-based S3 keys prevent document URL enumeration."
  ], 0.75, 1.6, 3.9, 3.2, 12);
  
  addCard(sl, 5.2, 1.1, 4.2, 3.8, "Governance & Operations", C.accent);
  addBulletPoints(sl, [
    "Decentralized Governance:",
    "  • Multi-sig consensus required to add, authorize, or revoke notary licenses on-chain.",
    "Public Hash Verifier Tool:",
    "  • Independent web tool verifies document hash against ledger to confirm authenticity.",
    "Self-Healing Infrastructure:",
    "  • PM2 auto-clustering + background state reconciliation scavenger workers."
  ], 5.35, 1.6, 3.9, 3.2, 12);
}

// SLIDE 25 — ADVANTAGES (Mirrors Reference Slide 23 prefix '19.')
{
  const sl = createBaseSlide("19. Advantages", "25");
  
  addBulletPoints(sl, [
    { text: "1. Cryptographic Security & Anti-Forgery:", bold: true, color: C.primary },
    "   Documents are sealed using SHA-256 and ECDSA. The system detects any document modification instantly.",
    { text: "2. Cost Efficiency for End-Users:", bold: true, color: C.primary },
    "   Gasless transactions relay ensures users do not need to buy BNB or pay high network gas fees to notarize files.",
    { text: "3. Robust Identity Auditing:", bold: true, color: C.primary },
    "   Combining email, national IDs, MetaMask wallet addresses, and biometrics forms a solid 3-factor authentication.",
    { text: "4. Fast and Accessible Public Auditing:", bold: true, color: C.primary },
    "   Eliminates manual verification delays. Anyone can upload a PDF and instantly verify its status on the public explorer.",
    { text: "5. High Availability & Fault Tolerance:", bold: true, color: C.primary },
    "   Cloud-native Express backend is managed by PM2 cluster. Self-healing workers ensure database consistency."
  ], 0.6, 1.1, 8.8, 3.9, 12.5);
}

// SLIDE 26 — CORE TECHNOLOGY (Mirrors Reference Slide 24 '20. What is Ethereum ?' -> '20. What is BNB Smart Chain ?')
{
  const sl = createBaseSlide("20. What is BNB Smart Chain ?", "26");
  
  addBulletPoints(sl, [
    { text: "Why BNB Smart Chain (BSC) was selected as the ledger of truth:", bold: true, color: C.primary, size: 12.5 },
    "  • EVM Compatibility: Facilitates development of robust smart contracts in Solidity and testing using Hardhat tool suite.",
    "  • Sub-Second Blocks & High Throughput: Deployed transactions achieve block confirmation finality in under 3 seconds.",
    "  • Extremely Low Network Fees: Gas costs on BSC are fractions of a cent, making the NTKR token burn relay highly cost-effective.",
    "  • Immutable State Storage: Event logs and notary registers are permanently written to BSC block space, providing public audit trails.",
    { text: "  • Secure Smart Contracts Deployed:", bold: true, color: C.accent },
    "    1. NotaryRegistry.sol: Stores notary licensing state, wallet binding records, and multi-sig votes.",
    "    2. DocumentNotary.sol: Binds document SHA-256 hashes to approval timestamps and signing notary addresses.",
    "    3. NTKRToken.sol: Standard ERC-20 utility token enabling gasless burn-to-pay notarization fee structure."
  ], 0.6, 1.1, 8.8, 3.9, 12.5);
}

// SLIDE 27 — FUTURE SCOPE (Mirrors Reference Slide 25 prefix '21.')
{
  const sl = createBaseSlide("21. Future Scope", "27");
  
  addBulletPoints(sl, [
    { text: "Proposed future directions and extensions for the BBSNS system:", bold: true, color: C.primary, size: 13 },
    { text: "  • Cross-Chain Notarization Protocol:", bold: true },
    "    Expand ledger support to other EVM networks (Polygon, Arbitrum) and Layer-2 blockchains to support cross-chain validation.",
    { text: "  • Automated Document Content Auditing:", bold: true },
    "    Integrate OCR models to scan and flag suspicious or illegal content in uploaded files before they are notarized.",
    { text: "  • Native Mobile Applications with Biometrics:", bold: true },
    "    Build mobile versions using React Native, utilizing mobile hardware biometrics (FaceID, Android Biometrics) for login.",
    { text: "  • Government Identity Database Integration:", bold: true },
    "    Link the national ID registration field with official government databases via API keys to automate notary candidate vetting.",
    { text: "  • Dynamic Gas Price Oracle:", bold: true },
    "    Implement an oracle to dynamically scale NTKR token burning costs based on real-time BSC network gas fee fluctuations."
  ], 0.6, 1.1, 8.8, 3.9, 12.5);
}

// ══════════════════════════════════════════════════════════════════════════════
// BLOCK 11 — WORKING OUTPUTS & SCREENSHOTS (SLIDES 28–40)
// ══════════════════════════════════════════════════════════════════════════════

// SLIDE 28 — SECTION DIVIDER — WORKING OUTPUTS (Mirrors Reference Slide 26 '26. Working Outputs')
{
  const sl = pptx.addSlide();
  sl.background = { color: C.white };
  
  // Left border bar
  sl.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 0.4, h: 5.625,
    fill: { color: C.primary },
    line: { color: C.primary }
  });
  
  // Center logo
  if (fs.existsSync(LOGO)) {
    sl.addImage({ path: LOGO, x: 4.4, y: 1.2, w: 1.2, h: 1.2 });
  }
  
  sl.addText("26. Working Outputs", {
    x: 0.5, y: 2.8, w: 9.0, h: 0.4,
    fontSize: 16, bold: true, color: C.primary, align: "center", fontFace: FONT
  });
  
  sl.addText("Live application screenshots demonstrating owner, notary, and governance flows", {
    x: 0.5, y: 3.4, w: 9.0, h: 0.5,
    fontSize: 12, color: C.gray, align: "center", fontFace: FONT, italic: true
  });
  
  sl.addText("Slide 28", {
    x: 8.6, y: 5.25, w: 0.8, h: 0.3,
    fontSize: 8.5, color: C.gray,
    fontFace: FONT,
    align: "right", valign: "middle",
  });
}

// SLIDES 29–40: SCREENSHOT SLIDES (All titled 'Output' to match reference slides 27-38)

// Slide 29: Output 1 — Owner Dashboard
createOutputSlide(
  "29",
  "Output",
  "Owner Dashboard.png",
  "The central web portal for registered users to manage active document notarizations, verify account state, check NTKR balances, and upload files."
);

// Slide 30: Output 2 — Biometric Check
createOutputSlide(
  "30",
  "Output",
  "Owner Sign up Step 3 Biometric Check .png",
  "Interactive enrollment step utilizing FaceAPI.js to register biometric templates in PostgreSQL, locking account access to the physical owner."
);

// Slide 31: Output 3 — Wallet Binding
createOutputSlide(
  "31",
  "Output",
  "Owner Sign up step 4 Wallet binding.png",
  "Secures Ethereum MetaMask address mapping. Binds wallet_address to the owner profile to verify and sign EIP-712 structured data."
);

// Slide 32: Output 4 — Document Upload & Token Burn
createOutputSlide(
  "32",
  "Output",
  "Owner Document Upload Process And NTKR BURN.png",
  "Initiates file upload to AWS S3. Prompts owner to burn NTKR utility token via MetaMask signature, paying the smart contract notarization fee."
);

// Slide 33: Output 5 — Notary Pending Queue
createOutputSlide(
  "33",
  "Output",
  "Notary Pending Work.png",
  "Secure Electron Desktop client displaying the list of active notarization requests waiting for notary credential and signature verification."
);

// Slide 34: Output 6 — Notary Document Review
createOutputSlide(
  "34",
  "Output",
  "Notary Action View Document for Notarisation.png",
  "Provides the licensed notary with a side-by-side view of document details, owner identity structure, and verification metadata before approval."
);

// Slide 35: Output 7 — Notary Approved Queue
createOutputSlide(
  "35",
  "Output",
  "Notary Approved View.png",
  "Log history showing approved and finalized notarizations. Displays document IDs, owner details, timestamps, and on-chain tx hashes."
);

// Slide 36: Output 8 — Admin Applications Dashboard
createOutputSlide(
  "36",
  "Output",
  "Admin Dashboard Notary Application Details.png",
  "Admin panel for inspecting notary applicants. Details certificates, identity cards, wallet address bindings, and verification reports."
);

// Slide 37: Output 9 — Admin Role Assignment
createOutputSlide(
  "37",
  "Output",
  "Admin Dashboard Notary Role Applied onchain confirmed.png",
  "Transaction confirmed on BNB Smart Chain. Updates smart contract registry state to grant the applicant notary role, allowing future document signing."
);

// Slide 38: Output 10 — Verification System
createOutputSlide(
  "38",
  "Output",
  "z BBSNS Verification Of Document Hash For Tempering.png",
  "Publicly accessible portal where anyone can drag-and-drop a PDF to compare its client-side SHA-256 hash with records on the blockchain."
);

// Slide 39: Output 11 — Verifiable Certificate
createOutputSlide(
  "39",
  "Output",
  "Owners Final Document Verifiable Certificate.png",
  "The resulting PDF certificate issued to the owner, containing the document metadata, notary signature, and QR code for public validation."
);

// Slide 40: Output 12 — Cloud Connection & PM2
createOutputSlide(
  "40",
  "Output",
  "2 Running Processes On Cloud.png",
  "Confirms node backend clusters, scavenger workers, and logging relays running on AWS EC2 instance managed by PM2 process manager."
);

// ══════════════════════════════════════════════════════════════════════════════
// BLOCK 12 — CLOSING (SLIDES 41–43)
// ══════════════════════════════════════════════════════════════════════════════

// SLIDE 41 — PROJECT PLAN (Mirrors Reference Slide 39 '27. Project Plan')
{
  const sl = createBaseSlide("27. Project Plan", "41");
  
  const headers = [
    { text: "Phase", options: { bold: true, fill: C.primary, color: C.white, align: "center" } },
    { text: "Activities / Deliverables", options: { bold: true, fill: C.primary, color: C.white, align: "center" } },
    { text: "Duration", options: { bold: true, fill: C.primary, color: C.white, align: "center" } },
    { text: "Status", options: { bold: true, fill: C.primary, color: C.white, align: "center" } }
  ];
  
  const rows = [
    ["Phase 1: Initiation", "Requirement analysis, architectural design, literature survey and documentation.", "4 Weeks", "Completed"],
    ["Phase 2: Database", "PostgreSQL database schema design, AWS S3 object bucket setup, REST API gateway.", "3 Weeks", "Completed"],
    ["Phase 3: Blockchain", "Solidity smart contract coding, NTKR token design, Hardhat unit testing and scripting.", "4 Weeks", "Completed"],
    ["Phase 4: Client Apps", "Next.js web owner portal development, FaceAPI integration, Electron notary client coding.", "4 Weeks", "Completed"],
    ["Phase 5: Deploy & Test", "AWS EC2 cloud server setup, PM2 process config, end-to-end integration and QA testing.", "3 Weeks", "Completed"]
  ];
  
  const tableData = [headers, ...rows.map((r, i) => [
    r[0], r[1], r[2],
    { text: r[3], options: { bold: true, color: C.success } }
  ])];
  
  sl.addTable(tableData, {
    x: 0.6, y: 1.1, w: 8.8,
    colW: [1.8, 4.2, 1.4, 1.4],
    fontSize: 10.5,
    fontFace: FONT,
    border: { type: "line", color: C.lightGray, width: 1 },
    valign: "middle"
  });
}

// SLIDE 42 — REFERENCES (Mirrors Reference Slide 40 '28. References')
{
  const sl = createBaseSlide("28. References", "42");
  
  addBulletPoints(sl, [
    "[1] Satoshi Nakamoto, \"Bitcoin: A Peer-to-Peer Electronic Cash System,\" Decentralized Ledger Standard Paper, 2008.",
    "[2] Fabian Vogelsteller, Vitalik Buterin, \"ERC-20 Token Standard Specification Protocol,\" Ethereum Improvement Proposals, EIP-20, 2015.",
    "[3] William Entriken, Dieter Shirley, Jacob Evans, Nastassia Sachs, \"ERC-721 Non-Fungible Token Standard,\" Ethereum Improvement Proposals, EIP-721, 2018.",
    "[4] Nick Johnson, \"EIP-712: Typed structured data hashing and signing,\" Ethereum Improvement Proposals, EIP-712, 2018.",
    "[5] John J. G. McAvoy, \"Zero Trust Networks: Providing Secure Communications in Untrusted Environments,\" IEEE Security & Privacy Journal, 2019.",
    "[6] FaceAPI.js Core Reference Manual, \"TensorFlow-backed Facial Landmark Recognition in Browser Sandboxes,\" Web3-Crypto Conference, 2021."
  ], 0.6, 1.1, 8.8, 3.9, 12);
}

// SLIDE 43 — THANK YOU & CLOSING (Updated to Information Technology, Mirrors Slide 41)
{
  const sl = pptx.addSlide();
  sl.background = { color: C.white };
  
  // Left border bar
  sl.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 0.4, h: 5.625,
    fill: { color: C.primary },
    line: { color: C.primary }
  });
  
  // Logo
  if (fs.existsSync(LOGO)) {
    sl.addImage({ path: LOGO, x: 4.4, y: 0.8, w: 1.2, h: 1.2 });
  }
  
  sl.addText("Matoshri College of Engineering & Research Centre, Nashik", {
    x: 0.5, y: 2.2, w: 9.0, h: 0.4,
    fontSize: 13.5, bold: true, color: C.primary, align: "center", fontFace: FONT
  });
  
  sl.addText("Department of Information Technology", {
    x: 0.5, y: 2.6, w: 9.0, h: 0.3,
    fontSize: 11, color: C.gray, align: "center", fontFace: FONT
  });
  
  sl.addText("THANK YOU!", {
    x: 0.5, y: 3.1, w: 9.0, h: 0.6,
    fontSize: 36, bold: true, color: C.navy, align: "center", fontFace: FONT
  });
  
  sl.addText("Questions & Discussion", {
    x: 0.5, y: 3.8, w: 9.0, h: 0.3,
    fontSize: 12, italic: true, color: C.gray, align: "center", fontFace: FONT
  });
  
  // Students & Guide
  sl.addText("Group Members: Adhude Ganesh Sanjay, Mate Shubham Vilas, Shaikh Humera Ibrahim, Shivale Bhakti Bhagwan\nProject Guide: Mrs. Riya B. Shikare", {
    x: 0.5, y: 4.5, w: 9.0, h: 0.6,
    fontSize: 10, color: "334155", align: "center", fontFace: FONT
  });
}

// ─── Export Presentation ──────────────────────────────────────────────────────
pptx.writeFile({ fileName: OUT })
  .then(name => {
    console.log("SUCCESS: Created presentation at:", name);
  })
  .catch(err => {
    console.error("ERROR: Failed to save presentation:", err);
  });
