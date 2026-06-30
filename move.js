const fs = require('fs');
const path = require('path');

const adminDir = path.join(__dirname, 'src/app/admin');
const protectedDir = path.join(adminDir, '(protected)');

if (!fs.existsSync(protectedDir)) {
  fs.mkdirSync(protectedDir);
}

const itemsToMove = [
  'ai', 'consignment', 'dashboard', 'pos', 'products', 'reports', 'stock',
  'layout.tsx', 'page.tsx'
];

for (const item of itemsToMove) {
  const oldPath = path.join(adminDir, item);
  const newPath = path.join(protectedDir, item);
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`Moved ${item}`);
  }
}
