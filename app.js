const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use('/', express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

// Homepage
app.get('*', function (req, res) {
	res.render("index");
})

const port = process.env.PORT || 5000;
app.listen(port);
console.log(`Listening on ${port}`);