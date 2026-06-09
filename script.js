
// 使用 Tabletop.js 或 Google Sheets API 讀取資料
// 注意：需要將試算表設為「任何知道連結的人可檢視」
window.addEventListener('DOMContentLoaded', (event) => {
    var publicSpreadsheetUrl = 'https://docs.google.com/spreadsheets/d/10TBRxSI86Ghbx3rUc2SnTQe7iVNnyJ6ycjNAOuiz74Q/edit?usp=sharing';

    Tabletop.init({
        key: publicSpreadsheetUrl,
        simpleSheet: true,
        callback: showInfo
    });
});

function showInfo(data, tabletop) {
    var tbody = document.querySelector('#dataTable tbody');
    tbody.innerHTML = '';
    data.forEach(function(row) {
        var tr = document.createElement('tr');
        tr.innerHTML = '<td>' + row['存鑽老闆💎'] + '</td>' +
                       '<td>' + row['存鑽數量💎'] + '</td>' +
                       '<td>' + row['存歌數量🎵'] + '</td>' +
                       '<td>' + row['存爆數量🎵'] + '</td>' +
                       '<td>' + row['總數'] + '</td>';
        tbody.appendChild(tr);
    });
}
