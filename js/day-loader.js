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
