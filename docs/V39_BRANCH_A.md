# V39 分支 A：日曆與手機選單

## 修改
- index.html：Desktop Adventure Log 容器；Mobile 日期移至選單首頁；保留 Credits 內容容器與外部資料來源。
- css/style.css：附加 V39 預覽樣式，原有樣式順序不變。
- js/stickers.js：只更新 build() 建立日曆，拖曳及儲存邏輯不變。
- js/navigation.js：15 格日期置於選單首頁，開啟時更新選取狀態，保留 Credits 返回。
- README.md、本文件及 CHANGELOG.md：版本說明。

## 範圍及整合
- days/、credits/content.js、js/config.js、js/state.js、js/day-loader.js、js/media.js、js/journal.js、js/bootstrap.js 未修改。
- 目前 DAY_COUNT=4；15 格為導覽版面容量，不代表已有15天內容。未開放格維持預覽的停用行為，圖示暫用 ▤ 與 ?；尚無睡覺圖示或開播狀態資料。
- 整合時比較上述4個主體檔案，不覆蓋 B 的 days/ 或 C 的 Credits、載入器。Desktop build() 目前仍位於 stickers.js。
- 保留 DAY 快取、影片換日處理及 localStorage 鍵。手機循環仍在已有4天之間。
- Desktop 貼紙裁切問題保留，待正式卷軸素材修正。

## 上傳
將 gack-adventure 資料夾內的 index.html、css、js、days、credits、images 等放到 GitHub repo 根目錄，不要多包一層資料夾。保留 GitHub 上現有圖片；本包 images/ 僅有說明，兩張貼紙仍引用既有 GitHub 圖片。
若已有更新的 B 分支 DAY，請保留現有 days/，僅替換本次4個主體檔案與文件。
本次未修改 GitHub；上傳至正式 Pages 來源分支後會觸發網站更新。

## 驗證
見 V39_TEST_RESULTS.md；V38 既有測試紀錄仍保留為歷史紀錄。
