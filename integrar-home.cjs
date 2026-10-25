// Integração local, reaplicável após atualizar o runtime. Não altera dados do Wiki.js.
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const controller = path.join(root, 'runtime/server/controllers/common.js');
const marker = '// APRENDE_HOME';
const route = `\n${marker}\nrouter.use(require(require('path').resolve(WIKI.ROOTPATH, '../learning/server.cjs'))(WIKI, express))\nrouter.use('/cursos-home', express.static(require('path').resolve(WIKI.ROOTPATH, '../home'), { index: false, dotfiles: 'deny' }))\nrouter.get('/', (req, res) => res.sendFile(require('path').resolve(WIKI.ROOTPATH, '../home/index.html')))\n// APRENDE_HOME_END\n`;
let source = fs.readFileSync(controller, 'utf8');
if (source.includes(marker)) {
  const start = source.indexOf(marker);
  const endMarker = '// APRENDE_HOME_END';
  const end = source.indexOf(endMarker, start);
  const anchor = source.indexOf('const tmplCreateRegex', start);
  if (end >= 0)
    source = source.slice(0, start) + route.trimStart() + source.slice(end + endMarker.length);
  else if (anchor >= 0)
    source = source.slice(0, start) + route.trimStart() + '\n' + source.slice(anchor);
  else throw new Error('Não foi possível localizar o fim da integração anterior.');
} else {
  const anchor = 'const tmplCreateRegex';
  if (!source.includes(anchor))
    throw new Error('Controller mudou: revise a integração antes de aplicar.');
  source = source.replace(anchor, route + '\n' + anchor);
}
fs.writeFileSync(controller, source);
console.log('Home integrada. Reinicie o Wiki.js para carregar a rota.');
