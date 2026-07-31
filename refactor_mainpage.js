const fs = require('fs');
let code = fs.readFileSync('src/pages/MainPage.jsx', 'utf8');

code = code.replace(/C\.card/g, '"var(--surface)"');
code = code.replace(/C\.border/g, '"var(--line)"');
code = code.replace(/C\.text/g, '"var(--ink)"');
code = code.replace(/C\.muted/g, '"var(--muted)"');
code = code.replace(/C\.inp/g, '"var(--surface-2)"');
code = code.replace(/C\.acc/g, '"var(--blue)"');
code = code.replace(/C\.ok/g, '"var(--teal)"');
code = code.replace(/C\.err/g, '"var(--crimson)"');
code = code.replace(/C\.shadow/g, '"var(--shadow)"');

fs.writeFileSync('src/pages/MainPage.jsx', code);
console.log('MainPage.jsx refactored.');
