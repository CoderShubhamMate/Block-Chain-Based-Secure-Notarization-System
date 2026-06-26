
const JSZip = require('jszip');
const fs = require('fs');
const path = require('path');

const pptxPath = 'C:/Users/Lenovo/OneDrive/Desktop/Final_pro/BBSNS/For PPT Images/Final PPT Blockchain.pptx';
const data = fs.readFileSync(pptxPath);

function extractText(xml) {
  // Extract all <a:t> text nodes
  const matches = [...xml.matchAll(/<a:t[^>]*>([\s\S]*?)<\/a:t>/g)];
  return matches.map(m => m[1].trim()).filter(Boolean);
}

function countImages(xml) {
  return (xml.match(/<p:pic>/g) || []).length;
}

function countShapes(xml) {
  return (xml.match(/<p:sp>/g) || []).length;
}

JSZip.loadAsync(data).then(async zip => {
  const slideKeys = Object.keys(zip.files)
    .filter(k => k.match(/^ppt\/slides\/slide\d+\.xml$/))
    .sort((a, b) => {
      const na = parseInt(a.match(/slide(\d+)/)[1]);
      const nb = parseInt(b.match(/slide(\d+)/)[1]);
      return na - nb;
    });

  console.log(`===== REFERENCE PPT ANALYSIS =====`);
  console.log(`Total Slides: ${slideKeys.length}\n`);

  for (let i = 0; i < slideKeys.length; i++) {
    const key = slideKeys[i];
    const slideNum = i + 1;
    const content = await zip.files[key].async('string');
    const texts = extractText(content);
    const imgCount = countImages(content);
    const shapeCount = countShapes(content);

    // First text is usually the slide title
    const title = texts[0] || '(no title)';
    const body = texts.slice(1).join(' | ').substring(0, 300);

    console.log(`--- SLIDE ${slideNum} ---`);
    console.log(`  TITLE   : ${title}`);
    console.log(`  IMAGES  : ${imgCount}`);
    console.log(`  SHAPES  : ${shapeCount}`);
    if (body) console.log(`  CONTENT : ${body}`);
    console.log();
  }
});
