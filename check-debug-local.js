
const http = require('http');

const url = "http://localhost:3000/api/debug-og?team=v2~LITwBAKgpghgtgfABYEYEFc0OwgImpAJg2Jz2KQGYNqzdKg&image=true";

http.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    if (res.statusCode === 500) {
        console.log("Body preview:");
        // Print first 4000 chars to likely catch the stack trace
        console.log(data.substring(0, 4000));
    } else if (res.statusCode === 200) {
        console.log("Success! Content-Type:", res.headers['content-type']);
        if (res.headers['content-type'].includes("application/json")) {
           console.log("Body JSON:", data);
        } else {
           console.log("Body is likely image (binary). Length:", data.length);
        }
    }
  });
}).on('error', (e) => {
  console.error(e);
});
