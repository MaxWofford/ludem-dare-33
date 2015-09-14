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
var preySpawns = [100, 900, 1050];
var preyTargets = [400, 700, 1300];
var staminaRegen = 0.5;

var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'actual-cannibal', { preload: preload, create: create, update: update, render: render });

var player;
var facing = 'left';
var sprinting = false;
var cursors;
var jumpButton;
var bg;
var healthbar;
var dying;

function playSound(file) {
  var a = new Audio(file);
  a.play();
}

function preload() {
  game.load.spritesheet('shia', 'img/shia.png', 64, 64);
  game.load.spritesheet('trap', 'img/bearTrap.png', 64, 64);
  game.load.image('background', 'http://placehold.it/100x100');
  game.load.image('ground', 'img/road.png');
  game.load.image('car', 'img/car.png');
  game.load.spritesheet('prey', 'img/person.png', 64, 64);
  game.load.image('healthbar', 'http://placehold.it/32x32/663366/663366');
  game.load.image('healthbarCharged', 'http://placehold.it/32x32/663399/663399');
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

  preys = game.add.group();
  function spawnPrey(){
    var prey = game.add.sprite(preySpawns[Math.floor(preySpawns.length * Math.random())], worldHeight - 96, 'prey');
    prey.target = preyTargets[Math.floor(preyTargets.length * Math.random())];
    car  = game.add.sprite(prey.target, worldHeight - 128, 'car');
    prey.car = car;
    prey.anchor.setTo(.5, 0);
    prey.animations.add('walk', [0, 1, 2, 3], 5, true);
    prey.animations.add('death', [4, 5, 6, 7, 8, 9, 10, 11], .01, false);
    prey.state = "normal";
    prey.trap = function(a,b){
      prey.state = 'alert';
      b.play('snap');
    };
    prey.die = function(){
      prey.state = "dying";
      prey.body.immovable = true;
      prey.body.velocity.x = 0;
      player.body.x = prey.body.x;
      player.state = "eating";
      playSound('sound/shiaPounce.mp3');
      player.eating = 7;
      prey.animations.play("death");
      player.body.velocity.x = 0;
      dying = prey;
      prey.alive = false;
    };
    game.physics.enable(prey, Phaser.Physics.ARCADE);
    prey.body.setSize(10, 35, 0, 18);
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
  trap.animations.add('snap',[0,1,2,3,4,5],11,false);
  game.physics.enable(trap, Phaser.Physics.ARCADE);
  trap.body.setSize(5, 32, 30, 27);
  trap.body.immovable = true;
  trap.body.allowGravity = false;
  traps.add(trap);
  player = game.add.sprite(32, worldHeight - 4 * playerHeight, 'shia');
  player.stamina = 0;
  game.physics.enable(player, Phaser.Physics.ARCADE);
  player.anchor.setTo(.5, 0);
  player.body.bounce.y = 0.2;
  player.body.collideWorldBounds = true;
  player.body.setSize(20, 35, 0, 22);
  player.animations.add('walk', [0, 1, 2, 3], 5, true);
  player.animations.add('sprint', [4, 5, 6, 6], 8, true);
  player.animations.add('pounce', [4, 5, 6], 8, false);
  player.animations.add('idle', [0], 20, true);
  player.eating = 0;
  cars = game.add.group();
  for (var i = 1; i < 2; i++) {
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
  eatButton  = game.input.keyboard.addKey(Phaser.Keyboard.E);
  eatButton.onDown.add(function(){
    console.log('nom');
    if(dying){
      dying.animations.currentAnim.frame = 8-player.eating;
      if(player.eating === 0){
        dying = undefined;
      }else{
        player.eating--;
      }
    }
  }, this);
  
  // Player functions
  player.pounce = function() {
    this.body.velocity.y = -350;
    this.body.velocity.x = 450*((facing === 'left')?-1:1);
    player.animations.play("pounce");
    player.stamina -= 100;
  };
  player.moveLeft = function() {
    if (wasd.shift.isDown) {
      this.body.velocity.x = -sprintSpeed;
      player.animations.play('sprint');
    }else{
      this.body.velocity.x = -sneakSpeed;
      player.animations.play('walk');
    }
    player.scale.x = -1;
    facing = 'left';
  };
  player.moveRight = function() {
    if (wasd.shift.isDown) {
      this.body.velocity.x = sprintSpeed;
      player.animations.play('sprint');
    }else{
      this.body.velocity.x = sneakSpeed;
      player.animations.play('walk');
    }
    player.scale.x = 1;
    facing = 'right';
  };

  //ui
  healthbar = game.add.sprite(100, 100, 'healthbar');
  healthbar.cropEnabled = true;
}

function update(e) {
  
  //Prey updates
  preys.forEachAlive(function(prey){
    if(prey.state === "normal"){
      prey.animations.play('walk');
      if (prey.target > prey.position.x - 20) {
        prey.body.velocity.x = 40;
        prey.scale.x = 1;
      } else if (prey.target < prey.position.x - 80) {
        prey.body.velocity.x = -40;
        prey.scale.x = -1;
      } else{
        //delay
        prey.destroy();
        leave(prey.car);
      }
      game.physics.arcade.collide(prey, traps, prey.trap, null, prey);
    }else if(prey.state === "alert"){
      prey.animations.stop();
    }
    game.physics.arcade.collide(prey, player, prey.die, null, prey);
  });
  //Camera updates
  game.camera.focusOnXY(player.position.x, game.world.height / 2);
  //Player updates
  game.physics.arcade.collide(player, ground);
  if(player.state === "eating"){
    if(player.eating > 0){
      return;
    }else{
      player.state = "normal";
    }
  }
  if(player.body.touching.down) {
    if (cursors.left.isDown || wasd.left.isDown) {
      player.moveLeft();
    }
    else if (cursors.right.isDown || wasd.right.isDown) {
      player.moveRight();
    }
    else {
      player.animations.play("idle");
      player.body.velocity.x = 0;
    }
    if ((wasd.up.isDown || cursors.up.isDown || jumpButton.isDown) && wasd.shift.isDown && player.stamina > 120) {
      player.pounce();
    }
  }
  //Stamina
  healthbar.width = (player.stamina / 200) * 100;
  healthbar.position.x = game.camera.position.x - healthbar.width / 2;
  player.stamina += staminaRegen;
  if (!wasd.shift.isDown){
    player.stamina += staminaRegen;
  }
  if (player.stamina > 200) {
    player.stamina = 200;
  }
}

function leave(car){
  game.add.tween(car).to( { x: car.body.x - 400, alpha:0 }, 6000, "Quad.easeOut").start();
}
function render () {
  //preys.forEachAlive(function(a){game.debug.body(a)}, this);
  // game.debug.text(game.time.physicsElapsed, 32, 32);
  //game.debug.body(player);
  // game.debug.bodyInfo(player, 16, 24);
}
