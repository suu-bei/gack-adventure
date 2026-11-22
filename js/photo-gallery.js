/* Progressive enhancement for groups of journal photos. DAY files remain plain HTML. */
(() => {
  const content = document.getElementById('pageContent');
  if (!content || !window.HTMLDialogElement || !HTMLDialogElement.prototype.showModal) return;

  const make = (tag, className = '', text = '') => {
    const node = document.createElement(tag);
    node.className = className;
    node.textContent = text;
    return node;
  };
  function button(className, label, glyph = '') {
    const node = make('button', className, glyph);
    node.type = 'button';
    node.setAttribute('aria-label', label);
    return node;
  }
  function image(photo, preview = false, lazy = false) {
    const node = make('img');
    node.src = (preview && photo.preview) || photo.src;
    node.alt = '';
    node.draggable = false;
    node.decoding = 'async';
    if (lazy) node.loading = 'lazy';
    return node;
  }
  const counter = (index, length) =>
    String(index + 1).padStart(2, '0') + ' / ' + String(length).padStart(2, '0');

  const dialog = make('dialog', 'gack-gallery-viewer');
  const head = make('div', 'gack-gallery-viewer-head');
  const heading = make('h2');
  heading.id = 'gack-gallery-viewer-title';
  dialog.setAttribute('aria-labelledby', heading.id);
  const close = button('', 'Close photo viewer', '×');
  head.append(heading, close);
  const full = make('img', 'gack-gallery-full');
  full.decoding = 'async';
  full.draggable = false;
  const footer = make('div', 'gack-gallery-viewer-foot');
  const prev = button('', 'Previous photo', '‹');
  const next = button('', 'Next photo', '›');
  const status = make('span');
  status.setAttribute('aria-live', 'polite');
  footer.append(prev, status, next);
  dialog.append(head, full, footer);
  // Outside #paperScroll, so the DAY swipe handler cannot receive viewer touches.
  document.body.append(dialog);

  let active = null;
  function show(index) {
    if (!active || index < 0 || index >= active.photos.length) return;
    active.index = index;
    const photo = active.photos[index];
    heading.textContent = photo.title;
    full.alt = photo.alt;
    full.src = photo.src;
    status.textContent = counter(index, active.photos.length);
    prev.disabled = index === 0;
    next.disabled = index === active.photos.length - 1;
    if (document.activeElement === prev && prev.disabled) next.focus();
    if (document.activeElement === next && next.disabled) prev.focus();
  }
  function open(photos, index, opener) {
    if (dialog.open) return;
    active = { photos, opener, index };
    show(index);
    dialog.showModal();
    close.focus({ preventScroll:true });
  }
  close.addEventListener('click', () => dialog.close());
  prev.addEventListener('click', () => show(active.index - 1));
  next.addEventListener('click', () => show(active.index + 1));
  dialog.addEventListener('keydown', event => {
    if (!active || !['ArrowLeft','ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    show(active.index + (event.key === 'ArrowRight' ? 1 : -1));
  });
  dialog.addEventListener('close', () => {
    if (active?.opener.isConnected) active.opener.focus({ preventScroll:true });
    active = null;
    full.removeAttribute('src');
  });

  function getPhotos(source) {
    const photos = Array.from(source.querySelectorAll(':scope > figure')).flatMap((figure, i) => {
      const img = figure.querySelector('img[src]');
      if (!img?.getAttribute('src')?.trim()) return [];
      const src = img.src;
      const alt = img.alt.trim();
      const title = figure.querySelector('figcaption')?.textContent.trim() || alt || 'Photo ' + (i+1);
      const name = new URL(src).pathname.split('/').at(-1);
      const match = /^(day\d+-image\d+)-(\d+)\.(?:jpg|jpeg|png|webp|avif|gif)$/i.exec(name);
      return [{src, alt:alt || title, title, preview:img.dataset.galleryThumb, group:match?.[1].toLowerCase(), order:Number(match?.[2])}];
    });
    // Only sort valid, unambiguous groups. Other filenames use article order.
    if (photos.length && photos.every(p => p.group && p.group === photos[0].group) &&
        new Set(photos.map(p => p.order)).size === photos.length) {
      photos.sort((a,b) => a.order - b.order);
    }
    return photos;
  }

  const seen = new WeakSet();
  function enhance(section) {
    if (seen.has(section)) return;
    const source = section.querySelector(':scope > .gack-gallery-source');
    if (!source) return;
    const photos = getPhotos(source);
    if (photos.length < 2) return;

    const fan = make('div', 'gack-gallery-fan');
    if (photos.length > 5) fan.dataset.grid = '';
    const mobile = make('div', 'gack-gallery-mobile');
    const main = button('gack-gallery-main', 'Enlarge selected photo');
    const large = make('img');
    large.alt = '';
    large.draggable = false;
    large.decoding = 'async';
    large.loading = 'lazy';
    const meta = make('span', 'gack-gallery-meta');
    const mainTitle = make('span');
    const mainCount = make('span');
    meta.append(mainTitle, mainCount);
    main.append(large, meta);
    const thumbs = make('div', 'gack-gallery-thumbs');
    thumbs.setAttribute('role','group');
    thumbs.setAttribute('aria-label','Select a photo');
    thumbs.style.setProperty('--thumb-columns', Math.min(photos.length, 5));
    if (photos.length >= 5) thumbs.dataset.compact = '';
    mobile.append(main, thumbs, make('p','gack-gallery-hint','Tap a thumbnail to switch photos'));
    let selected = 0;
    const useWideFan = photos.length >= 4 && photos.length <= 5;
    if (useWideFan) fan.dataset.wide = '';
    const positions = photos.length === 2
      ? [[22,26,4,6],[-22,-26,-4,-6]]
      : useWideFan
      ? [[0,0,-2,-2],[-38,-43,-8,-10],[38,43,8,10],[-73,-81,-15,-17],[73,81,15,17]]
      : [[0,0,-2,-2],[-43,-52,-12,-15],[43,52,12,15]];

    function select(index) {
      selected = index;
      const photo = photos[index];
      large.src = photo.src;
      large.alt = photo.alt;
      mainTitle.textContent = photo.title;
      mainCount.textContent = counter(index, photos.length);
      main.setAttribute('aria-label', 'Enlarge ' + photo.title);
      Array.from(thumbs.children).forEach((node,i) => node.setAttribute('aria-pressed', String(i === index)));
    }

    photos.forEach((photo,i) => {
      const card = button('gack-gallery-card', 'Enlarge ' + photo.title);
      const position = positions[i];
      if (position) {
        const [x,spread,angle,turn] = position;
        for (const [prop,value] of Object.entries({
          '--x':x+'%','--spread':spread+'%','--angle':angle+'deg',
          '--turn':turn+'deg','--stack':photos.length-i
        })) card.style.setProperty(prop,value);
      }
      card.append(image(photo,true,true), make('span','',photo.title));
      card.addEventListener('click', () => open(photos,i,card));
      fan.append(card);
      const thumb = button('gack-gallery-thumb',photo.title);
      thumb.append(image(photo,true,true),make('span','',photo.title));
      thumb.addEventListener('click', () => select(i));
      thumbs.append(thumb);
    });
    main.addEventListener('click', () => open(photos,selected,main));
    select(0);
    section.append(fan,mobile);
    source.hidden = true;
    seen.add(section);
  }
  function scan(node) {
    if (node.nodeType !== 1) return;
    if (node.matches('.gack-photo-gallery')) enhance(node);
    node.querySelectorAll('.gack-photo-gallery').forEach(enhance);
  }
  // The existing DAY loader appends each complete, cached article as one node.
  // Watch mounts only; do not replace day-loader, nav, or media code.
  new MutationObserver(records => {
    for (const record of records) record.addedNodes.forEach(scan);
  }).observe(content,{childList:true});
  scan(content);
})();
