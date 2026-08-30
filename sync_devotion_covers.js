const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'Gallery', 'Devotional', 'Cover Devotional');
const destDir = path.join(__dirname, 'public', 'images', 'devotions');
const sqlFile = path.join(__dirname, 'supabase', '042_set_devotion_covers.sql');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

let sql = '';

function processDirectory(dir) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (item.toLowerCase().endsWith('.jpg') || item.toLowerCase().endsWith('.jpeg') || item.toLowerCase().endsWith('.png')) {
      const originalTitle = path.parse(item).name;
      
      // Clean up the name for the file
      const slug = originalTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const ext = path.extname(item).toLowerCase();
      const newFilename = `${slug}${ext}`;
      const destPath = path.join(destDir, newFilename);
      
      fs.copyFileSync(fullPath, destPath);
      
      const relativeUrl = `/images/devotions/${newFilename}`;
      
      let dbTitle = originalTitle;
      
      if (originalTitle === 'Sitting in the Ashed') dbTitle = 'Sitting in the Ashes';
      if (originalTitle === 'A Heart if Worship') dbTitle = 'A Heart of Worship';
      if (originalTitle === 'Make New Again') dbTitle = 'Made New Again';
      if (originalTitle === 'Resting in His Fithfulness') dbTitle = 'Resting in His Faithfulness';
      if (originalTitle === 'Rebuilding') dbTitle = 'Rebuilding: Healing for Wounded Families';
      if (originalTitle.startsWith('Laying_the_cornerstone')) dbTitle = 'Laying the Cornerstone';
      
      // Ensure we escape single quotes if there are any
      dbTitle = dbTitle.replace(/'/g, "''");

      // We'll use exact matching to avoid issues, or ILIKE on the exact string
      sql += `UPDATE public.devotion_plans SET cover_image_url = '${relativeUrl}' WHERE title ILIKE '${dbTitle}%';\n`;
    }
  }
}

processDirectory(srcDir);
fs.writeFileSync(sqlFile, sql);
console.log('Done! Generated SQL in supabase/042_set_devotion_covers.sql');
