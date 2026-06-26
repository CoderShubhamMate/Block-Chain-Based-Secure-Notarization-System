const fs = require('fs');
const path = require('path');

const dirPath = 'C:\\Users\\Lenovo\\OneDrive\\Desktop\\Final_pro\\BBSNS\\Working Proofs';
const htmlPath = path.join(dirPath, 'bbsns_capstone_diagrams.html');

let htmlContent = fs.readFileSync(htmlPath, 'utf8');

// The styling for the new buttons and details
const newStyles = `
        /* Image Details Toggle Styles */
        .image-card-actions {
            margin-top: 16px;
            text-align: center;
        }
        .expand-btn {
            background-color: transparent;
            color: var(--accent);
            border: 1px solid var(--accent);
            padding: 8px 16px;
            font-size: 12px;
            font-weight: 600;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .expand-btn:hover {
            background-color: var(--accent);
            color: white;
        }
        .image-details {
            margin-top: 16px;
            padding: 16px;
            background-color: #0f172a;
            border-radius: 8px;
            border: 1px solid #334155;
            font-size: 13px;
            color: var(--text-secondary);
            line-height: 1.5;
            text-align: left;
            display: none;
        }
        .image-details.active {
            display: block;
            animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
`;

// Insert styles if not already present
if (!htmlContent.includes('.image-details {') && htmlContent.includes('/* Action Buttons */')) {
    htmlContent = htmlContent.replace('/* Action Buttons */', newStyles + '\n        /* Action Buttons */');
}

// Add toggle function to scripts
const toggleScript = `
        function toggleImageDetails(btn, id) {
            const detailsDiv = document.getElementById(id);
            if (detailsDiv.classList.contains('active')) {
                detailsDiv.classList.remove('active');
                btn.innerText = 'View Details';
            } else {
                detailsDiv.classList.add('active');
                btn.innerText = 'Hide Details';
            }
        }
`;
if (!htmlContent.includes('function toggleImageDetails')) {
    htmlContent = htmlContent.replace('function toggleSidebar() {', toggleScript + '\n        function toggleSidebar() {');
}

// Map of descriptions
const descriptions = {
    "Owner Sign up Step 3 Biometric Check .png": "The user completes a mandatory facial liveness check to prevent sybil attacks and verify physical presence before account creation.",
    "Owner Sign up step 3 completed.png": "Confirmation screen showing the biometric check has passed, linking the verified identity to the ongoing session.",
    "Owner Sign up Step 4 Wallet binding.png": "The user is prompted to connect their Web3 wallet (e.g., MetaMask). This wallet will be cryptographically bound to their identity.",
    "Owner Sign Up Step 4 Signature For Confirmation.png": "The user signs a cryptographic message using their connected wallet to definitively prove ownership of the private keys.",
    "Owner Sign Up Completed.png": "The owner onboarding flow is finalized. The database now securely holds the owner's biometric verification status and wallet address.",
    "Owner Sign In Signature.png": "Authentication process where the returning owner proves their identity by signing a login payload with their Web3 wallet.",
    "Owner Buying NTKR Token.png": "The owner interacts with the smart contract via the dApp to purchase NTKR tokens, which are required for notarization fees.",
    "Owner Dashboard.png": "The main dashboard where the owner can view their NTKR balance, upload new documents, and track pending notarization requests.",
    "Owner Document Upload Process And NTKR BURN.png": "The document is selected, its SHA-256 hash is calculated locally in the browser, and an on-chain transaction is triggered to burn the required NTKR fee.",
    "Ower NTKR Burn Transaction Confirmed.png": "The BNB Chain confirms the NTKR token burn transaction, allowing the backend to accept the secure file upload to S3.",
    "Owner Dashboard Document Status changed to approved.png": "The owner's dashboard updates in real-time as a Notary approves the document. The status changes to 'Approved'.",
    "Owners Final Document Verifiable Certificate.png": "The generated digital certificate containing the document hash, Notary details, Owner wallet, and blockchain transaction hash.",
    "Notary Register Phase 1.png": "The prospective notary submits their personal details, legal credentials, and professional identification for manual review.",
    "Notary Register Phase 2.png": "The notary completes their identity verification and sets up their security credentials for the platform.",
    "Notary Register Phase 3.png": "The final stage of application submission where the notary binds their Web3 wallet for receiving protocol fees.",
    "Notary Wallet Confirmation Before Activation.png": "The system validates the notary's wallet address before an Administrator officially activates their account.",
    "Notary Email For Activation Of Account.png": "An automated email notification sent to the Notary once the Admin and Governance Multi-Sig approve their application.",
    "Notary Account Activation.png": "The notary clicks the secure activation link to initialize their dashboard access and on-chain permissions.",
    "Notary Account Activation Confirmed.png": "The activation process successfully finalizes, granting the Notary access to the document review queues.",
    "Notary Login Step 1.png": "The notary initiates the multi-factor login process using their registered credentials.",
    "Notary Login Step 2.png": "The notary must verify their physical presence with a biometric or 2FA check to ensure secure access to sensitive documents.",
    "Notary Login Step 3.1.png": "The notary connects their authorized Web3 wallet to prepare for signing transactions.",
    "Notary Login Step 3.2.png": "The notary signs a cryptographic payload with their wallet to complete the highly secure, passwordless authentication flow.",
    "Notary Dashboard.png": "The control center for the Notary, displaying pending document review requests, processed documents, and earned fees.",
    "Notary Pending Work.png": "A detailed table view of all documents waiting for cryptographic notarization, filtered by state and urgency.",
    "Notary Action View Document for Notarisation.png": "The notary opens a specific document to review its contents securely streamed from the AWS S3 vault.",
    "Notary Process Info about document to approve it.png": "The notary reviews the calculated SHA-256 hash, owner wallet, and other metadata to ensure everything is correct.",
    "Notary Approved View.png": "The confirmation modal shown right before the Notary executes the on-chain approval transaction.",
    "Notarize Doc and Pay NTK.png": "The notary signs the transaction payload, officially anchoring the document's hash to the BNB blockchain.",
    "Notarize Document And Pay NTK.png": "The transaction completes successfully. The notary receives their portion of the fee, and the document is officially notarized.",
    "Notary Application Created.png": "A notification showing that a new Notary application has been successfully submitted to the system.",
    "Admin Dashboard Notary Application Pending Screen.png": "The Admin dashboard displaying a list of prospective notaries awaiting background checks and approval.",
    "Admin Dashboard Notary Application Details.png": "The Admin reviews the submitted legal credentials and identity documents of the applicant.",
    "Admin Dashboard Notary Role Applied onchain confirmed.png": "The Admin executes an on-chain transaction to officially grant the 'NOTARY_ROLE' to the applicant's wallet address.",
    "Admin Finalizing Notary Role Onchain .png": "The smart contract confirms the role assignment, finalizing the applicant's promotion to an active Notary.",
    "1 Cloud Connection.png": "Architectural view of the secure connection between the client application and the cloud-hosted Spring Boot/Node.js backend.",
    "2 Running Processes On Cloud.png": "A snapshot of the PM2 process manager running the backend API, workers, and blockchain sync daemons on the EC2 instance.",
    "3 Backend Runtime Logs.png": "Live terminal logs showing the backend API securely processing requests and database queries.",
    "4 Api Health check.png": "The API health check endpoint returning a 200 OK status, confirming database and blockchain RPC connectivity.",
    "5 DB List of relations.png": "A view of the PostgreSQL database schema, showing the relational mapping between Users, Documents, and Blockchain Receipts.",
    "6 All Contract and Deployer.png": "The BNB Testnet block explorer showing the deployed BBSNS Document Registry and Multi-Sig smart contracts.",
    "Digital Certificate of confirmation .png": "An example of the cryptographic certificate issued by the platform, featuring the QR code for instant public verification.",
    "z BBSNS Verification Of Document Hash For Tempering.png": "The verification portal demonstrating a successful tamper-check, proving the document matches the exact hash anchored on-chain."
};

function getDesc(filename) {
    return descriptions[filename] || "Detailed system screenshot showing a specific step or component within the BBSNS platform workflow.";
}

const ownerFlows = [
    "Owner Sign up Step 3 Biometric Check .png",
    "Owner Sign up step 3 completed.png",
    "Owner Sign up Step 4 Wallet binding.png",
    "Owner Sign Up Step 4 Signature For Confirmation.png",
    "Owner Sign Up Completed.png",
    "Owner Sign In Signature.png",
    "Owner Buying NTKR Token.png",
    "Owner Dashboard.png",
    "Owner Document Upload Process And NTKR BURN.png",
    "Ower NTKR Burn Transaction Confirmed.png",
    "Owner Dashboard Document Status changed to approved.png",
    "Owners Final Document Verifiable Certificate.png"
];

const notaryFlows = [
    "Notary Register Phase 1.png",
    "Notary Register Phase 2.png",
    "Notary Register Phase 3.png",
    "Notary Wallet Confirmation Before Activation.png",
    "Notary Email For Activation Of Account.png",
    "Notary Account Activation.png",
    "Notary Account Activation Confirmed.png",
    "Notary Login Step 1.png",
    "Notary Login Step 2.png",
    "Notary Login Step 3.1.png",
    "Notary Login Step 3.2.png",
    "Notary Dashboard.png",
    "Notary Pending Work.png",
    "Notary Action View Document for Notarisation.png",
    "Notary Process Info about document to approve it.png",
    "Notary Approved View.png",
    "Notarize Doc and Pay NTK.png",
    "Notarize Document And Pay NTK.png"
];

const adminFlows = [
    "Notary Application Created.png",
    "Admin Dashboard Notary Application Pending Screen.png",
    "Admin Dashboard Notary Application Details.png",
    "Admin Dashboard Notary Role Applied onchain confirmed.png",
    "Admin Finalizing Notary Role Onchain .png"
];

const sysFlows = [
    "1 Cloud Connection.png",
    "2 Running Processes On Cloud.png",
    "3 Backend Runtime Logs.png",
    "4 Api Health check.png",
    "5 DB List of relations.png",
    "6 All Contract and Deployer.png",
    "Digital Certificate of confirmation .png",
    "z BBSNS Verification Of Document Hash For Tempering.png"
];

let globalIdCounter = 1;

function buildGallery(title, images) {
    let html = `
        <section style="margin-bottom: 64px;">
            <h2>${title}</h2>
            <div class="mockup-grid">
`;
    for (const img of images) {
        const name = img.replace(/\.[^/.]+$/, "");
        const desc = getDesc(img);
        const detailsId = 'details-' + globalIdCounter++;
        
        html += `
                <div class="diagram-container">
                    <div class="diagram-header">
                        <h3 class="diagram-title">${name}</h3>
                    </div>
                    <div style="text-align: center;">
                        <img src="${img}" alt="${name}" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border);">
                    </div>
                    <div class="image-card-actions">
                        <button class="expand-btn" onclick="toggleImageDetails(this, '${detailsId}')">View Details</button>
                    </div>
                    <div class="image-details" id="${detailsId}">
                        <strong>About this screenshot:</strong><br/>
                        ${desc}
                    </div>
                </div>
        `;
    }
    html += `
            </div>
        </section>
`;
    return html;
}

let galleriesHtml = `
        <!-- SCREENSHOT FLOWS -->
        <div id="screenshots-flows">
            <h1 style="font-size: 36px; font-weight: 900; background: linear-gradient(135deg, #3b82f6, #10b981); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 32px;">System Screenshot Flows</h1>
            ${buildGallery('Owner Flow', ownerFlows)}
            ${buildGallery('Notary Flow', notaryFlows)}
            ${buildGallery('Admin & Governance Flow', adminFlows)}
            ${buildGallery('Architecture & System Evidence', sysFlows)}
        </div>
`;

// Extract and replace old screenshots-flows
const startIndex = htmlContent.indexOf('<!-- SCREENSHOT FLOWS -->');
const endIndex = htmlContent.lastIndexOf('</main>');

if (startIndex !== -1 && endIndex !== -1) {
    htmlContent = htmlContent.substring(0, startIndex) + galleriesHtml + '\n    ' + htmlContent.substring(endIndex);
    fs.writeFileSync(htmlPath, htmlContent, 'utf8');
    console.log('Successfully updated HTML with expand buttons and descriptions.');
} else {
    console.log('Could not find existing SCREENSHOT FLOWS section.');
}
