# 番茄的金庫｜GitHub Pages 網站

這是一個可以直接上傳到 GitHub Pages 的靜態網站。

## 這一版已更新

- 已改成即時讀取 Google Sheets：
  `https://docs.google.com/spreadsheets/d/10TBRxSI86Ghbx3rUc2SnTQe7iVNnyJ6ycjNAOuiz74Q/edit?usp=sharing`
- 網站只讀取試算表 A～E 欄。
- 修正原本 `script.js` 中摘要區塊缺失可能造成頁面初始化失敗的問題。
- 搜尋、卡片與表格會依照試算表最新資料重新呈現。

## 內容

- `index.html`：網站主頁
- `style.css`：天空藍古風視覺樣式、欄位分色、飄浮圖標
- `script.js`：Google Sheets 讀取、搜尋功能、統計卡片
- `.nojekyll`：避免 GitHub Pages 額外處理靜態檔案

## 資料範圍

本網站只使用試算表 A～E 欄：

1. 存鑽老闆
2. 存鑽數量
3. 存歌數量
4. 存爆數量
5. 總數

E 欄後面的備註、老闆名字、類型、數量等欄位不會放入網站。

## Google Sheets 權限提醒

請確認試算表共用權限至少為「知道連結的任何人可查看」。若改成私人，網站會讀不到資料。

## GitHub Pages 使用方式

1. 建立一個新的 GitHub Repository。
2. 將 ZIP 解壓縮後，把裡面的 `index.html`、`style.css`、`script.js`、`.nojekyll` 上傳到 Repository 根目錄。
3. 到 Repository 的 `Settings` → `Pages`。
4. Source 選擇 `Deploy from a branch`。
5. Branch 選 `main`，資料夾選 `/root`，按 Save。
6. 等 GitHub 產生網址後即可使用。

## 之後更換試算表

若之後要換成其他試算表，打開 `script.js`，修改最上方：

```js
const SHEET_ID = "新的試算表 ID";
const SHEET_GID = "0";
```

試算表 ID 是網址 `/d/` 後面到 `/edit` 前面那一段。
