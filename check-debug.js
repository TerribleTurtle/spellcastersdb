
const https = require('https');

const url = "https://www.spellcastersdb.com/api/debug-og?team=v2~LITwBAKgpghgtgfABYEYEFc0OwgImpAJg2Jz2KQGYNqzdKg&image=true";

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    if (res.statusCode === 500) {
        // Look for Error message in the minified/chunked HTML/JS
        const errorRegex = /Error: [^"]+/;
        const match = data.match(errorRegex);
        if (match) {
            console.log("FOUND ERROR:", match[0]);
        } else {
            console.log("Could not find simple error message. Printing first 2000 chars:");
            console.log(data.substring(0, 2000));
        }
    } else {
        console.log("Success?");
    }
  });
}).on('error', (e) => {
  console.error(e);
});
