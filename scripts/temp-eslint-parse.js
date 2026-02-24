const fs = require('fs');
const { execSync } = require('child_process');

try {
  execSync('npx eslint -f json src', { stdio: 'pipe' });
  fs.writeFileSync('eslint-parsed.txt', 'No errors');
} catch (e) {
  const output = e.stdout.toString();
  const results = JSON.parse(output);
  let finalStr = '';
  results.forEach(r => {
    r.messages.filter(m => m.severity === 2).forEach(m => {
      finalStr += `${r.filePath}:${m.line}:${m.column} - ${m.message}\n`;
    });
  });
  fs.writeFileSync('eslint-parsed.txt', finalStr);
}
