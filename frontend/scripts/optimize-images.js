import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const MAX_BYTES = 150 * 1024; // 150 KB max

const TARGET_DIRS = [
  path.join(rootDir, 'src', 'assets'),
  path.join(rootDir, 'public', 'assets'),
  path.join(rootDir, 'public', 'frames'),
  path.join(rootDir, 'public', 'frames-mobile'),
];

async function compressImageToLimit(filePath, outputFilePath) {
  let quality = 82;
  let maxDimension = 1600;
  let buffer;

  const metadata = await sharp(filePath).metadata();
  let width = metadata.width;
  let height = metadata.height;

  // Scale down if dimensions are excessively large
  if (width && height && (width > maxDimension || height > maxDimension)) {
    if (width >= height) {
      width = maxDimension;
      height = undefined;
    } else {
      height = maxDimension;
      width = undefined;
    }
  }

  do {
    let pipeline = sharp(filePath);
    if (width || height) {
      pipeline = pipeline.resize({ width, height, fit: 'inside', withoutEnlargement: true });
    }

    buffer = await pipeline
      .webp({ quality, effort: 6 })
      .toBuffer();

    if (buffer.length <= MAX_BYTES) break;

    // Reduce quality first, then downscale if still too big
    if (quality > 45) {
      quality -= 8;
    } else {
      maxDimension = Math.round(maxDimension * 0.85);
      width = maxDimension;
      height = undefined;
    }
  } while (buffer.length > MAX_BYTES && maxDimension > 400);

  fs.writeFileSync(outputFilePath, buffer);
  return buffer.length;
}

async function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      await processDirectory(fullPath);
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();

    // Convert PNG / JPG / JPEG to WebP
    if (['.png', '.jpg', '.jpeg'].includes(ext)) {
      const webpName = `${path.parse(entry.name).name}.webp`;
      const webpPath = path.join(dirPath, webpName);
      console.log(`[CONVERT] ${entry.name} -> ${webpName}`);
      const newSize = await compressImageToLimit(fullPath, webpPath);
      console.log(`  └─ Optimized: ${(newSize / 1024).toFixed(1)} KB`);
    }

    // Check existing WebP images that exceed 150 KB
    if (ext === '.webp') {
      const stat = fs.statSync(fullPath);
      if (stat.size > MAX_BYTES) {
        console.log(`[OPTIMIZE] ${entry.name} (${(stat.size / 1024).toFixed(1)} KB > 150 KB)`);
        const tempPath = `${fullPath}.tmp`;
        const newSize = await compressImageToLimit(fullPath, tempPath);
        fs.renameSync(tempPath, fullPath);
        console.log(`  └─ Reduced to: ${(newSize / 1024).toFixed(1)} KB`);
      }
    }
  }
}

async function run() {
  console.log('🚀 Starting batch image optimization (Target: < 150 KB WebP)...');
  for (const dir of TARGET_DIRS) {
    if (fs.existsSync(dir)) {
      console.log(`\n📂 Scanning: ${path.relative(rootDir, dir)}`);
      await processDirectory(dir);
    }
  }
  console.log('\n✨ Batch optimization complete! All images verified <= 150 KB.');
}

run().catch((err) => {
  console.error('❌ Optimization failed:', err);
  process.exit(1);
});
