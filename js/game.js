console.log('Game running... you monster');

// Code based on examples from
// http://phaser.io/examples/v2/arcade-physics/platformer-basics#gv

// quick config stuff that needs tweaking goes up here
var sneakSpeed = 50;
var sprintSpeed = 150;

var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'actual-cannibal', { preload: preload, create: create, update: update, render: render });

var player;
var facing = 'left';
var jumpTimer = 0;
var cursors;
var jumpButton;
var bg;

function preload() {
  game.load.spritesheet('shia', 'http://placehold.it/320x480/fff/000', 32, 48);
  game.load.image('background', 'http://placehold.it/100x100');
}

function create() {
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.time.desiredFps = 60;
  bg = game.add.tileSprite(0, 0, 800, 600, 'background');
  game.physics.arcade.gravity.y = 1000;
  player = game.add.sprite(32, 32, 'shia');
  game.physics.enable(player, Phaser.Physics.ARCADE);
  player.body.bounce.y = 0.2;
  player.body.collideWorldBounds = true;
  player.body.setSize(20, 32, 5, 16);
  player.animations.add('left', [0, 1, 2, 3], 10, true);
  player.animations.add('turn', [4], 20, true);
  player.animations.add('right', [5, 6, 7, 8], 10, true);

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

  // game.physics.arcade.collide(player, layer);

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

  if ((wasd.up.isDown || cursors.up.isDown || jumpButton.isDown) && player.body.onFloor())
  {
    player.pounce();
  }


}

function render () {

  game.debug.text(game.time.suggestedFps, 32, 32);

  // game.debug.text(game.time.physicsElapsed, 32, 32);
  // game.debug.body(player);
  // game.debug.bodyInfo(player, 16, 24);


}
