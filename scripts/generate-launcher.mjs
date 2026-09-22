import sharp from 'sharp';
import { readdirSync } from 'fs';
import path from 'path';

const root = process.cwd();
const mipmapDir = path.resolve(root, 'android/app/src/main/res');
const iconMaster = path.resolve(root, 'public/icons/icon-master.png');
const iconMaskable = path.resolve(root, 'public/icons/icon-maskable-master.png');

// Tamaños estándar para Android launcher icons
const DENSITIES = {
  'mipmap-mdpi':    { launcher: 48,  foreground: 108 },
  'mipmap-hdpi':    { launcher: 72,  foreground: 162 },
  'mipmap-xhdpi':   { launcher: 96,  foreground: 216 },
  'mipmap-xxhdpi':  { launcher: 144, foreground: 324 },
  'mipmap-xxxhdpi': { launcher: 192, foreground: 432 },
};

for (const [folderName, sizes] of Object.entries(DENSITIES)) {
  const folder = path.join(mipmapDir, folderName);
  
  // ic_launcher.png (cuadrado, fondo sólido terracota)
  await sharp(iconMaskable)
    .resize(sizes.launcher, sizes.launcher)
    .png()
    .toFile(path.join(folder, 'ic_launcher.png'));
  
  // ic_launcher_round.png (redondo, para Android viejo sin adaptive icons)
  await sharp(iconMaskable)
    .resize(sizes.launcher, sizes.launcher)
    .composite([{
      input: Buffer.from(
        `<svg><circle cx="${sizes.launcher/2}" cy="${sizes.launcher/2}" r="${sizes.launcher/2}" fill="#b45935"/></svg>`
      ),
      blend: 'dest-in'
    }])
    .png()
    .toFile(path.join(folder, 'ic_launcher_round.png'));
  
  // ic_launcher_foreground.png (SOLO el isotipo, transparente, con padding 33%)
  // Android adaptive icons: el foreground debe tener el contenido centrado
  // ocupando aproximadamente el 66% del canvas total (zona segura)
  const fgSize = Math.round(sizes.foreground * 0.66);
  await sharp(iconMaster)
    .resize(fgSize, fgSize, { fit: 'inside' })
    .extend({
      top: Math.round((sizes.foreground - fgSize) / 2),
      bottom: Math.round((sizes.foreground - fgSize) / 2),
      left: Math.round((sizes.foreground - fgSize) / 2),
      right: Math.round((sizes.foreground - fgSize) / 2),
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toFile(path.join(folder, 'ic_launcher_foreground.png'));
  
  console.log(`✓ ${folderName}: ${sizes.launcher}px launcher, ${sizes.foreground}px foreground`);
}

console.log('✅ Android launcher icons generados');