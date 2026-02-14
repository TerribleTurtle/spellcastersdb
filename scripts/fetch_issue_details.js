const https = require('https');

const issueIds = [8, 12, 20, 7];
const options = {
  hostname: 'api.github.com',
  headers: {
    'User-Agent': 'Node.js'
  }
};

const fetchIssue = (id) => {
  return new Promise((resolve, reject) => {
    const opts = { ...options, path: `/repos/TerribleTurtle/spellcastersdb/issues/${id}` };
    https.get(opts, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
            resolve(JSON.parse(data));
        } catch (e) {
            reject(e);
        }
      });
    }).on('error', reject);
  });
};

Promise.all(issueIds.map(fetchIssue)).then(issues => {
  issues.forEach(issue => {
    console.log(`\n=== #${issue.number}: ${issue.title} ===`);
    console.log(issue.body);
    console.log('==========================================\n');
  });
});
