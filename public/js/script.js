var CLIENT_ID       = "188bdc288184c969c82a24af4145c999";
var streamUrl, track;

// Set up canvas
function setup() {
    createCanvas(windowWidth, windowHeight - 50);
}

// Draw content
function draw() {
    // background(0); // black

    // fill(255,0,0);
    // ellipse(windowWidth/2, (windowHeight-50)/2, 30); // circle(x, y, diameter)
}

// Resize canvas with window
window.addEventListener('resize', function(event) {
    resizeCanvas(windowWidth, windowHeight - 50);
});

function loaded(track) {
    streamUrl = track.stream_url + '?client_id=' + CLIENT_ID;
    track = loadSound(streamUrl, function() {
    	track.play();
    	$("#loading-modal").css("display", "none");
    });
}

function loadTrack() {
    if (track) {
        track.stop();
    }

	// show loading gif
    $("#loading-modal").css("display", "block");
    SC.initialize({client_id: CLIENT_ID});

    var trackUrl = document.getElementById("trackInput").value;
    SC.resolve(trackUrl).then(loaded).catch(function(error) {
        console.log(error);
        if (error.status === 403) alert("Error: " + "The owner of this track doesn't allow 3rd party streaming. Try another track!");
    });
}