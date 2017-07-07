var game = new Phaser.Game(
    1200,
    600,
    Phaser.CANVAS,
    'ass-2017',
    { preload: preload, create: create, update: update, render: render }
);

var akene;
var akeneLayer;
var analog;
var arrow;
var ball;
var boing;
var effects;
var explosion;
var explosions;
var francois;
var laugh;
var levelText;
var music;
var nico
var physicGround;
var renee;
var scoreText;
var shoots;
var shootingsText;
var tobi;

var catchFlag = false;
var isLaunched = false;
var laughNumber = 0;

var level = 0;
var score = 0;
var time = 0;

var characters = {};
var constructionElements = {};

function preload() {
    game.world.setBounds(0, 0, 1200, 600);

    // Splash screen
    game.load.image('splash', 'assets/sprites/splash.png');

    // Define the appearance of the world
    game.load.image('backgroud', 'assets/backgrounds/Angry_Ziggy_Background.jpg');
    game.load.image('cliffs', 'assets/sprites/cliffs.png');
    game.load.image('ziggy', 'assets/sprites/ziggy.png');
    game.load.image('eggs', 'assets/sprites/Angry_Ziggy_Eggs.png');

    // Define the "interactive" part
    game.load.image('ground', 'assets/sprites/ground.png');
    game.load.image('analog', 'assets/sprites/fusia.png');
    game.load.image('arrow', 'assets/sprites/arrow.png');
    game.load.image('ball', 'assets/sprites/Angry_Ziggy_Egg.png');
    game.load.spritesheet('kaboom', 'assets/spritesheet/explode.png', 128, 128);
    game.load.image('Francois', 'assets/sprites/Francois.png');
    game.load.image('Nico', 'assets/sprites/Nico.png');
    game.load.image('Renee', 'assets/sprites/Renee.png');
    game.load.image('Tobi', 'assets/sprites/Tobi.png');

    // Define the construct pieces
    game.load.image('block', 'assets/sprites/block.png');
    game.load.image('silo', 'assets/sprites/silo.png');

    // Fonts
    game.load.bitmapFont('angryfont', 'assets/fonts/angryfont.png', 'assets/fonts/angryfont.fnt');
    game.load.image('akene', 'assets/sprites/akene.png');

    // Sounds
    game.load.audio('backgroundmusic', 'assets/audio/background.mp3');
    game.load.audio('magicaleffects', 'assets/audio/magical_horror_audiosprite.mp3');
    game.load.audio('boingeffect', 'assets/audio/boing.wav');
    game.load.audio('laugheffect', 'assets/audio/laugh.mp3');
}

function create() {
    level++;
    shoots = 3;

    /*******************************/
    /* Define the world appearance */
    /*******************************/

    var backgroundLayer = game.add.group();
    var cliffsLayer = game.add.group();
    var ziggyLayer = game.add.group();
    var eggsLayer = game.add.group();

    backgroundLayer.create(0, 0, 'backgroud');
    cliffsLayer.create(0, 0, 'cliffs');
    ziggyLayer.create(40, 330, 'ziggy');
    eggsLayer.create(20, 480, 'eggs');

    levelText = game.add.bitmapText(50, 30, 'angryfont', 'level: ' + level, 48);
    shootingsText = game.add.bitmapText(250, 50, 'angryfont', 'shoots left: ' + shoots, 24);
    scoreText = game.add.bitmapText(50, 120, 'angryfont', 'score: ' + score, 36);

    akeneLayer = game.add.group();
    akene = akeneLayer.create(180, 120, 'akene');

    /*********************/
    /* Define the sounds */
    /*********************/

    music = game.add.audio('backgroundmusic');
    music.mute = false;
    music.volume = 0.5;
    music.play();

    effects = game.add.audio('magicaleffects');
    effects.allowMultiple = false;
    effects.addMarker('fireball', 8, 5.2);

    boing = game.add.audio('boingeffect');
    boing.allowMultiple = false;
    boing.addMarker('boing', 8, 5.2);

    laugh = game.add.audio('laugheffect');
    laugh.allowMultiple = true;
    laugh.addMarker('laugh1', 0, 2.0);
    laugh.addMarker('laugh2', 3.2, 2.0);
    laugh.addMarker('laugh3', 27.4, 2.0);
    laugh.addMarker('laugh4', 6.4, 7.0);

    /***************************/
    /* Define the game physics */
    /***************************/

    explosions = game.add.group();

    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.arcade.gravity.y = 1500;

    analog = game.add.sprite(278, 365, 'analog');
    game.physics.enable(analog, Phaser.Physics.ARCADE);
    analog.body.allowGravity = false;
    analog.width = 8;
    analog.rotation = 220;
    analog.alpha = 0;
    analog.anchor.setTo(0.5, 0.0);

    arrow = game.add.sprite(278, 365, 'arrow');
    game.physics.enable(arrow, Phaser.Physics.ARCADE);
    arrow.anchor.setTo(0.1, 0.5);
    arrow.body.moves = false;
    arrow.body.allowGravity = false;
    arrow.alpha = 0;

    physicGround = game.add.tileSprite(450, 500, 750, 40, 'ground');
    game.physics.enable(physicGround, Phaser.Physics.ARCADE);
    physicGround.body.collideWorldBounds = true;
    physicGround.body.immovable = true;
    physicGround.body.allowGravity = false;
    physicGround.visible = false;

    createBall();
    createSilos['level' + level]();
}

function update() {
    levelText.text = 'Level: ' + level;
    shootingsText.text = 'Shoots left: ' + shoots;
    scoreText.text = 'Score: ' + score;

    if (1 <= score / 10 && 10 > score / 100) {
        akene.destroy();
        akene = akeneLayer.create(195, 120, 'akene');
    }

    if (1 <= score / 100 && 10 > score / 1000) {
        akene.destroy();
        akene = akeneLayer.create(215, 120, 'akene');
    }

    if (1 <= score / 1000) {
        akene.destroy();
        akene = akeneLayer.create(235, 120, 'akene');
    }

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
    game.debug.text('Laugh: ' + laughNumber, 10, 10);
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
    ball = game.add.sprite(276, 370, 'ball');

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
        effects.play('fireball');

        if ('silo' === element.key) {
            score += 20;

            if (true === element.charater) {
                laughNumber++;

                effects.play('fireball');
                laugh.play('laugh' + laughNumber);
            }
        }

        if ('block' === element.key) {
            score += 5;
        }
    }
};

var createSilos = {
    'level1': function () {
        characters.level1 = game.add.group();
        constructionElements.level1 = game.add.group();

        francois = characters.level1.create(850, 450, 'Francois');
        tobi = characters.level1.create(922, 450, 'Tobi');

        var silo1 = constructionElements.level1.create(850, 400, 'silo');
        var block1 = constructionElements.level1.create(0, 0, 'block').alignTo(silo1, Phaser.TOP_LEFT, 0);
        var silo2 = constructionElements.level1.create(0, 0, 'silo').alignTo(block1, Phaser.BOTTOM_RIGHT, 0);

        var silo3 = constructionElements.level1.create(0, 0, 'silo').alignTo(block1, Phaser.TOP_LEFT, 0);
        var silo4 = constructionElements.level1.create(0, 0, 'silo').alignTo(block1, Phaser.TOP_RIGHT, 0);
        var block2 = constructionElements.level1.create(0, 0, 'block').alignTo(silo3, Phaser.TOP_LEFT, 0);

        var constructions = [silo1, silo2, silo3, silo4, block1, block2];
        game.physics.arcade.enable(constructions);

        silo1.body.collideWorldBounds = true;
        silo1.body.drag.x = 1000;
        silo1.charater = true;
        silo2.body.collideWorldBounds = true;
        silo2.body.drag.x = 1000;
        silo2.charater = true;
        silo3.body.collideWorldBounds = true;
        silo3.body.drag.x = 1000;
        silo3.charater = false;
        silo4.body.collideWorldBounds = true;
        silo4.body.drag.x = 1000;
        silo4.charater = false;
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
        francois.destroy();
        tobi.destroy();

        characters.level2 = game.add.group();
        constructionElements.level2 = game.add.group();

        nico = characters.level2.create(850, 450, 'Nico');
        renee = characters.level2.create(992, 450, 'Renee');

        var silo1 = constructionElements.level2.create(850, 400, 'silo');
        var block1 = constructionElements.level2.create(0, 0, 'block').alignTo(silo1, Phaser.TOP_LEFT, 0);
        var silo2 = constructionElements.level2.create(0, 0, 'silo').alignTo(block1, Phaser.BOTTOM_RIGHT, 0);
        var block2 = constructionElements.level2.create(0, 0, 'block').alignTo(silo2, Phaser.TOP_LEFT, 0);
        var silo3 = constructionElements.level2.create(0, 0, 'silo').alignTo(block2, Phaser.BOTTOM_RIGHT, 0);

        var silo4 = constructionElements.level2.create(0, 0, 'silo').alignTo(block1, Phaser.TOP_CENTER, 0);
        var block3 = constructionElements.level2.create(0, 0, 'block').alignTo(silo4, Phaser.TOP_LEFT, 0);
        var silo5 = constructionElements.level2.create(0, 0, 'silo').alignTo(block2, Phaser.TOP_CENTER, 0);

        var constructions = [silo1, silo2, silo3, silo4, silo5, block1, block2, block3];
        game.physics.arcade.enable(constructions);

        silo1.body.collideWorldBounds = true;
        silo1.body.drag.x = 1000;
        silo1.charater = true;
        silo2.body.collideWorldBounds = true;
        silo2.body.drag.x = 1000;
        silo2.charater = false;
        silo3.body.collideWorldBounds = true;
        silo3.body.drag.x = 1000;
        silo3.charater = true;
        silo4.body.collideWorldBounds = true;
        silo4.body.drag.x = 1000;
        silo4.charater = false;
        silo5.body.collideWorldBounds = true;
        silo5.body.drag.x = 1000;
        silo5.charater = false;
        block1.body.collideWorldBounds = true;
        block1.body.drag.x = 1000;
        block2.body.collideWorldBounds = true;
        block2.body.drag.x = 1000;
        block3.body.collideWorldBounds = true;
        block3.body.drag.x = 1000;

        explosions.createMultiple(8, 'kaboom');
        explosions.forEach(
            function (element) {
                element.animations.add('kaboom');
            },
            constructions
        );
    }
};
