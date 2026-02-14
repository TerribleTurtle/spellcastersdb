const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const draftPath = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'brain', 'c462430a-7eb6-48d5-bf4a-4ccf905ea122', 'github_issues_draft.md');

if (!fs.existsSync(draftPath)) {
  console.error(`Draft file not found at: ${draftPath}`);
  process.exit(1);
}

const content = fs.readFileSync(draftPath, 'utf8');
const issues = content.split('### Issue:').slice(1);

// Get existing issues to avoid duplicates
let existingTitles = [];
try {
    const existingJSON = execSync('gh issue list --limit 100 --json title', { encoding: 'utf8' });
    existingTitles = JSON.parse(existingJSON).map(i => i.title);
} catch (e) {
    console.error("Failed to fetch existing issues, proceeding with caution.");
}

console.log(`Found ${issues.length} issues to process.`);

issues.forEach((issueBlock, index) => {
  const lines = issueBlock.trim().split('\n');
  const title = lines[0].trim();
  
  if (existingTitles.includes(title)) {
      console.log(`Skipping existing issue: "${title}"`);
      return;
  }

  const labelMatch = issueBlock.match(/\*\*Labels\*\*: `(.*)`/);
  const labels = labelMatch ? labelMatch[1].replace(/`/g, '').split(',').map(l => l.trim()).join(',') : '';
  
  const bodyMatch = issueBlock.split('**Body**:');
  const body = bodyMatch.length > 1 ? bodyMatch[1].trim() : '';

  if (!title) return;

  console.log(`Creating issue: "${title}" [Labels: ${labels}]`);

  try {
    const tempBodyFile = path.join(__dirname, `temp_issue_${index}.md`);
    fs.writeFileSync(tempBodyFile, body);
    
    const labelFlag = labels ? `--label "${labels}"` : '';
    const cmd = `gh issue create --title "${title}" --body-file "${tempBodyFile}" ${labelFlag}`;
    
    execSync(cmd, { stdio: 'pipe' });
    console.log(`Created: "${title}"`);
    
    fs.unlinkSync(tempBodyFile);
    
    // Rate limiting
    const stop = new Date().getTime() + 1000;
    while(new Date().getTime() < stop); 
    
  } catch (error) {
    console.error(`Failed to create issue "${title}":`, error.message);
  }
});

console.log('Batch creation complete!');
