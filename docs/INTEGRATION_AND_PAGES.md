# V41 一次完整更新與回復方式

## 更新前

本包有兩個重要目錄：

- gack-adventure/：完整的 V41 網站檔案。
- backups/：從目前 GitHub 下載並核對的完整舊版 ZIP，包含目前 repo 的所有 30 個檔案。

audit/ 與 tests/ 是檢查證據，不必上傳網站。

目前 GitHub 未被此工作修改。若你檢查報告後決定測試 V41，請依下面方式一次提交。

## GitHub 網頁上傳

1. 解壓 ZIP，打開本機 gack-adventure 資料夾。
2. GitHub 開到 repo 的最外層，也就是看得到原 index.html 的位置。
3. Add file → Upload files。
4. 將本機 gack-adventure 裡的 index.html、check.html、assets、css、js、days、credits、data、images、players 等一起拖進上傳區。docs、tools、README 也可以一併上傳。
5. 確認上傳清單中是 assets/app.…js、days/day01.html，而不是 gack-adventure/assets/… 或 days/days/…。
6. 等檔案全上傳好後，按一次 Commit changes。不要每個資料夾拆成不同提交，以減少暫時半套更新。
7. 等最新 pages build and deployment 成功。先前取消的舊工作不代表最新部署失敗。
8. Ctrl+Shift+R 重新整理。將主站網址最後補上 check.html 開啟檢查頁，按「開始檢查」。
9. 如果顯示 0 個需要檢查，表示 V41 紀錄中的檔案一致。若有紅字，依該列檔案路徑補上，不要因 X 播放失敗就重新上傳所有 DAY。

不要先刪除 GitHub 原資料夾。既有 V36/V37、preview.html、root style.css/script.js 沒被主站載入，留下也不會與新版衝突；本次乾淨發布目錄沒有再放它們，但原版完整保存在 backups。是否另外整理 GitHub 的歷史檔案可稍後決定，不是影片修復的必要步驟。

如果你在本次稽核之後又修改文章，先保留新文章，再與本包 days 比較。V41 的 DAY 檔案與擷取時的 GitHub 完全相同，不包含你後來另加的新稿。

## 播放測試

DAY 1 的 X 區塊現在有明確的播放按鈕。按下後：

- 正常：開始播放、播放時間前進。
- 載入中：顯示 Loading。
- 失敗：顯示 Retry 與原始片段連結，不再只有無反應的原生控制項。

這些狀態能區分控制項與來源失敗；它們不會繞過來源服務權限或 403。真實 X 播放仍需實際環境確認。

依序檢查播放→DAY 2→DAY 1，確認暫停與返回。再測 YouTube／Drive。手機在文字區左右滑動，播放器裡的手勢保留給播放器。

## 回復

若決定回復，解壓 backups/github_160ffc9_before_V41.zip，將裡面的原 repo 檔案放回根目錄並提交。原 index.html 會重新引用原本的 js/css 路徑；新的 assets、check.html 等留下不會被舊入口載入，不必為回復而先刪除。

原 repo 的 images/sticker1.png、sticker2.png 已包含在完整備份與 V41，不會再出現「交付包沒有原貼紙圖」的情況。
