const fs = require('fs');

function chunkFile(inputFiles) {
    let allValueLines = [];
    let header, footer;
    for (const file of inputFiles) {
        if (!fs.existsSync(file)) continue;
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        header = lines.slice(0, 2).join('\n') + '\n';
        footer = '\nON CONFLICT DO NOTHING;\n';
        
        let vLines = lines.slice(2, lines.length - 2);
        // add back commas if missing (except for very last of all)
        for(let i=0; i<vLines.length; i++) {
           if(vLines[i].trim() && !vLines[i].trim().endsWith(',')) {
               vLines[i] = vLines[i] + ',';
           }
        }
        allValueLines.push(...vLines);
    }

    if (allValueLines.length === 0) return;

    // Remove comma from very last line
    if (allValueLines[allValueLines.length-1].endsWith(',')) {
        allValueLines[allValueLines.length-1] = allValueLines[allValueLines.length-1].slice(0, -1);
    }

    const chunkSize = 2500; // safe chunk size (~400KB)
    let partIndex = 1;
    
    for (let i = 0; i < allValueLines.length; i += chunkSize) {
        let chunk = allValueLines.slice(i, i + chunkSize);
        
        // ensure last line of chunk has no comma
        if (chunk[chunk.length-1].endsWith(',')) {
            chunk[chunk.length-1] = chunk[chunk.length-1].slice(0, -1);
        }
        
        fs.writeFileSync(`supabase/012_part_${partIndex}.sql`, header + chunk.join('\n') + footer);
        partIndex++;
    }
    
    for (const f of inputFiles) {
        if (fs.existsSync(f)) fs.unlinkSync(f);
    }
    console.log(`Created ${partIndex - 1} safe chunks.`);
}

chunkFile(['supabase/012A_seed_ot_kej_im.sql', 'supabase/012B_seed_ot_bil_2sam.sql']);
