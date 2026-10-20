const http = require('http');
const fs = require('fs');

http.get('http://localhost:8081/api/analytics/dashboard?userId=69984d44b1d5cd747187bfc9&months=6&year=2026', (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        fs.writeFileSync('api_out.json', JSON.stringify(JSON.parse(data), null, 2), 'utf-8');
    });
}).on("error", (err) => {
    console.log("Error: " + err.message);
});
