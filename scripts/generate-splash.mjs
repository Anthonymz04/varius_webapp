import sharp from 'sharp';
import { readdirSync } from 'fs';
import path from 'path';

const resDir = path.resolve('android/app/src/main/res');

const targets = [];
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name === 'splash.png') targets.push(full);
  }
}
walk(resDir);

const src = path.resolve('public/icon.svg');

for (const target of targets) {
  const m = await sharp(target).metadata();
  const logoSize = Math.round(Math.min(m.width, m.height) * 0.42);
  const base = await sharp({
    create: { width: m.width, height: m.height, channels: 3, background: '#c2185b' },
  }).png().toBuffer();
  const logo = await sharp(src).resize(logoSize, logoSize).png().toBuffer();
  await sharp(base)
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toFile(path.join(path.dirname(target), 'splash.png'));
  const rel = path.relative(resDir, target);
  console.log(`replaced ${rel} -> ${m.width}x${m.height} logo ${logoSize}`);
}
