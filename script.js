const sheetUrl = "YOUR_WEB_APP_URL_HERE"; // 改成你部署的 Apps Script Web App URL

const tbody = document.querySelector("#sheetTable tbody");
const searchInput = document.getElementById("searchInput");

let tableData = [];

// 讀取試算表資料
fetch(sheetUrl)
  .then(response => response.json())
  .then(data => {
    tableData = data.map(row => row.slice(0,5)); // 只取 A-E 欄
    renderTable(tableData);
  })
  .catch(err => console.error("讀取試算表資料失敗：", err));

// 渲染表格
function renderTable(data) {
  tbody.innerHTML = "";
  data.forEach(row => {
    const tr = document.createElement("tr");
    row.forEach(cell => {
      const td = document.createElement("td");
      td.textContent = cell;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

// 即時搜尋功能
searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  const filtered = tableData.filter(row => 
    row.some(cell => cell.toString().toLowerCase().includes(query))
  );
  renderTable(filtered);
});
