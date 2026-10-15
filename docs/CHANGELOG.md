## V39 — 分支 A

套用 V39 日曆式 Desktop 導覽與 Mobile 直接選日期版面。故事、Credits、載入及媒體流程不變。詳見 V39_BRANCH_A.md。

# 版本紀錄

## V38 — 2026-10-15

- 來源：使用者提供的 journey_with_gack_v37_sticker_scroll_clip(1).html。
- 原 CSS 完整抽至 css/style.css，未改動樣式或動畫規則。
- 原腳本依狀態、貼紙、媒體、DAY 載入、日記操作與選單拆分；使用有順序的傳統腳本，保留共用狀態語意。
- 將原程式動態產生的 DAY 1–4 內容抽為獨立 HTML 片段，保留 DAY 3–4 既有佔位內容，未新增 DAY。
- 新增拆分所必要的 fetch 載入器、請求合併、DOM 保留與失敗重試；切換動畫等待內容就緒後才進行。
- 將原 Credits 文字移至 credits/content.js，顯示內容不變。
- 頁籤標題版本由原始檔殘留的 V25 更新為 V38。
- 保留 V37 原始備份與 SHA-256；未更動原附件、未覆蓋 A/B 分支、未發布正式網站。

## 沿用限制

- Desktop 貼紙裁切需配合正式卷軸素材調整，非本版目標。
- DAY 2 仍是原 YouTube 測試影片；DAY 3–4 仍是原示意內容。
- Credits 仍為原提示文字，等待最終名單。
- X 沒有原程式可用的暫停 API，離開後卸載／返回重載。
- 原外部 GitHub 貼紙圖、X、YouTube 依賴第三方服務與瀏覽器環境。
