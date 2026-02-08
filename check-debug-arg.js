
const https = require('https');

const url = process.argv[2] || "https://www.spellcastersdb.com/api/debug-og";

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    if (res.statusCode === 200) {
        console.log("Body:", data);
    } else {
        console.log("Status:", res.statusCode);
        console.log("Body:", data.substring(0, 2000));
    }
  });
}).on('error', (e) => {
  console.error(e);
});
