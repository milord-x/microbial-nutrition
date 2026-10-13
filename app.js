const examples = {
  cyano: {type:'Фотолитоавтотроф',energy:'Жарық',carbon:'CO₂',electron:'H₂O',note:'Оттекті фотосинтез жүргізетін цианобактерияның типтік режимі.',source:'OpenStax · Microbiology, §8.6',url:'https://openstax.org/books/microbiology/pages/8-6-photosynthesis'},
  nitro: {type:'Хемолитоавтотроф',energy:'NH₃ тотығуы',carbon:'CO₂',electron:'NH₃',note:'Nitrosomonas аммиакты нитритке тотықтырады; көміртекті CO₂-ден алады.',source:'OpenStax · Microbiology, §8.1 және §8.7',url:'https://openstax.org/books/microbiology/pages/8-7-biogeochemical-cycles'},
  rhodo: {type:'Фотоорганогетеротроф',energy:'Жарық',carbon:'Органикалық қосылыс',electron:'Органикалық қосылыс',note:'Жарықта, оттексіз және органикалық субстрат бар ортадағы режим. Өзге жағдайда қоректену типі өзгеруі мүмкін.',source:'Larimer et al. · Nature Biotechnology, 2004',url:'https://doi.org/10.1038/nbt923'},
  ecoli: {type:'Хемоорганогетеротроф',energy:'Органикалық заттың ыдырауы',carbon:'Органикалық қосылыс',electron:'Органикалық қосылыс',note:'E. coli органикалық субстраттарды көміртек, энергия және электрон көзі ретінде пайдаланады.',source:'OpenStax · Microbiology, §8.1',url:'https://openstax.org/books/microbiology/pages/8-1-energy-matter-and-enzymes'}
};
document.documentElement.classList.add('js');
const sections = [...document.querySelectorAll('.scene')];
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
let paused = reduce.matches;
let active = 0;
let time = 0;
let last = 0;
let frameId = 0;
let pointerX = 0;
let pointerY = 0;
const motion = document.querySelector('#motion');
function syncMotion() {
  document.body.classList.toggle('paused', paused);
  const label = paused ? 'Анимацияны жалғастыру' : 'Анимацияны тоқтату';
  motion.setAttribute('aria-label', label);
  motion.title = label;
  motion.firstElementChild.textContent = paused ? '▷' : 'Ⅱ';
  cancelAnimationFrame(frameId);
  last = 0;
  frameId = requestAnimationFrame(draw);
}
motion.addEventListener('click', () => {paused = !paused;syncMotion();});
reduce.addEventListener('change', () => {paused = reduce.matches;syncMotion();});
const fullscreen = document.querySelector('#fullscreen');
if (!document.fullscreenEnabled) fullscreen.hidden = true;
fullscreen.addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch {fullscreen.hidden = true;}
});
document.addEventListener('fullscreenchange', () => {
  const label = document.fullscreenElement ? 'Толық экраннан шығу' : 'Толық экран';
  fullscreen.setAttribute('aria-label', label);
  fullscreen.title = label;
});
document.querySelectorAll('[data-example]').forEach(button => {
  button.addEventListener('click', () => {
    const value = examples[button.dataset.example];
    document.querySelectorAll('[data-example]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    for (const key of ['type','energy','carbon','electron','note']) document.querySelector(`#result-${key}`).textContent = value[key];
    const link = document.querySelector('#result-source');
    link.textContent = `${value.source} ↗`;
    link.href = value.url;
  });
});
const observer = new IntersectionObserver(entries => {
  for (const entry of entries) if (entry.isIntersecting) entry.target.classList.add('visible');
}, {threshold:0.12});
sections.forEach(section => observer.observe(section));
sections[0].classList.add('visible');
function updateActive() {
  const center = innerHeight * .5;
  let distance = Infinity;
  sections.forEach((section, index) => {
    const bounds = section.getBoundingClientRect();
    const next = Math.abs((bounds.top + bounds.bottom) / 2 - center);
    if (next < distance) {distance = next;active = index;}
  });
}
addEventListener('scroll', updateActive, {passive:true});
addEventListener('pointermove', event => {
  pointerX = (event.clientX / innerWidth - .5) * 12;
  pointerY = (event.clientY / innerHeight - .5) * 12;
}, {passive:true});
document.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest('button,a,input,select,textarea,[tabindex]')) return;
  let next = active;
  if (['ArrowDown','PageDown',' '].includes(event.key)) next++;
  else if (['ArrowUp','PageUp'].includes(event.key)) next--;
  else if (event.key === 'Home') next = 0;
  else if (event.key === 'End') next = sections.length - 1;
  else return;
  event.preventDefault();
  sections[Math.max(0,Math.min(sections.length-1,next))].scrollIntoView({behavior:reduce.matches?'instant':'smooth'});
});
const canvas = document.querySelector('#microcosm');
const ctx = canvas.getContext('2d');
const palettes = {mint:[134,224,193],lime:[180,211,116],amber:[220,171,109],purple:[178,144,218]};
let tint = [...palettes.mint];
let width = innerWidth;
let height = innerHeight;
function resize() {
  width = innerWidth;height = innerHeight;
  const dpr = Math.min(devicePixelRatio || 1, 1.7);
  canvas.width = width * dpr;canvas.height = height * dpr;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  updateActive();
  if (paused) {cancelAnimationFrame(frameId);frameId = requestAnimationFrame(draw);}
}
function makeCell(seed) {
  const surface = document.createElement('canvas');
  surface.width = 440;surface.height = 700;
  const c = surface.getContext('2d');
  let state = seed;
  const random = () => {state = (state * 1664525 + 1013904223) >>> 0;return state / 4294967296;};
  c.translate(220,350);
  c.strokeStyle = '#c5f8e437';c.lineWidth = .75;
  for(let n=0;n<85;n++){
    const a=n/85*Math.PI*2;
    const x=Math.cos(a)*104,y=Math.sin(a)*247;
    c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x*1.1+random()*12,y*1.05,x*1.18+random()*16,y*1.09);c.stroke();
  }
  const body = new Path2D();body.ellipse(0,0,104,247,0,0,Math.PI*2);
  c.shadowColor='#abffe057';c.shadowBlur=20;
  const g=c.createRadialGradient(-35,-90,10,0,0,270);
  g.addColorStop(0,'#bdf4df23');g.addColorStop(.6,'#76c5ab17');g.addColorStop(.86,'#bdffe759');g.addColorStop(1,'#a9f4d820');
  c.fillStyle=g;c.fill(body);c.strokeStyle='#bdfbe785';c.lineWidth=2;c.stroke(body);c.shadowBlur=0;
  for(let n=0;n<5;n++){c.beginPath();c.ellipse(0,0,99-n*3,240-n*3,0,0,Math.PI*2);c.strokeStyle=`rgba(179,239,216,${.16-n*.02})`;c.lineWidth=1;c.stroke();}
  c.save();c.clip(body);
  for(let n=0;n<1900;n++){
    const x=(random()-.5)*210,y=(random()-.5)*500;
    c.fillStyle=`rgba(188,246,222,${random()*.26})`;c.beginPath();c.arc(x,y,random()*1.6+.3,0,Math.PI*2);c.fill();
  }
  for(let n=0;n<27;n++){
    const x=(random()-.5)*143,y=(random()-.5)*382,r=3+random()*9;
    c.beginPath();c.ellipse(x,y,r,r*.7,random()*6,0,Math.PI*2);c.fillStyle='#caffdf14';c.strokeStyle='#b7f4d650';c.lineWidth=.8;c.fill();c.stroke();
  }
  for(let strand=0;strand<2;strand++){
    c.beginPath();
    for(let n=0;n<180;n++){const y=n*1.7-150;const x=Math.sin(n*.094+strand*Math.PI)*24+Math.sin(n*.03)*18;n===0?c.moveTo(x,y):c.lineTo(x,y);}
    c.strokeStyle='#c8efd175';c.lineWidth=1.8;c.stroke();
  }
  for(let n=0;n<25;n++){const y=n*11-150;const a=n*11/1.7;c.beginPath();c.moveTo(Math.sin(a*.094)*24+Math.sin(a*.03)*18,y);c.lineTo(Math.sin(a*.094+Math.PI)*24+Math.sin(a*.03)*18,y);c.strokeStyle='#c8efd13a';c.lineWidth=1;c.stroke();}
  c.restore();
  c.beginPath();c.moveTo(0,242);c.bezierCurveTo(0,280,60,285,28,334);c.strokeStyle='#c4f2df6a';c.lineWidth=1.5;c.stroke();
  return surface;
}
const sprites = [makeCell(14),makeCell(72),makeCell(198)];
const cells = [
  {x:.80,y:.44,s:.90,r:.55,sprite:0,alpha:.94},
  {x:.66,y:.81,s:.46,r:-.75,sprite:1,alpha:.6},
  {x:1.00,y:.90,s:.62,r:1.05,sprite:2,alpha:.42},
  {x:.98,y:.06,s:.37,r:-.7,sprite:1,alpha:.42},
  {x:.47,y:.08,s:.20,r:1.1,sprite:2,alpha:.18}
];
const particles = Array.from({length:75},(_,n)=>({x:Math.sin(n*127.1)*.5+.5,y:Math.cos(n*311.7)*.5+.5,r:.5+(n%4)*.45}));
function draw(now) {
  if (last && !paused) time += Math.min(now-last,50)*.001;
  last=now;
  const target=palettes[sections[active].dataset.palette];
  tint=tint.map((n,i)=>n+(target[i]-n)*.035);
  ctx.clearRect(0,0,width,height);
  const rgb=tint.map(Math.round).join(',');
  const halo=ctx.createRadialGradient(width*.8,height*.48,0,width*.8,height*.48,width*.57);
  halo.addColorStop(0,`rgba(${rgb},.065)`);halo.addColorStop(1,`rgba(${rgb},0)`);ctx.fillStyle=halo;ctx.fillRect(0,0,width,height);
  for(let n=0;n<particles.length;n++){
    const p=particles[n];const x=(p.x*width+Math.sin(time*.13+n)*13+width)%width;const y=(p.y*height-time*(1+n%3)*2+height*20)%height;
    ctx.beginPath();ctx.arc(x,y,p.r,0,Math.PI*2);ctx.fillStyle=`rgba(${rgb},${.10+(Math.sin(time*.7+n)+1)*.075})`;ctx.fill();
  }
  const hero = active===0;
  const base=Math.min(width/1440,height/850);
  for(let n=0;n<cells.length;n++){
    const cell=cells[n];const scale=cell.s*base*(width<700?1.5:1);
    ctx.save();ctx.translate(width*cell.x+Math.sin(time*.12+n*2)*19+pointerX*(n+1)*.3,height*cell.y+Math.cos(time*.15+n)*19+pointerY*(n+1)*.3);
    ctx.rotate(cell.r+Math.sin(time*.09+n)*.10);ctx.scale(scale,scale);ctx.globalAlpha=cell.alpha*(hero?1:.17);
    ctx.drawImage(sprites[cell.sprite],-220,-350);ctx.restore();
  }
  if (!paused && !document.hidden) frameId=requestAnimationFrame(draw);
}
document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(frameId);last=0;if(!document.hidden) frameId=requestAnimationFrame(draw);});
addEventListener('resize',resize);
resize();syncMotion();
