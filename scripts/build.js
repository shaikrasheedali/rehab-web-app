import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const serverDir = path.resolve(rootDir, 'server');
const clientDir = path.resolve(serverDir, 'client');

function run(command, cwd) {
  console.log(`\n▶ [build] Executing: "${command}" in ${cwd}`);
  execSync(command, {
    cwd,
    stdio: 'inherit',
    env: { ...process.env }
  });
}

try {
  console.log('🚀 Starting Full-Stack Production Build Process for Render/Cloud...');

  // 1. Install server dependencies
  run('npm install', serverDir);

  // 2. Generate Prisma client
  run('npx prisma generate', serverDir);

  // 3. Push schema to Aiven Cloud MySQL database & run seed if needed
  try {
    run('npx prisma db push', serverDir);
    run('npm run seed', serverDir);
  } catch (dbErr) {
    console.warn('⚠️ Prisma db push/seed warning (check DATABASE_URL during Render build):', dbErr.message);
  }

  // 4. Install client dependencies & build React SPA bundle
  run('npm install', clientDir);
  run('npm run build', clientDir);

  console.log('\n✅ Full-Stack Production Build Completed Successfully!');
} catch (error) {
  console.error('\n❌ Build failed:', error);
  process.exit(1);
}
