var mainMenu = './secciones/inicio.js';

var jugador = {};
var player;

var showDebug = false;

var map;
var tileset;

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

        // Escena Mapa Principal
        this.load.image("tiles", "img/map/tuxmon-sample.png");
        this.load.tilemapTiledJSON("map", "json/mapagame.json");
        this.load.atlas("atlas", "img/assets/atlas/atlas.png", "img/assets/atlas/atlas.json");

        // Escena Mapa Casa 1
        this.load.image("tilesCasa1", "img/map/Learnding.png");
        this.load.tilemapTiledJSON("mapCasa1", "json/Casa1.json");

        //Carga base de las demas casas
        this.load.image("tilesCasaBase", "img/map/pokemon_date.png");

        // Escena Mapa Casa 2
        this.load.tilemapTiledJSON("mapCasa2", "json/Casa2.json");

        // Escena Mapa Casa 3
        this.load.tilemapTiledJSON("mapCasa3", "json/Casa3.json");

        // Escena Mapa Casa 4
        this.load.tilemapTiledJSON("mapCasa4", "json/Casa4.json");

        // Escena Mapa Casa 5
        this.load.tilemapTiledJSON("mapCasa5", "json/Casa5.json");

        // Escena Mapa Casa 6
        this.load.tilemapTiledJSON("mapCasa6", "json/casa6.json");

        getAPI("http://localhost:3800/api/v0/jugadores/5b9ee888989cae2a7e9d49b3").done(function (response) {
            jugador = response;
        }).catch(function(err) {
            alert(err);
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
            if (!jugador.mundo) {
                this.scene.start('game');
            } else {
                this.scene.start(jugador.mundo);
            }
        }, this);

        jugador.lastSesion = Date.now();
        putAPI("http://localhost:3800/api/v0/jugadores/5b9ee888989cae2a7e9d49b3", jugador)
            .done(function (response) {
                jugador = response;
            }).catch(function(err) {
                alert(err);
            });
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

        map = this.make.tilemap({ key: "map" });

        tileset = map.addTilesetImage("tuxmon-sample", "tiles");

        var belowLayer = map.createStaticLayer("main", tileset, 0, 0).setScale(3);
        var worldLayer = map.createStaticLayer("Colisiones", tileset, 0, 0).setScale(3);
        var doorLayer = map.createStaticLayer("Puertas", tileset, 0, 0).setScale(3);

        worldLayer.setCollisionByProperty({ collides: true });
        belowLayer.setCollisionByProperty({ collides: true });
        doorLayer.setCollisionByProperty({ collides: true });

        if (!jugador.mundo) {
            var spawnPoint = map.findObject("Objetos", obj => obj.name === "Spawn Point");
            player = this.physics.add
                .sprite(spawnPoint.x*3, spawnPoint.y*3, "atlas", "misa-front")
                .setSize(30, 40)
                .setOffset(0, 24);
            jugador.mundo = "game";
            jugador.x = spawnPoint.x*3;
            jugador.y = spawnPoint.y*3;

            console.log(jugador);
            putAPI("http://localhost:3800/api/v0/jugadores/5b9ee888989cae2a7e9d49b3", jugador).done(function (response) {
                jugador = response;
            }).catch(function(err) {
                alert(err);
            });
        } else if (jugador.mundo != "game") {
            jugador.mundo = "game";
            player = this.physics.add
                .sprite(jugador.mundoX, jugador.mundoY, "atlas", "misa-front")
                .setSize(30, 40)
                .setOffset(0, 24);
            jugador.mundo = "game";
        } else {
            player = this.physics.add
                .sprite(jugador.x, jugador.y, "atlas", "misa-front")
                .setSize(30, 40)
                .setOffset(0, 24);
        }

        this.physics.add.collider(player, worldLayer);
        this.physics.add.collider(player, belowLayer);
        this.physics.add.collider(player, doorLayer, function(pos) {
            jugador.x = pos.x;
            jugador.y = pos.y + 20;
            jugador.mundoX = pos.x;
            jugador.mundoY = pos.y + 20;
            switch (seleccionPuerta(pos.x, pos.y)) {
            case "estructura":
                console.log("estructura");
                jugador.mundo = "estructura";
                this.scene.start("house2");
                break;
            case "centroCuracion":
                console.log("centroPokemon");
                jugador.mundo = "centroPokemon";
                this.scene.start("house4");
                break;
            case "casaSpawn":
                console.log("casaSpawn");
                jugador.mundo = "house1";
                this.scene.start("house1");
                break;
            case "casaMadera":
                console.log("casaMadera");
                jugador.mundo = "casaMadera";
                this.scene.start("house3");
                break;
            case "casaJaponesa":
                console.log("casaJaponesa");
                jugador.mundo = "casaJaponesa";
                this.scene.start("house5");
                break;
            case "casaAzul":
                console.log("casaAzul");
                jugador.mundo = "casaAzul";
                this.scene.start("house6");
                break;
            }
        }, null, this);

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

        var camera = this.cameras.main;
        camera.startFollow(player);
        camera.setBounds(0, 0, map.widthInPixels*3, map.heightInPixels*3);

        cursors = this.input.keyboard.createCursorKeys();
    },

    update: function (time, delta)
    {
        const speed = 175;
        const prevVelocity = player.body.velocity.clone();
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

    }

});

var House1 = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function House1 ()
    {
        Phaser.Scene.call(this, { key: 'house1' });
        window.GAME = this;
        this.controls;
    },

    create: function ()
    {
        console.log('%c House1 ', 'background: green; color: white; display: block;');

        map = this.make.tilemap({ key: "mapCasa1" });

        tileset = map.addTilesetImage("Learnding", "tilesCasa1");

        var pisoCasa1 = map.createStaticLayer("Piso", tileset, 0, 0).setScale(1.5);
        var paredCasa1 = map.createStaticLayer("Pared", tileset, 0, 0).setScale(1.5);
        var accesoriosCasa1 = map.createStaticLayer("Accesorios", tileset, 0, 0).setScale(1.5);
        var salidaCasa1 = map.createStaticLayer("Salida", tileset, 0, 0).setScale(1.5);

        paredCasa1.setCollisionByProperty({ collides: true });
        accesoriosCasa1.setCollisionByProperty({ collides: true });
        salidaCasa1.setCollisionByProperty({ collides: true });

        var spawnPoint = map.findObject("Objetos", obj => obj.name === "Spawn Point");

        player = this.physics.add
            .sprite( spawnPoint.x*1.5, spawnPoint.y*1.5, "atlas", "misa-front")
            .setSize(30, 40)
            .setOffset(0, 24);
        jugador.x = spawnPoint.x*1.5;
        jugador.y = spawnPoint.y*1.5;

        this.physics.add.collider(player, pisoCasa1);
        this.physics.add.collider(player, paredCasa1);
        this.physics.add.collider(player, salidaCasa1, function() {
            this.scene.start("game");
        }, null, this);

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

        var camera = this.cameras.main;
        camera.startFollow(player);
        camera.setBounds(0, 0, map.widthInPixels*3, map.heightInPixels*3);

        cursors = this.input.keyboard.createCursorKeys();
    },

    update: function (time, delta)
    {
        const speed = 175;
        const prevVelocity = player.body.velocity.clone();
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

    }

});


var House2 = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function House2 ()
    {
        Phaser.Scene.call(this, { key: 'house2' });
        window.GAME = this;
        this.controls;
    },

    create: function ()
    {
        console.log('%c House2 ', 'background: green; color: white; display: block;');

        map = this.make.tilemap({ key: "mapCasa2" });

        tileset = map.addTilesetImage("pokemon_date", "tilesCasaBase");

        var pisoCasa2 = map.createStaticLayer("Piso", tileset, 0, 0).setScale(2);
        var paredCasa2 = map.createStaticLayer("Pared", tileset, 0, 0).setScale(2);
        var accesoriosCasa2 = map.createStaticLayer("Objetos", tileset, 0, 0).setScale(2);
        var salidaCasa2 = map.createStaticLayer("Salida", tileset, 0, 0).setScale(2);

        paredCasa2.setCollisionByProperty({ collision: true });
        accesoriosCasa2.setCollisionByProperty({ collision: true });
        salidaCasa2.setCollisionByProperty({ collision: true });

        var spawnPoint = map.findObject("Spawn", obj => obj.name === "Spawn Point");

        player = this.physics.add
            .sprite( spawnPoint.x*2, spawnPoint.y*2, "atlas", "misa-front")
            .setSize(30, 40)
            .setOffset(0, 24);
        jugador.x = spawnPoint.x*2;
        jugador.y = spawnPoint.y*2;

        this.physics.add.collider(player, accesoriosCasa2);
        this.physics.add.collider(player, paredCasa2);
        this.physics.add.collider(player, salidaCasa2, function() {
            this.scene.start("game");
        }, null, this);

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

        var camera = this.cameras.main;
        camera.startFollow(player);
        camera.setBounds(0, 0, map.widthInPixels*3, map.heightInPixels*3);

        cursors = this.input.keyboard.createCursorKeys();
    },

    update: function (time, delta)
    {
        const speed = 175;
        const prevVelocity = player.body.velocity.clone();
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

    }

});

var House3 = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function House3 ()
    {
        Phaser.Scene.call(this, { key: 'house3' });
        window.GAME = this;
        this.controls;
    },

    create: function ()
    {
        console.log('%c House3 ', 'background: green; color: white; display: block;');

        map = this.make.tilemap({ key: "mapCasa3" });

        tileset = map.addTilesetImage("pokemon_date", "tilesCasaBase");

        var pisoCasa3 = map.createStaticLayer("Piso", tileset, 0, 0).setScale(2);
        var paredCasa3 = map.createStaticLayer("Pared", tileset, 0, 0).setScale(2);
        var accesoriosCasa3 = map.createStaticLayer("Objetos", tileset, 0, 0).setScale(2);
        var salidaCasa3 = map.createStaticLayer("Salida", tileset, 0, 0).setScale(2);

        paredCasa3.setCollisionByProperty({ collide: true });
        accesoriosCasa3.setCollisionByProperty({ collide: true });
        salidaCasa3.setCollisionByProperty({ collide: true });

        var spawnPoint = map.findObject("Spawn", obj => obj.name === "Spawn Point");

        player = this.physics.add
            .sprite( spawnPoint.x*2, spawnPoint.y*2, "atlas", "misa-front")
            .setSize(30, 40)
            .setOffset(0, 24);
        jugador.x = spawnPoint.x*2;
        jugador.y = spawnPoint.y*2;

        this.physics.add.collider(player, accesoriosCasa3);
        this.physics.add.collider(player, paredCasa3);
        this.physics.add.collider(player, salidaCasa3, function() {
            this.scene.start("game");
        }, null, this);

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

        var camera = this.cameras.main;
        camera.startFollow(player);
        camera.setBounds(0, 0, map.widthInPixels*3, map.heightInPixels*3);

        cursors = this.input.keyboard.createCursorKeys();
    },

    update: function (time, delta)
    {
        const speed = 175;
        const prevVelocity = player.body.velocity.clone();
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

    }

});

var House4 = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function House4 ()
    {
        Phaser.Scene.call(this, { key: 'house4' });
        window.GAME = this;
        this.controls;
    },

    create: function ()
    {
        console.log('%c House4 ', 'background: green; color: white; display: block;');

        map = this.make.tilemap({ key: "mapCasa4" });

        tileset = map.addTilesetImage("pokemon_date", "tilesCasaBase");

        var pisoCasa4 = map.createStaticLayer("Piso", tileset, 0, 0).setScale(2);
        var paredCasa4 = map.createStaticLayer("Pared", tileset, 0, 0).setScale(2);
        var accesoriosCasa4 = map.createStaticLayer("Objeto", tileset, 0, 0).setScale(2);
        var salidaCasa4 = map.createStaticLayer("Salida", tileset, 0, 0).setScale(2);

        paredCasa4.setCollisionByProperty({ collision: true });
        accesoriosCasa4.setCollisionByProperty({ collision: true });
        salidaCasa4.setCollisionByProperty({ collision: true });

        var spawnPoint = map.findObject("Spawn", obj => obj.name === "Spawn Point");

        player = this.physics.add
            .sprite( spawnPoint.x*2, spawnPoint.y*2, "atlas", "misa-front")
            .setSize(30, 40)
            .setOffset(0, 24);
        jugador.x = spawnPoint.x*2;
        jugador.y = spawnPoint.y*2;

        this.physics.add.collider(player, accesoriosCasa4);
        this.physics.add.collider(player, paredCasa4);
        this.physics.add.collider(player, salidaCasa4, function() {
            this.scene.start("game");
        }, null, this);

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

        var camera = this.cameras.main;
        camera.startFollow(player);
        camera.setBounds(0, 0, map.widthInPixels*3, map.heightInPixels*3);

        cursors = this.input.keyboard.createCursorKeys();
    },

    update: function (time, delta)
    {
        const speed = 175;
        const prevVelocity = player.body.velocity.clone();
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

    }

});

var House5 = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function House5 ()
    {
        Phaser.Scene.call(this, { key: 'house5' });
        window.GAME = this;
        this.controls;
    },

    create: function ()
    {
        console.log('%c House5 ', 'background: green; color: white; display: block;');

        map = this.make.tilemap({ key: "mapCasa5" });

        tileset = map.addTilesetImage("pokemon_date", "tilesCasaBase");

        var pisoCasa5 = map.createStaticLayer("Piso", tileset, 0, 0).setScale(2);
        var paredCasa5 = map.createStaticLayer("Pared", tileset, 0, 0).setScale(2);
        var accesoriosCasa5 = map.createStaticLayer("Objeto", tileset, 0, 0).setScale(2);
        var salidaCasa5 = map.createStaticLayer("Salida", tileset, 0, 0).setScale(2);

        paredCasa5.setCollisionByProperty({ collider: true });
        accesoriosCasa5.setCollisionByProperty({ collider: true });
        salidaCasa5.setCollisionByProperty({ collider: true });

        var spawnPoint = map.findObject("Spawn", obj => obj.name === "Spawn Point");

        player = this.physics.add
            .sprite( spawnPoint.x*2, spawnPoint.y*2, "atlas", "misa-front")
            .setSize(30, 40)
            .setOffset(0, 24);
        jugador.x = spawnPoint.x*2;
        jugador.y = spawnPoint.y*2;

        this.physics.add.collider(player, accesoriosCasa5);
        this.physics.add.collider(player, paredCasa5);
        this.physics.add.collider(player, salidaCasa5, function() {
            this.scene.start("game");
        }, null, this);

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

        var camera = this.cameras.main;
        camera.startFollow(player);
        camera.setBounds(0, 0, map.widthInPixels*3, map.heightInPixels*3);

        cursors = this.input.keyboard.createCursorKeys();
    },

    update: function (time, delta)
    {
        const speed = 175;
        const prevVelocity = player.body.velocity.clone();
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

    }

});

var House6 = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function House6 ()
    {
        Phaser.Scene.call(this, { key: 'house6' });
        window.GAME = this;
        this.controls;
    },

    create: function ()
    {
        console.log('%c House6 ', 'background: green; color: white; display: block;');

        map = this.make.tilemap({ key: "mapCasa6" });

        tileset = map.addTilesetImage("pokemon_date", "tilesCasaBase");

        var pisoCasa6 = map.createStaticLayer("Piso", tileset, 0, 0).setScale(2);
        var paredCasa6 = map.createStaticLayer("Pared", tileset, 0, 0).setScale(2);
        var accesoriosCasa6 = map.createStaticLayer("Objeto", tileset, 0, 0).setScale(2);
        var salidaCasa6 = map.createStaticLayer("Salida", tileset, 0, 0).setScale(2);

        paredCasa6.setCollisionByProperty({ collide: true });
        accesoriosCasa6.setCollisionByProperty({ collide: true });
        salidaCasa6.setCollisionByProperty({ collide: true });

        var spawnPoint = map.findObject("Spawn", obj => obj.name === "Spawn Point");

        player = this.physics.add
            .sprite( spawnPoint.x*2, spawnPoint.y*2, "atlas", "misa-front")
            .setSize(30, 40)
            .setOffset(0, 24);
        jugador.x = spawnPoint.x*2;
        jugador.y = spawnPoint.y*2;

        this.physics.add.collider(player, accesoriosCasa6);
        this.physics.add.collider(player, paredCasa6);
        this.physics.add.collider(player, salidaCasa6, function() {
            this.scene.start("game");
        }, null, this);

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

        var camera = this.cameras.main;
        camera.startFollow(player);
        camera.setBounds(0, 0, map.widthInPixels*3, map.heightInPixels*3);

        cursors = this.input.keyboard.createCursorKeys();
    },

    update: function (time, delta)
    {
        const speed = 175;
        const prevVelocity = player.body.velocity.clone();
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
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [ Preloader, MainMenu, Game, House1, House2, House3, House4, House5, House6, GameOver ]
};

var game = new Phaser.Game(config);

function seleccionPuerta(posX, posY) {
    var puertas = [
        {name: "estructura", x0: 4200, y0: 770, x1: 4300, y1: 780},
        {name: "centroCuracion", x0: 2900, y0: 3745, x1: 3010, y1: 3755},
        {name: "casaAzul",x0: 1455, y0: 3124, x1: 1476, y1: 3129},
        {name: "casaSpawn",x0: 455, y0: 340, x1: 468, y1: 345},
        {name: "casaMadera", x0: 639, y0: 2355, x1: 661, y1: 2362},
        {name: "casaJaponesa",x0: 2125, y0: 1252, x1: 2149, y1: 1257}];
    puertas = puertas.filter(function (pue) {
        return (pue.x0 <= posX && pue.x1 >= posX) && (pue.y0 <= posY && pue.y1 >= posY);
    });
    puertas = puertas.length <= 0 ? null : puertas[0].name;
    return puertas;
}
