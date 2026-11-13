// Builds the 3D game: injects model and engine into the template.
// Usage (from the project folder): node sim3d/build3d.mjs
import fs from 'node:fs';
const root = new URL('..', import.meta.url).pathname;
const model = JSON.parse(fs.readFileSync(root + 'model.json', 'utf8'));
const engine = fs.readFileSync(root + 'engine.js', 'utf8').replace(/^if \(typeof module.*$/m, '');
const html = fs.readFileSync(root + 'sim3d/template.html', 'utf8')
  .replace('/*MODEL*/', () => `const MODEL = ${JSON.stringify(model)};`)
  .replace('/*ENGINE*/', () => engine);
fs.mkdirSync(root + 'sim3d/dist', { recursive: true });
fs.writeFileSync(root + 'sim3d/dist/finals-simulator.html', html);
console.log('ok', (html.length / 1024).toFixed(0) + ' KB');
