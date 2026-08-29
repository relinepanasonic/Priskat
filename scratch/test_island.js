function getIsland(provinceName) {
  if (!provinceName) return 'Other';
  const name = String(provinceName).toLowerCase();
  if (name.includes('jawa') || name.includes('banten') || name.includes('jakarta') || name.includes('yogyakarta')) return 'Java';
  if (name.includes('sumatera') || name.includes('sumatra') || name.includes('aceh') || name.includes('riau') || name.includes('jambi') || name.includes('bengkulu') || name.includes('lampung') || name.includes('bangka')) return 'Sumatra';
  if (name.includes('kalimantan')) return 'Kalimantan';
  if (name.includes('sulawesi') || name.includes('gorontalo')) return 'Sulawesi';
  if (name.includes('bali') || name.includes('nusa')) return 'Bali & Nusa Tenggara';
  if (name.includes('maluku') || name.includes('papua') || name.includes('irian')) return 'Maluku & Papua';
  if (name.includes('sabah') || name.includes('sarawak') || name.includes('malaysia') || name.includes('keningau')) return 'Malaysia';
  if (name.includes('timor') || name.includes('atambua')) return 'Timor Leste';
  return 'Other';
}

const uniqueProps = [
  'Brunei',              'Indonesia',         'Malaysia',
  'Bougainville',        'Papua New Guinea',  'Singapore',
  'UNKNOWN',             'Aceh',              'Kalimantan Timur',
  'Jawa Barat',          'Jawa Tengah',       'Bengkulu',
  'Banten',              'Jakarta Raya',      'Kalimantan Barat',
  'Lampung',             'Sumatera Selatan',  'Bangka-Belitung',
  'Bali',                'Jawa Timur',        'Kalimantan Selatan',
  'Nusa Tenggara Timur', 'Sulawesi Selatan',  'Sulawesi Barat',
  'Kepulauan Riau',      'Gorontalo',         'Jambi',
  'Kalimantan Tengah',   'Irian Jaya Barat',  'Sumatera Utara',
  'Riau',                'Sulawesi Utara',    'Maluku Utara',
  'Sumatera Barat',      'Yogyakarta',        'Maluku',
  'Nusa Tenggara Barat', 'Sulawesi Tenggara', 'Sulawesi Tengah',
  'Papua'
];

for (const prop of uniqueProps) {
  console.log(`${prop} -> ${getIsland(prop)}`);
}
