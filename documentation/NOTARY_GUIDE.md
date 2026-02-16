# NOTARY GUIDE
## Professional Verification Services (BBSNS)

### 1. The Notary Role
Notaries are Level 2 authority figures responsible for auditing document submissions and providing cryptographic signatures to authorize on-chain notarization.

### 2. Enrollment & Key Generation
1.  **Application**: Register as a standard user, then submit a "Notary Application" via the dashboard.
2.  **Approval**: An administrator must approve your application via the Governance system.
3.  **RSA Key Hardware Binding**:
    - Launch the **BBSNS Desktop Application**.
    - Navigate to **Notary Settings**.
    - Generate an **RSA-4096 Key Pair**.
    - Upload the **Public Key** to the server for document encryption.

### 3. Review Workflow
1.  **Notification**: You will receive a notification when a user selects you for a review.
2.  **Audit**:
    - Download and inspect the document contents.
    - Verify the server-side file hash.
3.  **Action**:
    - **Verify**: Digitally sign the verification challenge. This triggers the blockchain token payout and indexes the document as `verified`.
    - **Reject**: Provide a clear reason for rejection (e.g., poor document quality, identity mismatch).
