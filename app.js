const SPREADSHEET_ID = "10TBRxSI86Ghbx3rUc2SnTQe7iVNnyJ6ycjNAOuiz74Q";
const SHEET_NAME = "工作表1";

const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?sheet=${encodeURIComponent(SHEET_NAME)}`;

const cardsContainer = document.getElementById("cardsContainer");
const searchInput = document.getElementById("searchInput");

let allData = [];

// 抓試算表資料
fetch(url)
  .then(res => res.text())
  .then(text => {
    const jsonText = text.match(/google\.visualization\.Query\.setResponse\(([^)]+)\)/)[1];
    const data = JSON.parse(jsonText).table;
    processData(data);
  });

function processData(data) {
  // 只取 A~E 欄 (0~4)
  allData = data.rows.map(r => r.c.slice(0,5).map(c => (c ? c.v : "")));
  populateCards(allData);
}

function populateCards(data) {
  cardsContainer.innerHTML = "";
  data.forEach((row, idx) => {
    const card = document.createElement("div");
    card.classList.add("card");
    const indexDiv = document.createElement("div");
    indexDiv.classList.add("index");
    indexDiv.innerText = idx + 1;
    card.appendChild(indexDiv);

    row.forEach(cell => {
      const div = document.createElement("div");
      div.innerText = cell;
      card.appendChild(div);
    });
    cardsContainer.appendChild(card);
  });
}

// 搜尋功能
searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = allData.filter(row => row[0].toLowerCase().includes(query));
  populateCards(filtered);
});
