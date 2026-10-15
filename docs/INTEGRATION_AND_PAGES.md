# 分支整合、備份與 GitHub Pages

## 本次未發布

目前交付 V38 檔案包供檢查。未連線修改 GitHub，未覆蓋正式站。尚未收到 A/B 分支檔案，沒有宣稱已完成 A/B 整合或衝突檢查。

## 後續整合規則

1. 保留上一個可用 commit／tag 及完整檔案包；V37 原始備份隨交付包提供。
2. 確認 A/B 各自以哪個版本為基準，取得檔案差異後再整合。
3. A 主要提供 index.html、css 與 images；B 主要提供 days；C 維護載入流程、Credits、相容檢查及最終檔案。
4. 共用檔案同時修改時逐段比較，不直接以其中一方整份覆蓋。即使 Git 無文字衝突，也檢查 class、ID、圖片路徑、播放器標記及觸控操作的語意衝突。
5. 完成 Desktop/Mobile 回歸、記錄變更與未解問題，取得使用者確認後才發布。

## 使用 GitHub 網頁上傳

1. 先下載目前 GitHub 專案 ZIP 作為回復用備份；不要刪除現有 images 或其他不相關檔案。
2. 解壓本次 ZIP，找到 `gack-adventure/`。
3. 將該資料夾「內部」的 index.html、css、js、days、images、credits（可連同 docs、README）上傳到 repo 根目錄。不要再包一層 gack-adventure，避免網址多一層路徑。
4. 不需上傳交付包外層的 backups、tests、SHA256SUMS.txt；這些是備份與驗證資料。
5. 先在不作正式 Pages 來源的測試分支提交，例如 integration/v38。GitHub 一般分支網址不會直接執行網站；需本機 HTTP 預覽或另設測試 Pages 環境。
6. 確認修改內容後，由使用者決定何時合併正式 Pages 來源分支。若現在 Pages 指向 main，直接向 main 提交會觸發正式更新。
7. 若原本 Pages 已可用，沿用既有設定即可；本包使用相對路徑，相容專案型 Pages 的 /gack-adventure/ 前綴。
8. 發布後以原網站網址檢查四天、手機循環、選單、貼紙與影片。必要時重新整理，清除舊頁面快取。

## 回復

若 V38 上線後發現問題，回復到上一個可用 Git commit 最完整。也可將備份 V37 單檔還原為根目錄 index.html，並保留原 images；該單檔不依賴 V38 的 css/js/days。不要刪除已新增的投稿或素材來做回復。
