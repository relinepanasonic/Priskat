const fs = require('fs');

async function testFetch() {
  try {
    const res = await fetch("https://raw.githubusercontent.com/KenCodeDev/alkitab-json/master/alkitab-umum/kej1.json");
    const data = await res.text();
    console.log(data);
  } catch (e) {
    console.error(e);
  }
}

testFetch();

