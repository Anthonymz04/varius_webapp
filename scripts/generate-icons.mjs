import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'public', 'icons');

await mkdir(outDir, { recursive: true });

const master = path.join(root, 'public', 'icons', 'icon-master.png');
const maskableMaster = path.join(root, 'public', 'icons', 'icon-maskable-master.png');

const jobs = [
  { src: master, dest: 'icon-192.png', size: 192 },
  { src: master, dest: 'icon-512.png', size: 512 },
  { src: master, dest: 'apple-touch-icon.png', size: 180, flatten: true },
  { src: maskableMaster, dest: 'maskable-512.png', size: 512, flatten: true },
];

for (const job of jobs) {
  const out = path.join(outDir, job.dest);
  let img = sharp(job.src).resize(job.size, job.size, { fit: 'cover' });
  // Flatten convierte transparencia a fondo sólido (necesario para iOS y maskable)
  if (job.flatten) {
    img = img.flatten({ background: '#b45935' });
  }
  await img.png().toFile(out);
  console.log(`generated ${job.dest} (${job.size}x${job.size})`);
}

console.log('✅ Web icons generados');