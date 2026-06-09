const SHEET_ID = "10TBRxSI86Ghbx3rUc2SnTQe7iVNnyJ6ycjNAOuiz74Q";
const SHEET_GID = "0";
const SHEET_QUERY = "select A,B,C,D,E where A is not null";
const SHEET_DATA_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?gid=${SHEET_GID}&headers=1&tqx=out:json&tq=${encodeURIComponent(SHEET_QUERY)}&cacheBust=${Date.now()}`;

const DEFAULT_HEADERS = ["存鑽老闆", "存鑽數量", "存歌數量", "存爆數量", "總數"];
let headers = [...DEFAULT_HEADERS];
let records = [];
let isLoaded = false;

const metricBgs = {
  "存鑽數量":"#e8f8ff",
  "存歌數量":"#edf2ff",
  "存爆數量":"#fff0f6",
  "總數":"#fff7db"
};

const fmt = new Intl.NumberFormat("zh-Hant-TW");
const $ = (selector) => document.querySelector(selector);

function normalize(text){return String(text??"").trim().toLowerCase();}
function escapeHtml(value){return String(value??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");}
function toNumber(value){if(typeof value==="number") return value; const cleaned=String(value??"").replace(/,/g,"").trim(); const number=Number(cleaned); return Number.isFinite(number)?number:0;}

function extractGoogleJson(text){
  const match=text.match(/google\.visualization\.Query\.setResponse\((.*)\);?\s*$/s);
  if(!match) throw new Error("Google Sheets 回傳格式不正確");
  return JSON.parse(match[1]);
}

function getCell(row,index){const cell=row?.c?.[index]; if(!cell) return ""; return cell.v??cell.f??"";}

async function loadSheetRecords(){
  const response=await fetch(SHEET_DATA_URL,{cache:"no-store"});
  if(!response.ok) throw new Error(`試算表讀取失敗：HTTP ${response.status}`);
  const text=await response.text();
  const json=extractGoogleJson(text);
  const table=json.table;
  headers=table.cols.slice(0,5).map((col,index)=>col.label||DEFAULT_HEADERS[index]);
  while(headers.length<5) headers.push(DEFAULT_HEADERS[headers.length]);
  records=(table.rows||[]).map(row=>{const item={}; headers.forEach((h,i)=>{const val=getCell(row,i); item[h]=i===0?String(val??"").trim():toNumber(val);}); return item;}).filter(i=>i[headers[0]]);
  isLoaded=true;
}

function renderSummary(){
  const summaryGrid=$("#summaryGrid"); if(!summaryGrid) return;
  const totals=headers.map((h,i)=>i===0?{label:h,value:records.length,accent:"#bcecff"}:{label:h,value:records.reduce((sum,item)=>sum+toNumber(item[h]),0),accent:metricBgs[h]||"#d9f3ff"});
  summaryGrid.innerHTML=totals.map(item=>`<article class="summary-card" style="--accent:${item.accent}"><div class="label">${escapeHtml(item.label)}</div><div class="value">${fmt.format(item.value)}</div></article>`).join("");
}

function renderTable(items){
  const tableHead=$("#tableHead"); const tableBody=$("#tableBody"); if(!tableHead||!tableBody) return;
  tableHead.innerHTML=`<tr>${headers.map((h,i)=>`<th class="col-${i}">${escapeHtml(h)}</th>`).join("")}</tr>`;
  if(!items.length){tableBody.innerHTML=`<tr><td colspan="${headers.length}">目前沒有資料。</td></tr>`; return;}
  tableBody.innerHTML=items.map(item=>`<tr>${headers.map((h,i)=>`<td class="${i===0?'name-cell':''}">${i===0?escapeHtml(item[h]):fmt.format(toNumber(item[h]))}</td>`).join("")}</tr>`).join("");
}

function filterRecords(){
  const key=normalize($("#searchInput")?.value??"");
  const items=!key?records:records.filter(i=>normalize(i[headers[0]]).includes(key));
  renderTable(items);
  $("#resultText").textContent=key?`搜尋「${$("#searchInput").value}」：找到 ${items.length} 筆資料。`:`目前顯示全部 ${records.length} 筆資料。`;
}

function setSearchDisabled(disabled){const inp=$("#searchInput"); const btn=$("#clearBtn"); if(inp) inp.disabled=disabled; if(btn) btn.disabled=disabled;}

async function init(){
  setSearchDisabled(true);
  $("#resultText").textContent="正在讀取 Google 試算表資料…";
  renderTable([]);
  try{await loadSheetRecords(); renderSummary(); filterRecords();} 
  catch(e){console.error(e); records=[]; renderSummary(); renderTable([]); $("#resultText").textContent="試算表讀取失敗，請確認 Google Sheets 權限是否設為『知道連結的任何人可查看』，並重新整理頁面。";}
  finally{setSearchDisabled(false);}
  $("#searchInput")?.addEventListener("input",filterRecords);
  $("#clearBtn")?.addEventListener("click",()=>{const inp=$("#searchInput"); if(!inp) return; inp.value=""; filterRecords(); inp.focus();});
}

document.addEventListener("DOMContentLoaded",init);
