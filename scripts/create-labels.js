const { execSync } = require('child_process');

const labels = [
  { name: 'core-logic', color: 'c5def5', description: 'Core business logic' },
  { name: 'ux', color: 'd4c5f9', description: 'User Experience' },
  { name: 'logic', color: 'c5def5', description: 'Logic changes' },
  { name: 'ui', color: 'e99695', description: 'User Interface' },
  { name: 'desktop', color: '1d76db', description: 'Desktop specific' },
  { name: 'mobile', color: 'bfd4f2', description: 'Mobile specific' },
  { name: 'cleanup', color: 'fef2c0', description: 'Code cleanup' },
  { name: 'semantics', color: 'd4c5f9', description: 'Semantic changes' },
  { name: 'accessibility', color: 'fbca04', description: 'A11y' },
  { name: 'layout', color: 'e99695', description: 'Layout issues' },
  { name: 'interaction', color: 'd4c5f9', description: 'User interactions' },
  { name: 'stats', color: 'c2e0c6', description: 'Statistics' },
  { name: 'css', color: '563d7c', description: 'CSS styling' },
  { name: 'investigation', color: 'd93f0b', description: 'Needs investigation' },
  { name: 'mechanics', color: '0052cc', description: 'Game mechanics' },
  { name: 'data', color: '0e8a16', description: 'Data related' }
];

labels.forEach(label => {
  try {
    console.log(`Creating label: ${label.name}`);
    execSync(`gh label create "${label.name}" --color "${label.color}" --description "${label.description}" --force`, { stdio: 'pipe' });
  } catch (e) {
    // Ignore error if label exists (though --force should handle it or error if same)
    // checking error message
    const err = e.stderr ? e.stderr.toString() : e.message;
    if (err.includes('already exists')) {
        console.log(`Label ${label.name} already exists.`);
    } else {
        console.log(`Error creating ${label.name}: existing...`);
    }
  }
});
console.log('Labels created/verified.');
