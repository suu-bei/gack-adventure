const SOURCES = [
  "https://raw.githubusercontent.com/suu-bei/gack-adventure/refs/heads/main/images/sticker1.png",
  "https://raw.githubusercontent.com/suu-bei/gack-adventure/refs/heads/main/images/sticker2.png",
];
// Planned calendar slots; shared by desktop and mobile menus.
const TOTAL_DAY_COUNT = 16;
// Every calendar slot has a page, including rest days and content placeholders.
const DAY_COUNT = TOTAL_DAY_COUNT;
const DAY_FILES = Array.from(
  { length: DAY_COUNT },
  (_, i) => `days/day${String(i + 1).padStart(2, "0")}.html`,
);

// Refresh updated articles; mounted DAY DOM caching is unchanged.
DAY_FILES[0] += "?v=day01-x-publish-4";
DAY_FILES[1] += "?v=day02-x-publish-1";
DAY_FILES[2] += "?v=day03-x-publish-2";

