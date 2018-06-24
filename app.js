const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const request = require('request');

const config = require('./config.js'); // API keys

app.use('/', express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

const DEFAULT_WEATHER = "800"; // OpenWeatherMap code for sunny and clear
const DEFAULT_TIME = "day";

// Homepage
app.get('*', function (req, res) {
	res.render("index", 
		{weather: DEFAULT_WEATHER, 
			time: DEFAULT_TIME});
})

// Homepage with weather by zip code
app.post('/', function (req, res) {
	// Call OpenWeatherMap API to get current weather
	var weatherParams = "zip=" + req.body.zip 
						+ ",us&APPID=" + config.getOWMKey();
	var weatherURL = "http://api.openweathermap.org/data/2.5/weather?" + weatherParams;
	request(weatherURL, function(err, response, body) {
		if (err) {
			console.log(err);
			res.render("index",
				{weather: DEFAULT_WEATHER, 
					time: DEFAULT_TIME});
		}
		else {
			var weatherResponse = JSON.parse(body);
			if (weatherResponse.main == undefined)
			{
				res.render("index",
					{weather: DEFAULT_WEATHER,
						time: DEFAULT_TIME});
			}
			else
			{
				var time;
				if (weatherResponse.dt < weatherResponse.sys.sunrise ||
					weatherResponse.dt > weatherResponse.sys.sunset)
				{
					time = "night";
				}
				else
				{
					time = "day";
				}

				res.render("index", 
					{weather: weatherResponse.weather[0].id, 
						time: time});
			}
		}
	})
})

const port = process.env.PORT || 5000;
app.listen(port);
console.log(`Listening on ${port}`);