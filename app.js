const SPREADSHEET_ID = "10TBRxSI86Ghbx3rUc2SnTQe7iVNnyJ6ycjNAOuiz74Q";
const SHEET_NAME = "工作表1";

const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?sheet=${encodeURIComponent(SHEET_NAME)}`;

const cardsContainer = document.getElementById("cardsContainer");
const searchInput = document.getElementById("searchInput");
let allData = [];

fetch(url).then(res=>res.text()).then(text=>{
  const jsonText = text.match(/google\.visualization\.Query\.setResponse\(([^)]+)\)/)[1];
  const data = JSON.parse(jsonText).table;
  processData(data);
  createBubbles(40);
});

function processData(data){
  allData = data.rows.map(r=>r.c.slice(0,5).map(c=>c?c.v:""));
  populateCards(allData);
}

function populateCards(data){
  cardsContainer.innerHTML = "";
  data.forEach((row,idx)=>{
    const card = document.createElement("div");
    card.classList.add("card");
    const fields=[idx+1,row[0],row[1],row[2],row[3],row[4]];
    const classes=["indexCol","ownerCol","diamondCol","songCol","bombCol","totalCol"];
    fields.forEach((text,i)=>{
      const d=document.createElement("div");
      d.classList.add(classes[i]);
      d.innerText=text;
      card.appendChild(d);
    });
    cardsContainer.appendChild(card);
  });
}

searchInput.addEventListener("input",()=>{
  const query=searchInput.value.trim().toLowerCase();
  const filtered=allData.filter(r=>r[0].toLowerCase().includes(query));
  populateCards(filtered);
});

function createBubbles(num){
  const container=document.getElementById("floatingBubbles");
  for(let i=0;i<num;i++){
    const bubble=document.createElement("div");
    bubble.classList.add("bubble");
    const size=Math.random()*25+10;
    bubble.style.width=`${size}px`;
    bubble.style.height=`${size}px`;
    bubble.style.left=`${Math.random()*100}%`;
    bubble.style.animationDuration=`${Math.random()*12+6}s`;
    bubble.style.backgroundColor=`rgba(255,255,255,0.5)`;
    container.appendChild(bubble);
  }
}
