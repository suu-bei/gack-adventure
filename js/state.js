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
  items = JSON.parse(localStorage.getItem(KEY) || "{}");
} catch {}
function hideFloating() {}
