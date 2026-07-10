const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}
const appDir = path.join(process.cwd(), 'app');
const compDir = path.join(process.cwd(), 'components');
const files = [...walk(appDir), ...walk(compDir)];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    if (line.includes('camera') || line.includes('📷') || line.includes('🖼️') || line.includes('📸')) {
      console.log(`${f.replace(process.cwd(), '')}:${i+1}: ${line.trim()}`);
    }
  });
});
