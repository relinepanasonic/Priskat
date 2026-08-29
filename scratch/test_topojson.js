const fs = require('fs');
const topojson = require('topojson-client');
const data = JSON.parse(fs.readFileSync('public/indonesia.json', 'utf8'));

// If I convert states_provinces to GeoJSON manually:
const geojson = topojson.feature(data, data.objects.states_provinces);
console.log(geojson.features.length);
