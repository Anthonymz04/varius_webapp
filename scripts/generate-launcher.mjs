import sharp from 'sharp';
import { readdirSync } from 'fs';
import path from 'path';

const mipmapDir = path.resolve('android/app/src/main/res');
const iconSrc = path.resolve('public/icon.svg');
const maskableSrc = path.resolve('public/icons/maskable-icon.svg');

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
  await sharp(maskableSrc).resize(fgMeta.width, fgMeta.height).png().toFile(fg);

  console.log(`updated ${path.basename(folder)} launcher=${launcherMeta.width} foreground=${fgMeta.width}`);
}
