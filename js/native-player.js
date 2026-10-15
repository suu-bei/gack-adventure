// Standalone native player. Keep transport failures visible and request media only on a user click.
const params = new URLSearchParams(location.search);
const player = document.getElementById('player');
const control = document.getElementById('playControl');
const status = document.getElementById('playerStatus');
const originalLink = document.getElementById('originalLink');
let initialized = false, wantsPlayback = false, timer;
function mediaURL(value) {
  if (!value) return null;
  try { const url = new URL(value, location.href); return ['https:', 'http:'].includes(url.protocol) ? url.href : null; } catch { return null; }
}
const src = mediaURL(params.get('src'));
const poster = mediaURL(params.get('poster'));
const original = mediaURL(params.get('original'));
player.setAttribute('aria-label', params.get('title') || 'Journal video');
if (poster) player.poster = poster;
if (original) originalLink.href = original;
function view(state, message = '') {
  document.body.dataset.state = state;
  control.hidden = state === 'playing';
  control.disabled = state === 'loading';
  control.textContent = state === 'loading' ? 'Loading…' : state === 'error' ? 'Retry' : '▶';
  control.setAttribute('aria-label', state === 'error' ? 'Retry video' : 'Play video');
  status.textContent = message;
  status.hidden = !message;
  originalLink.hidden = state !== 'error' || !original;
}
function failed(message = 'Video could not be loaded. Try again or watch the original clip.') {
  clearTimeout(timer);
  if (wantsPlayback) view('error', message);
}
async function start() {
  wantsPlayback = true;
  if (!src) { failed('Video source is unavailable.'); return; }
  const retry = document.body.dataset.state === 'error';
  view('loading', 'Loading video…');
  if (!initialized || retry || player.error) {
    player.src = src;
    player.load();
    initialized = true;
  }
  clearTimeout(timer);
  timer = setTimeout(() => {
    if (wantsPlayback && player.readyState < 3) failed('Video is taking longer to load. Try again or watch the original clip.');
  }, 15000);
  try { await player.play(); }
  catch (error) {
    if (!wantsPlayback) return;
    failed(error.name === 'NotAllowedError' ? 'Tap play again to start the video.' : undefined);
  }
}
control.addEventListener('click', start);
player.addEventListener('playing', () => { clearTimeout(timer); view('playing'); });
player.addEventListener('pause', () => { if (document.body.dataset.state !== 'error') view('paused'); });
player.addEventListener('ended', () => view('paused'));
player.addEventListener('error', () => { if (initialized) failed(); });
window.addEventListener('message', event => {
  if (event.origin !== location.origin || event.source !== parent) return;
  if (event.data?.type === 'gack-native-video-pause') {
    wantsPlayback = false;
    clearTimeout(timer);
    player.pause();
    if (document.body.dataset.state !== 'error') view('paused');
  }
});
view('idle');
