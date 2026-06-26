# System Impact Evaluation: Fully On-Chain Governance

## 1. What it Affects (System Scope)
*   **Owner Flow:** Unaffected.
*   **Notary Flow:** Remote Auth UI and voting mechanism.
*   **Admin Flow:** Proposal Creation UI, Voting UI, Execution UI.
*   **Backend API:** `routes/governance.js` (removal of off-chain endpoints).
*   **Database:** `governance_votes` (deprecated), `governance_proposals` (modified to rely on blockchain events).
*   **Blockchain:** Gas usage will increase significantly. Users will interact directly with `BBSNSMultiSig.sol`.

## 2. What Can Break (Worst-Case Scenario)
*   **Double-Proposal Requirement:** Because `BBSNSMultiSig.sol` can only execute ONE function call per proposal, promoting an Admin will require two separate voting processes: one for `NotaryRegistry` and one for `BBSNSMultiSig`.
*   **Remote Auth Gas Failures:** Mobile WalletConnect connections often drop or fail when broadcasting live transactions compared to simple signatures.
*   **Database Desync:** If the backend indexer misses a `TransactionSubmitted` or `TransactionConfirmed` event, the UI will permanently desync from the blockchain truth.

## 3. Expected Behavior After Change
*   All Admins/Notaries must pay BNB gas to draft proposals or cast votes.
*   The "Verify" buttons will link to actual BscScan transaction hashes for every individual vote.
*   The system will enforce strict on-chain validation; if a user is not a registered `signer` in the MultiSig contract, their transaction will revert immediately on MetaMask.
