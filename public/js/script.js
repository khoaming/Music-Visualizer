var CLIENT_ID       = "188bdc288184c969c82a24af4145c999";

// OpenWeatherMap codes: https://www.openweathermap.org/weather-conditions
const THUNDERSTORM = 2;
const DRIZZLE = 3;
const RAIN = 5;

var streamUrl, song;
var particles = [];
var samples = [];
var drops = [];
var birds = [];
var speed = 0;
var rainbow = 0;
var vizNum = 0;
var r, g, b, t;
var isWavesOn = true;
var isCirclesOn = true;
var isRainOn = true;

// Set up canvas
function setup() {
    createCanvas(windowWidth, windowHeight - 50);
    setFrameRate(60);
    fft = new p5.FFT();
    for (var i = 0; i < 500; i++) {
        drops[i] = new Drop();
    }
    for(var i = 0; i < 20; ++i) {
        birds[i] = new Bird(random(0.01, 1), random(5, 20));
    }
}

// Draw content
function draw() {
    var timing = millis() % 20000;
    if(timing < 50) ++vizNum;
    switch(vizNum % 3) {
        case 0: colorMode(RGB);
                background(0);
                r = 255;
                g = 255;
                b = 255;
                if (isCirclesOn) drawBlobs();
                drawForeground();
                break;
        case 1: colorMode(RGB);
                background(255,20,147);
                r = 255;
                g = 255;
                b = 255;
                t = 100;
                //drawRain();
                drawBirds();
                drawForeground();
                break;
        default: background(255);
                 if (!(speed % 10)) {
                     rainbow++;
                     rainbow = rainbow % 360;
                     speed = 0;
                 }
                 speed++;
                 if (song && isWavesOn) drawBackground();
                 r = 0;
                 g = 0;
                 b = 0;
                 drawForeground();
    }
    if (isRainOn) {
        var weatherType = Math.floor(weather / 100);
        if (weatherType == THUNDERSTORM || weatherType == DRIZZLE || weatherType == RAIN)
        {
            drawRain();
        }
    }
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

// Draw background
function drawBackground() {
    noFill();
    var spectrum = fft.analyze();
    var foregroundRadius = 295;
    samples = fft.waveform();
    var bufLen = samples.length;

    colorMode(HSB);
    var c = color(rainbow, 100, 100);

    // divide the wave into n number of colors
    var partition = 20;
    rainbow -= partition;
    rainbow = rainbow % 360;
    var half = parseInt(partition / 2);

    // draw thick waves
    var div1 = parseInt(bufLen / partition) - parseInt(foregroundRadius / partition);
    var div2 = parseInt(bufLen / partition) + parseInt(foregroundRadius / partition);
    for (var i = 0; i < half; i++) {
        rainbow++;
        c = color((rainbow%360), 100, 100);
        drawWave(spectrum, bufLen, c, i * div1, (i + 1) * div1, 4);
    }
    for (var i = half; i < partition; i++) {
        rainbow++;
        c = color((rainbow%360), 100, 100);
        drawWave(spectrum, bufLen, c, i * div2, (i + 1) * div2, 4);
    }

    // thin waves
    drawWave(spectrum, parseInt(bufLen / 4), c, 0, parseInt(bufLen / 8) - parseInt(foregroundRadius / 8), 2);
    drawWave(spectrum, parseInt(bufLen / 4), c, parseInt(bufLen / 8) + parseInt(foregroundRadius / 8), bufLen, 2);
}

// Description: Draws background waves
// Input: spectrum - frequency spectrum; xMap - width to map spectrum data to; c - color;
//        start - start position; end - end position; w - line width
function drawWave(spectrum, xMap, c, start, end, w) {
    strokeWeight(w);
    stroke(c, 100, 50);
    beginShape();
    for (var i = start; i < end; i+=4){
        var x = map(i, 0, xMap, 0, width);
        var y = map(samples[i], -1, 1, -height/16, height/16);
        vertex(x, y + height/2);
    }
    endShape();

}

function drawForeground() {
    noFill();
    strokeWeight(1);
    stroke(r, g, b);
    var spectrum = fft.analyze();

    var jump = ((2 * PI) / (spectrum.length/16)) / 3;


    for (var i = 0; i< 20; ++i) {
        var x = width/2;
        var y = height/2;
        var rad = random(190, 220);

        for(var j = 0; j < spectrum.length; j+=16) {
            var m = map(j, 0, spectrum.length, 0, 2 * PI);
            var multiplier = map(spectrum[j], 0, 500, 0, 120);
            if(j!=0)multiplier = multiplier / (spectrum.length + 1 - (spectrum.length - j/64));
            var x1 = x + rad * cos(m);
            var y1 = y + rad * sin(m);
            var x2 = x + rad * cos(m - jump * multiplier);
            var y2 = y + rad * sin(m - jump * multiplier);
            var x3 = x + rad * cos(m + jump * 2 * multiplier);
            var y3 = y + rad * sin(m + jump * 2 * multiplier);
            var x4 = x + rad * cos(m + jump * 3);
            var y4 = y + rad * sin(m + jump * 3);
            bezier(x1, y1, x2, y2, x3, y3, x4, y4);
        }

    }
}

function newBlob() {
    particles.push(new Particle(random(0, width), random(0, height)));
}

function deleteBlob() {
    particles = [];
}

function drawBlobs() {
    strokeWeight(1);
    for (var i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].show(r, g, b);
    }
    var addPart = millis() % 1000;
    var deletePart = millis() % 10000;
    if(addPart < 50) newBlob();
    if(deletePart < 100) deleteBlob();
}

function drawRain() {
    for (var i = 0; i < drops.length; i++) {
    drops[i].fall();
    drops[i].show(r, g, b, t);
  }
}

function toggleWaves() {
    var checkBox = document.getElementById("waves");

    if (checkBox.checked == true){
        isWavesOn = true;
    } else {
        isWavesOn = false;
    }
}

function toggleBlobs() {
    var checkBox = document.getElementById("blobs");

    if (checkBox.checked == true){
        isCirclesOn = true;
    } else {
        isCirclesOn = false;
    }
}

function toggleRain() {
    var checkBox = document.getElementById("rain");

    if (checkBox.checked == true){
        isRainOn = true;
    } else {
        isRainOn = false;
    }
}

function drawBirds() {
    for(var i = 0; i < 20; ++i) {
        birds[i].update();
        birds[i].display();
    }
}

function Bird(accel, top) {
  this.location = createVector(random(width), random(height));
  this.velocity = createVector(0, 0);
  this.topspeed = top;
  this.accel = accel;
}

Bird.prototype.update = function() {
  var acceleration = createVector(mouseX - this.location.x, mouseY - this.location.y);
  acceleration.normalize();
  acceleration.mult(this.accel);
  this.velocity.add(acceleration);
  this.velocity.limit(this.topspeed);
  this.location.add(this.velocity);
}

Bird.prototype.display = function() {
  stroke(255);
  strokeWeight(1);
  noFill()
  for(var i = 0; i < 5; ++i) {
    ellipse(this.location.x, this.location.y, random(30, 50), random(30, 50));
  }
  triangle(this.location.x, this.location.y,
            this.location.x+30, this.location.y-10,
            this.location.x-40, this.location.y+30)
}
