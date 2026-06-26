const fs = require('fs');
const path = require('path');

const dirPath = 'C:\\Users\\Lenovo\\OneDrive\\Desktop\\Final_pro\\BBSNS\\Working Proofs';
const htmlPath = path.join(dirPath, 'bbsns_capstone_diagrams.html');

let htmlContent = fs.readFileSync(htmlPath, 'utf8');

// 1. Fix the copyCode function and inject the raw data saver
const copyCodeOld = `        function copyCode(id) {
            const codeElement = document.getElementById(id);
            if (!codeElement) return;
            const codeText = codeElement.innerText.trim();`;
const copyCodeNew = `        function copyCode(id) {
            const codeElement = document.getElementById(id);
            if (!codeElement) return;
            const codeText = codeElement.dataset.raw || codeElement.innerText.trim();`;
htmlContent = htmlContent.replace(copyCodeOld, copyCodeNew);

const rawSaver = `
    <!-- RAW SAVER FOR COPY BUTTON -->
    <script>
        document.querySelectorAll('pre.mermaid').forEach(el => {
            el.dataset.raw = el.textContent.trim();
        });
    </script>
    <!-- LOADING MERMAID INTEGRATIONS FROM ESM CDN -->`;
htmlContent = htmlContent.replace('<!-- LOADING MERMAID INTEGRATIONS FROM ESM CDN -->', rawSaver);

// 2. Remove Section 9 (High-Fidelity UI Mockups)
const s9StartIndex = htmlContent.indexOf('<!-- SECTION 9 -->');
const s9EndIndex = htmlContent.indexOf('</main>', s9StartIndex);
if (s9StartIndex !== -1 && s9EndIndex !== -1) {
    htmlContent = htmlContent.substring(0, s9StartIndex) + htmlContent.substring(s9EndIndex);
}

// Remove from sidebar
const navSectionToRemove = `          <div class="nav-section">
              <div class="nav-section-title">9. High-Fidelity UI Mockups</div>
              <ul class="nav-links">
                  <li><a href="#m1">1. Face Mesh KYC Scanner</a></li>
                  <li><a href="#m2">2. Notarization Certificate</a></li>
                  <li><a href="#m3">3. Governance Multi-Sig Board</a></li>
              </ul>
          </div>`;
htmlContent = htmlContent.replace(navSectionToRemove, '');

// 3. Add the new Diagram 59 (Admin Promotion Flow) before the end of the sections
const diagram59 = `
            <div class="diagram-container" id="d59">
                <div class="diagram-header">
                    <div>
                        <h3 class="diagram-title">59. Governance: Admin Promotion Flow</h3>
                        <p class="diagram-desc">Multi-signature flow mapping the promotion of a user to Admin.</p>
                    </div>
                    <button class="copy-btn" onclick="copyCode('c59')">Copy Mermaid Code</button>
                </div>
                <div class="mermaid-canvas">
                    <pre class="mermaid" id="c59">
graph TD
    subgraph UI[User Interface]
        A[Admin clicks 'Promote']
        A -- Creates --> B[Single Proposal: Promote Admin]
        style B fill:#90EE90,color:#000
    end
    
    B -- "Votes & Executes" --> C[MultiSig: promoteAdmin]
    
    subgraph MSG[BBSNSMultiSigV2 Contract]
        C
        C -- "Step 1: Internal" --> D[addSigner logic]
        C -- "Step 2: External" --> E[Calls Registry]
    end
    
    D -.-> G[User becomes Signer]
    E -. Executes .-> H[NotaryRegistry: promoteToAdmin]
    
    subgraph REG[NotaryRegistry Contract]
        H
    end
    
    H -.-> I[User becomes Admin]
                    </pre>
                </div>
            </div>
`;

// Find the last section and insert it before the closing tag, wait, it's easier to find the end of Section 8
const s8End = htmlContent.lastIndexOf('</section>', htmlContent.indexOf('</main>'));
if (s8End !== -1) {
    // Inject it at the end of the last section found
    htmlContent = htmlContent.substring(0, s8End) + diagram59 + htmlContent.substring(s8End);
}

// Also add it to sidebar under section 8
const s8NavIndex = htmlContent.indexOf('<li><a href="#d58" title="58. Final Trust validation">58. Trust Flow</a></li>');
if (s8NavIndex !== -1) {
    const s8NavLink = '<li><a href="#d59" title="59. Governance: Admin Promotion Flow">59. Admin Promotion Flow</a></li>\n              ';
    htmlContent = htmlContent.substring(0, s8NavIndex + 79) + '\n                  ' + s8NavLink + htmlContent.substring(s8NavIndex + 79);
}

// 4. Build organized screenshot flows
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

function buildGallery(title, images) {
    let html = `
        <section style="margin-bottom: 64px;">
            <h2>${title}</h2>
            <div class="mockup-grid">
`;
    for (const img of images) {
        const name = img.replace(/\.[^/.]+$/, "");
        html += `
                <div class="diagram-container">
                    <div class="diagram-header">
                        <h3 class="diagram-title">${name}</h3>
                    </div>
                    <div style="text-align: center;">
                        <img src="${img}" alt="${name}" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border);">
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

// Insert before </main>
htmlContent = htmlContent.replace('</main>', galleriesHtml + '\n    </main>');

fs.writeFileSync(htmlPath, htmlContent, 'utf8');
console.log('Update script completed successfully.');
