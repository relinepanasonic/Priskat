const https = require('https');

https.get('https://beeble.vercel.app/api/v1/passage/Kej/2', (resp) => {
  let data = '';
  resp.on('data', (chunk) => data += chunk);
  resp.on('end', () => console.log(data));
}).on("error", (err) => console.log("Error: " + err.message));

