const SOURCES = [
  "https://raw.githubusercontent.com/suu-bei/gack-adventure/refs/heads/main/images/sticker1.png",
  "https://raw.githubusercontent.com/suu-bei/gack-adventure/refs/heads/main/images/sticker2.png",
];
// Planned calendar slots; shared by desktop and mobile menus.
const TOTAL_DAY_COUNT = 16;
// Published, consecutive DAY files. Increase only after B/C add the articles.
const DAY_COUNT = 4;
const DAY_FILES = Array.from(
  { length: DAY_COUNT },
  (_, i) => `days/day${String(i + 1).padStart(2, "0")}.html`,
);

// Refresh the released DAY01 once; mounted DAY DOM caching is unchanged.
DAY_FILES[0] += "?v=39.1-day01";

