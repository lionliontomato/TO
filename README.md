# 番茄的金庫｜GitHub Pages 網站

這是一個可以直接上傳到 GitHub Pages 的靜態網站。

## 內容

- `index.html`：網站主頁
- `style.css`：天空藍古風視覺樣式、欄位分色、飄浮圖標
- `script.js`：A～E 欄資料、搜尋功能、統計卡片
- `.nojekyll`：避免 GitHub Pages 額外處理靜態檔案

## 資料範圍

本網站只使用試算表 A～E 欄：

1. 存鑽老闆
2. 存鑽數量
3. 存歌數量
4. 存爆數量
5. 總數

E 欄後面的備註、老闆名字、類型、數量等欄位沒有放入網站。

## GitHub Pages 使用方式

1. 建立一個新的 GitHub Repository。
2. 將 ZIP 解壓縮後，把裡面的 `index.html`、`style.css`、`script.js`、`.nojekyll` 上傳到 Repository 根目錄。
3. 到 Repository 的 `Settings` → `Pages`。
4. Source 選擇 `Deploy from a branch`。
5. Branch 選 `main`，資料夾選 `/root`，按 Save。
6. 等 GitHub 產生網址後即可使用。

## 修改資料方式

若之後試算表資料更新，可以打開 `script.js`，修改 `records` 陣列中的資料即可。
