const https = require('https');
const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["'](.*)["']$/, '$1');
      process.env[key] = value;
    }
  });
}

const options = {
  hostname: 'api.github.com',
  path: '/repos/TerribleTurtle/spellcastersdb/issues?state=open&per_page=100',
  headers: {
    'User-Agent': 'Node.js',
    ...(process.env.GITHUB_TOKEN ? { 'Authorization': `token ${process.env.GITHUB_TOKEN}` } : {})
  }
};

const outputFile = path.join(__dirname, '../github_issues.md');
let output = '# GitHub Issues\n\n> **Generated on:** ' + new Date().toISOString().split('T')[0] + '\n\n';
output += '| Issue | Title | Labels | Link |\n| :--- | :--- | :--- | :--- |\n';

https.get(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const issues = JSON.parse(data);
      if (Array.isArray(issues)) {
        // Table of Contents
        issues.forEach(issue => {
           let labels = issue.labels.map(l => `\`${l.name}\``).join(', ');
           output += `| #${issue.number} | ${issue.title} | ${labels} | [Link](${issue.html_url}) |\n`;
        });

        output += '\n## Details\n\n';

        issues.forEach(issue => {
          output += `### #${issue.number}: ${issue.title}\n`;
          if (issue.labels && issue.labels.length > 0) {
             output += `**Labels**: ${issue.labels.map(l => '`' + l.name + '`').join(', ')}\n\n`;
          }
          output += `**Link**: ${issue.html_url}\n\n`;
          output += `> ${issue.body ? issue.body.replace(/\n/g, '\n> ') : 'No description provided.'}\n\n`;
          output += '---\n\n';
        });

        fs.writeFileSync(outputFile, output);
        console.log(`Successfully wrote ${issues.length} issues to ${outputFile}`);

      } else {
        console.error('Failed to parse issues or not an array:', issues);
      }
    } catch (e) {
      console.error('Error parsing JSON:', e);
    }
  });

}).on('error', (err) => {
  console.error('Error:', err);
});
