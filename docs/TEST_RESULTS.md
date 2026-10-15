# V41 測試結果

## 環境與邊界

自動測試使用 Chromium 133、1920×1080 與 402×874 觸控模式，HTTP 專案子路徑。原生影片使用本機兩秒 WebM 測試資料替代遠端 MP4。它驗證原生按鈕與播放行為，不能證明真實 X 來源可播。
另外用雲端 Chrome 檢查現有 Pages，X 內嵌播放器顯示 Unable to play media，YouTube 與 Drive 有嵌入畫面；未聲稱完成兩者完整有聲播放。

| 測試 | 結果 |
|---|---|
| Desktop 寶箱、首頁標題按鈕 | PASS |
| Desktop 卷軸開合及 DAY 切換 | PASS |
| Desktop 貼紙拖入、拖出刪除、重新整理儲存還原 | PASS |
| Desktop 卷軸獨立捲動 | PASS |
| Mobile 標題按鈕開箱、完整卡片、上下閱讀 | PASS |
| Mobile 原生 touch 左右循環 4→1、1→4 | PASS |
| Mobile 直接日期、Credits、日期選取狀態、選單開關 | PASS |
| 首次滑動提示及同 session 不重複顯示 | PASS |
| DAY 只請求一次、保留 DOM／iframe，並失敗可重試 | PASS |
| 原生播放按鈕 desktop click、mobile touch，currentTime 前進 | PASS（測試素材） |
| 原生播放換 DAY 暫停、回訪保留同 iframe | PASS（測試素材） |
| 未點播放前不請求 video.twimg.com 媒體 | PASS |
| 模擬 403：顯示失敗文字、Retry、原始連結 | PASS |
| 同一播放器重試後恢復播放 | PASS（測試素材） |
| YouTube 暫停指令、相同 iframe 保留 | PASS（指令邊界測試） |
| X 官方 iframe／Drive 離開卸載、返回還原 | PASS（同版 V41 測試 iframe／Drive src 卸載與還原） |
| DAY 沒有貼紙按鈕仍可載入 | PASS |
| 儲存資料為 JSON null 不讓初始化中斷 | PASS |
| 檔案檢查頁：全數一致 | PASS |
| 檔案檢查頁：模擬一份 CSS 404，正確指出一份異常 | PASS |
| 全部外部／生成 JS 與檢查頁 JS 語法 | PASS |
| build_release.py 重複執行結果一致 | PASS |
| DAY 1–4、A 主體 CSS、B 內容 CSS、Credits、兩張貼紙 PNG | 與 GitHub 現況逐位元組相同 |
| 真實 X MP4 在 V41 播放 | 未確認；不能以測試素材 PASS 代替 |
| 真實 YouTube／Drive 有聲播放與實體手機／Safari | 未完整驗證 |

完整測試原始輸出在交付包 tests/。部分 repo 舊 docs 之前是 V38 紀錄；本檔已改為 V41，歷史原文保存在原 repo 備份。
