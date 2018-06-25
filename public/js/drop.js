function Drop() {
  this.x = random(width);
  this.y = random(-500, -50);
  this.z = random(0, 20);
  this.len = map(this.z, 0, 20, 10, 40);
  this.yspeed = random(5, 10);

  this.fall = function(strong) {
    if (strong) {
      this.yspeed = this.yspeed - strong / 200;
      if (this.yspeed < 1) {
        this.yspeed = random(1, 3);
      }
    }
    this.y = this.y + this.yspeed;
    var grav = map(this.z, 0, 20, 0, 0.2);
    this.yspeed = this.yspeed + grav;

    if (this.y > height) {
      this.y = random(-200, -100);
      this.yspeed = random(5, 10);
    }
  }

  this.show = function(color, strong) {
    strokeWeight(strong);
    colorMode(RGB);
    stroke(color);
    line(this.x, this.y, this.x, this.y+this.len);
  }
}