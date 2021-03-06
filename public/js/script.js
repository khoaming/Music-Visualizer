var CLIENT_ID       = "188bdc288184c969c82a24af4145c999";

// OpenWeatherMap codes: https://www.openweathermap.org/weather-conditions
const THUNDERSTORM = 2;
const DRIZZLE = 3;
const RAIN = 5;

// Color variables, assigned in setup()
var WHITE;
var BLACK;
var PINK;

var mic;
var streamUrl, song;
var particles = [];
var samples = [];
var drops = [];
var birds = [];
var speed = 0;
var rainbow = 0;
var vizNum = 0;
var drawColor;
var isWavesOn = true;
var isCirclesOn = true;
var isRainOn = true;
var incViz = true;

// Set up canvas
function setup() {
    createCanvas(windowWidth, windowHeight);
    setFrameRate(30);
    fft = new p5.FFT();
    toggleMic();
    for (var i = 0; i < 500; i++) {
        drops[i] = new Drop();
    }
    for(var i = 0; i < 20; ++i) {
        birds[i] = new Bird(random(0.01, 1), random(5, 20));
    }

    WHITE = color(255, 255, 255, 255);
    BLACK = color(0, 0, 0, 255);
    PINK = color(255, 20, 147, 255);
}

// Draw content
function draw() {
    var timing = millis() % 20000;
    if(timing < 100 && incViz){
        ++vizNum;
        incViz = false;
    } else if(timing > 100) {
        incViz = true;
    }
    switch(vizNum % 3) {
        case 0: colorMode(RGB);
            background(BLACK);
            drawColor = WHITE;
            if (isCirclesOn) drawBlobs();
            drawForeground();
            break;
        case 1: colorMode(RGB);
            background(PINK);
            drawColor = WHITE;
            drawBirds();
            drawForeground();
            break;
        default: background(WHITE);
            if (!(speed % 10)) {
                rainbow++;
                rainbow = rainbow % 360;
                speed = 0;
            }
            speed++;
            if (song && isWavesOn) drawBackground();
            drawColor = BLACK;
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

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
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
        if (error.status === 404) alert("Error: " + "Invalid URL! Should be \"https://soundcloud.com/artist/song\"!");
    });
}

function loaded(track) {
    streamUrl = track.stream_url + '?client_id=' + CLIENT_ID;
    song = loadSound(streamUrl, function() {
        song.play();
        fft.setInput(song);
        $("#loading-modal").css("display", "none");
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
        if (i >= samples.length) continue;
        var x = map(i, 0, xMap, 0, width);
        var y = map(samples[i], -1, 1, -height/16, height/16);
        vertex(x, y + height/2);
    }
    endShape();

}

function drawForeground() {
    noFill();
    strokeWeight(1);
    stroke(drawColor);
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
    particles.push(new Particle(random(0, width/4), random(0, height)));
    particles.push(new Particle(random(3/4 * width, width), random(0, height)));
}

function deleteBlob() {
    particles = [];
}

function drawBlobs() {
    strokeWeight(1);
    for (var i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].show(drawColor);
    }
    var addPart = millis() % 1000;
    var deletePart = millis() % 10000;
    if(addPart < 50) newBlob();
    if(deletePart < 100) deleteBlob();
}

function drawRain() {
    var spectrum = fft.analyze();
    var wt = map(spectrum[512] * 10, 0, 255, 1, 6);
    for (var i = 0; i < drops.length; i++) {
        if (i % 3 == 0) {
            drops[i].fall(wt);
            drops[i].show(drawColor, wt);
        } else {
            drops[i].fall(1);
            drops[i].show(drawColor, 1);
        }
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

function toggleMic() {
    var checkBox = document.getElementById("mic");

    if (checkBox.checked == true){
        mic = new p5.AudioIn();
        mic.start();
        fft.setInput(mic);
    } else {
        if (mic)
            mic.stop();
        if (song)
            fft.setInput(song);
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
    stroke(WHITE);
    strokeWeight(1);
    noFill()
    for(var i = 0; i < 5; ++i) {
        ellipse(this.location.x, this.location.y, random(30, 50), random(30, 50));
    }
    triangle(this.location.x, this.location.y,
        this.location.x+30, this.location.y-10,
        this.location.x-40, this.location.y+30)
}

function openNav() {
    document.getElementById("mySidenav").style.width = "600px";
    document.getElementById("mySidenav").style.display = "block";
}

function closeNav() {
    document.getElementById("mySidenav").style.display = "none";
}
