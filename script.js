const DEFAULT_TITLE = "番茄的歡茄の金庫";
const DEFAULT_SUBTITLE = "謝謝尼的瓜單跟存鑽呀。";
const SHEET_ID = "10TBRxSI86Ghbx3rUc2SnTQe7iVNnyJ6ycjNAOuiz74Q";
// 若未來試算表有指定 gid，可填在這裡；空白代表讀取預設工作表，與原模板邏輯一致。
const SHEET_GID = "";

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
  if (Number.isFinite(number)) return number;
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

function cellToText(cell) {
  if (!cell) return "";
  if (cell.f !== undefined && cell.f !== null) return String(cell.f).trim();
  if (cell.v !== undefined && cell.v !== null) return String(cell.v).trim();
  return "";
}

function getNextValue(row, startIndex) {
  for (let i = startIndex + 1; i < row.length; i++) {
    const value = String(row[i] ?? "").trim();
    if (value) return value;
  }
  return "";
}

function readSiteSettings(rows) {
  const settings = {};
  rows.forEach((row) => {
    row.forEach((cell, index) => {
      const key = String(cell ?? "").trim();
      if (key === "網站標題" || key === "網站小標題") {
        const value = getNextValue(row, index);
        if (value) settings[key] = value;
      }
    });
  });
  return settings;
}

function applySiteSettings(rows) {
  // 原模板是讀 L/M 欄；這版改成「找到網站標題／網站小標題後，讀右邊第一個值」。
  // 所以放在 K/L、L/M 或之後微調位置，都能跟著試算表變動。
  const settings = readSiteSettings(rows);
  const title = settings["網站標題"] || DEFAULT_TITLE;
  const subtitle = settings["網站小標題"] || DEFAULT_SUBTITLE;

  const siteTitle = $("#siteTitle");
  const siteSubtitle = $("#siteSubtitle");
  if (siteTitle) siteTitle.textContent = title;
  if (siteSubtitle) siteSubtitle.textContent = subtitle;
  document.title = title;

  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute("content", `${title}查詢頁，只呈現 Google 試算表 A～E 欄資料。`);
  }
}

function loadGoogleSheetByJsonp() {
  return new Promise((resolve, reject) => {
    const callbackName = `__tomatoSheetCallback_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Google 試算表讀取逾時"));
    }, 15000);

    function cleanup() {
      window.clearTimeout(timeout);
      delete window[callbackName];
      script.remove();
    }

    window[callbackName] = (response) => {
      cleanup();
      if (!response || response.status === "error") {
        const message = response?.errors?.map((item) => item.detailed_message || item.message).join("；") || "Google 試算表回傳錯誤";
        reject(new Error(message));
        return;
      }
      resolve(response.table);
    };

    const params = new URLSearchParams({
      tqx: `out:json;responseHandler:${callbackName}`,
      tq: "select *",
      headers: "1",
    });
    if (SHEET_GID) params.set("gid", SHEET_GID);

    script.onerror = () => {
      cleanup();
      reject(new Error("無法連線到 Google 試算表"));
    };
    script.src = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?${params.toString()}`;
    document.head.appendChild(script);
  });
}

async function loadSheetData() {
  const table = await loadGoogleSheetByJsonp();
  if (!table || !Array.isArray(table.cols) || !Array.isArray(table.rows)) {
    throw new Error("試算表格式無法解析");
  }

  const allHeaders = table.cols.map((col, index) => String(col.label || `欄位${index + 1}`).trim());
  const rows = table.rows
    .map((row) => allHeaders.map((_, index) => cellToText(row.c?.[index])))
    .filter((row) => row.some((cell) => String(cell).trim() !== ""));

  if (!allHeaders.length || rows.length < 1) {
    throw new Error("試算表沒有可顯示的資料");
  }

  applySiteSettings(rows);

  headers = allHeaders.slice(0, 5).map((h) => String(h || "").trim()).filter(Boolean);
  if (headers.length < 5) {
    headers = ["存鑽老闆", "存鑽數量", "存歌數量", "存爆數量", "總數"];
  }

  records = rows
    .map((row) => {
      const item = {};
      headers.forEach((header, index) => {
        item[header] = index === 0 ? String(row[index] ?? "").trim() : toNumber(row[index]);
      });
      return item;
    })
    .filter((item) => String(item[headers[0]] || "").trim() !== "");
}

function renderTable(items) {
  $("#tableHead").innerHTML = `
    <tr>
      ${headers.map((h, index) => `<th class="${colors[index] || ""}">${escapeHtml(h)}</th>`).join("")}
    </tr>
  `;

  if (!items.length) {
    $("#tableBody").innerHTML = `<tr class="empty-row"><td colspan="${headers.length}">目前沒有符合的資料</td></tr>`;
    return;
  }

  $("#tableBody").innerHTML = items.map((item) => `
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
  resultText.textContent = keyword ? `搜尋「${keyword}」：找到 ${items.length} 筆資料。` : "";
}

function filterRecords() {
  const keyword = $("#searchInput").value.trim();
  const key = normalize(keyword);
  const items = !key ? records : records.filter((item) => normalize(item[headers[0]]).includes(key));
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
    $("#resultText").textContent = "資料載入失敗：請確認 Google 試算表已開放『知道連結的使用者可檢視』，並重新整理頁面。";
  }

  $("#searchInput").addEventListener("input", filterRecords);
  $("#clearBtn").addEventListener("click", () => {
    $("#searchInput").value = "";
    filterRecords();
    $("#searchInput").focus();
  });
}

document.addEventListener("DOMContentLoaded", init);
