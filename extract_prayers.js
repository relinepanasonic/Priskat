const fs = require('fs');
const path = require('path');

async function main() {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const buf = fs.readFileSync('C:\\000. Cloude AI\\PriskatCFM\\Data\\Doa\\Buku Doa adalah Sumber Kekuatan.pdf');
  const uint8 = new Uint8Array(buf);
  
  const loadingTask = pdfjs.getDocument({ data: uint8 });
  const pdfDoc = await loadingTask.promise;
  
  console.log(`Total pages: ${pdfDoc.numPages}`);
  
  let fullText = '';
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(' ');
    fullText += `\n--- PAGE ${i} ---\n` + pageText;
  }
  
  fs.writeFileSync('prayer_text_raw.txt', fullText, 'utf8');
  console.log(`Extracted ${fullText.length} chars`);
  console.log('\n--- FIRST 5000 CHARS ---\n');
  console.log(fullText.substring(0, 5000));
}

main().catch(console.error);
