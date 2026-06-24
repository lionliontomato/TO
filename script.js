// tomato vault fixed root 20260624c
const DEFAULT_TITLE = "番茄的歡茄の金庫";
const DEFAULT_SUBTITLE = "謝謝尼的瓜單跟存鑽呀。";
const SHEET_ID = "10TBRxSI86Ghbx3rUc2SnTQe7iVNnyJ6ycjNAOuiz74Q";
const SHEET_NAME = "外部";

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
  return String(value ?? "").trim();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function cellValue(cell) {
  if (!cell) return "";
  if (cell.f !== undefined && cell.f !== null) return cell.f;
  if (cell.v !== undefined && cell.v !== null) return cell.v;
  return "";
}

function createGvizUrl({ sheetName, callbackName }) {
  const url = new URL(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq`);
  url.searchParams.set("headers", "1");
  url.searchParams.set("tq", "select *");
  url.searchParams.set("tqx", `out:json;responseHandler:${callbackName}`);
  if (sheetName) url.searchParams.set("sheet", sheetName);
  return url.toString();
}

function loadGvizJsonp(sheetName) {
  return new Promise((resolve, reject) => {
    const callbackName = `__tomatoSheetCallback_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const script = document.createElement("script");
    let finished = false;

    window.google = window.google || {};
    window.google.visualization = window.google.visualization || {};
    window.google.visualization.Query = window.google.visualization.Query || {};
    const oldSetResponse = window.google.visualization.Query.setResponse;

    function cleanup() {
      finished = true;
      delete window[callbackName];
      if (oldSetResponse) {
        window.google.visualization.Query.setResponse = oldSetResponse;
      } else {
        delete window.google.visualization.Query.setResponse;
      }
      script.remove();
    }

    function handleResponse(data) {
      if (finished) return;
      cleanup();
      resolve(data);
    }

    window[callbackName] = handleResponse;
    // 如果 Google 沒有吃到自訂 callback，預設會呼叫 google.visualization.Query.setResponse。
    window.google.visualization.Query.setResponse = handleResponse;

    script.src = createGvizUrl({ sheetName, callbackName });
    script.async = true;
    script.onerror = () => {
      if (finished) return;
      cleanup();
      reject(new Error("無法連線到 Google 試算表"));
    };

    const timeout = window.setTimeout(() => {
      if (finished) return;
      cleanup();
      reject(new Error("Google 試算表回應逾時"));
    }, 12000);

    const originalResolve = resolve;
    resolve = (data) => {
      window.clearTimeout(timeout);
      originalResolve(data);
    };

    document.head.appendChild(script);
  });
}

async function fetchSheetTable() {
  const attempts = [SHEET_NAME, ""];
  let lastError = null;

  for (const sheetName of attempts) {
    try {
      const data = await loadGvizJsonp(sheetName);
      if (data.status && data.status !== "ok") {
        throw new Error(data.errors?.[0]?.detailed_message || data.errors?.[0]?.reason || "Google 試算表讀取失敗");
      }
      if (!data.table || !Array.isArray(data.table.rows)) {
        throw new Error("Google 試算表沒有回傳資料表");
      }
      return data.table;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Google 試算表讀取失敗");
}

function tableToRows(table) {
  const columnCount = table.cols?.length || 0;
  const headerRow = (table.cols || []).map((col) => String(col.label || "").trim());
  const bodyRows = (table.rows || []).map((row) => {
    const cells = row.c || [];
    return Array.from({ length: columnCount }, (_, index) => cellValue(cells[index]));
  });

  // 有些試算表會把第一列當資料列回傳；這裡保留防呆。
  const firstBodyRow = bodyRows[0] || [];
  const firstHeader = normalize(headerRow[0]);
  const firstBodyCell = normalize(firstBodyRow[0]);
  if ((!firstHeader || firstHeader.startsWith("col")) && firstBodyCell === "存鑽老闆") {
    return {
      headers: firstBodyRow.map((value) => String(value || "").trim()),
      rows: bodyRows.slice(1),
      allRows: [firstBodyRow, ...bodyRows.slice(1)],
    };
  }

  return {
    headers: headerRow,
    rows: bodyRows,
    allRows: [headerRow, ...bodyRows],
  };
}

function findSetting(allRows, labels) {
  const wanted = labels.map(normalize);

  for (const row of allRows) {
    for (let index = 0; index < row.length; index++) {
      const current = normalize(row[index]);
      if (!wanted.includes(current)) continue;

      // 原模板是「設定名稱在左、設定內容在右」，所以讀取右邊第一個有內容的儲存格。
      for (let next = index + 1; next < row.length; next++) {
        const value = String(row[next] ?? "").trim();
        if (value) return value;
      }
    }
  }

  return "";
}

function applySiteSettings(allRows) {
  const title = findSetting(allRows, ["網站標題", "標題", "site title"]) || DEFAULT_TITLE;
  const subtitle = findSetting(allRows, ["網站小標題", "小標題", "副標題", "site subtitle"]) || DEFAULT_SUBTITLE;

  const siteTitle = $("#siteTitle");
  const siteSubtitle = $("#siteSubtitle");
  const footerTitle = $("#footerTitle");
  const metaDescription = document.querySelector('meta[name="description"]');

  if (siteTitle) siteTitle.textContent = title;
  if (siteSubtitle) siteSubtitle.textContent = subtitle;
  if (footerTitle) footerTitle.textContent = title;
  if (metaDescription) metaDescription.setAttribute("content", `${title}｜${subtitle}`);
  document.title = title;
}

async function loadSheetData() {
  const table = await fetchSheetTable();
  const parsed = tableToRows(table);
  if (!parsed.rows.length) throw new Error("試算表沒有可顯示的資料");

  applySiteSettings(parsed.allRows);

  headers = parsed.headers.slice(0, 5).map((h) => String(h || "").trim()).filter(Boolean);
  if (headers.length < 5) {
    headers = ["存鑽老闆", "存鑽數量", "存歌數量", "存爆數量", "總數"];
  }

  records = parsed.rows
    .map((row) => {
      const item = {};
      headers.forEach((header, index) => {
        const value = row[index];
        item[header] = index === 0 ? String(value ?? "").trim() : toNumber(value);
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
    $("#resultText").textContent = "資料載入失敗：請確認 Google 試算表已開放『知道連結的使用者可檢視』，或稍後重新整理。";
  }

  $("#searchInput").addEventListener("input", filterRecords);
  $("#clearBtn").addEventListener("click", () => {
    $("#searchInput").value = "";
    filterRecords();
    $("#searchInput").focus();
  });
}

document.addEventListener("DOMContentLoaded", init);
