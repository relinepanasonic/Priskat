const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const data = fs.readFileSync('public/data/devotions.csv', 'utf8').replace(/^\uFEFF/, '');
const records = parse(data, { columns: true, skip_empty_lines: true });

const plansMap = new Map();

for (const row of records) {
  const planTitle = row.plan_title_en;
  
  if (!plansMap.has(planTitle)) {
    const duration = parseInt(row.total_days);
    plansMap.set(planTitle, {
      category: row.sub_category,
      title: row.plan_title_en,
      title_id: row.plan_title_id,
      subtitle: row.subtitle_en,
      subtitle_id: row.subtitle_id,
      summary: row.summary_en,
      summary_id: row.summary_id,
      duration_days: duration,
      days: []
    });
  }

  const plan = plansMap.get(planTitle);

  const dayNum = parseInt(row.day);
  const dayTitleEn = row.section_title_en;
  const dayTitleId = row.section_title_id;
  
  const devotionEn = row.devotion_en;
  const devotionId = row.devotion_id;

  const reflectionEn = row.reflection_en;
  const reflectionId = row.reflection_id;

  const prayerEn = row.prayer_en;
  const prayerId = row.prayer_id;

  const verses = row.verses_en.split('\n').map(v => v.trim()).filter(v => v.length > 0).map((v, i) => {
    let ref = v;
    if (v.includes('|')) ref = v.split('|')[0].trim();
    return {
      reference: ref,
      order: i
    };
  });

  plan.days.push({
    day_number: dayNum,
    devotional_title: dayTitleEn,
    devotional_title_id: dayTitleId,
    devotional_content: devotionEn,
    devotional_content_id: devotionId,
    reflection: reflectionEn,
    reflection_id: reflectionId,
    prayer: prayerEn,
    prayer_id: prayerId,
    verses: verses
  });
}

const allPlans = Array.from(plansMap.values());

fs.writeFileSync(path.join(__dirname, '../public/data/devotions.json'), JSON.stringify(allPlans, null, 2));
console.log(`Generated JSON with ${allPlans.length} plans.`);

