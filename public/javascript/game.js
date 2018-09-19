// Hecho por Gabriel vargas Monroy

var jugador = {};
var player;

var score;

var protocolo = 'http';
var pc = 'localhost';
var puerto = 3800;
var resFul = '/api/v0';

var linkSer = protocolo + "://"+pc+":"+puerto+resFul;

var playerId;

var showDebug = false;

var map;
var tileset;

var gameOptions = {
    // slices (prizes) placed in the wheel
    slices: 8,
    // prize names, starting from 12 o'clock going clockwise
    slicePrizes: ["A KEY!!!", "50 STARS", "500 STARS", "BAD LUCK!!!", "200 STARS", "100 STARS", "150 STARS", "BAD LUCK!!!"],
    // wheel rotation duration, in milliseconds
    rotationTime: 3000
}

var Preloader = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function Preloader ()
    {
        Phaser.Scene.call(this, { key: 'preloader' });
        playerId = obtenerID(location.href);
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
        this.load.image("personaje1", "img/assets/personaje1.png");

        //Carga base de imagenes de las demas casas
        this.load.image("tilesCasaBase", "img/map/pokemon_date.png");

        // Escena Mapa Casa 2
        this.load.tilemapTiledJSON("mapCasa2", "json/Casa2.json");
        this.load.image("personaje2", "img/assets/personaje2.png");

        // Escena Mapa Casa 3
        this.load.tilemapTiledJSON("mapCasa3", "json/Casa3.json");
        this.load.image("personaje3", "img/assets/personaje3.png");

        // Escena Mapa Casa 4
        this.load.tilemapTiledJSON("mapCasa4", "json/Casa4.json");
        this.load.image("personaje4", "img/assets/personaje4.png");

        // Escena Mapa Casa 5
        this.load.tilemapTiledJSON("mapCasa5", "json/Casa5.json");
        this.load.image("personaje5", "img/assets/personaje5.png");

        // Escena Mapa Casa 6
        this.load.tilemapTiledJSON("mapCasa6", "json/casa6.json");
        this.load.image("personaje6", "img/assets/personaje6.png");

        // Escena Juego
        this.load.image("wheel", "img/assets/wheel.png");
        this.load.image("pin", "img/assets/pin.png");
    },

    create: function ()
    {
        console.log('%c Preloader ', 'background: green; color: white; display: block;');

        getAPI(linkSer+"/jugadores/"+playerId)
            .done(function (response) {
                jugador = response;
                if (!jugador) {
                    redireccionar();
                }
            }).catch(function(err) {
                redireccionar();
            });
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
        putAPI(linkSer+"/jugadores/"+playerId, jugador)
            .done(function (response) {
                console.log(response);
            }).catch(function(err) {
                redireccionar();
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
        getAPI(linkSer+"/jugadores/"+playerId).done(function (response) {
            jugador = response;
        }).catch(function(err) {
            redireccionar();
        });
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

            putAPI(linkSer+"/jugadores/"+playerId, jugador).done(function (response) {
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
                jugador.mundo = "house2";
                this.scene.start("house2");
                break;
            case "centroCuracion":
                console.log("centroPokemon");
                jugador.mundo = "house4";
                this.scene.start("house4");
                break;
            case "casaSpawn":
                console.log("casaSpawn");
                //jugador.mundo = "house1";
                //this.scene.start("house1");
                this.scene.start("PlayGame");
                break;
            case "casaMadera":
                console.log("casaMadera");
                jugador.mundo = "house3";
                this.scene.start("house3");
                break;
            case "casaJaponesa":
                console.log("casaJaponesa");
                jugador.mundo = "house5";
                this.scene.start("house5");
                break;
            case "casaAzul":
                console.log("casaAzul");
                jugador.mundo = "house6";
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

        this.add
            .text(16, 16, jugador.alias + "\n Dinero Acumulado: " + jugador.dinero + "\nPulsa Q para guardar", {
                font: "18px monospace",
                fill: "#000000",
                padding: { x: 20, y: 10 },
                backgroundColor: "#ffffff",
                border: "2px solid"
            })
            .setScrollFactor(0);

        var camera = this.cameras.main;
        camera.startFollow(player);
        camera.setBounds(0, 0, map.widthInPixels*3, map.heightInPixels*3);

        this.key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        cursors = this.input.keyboard.createCursorKeys();
    },

    update: function (time, delta)
    {
        const speed = 175;
        const prevVelocity = player.body.velocity.clone();
        player.body.setVelocity(0);

        if (this.key.isDown) {
            //Guardar Juego
            jugador.x = player.x;
            jugador.y = player.y;
            putAPI(linkSer+"/jugadores/"+playerId, jugador)
                .done(function (datos) {
                    if (datos.ok == 1) {
                        console.log("Hecho Correctamente");
                    }
                })
                .catch(function (err) {
                    redireccionar();
                });
        }

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

        var retador = this.add.sprite(100, 300, 'personaje1').setScale(2);

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
        this.physics.add.collider(player, retador, function(x) {
            console.log(x);
        });

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

        this.add
            .text(16, 16, jugador.alias + "\n Dinero Acumulado: " + jugador.dinero + "\nPulsa Q para guardar", {
                font: "18px monospace",
                fill: "#000000",
                padding: { x: 20, y: 10 },
                backgroundColor: "#ffffff",
                border: "2px solid"
            })
            .setScrollFactor(0);

        var camera = this.cameras.main;
        camera.startFollow(player);
        camera.setBounds(0, 0, map.widthInPixels*3, map.heightInPixels*3);

        this.key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        cursors = this.input.keyboard.createCursorKeys();
    },

    update: function (time, delta)
    {
        const speed = 175;
        const prevVelocity = player.body.velocity.clone();
        player.body.setVelocity(0);

        if (this.key.isDown) {
            //Guardar Juego
            jugador.x = player.x;
            jugador.y = player.y;
            putAPI(linkSer+"/jugadores/"+playerId, jugador)
                .done(function (datos) {
                    if (datos.ok == 1) {
                        console.log("Hecho Correctamente");
                    }
                })
                .catch(function (err) {
                    direccionar();
                });
        }

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

        this.add
            .text(16, 16, jugador.alias + "\n Dinero Acumulado: " + jugador.dinero + "\nPulsa Q para guardar", {
                font: "18px monospace",
                fill: "#000000",
                padding: { x: 20, y: 10 },
                backgroundColor: "#ffffff",
                border: "2px solid"
            })
            .setScrollFactor(0);

        var camera = this.cameras.main;
        camera.startFollow(player);
        camera.setBounds(0, 0, map.widthInPixels*3, map.heightInPixels*3);

        this.key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        cursors = this.input.keyboard.createCursorKeys();
    },

    update: function (time, delta)
    {
        const speed = 175;
        const prevVelocity = player.body.velocity.clone();
        player.body.setVelocity(0);

        if (this.key.isDown) {
            //Guardar Juego
            jugador.x = player.x;
            jugador.y = player.y;
            putAPI(linkSer+"/jugadores/"+playerId, jugador)
                .done(function (datos) {
                    if (datos.ok == 1) {
                        console.log("Hecho Correctamente");
                    }
                })
                .catch(function (err) {
                    redireccionar();
                });
        }

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

        this.add
            .text(16, 16, jugador.alias + "\n Dinero Acumulado: " + jugador.dinero + "\nPulsa Q para guardar", {
                font: "18px monospace",
                fill: "#000000",
                padding: { x: 20, y: 10 },
                backgroundColor: "#ffffff",
                border: "2px solid"
            })
            .setScrollFactor(0);

        var camera = this.cameras.main;
        camera.startFollow(player);
        camera.setBounds(0, 0, map.widthInPixels*3, map.heightInPixels*3);

        this.key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        cursors = this.input.keyboard.createCursorKeys();
    },

    update: function (time, delta)
    {
        const speed = 175;
        const prevVelocity = player.body.velocity.clone();
        player.body.setVelocity(0);

        if (this.key.isDown) {
            //Guardar Juego
            jugador.x = player.x;
            jugador.y = player.y;
            putAPI(linkSer+"/jugadores/"+playerId, jugador)
                .done(function (datos) {
                    if (datos.ok == 1) {
                        console.log("Hecho Correctamente");
                    }
                })
                .catch(function (err) {
                    redireccionar();
                });
        }

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

        this.add
            .text(16, 16, jugador.alias + "\n Dinero Acumulado: " + jugador.dinero + "\nPulsa Q para guardar", {
                font: "18px monospace",
                fill: "#000000",
                padding: { x: 20, y: 10 },
                backgroundColor: "#ffffff",
                border: "2px solid"
            })
            .setScrollFactor(0);

        var camera = this.cameras.main;
        camera.startFollow(player);
        camera.setBounds(0, 0, map.widthInPixels*3, map.heightInPixels*3);

        this.key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        cursors = this.input.keyboard.createCursorKeys();
    },

    update: function (time, delta)
    {
        const speed = 175;
        const prevVelocity = player.body.velocity.clone();
        player.body.setVelocity(0);

        if (this.key.isDown) {
            //Guardar Juego
            jugador.x = player.x;
            jugador.y = player.y;
            putAPI(linkSer+"/jugadores/"+playerId, jugador)
                .done(function (datos) {
                    if (datos.ok == 1) {
                        console.log("Hecho Correctamente");
                    }
                })
                .catch(function (err) {
                    redireccionar();
                });
        }

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

        this.add
            .text(16, 16, jugador.alias + "\n Dinero Acumulado: " + jugador.dinero + "\nPulsa Q para guardar", {
                font: "18px monospace",
                fill: "#000000",
                padding: { x: 20, y: 10 },
                backgroundColor: "#ffffff",
                border: "2px solid"
            })
            .setScrollFactor(0);

        var camera = this.cameras.main;
        camera.startFollow(player);
        camera.setBounds(0, 0, map.widthInPixels*3, map.heightInPixels*3);

        this.key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        cursors = this.input.keyboard.createCursorKeys();
    },

    update: function (time, delta)
    {
        const speed = 175;
        const prevVelocity = player.body.velocity.clone();
        player.body.setVelocity(0);

        if (this.key.isDown) {
            //Guardar Juego
            jugador.x = player.x;
            jugador.y = player.y;
            putAPI("http://localhost:3800/api/v0/jugadores/5b9ee888989cae2a7e9d49b3", jugador)
                .done(function (datos) {
                    if (datos.ok == 1) {
                        console.log("Hecho Correctamente");
                    }
                })
                .catch(function (err) {
                    redireccionar();
                });
        }

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

        this.add
            .text(16, 16, jugador.alias + "\n Dinero Acumulado: " + jugador.dinero + "\nPulsa Q para guardar", {
                font: "18px monospace",
                fill: "#000000",
                padding: { x: 20, y: 10 },
                backgroundColor: "#ffffff",
                border: "2px solid"
            })
            .setScrollFactor(0);

        var camera = this.cameras.main;
        camera.startFollow(player);
        camera.setBounds(0, 0, map.widthInPixels*3, map.heightInPixels*3);

        this.key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        cursors = this.input.keyboard.createCursorKeys();
    },

    update: function (time, delta)
    {
        const speed = 175;
        const prevVelocity = player.body.velocity.clone();
        player.body.setVelocity(0);

        if (this.key.isDown) {
            //Guardar Juego
            jugador.x = player.x;
            jugador.y = player.y;
            putAPI("http://localhost:3800/api/v0/jugadores/5b9ee888989cae2a7e9d49b3", jugador)
                .done(function (datos) {
                    if (datos.ok == 1) {
                        console.log("Hecho Correctamente");
                    }
                })
                .catch(function (err) {
                    redireccionar();
                });
        }

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

var Message = new Phaser.Class({

    Extends: Phaser.GameObjects.Container,

    initialize:
    function Message(scene, events) {
        Phaser.GameObjects.Container.call(this, scene, 160, 30);
        var graphics = this.scene.add.graphics();
        this.add(graphics);
        graphics.lineStyle(1, 0xffffff, 0.8);
        graphics.fillStyle(0x031f4c, 0.3);
        graphics.strokeRect(-90, -15, 180, 30);
        graphics.fillRect(-90, -15, 180, 30);
        this.text = new Phaser.GameObjects.Text(scene, 0, 0, "", { color: '#ffffff', align: 'center', fontSize: 13, wordWrap: { width: 160, useAdvancedWrap: true }});
        this.add(this.text);
        this.text.setOrigin(0.5);
        events.on("Message", this.showMessage, this);
        this.visible = false;
    },
    showMessage: function(text) {
        this.text.setText(text);
        this.visible = true;
        if(this.hideEvent)
            this.hideEvent.remove(false);
        this.hideEvent = this.scene.time.addEvent({ delay: 2000, callback: this.hideMessage, callbackScope: this });
    },
    hideMessage: function() {
        this.hideEvent = null;
        this.visible = false;
    }
});

// PlayGame scene
class playGame extends Phaser.Scene{
    // constructor
    constructor(){
        super("PlayGame");
    }
    // method to be executed once the scene has been created
    create(){
        // adding the wheel in the middle of the canvas
        this.wheel = this.add.sprite(game.config.width / 2, game.config.height / 2, "wheel");
        // adding the pin in the middle of the canvas
        this.pin = this.add.sprite(game.config.width / 2, game.config.height / 2, "pin");
        // adding the text field
        this.prizeText = this.add.text(game.config.width / 2, game.config.height - 20, "Spin the wheel", {
            font: "bold 32px Arial",
            align: "center",
            color: "white"
        });
        // center the text
        this.prizeText.setOrigin(0.5);
        // the game has just started = we can spin the wheel
        this.canSpin = true;
        // waiting for your input, then calling "spinWheel" function
        this.input.on("pointerdown", this.spinWheel, this);

        score = this.add
            .text(16, 16, jugador.alias + "\n Dinero Acumulado: " + jugador.dinero + "\nValor por Juego 100\nPresione Click para Apostart\nPresione S para salir", {
                font: "18px monospace",
                fill: "#000000",
                padding: { x: 20, y: 10 },
                backgroundColor: "#ffffff",
                border: "2px solid"
            })
            .setScrollFactor(0);
        this.key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    }
    // function to spin the wheel
    spinWheel(){
        // can we spin the wheel?
        if(this.canSpin){
            // resetting text field
            this.prizeText.setText("");
            // the wheel will spin round from 2 to 4 times. This is just coreography
            var rounds = Phaser.Math.Between(2, 4);
            // then will rotate by a random number from 0 to 360 degrees. This is the actual spin
            var degrees = Phaser.Math.Between(0, 360);
            // before the wheel ends spinning, we already know the prize according to "degrees" rotation and the number of slices
            var prize = gameOptions.slices - 1 - Math.floor(degrees / (360 / gameOptions.slices));
            // now the wheel cannot spin because it's already spinning
            this.canSpin = false;
            // animation tweeen for the spin: duration 3s, will rotate by (360 * rounds + degrees) degrees
            // the quadratic easing will simulate friction
            this.tweens.add({
                // adding the wheel to tween targets
                targets: [this.wheel],
                // angle destination
                angle: 360 * rounds + degrees,
                // tween duration
                duration: gameOptions.rotationTime,
                // tween easing
                ease: "Cubic.easeOut",
                // callback scope
                callbackScope: this,
                // function to be executed once the tween has been completed
                onComplete: function(tween){
                    // displaying prize text
                    this.prizeText.setText(gameOptions.slicePrizes[prize]);
                    // ["A KEY!!!", "50 STARS", "500 STARS", "BAD LUCK!!!", "200 STARS", "100 STARS", "150 STARS", "BAD LUCK!!!"]
                    if (prize == 1) {
                        jugador.dinero += 50;
                    }
                    if (prize == 2) {
                        jugador.dinero += 500;
                    }
                    if (prize == 4) {
                        jugador.dinero += 200;
                    }
                    if (prize == 5) {
                        jugador.dinero += 100;
                    }
                    if (prize == 6) {
                        jugador.dinero += 150;
                    }
                    if (jugador.dinero >= jugador.dinerMaximo) {
                        jugador.dineroMaximo = jugador.dinero;
                    }
                    score.setText(jugador.alias + "\n Dinero Acumulado: " + jugador.dinero + "\nValor por Juego 100\nPresione Click para Apostart\nPresione S para salir");
                    // player can spin again
                    this.canSpin = true;
                }
            });
        }
    }

    update() {
        if (this.key.isDown) {
            console.log(this.key.isDown);
            jugador.x += 10;
            this.scene.start("game");
        }
    }
}

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
    scene: [ Preloader, MainMenu, Game, House1, House2, House3, House4, House5, House6, playGame, GameOver ]
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
