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
  
  img.resize(100, 0); // Ajustar tamaño de la imagen
  
  // Inicializar PoseNet
  poseNet = ml5.poseNet(video, modelReady);
  poseNet.on('pose', function(results) {
    poses = results;
  });
}

function modelReady() {
  console.log('PoseNet está listo');
}

function draw() {
  image(video, 0, 0, width, height);
  
  if (poses.length > 0) {
    processPoses();
  }
  
  image(painting, 0, 0);
}

function processPoses() {
  const pose = poses[0].pose;
  const keypoints = pose.keypoints;

  const rightWrist = keypoints.find(k => k.part === 'rightWrist');
  const leftWrist = keypoints.find(k => k.part === 'leftWrist');

  if (rightWrist && rightWrist.score > 0.1) {
    drawRightWrist(rightWrist.position);
  }

  if (leftWrist && leftWrist.score > 0.1) {
    drawLeftWrist(leftWrist.position);
  }
}

function drawRightWrist(position) {
  fill(0, 0, 255);
  noStroke();
  circle(position.x, position.y, 30);

  if (position.x > width/2 && position.y < height/2) {
    drawFloatingText(position, 'WE GON BE ALRIGHT');
  }
}

function drawLeftWrist(position) {
  fill(255, 0, 0);
  noStroke();
  circle(position.x, position.y, 30);

  if (position.x < width/2 && position.y < height/2) {
    smoothedX = lerp(smoothedX, position.x, 0.2);
    smoothedY = lerp(smoothedY, position.y, 0.2);
    
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

function drawFloatingText(position, texto) {
  push();
  translate(position.x, position.y);
  
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
