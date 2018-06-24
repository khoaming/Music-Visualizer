var CLIENT_ID       = "188bdc288184c969c82a24af4145c999";
var streamUrl, song;
var particles = [];
var samples = [];
var speed = 0;
var rainbow = 0;
var vizNum = 0;
var strokeColor = 255;

// Set up canvas
function setup() {
    createCanvas(windowWidth, windowHeight - 50);
    setFrameRate(60);
    fft = new p5.FFT();
}

// Draw content
function draw() {
    var timing = millis() % 20000;
    if(timing < 100) ++vizNum;
    switch(vizNum % 2) {
        case 0: background(0);
                strokeColor = 255;
                drawBlobs();
                drawForeground();
                break;
        default: background(255);
                 if (!(speed % 10)) {
                     rainbow++;
                     rainbow = rainbow % 360;
                     speed = 0;
                 }
                 speed++;
                 if (song) drawBackground();
                 strokeColor = 0;
                 drawForeground();
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
    stroke(strokeColor);
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
        particles[i].show(strokeColor);
    }
    var addPart = millis() % 1000;
    var deletePart = millis() % 10000;
    if(addPart < 50) newBlob();
    if(deletePart < 100) deleteBlob();
}
