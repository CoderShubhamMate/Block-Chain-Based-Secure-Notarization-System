const JSZip = require('jszip');
const fs = require('fs');
const path = require('path');

const pptxPath = 'C:/Users/Lenovo/OneDrive/Desktop/Final_pro/BBSNS/For PPT Images/Final PPT Blockchain.pptx';
const data = fs.readFileSync(pptxPath);

function extractText(xml) {
  const matches = [...xml.matchAll(/<a:t[^>]*>([\s\S]*?)<\/a:t>/g)];
  return matches.map(m => m[1].trim()).filter(Boolean);
}

JSZip.loadAsync(data).then(async zip => {
  const slideKeys = Object.keys(zip.files)
    .filter(k => k.match(/^ppt\/slides\/slide\d+\.xml$/))
    .sort((a, b) => {
      const na = parseInt(a.match(/slide(\d+)/)[1]);
      const nb = parseInt(b.match(/slide(\d+)/)[1]);
      return na - nb;
    });

  for (let i = 23; i < 28; i++) {
    const key = slideKeys[i];
    if (!key) continue;
    const content = await zip.files[key].async('string');
    const texts = extractText(content);
    console.log(`\nSLIDE ${i + 1} TEXT:`);
    console.log(texts.slice(0, 15).join(' | '));
  }
}).catch(console.error);
