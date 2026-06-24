# 番茄的歡茄の金庫｜GitHub Pages 靜態網站

這是一個可直接上傳到 GitHub Pages 的靜態網站版本。

## 已完成修改

- 網站名稱：番茄的歡茄の金庫
- 背景色：天空藍
- 桌機背景圖：`bg-desktop.jpg`
- 手機背景圖：`bg-mobile.jpg`
- Google 試算表連結：`https://docs.google.com/spreadsheets/d/10TBRxSI86Ghbx3rUc2SnTQe7iVNnyJ6ycjNAOuiz74Q/edit?usp=sharing`
- 保留讀取 Google 試算表 A～E 欄、搜尋第一欄、L/M 欄可設定網站標題與小標題的規則

## 上傳方式

1. 將 ZIP 解壓縮。
2. 把資料夾內所有檔案上傳到 GitHub Repository 根目錄。
3. 到 Repository 的 `Settings` → `Pages`。
4. Source 選 `Deploy from a branch`。
5. Branch 選 `main`，資料夾選 `/root`，按 Save。
6. 等 GitHub Pages 產生網址後即可使用。

## 試算表權限

若網站顯示「資料載入失敗」，請到 Google 試算表右上角「共用」確認：

- 一般存取權限：知道連結的使用者
- 權限：檢視者

## 檔案說明

- `index.html`：網站主頁
- `style.css`：網站樣式
- `script.js`：讀取 Google 試算表與搜尋功能
- `bg-desktop.jpg`：桌機背景
- `bg-mobile.jpg`：手機背景
- `copyright.html`：使用說明與著作權提醒
- `.nojekyll`：避免 GitHub Pages 額外處理靜態檔案
