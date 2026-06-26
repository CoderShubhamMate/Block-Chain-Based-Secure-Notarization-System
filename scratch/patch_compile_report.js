const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\Lenovo\\OneDrive\\Desktop\\Final_pro\\BBSNS\\compile_report.js';
if (!fs.existsSync(filePath)) {
    console.error("File does not exist:", filePath);
    process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf8');

// 1. Add image renderer for HTML
const oldRendererCode = `    } else {
        const isDiagram = code.includes('┌─') || code.includes('│') || code.includes('└─') || code.includes('──') || code.includes('DOCUMENT OWNER');
        const btnClass = isDiagram ? 'copy-diagram-btn' : 'copy-code-btn';
        const btnText = isDiagram ? '📋 Copy Diagram' : '📋 Copy Code';
        return \`
    <div class="code-block-wrapper" style="position: relative; margin: 18pt 0; page-break-inside: avoid;">
        <button class="copy-btn \${btnClass}" style="position: absolute; top: 8px; right: 8px; z-index: 10;">\${btnText}</button>
        <pre><code class="language-\${lang || 'none'}">\${escapeHtml(code)}</code></pre>
    </div>\`;
    }
};

marked.use({ renderer });`;

const newRendererCode = `    } else {
        const isDiagram = code.includes('┌─') || code.includes('│') || code.includes('└─') || code.includes('──') || code.includes('DOCUMENT OWNER');
        const btnClass = isDiagram ? 'copy-diagram-btn' : 'copy-code-btn';
        const btnText = isDiagram ? '📋 Copy Diagram' : '📋 Copy Code';
        return \`
    <div class="code-block-wrapper" style="position: relative; margin: 18pt 0; page-break-inside: avoid;">
        <button class="copy-btn \${btnClass}" style="position: absolute; top: 8px; right: 8px; z-index: 10;">\${btnText}</button>
        <pre><code class="language-\${lang || 'none'}">\${escapeHtml(code)}</code></pre>
    </div>\`;
    }
};

renderer.image = function(imageBlock) {
    const href = imageBlock.href;
    const title = imageBlock.title || '';
    const text = imageBlock.text || '';
    return \`
    <div class="figure-container" style="text-align: center; margin: 24pt 0; page-break-inside: avoid;">
        <img src="\${href}" alt="\${text}" style="max-width: 100%; height: auto; border: 1px solid #bbbbbb; border-radius: 4px; padding: 6px; background: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <div class="figure-caption" style="font-family: 'Times New Roman', serif; font-size: 10pt; font-style: italic; color: #444444; margin-top: 8px; text-align: center;">
            \${text}
        </div>
    </div>\`;
};

marked.use({ renderer });`;

content = content.replace(oldRendererCode, newRendererCode);

// 2. Load KaTeX in HTML head
const oldHtmlHead = `    <title>BBSNS Final Engineering Report (v2) - Copy/Paste Enhanced</title>
    <!-- Load Mermaid.js CDN for visual rendering in browser -->
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>`;

const newHtmlHead = `    <title>BBSNS Final Engineering Report (v2) - Copy/Paste Enhanced</title>
    <!-- Load Mermaid.js CDN for visual rendering in browser -->
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    <script>
        mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            securityLevel: 'loose',
            flowchart: { useMaxWidth: true, htmlLabels: true, curve: 'basis' }
        });
    </script>
    
    <!-- Load KaTeX for high-res math mathematical equations -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js" onload="renderMathInElement(document.body, {delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}]});"></script>`;

// Let's strip the existing redundant script in fullHtml to avoid doubling it up
content = content.replace(`    <!-- Load Mermaid.js CDN for visual rendering in browser -->
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    <script>
        mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            securityLevel: 'loose',
            flowchart: { useMaxWidth: true, htmlLabels: true, curve: 'basis' }
        });
    </script>`, newHtmlHead);

// 3. Add image renderer for DOC version
const oldDocRendererCode = `    if (lang === 'mermaid') {
        // Word offline has no JS, so we output the raw Mermaid diagram syntax inside a pre block as a backup
        return \`
    <pre style="font-family: 'Courier New', Courier, monospace; font-size: 9.5pt; background-color: #F4F4F4; border: 1px solid #000000; padding: 8pt; margin-top: 12pt; margin-bottom: 12pt; white-space: pre;"><code>[MERMAID FLOWCHART SYNTAX]
\${escapeHtml(code)}</code></pre>\`;
    } else {
        return \`
    <pre style="font-family: 'Courier New', Courier, monospace; font-size: 9.5pt; background-color: #F4F4F4; border: 1px solid #000000; padding: 8pt; margin-top: 12pt; margin-bottom: 12pt; white-space: pre;"><code>\${escapeHtml(code)}</code></pre>\`;
    }
};

marked.use({ renderer: docRenderer });`;

const newDocRendererCode = `    if (lang === 'mermaid') {
        // Word offline has no JS, so we output the raw Mermaid diagram syntax inside a pre block as a backup
        return \`
    <pre style="font-family: 'Courier New', Courier, monospace; font-size: 9.5pt; background-color: #F4F4F4; border: 1px solid #000000; padding: 8pt; margin-top: 12pt; margin-bottom: 12pt; white-space: pre;"><code>[MERMAID FLOWCHART SYNTAX]
\${escapeHtml(code)}</code></pre>\`;
    } else {
        return \`
    <pre style="font-family: 'Courier New', Courier, monospace; font-size: 9.5pt; background-color: #F4F4F4; border: 1px solid #000000; padding: 8pt; margin-top: 12pt; margin-bottom: 12pt; white-space: pre;"><code>\${escapeHtml(code)}</code></pre>\`;
    }
};

docRenderer.image = function(imageBlock) {
    const href = imageBlock.href;
    const title = imageBlock.title || '';
    const text = imageBlock.text || '';
    return \`
    <div style="text-align: center; margin-top: 12pt; margin-bottom: 12pt;">
        <img src="\${href}" alt="\${text}" style="max-width: 100%; border: 1px solid #000000;">
        <p style="font-family: 'Times New Roman', serif; font-size: 10pt; font-style: italic; text-align: center; text-indent: 0in !important; margin-top: 6pt;">
            \${text}
        </p>
    </div>\`;
};

marked.use({ renderer: docRenderer });`;

content = content.replace(oldDocRendererCode, newDocRendererCode);

// 4. Update table CSS to prevent going outside pages
content = content.replace(`        table {
            width: 100%;
            border-collapse: collapse;
            margin: 18pt 0;
            font-size: 10pt;
            font-family: Calibri, Arial, sans-serif;
            border: 1px solid #111111;
        }`, `        table {
            width: 100%;
            border-collapse: collapse;
            margin: 18pt 0;
            font-size: 10pt;
            font-family: Calibri, Arial, sans-serif;
            border: 1px solid #111111;
            table-layout: auto;
            word-wrap: break-word;
            word-break: break-word;
        }`);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully patched compile_report.js!");
