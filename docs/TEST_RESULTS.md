# V38 驗證紀錄 — 2026-10-15

## 測試條件

使用 Playwright + Chromium 133 headless，經 HTTP 本機伺服器載入；網址含 `/gack-adventure/` 專案子路徑。
Desktop 1440×1000；Mobile 402×874、觸控模式。手機手勢透過 Chromium 原生 touch input 發送，不只是呼叫換日函式。

為了可靠比較 V37 與 V38 的網站本體，主回歸測試將第三方影片回應替換為空白播放器文件，兩張貼紙用相同尺寸的替代圖。因此以下 PASS 涵蓋網站邏輯、版型、媒體處理指令與觸控事件，不代表第三方實際影音解碼／播放已通過。

| 項目 | 結果與實際驗證 |
|---|---|
| Desktop 首頁與寶箱 | PASS：首頁可見，點寶箱後進入 open 狀態 |
| Desktop 卷軸換日 | PASS：實際點 DAY 按鈕，觀察 rolling 狀態及完成換日 |
| Desktop 貼紙拖曳／刪除 | PASS：滑鼠 pointer drag 從箱內放入卷軸；拖出卷軸即移除 |
| Desktop 貼紙儲存 | PASS：重新整理、開箱後還原已放置貼紙 |
| Desktop 卷軸獨立捲動 | PASS：paperScroll 可捲動、視窗 scrollY 維持 0 |
| Mobile 完整紙張 | PASS：DAY 1–4 的 V37/V38 整頁截圖像素一致（外部素材替代） |
| Mobile 左右／上下手勢 | PASS：原生水平 touch 翻頁；垂直 touch 捲動日記內容 |
| Mobile 無限循環 | PASS：DAY 4 左滑→DAY 1；DAY 1 右滑→DAY 4 |
| Mobile 漢堡選單 | PASS：開啟、關閉、重新開啟 |
| Mobile Chapter Index | PASS：選 DAY 4、關閉選單並顯示正確頁面 |
| Mobile Credits | PASS：打開 Credits，顯示 V37 原有兩段文字 |
| Mobile 首次提示 | PASS：開箱後出現，同一 session 重新整理後不再顯示 |
| DAY 快取 | PASS：返回 DAY 2 不重複 fetch；保留同一 YouTube iframe 物件 |
| DAY 載入失敗 | PASS：404 時保留原 DAY，解除鎖定，恢復網路後可重試 |
| 首頁 DAY 載入失敗 | PASS：DAY 1 初次 503，開箱後仍可重試載入 DAY 1 |
| 同時載入相同 DAY | PASS：三個並行 ensureDay(3) 共用一個網路請求／一個 DOM |
| YouTube 換日暫停邏輯 | PASS：在 iframe 邊界攔截並核對 pauseVideo 指令。未驗證播放器實際執行／聲音停止 |
| X 換日停止邏輯 | PASS：測試 iframe 離開時 src=about:blank，返回還原原始 URL。未驗證真實 X widget 播放 |
| Desktop 視覺對照 | PASS：四天 V37/V38 截圖逐像素一致（外部素材替代） |
| 原 CSS／備份 | PASS：CSS 與 V37 style 內容逐字相同；備份與原附件位元組相同 |
| JavaScript 語法 | PASS：全部外部 JS 通過 node --check |

## 尚未完成的外部驗證

- 真實 YouTube 與 X 影片的播放、音訊、登入限制、第三方 Cookie、Error 153，以及影片播放中的換日暫停，須在可播放的正式來源或測試 HTTPS 網站實測。
- 此環境的 YouTube 網路探測回傳空內容，不能以 HTTP 200 判定實際播放成功。
- 未使用實體 iPhone/Android 或 Safari 測試；目前是 Chromium 手機模擬。
- 尚未提供正式卷軸素材、A/B 分支與 Credits 名單，因此無法測試這些尚未整合的內容。

## 已知問題保持不變

Desktop 貼紙裁切位置仍須配合正式卷軸素材修正。X 返回 DAY 會重載播放器。DAY 2 為測試影片，DAY 3–4 保留原示意內容。

## 重跑

交付包外層 `tests/v38.cjs` 是主要回歸腳本，`tests/loader-edge.cjs` 是載入失敗與並行快取測試；`tests/results.json` 是主要測試輸出。
在交付包根目錄執行 `python3 -m http.server 8000`。另開終端機，在有 Playwright 與 Chromium 的 Node 環境執行 `node tests/v38.cjs`；自訂 Chromium 時可設 `V38_CHROMIUM_PATH`。edge 腳本需設定該路徑。
