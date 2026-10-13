import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
const html=readFileSync('index.html','utf8');
const manifest=JSON.parse(readFileSync('slides/manifest.json','utf8'));
assert.equal(manifest.sha256,createHash('sha256').update(readFileSync(manifest.source)).digest('hex'));
assert.equal(manifest.pages.length,10);
assert.equal((html.match(/<section\b/g)||[]).length,10);
assert.ok(html.includes('lang="kk"'));
for(const text of ['Әбдіқұл Арслан','Болатхан.К.','Биотехнология кафедрасы','Пайдаланылған әдебиеттер']) assert.ok(html.includes(text));
for(const [i,page] of manifest.pages.entries()) {
  assert.equal(page.page,i+1);
  assert.ok(html.includes(`src="${page.image}"`));
  const png=readFileSync(page.image);
  assert.equal(png.readUInt32BE(16),1920);
  assert.equal(png.readUInt32BE(20),1080);
}
for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) if(!match[1].startsWith('https:')) assert.ok(existsSync(match[1]),match[1]);
assert.ok(!html.includes('<nav'));
new vm.Script(readFileSync('app.js','utf8'));
console.log('PASS: original PDF hash unchanged, 10 full-size pages in order, Kazakh credits, local assets, links and JS syntax');
