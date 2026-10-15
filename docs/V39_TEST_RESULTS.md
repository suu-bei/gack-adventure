# V39 驗證紀錄

## 本次通過
- 全部外部 JavaScript 經 node --check 語法檢查。
- 主頁引用的本地 CSS、JavaScript 及 DAY 1–4 經 HTTP 請求均回應 200。
- DAY 內容及 Credits 資料與 V38 逐位元組相同。
- day-loader.js、media.js、journal.js、config.js、state.js、bootstrap.js 與 V38 相同。
- 手機選單日期容器唯一；已移除舊 Chapter Index 入口及其事件引用。

## 未驗證
- 本次沒有完成瀏覽器畫面或互動實測。環境未安裝 Chromium，嘗試下載瀏覽器失敗。
- 寶箱轉場、Desktop 日曆選取與卷軸開合、貼紙拖曳/刪除/儲存，須上傳後檢查。
- 手機選單直接跳日、Credits 返回、左右循環翻頁及不同螢幕尺寸，須上傳後檢查。
- 真實 YouTube/X 播放及換日停止，須在可播放的 HTTPS 網站檢查。
- docs/TEST_RESULTS.md 是 V38 歷史測試紀錄，不是 V39 的實測結果。

## 保留問題
Desktop 貼紙上下裁切位置，待正式卷軸素材完成後修正。
