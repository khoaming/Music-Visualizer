const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const request = require('request');

const config = require('./config.js'); // API keys

app.use('/', express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

const DEFAULT_WEATHER = "800"; // OpenWeatherMap sunny day code

// Homepage
app.get('*', function (req, res) {
	res.render("index", {weather: DEFAULT_WEATHER});
})

// Homepage with custom zip
app.post('/', function (req, res) {
	var url = "http://api.openweathermap.org/data/2.5/weather?zip=" + req.body.zip + ",us&APPID=" + config.getOWMKey();
	request(url, function(err, response, body) {
		if (err) {
			console.log(err);
			res.render("index", {weather: DEFAULT_WEATHER});
		}
		else {
			var weatherResponse = JSON.parse(body);
			if (weatherResponse.main == undefined)
			{
				res.render("index", {weather: DEFAULT_WEATHER});
			}
			else
			{
				res.render("index", {weather: weatherResponse.main.id});
			}
		}
	})
})

const port = process.env.PORT || 5000;
app.listen(port);
console.log(`Listening on ${port}`);