const fs = require('fs');

function fixAdminNegativeColors(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Line 79
  content = content.replace(/className="text-brand-500 text-sm">\{loginError\}<\/p>/g, 'className="text-red-500 text-sm">{loginError}</p>');
  
  // Line 358
  content = content.replace(/t\.type === 'Deposit' \? 'text-emerald-500' : 'text-brand-500'/g, "t.type === 'Deposit' ? 'text-emerald-500' : 'text-red-500'");
  
  // Line 364
  content = content.replace(/t\.status === 'Rejected' \? \(darkMode \? 'bg-brand-500\/10 text-brand-400' : 'bg-brand-50 text-brand-700'\) :/g, "t.status === 'Rejected' ? (darkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-700') :");
  
  // Line 391
  content = content.replace(/className="p-1\.5 text-brand-500 hover:bg-brand-50 rounded-lg transition-colors dark:hover:bg-brand-500\/10" title="Reject"/g, 'className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors dark:hover:bg-red-500/10" title="Reject"');
  
  fs.writeFileSync(filePath, content);
  console.log(`Fixed negative colors in ${filePath}`);
}

fixAdminNegativeColors('src/components/AdminDashboard.tsx');
