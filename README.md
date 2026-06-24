# 歡茄の金庫｜GitHub Pages 網站

這是一個可以直接上傳到 GitHub Pages 的靜態網站，版型比照 `sing-MoneyFang`，並已改成天空藍背景與「歡茄の金庫」。

## 已連結的試算表

https://docs.google.com/spreadsheets/d/10TBRxSI86Ghbx3rUc2SnTQe7iVNnyJ6ycjNAOuiz74Q/edit?usp=sharing

網站資料來源為 Google 試算表前 5 欄，也就是 A～E 欄資料，讀取規則比照原版：

1. 第 1 列為欄位名稱
2. 第 2 列起為資料內容
3. 搜尋功能比照原版，以第 A 欄名稱搜尋
4. L 欄可放設定名稱，M 欄可放設定內容，例如「網站標題」、「網站小標題」

## 內容

- `index.html`：網站主頁
- `style.css`：天空藍背景、版型與表格樣式
- `script.js`：自動讀取 Google 試算表 A～E 欄與搜尋功能
- `copyright.html`：著作權聲明與使用條款
- `bg-desktop.png`：桌機版背景圖
- `bg-mobile.png`：手機版背景圖
- `.nojekyll`：避免 GitHub Pages 額外處理靜態檔案

## GitHub Pages 使用方式

1. 將 ZIP 解壓縮。
2. 把資料夾內全部檔案上傳到 GitHub Repository 根目錄。
3. 到 Repository 的 `Settings` → `Pages`。
4. Source 選擇 `Deploy from a branch`。
5. Branch 選 `main`，資料夾選 `/root`，按 Save。
6. 等 GitHub 產生網址後即可使用。

## 注意

若網站顯示「資料載入失敗」，請到 Google 試算表右上角「共用」確認權限：

- 一般存取權限：知道連結的使用者
- 權限：檢視者

之後只要修改 Google 試算表，網站就會讀取最新資料，不用重新打包。
