
const https = require('https');

// No params = test hero list
const url = "https://www.spellcastersdb.com/api/debug-og";

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    if (res.statusCode === 200) {
        console.log("Success! Body:", data.substring(0, 1000));
    } else {
        console.log("Status:", res.statusCode);
        console.log("Body:", data.substring(0, 1000));
    }
  });
}).on('error', (e) => {
  console.error(e);
});
