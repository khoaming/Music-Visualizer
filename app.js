const express = require('express');
const app = express();
app.use('/', express.static('public'));

// Homepage
app.get('*', function (req, res) {
	res.sendFile("index.html");
})

const port = process.env.PORT || 5000;
app.listen(port);
console.log(`Listening on ${port}`);