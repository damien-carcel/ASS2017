var game = new Phaser.Game(
    1200,
    600,
    Phaser.CANVAS,
    'ass-2017',
    { preload: preload, create: create, update: update, render: render }
);

var analog;
var arrow;
var ball;
var physicGround;
var explosions;
var explosion;
var shoots;
var catchFlag = false;
var isLaunched = false;
var level = 0;
var time = 0;
var score = 0;
var constructionElements = {};

function preload() {
    game.world.setBounds(0, 0, 1200, 600);

    // Splash screen
    game.load.image('splash', 'assets/sprites/bigsky-2x.png');

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
    level++;
    shoots = 3;

    /*******************************/
    /* Define the world appearance */
    /*******************************/

    var skyLayer = game.add.group();
    var cloudLayer = game.add.group();
    var groundLayer = game.add.group();
    var riverLayer = game.add.group();

    skyLayer.create(0, 0, 'sky');

    cloudLayer.create(200, 120, 'cloud0');
    cloudLayer.create(-60, 120, 'cloud1');
    cloudLayer.create(900, 170, 'cloud2');

    groundLayer.create(0, 360, 'ground');

    riverLayer.create(0, 400, 'river');

    /***************************/
    /* Define the game physics */
    /***************************/

    explosions = game.add.group();

    game.physics.startSystem(Phaser.Physics.ARCADE);

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

    physicGround = game.add.tileSprite(300, 380, 900, 40, 'ground');
    physicGround.visible = false;

    game.physics.enable(physicGround, Phaser.Physics.ARCADE);

    physicGround.body.collideWorldBounds = true;
    physicGround.body.immovable = true;
    physicGround.body.allowGravity = false;

    createBall();
    createSilos['level' + level]();
}

function update() {
    game.physics.arcade.collide(ball, physicGround);
    game.physics.arcade.collide(constructionElements['level' + level]);
    game.physics.arcade.collide(physicGround, constructionElements['level' + level]);
    game.physics.arcade.collide(ball, constructionElements['level' + level], collisionHandler, null, this);

    arrow.rotation = game.physics.arcade.angleBetween(arrow, ball);

    if (true === catchFlag) {
        //  Track the ball sprite to the mouse
        ball.x = game.input.activePointer.worldX;
        ball.y = game.input.activePointer.worldY;

        arrow.alpha = 1;
        analog.alpha = 0.5;
        analog.rotation = arrow.rotation - 3.14 / 2;
        analog.height = game.physics.arcade.distanceToPointer(arrow);
    }

    if (true === isLaunched && false === catchFlag) {
        time++;
    }

    if (200 < time) {
        replaceBall();
    }
}

function render() {
    game.debug.text('Level: ' + level, 32, 32);
    game.debug.text('Shoots: ' + shoots, 32, 64);
    game.debug.text('Score: ' + score, 32, 96);
}

function set(ball) {
    ball.body.moves = false;
    ball.body.velocity.setTo(0, 0);
    ball.body.allowGravity = false;
    catchFlag = true;
}

function replaceBall() {
    shoots--;
    ball.destroy();

    createBall();

    if (shoots <= 0 || hasLevelNoSilosLeft()) {
        score += shoots * 10;
        level++;
        shoots = 3;

        createSilos['level' + level]();
    }
}

function createBall() {
    isLaunched = false;
    time = 0;
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

function launch() {
    catchFlag = false;
    isLaunched = true;

    ball.body.moves = true;
    arrow.alpha = 0;
    analog.alpha = 0;
    var Xvector = (arrow.x - ball.x) * 6;
    var Yvector = (arrow.y - ball.y) * 6;
    ball.body.allowGravity = true;
    ball.body.velocity.setTo(Xvector, Yvector);
}

function hasLevelNoSilosLeft() {
    if (0 === constructionElements['level' + level].children.length) {
        return true;
    }

    for (var child in constructionElements['level' + level].children) {
        if ('silo' === constructionElements['level' + level].children[child].key) {
            return false;
        }
    }

    return true;
}

var collisionHandler = function (ball, element) {
    explosion = explosions.getFirstExists(false);
    if (explosion) {
        explosion.reset(element.body.x, element.body.y);
        element.destroy();
        explosion.play('kaboom', 50, false, true);

        if ('silo' === element.key) {
            score += 20;
        }

        if ('block' === element.key) {
            score += 5;
        }
    }
};

var createSilos = {
    'level1': function () {
        constructionElements.level1 = game.add.group();

        var silo1 = constructionElements.level1.create(800, 280, 'silo');
        var block1 = constructionElements.level1.create(0, 0, 'block').alignTo(silo1, Phaser.TOP_LEFT, 0);
        var silo2 = constructionElements.level1.create(0, 0, 'silo').alignTo(block1, Phaser.BOTTOM_RIGHT, 0);
        var silo3 = constructionElements.level1.create(0, 0, 'silo').alignTo(block1, Phaser.TOP_LEFT, 0);
        var silo4 = constructionElements.level1.create(0, 0, 'silo').alignTo(block1, Phaser.TOP_RIGHT, 0);
        var block2 = constructionElements.level1.create(0, 0, 'block').alignTo(silo3, Phaser.TOP_LEFT, 0);

        var constructions = [silo1, silo2, silo3, silo4, block1, block2];
        game.physics.arcade.enable(constructions);

        silo1.body.collideWorldBounds = true;
        silo1.body.drag.x = 1000;
        silo2.body.collideWorldBounds = true;
        silo2.body.drag.x = 1000;
        silo3.body.collideWorldBounds = true;
        silo3.body.drag.x = 1000;
        silo4.body.collideWorldBounds = true;
        silo4.body.drag.x = 1000;
        block1.body.collideWorldBounds = true;
        block1.body.drag.x = 1000;
        block2.body.collideWorldBounds = true;
        block2.body.drag.x = 1000;

        explosions.createMultiple(8, 'kaboom');
        explosions.forEach(
            function (element) {
                element.animations.add('kaboom');
            },
            constructions
        );
    },
    'level2': function () {
        constructionElements.level2 = game.add.group();

        var silo1 = constructionElements.level2.create(800, 280, 'silo');
        var block1 = constructionElements.level2.create(0, 0, 'block').alignTo(silo1, Phaser.TOP_LEFT, 0);
        var silo2 = constructionElements.level2.create(0, 0, 'silo').alignTo(block1, Phaser.BOTTOM_RIGHT, 0);
        var silo3 = constructionElements.level2.create(0, 0, 'silo').alignTo(block1, Phaser.TOP_LEFT, 0);
        var silo4 = constructionElements.level2.create(0, 0, 'silo').alignTo(block1, Phaser.TOP_RIGHT, 0);
        var block2 = constructionElements.level2.create(0, 0, 'block').alignTo(silo3, Phaser.TOP_LEFT, 0);
        var silo5 = constructionElements.level2.create(0, 0, 'silo').alignTo(block2, Phaser.TOP_CENTER, 0);

        var constructions = [silo1, silo2, silo3, silo4, silo5, block1, block2];
        game.physics.arcade.enable(constructions);

        silo1.body.collideWorldBounds = true;
        silo1.body.drag.x = 1000;
        silo2.body.collideWorldBounds = true;
        silo2.body.drag.x = 1000;
        silo3.body.collideWorldBounds = true;
        silo3.body.drag.x = 1000;
        silo4.body.collideWorldBounds = true;
        silo4.body.drag.x = 1000;
        silo5.body.collideWorldBounds = true;
        silo5.body.drag.x = 1000;
        block1.body.collideWorldBounds = true;
        block1.body.drag.x = 1000;
        block2.body.collideWorldBounds = true;
        block2.body.drag.x = 1000;

        explosions.createMultiple(8, 'kaboom');
        explosions.forEach(
            function (element) {
                element.animations.add('kaboom');
            },
            constructions
        );
    }
};
