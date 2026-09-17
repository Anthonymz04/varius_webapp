const fs = require('fs');
const os = require('os');
const path = require('path');
const sharp = require('sharp');
const potrace = require('potrace');

const SRC_DIR = path.join(__dirname, '..', 'docs', 'brand');
const ICON_JPEG = path.join(SRC_DIR, 'icono-app.jpeg');
const LOGO_JPEG = path.join(SRC_DIR, 'logo.jpeg');
const OUT_DIR = path.join(__dirname, '..', 'public', 'brand');
const BRAND = '#B45935';
const CREAM = '#FDF8F5';
const MASK_THR = 200;

/** Trace a (optionally squared) monochrome PNG from a JPEG crop.
 *  - forceSquare=true: pads the extracted glyph to a 1:1 canvas (used for the isotipo used in splash/icons).
 *  - forceSquare=false: keeps the original aspect (used for the lockup/logo).
 */
async function toTrimmedMaskPng(jpegPath, crop, forceSquare = false) {
  const { data, info } = await sharp(jpegPath)
    .extract(crop)
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let minX = info.width, minY = info.height, maxX = -1, maxY = -1;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[y * info.width + x] <= MASK_THR) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  const w = Math.max(maxX - minX + 1, 1);
  const h = Math.max(maxY - minY + 1, 1);
  const target = 826;
  let nw, nh, pad;
  if (forceSquare) {
    const size = Math.max(w, h);
    const ns = Math.round(size * (target / size));
    nw = target;
    nh = target;
    pad = Math.round((target - ns) / 2);
  } else {
    const longSide = Math.max(w, h);
    const scale = target / longSide;
    nw = Math.round(w * scale);
    nh = Math.round(h * scale);
    pad = 0;
  }
  const extract = await sharp(data, { raw: { width: info.width, height: info.height, channels: 1 } })
    .extract({ left: minX, top: minY, width: w, height: h })
    .resize(nw, nh, { fit: 'fill' })
    .toBuffer();
  let out = sharp(extract, { raw: { width: nw, height: nh, channels: 1 } });
  if (pad > 0) {
    out = out.extend({
      top: pad, bottom: pad, left: pad, right: pad,
      background: 'rgba(255,255,255,0)',
    });
  }
  const png = await out.png().toBuffer();
  const tmp = path.join(os.tmpdir(), `varius-brand-${Date.now()}-${Math.random().toString(36).slice(2)}.png`);
  fs.writeFileSync(tmp, png);
  return { file: tmp, width: forceSquare ? target : nw, height: forceSquare ? target : nh };
}

function tracePng(pngPath, color) {
  return new Promise((resolve, reject) => {
    potrace.trace(pngPath, { turdSize: 16, alphaMax: 1.0, optTolerance: 0.35, optCurve: true, background: 'transparent', color }, (err, svg) => (err ? reject(err) : resolve(svg)));
  });
}

function withViewBox(svg, w, h) {
  return svg
    .replace(/<svg[^>]*>/, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="VARIUS">`)
    .replace(/<\/svg>[\s\S]*$/, '</svg>');
}

async function run() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const iso = await toTrimmedMaskPng(ICON_JPEG, { left: 40, top: 60, width: 272, height: 205 }, true);
  const lock = await toTrimmedMaskPng(LOGO_JPEG, { left: 0, top: 0, width: 690, height: 224 });

  const isoSvg = await tracePng(iso.file, BRAND);
  const isoMono = await tracePng(iso.file, CREAM);
  const lockSvg = await tracePng(lock.file, BRAND);
  const lockMono = await tracePng(lock.file, CREAM);

  fs.writeFileSync(path.join(OUT_DIR, 'isotipo.svg'), withViewBox(isoSvg.replace(/<path /, '<path stroke="#8F4422" stroke-width="2" stroke-linejoin="round" '), iso.width, iso.height));
  fs.writeFileSync(path.join(OUT_DIR, 'isotipo-mono.svg'), withViewBox(isoMono, iso.width, iso.height));
  const lockHead = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + lock.width + ' ' + lock.height + '" width="100%" height="auto" role="img" aria-label="VARIUS">';
  fs.writeFileSync(path.join(OUT_DIR, 'lockup.svg'), lockSvg.replace(/<svg[^>]*>[\s\S]*<rect[^>]*\/?>?/, lockHead).replace(/<rect[^>]*\/?>/g, '').replace(/<\/svg>[\s\S]*$/, '</svg>'));
  fs.writeFileSync(path.join(OUT_DIR, 'lockup-mono.svg'), lockMono.replace(/<svg[^>]*>[\s\S]*<rect[^>]*\/?>?/, lockHead).replace(/<rect[^>]*\/?>/g, '').replace(/<\/svg>[\s\S]*$/, '</svg>'));

  const isoD = isoSvg.match(/d="([^"]*)"/)[1];
  const markLong = Math.max(iso.width, iso.height);
  const s = 720 / markLong;
  const mw = Math.round(iso.width * s);
  const mh = Math.round(iso.height * s);
  const tx = Math.round((1024 - mw) / 2);
  const ty = Math.round((1024 - mh) / 2);
  const tile = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" role="img" aria-label="VARIUS">' +
    '<rect x="0" y="0" width="1024" height="1024" rx="120" fill="' + CREAM + '" stroke="' + BRAND + '" stroke-width="20"/>' +
    '<g transform="translate(' + tx + ' ' + ty + ') scale(' + (s).toFixed(4) + ')"><path d="' + isoD + '" fill="' + BRAND + '"/></g></svg>';
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'icon.svg'), tile);

  fs.rmSync(iso.file, { force: true });
  fs.rmSync(lock.file, { force: true });
  console.log('brand assets generated from JPEGs:', iso.width + 'x' + iso.height, lock.width + 'x' + lock.height);
}

run().catch((e) => { console.error(e); process.exit(1); });
