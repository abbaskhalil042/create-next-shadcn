import fs from 'fs';
try {
  fs.chmodSync('bin/create-nextjs-shadcn.js', 0o755);
} catch (e) {}