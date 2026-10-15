const SOURCES = [
  "https://raw.githubusercontent.com/suu-bei/gack-adventure/refs/heads/main/images/sticker1.png",
  "https://raw.githubusercontent.com/suu-bei/gack-adventure/refs/heads/main/images/sticker2.png",
];
const DAY_COUNT = 4;
const DAY_FILES = Array.from(
  { length: DAY_COUNT },
  (_, i) => `days/day${String(i + 1).padStart(2, "0")}.html`,
);
