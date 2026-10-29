/* Collection preview: preserve KEY and legacy {src,x,y} records.
   New placements append width/height. No migration or rewrite on load. */
const stickerDesktop = () => !window.matchMedia('(max-width:600px)').matches;
const stickerLimits = window.GACK_STICKER_LIMITS || {maxInitialEdge:512,maxResizeEdge:768,minResizeEdge:24};
let selectedSticker = -1;
let stickerResetButton = null;
let stickerGeometryFrame = 0;
function make(tag, cls, par) { const e=document.createElement(tag);e.className=cls;par.append(e);return e; }
function xy(ev) { return {x:ev.clientX,y:ev.clientY}; }
function rel(el, ev) { const r=el.getBoundingClientRect();return {x:ev.clientX-r.left,y:ev.clientY-r.top}; }
function inRect(el, ev) { const r=el.getBoundingClientRect();return ev.clientX>=r.left&&ev.clientX<=r.right&&ev.clientY>=r.top&&ev.clientY<=r.bottom; }
function save() {
  try {localStorage.setItem(KEY,JSON.stringify(items));}
  catch(error) {console.warn('Sticker changes could not be saved',error);stickerAnnounce('Browser storage is unavailable.');}
  updateStickerReset();
}
function stickerAnnounce(message) { const e=document.getElementById('stickerLiveStatus');if(e)e.textContent=message; }
function updateStickerReset() {if(stickerResetButton)stickerResetButton.disabled=!(items[day]||[]).length;}
function stickerSize(o) {
  // Old records were displayed in a 76px square. Preserve that exact appearance.
  return {width:Number.isFinite(o.width)&&o.width>0?o.width:76,height:Number.isFinite(o.height)&&o.height>0?o.height:76};
}
function stickerNativeSize(img) {
  const w=img.naturalWidth,h=img.naturalHeight;
  if(!w||!h)return null;
  const scale=Math.min(1,stickerLimits.maxInitialEdge/Math.max(w,h));
  return {width:w*scale,height:h*scale};
}
function stickerPaperBounds() {
  const paper=document.querySelector('.paper'),r=paper.getBoundingClientRect();
  const t=paper.querySelector('.roller.top').getBoundingClientRect();
  const b=paper.querySelector('.roller.bottom').getBoundingClientRect();
  return {left:r.left,right:r.right,top:Math.max(r.top,t.bottom),bottom:Math.min(r.bottom,b.top)};
}
function stickerDropInside(ev) {
  const r=stickerPaperBounds();
  return ev.clientX>=r.left&&ev.clientX<=r.right&&ev.clientY>=r.top&&ev.clientY<=r.bottom;
}
function refreshPlacedPositions() {
  if(!stickerDesktop())return;
  const paper=document.querySelector('.paper'),r=paper.getBoundingClientRect(),bounds=stickerPaperBounds();
  layer.style.setProperty('--sticker-clip-top',Math.max(0,bounds.top-r.top)+'px');
  layer.style.setProperty('--sticker-clip-bottom',Math.max(0,r.bottom-bounds.bottom)+'px');
  const a=scroll.getBoundingClientRect(),b=layer.getBoundingClientRect();
  for(const el of layer.querySelectorAll('.placed-sticker')) {
    const o=(items[day]||[])[Number(el.dataset.index)];if(!o)continue;
    const size=stickerSize(o);
    el.style.left=a.left-b.left+o.x-scroll.scrollLeft+'px';
    el.style.top=a.top-b.top+o.y-scroll.scrollTop+'px';
    el.style.width=size.width+'px';el.style.height=size.height+'px';
  }
}
function scheduleStickerGeometry() {
  if(stickerGeometryFrame)return;
  stickerGeometryFrame=requestAnimationFrame(()=>{stickerGeometryFrame=0;refreshPlacedPositions();});
}
// R8 journal.js still calls this hook during chest movement and fullscreen changes.
// The collection is now a child of the chest, so it follows without copied coordinates.
function fitStickerCollection() {
  if(!stickerDesktop())return;
  const chest=document.getElementById('chestZone'),nav=document.getElementById('days');
  const r=chest.getBoundingClientRect(),scale=r.width/chest.offsetWidth;
  if(!scale)return;
  // The dock ends 118 local pixels above the chest bottom. Leave a real
  // viewport gap below the four-row calendar, including scaled tablet layouts.
  const available=Math.max(100,(r.bottom-118*scale-nav.getBoundingClientRect().bottom-12)/scale);
  home.style.setProperty('--collection-available-height',available+'px');
  home.style.setProperty('--collection-cell-max',Math.max(24,(available-84)/4)+'px');
}
function showSources() {fitStickerCollection();scheduleStickerGeometry();updateStickerReset();}
function homePosition(i) {return {x:0,y:0};} // Legacy compatibility; sources no longer use layout coordinates.
function selectSticker(i) {
  selectedSticker=i;
  layer.querySelectorAll('.placed-sticker').forEach(el=>el.classList.toggle('is-selected',Number(el.dataset.index)===i));
}
function cancelStickerDrag(render=true) {
  if(!drag)return;
  const d=drag;drag=null;document.documentElement.classList.remove('sticker-is-dragging');
  if(d.ghost)d.ghost.remove();
  if(d.before&&items[d.day]?.[d.index])items[d.day][d.index]=d.before;
  if(render)renderPlaced();
}
function beginStickerDrag(ev,kind,index,el,source) {
  if(!stickerDesktop()||!opened||switching||ev.button!==0||drag)return;
  if(kind==='source'&&!source.img.naturalWidth)return;
  ev.preventDefault();
  if(kind==='source') {
    const size=stickerNativeSize(source.img);if(!size)return;
    const ghost=make('img','sticker-drag-preview',document.body);
    ghost.src=source.src;ghost.alt='';ghost.draggable=false;
    ghost.style.width=size.width+'px';ghost.style.height=size.height+'px';
    drag={kind,day,src:source.src,stickerId:source.id,size,ghost,dx:size.width/2,dy:size.height/2,pointerId:ev.pointerId};
  } else {
    const o=items[day][index],r=el.getBoundingClientRect();selectSticker(index);
    drag={kind,index,day,el,before:{...o},startX:ev.clientX,startY:ev.clientY,size:stickerSize(o),dx:ev.clientX-r.left,dy:ev.clientY-r.top,pointerId:ev.pointerId};
    el.classList.add('is-dragging');
  }
  try {ev.currentTarget.setPointerCapture(ev.pointerId);}catch{}
  document.documentElement.classList.add('sticker-is-dragging');
  move(ev);
}
function move(ev) {
  if(!drag||ev.pointerId!==drag.pointerId)return;
  const d=drag;
  if(d.day!==day||!stickerDesktop()){cancelStickerDrag();return;}
  if(d.kind==='source') {
    d.ghost.style.left=ev.clientX-d.dx+'px';d.ghost.style.top=ev.clientY-d.dy+'px';
  } else if(d.kind==='resize') {
    const o=items[d.day]?.[d.index];if(!o)return;
    const dx=ev.clientX-d.startX,dy=ev.clientY-d.startY;
    const projectedScale=1+(dx*d.size.width+dy*d.size.height)/(d.size.width**2+d.size.height**2);
    const min=stickerLimits.minResizeEdge/Math.max(d.size.width,d.size.height);
    const max=stickerLimits.maxResizeEdge/Math.max(d.size.width,d.size.height);
    const scale=Math.max(min,Math.min(max,projectedScale));
    o.width=d.size.width*scale;o.height=d.size.height*scale;
    refreshPlacedPositions();
  } else {
    const a=scroll.getBoundingClientRect(),o=items[d.day]?.[d.index];if(!o)return;
    o.x=ev.clientX-a.left+scroll.scrollLeft-d.dx;
    o.y=ev.clientY-a.top+scroll.scrollTop-d.dy;
    refreshPlacedPositions();
  }
}
function addPlaced(src,x,y,width,height,stickerId) {
  items[day]??=[];
  const record={src,x,y};
  if(width&&height)Object.assign(record,{width,height});
  if(stickerId)record.stickerId=stickerId;
  items[day].push(record);selectedSticker=items[day].length-1;save();renderPlaced();
}
function up(ev) {
  if(!drag||ev.pointerId!==drag.pointerId)return;
  if(ev.type==='pointercancel'){cancelStickerDrag();return;}
  const d=drag;drag=null;document.documentElement.classList.remove('sticker-is-dragging');
  if(d.ghost)d.ghost.remove();
  if(d.day!==day){if(d.before&&items[d.day]?.[d.index])items[d.day][d.index]=d.before;renderPlaced();return;}
  if(d.kind==='source') {
    if(stickerDropInside(ev)) {
      const a=scroll.getBoundingClientRect();
      addPlaced(d.src,ev.clientX-a.left+scroll.scrollLeft-d.dx,ev.clientY-a.top+scroll.scrollTop-d.dy,d.size.width,d.size.height,d.stickerId);
      stickerAnnounce('Sticker added. Drag the corner to resize.');
    }
  } else {
    if(d.kind==='placed'&&!stickerDropInside(ev)) {items[d.day].splice(d.index,1);selectedSticker=-1;stickerAnnounce('Sticker removed.');}
    save();renderPlaced();
  }
}
function renderPlaced() {
  if(drag&&(drag.kind!=='source'||drag.day!==day||!stickerDesktop()))cancelStickerDrag(false);
  layer.replaceChildren();
  updateStickerReset();
  if(!stickerDesktop())return;
  (items[day]||[]).forEach((o,i)=>{
    if(!o||typeof o.src!=='string'||!Number.isFinite(o.x)||!Number.isFinite(o.y))return;
    const el=make('div','placed-sticker',layer);el.dataset.index=i;el.tabIndex=0;el.setAttribute('role','group');el.setAttribute('aria-label','Placed sticker '+(i+1)+'. Arrow keys move; Delete removes.');
    const img=make('img','sticker-art',el);img.src=o.src;img.alt='';img.draggable=false;
    el.classList.toggle('is-selected',i===selectedSticker);
    el.addEventListener('pointerdown',ev=>{if(!ev.target.closest('.sticker-resize'))beginStickerDrag(ev,'placed',i,el);});
    el.addEventListener('focus',()=>selectSticker(i));
    el.addEventListener('keydown',ev=>{
      if(ev.target!==el)return;
      const o=items[day]?.[i];if(!o)return;
      if(ev.key==='Delete'||ev.key==='Backspace'){ev.preventDefault();items[day].splice(i,1);selectedSticker=-1;save();renderPlaced();return;}
      const delta=ev.shiftKey?10:2;
      if(ev.key==='ArrowLeft')o.x-=delta;else if(ev.key==='ArrowRight')o.x+=delta;else if(ev.key==='ArrowUp')o.y-=delta;else if(ev.key==='ArrowDown')o.y+=delta;else return;
      ev.preventDefault();save();refreshPlacedPositions();
    });
    const handle=make('button','sticker-resize',el);handle.type='button';handle.setAttribute('aria-label','Resize sticker '+(i+1));
    handle.addEventListener('pointerdown',ev=>{ev.stopPropagation();beginStickerDrag(ev,'resize',i,el);});
    handle.addEventListener('keydown',ev=>{
      if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-'].includes(ev.key))return;
      ev.preventDefault();ev.stopPropagation();const o=items[day][i],s=stickerSize(o),edge=Math.max(s.width,s.height),sign=['ArrowRight','ArrowUp','+'].includes(ev.key)?1:-1;
      const scale=Math.max(stickerLimits.minResizeEdge,Math.min(stickerLimits.maxResizeEdge,edge+sign*8))/edge;
      o.width=s.width*scale;o.height=s.height*scale;save();refreshPlacedPositions();
    });
  });
  refreshPlacedPositions();
}
function resetCurrentDayStickers() {
  cancelStickerDrag(false);items[day]=[];selectedSticker=-1;save();renderPlaced();stickerAnnounce('DAY '+day+' stickers reset.');
}
function sourceInit() {
  const panel=make('section','sticker-collection',home);panel.setAttribute('aria-label','Sticker collection');
  const heading=make('h2','sticker-collection-heading',panel);heading.textContent='STICKER COLLECTION';
  const scroller=make('div','sticker-catalog-scroll',panel);scroller.tabIndex=0;scroller.setAttribute('aria-label','Scroll sticker collection');
  const grid=make('div','sticker-catalog-grid',scroller);
  scroller.addEventListener('wheel',ev=>ev.stopPropagation(),{passive:true});
  const catalog=window.GACK_STICKER_CATALOG||SOURCES.map((src,i)=>({id:'legacy-'+i,name:'Sticker '+(i+1),src}));
  catalog.forEach(entry=>{
    const button=make('button','sticker-slot',grid);button.type='button';button.disabled=true;button.dataset.stickerId=entry.id;button.title=entry.name;button.setAttribute('aria-label',entry.name);
    const img=make('img','',button);img.alt=entry.name;img.draggable=false;
    const source={...entry,el:button,img,out:false};sources.push(source);
    img.onload=()=>{button.disabled=false;};
    img.onerror=()=>{button.title=entry.name+' (image unavailable)';};
    img.src=entry.src;
    button.addEventListener('pointerdown',ev=>beginStickerDrag(ev,'source',-1,button,source));
    button.addEventListener('click',ev=>{
      if(ev.detail!==0||!stickerDesktop()||!opened||switching)return;
      const s=stickerNativeSize(img),b=stickerPaperBounds(),a=scroll.getBoundingClientRect();if(!s)return;
      addPlaced(source.src,(b.left+b.right)/2-a.left+scroll.scrollLeft-s.width/2,(b.top+b.bottom)/2-a.top+scroll.scrollTop-s.height/2,s.width,s.height,source.id);
    });
  });
  const caption=make('div','sticker-dock-caption',document.getElementById('chestZone'));
  const text=make('span','',caption);text.textContent='Drag & decorate!';
  stickerResetButton=make('button','sticker-reset',caption);stickerResetButton.type='button';stickerResetButton.title='Reset this DAY’s stickers';stickerResetButton.setAttribute('aria-label','Reset this DAY’s stickers');
  // Bold counterclockwise vector arrow: legible even when Reset is disabled.
  stickerResetButton.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11a9 9 0 1 1 2.64 6.36"/><path d="M3 4v7h7"/></svg>';
  stickerResetButton.onclick=resetCurrentDayStickers;
  const live=make('span','sticker-live-status',caption);live.id='stickerLiveStatus';live.setAttribute('role','status');live.setAttribute('aria-live','polite');
  window.addEventListener('pointermove',move);
  window.addEventListener('pointerup',up);
  window.addEventListener('pointercancel',up);
  window.addEventListener('blur',()=>cancelStickerDrag());
  document.addEventListener('keydown',ev=>{if(ev.key==='Escape'){cancelStickerDrag();selectSticker(-1);}});
  document.querySelector('.paper').addEventListener('pointerdown',ev=>{if(!ev.target.closest('.placed-sticker'))selectSticker(-1);});
  // Rollers move during DAY transitions without resizing the paper. Recompute
  // their true inner edges after the fold finishes, not at a midway frame.
  document.querySelector('.paper').addEventListener('animationend',scheduleStickerGeometry);
  document.querySelector('.paper').addEventListener('animationcancel',scheduleStickerGeometry);
  if(window.ResizeObserver){const observer=new ResizeObserver(scheduleStickerGeometry);observer.observe(document.querySelector('.paper'));observer.observe(scroll);}
  showSources();
}
function build(){
 const nav=document.querySelector('#days');
 const title=make('div','log-title',nav);title.textContent='✦ ADVENTURE LOG ✦';
 const grid=make('div','log-grid',nav);
 for(let i=1;i<=TOTAL_DAY_COUNT;i++){
  const b=make('button','log-day',grid);b.type='button';b.dataset.day=String(i);
  const number=make('span','log-number',b);number.textContent='DAY '+i;
  const symbol=make('span','log-symbol',b);symbol.textContent=i<=DAY_COUNT?'▤':'?';
  if(i>DAY_COUNT){b.disabled=true;b.classList.add('locked');b.title='DAY '+i+' · Coming soon'}
  else{b.title='Open DAY '+i;b.onclick=()=>switchDay(i)}
 }
 const foot=make('div','log-footer',nav);foot.textContent='THE JOURNEY CONTINUES…';
}

