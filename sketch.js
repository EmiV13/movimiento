let poseNet;
let video;
let poses = [];
let img;
let painting;
let mySound;
let soundPlaying = false;
let angle = 0;
let smoothedX = 0;
let smoothedY = 0;

function preload() {
  soundFormats('mp3', 'ogg');
  mySound = loadSound('assets/ALRIGHT.mp3');
  img = loadImage('assets/KENDRICK.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  painting = createGraphics(width, height);
  painting.clear();
  
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  
  
  // Aquí cambiamos ml5.bodyPose() por ml5.poseNet()
  poseNet = ml5.poseNet(video, modelReady);
  poseNet.on('pose', gotPoses);
}

function modelReady() {
  console.log('PoseNet is ready!');
}

function gotPoses(results) {
  poses = results;
}

function draw() {
  image(video, 0, 0, width, height);
  
  if (poses.length > 0) {
    processPoses();
  }
  
  image(painting, 0, 0);
}

function processPoses() {
  const pose = poses[0];
  const rightWrist = pose.keypoints[9];
  const leftWrist = pose.keypoints[10];
  
  if (rightWrist.confidence > 0.1) {
    drawRightWrist(rightWrist);
  }
  
  if (leftWrist.confidence > 0.1) {
    drawLeftWrist(leftWrist);
  }
}

function drawRightWrist(wrist) {
  // Círculo indicador
  fill(0, 0, 255);
  noStroke();
  circle(wrist.x, wrist.y, 30);
  
  // Texto ondulante en cuadrante superior derecho
  if (wrist.x > width/2 && wrist.y < height/2) {
    drawFloatingText(wrist, 'WE GON BE ALRIGHT');
  }
}

function drawLeftWrist(wrist) {
  // Círculo indicador
  fill(255, 0, 0);
  noStroke();
  circle(wrist.x, wrist.y, 30);
  
  // Imagen en cuadrante superior izquierdo
  if (wrist.x < width/2 && wrist.y < height/2) {
    smoothedX = lerp(smoothedX, wrist.x, 0.2);
    smoothedY = lerp(smoothedY, wrist.y, 0.2);
    
    push();
    imageMode(CENTER);
    image(img, smoothedX, smoothedY);
    pop();
    
    if (!soundPlaying) {
      mySound.loop();
      soundPlaying = true;
    }
  } else {
    if (soundPlaying) {
      mySound.stop();
      soundPlaying = false;
    }
  }
}

function drawFloatingText(wrist, texto) {
  push();
  translate(wrist.x, wrist.y);
  
  for (let k = 0; k < texto.length; k++) {
    let letra = texto[k];
    let offset = k * 25;
    
    // Movimiento ondulatorio vertical
    let yOffset = sin(angle + k * 0.3) * 25;
    
    // Color gris oscuro con variación de brillo
    let brightness = map(sin(angle + k * 0.2), -1, 1, 30, 70);
    fill(brightness, 100);
    
    textSize(30);
    textStyle(BOLD);
    text(letra, offset, yOffset);
  }
  
  pop();
  angle += 0.05;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (video) video.size(width, height);
  if (painting) painting = createGraphics(width, height);
}
