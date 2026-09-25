const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('.strict()')) {
        content = content.replace(/\.strict\(\)/g, '');
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Removed .strict() from ${fullPath}`);
      }
    }
  }
}

processDir(path.join(__dirname, '../src'));
