```js
const SHEET_ID = "10TBRxSI86Ghbx3rUc2SnTQe7iVNnyJ6ycjNAOuiz74Q";

const SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;

let headers = ["存鑽老闆", "存鑽數量", "存歌數量", "存爆數量", "總數"];

let records = [];

const colors = ["col-name", "col-diamond", "col-song", "col-bomb", "col-total"];

const fmt = new Intl.NumberFormat("zh-Hant-TW");

const $ = (selector) => document.querySelector(selector);

function normalize(text) {
  return String(text ?? "").trim().toLowerCase();
}

// 數字會轉成數字；不是數字的內容會保留原文字，例如 ♾️、∞、無上限、VIP
function toNumber(value) {
  const cleaned = String(value ?? "").replace(/,/g, "").trim();

  if (cleaned === "") return 0;

  const number = Number(cleaned);

  if (Number.isFinite(number)) {
    return number;
  }

  return cleaned;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function parseCSV(text) {
  const rows = [];

  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i++;

      row.push(cell);
      rows.push(row);

      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell);
  rows.push(row);

  return rows.filter(r => r.some(c => String(c).trim() !== ""));
}

function applySiteSettings(rows) {
  const settings = {};

  rows.forEach(row => {
    const key = String(row[11] ?? "").trim();   // L 欄
    const value = String(row[12] ?? "").trim(); // M 欄

    if (key && value) {
      settings[key] = value;
    }
  });

  const title = settings["網站標題"] || "番茄の金庫";
  const subtitle = settings["網站小標題"] || "多吃番茄身體好。";

  const siteTitle = $("#siteTitle");
  const siteSubtitle = $("#siteSubtitle");

  if (siteTitle) siteTitle.textContent = title;
  if (siteSubtitle) siteSubtitle.textContent = subtitle;

  document.title = title;
}

async function loadSheetData() {
  const url = `${SHEET_CSV_URL}&cacheBust=${Date.now()}`;
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const csvText = await response.text();
  const rows = parseCSV(csvText);

  if (rows.length < 2) {
    throw new Error("試算表沒有可顯示的資料");
  }

  applySiteSettings(rows);

  const sheetHeaders = rows[0]
    .slice(0, 5)
    .map(h => String(h || "").trim());

  if (sheetHeaders.filter(Boolean).length >= 5) {
    headers = sheetHeaders;
  } else {
    headers = ["存鑽老闆", "存鑽數量", "存歌數量", "存爆數量", "總數"];
  }

  records = rows.slice(1)
    .map(row => {
      const item = {};

      headers.forEach((header, index) => {
        item[header] = index === 0
          ? String(row[index] ?? "").trim()
          : toNumber(row[index]);
      });

      return item;
    })
    .filter(item => String(item[headers[0]] || "").trim() !== "");
}

function renderTable(items) {
  const tableHead = $("#tableHead");
  const tableBody = $("#tableBody");

  if (!tableHead || !tableBody) return;

  // 重要：index.html 裡的 tableHead 已經是 <tr id="tableHead"></tr>
  // 所以這裡只能塞 <th>，不能再塞一層 <tr>
  tableHead.innerHTML = headers
    .map((h, index) => `<th class="${colors[index] || "col-extra"}">${escapeHtml(h)}</th>`)
    .join("");

  if (!items.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="${headers.length}" class="empty-state">
          目前沒有符合的資料
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = items.map(item => `
    <tr>
      ${headers.map((h, index) => {
        const rawValue = item[h];

        const value = index === 0
          ? escapeHtml(rawValue)
          : typeof rawValue === "number"
            ? fmt.format(rawValue)
            : escapeHtml(rawValue);

        return `<td class="${index === 0 ? "name-cell" : ""}">${value}</td>`;
      }).join("")}
    </tr>
  `).join("");
}

function updateResultText(items, keyword) {
  const resultText = $("#resultText");

  if (!resultText) return;

  resultText.textContent = keyword
    ? `搜尋「${keyword}」：找到 ${items.length} 筆資料。`
    : `目前共 ${items.length} 筆資料。`;
}

function filterRecords() {
  const searchInput = $("#searchInput");
  const keyword = searchInput ? searchInput.value.trim() : "";
  const key = normalize(keyword);

  const items = !key
    ? records
    : records.filter(item => normalize(item[headers[0]]).includes(key));

  renderTable(items);
  updateResultText(items, keyword);
}

async function init() {
  const resultText = $("#resultText");
  const searchInput = $("#searchInput");
  const clearBtn = $("#clearBtn");

  try {
    if (resultText) {
      resultText.textContent = "資料載入中…";
    }

    await loadSheetData();

    renderTable(records);
    updateResultText(records, "");
  } catch (error) {
    console.error(error);

    records = [];
    renderTable(records);

    if (resultText) {
      resultText.textContent = "資料載入失敗：請確認 Google 試算表已開放『知道連結的使用者可檢視』。";
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", filterRecords);
  }

  if (clearBtn && searchInput) {
    clearBtn.addEventListener("click", () => {
      searchInput.value = "";
      filterRecords();
      searchInput.focus();
    });
  }
}

document.addEventListener("DOMContentLoaded", init);
```
