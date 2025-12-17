import { existsSync, mkdirSync, readdirSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';

const BASELINE_DIR = join(process.cwd(), '.maestro', 'screenshots', 'baseline');
const CURRENT_DIR = join(process.cwd(), '.maestro', 'screenshots');

function ensureDirExists(dir: string) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function main() {
  console.log('📸 Updating baseline screenshots...\n');

  if (!existsSync(CURRENT_DIR)) {
    console.error('❌ Current screenshots directory not found.');
    console.log(
      '💡 Run Maestro tests first to generate screenshots:\n   maestro test .maestro/visual-regression.yaml\n',
    );
    process.exit(1);
  }

  ensureDirExists(BASELINE_DIR);

  const screenshotFiles = readdirSync(CURRENT_DIR).filter(
    (f) => f.endsWith('.png') && !f.startsWith('.'),
  );

  if (screenshotFiles.length === 0) {
    console.error('❌ No screenshots found in current directory.');
    console.log(
      '💡 Run Maestro tests first to generate screenshots:\n   maestro test .maestro/visual-regression.yaml\n',
    );
    process.exit(1);
  }

  console.log(`Found ${screenshotFiles.length} screenshots\n`);

  let updated = 0;

  for (const fileName of screenshotFiles) {
    const sourcePath = join(CURRENT_DIR, fileName);
    const destPath = join(BASELINE_DIR, fileName);

    copyFileSync(sourcePath, destPath);
    console.log(`✅ Updated: ${fileName}`);
    updated++;
  }

  console.log(`\n✨ Successfully updated ${updated} baseline screenshot(s)`);
  console.log(`📁 Baselines saved to: ${BASELINE_DIR}\n`);
  process.exit(0);
}

main();
