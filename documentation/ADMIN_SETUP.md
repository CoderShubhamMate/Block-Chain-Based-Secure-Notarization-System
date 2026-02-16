# GOVERNANCE LIFECYCLE & ADMINISTRATION
## BBSNS Operational Framework

### 1. Introduction
The BBSNS Governance Model is a multi-phase lifecycle designed to transition from a secure system bootstrap to a fully decentralized, quorum-based administrative state.

### 2. Phase 0: System Bootstrap (Genesis)
In the absence of any registered administrators, the system enters an "Exceptional Authority" mode.

1.  **Configure Environment**: Open `backend/.env` and define the genesis wallet:
    ```env
    BOOTSTRAP_ADMIN_WALLET=0xYourWalletAddress
    ```
2.  **Register**: Open the Web App and Register a normal user account with that same wallet address.
3.  **Activate Access**: While `admin_count` is 0, the system grants this wallet "Genesis Authority" and displays the **Admin Control Center** in the user dashboard.

### 3. Phase 1: Institutional Promotion
The Bootstrap Administrator utilizes their genesis authority to promote the system's first set of permanent administrators.
- **Promotion Workflow**: Create a governance proposal of type `add_admin`.
- **Dynamic Quorum**: During Phase 1, the execution threshold is capped at **1 vote**, allowing the bootstrap authority to finalize the first promotion.

### 4. Phase 2: Autonomous Decentralization
Once the `admin_count` exceeds zero, the system automatically deactivates the Bootstrap Authority.
- **Steady-State Quorum**:
  - **1 Admin**: Threshold = 1
  - **2 Admins**: Threshold = 2
  - **3+ Admins**: Threshold = 3
- **Sign-off**: All future administrative actions (Role changes, user bans, etc.) must now pass through the quorum-based voting system.

---

### 5. Administrative Duties
- **Notary Authorization**: Review and approve `notary_application` records.
- **Identity Integrity**: Sanction or revoke KYC verification status for users.
- **System Hardening**: Monitor audit logs and manage rate-limiting parameters via configuration.
