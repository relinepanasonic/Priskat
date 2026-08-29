const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dir = 'public/images/bible';

async function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      await processDirectory(fullPath);
    } else if (fullPath.endsWith('.jpeg') || fullPath.endsWith('.jpg')) {
      const tempPath = fullPath + '.tmp';
      try {
        const metadata = await sharp(fullPath).metadata();
        const beforeSize = fs.statSync(fullPath).size;
        
        await sharp(fullPath)
          .resize({ width: 800, withoutEnlargement: true })
          .jpeg({ quality: 70, progressive: true })
          .toFile(tempPath);
        
        fs.renameSync(tempPath, fullPath);
        const afterSize = fs.statSync(fullPath).size;
        console.log(`Compressed ${file}: ${(beforeSize/1024/1024).toFixed(2)}MB -> ${(afterSize/1024).toFixed(0)}KB`);
      } catch (e) {
        console.error(`Failed to process ${fullPath}`, e);
      }
    }
  }
}

processDirectory(dir).then(() => console.log('Compression complete!'));
