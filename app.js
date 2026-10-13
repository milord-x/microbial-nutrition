'use strict';
(() => {
  const slides=[...document.querySelectorAll('.slide')];
  document.addEventListener('keydown',event=>{
    if(event.altKey||event.ctrlKey||event.metaKey||event.target.closest('a,button,input,textarea,select')) return;
    if(!['ArrowDown','ArrowUp','ArrowRight','ArrowLeft','PageDown','PageUp',' ','Home','End'].includes(event.key)) return;
    const current=slides.reduce((best,slide,index)=>Math.abs(slide.getBoundingClientRect().top)<Math.abs(slides[best].getBoundingClientRect().top)?index:best,0);
    let next=current+(['ArrowDown','ArrowRight','PageDown',' '].includes(event.key)?1:-1);
    if(event.key==='Home') next=0;
    if(event.key==='End') next=slides.length-1;
    event.preventDefault();
    slides[Math.max(0,Math.min(slides.length-1,next))].scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  });
})();
