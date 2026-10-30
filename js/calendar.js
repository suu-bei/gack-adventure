/* Desktop calendar presentation adapter. Keep the existing button elements,
   handlers, active classes, disabled states and DAY order intact. */
(() => {
  const nav = document.getElementById('days');
  if (!nav) return;
  function syncSelection() {
    nav.querySelectorAll('.log-day').forEach(button => {
      if (button.classList.contains('active')) button.setAttribute('aria-current', 'date');
      else button.removeAttribute('aria-current');
    });
  }
  function refresh() {
    const settings = window.GACK_CALENDAR_SETTINGS || {};
    const restDays = new Set((settings.restDays || []).filter(Number.isInteger));
    nav.classList.add('wall-calendar');
    const title = nav.querySelector('.log-title');
    if (title) title.textContent = 'ADVENTURE';
    nav.querySelector('.log-footer')?.remove();
    nav.querySelectorAll('.log-day').forEach(button => {
      const number = Number(button.dataset.day);
      const rest = restDays.has(number);
      // A missing article remains coming soon. Rest is separate from availability.
      const known = rest || !button.disabled;
      const status = rest ? 'Rest day' : known ? 'Live stream' : 'Coming soon';
      const label = document.createElement('span');
      label.className = 'calendar-day-label';
      label.textContent = 'DAY';
      const numeral = document.createElement('span');
      numeral.className = 'log-number';
      numeral.textContent = String(number).padStart(2, '0');
      const symbol = document.createElement('span');
      symbol.className = 'log-symbol';
      if (known) {
        const icon = document.createElement('img');
        icon.className = 'calendar-status-icon';
        icon.src = rest ? (settings.restIcon || 'images/calendar/rest.png') : (settings.liveIcon || 'images/calendar/live.png');
        icon.alt = ''; // Status is already announced by the button label.
        icon.width = icon.height = 16;
        icon.draggable = false;
        symbol.append(icon);
      } else {
        symbol.textContent = '?';
        symbol.setAttribute('aria-hidden', 'true');
      }
      button.replaceChildren(label, numeral, symbol);
      button.dataset.calendarStatus = rest ? 'rest' : known ? 'live' : 'pending';
      button.setAttribute('aria-label', 'DAY ' + String(number).padStart(2, '0') + ' · ' + status + (rest && button.disabled ? ' · Coming soon' : ''));
      button.title = button.getAttribute('aria-label');
    });
    syncSelection();
    if (typeof showSources === 'function') showSources();
  }
  refresh(); // Loaded after bootstrap.js has built the original calendar.
  const observer = new MutationObserver(syncSelection);
  observer.observe(nav, {subtree: true, attributes: true, attributeFilter: ['class']});
  window.GackCalendar = {refresh};
})();
