import fs from 'fs';
import path from 'path';

const srcDir = 'C:\\Users\\Aditya RS\\.gemini\\antigravity-ide\\brain\\164cb9e7-b025-46ad-8171-0a0a97819384';
const destDir = path.resolve('public', 'images');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = [
  { src: 'srijan_crochet_roses_1789753922616.jpg', dest: 'crochet_bouquet.jpg' },
  { src: 'srijan_resin_frame_1789753943667.jpg', dest: 'resin_frame.jpg' },
  { src: 'srijan_buddha_nameplate_1789753963690.jpg', dest: 'buddha_nameplate.jpg' },
  { src: 'srijan_sculptural_vase_1789753981900.jpg', dest: 'sculptural_vase.jpg' },
  { src: 'srijan_stoneware_mug_1789754002136.jpg', dest: 'stoneware_mug.jpg' },
  { src: 'srijan_potter_hands_1789754021142.jpg', dest: 'potter_hands.jpg' },
  { src: 'srijan_ceramic_plates_1789754040142.jpg', dest: 'ceramic_plates.jpg' },
];

for (const f of files) {
  const s = path.join(srcDir, f.src);
  const d = path.join(destDir, f.dest);
  if (fs.existsSync(s)) {
    fs.copyFileSync(s, d);
    console.log(`Copied ${f.dest}`);
  } else {
    console.warn(`Source not found: ${s}`);
  }
}
console.log('All images ready in public/images!');
