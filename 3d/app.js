'use strict';
const canvas=document.querySelector('#canvas');
const views=[...document.querySelectorAll('.view')];
const preference=matchMedia('(prefers-reduced-motion: reduce)');
let renderer;
try {
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'});
} catch {
  document.querySelector('#error').hidden=false;
}
if(renderer) {
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.35;
  renderer.setClearColor(0xffffff,0);
  renderer.setScissorTest(true);
  const models=Bacteria.createModels();
  const states=models.map((model,index)=>{
    const scene=new THREE.Scene();
    const pivot=new THREE.Group();pivot.add(model);scene.add(pivot);
    scene.add(new THREE.HemisphereLight(0xffffff,0x65736b,2.0));
    for(const [color,power,position] of [[0xfff5e7,2.7,[-3,5,6]],[0xe0efff,1.7,[4,0,4]],[0xffffff,2.0,[1,4,-4]]]) {
      const light=new THREE.DirectionalLight(color,power);light.position.set(...position);scene.add(light);
    }
    const camera=new THREE.PerspectiveCamera(31,1,.1,50);camera.position.set(0,.05,9.7);camera.lookAt(0,.05,0);
    return {scene,pivot,model,camera,view:views[index],angle:.25,index,vertical:0,time:0,drag:null,paused:preference.matches};
  });
  let frame=0,last=0;
  let inView=true;
  function resize() {
    renderer.setSize(innerWidth,innerHeight,false);
    render();
  }
  function render() {
    renderer.setScissorTest(false);renderer.clear();renderer.setScissorTest(true);
    for(const state of states) {
      const rect=state.view.getBoundingClientRect();
      if(rect.bottom<0||rect.top>innerHeight||rect.width===0||rect.height===0) continue;
      const width=rect.width,height=rect.height;
      const bottom=innerHeight-rect.bottom;
      renderer.setViewport(rect.left,bottom,width,height);
      renderer.setScissor(rect.left,Math.max(0,bottom),width,Math.max(0,Math.min(innerHeight,rect.bottom)-Math.max(0,rect.top)));
      state.camera.aspect=width/height;
      state.camera.position.z=Math.max(8.5,5.4/state.camera.aspect);
      state.camera.updateProjectionMatrix();
      state.pivot.rotation.y=state.angle;
      state.pivot.rotation.x=state.vertical;
      state.pivot.position.y=Math.sin(state.time*.55+state.index)*.045;
      if(state.model.userData.flagella) state.model.userData.flagella.rotation.y=Math.sin(state.time*.75)*.035;
      renderer.render(state.scene,state.camera);
    }
  }
  function tick(now) {
    if(last) {
      const dt=Math.min((now-last)/1000,.05);
      for(const state of states) if(!state.paused&&!state.drag) {state.angle+=dt*.13;state.time+=dt;}
    }
    last=now;render();
    if(inView) frame=requestAnimationFrame(tick);
  }
  function stopDrag(state,event) {
    if(state.drag?.id!==event.pointerId) return;
    state.drag=null;
    if(state.view.hasPointerCapture(event.pointerId)) state.view.releasePointerCapture(event.pointerId);
  }
  for(const state of states) {
    const view=state.view;
    view.addEventListener('pointerdown',event=>{
      if(event.button!==0) return;
      state.drag={id:event.pointerId,x:event.clientX,y:event.clientY};
      view.setPointerCapture(event.pointerId);
    });
    view.addEventListener('pointermove',event=>{
      if(state.drag?.id!==event.pointerId) return;
      state.angle+=(event.clientX-state.drag.x)*.012;
      if(event.pointerType!=='touch') state.vertical=Math.max(-.9,Math.min(.9,state.vertical+(event.clientY-state.drag.y)*.008));
      state.drag.x=event.clientX;state.drag.y=event.clientY;render();
    });
    view.addEventListener('pointerup',event=>stopDrag(state,event));
    view.addEventListener('pointercancel',event=>stopDrag(state,event));
    view.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(event.key)) return;
      event.preventDefault();
      if(event.key===' ') state.paused=!state.paused;
      if(event.key==='ArrowLeft') state.angle-=.15;
      if(event.key==='ArrowRight') state.angle+=.15;
      if(event.key==='ArrowUp') state.vertical=Math.max(-.9,state.vertical-.1);
      if(event.key==='ArrowDown') state.vertical=Math.min(.9,state.vertical+.1);
      render();
    });
  }
  preference.addEventListener('change',()=>{states.forEach(s=>s.paused=preference.matches);render();});
  document.addEventListener('visibilitychange',()=>{
    inView=!document.hidden;cancelAnimationFrame(frame);last=0;
    if(inView) frame=requestAnimationFrame(tick);
  });
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();cancelAnimationFrame(frame);document.querySelector('#error').hidden=false;});
  canvas.addEventListener('webglcontextrestored',()=>{document.querySelector('#error').hidden=true;last=0;frame=requestAnimationFrame(tick);});
  addEventListener('resize',resize);
  addEventListener('scroll',render,{passive:true});
  resize();frame=requestAnimationFrame(tick);
}
