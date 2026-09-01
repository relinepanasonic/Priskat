const fs = require('fs');

const path = 'src/app/(public)/faith/devotions/plans/[id]/day/[dayNum]/DayClient.tsx';
let content = fs.readFileSync(path, 'utf8');

// I am going to replace the block after `{/* Devotional Item ... */}` up to the closing `</div>` of that checklist.
const targetRegex = /\{\/\* Verses Items[\s\S]*?(?=className="w-full mx-auto flex justify-center)/;

const newBlock = `{/* Verses Items - filtered by language */}
        {filteredVerses.map((verse: any, idx: number) => {
          const pageIndex = hasDevotional ? idx + 1 : idx;
          return (
            <Link key={idx} href={\`/faith/devotions/plans/\${plan.id}/read/\${dayNum}?page=\${pageIndex}&lang=\${language}\`} className="flex items-center justify-between cursor-pointer group hover:bg-[#1a1d24] p-2 -mx-2 rounded-xl transition-colors">
              <div className="flex items-center gap-4">
                {isDayCompleted ? <CheckCircle2 className="h-6 w-6 text-brand-gold" /> : <Circle className="h-6 w-6 text-[#333]" />}
                <span className="text-[17px] font-medium group-hover:text-brand-gold transition-colors">{verse.verse_reference}</span>
              </div>
              <span className="text-xl text-brand-muted group-hover:text-brand-gold transition-colors">&gt;</span>
            </Link>
          );
        })}

        {/* Reflection Item */}
        {!!(dayData?.reflection || dayData?.reflection_id) && (
          <Link href={\`/faith/devotions/plans/\${plan.id}/read/\${dayNum}?page=\${filteredVerses.length + (hasDevotional ? 1 : 0)}&lang=\${language}\`} className="flex items-center justify-between cursor-pointer group hover:bg-[#1a1d24] p-2 -mx-2 rounded-xl transition-colors">
            <div className="flex items-center gap-4">
              {isDayCompleted ? <CheckCircle2 className="h-6 w-6 text-brand-gold" /> : <Circle className="h-6 w-6 text-[#333]" />}
              <span className="text-[17px] font-medium group-hover:text-brand-gold transition-colors">{language === "id" ? "Refleksi" : "Reflection"}</span>
            </div>
            <span className="text-xl text-brand-muted group-hover:text-brand-gold transition-colors">&gt;</span>
          </Link>
        )}

        {/* Prayer Item */}
        {!!(dayData?.prayer || dayData?.prayer_id) && (
          <Link href={\`/faith/devotions/plans/\${plan.id}/read/\${dayNum}?page=\${filteredVerses.length + (hasDevotional ? 1 : 0) + (!!(dayData?.reflection || dayData?.reflection_id) ? 1 : 0)}&lang=\${language}\`} className="flex items-center justify-between cursor-pointer group hover:bg-[#1a1d24] p-2 -mx-2 rounded-xl transition-colors">
            <div className="flex items-center gap-4">
              {isDayCompleted ? <CheckCircle2 className="h-6 w-6 text-brand-gold" /> : <Circle className="h-6 w-6 text-[#333]" />}
              <span className="text-[17px] font-medium group-hover:text-brand-gold transition-colors">{language === "id" ? "Doa" : "Prayer"}</span>
            </div>
            <span className="text-xl text-brand-muted group-hover:text-brand-gold transition-colors">&gt;</span>
          </Link>
        )}
      </div>

      {/* Begin Action */}
      <div className="fixed bottom-24 left-0 right-0 px-8 max-w-md mx-auto z-10">
        <Link 
          href={\`/faith/devotions/plans/\${plan.id}/read/\${dayNum}?page=0&lang=\${language}\`}
          `;

content = content.replace(targetRegex, newBlock);
fs.writeFileSync(path, content);
console.log('Fixed DayClient.tsx');

