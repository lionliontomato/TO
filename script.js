const SHEET_ID = "10TBRxSI86Ghbx3rUc2SnTQe7iVNnyJ6ycjNAOuiz74Q";
const SHEET_GID = "0";

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

function gvizTableToRows(table) {
  if (!table || !Array.isArray(table.rows)) return [];

  const colCount = Math.max(
    13, // 保留到 M 欄，才能讀取 L/M 欄網站設定
    Array.isArray(table.cols) ? table.cols.length : 0,
    ...table.rows.map(row => Array.isArray(row.c) ? row.c.length : 0)
  );

  return table.rows
    .map(row => {
      const cells = Array.isArray(row.c) ? row.c : [];
      return Array.from({ length: colCount }, (_, index) => {
        const cell = cells[index];
        if (!cell) return "";
        return cell.f ?? cell.v ?? "";
      });
    })
    .filter(row => row.some(cell => String(cell).trim() !== ""));
}

function normalizeSettingKey(value) {
  return String(value ?? "")
    .replace(/[：:]/g, "")
    .replace(/\s+/g, "")
    .trim();
}

function addSetting(settings, key, value) {
  const normalizedKey = normalizeSettingKey(key);
  const normalizedValue = String(value ?? "").trim();
  if (!normalizedKey || !normalizedValue) return;

  if (normalizedKey.includes("網站標題")) settings["網站標題"] = normalizedValue;
  if (normalizedKey.includes("網站小標題")) settings["網站小標題"] = normalizedValue;
}

function applySiteSettings(rows) {
  const settings = {};

  rows.forEach(row => {
    const lKey = String(row[11] ?? "").trim();   // L 欄
    const mValue = String(row[12] ?? "").trim(); // M 欄

    // 原版規則：L 欄放設定名稱，M 欄放設定值
    addSetting(settings, lKey, mValue);

    // 容錯：若 L 欄寫成「網站標題：歡茄の金庫」也能讀取
    const lInlineMatch = lKey.match(/^(網站標題|網站小標題)\s*[：:]\s*(.+)$/);
    if (lInlineMatch) addSetting(settings, lInlineMatch[1], lInlineMatch[2]);

    // 容錯：整列掃描相鄰欄位，避免因試算表前方多一欄造成 L/M 偏移
    row.forEach((cell, index) => {
      const current = String(cell ?? "").trim();
      const next = String(row[index + 1] ?? "").trim();
      addSetting(settings, current, next);

      const inlineMatch = current.match(/^(網站標題|網站小標題)\s*[：:]\s*(.+)$/);
      if (inlineMatch) addSetting(settings, inlineMatch[1], inlineMatch[2]);
    });
  });

  const title = settings["網站標題"] || "歡茄の金庫";
  const subtitle = settings["網站小標題"] || "多吃番茄身體好。";

  const siteTitle = $("#siteTitle");
  const siteSubtitle = $("#siteSubtitle");

  if (siteTitle) siteTitle.textContent = title;
  if (siteSubtitle) siteSubtitle.textContent = subtitle;

  document.title = title;
}

function loadRowsByJsonp() {
  return new Promise((resolve, reject) => {
    const callbackName = `__huanqieSheet_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Google 試算表 JSONP 讀取逾時"));
    }, 15000);

    function cleanup() {
      window.clearTimeout(timeout);
      delete window[callbackName];
      if (script.parentNode) script.parentNode.removeChild(script);
    }

    window[callbackName] = (response) => {
      cleanup();

      if (!response || response.status === "error") {
        const message = response?.errors?.[0]?.detailed_message || response?.errors?.[0]?.message || "Google 試算表回傳錯誤";
        reject(new Error(message));
        return;
      }

      const rows = gvizTableToRows(response.table);
      if (!rows.length) {
        reject(new Error("試算表沒有可顯示的資料"));
        return;
      }

      resolve(rows);
    };

    const query = encodeURIComponent("select *");
    const cacheBust = Date.now();

    // 使用 JSONP，避免瀏覽器 CORS 導致「載入失敗」。headers=0 可保留第一列當表頭，規則比照原版。
    script.src = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?gid=${SHEET_GID}&headers=0&tq=${query}&tqx=out:json;responseHandler:${callbackName}&_=${cacheBust}`;
    script.onerror = () => {
      cleanup();
      reject(new Error("無法載入 Google 試算表 JSONP"));
    };

    document.body.appendChild(script);
  });
}

async function loadRowsByCsv() {
  const cacheBust = Date.now();
  const urls = [
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?gid=${SHEET_GID}&headers=0&tqx=out:csv&_=${cacheBust}`,
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}&_=${cacheBust}`
  ];

  let lastError = null;

  for (const url of urls) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      const rows = parseCSV(text);
      if (rows.length) return rows;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("CSV 讀取失敗");
}

async function loadSheetRows() {
  try {
    return await loadRowsByJsonp();
  } catch (jsonpError) {
    console.warn("JSONP 讀取失敗，改用 CSV 備援。", jsonpError);
    return await loadRowsByCsv();
  }
}

async function loadSheetData() {
  const rows = await loadSheetRows();

  if (rows.length < 2) throw new Error("試算表沒有可顯示的資料");

  applySiteSettings(rows);

  headers = rows[0].slice(0, 5).map(h => String(h || "").trim());
  if (headers.some(header => header === "")) {
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
  $("#tableHead").innerHTML = `
    <tr>
      ${headers.map((h, index) => `<th class="${colors[index] || ""}">${escapeHtml(h)}</th>`).join("")}
    </tr>
  `;

  if (!items.length) {
    $("#tableBody").innerHTML = `
      <tr>
        <td colspan="${headers.length}" class="empty-cell">目前沒有符合條件的資料</td>
      </tr>
    `;
    return;
  }

  $("#tableBody").innerHTML = items.map(item => `
    <tr>
      ${headers.map((h, index) => {
        const value = index === 0
          ? escapeHtml(item[h])
          : typeof item[h] === "number"
            ? fmt.format(item[h])
            : escapeHtml(item[h]);
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
    : "";
}

function filterRecords() {
  const keyword = $("#searchInput").value.trim();
  const key = normalize(keyword);

  const items = !key
    ? records
    : records.filter(item => normalize(item[headers[0]]).includes(key));

  renderTable(items);
  updateResultText(items, keyword);
}

async function init() {
  try {
    $("#resultText").textContent = "資料載入中…";
    await loadSheetData();
    renderTable(records);
    updateResultText(records, "");
  } catch (error) {
    console.error(error);
    records = [];
    renderTable(records);
    $("#resultText").textContent = "資料載入失敗：請確認 Google 試算表已開放『知道連結的使用者可檢視』，並確認第一個工作表有 A～E 欄資料與 L/M 欄網站設定。";
  }

  $("#searchInput").addEventListener("input", filterRecords);
  $("#clearBtn").addEventListener("click", () => {
    $("#searchInput").value = "";
    filterRecords();
    $("#searchInput").focus();
  });
}

document.addEventListener("DOMContentLoaded", init);
