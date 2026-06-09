const SHEET_ID = "10TBRxSI86Ghbx3rUc2SnTQe7iVNnyJ6ycjNAOuiz74Q";
const SHEET_GID = "0";
const SHEET_LINK = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit?usp=sharing`;
const SHEET_QUERY = "select A,B,C,D,E where A is not null";
const SHEET_DATA_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?gid=${SHEET_GID}&headers=1&tqx=out:json&tq=${encodeURIComponent(SHEET_QUERY)}&cacheBust=${Date.now()}`;

const DEFAULT_HEADERS = ["存鑽老闆", "存鑽數量", "存歌數量", "存爆數量", "總數"];
let headers = [...DEFAULT_HEADERS];
let records = [];
let isLoaded = false;

const colors = ["col-name", "col-diamond", "col-song", "col-bomb", "col-total"];
const metricBgs = {
  "存鑽數量": "#e8f8ff",
  "存歌數量": "#edf2ff",
  "存爆數量": "#fff0f6",
  "總數": "#fff7db"
};

const fmt = new Intl.NumberFormat("zh-Hant-TW");
const $ = (selector) => document.querySelector(selector);

function normalize(text) {
  return String(text ?? "").trim().toLowerCase();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function toNumber(value) {
  if (typeof value === "number") return value;
  const cleaned = String(value ?? "").replace(/,/g, "").trim();
  const number = Number(cleaned);
  return Number.isFinite(number) ? number : 0;
}

function extractGoogleJson(text) {
  const match = text.match(/google\.visualization\.Query\.setResponse\((.*)\);?\s*$/s);
  if (!match) throw new Error("Google Sheets 回傳格式不正確");
  return JSON.parse(match[1]);
}

function getCell(row, index) {
  const cell = row?.c?.[index];
  if (!cell) return "";
  return cell.v ?? cell.f ?? "";
}

async function loadSheetRecords() {
  const response = await fetch(SHEET_DATA_URL, { cache: "no-store" });
  if (!response.ok) throw new Error(`試算表讀取失敗：HTTP ${response.status}`);

  const text = await response.text();
  const json = extractGoogleJson(text);
  const table = json.table;
  if (!table?.cols?.length) throw new Error("試算表沒有可讀取的欄位");

  headers = table.cols.slice(0, 5).map((col, index) => col.label || DEFAULT_HEADERS[index]);
  while (headers.length < 5) headers.push(DEFAULT_HEADERS[headers.length]);

  records = (table.rows || [])
    .map((row) => {
      const item = {};
      headers.forEach((header, index) => {
        const rawValue = getCell(row, index);
        item[header] = index === 0 ? String(rawValue ?? "").trim() : toNumber(rawValue);
      });
      return item;
    })
    .filter((item) => item[headers[0]]);

  isLoaded = true;
}

function renderSummary() {
  const summaryGrid = $("#summaryGrid");
  if (!summaryGrid) return;

  const totals = headers.map((header, index) => {
    if (index === 0) {
      return { label: header, value: records.length, accent: "#bcecff" };
    }
    return {
      label: header,
      value: records.reduce((sum, item) => sum + toNumber(item[header]), 0),
      accent: metricBgs[header] || "#d9f3ff"
    };
  });

  summaryGrid.innerHTML = totals.map(item => `
    <article class="summary-card" style="--accent:${item.accent}">
      <div class="label">${escapeHtml(item.label)}</div>
      <div class="value">${fmt.format(item.value)}</div>
    </article>
  `).join("");
}

function renderTable(items) {
  const tableHead = $("#tableHead");
  const tableBody = $("#tableBody");
  if (!tableHead || !tableBody) return;

  tableHead.innerHTML = `<tr>${headers.map((h, index) => `<th class="${colors[index] || ""}">${escapeHtml(h)}</th>`).join("")}</tr>`;

  if (!items.length) {
    tableBody.innerHTML = `<tr><td colspan="${headers.length}">目前沒有資料。</td></tr>`;
    return;
  }

  tableBody.innerHTML = items.map(item => `
    <tr>
      ${headers.map((h, index) => {
        const value = index === 0 ? escapeHtml(item[h]) : fmt.format(toNumber(item[h]));
        return `<td class="${index === 0 ? 'name-cell' : ''}">${value}</td>`;
      }).join("")}
    </tr>
  `).join("");
}

function renderCards(items) {
  const cardArea = $("#cards");
  if (!cardArea) return;

  if (items.length === 0) {
    cardArea.innerHTML = `<div class="empty-state">${isLoaded ? "查無資料，請確認名字是否與名冊相同。" : "資料載入中…"}</div>`;
    return;
  }

  const limitedItems = items.length > 12 ? items.slice(0, 12) : items;
  cardArea.innerHTML = limitedItems.map(item => `
    <article class="person-card">
      <div class="person-name"><span>${escapeHtml(item[headers[0]])}</span><span>☁️</span></div>
      <div class="metric-grid">
        ${headers.slice(1).map(h => `
          <div class="metric ${h === '總數' ? 'total' : ''}" style="--metric-bg:${metricBgs[h] || "#edf9ff"}">
            <strong>${escapeHtml(h)}</strong>
            <span>${fmt.format(toNumber(item[h]))}</span>
          </div>
        `).join("")}
      </div>
    </article>
  `).join("");
}

function updateResultText(items, keyword) {
  const resultText = $("#resultText");
  if (!resultText) return;

  const text = keyword
    ? `搜尋「${keyword}」：找到 ${items.length} 筆資料。`
    : `目前顯示全部 ${records.length} 筆資料。`;
  resultText.textContent = text;
}

function filterRecords() {
  const searchInput = $("#searchInput");
  const keyword = searchInput ? searchInput.value.trim() : "";
  const key = normalize(keyword);
  const items = !key
    ? records
    : records.filter(item => normalize(item[headers[0]]).includes(key));

  renderCards(items);
  renderTable(items);
  updateResultText(items, keyword);
}

function setLoadingMessage(message) {
  const resultText = $("#resultText");
  if (resultText) resultText.textContent = message;
}

function setSearchDisabled(disabled) {
  const searchInput = $("#searchInput");
  const clearBtn = $("#clearBtn");
  if (searchInput) searchInput.disabled = disabled;
  if (clearBtn) clearBtn.disabled = disabled;
}

async function init() {
  setSearchDisabled(true);
  setLoadingMessage("正在讀取 Google 試算表資料…");
  renderCards([]);
  renderTable([]);

  try {
    await loadSheetRecords();
    renderSummary();
    filterRecords();
  } catch (error) {
    console.error(error);
    isLoaded = true;
    records = [];
    renderSummary();
    renderCards([]);
    renderTable([]);
    setLoadingMessage("試算表讀取失敗，請確認 Google Sheets 權限是否設為『知道連結的任何人可查看』，並重新整理頁面。");
  } finally {
    setSearchDisabled(false);
  }

  $("#searchInput")?.addEventListener("input", filterRecords);
  $("#clearBtn")?.addEventListener("click", () => {
    const searchInput = $("#searchInput");
    if (!searchInput) return;
    searchInput.value = "";
    filterRecords();
    searchInput.focus();
  });
}

document.addEventListener("DOMContentLoaded", init);
