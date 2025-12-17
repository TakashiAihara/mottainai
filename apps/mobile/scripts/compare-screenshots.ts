import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

interface ComparisonResult {
  fileName: string;
  pixelDifference: number;
  percentageDifference: number;
  passed: boolean;
}

const THRESHOLD = 0.1; // 10% difference threshold
const BASELINE_DIR = join(process.cwd(), '.maestro', 'screenshots', 'baseline');
const CURRENT_DIR = join(process.cwd(), '.maestro', 'screenshots');
const DIFF_DIR = join(process.cwd(), '.maestro', 'screenshots', 'diff');

function ensureDirExists(dir: string) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function compareImages(baselinePath: string, currentPath: string, diffPath: string): number {
  const baseline = PNG.sync.read(readFileSync(baselinePath));
  const current = PNG.sync.read(readFileSync(currentPath));

  const { width, height } = baseline;

  if (current.width !== width || current.height !== height) {
    throw new Error(
      `Image dimensions mismatch: baseline (${width}x${height}) vs current (${current.width}x${current.height})`,
    );
  }

  const diff = new PNG({ width, height });

  const pixelDiff = pixelmatch(
    baseline.data,
    current.data,
    diff.data,
    width,
    height,
    { threshold: 0.1 },
  );

  writeFileSync(diffPath, PNG.sync.write(diff));

  return pixelDiff;
}

function main() {
  console.log('🔍 Visual Regression Testing - Screenshot Comparison\n');

  if (!existsSync(BASELINE_DIR)) {
    console.error('❌ Baseline directory not found.');
    console.log(
      '💡 Run "pnpm test:vrt:update" to create baseline screenshots first.\n',
    );
    process.exit(1);
  }

  ensureDirExists(DIFF_DIR);

  const baselineFiles = readdirSync(BASELINE_DIR).filter((f) => f.endsWith('.png'));

  if (baselineFiles.length === 0) {
    console.error('❌ No baseline screenshots found.');
    console.log(
      '💡 Run "pnpm test:vrt:update" to create baseline screenshots first.\n',
    );
    process.exit(1);
  }

  const results: ComparisonResult[] = [];
  let totalPassed = 0;
  let totalFailed = 0;

  console.log(`Found ${baselineFiles.length} baseline screenshots\n`);

  for (const fileName of baselineFiles) {
    const baselinePath = join(BASELINE_DIR, fileName);
    const currentPath = join(CURRENT_DIR, fileName);
    const diffPath = join(DIFF_DIR, fileName);

    if (!existsSync(currentPath)) {
      console.log(`⚠️  ${fileName} - MISSING (no current screenshot)`);
      results.push({
        fileName,
        pixelDifference: Number.POSITIVE_INFINITY,
        percentageDifference: 100,
        passed: false,
      });
      totalFailed++;
      continue;
    }

    try {
      const baseline = PNG.sync.read(readFileSync(baselinePath));
      const totalPixels = baseline.width * baseline.height;
      const pixelDiff = compareImages(baselinePath, currentPath, diffPath);
      const percentageDiff = (pixelDiff / totalPixels) * 100;
      const passed = percentageDiff <= THRESHOLD;

      const status = passed ? '✅' : '❌';
      console.log(
        `${status} ${fileName} - ${percentageDiff.toFixed(2)}% difference (${pixelDiff} pixels)`,
      );

      results.push({
        fileName,
        pixelDifference: pixelDiff,
        percentageDifference: percentageDiff,
        passed,
      });

      if (passed) {
        totalPassed++;
      } else {
        totalFailed++;
      }
    } catch (error) {
      console.log(`❌ ${fileName} - ERROR: ${(error as Error).message}`);
      results.push({
        fileName,
        pixelDifference: Number.POSITIVE_INFINITY,
        percentageDifference: 100,
        passed: false,
      });
      totalFailed++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Results: ${totalPassed} passed, ${totalFailed} failed\n`);

  if (totalFailed > 0) {
    console.log('❌ Visual regression test FAILED');
    console.log(`\n💡 Diff images saved to: ${DIFF_DIR}`);
    console.log('💡 If changes are intentional, update baselines with:');
    console.log('   pnpm test:vrt:update\n');
    process.exit(1);
  }

  console.log('✅ All visual regression tests PASSED\n');
  process.exit(0);
}

main();
