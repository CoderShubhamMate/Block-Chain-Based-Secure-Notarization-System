# DATABASE SCHEMA & DATA INTEGRITY
## BBSNS Relational Model Specification

### 1. Conceptual Model
The BBSNS database is optimized for auditability and cryptographic binding. It enforces strict constraints to prevent orphaned records and ensure that every notarization is linked to a verified identity.

### 2. Core Tables

#### `users`
Primary entity for identity management.
- **`wallet_address`**: Unique primary key (case-insensitive).
- **`role`**: ENUM ('user', 'notary', 'admin').
- **`password_hash`**: Bcrypt-stored secret.
- **`national_id_hash`**: SHA-256 salted hash for privacy-preserving identity binding.
- **`face_descriptor`**: JSON array of 128-float biometric vectors.

#### `documents`
Repository for notarization requests.
- **`file_hash`**: Unique SHA-256 identifier (Server-side generated).
- **`status`**: 'pending', 'verified', 'rejected'.
- **`notary_id`**: Foreign key to `users`.

#### `remote_auth_sessions`
Transactional table for the Desktop-to-Browser handshake.
- **`challenge`**: 256-bit random hex string.
- **`device_id`**: Bound hardware identifier.
- **`token`**: Temporary JWT issued after successful signature verification.

#### `governance_proposals` & `governance_votes`
The decentralized authority tracking system.
- **`type`**: 'add_admin', 'add_notary', 'ban_user', etc.
- **`status`**: 'active', 'executed'.
- **`signature`**: Verification signature of the voting administrator.

---

### 3. Integrity Constraints
- **Foreign Key Enforcement**: Ensures transactions and documents always have a valid owner.
- **Cascading Logic**: Controlled deletion of records to maintain audit trails.
- **Check Constraints**: Enforces liveness status and KYC verification states.
