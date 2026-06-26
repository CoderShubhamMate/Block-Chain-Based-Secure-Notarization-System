const fs = require('fs');
const path = require('path');

const dirPath = 'C:\\Users\\Lenovo\\OneDrive\\Desktop\\Final_pro\\BBSNS\\Working Proofs';
const htmlPath = path.join(dirPath, 'bbsns_capstone_diagrams.html');

let htmlContent = fs.readFileSync(htmlPath, 'utf8');

const files = fs.readdirSync(dirPath);
const images = files.filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg'));

let galleryHtml = `
        <section id="screenshots-gallery">
            <h2>System Screenshots Gallery</h2>
            <div class="mockup-grid">
`;

for (const img of images) {
    const title = img.replace(/\.[^/.]+$/, ""); // Remove extension
    galleryHtml += `
                <div class="diagram-container">
                    <div class="diagram-header">
                        <h3 class="diagram-title">${title}</h3>
                    </div>
                    <div style="text-align: center;">
                        <img src="${img}" alt="${title}" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border);">
                    </div>
                </div>
    `;
}

galleryHtml += `
            </div>
        </section>
`;

if (!htmlContent.includes('id="screenshots-gallery"')) {
    htmlContent = htmlContent.replace('</main>', galleryHtml + '\n    </main>');
    fs.writeFileSync(htmlPath, htmlContent, 'utf8');
    console.log('Successfully embedded ' + images.length + ' images into the HTML file.');
} else {
    console.log('Gallery already exists in the file.');
}
