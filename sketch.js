var START = 0.5;
var RULES = 0.75;
var PLAY = 1;
var END = 0;
var gameState = START;

var rand, randPos;
var fuelTime;
var crashes;
var enemyFrame, fuelFrame;

var ship, obstacle, enemy, space, fuel;
var obstacleGroup, fuelGroup, enemyGroup;
var shipImage, enemyImage, asteroidImage, spaceImage, fuelImage, destroyImage;
var destroySound, fuelSound;

function preload() {
  shipImage = loadAnimation("spaceship.png");
  destroyImage = loadAnimation("ship destroy.png");

  enemyImage = loadImage("enemy spaceship.png");
  asteroidImage = loadImage("Asteroid.png");

  spaceImage = loadImage("space.jpg");

  fuelImage = loadImage("fuel.png");

  destroySound = loadSound("destroy.wav");
  fuelSound = loadSound("refuel.wav");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  space = createSprite(0, 0, windowWidth, windowHeight);
  space.addImage("space", spaceImage);
  space.scale = 5.2 * ((windowWidth + windowHeight)/1000);

  ship = createSprite(50, 430, 20, 20);
  ship.scale = 0.15 * ((windowWidth + windowHeight)/1000);
  ship.addAnimation("spaceship", shipImage);
  ship.addAnimation("destroy", destroyImage);

  obstacleGroup = new Group();
  fuelGroup = new Group();
  enemyGroup = new Group();
}

function draw() {
  console.log("enemy:"+enemyFrame, "fuel:"+fuelFrame);
  if (gameState === START) {
    drawSprite(space);

    space.velocityY = 0;

    fill("white");
    textSize(40 * ((windowWidth + windowHeight)/1000));
    text("Ride the StarShip", 100 * (windowWidth/500), 250 * (windowHeight/500));

    textSize(20 * ((windowWidth + windowHeight)/1000));
    text("PLAY", 135 * (windowWidth/500), 350 * (windowHeight/500));
    text("RULES", 325 * (windowWidth/500), 350 * (windowHeight/500));

    noFill();
    stroke("aqua");
    strokeWeight(5);
    rect(120 * (windowWidth/500), 325 * (windowHeight/500), 75 * (windowWidth/500), 35 * (windowHeight/500));
    rect(320 * (windowWidth/500), 325 * (windowHeight/500), 75 * (windowWidth/500), 35 * (windowHeight/500));

    if (mouseIsPressed && mouseX > (320 * (windowWidth/500)) && mouseX < (395 * (windowWidth/500)) &&
      mouseY > (325 * (windowHeight/500)) && mouseY < (360 * (windowHeight/500))) {
      gameState = RULES;
    }

    if (mouseIsPressed && mouseX > (120 * (windowWidth/500)) && mouseX < (195 * (windowWidth/500)) &&
      mouseY > (325 * (windowHeight/500)) && mouseY < (350 * (windowHeight/500))) {
      gameState = PLAY;

      ship.changeAnimation("spaceship", shipImage);

      frameCount = 0;
      crashes = 3;
      fuelTime = 0;

      enemyFrame = Math.round(100 * ((windowWidth + windowHeight)/1000));
      fuelFrame = Math.round(130 * ((windowWidth + windowHeight)/1000));
    }
  } else if (gameState === RULES) {
    drawSprite(space);

    fill("aqua");
    textSize(40 * ((windowWidth + windowHeight)/1000));
    text("RULES", 170 * (windowWidth/500), 130 * (windowHeight/500));

    textSize(25 * ((windowWidth + windowHeight)/1000));
    text("Go Back to Start.", 150 * (windowWidth/500), 425 * (windowHeight/500));

    fill("white");
    textSize(15 * ((windowWidth + windowHeight)/1000));

    text("-Control the position of your ship with the mouse.", 50 * (windowWidth/500), 170 * (windowHeight/500));
    text("-You have to dodge the enemy ships and asteriods in your way.", 50 * (windowWidth/500), 200 * (windowHeight/500));
    text("-If your all lives are over, you lose and the ship gets destroyed.", 50 * (windowWidth/500), 230 * (windowHeight/500));
    text("-Also, collect fuel tanks to refill your tank and set the time to 0.", 50 * (windowWidth/500), 260 * (windowHeight/500));
    text("-If you don't collect fuel within 20 seconds, the ship gets destroyed.", 50 * (windowWidth/500), 290 * (windowHeight/500));

    space.velocityY = 0;

    noFill();
    stroke("white");
    strokeWeight(3);
    rect(140 * (windowWidth/500), 395 * (windowHeight/500), 210 * (windowWidth/500), 45 * (windowHeight/500));

    if (mouseIsPressed && mouseX > (140 * (windowWidth/500)) && mouseX < (350 * (windowWidth/500)) && mouseY > (395 * (windowHeight/500)) 
    && mouseY < (440 * (windowHeight/500))) {
      gameState = START;
    }
  } else if (gameState === PLAY) {
    space.velocityY = 4;

    if (space.y > windowHeight) {
      space.y = space.height/2;
    }

    ship.x = World.mouseX;
    ship.y = World.mouseY;

    fuelTime = Math.round(frameCount / frameRate());

    if (fuelTime > 19) {
      gameState = END;
    }

    ship.setCollider("circle", 0, 0, 450);
    ship.debug = false;

    spawnEnemy();
    spawnFuel();

    if (obstacleGroup.isTouching(ship)) {
      crashes -= 1;

      destroySound.play();

      obstacle.destroy();
    }
    if (enemyGroup.isTouching(ship)) {
      crashes -= 1;

      destroySound.play();

      enemy.destroy();
    }
    if (fuelGroup.isTouching(ship)) {
      fuelSound.play();

      fuel.destroy();

      frameCount = 0;
    }

    if (crashes === 0) {
      gameState = END;
    }

    drawSprites();

    if (fuelTime > -1) {
      fill("lime");
      textSize(20 * ((windowHeight + windowWidth)/1000));
      text("Time without fuel:" + fuelTime, 50 * (windowWidth/500), 50 * (windowHeight/500));
    }
    if (fuelTime > 7) {
      fill("yellow");
      textSize(20 * ((windowHeight + windowWidth)/1000));
      text("Time without fuel:" + fuelTime, 50 * (windowWidth/500), 50 * (windowHeight/500));
    }
    if (fuelTime > 14) {
      fill("red");
      textSize(20 * ((windowHeight + windowWidth)/1000));
      text("Time without fuel:" + fuelTime, 50 * (windowWidth/500), 50 * (windowHeight/500));
    }

    textSize(20 * ((windowHeight + windowWidth)/1000));
    text("Lives:" + crashes, 400 * (windowWidth/500), 50 * (windowHeight/500));
  } else if (gameState === END) {

    obstacleGroup.destroyEach();
    enemyGroup.destroyEach();
    fuelGroup.destroyEach();

    drawSprite(space);
    drawSprite(ship);

    space.velocityY = 0;

    ship.changeAnimation("destroy", destroyImage);

    fill("lime");
    textSize(40 * ((windowHeight + windowWidth)/1000));
    text("DESTROYED!!", 125 * (windowWidth/500), 250 * (windowHeight/500));

    textSize(20 * ((windowHeight + windowWidth)/1000));
    text("Restart", 200 * (windowWidth/500), 300 * (windowHeight/500));

    noFill();
    stroke("white");
    strokeWeight(3);
    rect(190 * (windowWidth/500), 275 * (windowHeight/500), 85 * (windowWidth/500), 30 * (windowHeight/500));

    if (mouseIsPressed && mouseX > (190 * (windowWidth/500)) && mouseX < (275 * (windowWidth/500)) 
    && mouseY > (275 * (windowHeight/500)) && mouseY < (305 * (windowHeight/500))) {
      gameState = START;
    }
  }
}

function spawnEnemy() {
  if (frameCount % enemyFrame === 0) {
    randPos = Math.round(random(1, 4));
    rand = Math.round(random(1, 2));
    if (randPos === 1) {
      switch (rand) {
        case 1:
          enemy = createSprite(random(0, windowWidth), 0, 20, 20)
          enemy.addImage("ship", enemyImage);
          enemy.velocityY = 4;
          enemy.scale = 0.2 * ((windowWidth + windowHeight)/1000);
          ship.depth = enemy.depth;
          ship.depth++;
          enemy.setCollider("circle", 0, 0, 250);
          enemy.lifetime = windowHeight/4;
          enemy.debug = false;
          enemyGroup.add(enemy);
          break;
        case 2:
          obstacle = createSprite(random(0, windowWidth), 0, 20, 20);
          obstacle.addImage("asteroid", asteroidImage);
          obstacle.velocityY = random(3, 6);
          obstacle.scale = 0.1 * ((windowWidth + windowHeight)/1000);
          ship.depth = obstacle.depth;
          ship.depth++;
          obstacle.debug = false;
          obstacle.lifetime = windowHeight/random(3,6);
          obstacleGroup.add(obstacle);
          break;
        default:
          break;
      }
    } else if (randPos === 2) {
      switch (rand) {
        case 1:
          enemy = createSprite(random(0, windowWidth), 0, 20, 20)
          enemy.addImage("ship", enemyImage);
          enemy.velocityY = 4;
          enemy.scale = 0.2 * ((windowWidth + windowHeight)/1000);
          ship.depth = enemy.depth;
          ship.depth++;
          enemy.setCollider("circle", 0, 0, 250);
          enemy.lifetime = windowHeight/4;
          enemy.debug = false;
          enemyGroup.add(enemy);
          break;
        case 2:
          obstacle = createSprite(random(0, windowWidth), windowHeight, 20, 20);
          obstacle.addImage("asteroid", asteroidImage);
          obstacle.velocityY = random(-3, -6);
          obstacle.scale = 0.1 * ((windowWidth + windowHeight)/1000);
          ship.depth = obstacle.depth;
          ship.depth++;
          obstacle.debug = false;
          obstacle.lifetime = windowHeight/random(3,6);
          obstacleGroup.add(obstacle);
          break;
        default:
          break;
      }
    } else if (randPos === 3) {
      switch (rand) {
        case 1:
          enemy = createSprite(random(0, windowWidth), 0, 20, 20)
          enemy.addImage("ship", enemyImage);
          enemy.velocityY = 4;
          enemy.scale = 0.2 * ((windowWidth + windowHeight)/1000);
          ship.depth = enemy.depth;
          ship.depth++;
          enemy.setCollider("circle", 0, 0, 250);
          enemy.debug = false;
          enemy.lifetime = windowHeight/4;
          enemyGroup.add(enemy);
          break;
        case 2:
          obstacle = createSprite(0, random(0, windowHeight), 20, 20);
          obstacle.addImage("asteroid", asteroidImage);
          obstacle.velocityX = random(3, 6);
          obstacle.scale = 0.1 * ((windowWidth + windowHeight)/1000);
          ship.depth = obstacle.depth;
          obstacle.debug = false;
          ship.depth++;
          obstacle.lifetime = windowWidth/random(3,6);
          obstacleGroup.add(obstacle);
          break;
        default:
          break;
      }
    } else if (randPos === 4) {
      switch (rand) {
        case 1:
          enemy = createSprite(random(0, windowWidth), 0, 20, 20)
          enemy.addImage("ship", enemyImage);
          enemy.velocityY = 4;
          enemy.scale = 0.2 * ((windowWidth + windowHeight)/1000);
          ship.depth = enemy.depth;
          ship.depth++;
          enemy.debug = false;
          enemy.setCollider("circle", 0, 0, 250);
          enemy.lifetime = windowHeight/4;
          enemyGroup.add(enemy);
          break;
        case 2:
          obstacle = createSprite(windowWidth, random(0, windowHeight), 20, 20);
          obstacle.addImage("asteroid", asteroidImage);
          obstacle.velocityX = random(-3, -6);
          obstacle.scale = 0.1 * ((windowWidth + windowHeight)/1000);
          ship.depth = obstacle.depth;
          ship.depth++;
          obstacle.debug = false;
          obstacle.lifetime = windowWidth/random(3,6);
          obstacleGroup.add(obstacle);
          break;
        default:
          break;
      }
    }
  }
}

function spawnFuel() {
  if (frameCount % fuelFrame === 0) {
    randPos = Math.round(random(1, 4));
    switch (randPos) {
      case 1:
        fuel = createSprite(random(0, windowWidth), 0, 20, 20);
        fuel.addImage("fuelTank", fuelImage);
        fuel.velocityY = 5;
        fuel.scale = 0.03 * ((windowWidth + windowHeight)/1000);
        fuel.debug = false;
        fuel.lifetime = windowHeight/5;
        break;
      case 2:
        fuel = createSprite(random(0, windowWidth), windowHeight, 20, 20);
        fuel.addImage("fuelTank", fuelImage);
        fuel.lifetime = windowHeight/5;
        fuel.velocityY = -5;
        fuel.debug = false;
        fuel.scale = 0.03 * ((windowWidth + windowHeight)/1000);
        break;
      case 3:
        fuel = createSprite(windowWidth, (random(0, windowHeight)), 20, 20);
        fuel.addImage("fuelTank", fuelImage);
        fuel.lifetime = windowWidth/5;
        fuel.velocityX = -5;
        fuel.debug = false;
        fuel.scale = 0.03 * ((windowWidth + windowHeight)/1000);
        break;
      case 4:
        fuel = createSprite(0, (random(0, windowHeight)), 20, 20);
        fuel.addImage("fuelTank", fuelImage);
        fuel.lifetime = windowWidth/5;
        fuel.velocityX = 5;
        fuel.debug = false;
        fuel.scale = 0.03 * ((windowWidth + windowHeight)/1000);
        break;
      default:
        break;
    }
    fuelGroup.add(fuel);
  }
}
