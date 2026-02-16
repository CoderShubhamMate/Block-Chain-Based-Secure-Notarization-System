# SECURITY ARCHITECTURE & THREAT MODEL
## BBSNS Hardened Security Posture

### 1. Security Philosophy
The BBSNS Security Model is built on the principle of **Defense in Depth**, utilizing multiple layers of authentication, integrity checks, and rate limiting to protect sensitive notarization data.

### 2. Multi-Factor Authentication (MFA)
The system employs layered authentication based on the operation's risk level:
- **Registration**: Full **3-Factor Authentication** (3FA)
    1. **Knowledge**: Password.
    2. **Possession**: Wallet Signature.
    3. **Inherence**: Biometric Face Scan.
- **Login**: Secure **Multi-Factor Authentication** (MFA)
    1. **Knowledge**: Password.
    2. **Possession**: Wallet Signature.
    3. **Validation**: National ID verification.
- **Signing**: Cryptographic Wallet Signature for non-repudiation.

### 3. Desktop-to-Browser Security (Remote Signing)
To mitigate the risks of private key exposure in the Electron environment, BBSNS implements a **Remote Handshake Flow**:
- **Challenge Generation**: The Desktop app requests a session challenge from the backend.
- **Out-of-Band Verification**: The user signs the challenge in their system's default browser (MetaMask).
- **Session Linking**: The backend validates the signature across the `device_id` and `sessionId` bounds, issuing a temporary JWT.

### 4. Rate Limiting & Abuse Detection
Layered rate limiting prevents brute-force and DDoS attempts:
- **IP-Level**: Global request throttling.
- **Wallet-Level**: Limits attempts per specific Ethereum address.
- **Identifier-Level**: Limits attempts for specific user logins (Emails).
- **Progressive Backoff**: Exponentially increases response time after successive failures.

### 5. Data Integrity & Trust Boundaries
- **Server as Hash Authority**: All file hashes are calculated on the server side to prevent "Semantic Fraud."
- **Immutable Audit Logs**: Key actions (Biometric matches, token minting, governance votes) are written to audit trails with fingerprinting.
- **RBAC Isolation**: Strict role-based access control (RBAC) ensures Notaries cannot act as Admins, and Users cannot access administrative panels.
