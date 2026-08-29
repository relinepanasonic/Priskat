const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const dirPath = 'Gallery/Devotional/Love';
const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.csv'));

const allPlans = [];

for (const file of files) {
  const data = fs.readFileSync(path.join(dirPath, file), 'utf8').replace(/^\uFEFF/, '');
  const records = parse(data, { columns: true, skip_empty_lines: true });
  if (records.length === 0) continue;

  const first = records[0];
  const catName = first.sub_category;
  const planTitle = first.plan_title_id;
  const planDesc = first.summary_id;
  const duration = parseInt(first.total_days) || records.length;

  const plan = {
    category: catName,
    title: planTitle,
    description: planDesc,
    duration_days: duration,
    days: []
  };

  for (const row of records) {
    const dayNum = parseInt(row.day);
    const dayTitle = row.section_title_id;
    
    let content = row.devotion_id;
    if (row.reflection_id) content += '\n\n**Refleksi:**\n' + row.reflection_id;
    if (row.prayer_id) content += '\n\n**Doa:**\n' + row.prayer_id;

    const verses = row.verses_id.split('\n').map(v => v.trim()).filter(v => v.length > 0).map((v, i) => {
      let ref = v;
      if (v.includes('|')) ref = v.split('|')[0].trim();
      return {
        reference: ref,
        order: i
      };
    });

    plan.days.push({
      day_number: dayNum,
      title: dayTitle,
      content: content,
      verses: verses
    });
  }

  allPlans.push(plan);
}

fs.writeFileSync(path.join(__dirname, '../public/data/devotions.json'), JSON.stringify(allPlans, null, 2));
console.log('Done generating JSON');

