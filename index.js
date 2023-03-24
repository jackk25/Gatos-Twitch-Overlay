const express = require('express');
const app = express();
const fs = require('fs');
var path = require('path')
const port = 3000;

app.use('/public', express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
    res.send(fs.readFileSync('index.html', 'utf8'));
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});