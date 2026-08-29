const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/indonesia.json', 'utf8'));

// Indonesia TopoJSON usually has objects.IDN_adm1 or similar
const objects = data.objects;
const keys = Object.keys(objects);
console.log("Keys in objects:", keys);

let allProps = [];
for (const key of keys) {
  const geometries = objects[key].geometries;
  if (geometries) {
    for (const geom of geometries) {
      if (geom.properties) {
        allProps.push(geom.properties.name || geom.properties.NAME || "UNKNOWN");
      }
    }
  }
}

const uniqueProps = [...new Set(allProps)];
console.log("Unique names:", uniqueProps.slice(0, 50));
