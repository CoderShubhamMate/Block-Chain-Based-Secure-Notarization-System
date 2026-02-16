# SYSTEM ARCHITECTURE & TECHNICAL OVERVIEW
## Blockchain-Based Secure Notarization System (BBSNS)

### 1. Abstract
BBSNS is a distributed ecosystem designed to modernize the traditional notarization process. By combining **React/Next.js** for user interaction, **Electron** for secure desktop operations, **Express.js** for localized backend logic, and **Binance Smart Chain (BSC)** for immutable on-chain verification, the system provides a high-integrity platform for document lifecycle management.

### 2. Architectural Components
The system is divided into four primary layers:
- **Presentation Layer (Web-App)**: A responsive Next.js application for public document submission, notary review, and governance participation.
- **Client Layer (Desktop App)**: An Electron-based application providing high-privilege operations for Administrators and Notaries, including local signing and device binding.
- **Persistence & Logic Layer (Backend)**: A Node.js/Express server managing the 3-factor authentication state, governance logic, and database interactions.
- **Blockchain Layer (v5/BNB)**: Utilized for on-chain storage of document hashes and tokenized fee management (NTKR/NTK tokens).

### 3. UI Architecture Principles
To ensure consistency and performance, the system follows these rules:
1.  **Handless UI**: The UI is strictly managed by Electron (React). No other backend components (like Java) are permitted to render windows or components.
2.  **Single Instance**: Only one rendering instance (Chromium) is active at any time to prevent resource collisions.

### 4. Core Module Description
- **Authentication Engine**: Handles the layered security flow (Password, Wallet, and optional Biometric liveness).
- **Notarization Engine**: Manages document uploads, server-side hashing, and notary review workflows.
- **Governance Module**: Implements the proposal and voting system for administrative decentralization.
- **Blockchain Bridge**: Interfaces with smart contracts for transaction verification and token minting.

### 5. Technical Stack
- **Languages**: TypeScript, JavaScript, SQL.
- **Frameworks**: Next.js (Frontend), Express (Backend), Electron (Desktop).
- **Libraries**: Ethers.js, Radix-UI, TailwindCSS.
- **State Management**: PostgreSQL (Relational Data), JWT (Session Management).
### 6. Progress & Audit Report

#### ✅ Implemented Core Features
- **Hardened 3-Factor Authentication**: Email/Pass + National ID Hash + Wallet Signature + Biometric Face Matching.
- **Layered Rate Limiting**: IP-based and Wallet-based defense with progressive backoff.
- **Global Uniqueness**: Enforced `file_hash` uniqueness to prevent replay attacks.
- **Database Integrity**: Strict `CHECK` constraints on RBAC and data transparency.

#### 🛡️ Engineering Risk Register

| Risk ID | Component | Description | Status |
| :--- | :--- | :--- | :--- |
| R-001 | Database | Duplicate UNIQUE constraints on legacy columns. | **FIXED** |
| R-002 | Auth | Brute-force / Credential Stuffing. | **MITIGATED**|
| R-003 | Auth | Signature Replay Attacks. | **FIXED** |
| R-004 | Storage | Duplicate Document Notarization. | **FIXED** |
| R-005 | Frontend | Event Listener Leaks / Race Conditions. | **FIXED** |
| R-006 | Network | Secret Exposure in .env files. | **RESIDUAL** |
