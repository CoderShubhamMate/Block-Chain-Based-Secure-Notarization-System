# Changelog

All notable changes to the BBSNS project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased] — In Progress

### Added
- Comprehensive credential template files (`*.example.json`, `.env.example`)
- Hardened `.gitignore` with explicit credential and artifact exclusions
- `docs/` directory with architecture, guides, and API documentation
- Smart contract NatSpec documentation
- Backend JSDoc documentation
- GitHub Actions CI/CD workflows
- Jest unit and integration test suites
- OpenAPI specification skeleton

---

## [1.0.0-beta] — 2026-08-31 *(Planned)*

> First public milestone — all documentation, templates, and tests complete.

---

## [0.9.0] — 2026-06-29

### Changed
- Major `.gitignore` hardening to explicitly exclude all credential file patterns
- Expanded `backend/.env.example` to document every environment variable in the system
- Added `backend/secrets.example.json` — sanitized template for AWS Secrets Manager structure
- Added `backend/config.example.json` — system configuration template
- Added `Web-App/.env.example` — Next.js client environment template
- Added `contracts/deployments.example.json` — post-deployment address template
- Added `Frontend Desktop Application/.env.example` — Electron app environment template

---

## [0.8.0] — 2026-06-26

### Added
- Repository cleaned and synchronized (removed 60+ obsolete temporary files)
- Git history secured — all temp/debug scripts safely removed from tracking

---

## [0.7.0] — 2026-05-20 *(Approximate)*

### Added
- Complete reconciliation worker with self-healing blockchain sync
- Identity sync worker (off-chain DB ↔ on-chain registry)
- Role sync worker
- Reputation scoring worker
- Worker Registry service for health monitoring

### Changed
- Backend `server.js` upgraded to boot-time structural route audit
- `requirePrivilege` middleware enhanced with block-staleness detection and session degradation states (VERIFIED/DEGRADED/UNKNOWN)

---

## [0.6.0] — 2026-04-15 *(Approximate)*

### Added
- Electron Desktop Application for Notary Console
  - OS-level JWT storage via `safeStorage`
  - Device fingerprinting with encrypted device ID
  - Dual-monotonic JWT versioning gate
  - Remote auth flow via WebView iframe
- AWS KMS integration for relayer key management

---

## [0.5.0] — 2026-03-20 *(Approximate)*

### Added
- Full governance system (proposals, voting, multi-sig execution)
- `BBSNSMultiSig.sol` — on-chain governance contract with timelock and signer rotation
- Governance API routes (1,986 lines of enterprise governance logic)
- On-chain proposal execution via multi-sig batch transactions

---

## [0.4.0] — 2026-02-10 *(Approximate)*

### Added
- Next.js 14 Web Application (Document Owner Portal)
  - Document upload flow with SHA-256 client-side hashing
  - Token-gated upload (NTKR burn)
  - Document state machine UI with real-time status
  - Governance voting interface

---

## [0.3.0] — 2026-01-15 *(Approximate)*

### Added
- NTKR Token Contract (ERC-20 with daily caps, sponsored packages, burn-for-upload)
- NTK Token Contract
- GenesisActivation and GenesisNFT contracts
- Token service (`ntk.service.js`) — relayer-controlled token management
- Dispute system route

---

## [0.2.0] — 2025-12-01 *(Approximate)*

### Added
- Core smart contract suite:
  - `DocumentRegistry.sol` — EIP-712 signature verification, document hashing
  - `NotaryRegistry.sol` — on-chain role registry (OWNER/NOTARY/ADMIN)
- Gasless EIP-712 relayer backend integration
- Background reconciliation worker (DB ↔ blockchain sync)
- AWS S3 document vault integration

---

## [0.1.0] — 2025-10-01 *(Project Inception)*

### Added
- Initial project architecture and monorepo structure
- Node.js/Express API foundation
- PostgreSQL database schema with knex migrations
- Zero-trust actor middleware (`requirePrivilege`)
- JWT + ECDSA wallet-signature authentication
- Basic document upload and notarization flow

---

*For questions, see [CONTRIBUTING.md](CONTRIBUTING.md) or open a [GitHub Discussion](https://github.com/CoderShubhamMate/Block-Chain-Based-Secure-Notarization-System/discussions).*
