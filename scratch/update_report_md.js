const fs = require('fs');

const mdPath = 'C:\\Users\\Lenovo\\OneDrive\\Desktop\\Final_pro\\Project Doc\\BBSNS\\21-04-2026\\BBSNS_Final_Report_v2.md';
if (!fs.existsSync(mdPath)) {
    console.error("File does not exist:", mdPath);
    process.exit(1);
}

let content = fs.readFileSync(mdPath, 'utf8');

// 1. Update List of Figures
const oldLof = `* Figure 4.1: The Three-Domain Architecture (TDA) Diagram
* Figure 5.1: Use Case Diagram
* Figure 5.2: Sequential Notarization Flow Diagram
* Figure 5.3: Complete Entity Relationship Diagram (ERD)
* Figure 5.4: State Transition Diagram for Identity Lifecycle
* Figure 7.1: 68-Point Landmark Extraction Layout
* Figure 10.1: Latency Distribution vs Request Concurrency
* Figure 10.2: FAR/FRR ROC Curve Analysis`;

const newLof = `* Figure 4.1: The Three-Domain Architecture (TDA) Diagram
* Figure 4.2: Biometric KYC Liveness Check Interface
* Figure 4.3: Secure Cryptographic Wallet Binding
* Figure 4.4: Owner Registration Completion State
* Figure 4.5: Document Owner Portal Dashboard
* Figure 4.6: Local SHA-256 Hash Calculation & S3 Upload Intent Trigger
* Figure 4.7: Notary Verification Queue Console
* Figure 4.8: Document Review & Verification Queue
* Figure 5.1: Use Case Diagram
* Figure 5.2: Sequential Notarization Flow Diagram
* Figure 5.3: Complete Entity Relationship Diagram (ERD)
* Figure 5.4: State Transition Diagram for Identity Lifecycle
* Figure 7.1: 68-Point Landmark Extraction Layout
* Figure 8.1: PM2 Running Services Process List
* Figure 8.2: Backend Event-Reconciliation Runtimes Logs
* Figure 10.1: Latency Distribution vs Request Concurrency
* Figure 10.2: FAR/FRR ROC Curve Analysis
* Figure 10.3: Cloud SSH Instance Secure Handshake
* Figure 10.4: Production API Gateway Health Check Verification
* Figure 10.5: Relational PostgreSQL Schema Overview
* Figure 10.6: Deployed Smart Contracts Explorer Verification
* Figure 10.7: Cryptographically Verifiable Digital Notarization Certificate
* Figure 10.8: Tamper-Detection Portal Verification Flow`;

if (content.includes(oldLof)) {
    content = content.replace(oldLof, newLof);
    console.log("Updated List of Figures.");
} else {
    console.log("WARNING: Could not find exact old List of Figures.");
}

// 2. Replace Spot 1 empty space
const spot1Old = `6. The backend updates the user's \`identity_state\` status to \`'ACTIVE'\`, and logs the transition in the \`user_state_history\` audit table.




## 4.3 Notarization Intent & S3 Storage Workflow`;

const spot1New = `6. The backend updates the user's \`identity_state\` status to \`'ACTIVE'\`, and logs the transition in the \`user_state_history\` audit table.

![Figure 4.2: Biometric KYC Liveness Check Interface](Working%20Proofs/Owner%20Sign%20up%20Step%203%20Biometric%20Check%20.png)

![Figure 4.3: Secure Cryptographic Wallet Binding](Working%20Proofs/Owner%20Sign%20up%20Step%204%20Wallet%20binding.png)

![Figure 4.4: Owner Registration Completion State](Working%20Proofs/Owner%20Sign%20Up%20Completed.png)

## 4.3 Notarization Intent & S3 Storage Workflow`;

if (content.includes(spot1Old)) {
    content = content.replace(spot1Old, spot1New);
    console.log("Replaced Spot 1.");
} else {
    // try with normalized newlines
    const normalizedContent = content.replace(/\r\n/g, '\n');
    const normalizedSpot1Old = spot1Old.replace(/\r\n/g, '\n');
    const normalizedSpot1New = spot1New.replace(/\r\n/g, '\n');
    if (normalizedContent.includes(normalizedSpot1Old)) {
        content = normalizedContent.replace(normalizedSpot1Old, normalizedSpot1New);
        console.log("Replaced Spot 1 (normalized).");
    } else {
        console.log("WARNING: Could not find Spot 1.");
    }
}

// 3. Replace Spot 2 empty space
const spot2Old = `7. The client sends the payment transaction hash to the backend to confirm the upload.






## 4.4 Stochastic Notary Allocation Pipeline`;

const spot2New = `7. The client sends the payment transaction hash to the backend to confirm the upload.

![Figure 4.5: Document Owner Portal Dashboard](Working%20Proofs/Owner%20Dashboard.png)

![Figure 4.6: Local SHA-256 Hash Calculation & S3 Upload Intent Trigger](Working%20Proofs/Owner%20Document%20Upload%20Process%20And%20NTKR%20BURN.png)

## 4.4 Stochastic Notary Allocation Pipeline`;

const normalizedContent = content.replace(/\r\n/g, '\n');
const normalizedSpot2Old = spot2Old.replace(/\r\n/g, '\n');
const normalizedSpot2New = spot2New.replace(/\r\n/g, '\n');

if (normalizedContent.includes(normalizedSpot2Old)) {
    content = normalizedContent.replace(normalizedSpot2Old, normalizedSpot2New);
    console.log("Replaced Spot 2.");
} else {
    console.log("WARNING: Could not find Spot 2.");
}

// 4. Replace Spot 3 empty space
const spot3Old = `5. The assigned notary receives the document review request in their Electron Desktop Console.



## 4.5 On-Chain Synchronization & Event Replay Defenses`;

const spot3New = `5. The assigned notary receives the document review request in their Electron Desktop Console.

![Figure 4.7: Notary Verification Queue Console](Working%20Proofs/Notary%20Dashboard.png)

![Figure 4.8: Document Review & Verification Queue](Working%20Proofs/Notary%20Pending%20Work.png)

## 4.5 On-Chain Synchronization & Event Replay Defenses`;

const normalizedSpot3Old = spot3Old.replace(/\r\n/g, '\n');
const normalizedSpot3New = spot3New.replace(/\r\n/g, '\n');

if (content.replace(/\r\n/g, '\n').includes(normalizedSpot3Old)) {
    content = content.replace(/\r\n/g, '\n').replace(normalizedSpot3Old, normalizedSpot3New);
    console.log("Replaced Spot 3.");
} else {
    console.log("WARNING: Could not find Spot 3.");
}

// 5. Replace Spot 4 empty space
const spot4Old = `This atomic update ensures that workers running in parallel do not claim the same sync task.



## 8.4 EVM Smart Contract Source Logic`;

const spot4New = `This atomic update ensures that workers running in parallel do not claim the same sync task.

![Figure 8.1: PM2 Running Services Process List](Working%20Proofs/2%20Running%20Processes%20On%20Cloud.png)

![Figure 8.2: Backend Event-Reconciliation Runtimes Logs](Working%20Proofs/3%20Backend%20Runtime%20Logs.png)

## 8.4 EVM Smart Contract Source Logic`;

const normalizedSpot4Old = spot4Old.replace(/\r\n/g, '\n');
const normalizedSpot4New = spot4New.replace(/\r\n/g, '\n');

if (content.replace(/\r\n/g, '\n').includes(normalizedSpot4Old)) {
    content = content.replace(/\r\n/g, '\n').replace(normalizedSpot4Old, normalizedSpot4New);
    console.log("Replaced Spot 4.");
} else {
    console.log("WARNING: Could not find Spot 4.");
}

// 6. Replace Spot 5 empty space
const spot5Old = `To verify that the system is fully functional and deployed in a real-world, high-availability cloud architecture, we audited the host VM instance and verified all system runtimes:







---`;

const spot5New = `To verify that the system is fully functional and deployed in a real-world, high-availability cloud architecture, we audited the host VM instance and verified all system runtimes:

![Figure 10.3: Cloud SSH Instance Secure Handshake](Working%20Proofs/1%20Cloud%20Connection.png)

![Figure 10.4: Production API Gateway Health Check Verification](Working%20Proofs/4%20Api%20Health%20check.png)

![Figure 10.5: Relational PostgreSQL Schema Overview](Working%20Proofs/5%20DB%20List%20of%20relations.png)

![Figure 10.6: Deployed Smart Contracts Explorer Verification](Working%20Proofs/6%20All%20Contract%20and%20deployer.png)

![Figure 10.7: Cryptographically Verifiable Digital Notarization Certificate](Working%20Proofs/Digital%20Certificate%20of%20confirmation%20.png)

![Figure 10.8: Tamper-Detection Portal Verification Flow](Working%20Proofs/z%20BBSNS%20Verification%20Of%20Document%20Hash%20For%20Tempering.png)

---`;

const normalizedSpot5Old = spot5Old.replace(/\r\n/g, '\n');
const normalizedSpot5New = spot5New.replace(/\r\n/g, '\n');

if (content.replace(/\r\n/g, '\n').includes(normalizedSpot5Old)) {
    content = content.replace(/\r\n/g, '\n').replace(normalizedSpot5Old, normalizedSpot5New);
    console.log("Replaced Spot 5.");
} else {
    console.log("WARNING: Could not find Spot 5.");
}

fs.writeFileSync(mdPath, content, 'utf8');
console.log("Successfully updated BBSNS_Final_Report_v2.md!");
