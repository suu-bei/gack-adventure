/* Desktop collection presentation follows hover, keyboard focus and the
   existing drag class. No sticker persistence or drag algorithm changes. */
(() => {
  const panel=document.querySelector('#stickerHome .sticker-collection');
  if(!panel)return;
  let hover=false,keyboard=false,timer=0;
  // Only source drags from the collection keep it open. Moving/resizing a
  // sticker already on the paper must not expand the collection.
  const dragging=()=>typeof drag!=='undefined'&&drag?.kind==='source'&&
    document.documentElement.classList.contains('sticker-is-dragging');
  function expand(){clearTimeout(timer);panel.classList.add('is-collection-expanded');}
  function collapseSoon(){
    clearTimeout(timer);
    if(hover||keyboard||dragging())return;
    timer=setTimeout(()=>{if(!hover&&!keyboard&&!dragging())panel.classList.remove('is-collection-expanded');},300);
  }
  panel.addEventListener('pointerenter',()=>{hover=true;expand();});
  panel.addEventListener('pointerleave',()=>{hover=false;collapseSoon();});
  panel.addEventListener('focusin',event=>{if(event.target.matches(':focus-visible')){keyboard=true;expand();}});
  panel.addEventListener('focusout',event=>{if(!panel.contains(event.relatedTarget)){keyboard=false;collapseSoon();}});
  new MutationObserver(()=>{if(dragging())expand();else collapseSoon();})
    .observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  matchMedia('(max-width:600px)').addEventListener('change',()=>{hover=false;keyboard=false;clearTimeout(timer);panel.classList.remove('is-collection-expanded');});
})();
