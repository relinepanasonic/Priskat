const fs = require('fs');
const topojson = require('topojson-client');
const data = JSON.parse(fs.readFileSync('public/indonesia.json', 'utf8'));

const provinces = topojson.feature(data, data.objects.states_provinces).features;
const subunits = topojson.feature(data, data.objects.subunits).features;

const foreignSubunits = subunits.filter(f => 
  f.properties.NAME !== 'Indonesia'
);

const combinedFeatures = [...provinces, ...foreignSubunits];

const geojson = {
  type: "FeatureCollection",
  features: combinedFeatures
};

fs.writeFileSync('public/indonesia-combined.json', JSON.stringify(geojson));
console.log('Created combined geojson with ' + combinedFeatures.length + ' features.');
