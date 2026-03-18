const fs = require('fs');

function replaceColors(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace darkMode ternaries with just the dark mode part
  // e.g. ${darkMode ? 'bg-slate-900' : 'bg-white'} -> bg-slate-900
  // This regex is a bit tricky, let's just replace slate with zinc and red with brand first
  content = content.replace(/slate-/g, 'zinc-');
  content = content.replace(/red-/g, 'brand-');
  
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${filePath}`);
}

replaceColors('src/components/Dashboard.tsx');
replaceColors('src/components/AdminDashboard.tsx');
