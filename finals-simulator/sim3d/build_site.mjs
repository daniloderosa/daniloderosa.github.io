// Website version: complete HTML page (the built game is a fragment) and binary human model.
// Usage (from the project folder): node sim3d/build_site.mjs <destination folder>
import fs from 'node:fs';
const root = new URL('..', import.meta.url).pathname, out = process.argv[2];
const body = fs.readFileSync(root + 'sim3d/dist/finals-simulator.html', 'utf8');
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow"><!-- not indexed yet: reachable only by link -->
<style>html,body{margin:0;background:#050b18}[hidden]{display:none!important}</style>
</head>
<body>
${body}
</body>
</html>
`;
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(out + '/index.html', html);
// rig: bone hierarchy and idle/run clips used by the game (extracted from the original model, no mesh)
fs.copyFileSync(root + 'sim3d/rig.json', out + '/rig.json');
console.log('ok', out);
