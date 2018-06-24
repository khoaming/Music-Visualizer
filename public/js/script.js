var CLIENT_ID       = "188bdc288184c969c82a24af4145c999";
var streamUrl, song;

// Set up canvas
function setup() {
    createCanvas(windowWidth, windowHeight - 50);
    setFrameRate(60);
    fft = new p5.FFT();
}

// Draw content
function draw() {
    background(255);
    drawForeground();
}

// Resize canvas with window
window.addEventListener('resize', function(event) {
    resizeCanvas(windowWidth, windowHeight - 50);
});

function loaded(track) {
    streamUrl = track.stream_url + '?client_id=' + CLIENT_ID;
    song = loadSound(streamUrl, function() {
    	song.play();
    	$("#loading-modal").css("display", "none");
    });
}

function loadTrack() {
    if (song) {
        song.stop();
    }

	// show loading gif
    $("#loading-modal").css("display", "block");
    SC.initialize({client_id: CLIENT_ID});

    var trackUrl = document.getElementById("trackInput").value;
    SC.resolve(trackUrl).then(loaded).catch(function(error) {
        console.log(error);
        $("#loading-modal").css("display", "none");
        if (error.status === 403) alert("Error: " + "The owner of this track doesn't allow 3rd party streaming. Try another track!");
        if (error.status === 404) alert("Error: " + "Invalid URL! Try another SoundCloud URL!");
    });
}

function drawForeground() {
  noFill();
  stroke(0);
  var spectrum = fft.analyze();

  var jump = ((2 * PI) / (spectrum.length/16)) / 3;


  for (var i = 0; i< 20; ++i) {
    var y = height/2;
    var r = random(190, 220);
    var x = width/2;

    for(var j = 0; j < spectrum.length; j+=16) {
      var m = map(j, 0, spectrum.length, 0, 2 * PI);
      var multiplier = map(spectrum[j], 0, 500, 0, 120);
      if(j!=0)multiplier = multiplier / (spectrum.length + 1 - (spectrum.length - j/64));
      var x1 = x + r * cos(m);
      var y1 = y + r * sin(m);
      var x2 = x + r * cos(m - jump * multiplier);
      var y2 = y + r * sin(m - jump * multiplier);
      var x3 = x + r * cos(m + jump * 2 * multiplier);
      var y3 = y + r * sin(m + jump * 2 * multiplier);
      var x4 = x + r * cos(m + jump * 3);
      var y4 = y + r * sin(m + jump * 3);
      bezier(x1, y1, x2, y2, x3, y3, x4, y4);
    }

  }
}
