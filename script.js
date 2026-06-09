
fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vQVl9ZQoS6eJxWROm3rhTzC3u4xYwUqXrVb0YuN_pgnVwA0yP2J5g5hT5X8M1nT2K/pub?output=csv')
.then(response => response.text())
.then(csvText => {
    const rows = csvText.split('\n').slice(1); // 去掉標題列
    const tbody = document.querySelector('#dataTable tbody');
    tbody.innerHTML = '';
    rows.forEach(row => {
        const cols = row.split(',');
        if (cols.length >= 5) {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${cols[0]}</td><td>${cols[1]}</td><td>${cols[2]}</td><td>${cols[3]}</td><td>${cols[4]}</td>`;
            tbody.appendChild(tr);
        }
    });
});
