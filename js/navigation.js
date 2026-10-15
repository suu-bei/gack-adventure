// V35: mobile navigation. The actual demo currently contains DAY 1–4.
const gackMenuToggle = document.getElementById("gackMenuToggle");
const gackMenuShade = document.getElementById("gackMenuShade");
const gackMenuSheet = document.getElementById("gackMenuSheet");
const gackMenuClose = document.getElementById("gackMenuClose");
const gackMenuViews = {
  home: document.getElementById("gackMenuHome"),
  index: document.getElementById("gackMenuIndex"),
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
document.getElementById("gackOpenIndex").onclick = () => gackMenuView("index");
document.getElementById("gackOpenCredits").onclick = () =>
  gackMenuView("credits");
document
  .querySelectorAll("[data-gack-back]")
  .forEach((b) => (b.onclick = () => gackMenuView("home")));
const gackIndexGrid = document.getElementById("gackIndexGrid");
for (let n = 1; n <= DAY_COUNT; n++) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "gack-index-button";
  b.textContent = "DAY " + n;
  b.onclick = () => {
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
document
  .getElementById("gackOpenIndex")
  .addEventListener("click", gackRefreshIndex);
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
