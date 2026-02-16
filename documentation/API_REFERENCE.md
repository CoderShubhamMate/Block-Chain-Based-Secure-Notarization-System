# API REFERENCE SPECIFICATION
## BBSNS Backend Services

### 1. Authentication Endpoints
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | User enrollment (Passwords, Wallet, Biometrics). | Public |
| `POST` | `/auth/login` | Session initiation and JWT issuance. | Public |
| `POST` | `/auth/nonce` | Generate unique nonce for signing actions. | Public |
| `POST` | `/auth/remote/session` | Initialize a Desktop-to-Browser handshake. | Public |
| `GET` | `/auth/remote/status/:id` | Poll for session status and security challenge. | Public |

### 2. Document & Notarization Endpoints
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/documents` | Upload document and generate server-side hash. | User+ |
| `GET` | `/api/documents` | Retrieve user-specific or pending documents. | Role-Based |
| `PATCH` | `/api/documents/:id` | Update status (Verification/Rejection). | Notary+ |

### 3. Governance Endpoints
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/governance/proposals` | Propose a system-wide administrative action. | Admin |
| `POST` | `/api/governance/proposals/:id/vote` | Cast high-integrity vote on a proposal. | Admin |

### 4. Error Codes & Responses
- **401 Unauthorized**: Missing or invalid JWT/Signature.
- **403 Forbidden**: Insufficient role or blocked by security whitelist.
- **429 Too Many Requests**: Triggered by the layered Rate Limiter.
- **500 Internal Error**: Database or blockchain connectivity failure.
