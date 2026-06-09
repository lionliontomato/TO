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
    createBubbles(30);
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

// 漂浮氣泡效果
function createBubbles(num) {
  const container = document.getElementById("floatingBubbles");
  for(let i=0;i<num;i++){
    const bubble = document.createElement("div");
    bubble.classList.add("bubble");
    const size = Math.random() * 20 + 10;
    bubble.style.width = size + "px";
    bubble.style.height = size + "px";
    bubble.style.left = Math.random() * 100 + "%";
    bubble.style.animationDuration = (Math.random()*10 + 5) + "s";
    bubble.style.backgroundColor = "rgba(255,255,255,0.5)";
    container.appendChild(bubble);
  }
}
