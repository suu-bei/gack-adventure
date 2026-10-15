// V38: unchanged V37 Credits copy. Branch C maintains this file.
const GACK_CREDITS_HTML =
  '<p class="gack-credits-note">Special thanks to all the Crabkins who shared their clips, screenshots, artwork, and memories.</p><p class="gack-credits-note">Contributor names and links will be added here once the final list is ready.</p>';

;
const RELEASE_VERSION = "V41";
const SOURCES = [
  "images/sticker1.png",
  "images/sticker2.png",
];
const DAY_COUNT = 4;
const DAY_FILES = Array.from(
  { length: DAY_COUNT },
  (_, i) => `days/day${String(i + 1).padStart(2, "0")}.html`,
);

;
const stage = document.querySelector("#stage"),
  layout = document.querySelector("#layout"),
  home = document.querySelector("#stickerHome"),
  scroll = document.querySelector("#paperScroll"),
  content = document.querySelector("#pageContent"),
  layer = document.querySelector("#placedLayer");
let day = 1,
  items = {},
  sources = [],
  drag = null,
  opened = false;
const KEY = "gack-figma-demo-desktop-v4";
let switching = false;
try {
  const stored = JSON.parse(localStorage.getItem(KEY) || "{}");
  if(stored && typeof stored === "object" && !Array.isArray(stored))items=stored;
} catch {}
function hideFloating() {}

;
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
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch(error) { console.warn("Sticker storage unavailable",error); }
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
 for(let i=1;i<=15;i++){
  const b=make('button','log-day',grid);b.type='button';b.dataset.day=String(i);
  const number=make('span','log-number',b);number.textContent='DAY '+i;
  const symbol=make('span','log-symbol',b);symbol.textContent=i<=DAY_COUNT?'▤':'?';
  if(i>DAY_COUNT){b.disabled=true;b.classList.add('locked');b.title='DAY '+i+' · Coming soon'}
  else{b.title='Open DAY '+i;b.onclick=()=>switchDay(i)}
 }
 const foot=make('div','log-footer',nav);foot.textContent='THE JOURNEY CONTINUES…';
}

;
function pauseDepartingDay(oldDay) {
  const oldPage = dayPages.get(oldDay);
  if (!oldPage) return;
  oldPage.querySelectorAll("video,audio").forEach((media) => {
    try {
      media.pause();
    } catch (e) {}
  });
  oldPage.querySelectorAll("iframe").forEach((frame) => {
    if(frame.dataset.gackNativePlayer === "1") {
      try {
        frame.contentDocument?.querySelectorAll("video,audio").forEach(media=>media.pause());
        frame.contentWindow?.postMessage({type:"gack-native-video-pause"},location.origin);
      } catch(e) {}
      return;
    }
    const url = frame.getAttribute("src") || "";
    if (/youtube\.com\/embed\//.test(url)) {
      try {
        frame.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: "pauseVideo", args: [] }),
          "https://www.youtube.com",
        );
      } catch (e) {}
    } else if (
      /(?:platform|twitter|x)\.com|twimg\.com/.test(url) ||
      /^https:\/\/drive\.google\.com\/file\/d\/[^/]+\/preview(?:[?#]|$)/.test(url)
    ) {
      // X and Drive have no pause API used here. Unload only the departing
      // player, then restore its URL when this DAY is shown again.
      if (!frame.dataset.gackOriginalSrc) frame.dataset.gackOriginalSrc = url;
      frame.setAttribute("src", "about:blank");
      frame.dataset.gackPaused = "1";
    }
  });
}
function restoreDayMedia(n) {
  const page = dayPages.get(n);
  if (!page) return;
  page.querySelectorAll('iframe[data-gack-paused="1"]').forEach((frame) => {
    frame.setAttribute("src", frame.dataset.gackOriginalSrc);
    delete frame.dataset.gackPaused;
  });
}

// Load the official widget library only for a DAY that actually contains a tweet.
let twitterWidgetsRequest;
function hydrateTwitterWidgets(page) {
  if (!page.querySelector('blockquote.twitter-tweet')) return;
  if (window.twttr?.widgets?.load) { window.twttr.widgets.load(page); return; }
  if (!twitterWidgetsRequest) {
    twitterWidgetsRequest = new Promise((resolve,reject) => {
      const script=document.createElement('script');
      script.src='https://platform.x.com/widgets.js';
      script.async=true;
      script.onload=resolve;
      script.onerror=()=>{ twitterWidgetsRequest=undefined; reject(new Error('X widget library unavailable')); };
      document.head.append(script);
    });
  }
  twitterWidgetsRequest.then(()=>window.twttr?.widgets?.load(page)).catch(error=>console.warn(error));
}

;
// V40.1: keep native controls inside a separate same-origin document.
// DAY fragments keep their original <video> markup for standalone preview.
function mountNativeVideoFrames(page) {
  page.querySelectorAll(".day-content video").forEach(video => {
    const source=video.getAttribute("src") || video.querySelector("source[src]")?.getAttribute("src");
    if(!source)return;
    const url=new URL("players/native-video.html?v="+RELEASE_VERSION,document.baseURI);
    url.searchParams.set("src",new URL(source,document.baseURI).href);
    const poster=video.getAttribute("poster");
    if(poster)url.searchParams.set("poster",new URL(poster,document.baseURI).href);
    const title=video.getAttribute("aria-label") || "Journal video";
    url.searchParams.set("title",title);
    const original=video.closest("section,figure")?.querySelector(".day-source a[href]")?.getAttribute("href");
    if(original)url.searchParams.set("original",new URL(original,document.baseURI).href);
    const frame=document.createElement("iframe");
    frame.className="gack-native-player";
    frame.dataset.gackNativePlayer="1";
    frame.title=title;
    frame.src=url.href;
    frame.loading="lazy";
    frame.allow="fullscreen; picture-in-picture";
    frame.allowFullscreen=true;
    frame.style.cssText=video.style.cssText;
    Object.assign(frame.style,{display:"block",position:"relative",width:"100%",maxWidth:"100%",height:"auto",aspectRatio:video.style.aspectRatio || `${video.width || 16} / ${video.height || 9}`,border:"0"});
    video.replaceWith(frame);
  });
}
// Two session caches: fetched HTML/pending request and mounted DAY DOM.
// Relative URLs resolve against index.html (also under /gack-adventure/).
const dayPages = new Map();
const dayRequests = new Map();
function ensureDay(n) {
  if (dayPages.has(n)) return Promise.resolve(dayPages.get(n));
  if (dayRequests.has(n)) return dayRequests.get(n);
  if(!Number.isInteger(n)||n<1||n>DAY_COUNT)return Promise.reject(new Error("Unknown DAY"));
  const dayURL=new URL(DAY_FILES[n-1],document.baseURI);
  dayURL.searchParams.set("v",RELEASE_VERSION);
  const request = fetch(dayURL, { cache: "no-cache" })
    .then((response) => {
      if (!response.ok)
        throw new Error(`${DAY_FILES[n - 1]}: HTTP ${response.status}`);
      return response.text();
    })
    .then((html) => {
      const page = document.createElement("div");
      page.className = "day-page";
      page.dataset.day = n;
      page.hidden = true;
      // Parse inertly, so no native video request starts in the hidden main page.
      const template=document.createElement("template");
      template.innerHTML=html;
      mountNativeVideoFrames(template.content);
      page.append(template.content);
      const reset=page.querySelector("#reset");
      if(reset)reset.onclick = () => {
        items[n] = [];
        save();
        renderPlaced();
      };
      const returnButton=page.querySelector("#return");
      if(returnButton)returnButton.onclick = () => {
        sources.forEach((s) => (s.out = false));
        showSources();
      };
      content.append(page);
      dayPages.set(n, page);
      hydrateTwitterWidgets(page);
      return page;
    })
    .catch((error) => {
      dayRequests.delete(n);
      throw error;
    });
  dayRequests.set(n, request);
  return request;
}

;
async function switchDay(n) {
  if (switching || (opened && n === day && dayPages.has(n))) return;
  if (!Number.isInteger(n) || n < 1 || n > DAY_COUNT) return;
  switching = true;
  try {
    await ensureDay(n);
  } catch (error) {
    console.error("DAY content could not be loaded", error);
    switching = false;
    return;
  }
  switching = false;
  if (opened) pauseDepartingDay(day);
  if (opened && window.matchMedia("(max-width:600px)").matches) {
    switching = true;
    hideFloating();
    const previous = day;
    const direction =
      n === 1 && previous === DAY_COUNT
        ? "next"
        : n === DAY_COUNT && previous === 1
          ? "prev"
          : n > previous
            ? "next"
            : "prev";
    const outgoing = dayPages.get(previous);
    updateDay(n); // Create or reveal next cached DAY; no iframe destruction.
    const incoming = dayPages.get(n);
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    incoming.scrollTop = 0;
    if (outgoing) outgoing.hidden = false;
    if (outgoing) outgoing.classList.add("sheet-out-" + direction);
    incoming.classList.add("sheet-in-" + direction);
    setTimeout(
      () => {
        if (outgoing) {
          outgoing.classList.remove("sheet-out-" + direction);
          outgoing.hidden = true;
        }
        incoming.classList.remove("sheet-in-" + direction);
        switching = false;
      },
      reduced ? 0 : 440,
    );
    return;
  }
  if (opened) {
    switching = true;
    hideFloating();
    const paper = document.querySelector(".paper");
    paper.style.setProperty(
      "--fold-travel",
      paper.getBoundingClientRect().height / 2 - 15,
    );
    paper.classList.remove("unrolling");
    paper.classList.add("rolling");
    setTimeout(() => {
      updateDay(n);
      paper.classList.remove("rolling");
      paper.classList.add("unrolling");
      setTimeout(() => {
        paper.classList.remove("unrolling");
        switching = false;
      }, 500);
    }, 500);
  } else updateDay(n);
}
function updateDay(n) {
  hideFloating();
  day = n;
  restoreDayMedia(n);
  document.querySelector("#mobilePrev").disabled = day <= 1;
  document.querySelector("#mobileNext").disabled = day >= DAY_COUNT;
  document
    .querySelectorAll("#days button")
    .forEach((b, i) => b.classList.toggle("active", i + 1 === day));
  scroll.scrollTop = 0;
  if (window.matchMedia("(max-width:600px)").matches && dayPages.has(day))
    dayPages.get(day).scrollTop = 0;
  for (const [id, existing] of dayPages) {
    existing.hidden = id !== day;
  }
  if (dayPages.has(day)) {
    renderPlaced();
    return;
  }
}
function openJournal() {
  if (opened) return;
  opened = true;
  stage.classList.add("open");
  followChestDuringTransition(1100);
  setTimeout(showGackSwipeHint, 1250);
} // V32: lock gesture direction early so horizontal page swipes do not scroll vertically.
// Do not block vertical reading or touch interactions with embedded players/controls.
let swipeStart = null;
const swipeArea = document.querySelector("#paperScroll");
swipeArea.addEventListener(
  "touchstart",
  (ev) => {
    if (
      !opened ||
      switching ||
      !window.matchMedia("(max-width:600px)").matches ||
      ev.touches.length !== 1
    ) {
      swipeStart = null;
      return;
    }
    const target = ev.target;
    if (
      target.closest(
        "iframe,video,button,a,input,textarea,select,.x-official-tweet,.youtube-slot",
      )
    ) {
      swipeStart = null;
      return;
    }
    const t = ev.touches[0];
    swipeStart = { x: t.clientX, y: t.clientY, axis: null };
  },
  { passive: true },
);
swipeArea.addEventListener(
  "touchmove",
  (ev) => {
    if (!swipeStart || ev.touches.length !== 1) return;
    const t = ev.touches[0],
      dx = t.clientX - swipeStart.x,
      dy = t.clientY - swipeStart.y;
    if (swipeStart.axis === null && Math.hypot(dx, dy) > 9) {
      swipeStart.axis =
        Math.abs(dx) > Math.abs(dy) * 1.12 ? "horizontal" : "vertical";
    }
    if (swipeStart.axis === "horizontal" && ev.cancelable) ev.preventDefault();
  },
  { passive: false },
);
swipeArea.addEventListener(
  "touchend",
  (ev) => {
    if (!swipeStart || !opened || switching || ev.changedTouches.length !== 1) {
      swipeStart = null;
      return;
    }
    const t = ev.changedTouches[0],
      dx = t.clientX - swipeStart.x,
      dy = t.clientY - swipeStart.y;
    const axis = swipeStart.axis;
    swipeStart = null;
    if (
      axis !== "horizontal" ||
      Math.abs(dx) < 65 ||
      Math.abs(dx) < Math.abs(dy) * 1.12
    )
      return;
    const next = day + (dx < 0 ? 1 : -1);
    switchDay(next > DAY_COUNT ? 1 : next < 1 ? DAY_COUNT : next);
  },
  { passive: true },
);
swipeArea.addEventListener(
  "touchcancel",
  () => {
    swipeStart = null;
  },
  { passive: true },
);
document.querySelector("#mobilePrev").addEventListener("click", () => {
  if (day > 1) switchDay(day - 1);
});
document.querySelector("#mobileNext").addEventListener("click", () => {
  if (day < DAY_COUNT) switchDay(day + 1);
});
document.querySelector("#start").onclick = openJournal;
document.querySelector("#chestZone").addEventListener("click", openJournal);
document.querySelector("#chestHit").addEventListener("pointerup", openJournal);
function followChestDuringTransition(duration) {
  // Stickers live in layout coordinates, while the chest animates in its own layer.
  // Track the chest's *actual rendered position* every frame, avoiding a late teleport.
  const started = performance.now();
  function frame(now) {
    showSources();
    if (now - started < duration) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
window.addEventListener("resize", () => {
  showSources();
  renderPlaced();
  refreshPlacedPositions();
});
scroll.addEventListener("scroll", refreshPlacedPositions, { passive: true });

;
// V35: mobile navigation. The actual demo currently contains DAY 1–4.
const gackMenuToggle = document.getElementById("gackMenuToggle");
const gackMenuShade = document.getElementById("gackMenuShade");
const gackMenuSheet = document.getElementById("gackMenuSheet");
const gackMenuClose = document.getElementById("gackMenuClose");
const gackMenuViews = {
  home: document.getElementById("gackMenuHome"),
  credits: document.getElementById("gackMenuCredits"),
};
function gackMenuView(view) {
  for (const [name, el] of Object.entries(gackMenuViews))
    el.hidden = name !== view;
}
function gackMenuSet(open) {
  gackMenuSheet.classList.toggle("is-open", open);
  gackMenuShade.classList.toggle("is-open", open);
  gackMenuToggle.setAttribute("aria-expanded", String(open));
  gackMenuSheet.setAttribute("aria-hidden", String(!open));
  if (open) gackMenuView("home");
}
gackMenuToggle.onclick = () => gackMenuSet(true);
gackMenuClose.onclick = () => gackMenuSet(false);
gackMenuShade.onclick = () => gackMenuSet(false);
document.getElementById("gackOpenCredits").onclick = () =>
  gackMenuView("credits");
document
  .querySelectorAll("[data-gack-back]")
  .forEach((b) => (b.onclick = () => gackMenuView("home")));
const gackIndexGrid = document.getElementById("gackIndexGrid");
for (let n = 1; n <= 15; n++) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "gack-index-button";
  b.textContent = "DAY " + n;
  if (n > DAY_COUNT) {
    b.disabled = true;
    b.title = "Coming soon";
  } else b.onclick = () => {
    gackMenuSet(false);
    if (day !== n) switchDay(n);
  };
  gackIndexGrid.append(b);
}
function gackRefreshIndex() {
  gackIndexGrid
    .querySelectorAll("button")
    .forEach((b, i) => b.setAttribute("aria-current", String(day === i + 1)));
}
gackMenuToggle.addEventListener("click", gackRefreshIndex);
const gackHint = document.getElementById("gackSwipeHint");
function hideGackSwipeHint() {
  gackHint.classList.remove("is-visible");
}
function showGackSwipeHint() {
  if (!window.matchMedia("(max-width:600px)").matches) return;
  try {
    if (sessionStorage.getItem("gack-swipe-hint-v36-seen")) return;
    sessionStorage.setItem("gack-swipe-hint-v36-seen", "1");
  } catch (e) {}
  gackHint.classList.add("is-visible");
  setTimeout(hideGackSwipeHint, 2800);
}
swipeArea.addEventListener("touchstart", hideGackSwipeHint, { passive: true });
document.addEventListener("keydown", (ev) => {
  if (ev.key === "Escape") gackMenuSet(false);
});

;
document.getElementById("gackCreditsContent").innerHTML = GACK_CREDITS_HTML;
build();
sourceInit();
switchDay(1);
