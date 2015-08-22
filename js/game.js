console.log('Game running... you monster');

// Code based on examples from
// http://phaser.io/examples/v2/arcade-physics/platformer-basics#gv

// quick config stuff that needs tweaking goes up here
var sneakSpeed = 50;
var sprintSpeed = 150;
var worldWidth = 1920;
var worldHeight = 600;
var playerHeight = 48;
var playerWidth = 32;
var pounceSpeedMultiplier = 3;
var preySpawns = [750, 900, 1050];
var preyTargets = [400, 500, 1300];

var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'actual-cannibal', { preload: preload, create: create, update: update, render: render });

var player;
var facing = 'left';
var sprinting = false;
var jumpTimer = 0;
var cursors;
var jumpButton;
var bg;

function preload() {
  game.load.spritesheet('shia', 'img/shia.png', 64, 64);
  game.load.spritesheet('trap', 'img/bearTrap.png', 64, 64);
  game.load.image('background', 'http://placehold.it/100x100');
  game.load.image('ground', 'http://placehold.it/32x32/4CB74C/4CB74C');
  game.load.image('car', 'img/car.png');
  game.load.image('prey', 'http://placehold.it/32x32/663399/663399');
}

function create() {
  game.physics.startSystem(Phaser.Physics.ARCADE);
  // No 30 fps console peasants here
  game.time.desiredFps = 60;
  game.world.setBounds(0, 0, worldWidth, worldHeight);
  bg = game.add.tileSprite(0, 0, worldWidth, worldHeight, 'background');
  game.physics.arcade.gravity.y = 1000;
  
  // Generate the ground
  ground = game.add.group();
  for(var x = 0; x < worldWidth; x += 32) {
    var groundBlock = game.add.sprite(x, worldHeight - 32, 'ground');
    game.physics.enable(groundBlock, Phaser.Physics.ARCADE);
    groundBlock.body.immovable = true;
    groundBlock.body.allowGravity = false;
    ground.add(groundBlock);
  }

  traps = game.add.group();
  trap = game.add.sprite(200, worldHeight - 90, 'trap');
  trap.animations.add('snap',[0,1,2,3,4],11,true);
  trap.animations.play('snap');
  game.physics.enable(trap, Phaser.Physics.ARCADE);
  trap.body.immovable = true;
  trap.body.allowGravity = false;
  traps.add(trap);

  preys = game.add.group();
  function spawnPrey(){
    prey = game.add.sprite(preySpawns[Math.round(preySpawns.length * Math.random())], worldHeight - 64, 'prey');
    car  = game.add.sprite(preyTargets[Math.round(preyTargets.length * Math.random())], worldHeight - 128, 'car');
    prey.target = preyTargets[Math.round(preyTargets.length * Math.random())];
    game.physics.enable(prey, Phaser.Physics.ARCADE);
    prey.body.allowGravity = false;
    prey.body.velocity.x = -40;
    preys.add(prey);
    game.physics.enable(car, Phaser.Physics.ARCADE);
    car.body.allowGravity = false;
    car.scale.setTo(2,2);
    cars.add(car);
  }
  traps = game.add.group();
  trap = game.add.sprite(200, worldHeight - 90, 'trap');
  trap.animations.add('snap',[0,1,2,3,4],11,true);
  trap.animations.play('snap');
  game.physics.enable(trap, Phaser.Physics.ARCADE);
  trap.body.immovable = true;
  trap.body.allowGravity = false;
  traps.add(trap);
  
  player = game.add.sprite(32, worldHeight - 4 * playerHeight, 'shia');
  game.physics.enable(player, Phaser.Physics.ARCADE);
  player.body.bounce.y = 0.2;
  player.body.collideWorldBounds = true;
  player.body.setSize(20, 32, 5, 27);
  player.animations.add('left', [0, 1, 2, 3], 5, true);
  player.animations.add('left-sprint', [9, 10, 11,11], 8, true);
  player.animations.add('left-pounce', [9, 10, 11], 8, false);
  player.animations.add('left-idle', [0], 20, true);
  player.animations.add('turn', [4], 20, true);
  player.animations.add('right', [5, 6, 7, 8], 5, true);
  player.animations.add('right-sprint', [12, 13, 14,14], 8, true);
  player.animations.add('right-pounce', [12, 13, 14], 8, false);
  player.animations.add('right-idle', [5], 20, true);
  cars = game.add.group();
    for (var i = 1; i < 20; i++) {
    spawnPrey();
  }
  // Player controls
  cursors = game.input.keyboard.createCursorKeys();
  wasd = {
    up: game.input.keyboard.addKey(Phaser.Keyboard.W),
    down: game.input.keyboard.addKey(Phaser.Keyboard.S),
    left: game.input.keyboard.addKey(Phaser.Keyboard.A),
    right: game.input.keyboard.addKey(Phaser.Keyboard.D),
    shift: game.input.keyboard.addKey(Phaser.Keyboard.SHIFT)
  };
  jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

  // Player functions
  player.pounce = function() {
    this.body.velocity.y = -300;
    this.body.velocity.x = 450*((facing === 'left')?-1:1);
    player.animations.play(facing+"-pounce");
  };
  player.moveLeft = function() {
    if (wasd.shift.isDown) {
        this.body.velocity.x = -sprintSpeed;
        player.animations.play('left-sprint');
    }else{
      this.body.velocity.x = -sneakSpeed;
      player.animations.play('left');
    }
    facing = 'left';
  };
  player.moveRight = function() {
    if (wasd.shift.isDown) {
        this.body.velocity.x = sprintSpeed;
        player.animations.play('right-sprint');
    }else{
      this.body.velocity.x = sneakSpeed;
      player.animations.play('right');
    }
    facing = 'right';
  };
}

function update() {
  //Prey updates
  preys.forEachAlive(function(prey){
    if (prey.target > prey.position.x) {
      prey.body.velocity.x = 40;
    } else{
      prey.body.velocity.x = -40;
    }
  })
  //Camera updates
  game.camera.focusOnXY(player.position.x, game.world.height / 2);
  //Player updates
  game.physics.arcade.collide(player, ground);
  if(player.body.touching.down) {
    if (cursors.left.isDown || wasd.left.isDown) {
      player.moveLeft();
    }
    else if (cursors.right.isDown || wasd.right.isDown) {
      player.moveRight();
    }
    else {
      player.animations.play(facing+"-idle");
      player.body.velocity.x = 0;
    }
    if ((wasd.up.isDown || cursors.up.isDown || jumpButton.isDown)&&wasd.shift.isDown) {
      console.log('jumping');
      player.pounce();
    }
  }
}

function render () {

  // game.debug.text(game.time.physicsElapsed, 32, 32);
  // game.debug.body(player);
  // game.debug.bodyInfo(player, 16, 24);

}
