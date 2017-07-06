var game = new Phaser.Game(
    1200,
    600,
    Phaser.CANVAS,
    'ass-2017',
    { preload: preload, create: create, update: update, render: render }
);

var arrow;
var ball;
var physicGround;
var catchFlag = false;
var launchVelocity = 0;
var level = 0;

function preload() {
    game.world.setBounds(0, 0, 1200, 600);

    // Define the appearance of the world
    game.load.image('ground', 'assets/sprites/ground-2x.png');
    game.load.image('river', 'assets/sprites/river-2x.png');
    game.load.image('sky', 'assets/sprites/sky-2x.png');
    game.load.image('cloud0', 'assets/sprites/cloud-big-2x.png');
    game.load.image('cloud1', 'assets/sprites/cloud-narrow-2x.png');
    game.load.image('cloud2', 'assets/sprites/cloud-small-2x.png');

    // Define the interactive part
    game.load.image('analog', 'assets/sprites/fusia.png');
    game.load.image('arrow', 'assets/sprites/longarrow2.png');
    game.load.image('ball', 'assets/sprites/pangball.png');
    game.load.spritesheet('kaboom', 'assets/spritesheet/explode.png', 128, 128);

    // Define the construct pieces
    game.load.image('block', 'assets/sprites/block.png');
    game.load.image('silo', 'assets/sprites/silo.png');
}

function create() {
    level += 1;

    /*******************************/
    /* Define the world appearance */
    /*******************************/

    // Create the sky layer, behind everything and donot move.
    var skyLayer = game.add.group();

    // Create the cloud layer, only beyond the sky.
    var cloudLayer = game.add.group();

    // Create the ground, behind the river and beyond clouds.
    var groundLayer = game.add.group();

    // Create the sprite layer. This should behind the river,
    // and beyond the ground, cloud and sky layer.
    var spriteLayer = game.add.group();

    // Create the river layer, beyond everything.
    var riverLayer = game.add.group();

    // Add sky background to skyLayer.
    var sky = skyLayer.create(0, 0, 'sky');

    // Add clouds to cloudLayer.
    var cloud0 = cloudLayer.create(200, 120, 'cloud0');
    var cloud1 = cloudLayer.create(-60, 120, 'cloud1');
    var cloud2 = cloudLayer.create(900, 170, 'cloud2');

    // Add ground sprite to groundLayer.
    var ground = groundLayer.create(0, 360, 'ground');

    // Add river to riverLayer.
    var river = riverLayer.create(0, 400, 'river');

    /***************************/
    /* Define the game physics */
    /***************************/

    game.physics.startSystem(Phaser.Physics.ARCADE);

    // set global gravity
    game.physics.arcade.gravity.y = 1500;

    // Set Ziggy
    var graphics = game.add.graphics(0, 0);
    graphics.beginFill(0x049e0c);
    graphics.drawRect(200, 350, 10, 50);

    analog = game.add.sprite(200, 350, 'analog');

    game.physics.enable(analog, Phaser.Physics.ARCADE);

    analog.body.allowGravity = false;
    analog.width = 8;
    analog.rotation = 220;
    analog.alpha = 0;
    analog.anchor.setTo(0.5, 0.0);

    arrow = game.add.sprite(200, 350, 'arrow');

    game.physics.enable(arrow, Phaser.Physics.ARCADE);

    arrow.anchor.setTo(0.1, 0.5);
    arrow.body.moves = false;
    arrow.body.allowGravity = false;
    arrow.alpha = 0;

    physicGround = game.add.tileSprite(300, 360, 900, 40, 'ground');

    game.physics.enable(physicGround, Phaser.Physics.ARCADE);

    physicGround.body.collideWorldBounds = true;
    physicGround.body.immovable = true;
    physicGround.body.allowGravity = false;

    createBall();
    createSilos['level' + level]();
}

function set(ball) {
    ball.body.moves = false;
    ball.body.velocity.setTo(0, 0);
    ball.body.allowGravity = false;
    catchFlag = true;
}

function launch() {
    catchFlag = false;

    ball.body.moves = true;
    arrow.alpha = 0;
    analog.alpha = 0;
    Xvector = (arrow.x - ball.x) * 6;
    Yvector = (arrow.y - ball.y) * 6;
    ball.body.allowGravity = true;
    ball.body.velocity.setTo(Xvector, Yvector);
}

function update() {
    game.physics.arcade.collide(ball, physicGround);
    arrow.rotation = game.physics.arcade.angleBetween(arrow, ball);

    if (catchFlag === true) {
        //  Track the ball sprite to the mouse
        ball.x = game.input.activePointer.worldX;
        ball.y = game.input.activePointer.worldY;

        arrow.alpha = 1;
        analog.alpha = 0.5;
        analog.rotation = arrow.rotation - 3.14 / 2;
        analog.height = game.physics.arcade.distanceToPointer(arrow);
        launchVelocity = analog.height;
    }
}

function render() {
    game.debug.text("Drag the ball and release to launch", 32, 32);
    game.debug.bodyInfo(ball, 32, 64);
}

function replaceBall() {
    ball.destroy();

    createBall();
}

function createBall() {
    ball = game.add.sprite(205, 360, 'ball');

    setupBall();
}

function setupBall() {
    game.physics.enable(ball, Phaser.Physics.ARCADE);

    ball.anchor.setTo(0.5, 0.5);
    ball.body.collideWorldBounds = true;
    ball.body.bounce.setTo(0.9, 0.9);

    ball.body.allowGravity = false;
    ball.inputEnabled = true;
    ball.input.start(0, true);
    ball.events.onInputDown.add(set);
    ball.events.onInputUp.add(launch);

    ball.body.onWorldBounds = new Phaser.Signal();
    ball.body.onWorldBounds.add(replaceBall);
}

var createSilos = {
    'level1': function () {
        var silo1 = game.add.sprite(800, 300, 'silo');
        var block1 = game.add.sprite(0, 0, 'block').alignTo(silo1, Phaser.TOP_LEFT, 2);
        var silo2 = game.add.sprite(0, 0, 'silo').alignTo(block1, Phaser.BOTTOM_RIGHT, 2);
        var silo3 = game.add.sprite(0, 0, 'silo').alignTo(block1, Phaser.TOP_LEFT, 2);
        var block2 = game.add.sprite(0, 0, 'block').alignTo(silo3, Phaser.TOP_LEFT, 2);
        var silo4 = game.add.sprite(0, 0, 'silo').alignTo(block2, Phaser.BOTTOM_RIGHT, 2);

        game.physics.arcade.enable([silo1, silo2, silo3, silo4, block1, block2]);

        silo1.body.collideWorldBounds = true;

        silo2.body.collideWorldBounds = true;

        silo3.body.collideWorldBounds = true;

        silo4.body.collideWorldBounds = true;

        block1.body.collideWorldBounds = true;

        block2.body.collideWorldBounds = true;
    }
};
