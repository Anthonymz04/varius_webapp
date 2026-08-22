import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'public', 'icons');
await mkdir(outDir, { recursive: true });

const src = path.join(root, 'public', 'icon.svg');

const jobs = [
  { dest: 'icon-192.png', size: 192 },
  { dest: 'icon-512.png', size: 512 },
  { dest: 'apple-touch-icon.png', size: 180 },
  { dest: 'maskable-512.png', size: 512 },
];

for (const job of jobs) {
  const out = path.join(outDir, job.dest);
  await sharp(src)
    .resize(job.size, job.size, { fit: 'cover' })
    .png()
    .toFile(out);
  console.log(`generated ${job.dest} (${job.size}x${job.size})`);
}
