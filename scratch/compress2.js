const sharp = require('sharp');
const fs = require('fs');

async function processImage(source, dest) {
  try {
    await sharp(source)
      .resize({ width: 800, withoutEnlargement: true })
      .jpeg({ quality: 70, progressive: true })
      .toFile(dest);
    console.log(`Compressed and copied: ${dest}`);
  } catch (e) {
    console.error(`Failed to process ${source}`, e);
  }
}

processImage('Gallery/Cover Bible/Deu/Additions to Daniel.jpeg', 'public/images/bible/deu/Additions to Daniel.jpeg');
processImage('Gallery/Cover Bible/Deu/Additions to Esther.jpeg', 'public/images/bible/deu/Additions to Esther.jpeg');
