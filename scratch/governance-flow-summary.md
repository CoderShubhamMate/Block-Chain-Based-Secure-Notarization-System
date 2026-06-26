# Governance UI Discrepancy & Flow Summary

## What caused the issue?

You reported successfully casting an approval for a proposal, seeing the success toast, but the UI did not update: the proposal stayed in "1 PENDING", no transaction appeared in Multi-Sig, and the "Cast Approval" button was still showing.

**The First Bug (UI Sync):** The backend endpoint (`GET /api/governance/proposals`) was querying the `governance_proposals` table but failing to aggregate the vote data from the `governance_votes` table. Because the backend omitted `approvals`, `rejections`, and `my_vote` fields, the frontend defaulted to showing `0 Approvals` and re-rendered the "Cast Approval" buttons, making it look like your vote wasn't counted.

**The Second Bug (Deadlock):** You correctly pointed out that since there is only 1 Admin, the system should have fast-tracked the proposal immediately, yet it deadlocked. I discovered that the background logic responsible for checking the Admin threshold (`SELECT COUNT(*) FROM users WHERE role >= 3`) was crashing silently. The database column for `role` is a text string (`'admin'`), so comparing it with an integer (`>= 3`) threw a Postgres type mismatch error, aborting the auto-pass logic entirely.

**The Fix:** I have updated the SQL query to correctly check `WHERE role = 'admin' OR role = 'owner'` and correctly aggregate the vote counts. I have deployed this fix directly to your EC2 production environment. The proposal should now correctly fast-track and update the UI.

---

## Full Lifecycle of a Governance Proposal

Here is the step-by-step lifecycle flow of a proposal from creation to on-chain execution in the BBSNS protocol:

### 1. Creation (Off-Chain Drafting)
*   An Administrator selects a proposal type (e.g., "Promote User to Administrator") and submits it.
*   The proposal is saved in the PostgreSQL Database (`governance_proposals`) with the status: **`active`**.

### 2. Off-Chain Voting (Quorum Gathering)
*   The proposal appears under the **Active Governance Quorum** tab for all eligible Admins/Notaries. 
*   Eligible users click **Cast Approval** or **Cast Rejection**. Their EIP-712 cryptographic signatures are collected and stored securely in the database (`governance_votes`). The proposal itself does not interact with the blockchain during this stage.

### 3. Threshold Achievement
*   Once enough approvals are gathered (or immediately if you are the sole admin), the backend automatically updates the proposal's database status from `active` to **`passed`**.
*   The proposal is now mathematically guaranteed to succeed and is ready for final execution.

### 4. On-Chain Execution
*   When the status is `passed`, an **"Execute On-Chain"** button appears for Administrators in the frontend.
*   Clicking this button takes your cryptographic signature and submits it to the `BBSNSMultiSig` smart contract on the Binance Smart Chain.

### 5. Multi-Sig Finality
*   If the transaction is successful, the smart contract emits a `TransactionSubmitted` event and assigns it an `on_chain_tx_index`.
*   The backend saves this index. **Only proposals that possess an `on_chain_tx_index` will appear in the "Multi-Sig" tab.**

---

## Architectural Answer: How is off-chain data tracked on-chain?

You asked: *"if the proposal is off chain then how is it tracked that the proposal was created by whom with what purpose and who voted on chain?"*

In BBSNS, the connection between the off-chain proposal and the on-chain execution is maintained through cryptographic hashing:

1. **The Proposal Hash:** When an Admin creates a proposal (like "Promote User"), the backend generates a unique fingerprint (Hash) of its exact title, purpose, and timestamp.
2. **The Signature:** When you vote, your MetaMask wallet creates a cryptographic signature over that specific Hash.
3. **On-Chain Verification:** When the "Execute On-Chain" button is clicked, the relayer submits your signature and the Proposal Hash to the `BBSNSMultiSig` smart contract via the `submitWithSignature` function.

**The Result:** The blockchain permanently records the Proposal Hash and verifies that it was signed by your admin wallet address. Any third-party auditor can take the off-chain proposal details from the database, hash them, and mathematically prove that it perfectly matches the hash stored on the blockchain, confirming *what* the purpose was and *who* authorized it.
