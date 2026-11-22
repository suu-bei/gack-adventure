/* Render dynamic official X embeds when their API is ready. */
(() => {
  const twitter = window.twttr = window.twttr || {};
  twitter._e = twitter._e || [];
  twitter.ready = twitter.ready || (callback => twitter._e.push(callback));
  window.GackXEmbeds = {load(page) {
    if (!page.querySelector(".twitter-video,.twitter-tweet")) return;
    const render = api => api.widgets.load(page);
    if (twitter.widgets?.load) render(twitter);
    else twitter.ready(render);
  }};
})();
