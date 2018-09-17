var mainMenu = './secciones/inicio.js';

var jugador = {};

var Preloader = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function Preloader ()
    {
        Phaser.Scene.call(this, { key: 'preloader' });
    },

    preload: function ()
    {
        // Escena MainMenu
        this.load.image('buttonBG', 'img/assets/sky.png'); //Fondo
        this.load.image('buttonText', 'img/assets/mega-bola..png'); // Boton
        this.load.image('logoPokemon', 'img/Pokemon_logo.png'); // Logo
        this.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js'); //Tipografia

        // Escena Game Over
        this.load.image('ayu', 'img/assets/game_over.jpg');

        // Escena Game
        this.load.image('ball', 'img/assets/beball1.png');

        getAPI("http://localhost:3800/api/v0/jugadores/5b9ee888989cae2a7e9d49b3").done(function (response) {
            jugador = response;
        }).catch(function(err) {
            console.log(err);
        });
    },

    create: function ()
    {
        console.log('%c Preloader ', 'background: green; color: white; display: block;');
        if (jugador.dinero == 0) {
            this.scene.start('gameover');
        } else {
            this.scene.start('mainmenu');
        }
    }

});

var MainMenu = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function MainMenu ()
    {
        Phaser.Scene.call(this, { key: 'mainmenu' });
        window.MENU = this;
    },

    create: function ()
    {
        console.log('%c MainMenu ', 'background: green; color: white; display: block;');

        var bg = this.add.image(0, 0, 'buttonBG');
        var logo = this.add.image(0, -100, 'logoPokemon').setScale(2);
        var textConfig = {fontSize:'40px', color:'#000', fontFamily: 'Revalia'};
        var text = this.add.text(-350, 100, "Dinero Restante de "+jugador.alias+": " +jugador.dinero, textConfig);

        text.align = 'center';
        text.stroke = '#000000';
        text.strokeThickness = 2;
        text.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);

        var container = this.add.container(400, 300, [ bg, logo, text ]);

        bg.setInteractive();

        bg.once('pointerup', function () {
            this.scene.start('game');
        }, this);
    }

});

var Game = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function Game ()
    {
        Phaser.Scene.call(this, { key: 'game' });
        window.GAME = this;
        this.controls;
    },

    create: function ()
    {
        console.log('%c Game ', 'background: green; color: white; display: block;');

        this.matter.world.setBounds(0, 0, 800, 600, 32, true, true, false, true);

        //  Add in a stack of balls

        for (var i = 0; i < 64; i++)
        {
            var ball = this.matter.add.image(Phaser.Math.Between(100, 700), Phaser.Math.Between(-600, 0), 'ball');
            ball.setCircle();
            ball.setFriction(0.005);
            ball.setBounce(1);
        }

        var cursors = this.input.keyboard.createCursorKeys();

        var controlConfig = {
            camera: this.cameras.main,
            left: cursors.left,
            right: cursors.right,
            up: cursors.up,
            down: cursors.down,
            zoomIn: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
            zoomOut: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
            acceleration: 0.06,
            drag: 0.0005,
            maxSpeed: 1.0
        };

        this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig);

        this.add.text(0, 0, 'Use Cursors to scroll camera.\nClick to Quit', { font: '18px Courier', fill: '#00ff00' }).setScrollFactor(0);

        this.input.once('pointerup', function () {

            this.scene.start('gameover');

        }, this);
    },

    update: function (time, delta)
    {
        this.controls.update(delta);
    }

});

var GameOver = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function GameOver ()
    {
        Phaser.Scene.call(this, { key: 'gameover' });
        window.OVER = this;
    },

    create: function ()
    {
        var camera = this.cameras.add(0, 0, 800, 560);
        camera.setBackgroundColor('rgba(255, 255, 255, 1)');

        console.log('%c GameOver ', 'background: green; color: white; display: block;');

        this.add.sprite(400, 300, 'ayu');
        this.add.text(100, 420, 'Gracias por Jugar '+jugador.alias, { font: '40px Cantarell', fill: '#000000' });
    }

});

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 560,
    parent: "game-container",
    physics: {
        default: 'matter',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [ Preloader, MainMenu, Game, GameOver ]
};

var player;
var showDebug = false;
var mapa="House1";

// Variables de variabilidad del Mapa
var spawnPoint = { x: 0, y: 0 };
var map;
var tileset;
var camera;

//var text;
var style;

var graphics;
var rect;

var game = new Phaser.Game(config);

function preload ()
{
    // Mapa Principal
    this.load.image("tiles", "img/map/tuxmon-sample.png");
    this.load.tilemapTiledJSON("map", "json/mapagame.json");
    this.load.atlas("atlas", "img/assets/atlas/atlas.png", "img/assets/atlas/atlas.json");

    // Mapa Casa 1
    this.load.image("tilesCasa1", "img/map/Learnding.png");
    this.load.tilemapTiledJSON("mapCasa1", "json/Casa1.json");
}

function create ()
{
    if (mapa == "Principal") {
        map = this.make.tilemap({ key: "map" });

        tileset = map.addTilesetImage("tuxmon-sample", "tiles");

        var belowLayer = map.createStaticLayer("main", tileset, 0, 0).setScale(3);
        var worldLayer = map.createStaticLayer("Colisiones", tileset, 0, 0).setScale(3);

        worldLayer.setCollisionByProperty({ collides: true });
        belowLayer.setCollisionByProperty({ collides: true });

        spawnPoint = map.findObject("Objetos", obj => obj.name === "Spawn Point");
    } else if (mapa == "House1") {
        map = this.make.tilemap({ key: "mapCasa1" });

        tileset = map.addTilesetImage("Learnding", "tilesCasa1");

        var pisoCasa1 = map.createStaticLayer("Piso", tileset, 0, 0).setScale(1.5);
        var paredCasa1 = map.createStaticLayer("Pared", tileset, 0, 0).setScale(1.5);
        var accesoriosCasa1 = map.createStaticLayer("Accesorios", tileset, 0, 0).setScale(1.5);

        rect = new Phaser.Geom.Rectangle(250, 200, 300, 200);

        graphics = this.add.graphics({ fillStyle: { color: 0x0000ff } });

        graphics.fillRectShape(rect);

        paredCasa1.setCollisionByProperty({ collides: true });
        accesoriosCasa1.setCollisionByProperty({ collides: true });

        spawnPoint = map.findObject("Objetos", obj => obj.name === "Spawn Point");
    } else if (mapa == "House2") {
        style = { font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };

        //  The Text is positioned at 0, 100
        text = this.add.text(0, 0, "House2", style);
        text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
    } else if (mapa == "House3") {
        var style = { font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };

        //  The Text is positioned at 0, 100
        text = this.add.text(0, 0, "House3", style);
        text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
    }

    player = this.physics.add
        .sprite(spawnPoint.x, spawnPoint.y, "atlas", "misa-front")
        .setSize(30, 40)
        .setOffset(0, 24);

    // Principal
    this.physics.add.collider(player, worldLayer);
    this.physics.add.collider(player, belowLayer);
    // Casa1
    this.physics.add.collider(player, paredCasa1);
    this.physics.add.collider(player, accesoriosCasa1);

    var anims = this.anims;
    anims.create({
        key: "misa-left-walk",
        frames: anims.generateFrameNames("atlas", { prefix: "misa-left-walk.", start: 0, end: 3, zeroPad: 3 }),
        frameRate: 10,
        repeat: -1
    });
    anims.create({
        key: "misa-right-walk",
        frames: anims.generateFrameNames("atlas", { prefix: "misa-right-walk.", start: 0, end: 3, zeroPad: 3 }),
        frameRate: 10,
        repeat: -1
    });
    anims.create({
        key: "misa-front-walk",
        frames: anims.generateFrameNames("atlas", { prefix: "misa-front-walk.", start: 0, end: 3, zeroPad: 3 }),
        frameRate: 10,
        repeat: -1
    });
    anims.create({
        key: "misa-back-walk",
        frames: anims.generateFrameNames("atlas", { prefix: "misa-back-walk.", start: 0, end: 3, zeroPad: 3 }),
        frameRate: 10,
        repeat: -1
    });

    camera = this.cameras.main;
    camera.startFollow(player);
    if (mapa == "Principal") {
        camera.setBounds(0, 0, map.widthInPixels*3, map.heightInPixels*3);
    }

    cursors = this.input.keyboard.createCursorKeys();
}

function update (time, delta)
{
    const speed = 175;
    const prevVelocity = player.body.velocity.clone();

    // Stop any previous movement from the last frame
    player.body.setVelocity(0);

    // Horizontal movement
    if (cursors.left.isDown) {
        player.body.setVelocityX(-speed);
    } else if (cursors.right.isDown) {
        player.body.setVelocityX(speed);
    }

    // Vertical movement
    if (cursors.up.isDown) {
        player.body.setVelocityY(-speed);
    } else if (cursors.down.isDown) {
        player.body.setVelocityY(speed);
    }

    // Normalize and scale the velocity so that player can't move faster along a diagonal
    player.body.velocity.normalize().scale(speed);

    // Update the animation last and give left/right animations precedence over up/down animations
    if (cursors.left.isDown) {
        player.anims.play("misa-left-walk", true);
    } else if (cursors.right.isDown) {
        player.anims.play("misa-right-walk", true);
    } else if (cursors.up.isDown) {
        player.anims.play("misa-back-walk", true);
    } else if (cursors.down.isDown) {
        player.anims.play("misa-front-walk", true);
    } else {
        player.anims.stop();

        // If we were moving, pick and idle frame to use
        if (prevVelocity.x < 0) player.setTexture("atlas", "misa-left");
        else if (prevVelocity.x > 0) player.setTexture("atlas", "misa-right");
        else if (prevVelocity.y < 0) player.setTexture("atlas", "misa-back");
        else if (prevVelocity.y > 0) player.setTexture("atlas", "misa-front");
    }

    this.physics.add.collider(player, rect, salidaCasa, null, this);
    this.physics.add.collider(player, graphics, salidaCasa, null, this);
}

function salidaCasa(sprite, tile) {
    mapa = "Principal";
    console.log("Hecho");
}
