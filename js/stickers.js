function refreshPlacedPositions() {
  for (const el of layer.querySelectorAll(".placed")) {
    const i = Number(el.dataset.index),
      o = (items[day] || [])[i];
    if (!o) continue;
    const a = scroll.getBoundingClientRect(),
      b = layer.getBoundingClientRect();
    el.style.left = a.left - b.left + o.x - scroll.scrollLeft + "px";
    el.style.top = a.top - b.top + o.y - scroll.scrollTop + "px";
  }
}
function save() {
  localStorage.setItem(KEY, JSON.stringify(items));
}
function make(tag, cls, par) {
  let e = document.createElement(tag);
  e.className = cls;
  par.append(e);
  return e;
}
function xy(ev) {
  return { x: ev.clientX, y: ev.clientY };
}
function rel(el, ev) {
  let r = el.getBoundingClientRect();
  return { x: ev.clientX - r.left, y: ev.clientY - r.top };
}
function inRect(el, ev) {
  let r = el.getBoundingClientRect();
  return (
    ev.clientX >= r.left &&
    ev.clientX <= r.right &&
    ev.clientY >= r.top &&
    ev.clientY <= r.bottom
  );
}
function homePosition(i) {
  return { x: 13 + i * 82, y: -28 + (i % 2) * 12 };
}
function showSources() {
  sources.forEach((s, i) => {
    if (s.out) return;
    let p = homePosition(i);
    let r = home.getBoundingClientRect(),
      l = layout.getBoundingClientRect();
    s.el.style.left = r.left - l.left + p.x + "px";
    s.el.style.top = r.top - l.top + p.y + "px";
    s.el.style.transform = `rotate(${i === 0 ? -13 : 13}deg)`;
  });
}
function sourceInit() {
  SOURCES.forEach((src, i) => {
    let el = make("img", "sticker", layout);
    el.src = src;
    el.alt = "Sticker " + (i + 1);
    el.style.zIndex = 10 + i;
    let s = { el, src, out: false, x: 0, y: 0, i };
    sources.push(s);
    el.addEventListener("pointerdown", (ev) => {
      if (window.matchMedia("(max-width:600px)").matches) return;
      if (!opened) {
        ev.preventDefault();
        openJournal();
        return;
      }
      ev.preventDefault();
      let r = el.getBoundingClientRect(),
        l = layout.getBoundingClientRect();
      s.x = r.left - l.left;
      s.y = r.top - l.top;
      drag = {
        kind: "source",
        s,
        dx: ev.clientX - r.left,
        dy: ev.clientY - r.top,
        origin: { out: s.out, x: s.x, y: s.y },
      };
      el.classList.add("dragging");
      el.style.transform = "none";
      el.setPointerCapture(ev.pointerId);
    });
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  });
  showSources();
}
function move(ev) {
  if (!drag) return;
  let d = drag;
  if (d.kind === "source") {
    let l = layout.getBoundingClientRect();
    d.s.x = ev.clientX - l.left - d.dx;
    d.s.y = ev.clientY - l.top - d.dy;
    d.s.el.style.left = d.s.x + "px";
    d.s.el.style.top = d.s.y + "px";
  } else {
    let p = rel(scroll, ev);
    d.el.style.left =
      p.x -
      d.dx +
      scroll.scrollLeft +
      scroll.getBoundingClientRect().left -
      layer.getBoundingClientRect().left -
      scroll.scrollLeft +
      "px";
    d.el.style.top =
      p.y -
      d.dy +
      scroll.scrollTop +
      scroll.getBoundingClientRect().top -
      layer.getBoundingClientRect().top -
      scroll.scrollTop +
      "px";
  }
}
function addPlaced(src, x, y) {
  items[day] ??= [];
  items[day].push({ src, x, y });
  save();
  renderPlaced();
}
function up(ev) {
  if (!drag) return;
  let d = drag;
  drag = null;
  if (d.kind === "source") {
    let s = d.s;
    s.el.classList.remove("dragging");
    if (inRect(scroll, ev) && opened) {
      let r = rel(scroll, ev);
      addPlaced(
        s.src,
        r.x + scroll.scrollLeft - 38,
        r.y + scroll.scrollTop - 38,
      );
      if (d.origin.out) {
        s.x = d.origin.x;
        s.y = d.origin.y;
        s.out = true;
      } else {
        s.out = false;
      }
      if (s.out) {
        s.el.style.left = s.x + "px";
        s.el.style.top = s.y + "px";
      } else showSources();
    } else if (inRect(document.querySelector("#chestZone"), ev) && opened) {
      s.out = false;
      showSources();
    } else {
      s.out = true;
      s.el.style.transform = "none";
    }
  } else {
    d.el.classList.remove("dragging");
    if (!inRect(scroll, ev)) {
      items[day].splice(d.index, 1);
    } else {
      let p = rel(scroll, ev);
      items[day][d.index].x = p.x - d.dx + scroll.scrollLeft;
      items[day][d.index].y = p.y - d.dy + scroll.scrollTop;
    }
    save();
    renderPlaced();
  }
}
function renderPlaced() {
  layer.innerHTML = "";
  if (window.matchMedia("(max-width:600px)").matches) return;
  (items[day] || []).forEach((o, i) => {
    let el = make("img", "placed", layer);
    el.src = o.src;
    el.dataset.index = i;
    el.style.left = o.x + "px";
    el.style.top = o.y + "px";
    el.addEventListener("pointerdown", (ev) => {
      if (window.matchMedia("(max-width:600px)").matches) return;
      ev.preventDefault();
      let r = el.getBoundingClientRect();
      drag = {
        kind: "placed",
        el,
        index: i,
        dx: ev.clientX - r.left,
        dy: ev.clientY - r.top,
      };
      el.classList.add("dragging");
      el.setPointerCapture(ev.pointerId);
    });
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  });
  refreshPlacedPositions();
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

