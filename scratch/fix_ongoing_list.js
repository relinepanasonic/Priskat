const fs = require('fs');
let content = fs.readFileSync('src/app/(public)/camp/ongoing/page.tsx', 'utf8');

content = content.replace(
  '<h3 className="text-xl font-bold text-white mb-1 group-hover:text-brand-gold transition-colors">\\n                {camp.camp_name}\\n              </h3>',
  \<h3 className="text-xl font-bold text-white mb-1 group-hover:text-brand-gold transition-colors">
                {camp.camp_name === "Other Event" ? camp.custom_name : camp.camp_name}
              </h3>\
);

content = content.replace(
  '<p className="text-brand-muted font-medium mb-6">\\n                Angkatan {camp.angkatan}\\n              </p>',
  \<p className="text-brand-muted font-medium mb-6">
                {camp.camp_name !== "Other Event" ? \\\Angkatan \\\\ : "Custom Event"}
              </p>\
);

fs.writeFileSync('src/app/(public)/camp/ongoing/page.tsx', content);
