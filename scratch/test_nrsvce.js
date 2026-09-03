const https = require('https');

https.get('https://raw.githubusercontent.com/arulandu/bible/master/data/main.json', (resp) => {
  let data = '';
  resp.on('data', (chunk) => data += chunk);
  resp.on('end', () => {
    const json = JSON.parse(data);
    const books = json.bible.map(b => b.book);
    console.log(books.slice(0, 46)); // OT + DC
  });
}).on("error", (err) => console.log("Error: " + err.message));

