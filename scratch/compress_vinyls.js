const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inDir = path.join(__dirname, '../Gallery/Cover Song');
const outDir = path.join(__dirname, '../public/images/vinyl');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  const files = fs.readdirSync(inDir).filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png'));
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const inPath = path.join(inDir, file);
    // Name them vinyl_1.jpg, vinyl_2.jpg, etc.
    const outPath = path.join(outDir, `vinyl_${i + 1}.jpg`);
    
    console.log(`Processing ${file} -> vinyl_${i + 1}.jpg`);
    await sharp(inPath)
      .resize(300, 300, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toFile(outPath);
  }
  console.log('Compression complete!');
}

run();

