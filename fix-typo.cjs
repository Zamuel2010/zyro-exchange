const fs = require('fs');

function fixTypo(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/tranzinc/g, 'translate');
  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${filePath}`);
}

fixTypo('src/components/Dashboard.tsx');
fixTypo('src/components/AdminDashboard.tsx');
