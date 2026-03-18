const fs = require('fs');

function fixNegativeColors(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Line 211 & 215
  content = content.replace(/text-brand-500'}`}>₦\{livePrices\.BTC/g, "text-red-500'}`}>₦{livePrices.BTC");
  content = content.replace(/text-brand-500'}`}>₦\{livePrices\.ETH/g, "text-red-500'}`}>₦{livePrices.ETH");
  
  // Line 470
  content = content.replace(/text-brand-600'}`}>/g, "text-red-500'}`}>");
  
  // Line 494
  content = content.replace(/<span className="text-brand-500 font-mono relative z-10">\{order\.price\.toFixed\(2\)\}<\/span>/g, '<span className="text-red-500 font-mono relative z-10">{order.price.toFixed(2)}</span>');
  
  // Line 531
  content = content.replace(/tx\.type === 'Deposit' \? 'text-emerald-500' : 'text-brand-500'/g, "tx.type === 'Deposit' ? 'text-emerald-500' : 'text-red-500'");
  
  // Line 542
  content = content.replace(/tx\.status === 'Rejected' \? \(darkMode \? 'bg-brand-500\/10 text-brand-400' : 'bg-brand-50 text-brand-700'\) :/g, "tx.status === 'Rejected' ? (darkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-700') :");
  
  fs.writeFileSync(filePath, content);
  console.log(`Fixed negative colors in ${filePath}`);
}

fixNegativeColors('src/components/Dashboard.tsx');
