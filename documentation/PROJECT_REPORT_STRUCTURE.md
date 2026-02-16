# PROJECT REPORT: SYSTEM ARCHITECTURE & GOVERNANCE
## Thesis / Main Report Structure

### 1. Abstract
Brief summary of the BBSNS platform, the modernization of notarization, and the integration of blockchain and 3-factor authentication for data integrity.

### 2. Introduction
- **Background**: Traditional notarization challenges (Paper-based, fraud-prone).
- **Problem Statement**: Lack of decentralized authority and secure identity binding in digital notarization.
- **Objectives**: Implement a high-integrity, decentralized, and user-friendly notarization ecosystem.

### 3. Literature Survey
- Overview of existing Digital Signature (PKI) models.
- Comparison of Centralized vs. Decentralized Notarization.
- Review of EIP-191 and biometric liveness standards.

### 4. System Architecture
- **Layered Design**: Frontend (React), Desktop (Electron), Backend (Node), Blockchain (BNB).
- **Communication Flow**: Remote Signing Handshake (Desktop for security, Browser for wallet).
- **Database Model**: Relational structure for auditability.

### 5. Module Description
- **Authentication**: 3FA (Pass + Wallet + Biometrics).
- **Notarization Engine**: Submission, Server-Side Hashing, and Status workflows.
- **Governance Module**: The Proposal-Vote-Execute cycle.
- **On-Chain Audit**: Interaction with BSC smart contracts.

### 6. Security & Governance Design
- **Threat Model**: Mitigation of Replay Attacks and Sybil Attacks.
- **Governance Bootstrap**: The 3-phase transition to decentralized state.
- **Rate Limiting**: Multi-layered abuse detection.

### 7. Implementation Details
- **Frontend**: TailwindCSS/Radix-UI components.
- **Desktop**: Electron Main/Preload isolation.
- **Smart Contracts**: Solidity fee management and hash indexing.

### 8. Testing & Results
- **Functional Testing**: Success of Remote Signing.
- **Governance Testing**: Threshold enforcement.
- **Security Testing**: Rate limiter effectiveness.

### 9. Conclusion & Future Scope
- **Conclusion**: Achievement of decentralized trust in digital document management.
- **Limitations**: Dependency on browser wallet providers.
- **Future Scope**: Fully onchain file storage (IPFS/Arweave) and Zero-Knowledge Proofs for identity privacy.

### 10. References
- List of academic papers and technical specifications (Node.js, Electron, Ethers.js, etc.).
