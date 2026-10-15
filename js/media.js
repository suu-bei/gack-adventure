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
