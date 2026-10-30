/* Calendar status only; does not publish or unlock DAY content.
   C: enter confirmed rest days here. Example: restDays: [5, 8].
   An empty list means no rest dates have been confirmed yet.
   Add the normal days/dayXX.html with its rest-day PNG via B/C before
   increasing DAY_COUNT. Never copy the preview's demonstration dates. */
window.GACK_CALENDAR_SETTINGS = {
  restDays: [],
  liveIcon: 'images/calendar/live.png',
  restIcon: 'images/calendar/rest.png',
};
