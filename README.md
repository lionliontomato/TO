# 番茄的金庫｜GitHub Pages 網站

這是一個可以直接上傳到 GitHub Pages 的靜態網站，已重新連結到指定 Google 試算表。

## 已連結的試算表

https://docs.google.com/spreadsheets/d/10TBRxSI86Ghbx3rUc2SnTQe7iVNnyJ6ycjNAOuiz74Q/edit?usp=sharing

網站資料來源為 Google 試算表前 5 欄，也就是 A～E 欄資料：

1. 存鑽老闆
2. 存鑽數量
3. 存歌數量
4. 存爆數量
5. 總數

## 重要設定

若網站顯示「資料載入失敗」，請到 Google 試算表右上角「共用」確認權限：

- 一般存取權限：知道連結的使用者
- 權限：檢視者

只要試算表有開放檢視，網站就可以自動讀取最新資料；之後只要改 Google 試算表，網站不用重新打包。

## 內容

- `index.html`：網站主頁
- `style.css`：天空藍古風視覺樣式、欄位分色、飄浮圖標
- `script.js`：自動讀取 Google 試算表 A～E 欄、搜尋功能、統計卡片
- `.nojekyll`：避免 GitHub Pages 額外處理靜態檔案

## GitHub Pages 使用方式

1. 將 ZIP 解壓縮。
2. 把資料夾內的 `index.html`、`style.css`、`script.js`、`.nojekyll` 上傳到 GitHub Repository 根目錄。
3. 到 Repository 的 `Settings` → `Pages`。
4. Source 選擇 `Deploy from a branch`。
5. Branch 選 `main`，資料夾選 `/root`，按 Save。
6. 等 GitHub 產生網址後即可使用。

## 修改資料方式

直接修改 Google 試算表即可，網站會讀取最新的 A～E 欄資料。
