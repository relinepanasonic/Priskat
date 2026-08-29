const fs = require('fs'); 
const html = fs.readFileSync('C:/Users/nicoj/.gemini/antigravity/brain/1568926b-43b0-49f5-8744-7b0ccdaf7ebf/.system_generated/steps/5878/content.md', 'utf8'); 
const start = html.indexOf('__NEXT_DATA__" type="application/json">') + 39; 
const end = html.indexOf('</script>', start); 
const jsonStr = html.substring(start, end); 
const data = JSON.parse(jsonStr); 
fs.writeFileSync('scratch/church_data.json', JSON.stringify(data.props.pageProps, null, 2));

