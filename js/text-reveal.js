/* Shared DAY text motion. No markup wrapping, layout changes or hidden default
   styles. Existing DAY caches, players and sticker coordinates stay intact. */
(() => {
  const container = document.getElementById('pageContent');
  const stageEl = document.getElementById('stage');
  const scroller = document.getElementById('paperScroll');
  if (!container || !stageEl || !scroller ||
      !('IntersectionObserver' in window) || !Element.prototype.animate ||
      window.GACK_TEXT_REVEAL_ENABLED === false) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width:600px)');
  const seen = new WeakSet();
  const observers = new Map();
  const running = new Set();
  const isOpen = () => stageEl.classList.contains('open');

  function candidates(page) {
    const nodes = [...page.querySelectorAll(
      'h2,h3,p,.day-opener,.day-summary,.gack-day01__opener,.gack-day01__summary'
    )];
    const selected = new Set(nodes);
    return nodes.filter(el => {
      if (el.closest('.day-media,video,iframe,.placed-layer,.sticker-home')) return false;
      if (el.querySelector('img,picture,svg,canvas,video,iframe,audio')) return false;
      for (let parent=el.parentElement; parent && parent!==page; parent=parent.parentElement)
        if (selected.has(parent)) return false;
      return true;
    });
  }
  function stopAll() {
    for (const animation of running) animation.cancel();
    running.clear();
    for (const observer of observers.values()) observer.disconnect();
    observers.clear();
  }
  function attach(page) {
    if (observers.has(page)) return;
    const observer = new IntersectionObserver(entries => {
      if (!isOpen() || reduce.matches || page.hidden) return;
      let order = 0;
      for (const entry of entries) {
        const el = entry.target;
        if (!entry.isIntersecting || seen.has(el)) continue;
        seen.add(el);
        observer.unobserve(el);
        const animation = el.animate(
          [{opacity:0,transform:'translateY(18px)'}, {opacity:1,transform:'translateY(0)'}],
          {duration:600,delay:Math.min(order++*90,270),easing:'cubic-bezier(.2,.7,.2,1)',fill:'both'}
        );
        running.add(animation);
        // Drop the finished effect so transforms never remain on article blocks.
        animation.finished.then(() => {
          running.delete(animation);
          animation.cancel();
        }).catch(() => running.delete(animation));
      }
    }, {root:mobile.matches ? page : scroller, threshold:.08});
    observers.set(page, observer);
    for (const el of candidates(page)) if (!seen.has(el)) observer.observe(el);
  }
  function scan() {
    if (!isOpen() || reduce.matches) return;
    container.querySelectorAll('.day-page').forEach(attach);
  }
  function rebuild() { stopAll(); scan(); }

  // DAY HTML is asynchronously mounted by the existing loader. Do not replace
  // its fetch logic, switchDay, player cache or page elements.
  new MutationObserver(scan).observe(container, {childList:true});
  // Scene 1 content must not consume its once-only reveal before opening.
  new MutationObserver(() => { if (isOpen()) scan(); else stopAll(); })
    .observe(stageEl, {attributes:true,attributeFilter:['class']});
  reduce.addEventListener('change', rebuild);
  mobile.addEventListener('change', rebuild);
  scan();
})();
