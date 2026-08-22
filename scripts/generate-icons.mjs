/**
 * Gera os ícones do app (favicon, apple-touch e os do PWA) sem depender
 * de nenhuma biblioteca de imagem: desenha os pixels na mão e escreve o
 * PNG com o zlib do próprio Node.
 *
 *   node scripts/generate-icons.mjs
 */

import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// Gradiente da marca: rosa → violeta
const C1 = [236, 72, 153];
const C2 = [139, 92, 246];

// ---------------------------------------------------------------------
// PNG mínimo (RGBA, sem filtro)
// ---------------------------------------------------------------------
function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function encodePng(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filtro "none"
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bits por canal
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---------------------------------------------------------------------
// Geometria (coordenadas de 0 a 1)
// ---------------------------------------------------------------------
function insideRoundRect(x, y, x0, y0, x1, y1, r) {
  const cx = Math.min(Math.max(x, x0 + r), x1 - r);
  const cy = Math.min(Math.max(y, y0 + r), y1 - r);
  if (x >= x0 && x <= x1 && y >= y0 + r && y <= y1 - r) return true;
  if (y >= y0 && y <= y1 && x >= x0 + r && x <= x1 - r) return true;
  return Math.hypot(x - cx, y - cy) <= r;
}

function distanceToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/** Cor final do pixel em coordenadas normalizadas. */
function sample(x, y, { maskable }) {
  // Fundo: quadrado arredondado (ou sangria total no maskable)
  const radius = maskable ? 0 : 0.235;
  const onCanvas = maskable || insideRoundRect(x, y, 0, 0, 1, 1, radius);
  if (!onCanvas) return [0, 0, 0, 0];

  const t = Math.min(1, Math.max(0, (x + y) / 2));
  const bg = [
    Math.round(C1[0] + (C2[0] - C1[0]) * t),
    Math.round(C1[1] + (C2[1] - C1[1]) * t),
    Math.round(C1[2] + (C2[2] - C1[2]) * t),
  ];

  // No maskable o desenho encolhe para caber na zona segura (80%)
  const scale = maskable ? 0.66 : 1;
  const gx = (x - 0.5) / scale + 0.5;
  const gy = (y - 0.5) / scale + 0.5;

  const body = insideRoundRect(gx, gy, 0.19, 0.29, 0.81, 0.83, 0.075);
  const header = gy <= 0.44 && insideRoundRect(gx, gy, 0.19, 0.29, 0.81, 0.83, 0.075);
  const rings =
    insideRoundRect(gx, gy, 0.32, 0.17, 0.41, 0.37, 0.045) ||
    insideRoundRect(gx, gy, 0.59, 0.17, 0.68, 0.37, 0.045);

  const check =
    Math.min(
      distanceToSegment(gx, gy, 0.34, 0.6, 0.45, 0.71),
      distanceToSegment(gx, gy, 0.45, 0.71, 0.68, 0.5),
    ) <= 0.036;

  if (rings) return [255, 255, 255, 255];
  if (body && !header) return check ? [...bg, 255] : [255, 255, 255, 255];
  return [...bg, 255];
}

function render(size, options) {
  const SS = 3; // supersampling: 3x3 amostras por pixel
  const out = Buffer.alloc(size * size * 4);

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;

      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const [cr, cg, cb, ca] = sample(
            (px + (sx + 0.5) / SS) / size,
            (py + (sy + 0.5) / SS) / size,
            options,
          );
          const alpha = ca / 255;
          r += cr * alpha;
          g += cg * alpha;
          b += cb * alpha;
          a += ca;
        }
      }

      const n = SS * SS;
      const alphaAvg = a / n;
      const i = (py * size + px) * 4;
      const weight = alphaAvg > 0 ? (a / 255) : 1;
      out[i] = Math.round(r / weight);
      out[i + 1] = Math.round(g / weight);
      out[i + 2] = Math.round(b / weight);
      out[i + 3] = Math.round(alphaAvg);
    }
  }

  return encodePng(size, size, out);
}

const targets = [
  { path: 'app/icon.png', size: 256, maskable: false },
  { path: 'app/apple-icon.png', size: 180, maskable: false },
  { path: 'public/icons/icon-192.png', size: 192, maskable: false },
  { path: 'public/icons/icon-512.png', size: 512, maskable: false },
  { path: 'public/icons/icon-maskable-512.png', size: 512, maskable: true },
];

for (const target of targets) {
  const file = join(ROOT, target.path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, render(target.size, { maskable: target.maskable }));
  console.log(`✓ ${target.path} (${target.size}×${target.size})`);
}
