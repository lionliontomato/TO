const SPREADSHEET_ID = "10TBRxSI86Ghbx3rUc2SnTQe7iVNnyJ6ycjNAOuiz74Q";
const SHEET_NAME = "工作表1";
const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?sheet=${encodeURIComponent(SHEET_NAME)}`;

const cardsContainer=document.getElementById("cardsContainer");
const searchInput=document.getElementById("searchInput");
let allData=[];

fetch(url).then(res=>res.text()).then(text=>{
  const jsonText=text.match(/google\.visualization\.Query\.setResponse\(([^)]+)\)/)[1];
  const data=JSON.parse(jsonText).table;
  processData(data);
  createBubbles(50);
});

function processData(data){
  allData=data.rows.map(r=>r.c.slice(0,5).map(c=>c?c.v:""));
  populateCards(allData);
}

function populateCards(data){
  cardsContainer.innerHTML="";
  data.forEach((row,idx)=>{
    const card=document.createElement("div");
    card.classList.add("card");

    // 序號
    const idxDiv=document.createElement("div");
    idxDiv.classList.add("indexNum");
    idxDiv.innerText=idx+1;
    card.appendChild(idxDiv);

    // 欄位標題 + 數值
    const labels=["存鑽老闆","存鑽數量","存歌數量","存爆數量","總數"];
    const classes=["ownerCol","diamondCol","songCol","bombCol","totalCol"];
    for(let i=0;i<5;i++){
      const t=document.createElement("div");
      t.classList.add("card-title");
      t.innerText=labels[i];
      card.appendChild(t);

      const v=document.createElement("div");
      v.classList.add(classes[i]);
      v.innerText=row[i];
      card.appendChild(v);
    }

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
    const size=Math.random()*30+10;
    bubble.style.width=`${size}px`;
    bubble.style.height=`${size}px`;
    bubble.style.left=`${Math.random()*100}%`;
    bubble.style.animationDuration=`${Math.random()*12+6}s`;
    bubble.style.backgroundColor=`rgba(255,255,255,0.5)`;
    container.appendChild(bubble);
  }
}
