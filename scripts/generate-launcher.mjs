import sharp from 'sharp';
import { readdirSync } from 'fs';
import path from 'path';

const mipmapDir = path.resolve('android/app/src/main/res');
const iconSrc = path.resolve('public/icon.svg');

const folders = readdirSync(mipmapDir, { withFileTypes: true })
  .filter((e) => e.isDirectory() && e.name.startsWith('mipmap-') && !e.name.includes('anydpi'))
  .map((e) => path.join(mipmapDir, e.name));

for (const folder of folders) {
  const launcher = path.join(folder, 'ic_launcher.png');
  const launcherMeta = await sharp(launcher).metadata();

  await sharp(iconSrc).resize(launcherMeta.width, launcherMeta.height).png().toFile(launcher);
  await sharp(iconSrc).resize(launcherMeta.width, launcherMeta.height).png().toFile(path.join(folder, 'ic_launcher_round.png'));

  const fg = path.join(folder, 'ic_launcher_foreground.png');
  const fgMeta = await sharp(fg).metadata();
  const logoSize = Math.round(fgMeta.width * 0.65);
  const logo = await sharp(iconSrc).resize(logoSize, logoSize).png().toBuffer();
  await sharp({
    create: { width: fgMeta.width, height: fgMeta.height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  }).composite([{ input: logo, gravity: 'center' }]).png().toFile(fg);

  console.log(`updated ${path.basename(folder)} launcher=${launcherMeta.width} foreground=${fgMeta.width}`);
}
