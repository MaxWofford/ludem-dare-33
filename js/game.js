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

var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'actual-cannibal', { preload: preload, create: create, update: update, render: render });

var player;
var facing = 'left';
var jumpTimer = 0;
var cursors;
var jumpButton;
var bg;

function preload() {
  game.load.spritesheet('shia', 'http://placehold.it/320x480/fff/000', playerWidth, playerHeight);
  game.load.image('background', 'http://placehold.it/100x100');
  game.load.image('ground', 'http://placehold.it/32x32/663399/663399');
}

function create() {
  game.physics.startSystem(Phaser.Physics.ARCADE);
  // No 30 fps console peasants here
  game.time.desiredFps = 60;
  game.world.setBounds(0, 0, worldWidth, worldHeight);
  bg = game.add.tileSprite(0, 0, worldWidth, worldHeight, 'background');
  game.physics.arcade.gravity.y = 1000;
  player = game.add.sprite(32, worldHeight - 4 * playerHeight, 'shia');
  game.physics.enable(player, Phaser.Physics.ARCADE);
  player.body.bounce.y = 0.2;
  player.body.collideWorldBounds = true;
  player.body.setSize(20, 32, 5, 16);
  player.animations.add('left', [0, 1, 2, 3], 10, true);
  player.animations.add('turn', [4], 20, true);
  player.animations.add('right', [5, 6, 7, 8], 10, true);
  ground = game.add.group();
  for(var x = 0; x < worldWidth; x += 32) {
    // Add the ground blocks, enable physics on each, make them immovable
    var groundBlock = game.add.sprite(x, worldHeight - 32, 'ground');
    game.physics.enable(groundBlock, Phaser.Physics.ARCADE);
    groundBlock.body.immovable = true;
    groundBlock.body.allowGravity = false;
    ground.add(groundBlock);
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
    this.body.velocity.y = -250;
  }
  player.moveLeft = function() {
    this.body.velocity.x = -sneakSpeed;
    if (wasd.shift.isDown) {
      this.body.velocity.x = -sprintSpeed;
    }
    if (facing != 'left') {
      player.animations.play('left');
      facing = 'left';
    }
  }
  player.moveRight = function() {
    this.body.velocity.x = sneakSpeed;
    if (wasd.shift.isDown) {
      this.body.velocity.x = sprintSpeed;
    }
    if (facing != 'right') {
      player.animations.play('right');
      facing = 'right';
    }
  }
}

function update() {
  game.camera.focusOnXY(player.position.x, game.world.height / 2);

  game.physics.arcade.collide(player, ground);

  player.body.velocity.x = 0;

  if (cursors.left.isDown || wasd.left.isDown) {
    player.moveLeft();
  }
  else if (cursors.right.isDown || wasd.right.isDown) {
    player.moveRight();
  }
  else {
    if (facing != 'idle') {
      player.animations.stop();

      if (facing == 'left') {
        player.frame = 0;
      }
      else {
        player.frame = 5;
      }
      facing = 'idle';
    }
  }

  // Player's leaping velocity
  if(!player.body.touching.down && wasd.shift.isDown) {
    player.body.velocity.x = player.body.velocity.x * pounceSpeedMultiplier;
  }

  if ((wasd.up.isDown || cursors.up.isDown || jumpButton.isDown) && player.body.touching.down) {
    console.log('jumping');
    player.pounce();
  }

}

function render () {

  // game.debug.text(game.time.physicsElapsed, 32, 32);
  // game.debug.body(player);
  // game.debug.bodyInfo(player, 16, 24);


}
