import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'public', 'icons');
await mkdir(outDir, { recursive: true });

const jobs = [
  { src: path.join(root, 'public', 'icon.svg'), dest: 'icon-192.png', size: 192 },
  { src: path.join(root, 'public', 'icon.svg'), dest: 'icon-512.png', size: 512 },
  { src: path.join(root, 'public', 'icon.svg'), dest: 'apple-touch-icon.png', size: 180 },
  { src: path.join(root, 'public', 'icons', 'maskable-icon.svg'), dest: 'maskable-512.png', size: 512 },
];

for (const job of jobs) {
  const out = path.join(outDir, job.dest);
  await sharp(job.src).resize(job.size, job.size).png().toFile(out);
  console.log(`generated ${job.dest} (${job.size}x${job.size})`);
}
