'use strict';
const Bacteria = (() => {
  const T = THREE;
  let seed = 142;
  const random = () => {seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const sphere = new T.SphereGeometry(1,40,28);
  const grain = new T.SphereGeometry(1,8,6);
  const noise = new Uint8Array(128*128);
  for(let i=0;i<noise.length;i++) noise[i]=100+random()*150;
  const texture=new T.DataTexture(noise,128,128,T.RedFormat);
  texture.wrapS=texture.wrapT=T.RepeatWrapping;
  texture.magFilter=T.LinearFilter;
  texture.minFilter=T.LinearFilter;
  texture.needsUpdate=true;
  function material(color,opacity=1,roughness=.38) {
    return new T.MeshPhysicalMaterial({color,roughness,metalness:.025,clearcoat:.48,clearcoatRoughness:.3,transparent:opacity<1,opacity,depthWrite:opacity===1,side:T.DoubleSide});
  }
  function ellipsoid(group,position,scale,mat) {
    const mesh=new T.Mesh(sphere,mat);
    mesh.position.set(...position);mesh.scale.set(...scale);group.add(mesh);return mesh;
  }
  function tube(group,points,radius,mat,segments=90) {
    const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));
    const mesh=new T.Mesh(new T.TubeGeometry(curve,segments,radius,7,false),mat);
    group.add(mesh);return mesh;
  }
  function granules(group,count,radius,length,color) {
    const mesh=new T.InstancedMesh(grain,material(color,1,.53),count);
    const dummy=new T.Object3D();
    for(let i=0;i<count;i++) {
      const angle=random()*Math.PI*2;
      const y=(random()-.5)*length;
      const r=Math.sqrt(random())*radius*Math.sqrt(Math.max(.1,1-(y/(length*.64))**2));
      dummy.position.set(Math.cos(angle)*r,y,Math.sin(angle)*r);
      dummy.scale.setScalar(.018+random()*.025);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);
    }
    group.add(mesh);return mesh;
  }
  function nucleoid(group,radius,length,color) {
    const points=[];
    for(let i=0;i<=145;i++) {
      const t=i/145*Math.PI*2;
      points.push([Math.sin(t*4)*radius*(.7+.2*Math.cos(t*3)),Math.cos(t)*length*.38,Math.cos(t*5)*radius*.65]);
    }
    return tube(group,points,.023,material(color),210);
  }
  function surface(mat,strength=.03) {
    mat.bumpMap=texture;mat.bumpScale=strength;return mat;
  }
  function capsule(group,radius,length,mat) {
    const mesh=new T.Mesh(new T.CapsuleGeometry(radius,length,16,48),mat);group.add(mesh);return mesh;
  }
  function cyano() {
    const model=new T.Group();model.name='Anabaena';model.userData.nutrition='photoautotroph';
    const membrane=surface(material(0x55a993,.40),.025);
    const inside=material(0x398b68,.20);
    const thylakoid=material(0x276e48,.9);
    for(let n=0;n<7;n++) {
      const cell=new T.Group();
      const y=(n-3)*.56;
      cell.position.set(Math.sin(n*.76)*.42-.16,y,Math.cos(n*.76)*.18);
      cell.rotation.z=Math.cos(n*.76)*-.18;
      model.add(cell);
      ellipsoid(cell,[0,0,0],[.335,.325,.32],membrane);
      ellipsoid(cell,[0,0,0],[.30,.291,.282],inside);
      for(let k=0;k<4;k++) {
        const points=[];
        for(let j=0;j<=64;j++) {
          const a=j/64*Math.PI*2;
          points.push([Math.cos(a)*(.252-k*.027),Math.sin(a)*(.245-k*.022),.045*Math.sin(a*3+k)]);
        }
        tube(cell,points,.011,thylakoid,64);
      }
      nucleoid(cell,.07,.39,0xcccb83);
      granules(cell,48,.26,.47,0x385e49);
    }
    model.rotation.z=-.22;
    return model;
  }
  function nitro() {
    const model=new T.Group();model.name='Nitrosomonas';model.userData.nutrition='chemolithoautotroph';
    const cell=new T.Group();cell.rotation.z=-.27;model.add(cell);
    capsule(cell,.64,1.12,surface(material(0xb69254,.42),.027));
    capsule(cell,.59,1.09,material(0xe7c682,.17));
    const fold=material(0xa66830,.79);
    for(const side of [-1,1]) {
      for(let j=0;j<8;j++) {
        const y=(j-3.5)*.17;
        const membrane=ellipsoid(cell,[side*.405,y,0],[.10,.025,.37],fold);
        membrane.rotation.z=side*-.16;
      }
    }
    nucleoid(cell,.24,1.7,0x8b5549);
    granules(cell,230,.51,1.85,0xab7839);
    const pore=new T.InstancedMesh(grain,material(0x987344,.74),320);
    const dummy=new T.Object3D();
    for(let n=0;n<320;n++) {
      const a=random()*Math.PI*2,y=(random()-.5)*2.35;
      const edge=Math.max(0,Math.abs(y)-.56);
      const r=Math.sqrt(Math.max(.015,.645**2-edge**2));
      dummy.position.set(Math.cos(a)*r,y,Math.sin(a)*r);
      dummy.scale.setScalar(.012+random()*.012);dummy.updateMatrix();pore.setMatrixAt(n,dummy.matrix);
    }
    cell.add(pore);model.scale.setScalar(1.22);return model;
  }
  function ecoli() {
    const model=new T.Group();model.name='Escherichia coli';model.userData.nutrition='chemoorganoheterotroph';
    const cell=new T.Group();cell.rotation.z=.35;model.add(cell);
    capsule(cell,.46,1.64,surface(material(0xb96569,.43),.032));
    capsule(cell,.417,1.62,material(0xeaa299,.17));
    nucleoid(cell,.21,2.12,0x886089);
    granules(cell,280,.36,2.25,0x9b6559);
    const pili=material(0xb97570,.86,.55);
    for(let n=0;n<66;n++) {
      const a=random()*Math.PI*2,y=(random()-.5)*1.8;
      const x=Math.cos(a)*.46,z=Math.sin(a)*.46;
      tube(cell,[[x,y,z],[x*1.15,y+.035,z*1.15],[x*1.30,y+.085,z*1.30]],.007,pili,8);
    }
    const flagella=new T.Group();cell.add(flagella);
    const filament=material(0xbc8078,1,.45);
    for(let n=0;n<6;n++) {
      const a=n/6*Math.PI*2;
      const points=[];
      for(let j=0;j<=52;j++) {
        const t=j/52;
        const r=.28+t*.58;
        points.push([Math.cos(a)*r+Math.sin(t*13+n)*.075*t,-.88-t*1.38,Math.sin(a)*r+Math.cos(t*13+n)*.075*t]);
      }
      tube(flagella,points,.012,filament,80);
    }
    model.position.y=.18;model.userData.flagella=flagella;return model;
  }
  function createModels() {return [cyano(),nitro(),ecoli()];}
  return {createModels};
})();
