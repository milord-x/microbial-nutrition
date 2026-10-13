const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const THREE=require('./vendor/three.min.js');
const context={THREE};
vm.createContext(context);
vm.runInContext(fs.readFileSync(__dirname+'/models.js','utf8')+';this.models=Bacteria.createModels();',context);
assert.equal(context.models.length,3);
assert.equal(new Set(context.models.map(m=>m.userData.nutrition)).size,3);
for(const model of context.models) {
  const bounds=new THREE.Box3().setFromObject(model);
  const size=bounds.getSize(new THREE.Vector3());
  assert.ok(size.x>0&&size.y>0&&size.z>0);
  assert.ok(size.x<5&&size.y<5&&size.z<5);
  let vertices=0;
  model.traverse(node=>{if(node.geometry){const a=node.geometry.attributes.position.array;for(const v of a)assert.ok(Number.isFinite(v));vertices+=a.length/3;}});
  assert.ok(vertices>1000);
  console.log(model.name,vertices,'vertices',size.toArray().map(v=>v.toFixed(2)).join(' × '));
}
const html=fs.readFileSync(__dirname+'/index.html','utf8');
assert.equal((html.match(/<h1>/g)||[]).length,3);
assert.equal((html.match(/class="view"/g)||[]).length,3);
assert.ok(!html.includes('<nav'));
new vm.Script(fs.readFileSync(__dirname+'/app.js','utf8'));
console.log('PASS: three unique models, finite 3D geometry, bounds, three names, no navigation');
