let gridSize = 24; // spacing to check flow
let ignoreThresh = 16; // ignore movements below this level

let flow; // calculated flow for entire image
let previousPixels; // copy of previous frame
let video;

let averageVector;
let averageMagnitude;

// Define camera position
let cameraX = 0;
let cameraY = 0;
let cameraZ = 0;
let originalCameraX = 0;
let originalCameraY = 0;
let cameraSpeed = 10;

let lastMovementTime = 0;
let noMovementTimeout = 1000; // 1 seconds in milliseconds

let img;
let img1;
let img2;
function preload() {
  img = loadImage('para.png');
  img1 = loadImage('sleeping.png');
  img2 = loadImage('thoughtballoon.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  video = createCapture(VIDEO);
  video.hide();

  // set up flow calculator
  flow = new FlowCalculator(gridSize);
  
  normalMaterial();
}

function draw() {
  video.loadPixels();
  
  camera(-cameraX, cameraY, 575, cameraX, -cameraY, -575, 0, 1, 0);

  if (video.pixels.length > 0) {
    // calculate flow (but skip if the current and
    // previous frames are the same)
    if (previousPixels) {
      if (same(previousPixels, video.pixels, 4, width)) {
        return;
      }
      flow.calculate(previousPixels, video.pixels, video.width, video.height);
    }

    colorMode(HSB);
    background(cos(frameCount / 500)*100, 204, 100);
    translate(width / 2, -height / 2);
    scale(-1, 1);
    
    // if flow zones have been found, calculate
    // average angle and magnitude
    if (flow.zones) {
      averageVector = createVector(0, 0);
      numZones = 0;

      for (let zone of flow.zones) {
        // if a zone's flow magnitude (strength) is
        // less than a set threshold, don't consider it
        if (zone.mag < ignoreThresh) {
          continue;
        }

        let vector = p5.Vector.fromAngle(zone.angle);
        vector.mult(zone.mag);
        averageVector.add(vector);
        numZones++;
      }

      if (numZones > 0) {
        averageVector.div(numZones);
        averageMagnitude = averageVector.mag();
        averageAngle = averageVector.heading();

        mappedAngle = map(degrees(averageAngle), -180, 180, 0, 360);

        // Move the camera based on the average flow direction
        let cameraMoveX = cos(averageAngle) * averageMagnitude * 15;
        let cameraMoveY = sin(averageAngle) * averageMagnitude * 15;

        // Only update the camera position if there is movement
        if (averageMagnitude > 0) {
          // Smoothly move the camera towards the desired position using lerp
          cameraX = lerp(cameraX, cameraX + cameraMoveX, 0.01);
          cameraY = lerp(cameraY, cameraY + cameraMoveY, 0.01);

          // Reset the last movement time
          lastMovementTime = millis();
        }
      }
    }
    
    push();
    translate(
      sin(frameCount / 28)*10 + 0,
      cos(frameCount / 14)*10 + 0,
      -100
    );
    image(img, 0, 0, 2480/5, 3508/5);
    pop();

    push();
    translate(
      sin(frameCount / 10) + width / 2 + 45,
      cos(frameCount / 10) + height / 2 + 45,
      sin(frameCount / 10) + 300
    );
    rotateX(sin(frameCount / 100));
    rotateY(cos(frameCount / 100));
    box(50, 50, 50);
    pop();

    push();
    translate(
      cos(frameCount / 10) + width / 2 + 100,
      cos(frameCount / 10) + height / 2 - 100,
      sin(frameCount / 10) + 100
    );
    rotateX(cos(frameCount / 150));
    rotateY(sin(frameCount / 100));
    box(50, 50, 50);
    pop();

    push();
    translate(
      sin(frameCount / 10) + width / 2 - 100,
      sin(frameCount / 10) + height / 2 - 50,
      cos(frameCount / 10) + 20
    );
    rotateX(sin(frameCount / 100));
    rotateY(sin(frameCount / 150));
    box(50, 50, 50);
    pop();

    push();
    translate(
      sin(frameCount / 10) + width / 2 - 75,
      cos(frameCount / 10) + height / 2 - 75,
      sin(frameCount / 10) + 450
    );
    rotateX(sin(frameCount / 100));
    rotateY(sin(frameCount / 100));
    box(50, 50, 50);
    pop();
    
    
    // push();
    // translate(
    //   sin(frameCount / 333)*50 + width / 2,
    //   cos(frameCount / 250)*50 + height / 2,
    //   cos(frameCount / 50)*350
    // );
    // rotateZ(cos(frameCount / 50))
    // texture(img)
    // plane(150, 150);
    // pop();
    
    push();
    translate(
      sin(frameCount / 74)*400 + width / 2,
      cos(frameCount / 92)*500 + height / 2,
      cos(frameCount / 50)*350 + 150
    );
    texture(img2)
    plane(150, 150);
    pop();

    // copy the current pixels into previous
    // for the next frame
    previousPixels = copyImage(video.pixels, previousPixels);

    // Check if no movement has been detected for 5 seconds
    if (millis() - lastMovementTime > noMovementTimeout) {
      // Smoothly return the camera to the original position using lerp
      cameraX = lerp(cameraX, originalCameraX, 0.05);
      cameraY = lerp(cameraY, originalCameraY, 0.05);
    }
  }
}