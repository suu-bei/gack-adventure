function pauseDepartingDay(oldDay) {
  const oldPage = dayPages.get(oldDay);
  if (!oldPage) return;
  oldPage.querySelectorAll("video,audio").forEach((media) => {
    try {
      media.pause();
    } catch (e) {}
  });
  oldPage.querySelectorAll("iframe").forEach((frame) => {
    if(frame.dataset.gackNativePlayer === "1") {
      try {
        frame.contentDocument?.querySelectorAll("video,audio").forEach(media=>media.pause());
        frame.contentWindow?.postMessage({type:"gack-native-video-pause"},location.origin);
      } catch(e) {}
      return;
    }
    const url = frame.getAttribute("src") || "";
    if (/youtube\.com\/embed\//.test(url)) {
      try {
        frame.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: "pauseVideo", args: [] }),
          "https://www.youtube.com",
        );
      } catch (e) {}
    } else if (
      /(?:platform|twitter|x)\.com|twimg\.com/.test(url) ||
      /^https:\/\/drive\.google\.com\/file\/d\/[^/]+\/preview(?:[?#]|$)/.test(url)
    ) {
      // X and Drive have no pause API used here. Unload only the departing
      // player, then restore its URL when this DAY is shown again.
      if (!frame.dataset.gackOriginalSrc) frame.dataset.gackOriginalSrc = url;
      frame.setAttribute("src", "about:blank");
      frame.dataset.gackPaused = "1";
    }
  });
}
function restoreDayMedia(n) {
  const page = dayPages.get(n);
  if (!page) return;
  page.querySelectorAll('iframe[data-gack-paused="1"]').forEach((frame) => {
    frame.setAttribute("src", frame.dataset.gackOriginalSrc);
    delete frame.dataset.gackPaused;
  });
}

// Load the official widget library only for a DAY that actually contains a tweet.
let twitterWidgetsRequest;
function hydrateTwitterWidgets(page) {
  if (!page.querySelector('blockquote.twitter-tweet')) return;
  if (window.twttr?.widgets?.load) { window.twttr.widgets.load(page); return; }
  if (!twitterWidgetsRequest) {
    twitterWidgetsRequest = new Promise((resolve,reject) => {
      const script=document.createElement('script');
      script.src='https://platform.x.com/widgets.js';
      script.async=true;
      script.onload=resolve;
      script.onerror=()=>{ twitterWidgetsRequest=undefined; reject(new Error('X widget library unavailable')); };
      document.head.append(script);
    });
  }
  twitterWidgetsRequest.then(()=>window.twttr?.widgets?.load(page)).catch(error=>console.warn(error));
}
