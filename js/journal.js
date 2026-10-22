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
// Resize/fullscreen can animate the chest for .85s after the event fires.
// Share one tracking loop: repeated events extend its deadline rather than
// leaving source stickers at an intermediate chest position.
let chestFollowUntil = 0;
let chestFollowFrame = 0;
function followChestDuringTransition(duration) {
  chestFollowUntil = Math.max(chestFollowUntil, performance.now() + duration);
  if (chestFollowFrame) return;
  function frame(now) {
    showSources();
    if (now < chestFollowUntil) chestFollowFrame = requestAnimationFrame(frame);
    else chestFollowFrame = 0;
  }
  chestFollowFrame = requestAnimationFrame(frame);
}
window.addEventListener("resize", () => {
  followChestDuringTransition(1100);
  renderPlaced();
  refreshPlacedPositions();
});
// Some embedded players report fullscreen changes without a window resize.
document.addEventListener("fullscreenchange", () => followChestDuringTransition(1100));
document.addEventListener("webkitfullscreenchange", () => followChestDuringTransition(1100));
scroll.addEventListener("scroll", refreshPlacedPositions, { passive: true });

