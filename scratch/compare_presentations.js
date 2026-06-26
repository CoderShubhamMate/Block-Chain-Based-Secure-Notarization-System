const JSZip = require('jszip');
const fs = require('fs');
const path = require('path');

const refPath = 'C:/Users/Lenovo/OneDrive/Desktop/Final_pro/BBSNS/For PPT Images/Final PPT Blockchain.pptx';
const newPath = 'C:/Users/Lenovo/OneDrive/Desktop/Final_pro/BBSNS/For PPT Images/BBSNS_Presentation_v8.pptx';




function extractText(xml) {
  const matches = [...xml.matchAll(/<a:t[^>]*>([\s\S]*?)<\/a:t>/g)];
  return matches.map(m => m[1].trim()).filter(Boolean);
}

function countImages(xml) {
  return (xml.match(/<p:pic>/g) || []).length;
}

function countShapes(xml) {
  return (xml.match(/<p:sp>/g) || []).length;
}

async function analyzePPT(pptxPath) {
  const data = fs.readFileSync(pptxPath);
  const zip = await JSZip.loadAsync(data);
  const slideKeys = Object.keys(zip.files)
    .filter(k => k.match(/^ppt\/slides\/slide\d+\.xml$/))
    .sort((a, b) => {
      const na = parseInt(a.match(/slide(\d+)/)[1]);
      const nb = parseInt(b.match(/slide(\d+)/)[1]);
      return na - nb;
    });

  const slides = [];
  for (let i = 0; i < slideKeys.length; i++) {
    const key = slideKeys[i];
    const content = await zip.files[key].async('string');
    const texts = extractText(content);
    const title = texts[0] || '(no text)';
    const imgCount = countImages(content);
    const shapeCount = countShapes(content);
    slides.push({ title, imgCount, shapeCount });
  }
  return slides;
}

async function run() {
  console.log("Analyzing Reference PPT...");
  const refSlides = await analyzePPT(refPath);
  console.log("Analyzing New PPT...");
  const newSlides = await analyzePPT(newPath);

  console.log(`\n=================== COMPARISON SUMMARY ===================`);
  console.log(`Reference Slide Count: ${refSlides.length}`);
  console.log(`New Slide Count:       ${newSlides.length}`);
  console.log(`==========================================================\n`);

  console.log(String.prototype.padEnd ? "" : "Fallback mode active");
  
  const maxLength = Math.max(refSlides.length, newSlides.length);
  console.log(
    "Slide".padEnd(6) + " | " + 
    "Reference Title".padEnd(45) + " | " + 
    "Img/Shp".padEnd(8) + " || " + 
    "New Title".padEnd(45) + " | " + 
    "Img/Shp"
  );
  console.log("-".repeat(120));

  for (let i = 0; i < maxLength; i++) {
    const r = refSlides[i] || { title: "N/A", imgCount: 0, shapeCount: 0 };
    const n = newSlides[i] || { title: "N/A", imgCount: 0, shapeCount: 0 };
    
    const rTitle = r.title.substring(0, 42) + (r.title.length > 42 ? "..." : "");
    const nTitle = n.title.substring(0, 42) + (n.title.length > 42 ? "..." : "");
    const rMeta = `${r.imgCount}/${r.shapeCount}`;
    const nMeta = `${n.imgCount}/${n.shapeCount}`;

    console.log(
      `${String(i + 1).padStart(3)}    | ` +
      rTitle.padEnd(45) + " | " +
      rMeta.padEnd(8) + " || " +
      nTitle.padEnd(45) + " | " +
      nMeta
    );
  }
}

run().catch(console.error);
