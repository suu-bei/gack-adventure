// Two session caches: fetched HTML/pending request and mounted DAY DOM.
// Relative URLs resolve against index.html (also under /gack-adventure/).
const dayPages = new Map();
const dayRequests = new Map();
function ensureDay(n) {
  if (dayPages.has(n)) return Promise.resolve(dayPages.get(n));
  if (dayRequests.has(n)) return dayRequests.get(n);
  const request = fetch(DAY_FILES[n - 1], { cache: "no-cache" })
    .then((response) => {
      if (!response.ok)
        throw new Error(`${DAY_FILES[n - 1]}: HTTP ${response.status}`);
      return response.text();
    })
    .then((html) => {
      const page = document.createElement("div");
      page.className = "day-page";
      page.dataset.day = n;
      page.hidden = true;
      page.innerHTML = html;
      page.querySelector("#reset").onclick = () => {
        items[day] = [];
        save();
        renderPlaced();
      };
      page.querySelector("#return").onclick = () => {
        sources.forEach((s) => (s.out = false));
        showSources();
      };
      content.append(page);
      dayPages.set(n, page);
      if (page.querySelector("blockquote.twitter-tweet") && window.twttr?.widgets?.load)
        window.twttr.widgets.load(page);
      return page;
    })
    .catch((error) => {
      dayRequests.delete(n);
      throw error;
    });
  dayRequests.set(n, request);
  return request;
}
