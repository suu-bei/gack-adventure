/* Scene 1 owns a normal-flow group. On activation, return the existing chest
   to its original layout parent at its measured screen position so the
   original journal.js handlers and .stage.open transition can run unchanged. */
(() => {
  const stageEl = document.getElementById('stage');
  const layoutEl = document.getElementById('layout');
  const chestEl = document.getElementById('chestZone');
  const group = document.getElementById('scene1Group');
  if (!stageEl || !layoutEl || !chestEl || !group) return;
  // Keep the legacy #start node for journal.js, but the hint is plain text.
  const hint = document.getElementById('start');
  if (hint) hint.onclick = null;
  let prepared = false;
  function prepareChest(event) {
    if (prepared || stageEl.classList.contains('open')) return;
    if (!(event.target instanceof Element) || !event.target.closest('#chestZone')) return;
    prepared = true;
    const rect = chestEl.getBoundingClientRect();
    const parentRect = layoutEl.getBoundingClientRect();
    chestEl.style.transition = 'none';
    chestEl.style.left = `${rect.left - parentRect.left + rect.width / 2}px`;
    chestEl.style.top = `${rect.top - parentRect.top + rect.height / 2}px`;
    chestEl.style.width = `${rect.width}px`;
    chestEl.style.height = `${rect.height}px`;
    chestEl.style.transform = 'translate(-50%,-50%)';
    layoutEl.appendChild(chestEl);
    // Establish the starting frame before the original handler adds .open.
    chestEl.getBoundingClientRect();
    requestAnimationFrame(() => {
      for (const key of ['transition','left','top','width','height','transform']) chestEl.style.removeProperty(key);
    });
  }
  document.addEventListener('click', prepareChest, true);
  document.addEventListener('pointerup', prepareChest, true);
})();
