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

  const content = await zip.files[slideKeys[1]].async('string');
  console.log("=== SLIDE 2 XML ===");
  console.log(content.substring(0, 3000));
}).catch(console.error);
